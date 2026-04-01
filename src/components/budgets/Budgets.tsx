import { useMemo, useEffect, useState } from 'react';
import { useBudgets, useTransactions, useNotifications } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getBudgetPercentage, shouldNotify } from '@/types/budget';
import { AddBudgetModal, BudgetDetailsModal } from './index';

export const Budgets = () => {
  const { formatAmount } = useCurrency();
  const { budgets, loading, createBudget, updateBudget, deleteBudget } =
    useBudgets();
  const { transactions } = useTransactions();
  const { createNotification } = useNotifications();
  const { addToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const monthlyLimit = useMemo(
    () => budgets.reduce((s, b) => s + (b.limitAmount ?? 0), 0),
    [budgets],
  );

  const totalSpent = useMemo(() => {
    // sum transactions in current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return transactions.reduce((sum, t) => {
      const d = new Date(t.date);
      if (d >= start && d <= end) return sum + t.amount;
      return sum;
    }, 0);
  }, [transactions]);

  // Check for budget notifications
  useEffect(() => {
    const checkBudgetNotifications = async () => {
      for (const budget of budgets) {
        const spent = transactions.reduce((s, t) => {
          const d = new Date(t.date);
          const start = new Date(budget.startDate);
          const end = new Date(budget.endDate);
          if (t.category === budget.category && d >= start && d <= end)
            return s + t.amount;
          return s;
        }, 0);

        const percentage = getBudgetPercentage(spent, budget.limitAmount);

        if (
          shouldNotify(
            percentage,
            budget.notificationThreshold,
            budget.notificationSent,
            budget.lastNotificationDate,
          )
        ) {
          try {
            // Create notification
            await createNotification({
              type: percentage > 100 ? 'budget_exceeded' : 'budget_warning',
              title: `Budget Alert: ${budget.category}`,
              message: `You've used ${percentage}% of your ${budget.category} budget (${formatAmount(spent)} of ${formatAmount(budget.limitAmount)})`,
              actionUrl: '/budgets',
              metadata: {
                budgetId: budget.id,
                category: budget.category,
                percentageUsed: percentage,
              },
            });

            // Update budget to mark notification as sent
            await updateBudget({
              id: budget.id,
              notificationSent: true,
              lastNotificationDate: new Date(),
              spentAmount: spent,
            });

            // Show toast notification
            addToast({
              type: 'warning',
              title: 'Budget Alert',
              message: `${budget.category} budget is ${percentage}% used`,
            });
          } catch (error) {
            console.error('Failed to create budget notification:', error);
          }
        }
      }
    };

    if (budgets.length > 0 && transactions.length > 0) {
      checkBudgetNotifications();
    }
  }, [budgets, transactions, createNotification, updateBudget, addToast]);

  const handleAdd = () => setShowAddModal(true);
  const handleCloseModal = () => setShowAddModal(false);
  const handleCreateBudget = async (input: any) => {
    await createBudget(input);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
    } catch (e) {
      // noop
    }
  };

  const handleViewDetails = (budget: any) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBudget(null);
  };

  const budgetUsagePercent = Math.min(
    (totalSpent / Math.max(monthlyLimit, 1)) * 100,
    100,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Budget Management
        </h1>
        <button
          onClick={handleAdd}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors text-sm"
        >
          <span className="material-icons-round text-base">add</span>
          Add New Budget
        </button>
      </div>

      {/* Monthly Budget Card */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 transition-colors duration-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-1">
            Monthly Budget
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Set and track your overall monthly spending limit.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
              Set Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark font-medium">
                $
              </span>
              <input
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                type="number"
                value={monthlyLimit}
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-between items-end text-sm">
            <div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Total Spent:
              </p>
              <p className="text-red-500 font-bold text-lg hidden sm:block">
                {formatAmount(totalSpent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Remaining:
              </p>
              <p className="text-text-light dark:text-text-dark font-bold text-lg">
                {formatAmount(Math.max(monthlyLimit - totalSpent, 0))}
              </p>
            </div>
          </div>

          <div className="flex justify-between sm:hidden text-lg font-bold">
            <span className="text-red-500">{formatAmount(totalSpent)}</span>
          </div>

          <div className="relative pt-1">
            <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${budgetUsagePercent > 100 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-semibold inline-block ${budgetUsagePercent > 100 ? 'text-red-500' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
              >
                {budgetUsagePercent.toFixed(0)}% of{' '}
                {formatAmount(monthlyLimit)} Used
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 transition-colors duration-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-1">
            Budget Alerts
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Important notifications about your budget status.
          </p>
        </div>
        {budgetUsagePercent > 100 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <span className="material-icons-round text-red-600 dark:text-red-400 mt-0.5">
              warning
            </span>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Budget Exceeded!
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                You have exceeded your monthly budget by{' '}
                {formatAmount(Math.max(totalSpent - monthlyLimit, 0))}. Review
                your spending immediately.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Budget Cards */}
      <div>
        <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-6">
          Your Budgets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div>Loading budgets...</div>
          ) : (
            budgets.map((budget) => {
              const spent = transactions.reduce((s, t) => {
                // count transactions matching budget category within budget period
                const d = new Date(t.date);
                const start = new Date(budget.startDate);
                const end = new Date(budget.endDate);
                if (t.category === budget.category && d >= start && d <= end)
                  return s + t.amount;
                return s;
              }, 0);
              const percentage = getBudgetPercentage(spent, budget.limitAmount);
              const isNearLimit = percentage >= budget.notificationThreshold;
              const isExceeded = percentage > 100;

              return (
                <div
                  key={budget.id}
                  className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-colors duration-200 ${
                    isExceeded
                      ? 'border-red-300 dark:border-red-700'
                      : isNearLimit
                        ? 'border-yellow-300 dark:border-yellow-700'
                        : 'border-border-light dark:border-border-dark'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-text-light dark:text-text-dark">
                        {budget.category}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isExceeded && (
                          <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-xs">
                              warning
                            </span>
                            Exceeded
                          </span>
                        )}
                        {isNearLimit && !isExceeded && (
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-xs">
                              warning
                            </span>
                            Near Limit
                          </span>
                        )}
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {budget.period}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
                      Budget for {budget.category} • Alert at{' '}
                      {budget.notificationThreshold}%
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          Spent
                        </span>
                        <span
                          className={`font-semibold ${isExceeded ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : 'text-text-light dark:text-text-dark'}`}
                        >
                          {formatAmount(spent)}
                        </span>
                      </div>
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full ${isExceeded ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span>{formatAmount(budget.limitAmount)} limit</span>
                        <span
                          className={
                            isExceeded
                              ? 'text-red-600 dark:text-red-400 font-semibold'
                              : isNearLimit
                                ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
                                : ''
                          }
                        >
                          {percentage}% used
                        </span>
                      </div>
                    </div>

                    {/* Budget Alert within card */}
                    {isNearLimit && (
                      <div
                        className={`rounded-lg p-3 mb-4 flex items-start gap-2 ${isExceeded ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}
                      >
                        <span
                          className={`material-icons-round mt-0.5 text-sm ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                        >
                          warning
                        </span>
                        <div>
                          <p
                            className={`text-xs font-semibold ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                          >
                            {isExceeded
                              ? 'Budget Exceeded!'
                              : 'Approaching Limit'}
                          </p>
                          <p
                            className={`text-xs mt-1 ${isExceeded ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}
                          >
                            {isExceeded
                              ? `Over budget by ${formatAmount(spent - budget.limitAmount)}`
                              : `${budget.notificationThreshold - percentage}% remaining until limit`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="w-full py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={() => handleViewDetails(budget)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddBudgetModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onCreate={handleCreateBudget}
      />

      <BudgetDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        budget={selectedBudget}
        transactions={transactions}
      />
    </div>
  );
};
