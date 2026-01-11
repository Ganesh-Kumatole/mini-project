import { useState } from 'react';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
  tag: string;
}

export const Budgets = () => {
  const [budgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Groceries',
      limit: 400,
      spent: 320,
      period: 'Monthly',
      tag: 'Essential',
    },
    {
      id: '2',
      category: 'Entertainment',
      limit: 150,
      spent: 85,
      period: 'Monthly',
      tag: 'Lifestyle',
    },
    {
      id: '3',
      category: 'Transportation',
      limit: 200,
      spent: 150,
      period: 'Monthly',
      tag: 'Essential',
    },
  ]);

  const [monthlyLimit] = useState(1500);
  const [totalSpent] = useState(1795.0);
  const budgetUsagePercent = Math.min((totalSpent / monthlyLimit) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
          Budget Management
        </h1>
        <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors text-sm">
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
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Remaining:
              </p>
              <p className="text-text-light dark:text-text-dark font-bold text-lg">
                ${Math.max(monthlyLimit - totalSpent, 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-between sm:hidden text-lg font-bold">
            <span className="text-red-500">${totalSpent.toFixed(2)}</span>
          </div>

          <div className="relative pt-1">
            <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  budgetUsagePercent > 100 ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-semibold inline-block ${
                  budgetUsagePercent > 100
                    ? 'text-red-500'
                    : 'text-text-secondary-light dark:text-text-secondary-dark'
                }`}
              >
                {budgetUsagePercent.toFixed(0)}% of ${monthlyLimit.toFixed(2)}{' '}
                Used
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
                You have exceeded your monthly budget by $
                {(totalSpent - monthlyLimit).toFixed(2)}. Review your spending
                immediately.
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
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
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
                      {budget.tag}
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
                        ${budget.spent.toFixed(2)}
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full ${
                          percentage > 100 ? 'bg-red-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      <span>${budget.limit.toFixed(2)} limit</span>
                      <span>{percentage.toFixed(0)}% used</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
