'use client';

// These types should ideally be in a dedicated types file (e.g., src/interfaces/index.ts)
export interface RagDocument {
  id: number;
  originalFilename: string;
  r2Url: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'ERROR';
  createdAt: string;
}

export interface RagMessage {
  sender: 'user' | 'ai';
  text: string;
  isPending?: boolean;
}

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
    
    const headers = new Headers(options.headers); // Use Headers object
    const isFormData = body instanceof FormData;

    if (!isFormData && body) {
        headers.set('Content-Type', 'application/json'); // Use .set()
    }

    const method = options.method?.toUpperCase() || (body ? 'POST' : 'GET');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        headers.set('X-XSRF-TOKEN', csrfToken); // Use .set()
      }
    }
    const config: RequestInit = {
      method: options.method || (body ? 'POST' : 'GET'),
      ...customConfig,
      headers,
      credentials: 'include',
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, config);
  };

  let response = await fetcher();

  if (response.status === 401) {
    if (endpoint === '/auth/login' || endpoint === '/auth/register' || endpoint === '/auth/refresh') {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    if (isRefreshing) {
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
      
      processQueue(null); // Resume queued requests
      response = await fetcher(); // Retry original request

    } catch (refreshError) {
      processQueue(refreshError as Error); // Fail all queued requests
      console.error('Token refresh failed, logging out:', refreshError);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      errorData = { message: response.statusText || 'Unknown error' };
    }
    const errorMessage = errorData.message || `API call failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return await response.json();
}

export const getConnections = (): Promise<string[]> => {
  return apiClient<string[]>('/connect/connections');
};

export const disconnectSocial = (platform: string): Promise<void> => {
  return apiClient<void>(`/connect/disconnect/${platform.toLowerCase()}`, {
    method: 'POST',
  });
};

// --- RAG API Functions ---
export const getRagDocuments = (): Promise<RagDocument[]> => {
  return apiClient<RagDocument[]>('/rag');
};

export const uploadRagDocument = (file: File): Promise<RagDocument> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<RagDocument>('/rag/upload', {
    method: 'POST',
    body: formData,
  });
};

export const postRagChatMessage = (documentId: number, message: string): Promise<{ response: string }> => {
  return apiClient<{ response: string }>('/rag/chat', {
    method: 'POST',
    body: { documentId, message },
  });
};

export default apiClient;
