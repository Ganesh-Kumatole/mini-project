import React from 'react';

// Common primitive components used within the Settings page layout

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 ${className}`}
  >
    {children}
  </div>
);

export const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0">
      <span className="material-icons text-indigo-500 text-xl">{icon}</span>
    </div>
    <div>
      <h2 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
    {children}
  </label>
);

export const Input = ({
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) => (
  <input
    id={id}
    {...props}
    className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 focus:border-transparent transition-all disabled:opacity-50"
  />
);

export const PrimaryBtn = ({
  children,
  loading,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  className?: string;
}) => (
  <button
    {...props}
    disabled={props.disabled || loading}
    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading && (
      <span className="material-icons text-base animate-spin">refresh</span>
    )}
    {children}
  </button>
);

export const Toggle = ({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

export const NotifRow = ({
  icon,
  label,
  description,
  checked,
  onChange,
  id,
}: {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border-light dark:border-border-dark last:border-0">
    <div className="flex items-start gap-3">
      <span className="material-icons text-indigo-400 text-xl flex-shrink-0 mt-0.5">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
        </p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          {description}
        </p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} id={id} />
  </div>
);

// Helper function to extract user initials for avatar fallback
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
