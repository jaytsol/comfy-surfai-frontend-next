"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'surfai_access_token'; // AuthContext와 동일한 키 사용

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 401 Unauthorized 에러가 발생하면, 토큰을 삭제하고 로그인 페이지로 보낼 수 있습니다.
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            // window.location.href = '/login'; // 강제 리디렉션
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
