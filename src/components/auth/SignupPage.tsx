import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, signInWithGoogle } from '@/services/firebase/auth';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-primary p-2 rounded-lg mr-2">
              <span className="material-icons-outlined text-white text-2xl">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary dark:text-blue-400 tracking-tight">
              Fintracker
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">
            Create your account
          </h2>
          <p className="text-secondary-text-light dark:text-secondary-text-dark text-sm">
            Start managing your finances smarter today.
          </p>
        </div>
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-secondary-text-light dark:text-secondary-text-dark text-lg">
                    person
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10 transition-colors"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-secondary-text-light dark:text-secondary-text-dark text-lg">
                    email
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10 transition-colors"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-secondary-text-light dark:text-secondary-text-dark text-lg">
                    lock
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10 transition-colors"
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
            <div>
              <label
                className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-secondary-text-light dark:text-secondary-text-dark text-lg">
                    lock_reset
                  </span>
                </div>
                <input
                  className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-light dark:text-text-dark shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10 transition-colors"
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label
                className="ml-2 block text-sm text-secondary-text-light dark:text-secondary-text-dark"
                htmlFor="terms"
              >
                I agree to the{' '}
                <a
                  className="text-primary hover:text-primary-dark font-medium"
                  href="#"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  className="text-primary hover:text-primary-dark font-medium"
                  href="#"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            <button
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-light dark:bg-surface-dark text-secondary-text-light dark:text-secondary-text-dark">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-border-light dark:border-border-dark rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                >
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
                Sign up with Google
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-secondary-text-light dark:text-secondary-text-dark">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-center space-x-2">
          <span className="material-icons-outlined text-secondary-text-light dark:text-secondary-text-dark text-xs">
            lock
          </span>
          <span className="text-xs text-secondary-text-light dark:text-secondary-text-dark">
            Your data is encrypted and secure.
          </span>
        </div>
      </div>
    </div>
  );
};
