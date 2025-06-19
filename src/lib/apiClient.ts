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

// 이전에 refresh를 시도했는지 여부를 추적하는 플래그
let isRefreshing = false;

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
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
    method: 'GET',
    ...customConfig,
    headers,
    credentials: 'include', // HttpOnly 쿠키를 주고받기 위해 필수
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // ✨ --- 1. 첫 번째 API 요청 --- ✨
  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // ✨ --- 2. 토큰 만료 시 (401 에러) 자동 재발급 로직 --- ✨
  // 'isRefreshing' 플래그는 여러 API가 동시에 401 에러를 받았을 때,
  // 재발급 요청이 한 번만 실행되도록 보장합니다.
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    console.log('Access token expired. Attempting to refresh...');

    try {
      // 2-1. 백엔드에 토큰 재발급 요청 (POST /auth/refresh)
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // refresh_token 쿠키를 보내기 위해 필수
      });
      
      if (!refreshResponse.ok) {
        // 리프레시 토큰마저 만료/무효한 경우, 로그아웃 처리
        console.error('Failed to refresh token. Logging out.');
        // window.location.href = '/login'; // AuthContext에서 처리하도록 유도
        throw new Error('Session expired. Please log in again.');
      }
      
      console.log('Token refreshed successfully. Retrying original request.');

      // 2-2. 재발급이 성공하면, 원래 실패했던 요청을 다시 시도합니다.
      // (브라우저에는 이미 새로운 access_token 쿠키가 설정된 상태)
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw refreshError; // 최종 실패 처리
    } finally {
      isRefreshing = false;
    }
  }

  // --- 3. 최종 응답 처리 ---
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
