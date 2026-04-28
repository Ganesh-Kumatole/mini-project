import { useMemo } from 'react';
import { Budget } from '@/types';
import { useCurrencyContext } from '@/context/CurrencyContext';
import { getBudgetPercentage } from '@/types/budget';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  transactions: any[]; // We'll type this properly later
};

export const BudgetDetailsModal = ({
  isOpen,
  onClose,
  budget,
  transactions,
}: Props) => {
  const { formatAmount } = useCurrencyContext();
  const budgetTransactions = useMemo(() => {
    if (!budget) return [];

    return transactions.filter((t) => {
      const d = new Date(t.date);
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      return t.category === budget.category && d >= start && d <= end;
    });
  }, [budget, transactions]);

  const spent = useMemo(() => {
    return budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [budgetTransactions]);

  const percentage = useMemo(() => {
    return budget ? getBudgetPercentage(spent, budget.limitAmount) : 0;
  }, [spent, budget]);

  if (!isOpen || !budget) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
            Budget Details
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="font-semibold text-text-light dark:text-text-dark mb-2">
                {budget.category}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Period:{' '}
                  <span className="font-medium capitalize">
                    {budget.period}
                  </span>
                </p>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Alert at:{' '}
                  <span className="font-medium">
                    {budget.notificationThreshold}%
                  </span>
                </p>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Created:{' '}
                  <span className="font-medium">
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="font-semibold text-text-light dark:text-text-dark mb-2">
                Spending Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Limit:
                  </span>
                  <span className="font-medium text-text-light dark:text-text-dark">
                    {formatAmount(budget.limitAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Spent:
                  </span>
                  <span
                    className={`font-medium ${percentage > 100 ? 'text-red-600 dark:text-red-400' : percentage > budget.notificationThreshold ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}
                  >
                    {formatAmount(spent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Remaining:
                  </span>
                  <span
                    className={`font-medium ${budget.limitAmount - spent < 0 ? 'text-red-600 dark:text-red-400' : 'text-text-light dark:text-text-dark'}`}
                  >
                    {formatAmount(Math.max(budget.limitAmount - spent, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Used:
                  </span>
                  <span
                    className={`font-medium ${percentage > 100 ? 'text-red-600 dark:text-red-400' : percentage > budget.notificationThreshold ? 'text-yellow-600 dark:text-yellow-400' : 'text-text-light dark:text-text-dark'}`}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Progress
              </span>
              <span
                className={`font-medium ${percentage > 100 ? 'text-red-600 dark:text-red-400' : percentage > budget.notificationThreshold ? 'text-yellow-600 dark:text-yellow-400' : 'text-text-light dark:text-text-dark'}`}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  percentage > 100
                    ? 'bg-red-500'
                    : percentage > budget.notificationThreshold
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            {percentage > budget.notificationThreshold && (
              <p
                className={`text-xs mt-2 ${percentage > 100 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
              >
                {percentage > 100
                  ? `⚠️ Over budget by ${formatAmount(spent - budget.limitAmount)}`
                  : `⚠️ Approaching limit - ${budget.notificationThreshold - percentage}% remaining`}
              </p>
            )}
          </div>

          {/* Transactions List */}
          <div>
            <h3 className="font-semibold text-text-light dark:text-text-dark mb-3">
              Recent Transactions ({budgetTransactions.length})
            </h3>
            {budgetTransactions.length === 0 ? (
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
                No transactions found for this budget period
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {budgetTransactions
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-text-light dark:text-text-dark">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border-light dark:border-border-dark ">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors rounded-lg border border-border-light dark:border-border-dark 
            bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
