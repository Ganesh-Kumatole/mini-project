import { useDashboard, useTransactions } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';
import { LineChart, DonutChart } from './Charts';

export const Dashboard = () => {
  const { totals, monthly, loading } = useDashboard();
  const { transactions } = useTransactions();

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
            {formatCurrency(totals.totalIncome - totals.totalExpense)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_upward
              </span>
              {/* simple delta stat */}
              {totals.totalIncome > 0
                ? `${(((totals.totalIncome - totals.totalExpense) / Math.max(totals.totalIncome, 1)) * 100).toFixed(1)}%`
                : '0%'}
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
            {formatCurrency(totals.totalIncome)}
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
            {formatCurrency(totals.totalExpense)}
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

        {/* Budget Usage Card (uses totals to approximate) */}
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
            {Math.min(
              Math.round(
                (totals.totalExpense / Math.max(totals.totalIncome, 1)) * 100,
              ),
              100,
            )}
            %
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
              approximate
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{
                width: `${Math.min((totals.totalExpense / Math.max(totals.totalIncome, 1)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense Breakdown (Donut) */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Expense Breakdown (Last 30 days)
          </h3>
          <div className="relative h-64 w-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              (() => {
                const recentSince = new Date();
                recentSince.setDate(recentSince.getDate() - 30);
                const recent = transactions.filter(
                  (t) =>
                    new Date(t.date) >= recentSince && t.type === 'expense',
                );
                const grouped = recent.reduce<Record<string, number>>(
                  (acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                  },
                  {},
                );
                const labels = Object.keys(grouped).slice(0, 8);
                const data = labels.map((l) => grouped[l] || 0);
                if (labels.length === 0)
                  return (
                    <div className="flex items-center justify-center">
                      No recent expenses
                    </div>
                  );
                return <DonutChart labels={labels} data={data} />;
              })()
            )}
          </div>
        </div>

        {/* Income vs Expense Trend (Line) */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Income vs. Expense Trend
          </h3>
          <div className="relative h-64 w-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              (() => {
                const labels = monthly.map((m) => m.month);
                const income = monthly.map((m) => m.income);
                const expense = monthly.map((m) => m.expense);
                return (
                  <LineChart
                    labels={labels}
                    income={income}
                    expense={expense}
                  />
                );
              })()
            )}
          </div>
        </div>
      </div>
      receipt
      <span className="font-medium">View your recent transactions</span>
      <button className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-text-primary-light dark:text-text-primary-dark transition-colors">
        Go to Transactions
      </button>
    </div>
  );
};
