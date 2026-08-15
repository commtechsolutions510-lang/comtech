const ADMIN_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/admin`;

async function adminRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${ADMIN_API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

export const adminApi = {
  get: <T = any>(endpoint: string): Promise<T> => adminRequest(endpoint),
  post: <T = any>(endpoint: string, data?: any): Promise<T> =>
    adminRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T = any>(endpoint: string, data?: any): Promise<T> =>
    adminRequest(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T = any>(endpoint: string): Promise<T> =>
    adminRequest(endpoint, { method: 'DELETE' }),
};
