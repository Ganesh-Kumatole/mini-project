import { useInsights } from '@/hooks/useInsights';
import { formatCurrency } from '@/utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ── Reusable sub-components ───────────────────────────────────────────────────

/** Shimmer placeholder for any block while AI is loading */
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
  />
);

/** Stat card used for the top row */
const StatCard = ({
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
  <div id={id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-3 transition-all hover:shadow-md">
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
      <p className={`text-xs font-medium ${subColor ?? 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
        {sub}
      </p>
    )}
  </div>
);

/** Budget health progress bar row */
const BudgetRow = ({
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
          {formatCurrency(spentAmount)}{' '}
          <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal">
            / {formatCurrency(limitAmount)}
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

// ── Main Component ────────────────────────────────────────────────────────────

export const Insights = () => {
  const {
    computed,
    aiSummary,
    aiTips,
    loading,
    aiLoading,
    aiError,
    refreshAI,
  } = useInsights();

  const {
    currentIncome,
    currentExpense,
    savingsRate,
    monthOverMonthChange,
    topCategories,
    budgetHealth,
    budgetAlerts,
    biggestExpense,
  } = computed;

  // ── Derived display values ──
  const momDisplay =
    monthOverMonthChange !== null
      ? `${monthOverMonthChange >= 0 ? '+' : ''}${monthOverMonthChange.toFixed(1)}% vs last month`
      : 'No previous month data';
  const momColor =
    monthOverMonthChange === null
      ? ''
      : monthOverMonthChange > 0
      ? 'text-red-500'
      : 'text-emerald-500';
  const momIcon = monthOverMonthChange !== null && monthOverMonthChange > 0 ? 'trending_up' : 'trending_down';

  const savingsColor =
    savingsRate >= 20
      ? 'text-emerald-500'
      : savingsRate >= 10
      ? 'text-amber-500'
      : 'text-red-500';

  // ── Category bar chart data ──
  const barData = {
    labels: topCategories.map((c) => c.name),
    datasets: [
      {
        label: 'Spent (this month)',
        data: topCategories.map((c) => c.amount),
        backgroundColor: [
          'rgba(99,102,241,0.8)',
          'rgba(249,115,22,0.8)',
          'rgba(244,63,94,0.8)',
          'rgba(52,211,153,0.8)',
          'rgba(167,139,250,0.8)',
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => `$${v}`,
        },
      },
    },
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <Shimmer className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-36" />
          ))}
        </div>
        <Shimmer className="h-28" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Shimmer className="h-72" />
          <Shimmer className="h-72" />
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (!loading && currentIncome === 0 && currentExpense === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 id="insights-heading" className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
          AI-Powered Insights
        </h1>
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-12 flex flex-col items-center gap-4 text-center">
          <span className="material-icons text-5xl text-gray-300 dark:text-gray-600">auto_graph</span>
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            No transactions yet this month
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
            Add some transactions and budgets to unlock personalised AI insights
            about your spending patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          id="insights-heading"
          className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
        >
          AI-Powered Insights
        </h1>
        <button
          id="refresh-ai-btn"
          onClick={refreshAI}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className={`material-icons text-base ${aiLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          {aiLoading ? 'Analysing…' : 'Refresh AI'}
        </button>
      </div>

      {/* ── AI Summary Banner ─────────────────────────────────────────── */}
      {aiLoading ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="material-icons text-indigo-500 animate-spin text-xl">auto_awesome</span>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
              AI is analysing your finances…
            </span>
          </div>
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
          <Shimmer className="h-4 w-4/6" />
        </div>
      ) : aiError ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 flex items-start gap-3">
          <span className="material-icons text-amber-500 mt-0.5">warning</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
              AI unavailable
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {aiError} — showing computed insights only.
            </p>
          </div>
        </div>
      ) : aiSummary ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-indigo-500 text-xl">auto_awesome</span>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm uppercase tracking-wider">
              AI Financial Summary
            </span>
          </div>
          <p className="text-text-primary-light dark:text-text-primary-dark leading-relaxed">
            {aiSummary}
          </p>
        </div>
      ) : null}

      {/* ── Top Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          id="stat-spending-trend"
          icon={momIcon}
          iconColor={monthOverMonthChange !== null && monthOverMonthChange > 0 ? 'text-red-500' : 'text-emerald-500'}
          label="Spending Trend"
          value={formatCurrency(currentExpense)}
          sub={momDisplay}
          subColor={momColor}
        />
        <StatCard
          id="stat-savings-rate"
          icon="savings"
          iconColor={savingsColor}
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          sub={savingsRate >= 20 ? '🎉 On target' : savingsRate >= 10 ? 'Aim for 20%' : 'Below target'}
          subColor={savingsColor}
        />
        <StatCard
          id="stat-top-category"
          icon="category"
          iconColor="text-purple-500"
          label="Top Category"
          value={topCategories[0]?.name ?? '—'}
          sub={topCategories[0] ? formatCurrency(topCategories[0].amount) : 'No expenses yet'}
        />
        <StatCard
          id="stat-biggest-expense"
          icon="receipt_long"
          iconColor="text-orange-500"
          label="Biggest Expense"
          value={biggestExpense ? formatCurrency(biggestExpense.amount) : '—'}
          sub={biggestExpense?.description ?? 'None this month'}
        />
      </div>

      {/* ── Budget Health ────────────────────────────────────────────── */}
      {budgetHealth.length > 0 && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Budget Health
            </h2>
            {budgetAlerts.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <span className="material-icons text-sm">warning</span>
                {budgetAlerts.length} alert{budgetAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {budgetHealth.map((b) => (
              <BudgetRow
                key={b.id}
                category={b.category}
                spentAmount={b.spentAmount}
                limitAmount={b.limitAmount}
                percentUsed={b.percentUsed}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom 2-col section: Chart + AI Tips ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown bar chart */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Category Breakdown (This Month)
          </h2>
          {topCategories.length === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No expense data for this month
              </p>
            </div>
          ) : (
            <div className="h-56">
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </div>

        {/* AI Tips */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-icons text-indigo-500">lightbulb</span>
            <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              AI Tips &amp; Recommendations
            </h2>
          </div>

          {aiLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Shimmer className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : aiTips.length > 0 ? (
            <ul className="space-y-4">
              {aiTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-8 text-center">
              <span className="material-icons text-3xl text-gray-300 dark:text-gray-600">
                psychology
              </span>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {aiError
                  ? 'AI tips unavailable right now. Try refreshing.'
                  : 'AI tips will appear here once your data is analysed.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
