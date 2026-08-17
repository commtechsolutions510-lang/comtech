import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../lib/api';

type FormType = 'login' | 'register' | 'forgot';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formType, setFormType] = useState<FormType>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formType === 'login') {
        // Use unified login that handles both admin and customer
        const data = await api.post<{
          token: string;
          userType: 'admin' | 'customer';
          user: any;
        }>('/auth/unified-login', { email: formData.email, password: formData.password });

        if (data.userType === 'admin') {
          // Admin login
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          navigate('/admin', { replace: true });
        } else {
          // Customer login
          localStorage.setItem('customer_token', data.token);
          navigate(from, { replace: true });
        }
      } else if (formType === 'register') {
        const data = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        });
        localStorage.setItem('customer_token', data.token);
        navigate(from, { replace: true });
      } else {
        await api.post('/auth/forgot-password', { email: formData.email });
        setError('If an account exists, a reset link will be sent to your email.');
        setFormType('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B1F3A]">
            {formType === 'login' ? 'Welcome Back' : formType === 'register' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {formType === 'login' ? 'Sign in to your Commtech account' :
             formType === 'register' ? 'Join Commtech Solutions today' :
             'Enter your email to reset your password'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {formType === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {formType === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                    placeholder="+233 000 000 000"
                  />
                </div>
              </div>
            )}

            {formType !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-[#0B1F3A] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Please wait...' : formType === 'login' ? 'Sign In' : formType === 'register' ? 'Create Account' : 'Send Reset Link'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {formType === 'login' && (
              <>
                <button
                  onClick={() => { setFormType('forgot'); setError(''); }}
                  className="text-[#1677FF] hover:text-[#0f6ae7] font-medium"
                >
                  Forgot password?
                </button>
                <p className="mt-2 text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={() => { setFormType('register'); setError(''); }} className="text-[#1677FF] hover:text-[#0f6ae7] font-medium">
                    Sign up
                  </button>
                </p>
              </>
            )}
            {formType === 'register' && (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button onClick={() => { setFormType('login'); setError(''); }} className="text-[#1677FF] hover:text-[#0f6ae7] font-medium">
                  Sign in
                </button>
              </p>
            )}
            {formType === 'forgot' && (
              <button onClick={() => { setFormType('login'); setError(''); }} className="text-[#1677FF] hover:text-[#0f6ae7] font-medium">
                Back to login
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
