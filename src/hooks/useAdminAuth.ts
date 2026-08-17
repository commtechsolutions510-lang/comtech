import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';

type AuthStatus = 'loading' | 'authenticated' | 'not_authenticated';

export function useAdminAuth(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setStatus('not_authenticated');
      return;
    }

    let cancelled = false;
    const validate = async () => {
      try {
        await adminApi.get('/dashboard');
        if (!cancelled) setStatus('authenticated');
      } catch {
        if (!cancelled) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setStatus('not_authenticated');
        }
      }
    };

    validate();
    return () => { cancelled = true; };
  }, []);

  return status;
}
