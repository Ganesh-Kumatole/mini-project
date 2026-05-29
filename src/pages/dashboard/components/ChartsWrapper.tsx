import { Skeleton } from '@/shared/components/Skeleton';
import { DonutChart, LineChart, BudgetBarChart } from './Charts';
import { Link } from 'react-router-dom';
import { useCurrencyContext } from '@/shared/context';
import { formatDate } from '@/shared/utils';
import { ChartsWrapperProps } from '@/pages/dashboard/types';

export const ChartsWrapper = ({
  loading,
  donutData,
  monthly,
  bvaData,
  recentTx,
  setShowAddTx,
}: ChartsWrapperProps) => {
  const { formatAmount } = useCurrencyContext();

  return (
    <>
      {/* row 2: donut chart + line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: Category breakdown */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Spending by Category{' '}
            <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">
              (last 30 days)
            </span>
          </h3>
          <div className="h-60">
            {loading ? (
              <Skeleton h="h-full" rounded="rounded-xl" />
            ) : donutData.labels.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <span className="material-icons text-3xl text-gray-300">
                  donut_large
                </span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No expenses in last 30 days
                </p>
              </div>
            ) : (
              <DonutChart labels={donutData.labels} data={donutData.data} />
            )}
          </div>
        </div>

        {/* Line: Income vs Expense trend */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Income vs. Expenses{' '}
            <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">
              (6 months)
            </span>
          </h3>
          <div className="h-60">
            {loading ? (
              <Skeleton h="h-full" rounded="rounded-xl" />
            ) : (
              <LineChart
                labels={monthly.map((m) => m.month)}
                income={monthly.map((m) => m.income)}
                expense={monthly.map((m) => m.expense)}
              />
            )}
          </div>
        </div>
      </div>

      {/* row 3: budget bar chart + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* budget limit vs actual spending chart */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              Budget vs. Actual
            </h3>
            <Link
              to="/budgets"
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Manage →
            </Link>
          </div>
          <div className="h-52">
            {loading ? (
              <Skeleton h="h-full" rounded="rounded-xl" />
            ) : bvaData.labels.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <span className="material-icons text-3xl text-gray-300">
                  bar_chart
                </span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No budgets set yet
                </p>
                <Link
                  to="/budgets"
                  className="text-xs text-indigo-500 font-medium mt-1"
                >
                  Create a budget →
                </Link>
              </div>
            ) : (
              <BudgetBarChart
                labels={bvaData.labels}
                budgeted={bvaData.budgeted}
                actual={bvaData.actual}
              />
            )}
          </div>
        </div>

        {/* recent transactions */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <Skeleton h="h-9" w="w-9" rounded="rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton h="h-3.5" w="w-3/4" />
                    <Skeleton h="h-3" w="w-1/3" />
                  </div>
                  <Skeleton h="h-4" w="w-16" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <span className="material-icons text-3xl text-gray-300">
                receipt_long
              </span>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No transactions yet
              </p>
              <button
                onClick={() => setShowAddTx(true)}
                className="text-xs text-indigo-500 font-medium mt-1"
              >
                Add your first transaction →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                  >
                    <span
                      className={`material-icons text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {tx.type === 'income' ? 'north' : 'south'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {tx.category} · {formatDate(new Date(tx.date))}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold flex-shrink-0 tabular-nums ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary-light dark:text-text-primary-dark'}`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
