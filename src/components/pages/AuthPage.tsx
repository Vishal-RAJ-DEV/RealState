'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useApp } from '@/store/PropertyContext';

interface AuthPageProps {
  defaultTab?: 'login' | 'signup';
}

export default function AuthPage({ defaultTab = 'login' }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useApp();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!isLogin && !formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      if (!isLogin) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 409) {
            setServerError('This email is already registered. Please login.');
          } else {
            setServerError(data.error || 'Something went wrong. Try again.');
          }
          return;
        }

        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setServerError('Account created but login failed. Please login manually.');
          router.push('/login');
          return;
        }

        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || formData.phone,
          avatar: '',
          memberSince: new Date().getFullYear().toString(),
        });

        router.push('/dashboard');
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setServerError('Invalid email or password. Please try again.');
          return;
        }

        router.push('/dashboard');
      }
    } catch (error) {
      setServerError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl text-charcoal mb-2">PropFinder</h1>
          <p className="text-muted-foreground text-sm">Find your perfect home</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-subtle border border-border-subtle"
        >
          <div className="flex bg-charcoal/5 rounded-lg p-1 mb-8">
            <button
              onClick={() => { setIsLogin(true); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-charcoal text-cream' : 'text-charcoal hover:text-charcoal/70'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-charcoal text-cream' : 'text-charcoal hover:text-charcoal/70'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full h-12 pl-11 pr-4 bg-cream border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-crimson mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-11 pr-4 bg-cream border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                {errors.email && <p className="text-xs text-crimson mt-1">{errors.email}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-12 pl-11 pr-4 bg-cream border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-crimson mt-1">{errors.phone}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full h-12 pl-11 pr-11 bg-cream border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-crimson mt-1">{errors.password}</p>}
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-xs text-crimson hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {serverError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-crimson bg-crimson/5 border border-crimson/20 rounded-lg px-3 py-2.5"
                >
                  {serverError}
                </motion.p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-crimson text-white rounded-lg font-medium hover:bg-crimson/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? (isLogin ? 'Signing in...' : 'Creating account...')
                  : (isLogin ? 'Login' : 'Create Account')
                }
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full h-12 border border-border-subtle rounded-lg font-medium text-sm text-charcoal hover:bg-charcoal/5 transition-colors flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
              className="text-crimson hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
