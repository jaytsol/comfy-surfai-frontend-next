"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  body?: any;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const fetcher = async (): Promise<Response> => {
    const { body, ...customConfig } = options;
    const headers: { [key: string]: string } = {
      ...(body && { 'Content-Type': 'application/json' }),
      ...options.headers,
    };
    const method = options.method?.toUpperCase() || (body ? 'POST' : 'GET');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    const config: RequestInit = {
      method: options.method || (body ? 'POST' : 'GET'),
      ...customConfig,
      headers,
      credentials: 'include',
    };
    if (body) {
      config.body = JSON.stringify(body);
    }
    return fetch(`${API_BASE_URL}${endpoint}`, config);
  };

  let response = await fetcher();

  if (response.status === 401) {
    // ✨ --- 이 부분이 핵심 수정 사항 --- ✨
    // 로그인, 회원가입, 토큰 재발급 요청 자체가 실패한 경우에는 재시도하지 않습니다.
    if (endpoint === '/auth/login' || endpoint === '/auth/register' || endpoint === '/auth/refresh') {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    if (isRefreshing) {
      // 이미 다른 요청이 토큰을 재발급 중이라면, 이 요청은 대기열에 추가합니다.
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({ 
          resolve: (value: T) => resolve(value),
          reject 
        });
      })
      .then(() => apiClient<T>(endpoint, options));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!refreshResponse.ok) {
        throw new Error('Session expired. Please log in again.');
      }
      
      processQueue(null); // 대기열에 있던 요청들 재개
      response = await fetcher(); // 원래 요청 재시도

    } catch (refreshError) {
      processQueue(refreshError as Error); // 대기열에 있던 요청들 모두 실패 처리
      // TODO: AuthContext의 logout 함수를 호출하여 상태를 정리
      console.error('Token refresh failed, logging out:', refreshError);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API call failed: ${response.status}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return await response.json();
}

export default apiClient;
