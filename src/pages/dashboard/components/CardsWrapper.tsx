import { Card } from '@/shared/components/Card';
import { Skeleton } from '@/shared/components/Skeleton';
import { useCurrencyContext } from '@/shared/context';
import { CardsWrapperProps } from '@/pages/dashboard/types';

export const CardsWrapper = ({
  loading,
  income,
  expense,
  savingsRate,
  momChange,
  momColor,
  budgetUsedPct,
  budgetHealth,
}: CardsWrapperProps) => {
  const { formatAmount } = useCurrencyContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark space-y-3"
          >
            <Skeleton h="h-10" w="w-10" rounded="rounded-xl" />
            <Skeleton h="h-7" w="w-24" />
            <Skeleton h="h-3" w="w-32" />
          </div>
        ))
      ) : (
        <>
          <Card
            id="stat-balance"
            icon="account_balance_wallet"
            iconBg="bg-indigo-500"
            label="Net Balance"
            value={formatAmount(income - expense)}
            sub={`Savings rate: ${savingsRate.toFixed(1)}%`}
            subColor={savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}
          />
          <Card
            id="stat-income"
            icon="north"
            iconBg="bg-emerald-500"
            label="Monthly Income"
            value={formatAmount(income)}
            sub={momChange}
            subColor="text-emerald-500"
          />
          <Card
            id="stat-expense"
            icon="south"
            iconBg="bg-red-500"
            label="Monthly Expenses"
            value={formatAmount(expense)}
            sub={momChange}
            subColor={momColor}
          />
          <Card
            id="stat-budget"
            icon="savings"
            iconBg={
              budgetUsedPct > 90
                ? 'bg-red-500'
                : budgetUsedPct > 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
            }
            label="Budget Used"
            value={`${budgetUsedPct}%`}
            sub={`${budgetHealth.length} budget${budgetHealth.length !== 1 ? 's' : ''} active`}
            subColor={
              budgetUsedPct > 90
                ? 'text-red-500'
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }
            progress={budgetUsedPct}
          />
        </>
      )}
    </div>
  );
};
