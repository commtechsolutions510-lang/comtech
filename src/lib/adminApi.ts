const ADMIN_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/admin`;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function adminRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${ADMIN_API_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    const error = await response.json().catch(() => ({ message: 'Unauthorized' }));
    throw new Error(error.message || 'Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
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
  upload: async <T = { url: string }>(file: File): Promise<T> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${ADMIN_API_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Image upload failed' }));
      throw new Error(error.message || 'Image upload failed');
    }
    const result = await response.json() as T;
    const uploadResult = result as T & { url?: string };
    if (uploadResult.url?.startsWith('/')) {
      uploadResult.url = `${new URL(API_URL).origin}${uploadResult.url}`;
    }
    return result;
  },
};
