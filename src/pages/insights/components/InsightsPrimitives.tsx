import React from 'react';
import { useCurrencyContext } from '@/shared/context';

export const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
);

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

export const SectionTitle = ({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-6">
    <span className="material-icons text-indigo-500 text-xl">{icon}</span>
    <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
      {children}
    </h2>
  </div>
);

export const StatCard = ({
  icon,
  iconColor,
  label,
  value,
  sub,
  subColor,
  id,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  id?: string;
}) => (
  <div
    id={id}
    className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-3 transition-all hover:shadow-md"
  >
    <div className="flex items-center justify-between">
      <span className={`material-icons text-2xl ${iconColor}`}>{icon}</span>
      <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark leading-tight">
      {value}
    </p>
    {sub && (
      <p
        className={`text-xs font-medium ${
          subColor ?? 'text-text-secondary-light dark:text-text-secondary-dark'
        }`}
      >
        {sub}
      </p>
    )}
  </div>
);

export const BudgetRow = ({
  category,
  spentAmount,
  limitAmount,
  percentUsed,
}: {
  category: string;
  spentAmount: number;
  limitAmount: number;
  percentUsed: number;
}) => {
  const { formatAmount } = useCurrencyContext();
  const clamped = Math.min(percentUsed, 100);
  const barColor =
    clamped >= 90
      ? 'bg-red-500'
      : clamped >= 60
      ? 'bg-amber-400'
      : 'bg-emerald-500';
  const textColor =
    clamped >= 90
      ? 'text-red-500'
      : clamped >= 60
      ? 'text-amber-500'
      : 'text-emerald-500';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
          {category}
        </span>
        <span className={`font-semibold ${textColor}`}>
          {formatAmount(spentAmount)}{' '}
          <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal">
            / {formatAmount(limitAmount)}
          </span>
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className={`text-xs ${textColor} text-right`}>{clamped.toFixed(0)}% used</p>
    </div>
  );
};
