import { useMemo } from 'react';
import { useBudgets, useTransactions } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';

export const Budgets = () => {
  const { budgets, loading, createBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();

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

  const handleAdd = async () => {
    const category = window.prompt('Category');
    if (!category) return;
    const rawLimit = window.prompt('Limit amount (e.g. 200)');
    if (!rawLimit) return;
    const limitAmount = Number(rawLimit);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    try {
      await createBudget({
        category,
        limitAmount,
        period: 'monthly',
        startDate,
        endDate,
      });
    } catch (e) {
      // noop
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(id);
    } catch (e) {
      // noop
    }
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
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Remaining:
              </p>
              <p className="text-text-light dark:text-text-dark font-bold text-lg">
                {formatCurrency(Math.max(monthlyLimit - totalSpent, 0))}
              </p>
            </div>
          </div>

          <div className="flex justify-between sm:hidden text-lg font-bold">
            <span className="text-red-500">{formatCurrency(totalSpent)}</span>
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
                {formatCurrency(monthlyLimit)} Used
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
                {formatCurrency(Math.max(totalSpent - monthlyLimit, 0))}. Review
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
              const percentage = (spent / (budget.limitAmount ?? 1)) * 100;
              return (
                <div
                  key={budget.id}
                  className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-5 flex flex-col justify-between transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-text-light dark:text-text-dark">
                        {budget.category}
                      </h3>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {budget.period}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-4">
                      Budget for {budget.category}
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          Spent
                        </span>
                        <span className="font-semibold text-text-light dark:text-text-dark">
                          {formatCurrency(spent)}
                        </span>
                      </div>
                      <div className="overflow-hidden h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span>
                          {formatCurrency(budget.limitAmount ?? 0)} limit
                        </span>
                        <span>{percentage.toFixed(0)}% used</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="w-full py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Delete
                    </button>
                    <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
