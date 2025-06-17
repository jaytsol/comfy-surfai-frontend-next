"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  body?: any;
}

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, ...customConfig } = options;

  const headers: HeadersInit = {
    // ✨ body가 있을 때만 Content-Type을 설정하도록 변경
    ...(body && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const config: RequestInit = {
    // ✨ 기본 메소드는 GET으로 설정하고, options에서 받은 값으로 덮어쓰도록 함
    method: 'GET',
    ...customConfig,
    headers,
    credentials: 'include', // 세션 쿠키를 주고받기 위해 필수
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

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
