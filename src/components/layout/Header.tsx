import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/common/NotificationBell';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: (open: boolean) => void;
  title?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export const Header = ({ toggleSidebar, title }: HeaderProps) => {
  const { toggleTheme, theme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSidebar(true)}
          className="md:hidden text-text-secondary-light dark:text-text-secondary-dark hover:text-primary focus:outline-none"
        >
          <span className="material-icons-round">menu</span>
        </button>
        {title && (
          <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark md:hidden">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="material-icons-round dark:hidden">dark_mode</span>
          <span className="material-icons-round hidden dark:block">light_mode</span>
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* User avatar → links to Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 pl-3 border-l border-border-light dark:border-border-dark hover:opacity-80 transition-opacity"
          title="Go to Settings"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-800 flex-shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.displayName ?? user?.email)}
              </div>
            )}
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-text-primary-light dark:text-text-primary-dark leading-tight">
              {user?.displayName ?? 'Account'}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-tight truncate max-w-[120px]">
              {user?.email ?? ''}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
