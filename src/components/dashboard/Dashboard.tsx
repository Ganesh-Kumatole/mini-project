import { useState } from 'react';

export const Dashboard = () => {
  const [chartData] = useState({
    totalBalance: 12450.75,
    monthlyIncome: 3200.0,
    monthlyExpenses: 1850.5,
    budgetUsage: 65,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Total Balance
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            ${chartData.totalBalance.toFixed(2)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_upward
              </span>
              +3.5%
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              this month
            </span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                north
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Monthly Income
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            ${chartData.monthlyIncome.toFixed(2)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_upward
              </span>
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              up from last month
            </span>
          </div>
        </div>

        {/* Monthly Expenses Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                south
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Monthly Expenses
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            ${chartData.monthlyExpenses.toFixed(2)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-red-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_downward
              </span>
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              down from last month
            </span>
          </div>
        </div>

        {/* Budget Usage Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                percent
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Budget Usage %
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            {chartData.budgetUsage}%
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
              20% remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${chartData.budgetUsage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense Breakdown */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Expense Breakdown
          </h3>
          <div className="relative h-64 w-full flex justify-center items-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Chart will be implemented here with Chart.js
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Groceries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Utilities
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Transport
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Entertainment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Dining Out
              </span>
            </div>
          </div>
        </div>

        {/* Income vs Expense Trend */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Income vs. Expense Trend
          </h3>
          <div className="relative h-64 w-full flex justify-center items-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Chart will be implemented here with Chart.js
            </p>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Income
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Banner */}
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
          <span className="material-icons text-gray-400 dark:text-gray-500">
            receipt
          </span>
          <span className="font-medium">View your recent transactions</span>
        </div>
        <button className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark transition-colors">
          Go to Transactions
        </button>
      </div>
    </div>
  );
};
