import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, signInWithGoogle } from '@/services/firebase/auth';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getFirebaseErrorMessage = (code: string): string => {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Failed to create account. Please try again.';
};

// ── Password Strength ─────────────────────────────────────────────────────────
const getPasswordStrength = (
  pw: string,
): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-400' },
    { score: 3, label: 'Strong', color: 'bg-emerald-500' },
    { score: 4, label: 'Very Strong', color: 'bg-emerald-600' },
  ];
  return levels[Math.min(score, 4) - 1] ?? { score: 0, label: '', color: '' };
};

// ── Google SVG ────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
);

// ── FormInput ─────────────────────────────────────────────────────────────────
const FormInput = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  icon,
  placeholder,
  error,
  rightSlot,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  icon: string;
  error?: string;
  rightSlot?: React.ReactNode;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5"
    >
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full pl-10 ${rightSlot ? 'pr-10' : 'pr-4'} py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
          error
            ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20'
            : 'border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800'
        } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark`}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <span className="material-icons text-xs">error_outline</span>
        {error}
      </p>
    )}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  // ── Field validators ──
  const validators: Record<string, () => boolean> = {
    name: () => {
      if (!name.trim()) {
        setErrors((e) => ({ ...e, name: 'Full name is required' }));
        return false;
      }
      if (name.trim().length < 2) {
        setErrors((e) => ({
          ...e,
          name: 'Name must be at least 2 characters',
        }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.name;
        return n;
      });
      return true;
    },
    email: () => {
      if (!email) {
        setErrors((e) => ({ ...e, email: 'Email is required' }));
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors((e) => ({ ...e, email: 'Enter a valid email address' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.email;
        return n;
      });
      return true;
    },
    password: () => {
      if (!password) {
        setErrors((e) => ({ ...e, password: 'Password is required' }));
        return false;
      }
      if (password.length < 6) {
        setErrors((e) => ({
          ...e,
          password: 'Password must be at least 6 characters',
        }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.password;
        return n;
      });
      return true;
    },
    confirmPassword: () => {
      if (!confirmPassword) {
        setErrors((e) => ({
          ...e,
          confirmPassword: 'Please confirm your password',
        }));
        return false;
      }
      if (confirmPassword !== password) {
        setErrors((e) => ({ ...e, confirmPassword: 'Passwords do not match' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.confirmPassword;
        return n;
      });
      return true;
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allValid = Object.values(validators).every((fn) => fn());
    if (!allValid) return;
    if (!agreeTerms) {
      setGlobalError('Please agree to the Terms and Privacy Policy');
      return;
    }
    setGlobalError('');
    setLoading(true);
    try {
      await registerUser(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(getFirebaseErrorMessage(err?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGlobalError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(getFirebaseErrorMessage(err?.code ?? '') || err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* ── Left Branding Panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-8 -right-16 w-72 h-72 rounded-full bg-white/5" />

        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-icons-outlined text-white text-xl">
                account_balance_wallet
              </span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Fintracker
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Your financial journey starts here.
          </h2>
          <p className="text-indigo-200 leading-relaxed">
            Join thousands of users managing their money smarter every day.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {[
            { value: '3+', label: 'Active Users' },
            { value: '₹50K+', label: 'Tracked' },
            { value: '15+', label: 'Categories' },
            { value: 'Free', label: 'Forever' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-indigo-200 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-indigo-300 relative z-10">
          © 2026 Fintracker. All rights reserved.
        </p>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-5 py-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <span className="material-icons-outlined text-white text-lg">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              Fintracker
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Create your account
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Start managing your finances smarter today.
            </p>
          </div>

          {/* Google sign-up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-750 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="material-icons text-gray-400 animate-spin text-base">
                refresh
              </span>
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark" />
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="material-icons text-red-500 text-base flex-shrink-0">
                error_outline
              </span>
              <p className="text-sm text-red-700 dark:text-red-300">
                {globalError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              id="signup-name"
              label="Full Name"
              type="text"
              value={name}
              onChange={(v) => {
                setName(v);
                if (errors.name) validators.name();
              }}
              onBlur={() => validators.name()}
              icon="person"
              placeholder="Ganesh Kumar"
              error={errors.name}
            />
            <FormInput
              id="signup-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (errors.email) validators.email();
              }}
              onBlur={() => validators.email()}
              icon="mail"
              placeholder="name@example.com"
              error={errors.email}
            />
            <div>
              <FormInput
                id="signup-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (errors.password) validators.password();
                }}
                onBlur={() => validators.password()}
                icon="lock"
                placeholder="Min. 6 characters"
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="material-icons text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-lg transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                }
              />
              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p
                      className={`text-xs font-medium ${strength.score <= 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-500' : 'text-emerald-500'}`}
                    >
                      {strength.label}
                      {strength.score < 3 &&
                        ' — add uppercase, numbers & symbols'}
                    </p>
                  )}
                </div>
              )}
            </div>

            <FormInput
              id="signup-confirm-password"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                if (errors.confirmPassword) validators.confirmPassword();
              }}
              onBlur={() => validators.confirmPassword()}
              icon="lock_reset"
              placeholder="••••••••"
              error={errors.confirmPassword}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  tabIndex={-1}
                  className="material-icons text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-lg transition-colors"
                >
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </button>
              }
            />

            {/* Password match indicator */}
            {confirmPassword && (
              <p
                className={`text-xs flex items-center gap-1 -mt-2 ${confirmPassword === password ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
              >
                <span className="material-icons text-xs">
                  {confirmPassword === password ? 'check_circle' : 'cancel'}
                </span>
                {confirmPassword === password
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </p>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (globalError) setGlobalError('');
                }}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark group-hover:text-text-primary-light dark:group-hover:text-text-primary-dark transition-colors">
                I agree to the{' '}
                <a
                  href="#"
                  className="text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || googleLoading || !agreeTerms}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="material-icons text-base animate-spin">
                  refresh
                </span>
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 py-3 border-t border-border-light dark:border-border-dark">
            <span className="material-icons-outlined text-gray-400 text-sm">
              lock
            </span>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Your data is encrypted and never shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
