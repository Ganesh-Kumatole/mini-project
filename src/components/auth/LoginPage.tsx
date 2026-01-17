import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, signInWithGoogle } from '@/services/firebase/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        // Redirect new users to signup
        navigate('/signup');
      } else {
        // Existing users go to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-body min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm dark:shadow-2xl overflow-hidden border border-border-light dark:border-border-dark">
        <div className="px-10 pt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-icons-outlined text-white text-3xl">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Fintracker
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">
            Welcome back
          </h2>
          <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
            Please enter your details to sign in.
          </p>
        </div>
        <div className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-base">Continue with Google</span>
            </button>
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide">
                Or
              </span>
              <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-text-muted-light dark:text-text-muted-dark text-lg">
                    mail
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark placeholder-text-muted-light dark:placeholder-text-muted-dark focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-text-muted-light dark:text-text-muted-dark text-lg">
                    lock
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark placeholder-text-muted-light dark:placeholder-text-muted-dark focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="ml-2 block text-text-muted-light dark:text-text-muted-dark cursor-pointer"
                  htmlFor="remember-me"
                >
                  Remember me
                </label>
              </div>
              <a
                className="font-medium text-primary hover:text-primary-hover transition-colors"
                href="#"
              >
                Forgot password?
              </a>
            </div>
            <button
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <p className="text-text-muted-light dark:text-text-muted-dark">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 border-t border-border-light dark:border-border-dark text-center">
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
            By clicking continue, you agree to our{' '}
            <a
              className="underline hover:text-text-light dark:hover:text-text-dark"
              href="#"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              className="underline hover:text-text-light dark:hover:text-text-dark"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <div className="fixed bottom-6 w-full text-center pointer-events-none">
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
          © 2026 Fintracker. All rights reserved.
        </p>
      </div>
    </div>
  );
};
