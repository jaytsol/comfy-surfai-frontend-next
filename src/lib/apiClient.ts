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

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, ...customConfig } = options;

  const headers: { [key: string]: string } = { // 또는 Record<string, string>
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
    credentials: 'include', 
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      console.log('Access token expired. Attempting to refresh...');
      try {
        // 1. 토큰 재발급 API 호출 (이 요청은 쿠키를 사용하므로 apiClient를 직접 재사용)
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (!refreshResponse.ok) {
          // 리프레시 실패 시, 로그아웃 처리
          throw new Error('Failed to refresh token.');
        }

        console.log('Token refreshed successfully. Retrying original request.');
        
        // 2. 원래 실패했던 요청을 다시 시도합니다.
        //    (재발급 시 새로운 쿠키가 자동으로 설정되었으므로, 그냥 다시 호출하면 됩니다.)
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      } catch (refreshError) {
        console.error('Session expired. Logging out.', refreshError);
        // AuthContext의 logout 함수를 호출하거나, 로그인 페이지로 리디렉션
        // window.location.href = '/login'; 
        throw refreshError; // 최종적으로는 에러를 던져서 호출부에서 처리
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
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
}

export default apiClient;
