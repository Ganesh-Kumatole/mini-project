import { memo } from 'react';
import { Link } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@/components/common/Icon';

const HeaderComponent = ({ user }: { user: FirebaseUser | null }) => {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-light/50 dark:border-border-dark/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Icon
                name="account_balance_wallet"
                className="text-white text-base"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Fintracker
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
              aria-pressed={isDark}
            >
              <Icon
                name={isDark ? 'light_mode' : 'dark_mode'}
                className="text-xl"
              />
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Go to Workspace →
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-text-primary-light dark:bg-text-primary-dark text-background-light dark:text-background-dark text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Create space
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const Header = memo(HeaderComponent);

export { Header };
