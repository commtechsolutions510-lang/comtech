const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('customer_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string): Promise<T> => request<T>(endpoint),
  post: <T = any>(endpoint: string, data?: any): Promise<T> => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T = any>(endpoint: string, data?: any): Promise<T> => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T = any>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'DELETE' }),
};

export function getAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
