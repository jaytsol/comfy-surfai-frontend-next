// lib/apiClient.ts (Next.js 프론트엔드)
"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3000'; // Update this to your backend URL

interface FetchOptions extends RequestInit {
  body?: any; // body 타입을 좀 더 유연하게
}

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, ...customConfig } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method: body ? 'POST' : 'GET', // body 유무에 따라 기본 메소드 설정
    ...customConfig,
    headers,
    credentials: 'include', // 세션 쿠키를 주고받기 위해 필수!
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // 서버에서 내려주는 에러 메시지를 사용하거나 기본 메시지 사용
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    // DELETE와 같이 본문이 없을 수 있는 성공 응답 처리
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T; // 혹은 { success: true } 같은 객체
    }

    return await response.json();
  } catch (error) {
    console.error('API Client Error:', error);
    throw error; // 에러를 다시 throw 하여 호출부에서 처리할 수 있도록 함
  }
}

export default apiClient;