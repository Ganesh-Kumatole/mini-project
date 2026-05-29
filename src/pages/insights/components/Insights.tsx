import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { useInsightsPage } from '../hooks/useInsightsPage';
import { formatDate } from '@/shared/utils';

// Internal Components
import {
  Shimmer,
  SectionCard,
  SectionTitle,
  StatCard,
  BudgetRow,
} from './InsightsPrimitives';
import { AIChatSection } from './AIChatSection';
import { SavingsGoalSection } from './SavingsGoalSection';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const Insights = () => {
  const {
    theme,
    formatAmount,
    exportRef,
    exporting,
    handleExport,
    computed,
    aiSummary,
    aiTips,
    loading,
    aiLoading,
    aiError,
    refreshAI,
    currentSaved,
    momDisplay,
    momColor,
    momIcon,
    savingsColor,
    catBarData,
    catBarOptions,
    bvaData,
    bvaOptions,
    momLineData,
    momLineOptions,
    financialStats,
  } = useInsightsPage();

  const {
    currentIncome,
    currentExpense,
    savingsRate,
    topCategories,
    budgetHealth,
    budgetAlerts,
    biggestExpense,
    projectedMonthlySpend,
    daysElapsed,
    daysInMonth,
    anomalies,
    weekdaySpend,
    weekendSpend,
    weekdayPct,
    weekendPct,
    recurringExpenses,
    recurringTotal,
  } = computed;

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <Shimmer className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!loading && currentIncome === 0 && currentExpense === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1
          id="insights-heading"
          className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8"
        >
          AI-Powered Insights
        </h1>
        <SectionCard className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="material-icons text-5xl text-gray-300 dark:text-gray-600">
            auto_graph
          </span>
          <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            No transactions yet this month
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
            Add some transactions and budgets to unlock personalised AI
            insights.
          </p>
        </SectionCard>
      </div>
    );
  }

  // 3. Main Dashboard Layout
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          id="insights-heading"
          className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
        >
          AI-Powered Insights
        </h1>
        <div className="flex items-center gap-2">
          <button
            id="export-pdf-btn"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span
              className={`material-icons text-base ${exporting ? 'animate-pulse' : ''}`}
            >
              picture_as_pdf
            </span>
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            id="refresh-ai-btn"
            onClick={refreshAI}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span
              className={`material-icons text-base ${aiLoading ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
            {aiLoading ? 'Analysing…' : 'Refresh AI'}
          </button>
        </div>
      </div>

      <div ref={exportRef} className="space-y-8">
        {/* AI Summary Banner */}
        {aiLoading ? (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-icons text-indigo-500 animate-spin text-xl">
                auto_awesome
              </span>
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
            <span className="material-icons text-amber-500 mt-0.5">
              warning
            </span>
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
              <span className="material-icons text-indigo-500 text-xl">
                auto_awesome
              </span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm uppercase tracking-wider">
                AI Financial Summary
              </span>
            </div>
            <p className="text-text-primary-light dark:text-text-primary-dark leading-relaxed">
              {aiSummary}
            </p>
          </div>
        ) : null}

        {/* Row 1: KPI Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            id="stat-spending-trend"
            icon={momIcon}
            iconColor={momColor || 'text-emerald-500'}
            label="Spending Trend"
            value={formatAmount(currentExpense)}
            sub={momDisplay}
            subColor={momColor}
          />
          <StatCard
            id="stat-savings-rate"
            icon="savings"
            iconColor={savingsColor}
            label="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            sub={
              savingsRate >= 20
                ? '🎉 On target'
                : savingsRate >= 10
                  ? 'Aim for 20%'
                  : 'Below target'
            }
            subColor={savingsColor}
          />
          <StatCard
            id="stat-top-category"
            icon="category"
            iconColor="text-purple-500"
            label="Top Category"
            value={topCategories[0]?.name ?? '—'}
            sub={
              topCategories[0]
                ? formatAmount(topCategories[0].amount)
                : 'No expenses yet'
            }
          />
          <StatCard
            id="stat-biggest-expense"
            icon="receipt_long"
            iconColor="text-orange-500"
            label="Biggest Expense"
            value={biggestExpense ? formatAmount(biggestExpense.amount) : '—'}
            sub={biggestExpense?.description ?? 'None this month'}
          />
        </div>

        {/* Row 2: Deep Dive Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projected End-of-Month Spend */}
          <SectionCard>
            <SectionTitle icon="timeline">Month-End Projection</SectionTitle>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {formatAmount(projectedMonthlySpend)}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  projected total by end of month
                </p>
              </div>
              <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark space-y-1">
                <p>
                  Spent so far:{' '}
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {formatAmount(currentExpense)}
                  </span>
                </p>
                <p>
                  Daily rate:{' '}
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {formatAmount(currentExpense / Math.max(daysElapsed, 1))}
                    /day
                  </span>
                </p>
                <p>
                  Days remaining:{' '}
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {daysInMonth - daysElapsed}
                  </span>
                </p>
              </div>
              {budgetHealth.length > 0 &&
                (() => {
                  const totalLimit = budgetHealth.reduce(
                    (s, b) => s + b.limitAmount,
                    0,
                  );
                  const overBy = projectedMonthlySpend - totalLimit;
                  return overBy > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                      <span className="material-icons text-sm">warning</span>
                      At this rate you'll exceed your total budget by{' '}
                      {formatAmount(overBy)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">
                      <span className="material-icons text-sm">
                        check_circle
                      </span>
                      On track — {formatAmount(Math.abs(overBy))} under budget
                      limit
                    </div>
                  );
                })()}
            </div>
          </SectionCard>

          {/* User Savings Goal Tracker */}
          <SavingsGoalSection currentSaved={currentSaved} />

          {/* Weekday vs. Weekend Analysis */}
          <SectionCard>
            <SectionTitle icon="date_range">Weekday vs Weekend</SectionTitle>
            {weekdaySpend + weekendSpend === 0 ? (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No expense data yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="w-full h-5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-700"
                    style={{ width: `${weekdayPct}%` }}
                  />
                  <div
                    className="bg-orange-400 h-full transition-all duration-700"
                    style={{ width: `${weekendPct}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Weekdays
                      </span>
                    </div>
                    <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                      {formatAmount(weekdaySpend)}
                    </p>
                    <p className="text-xs text-indigo-500 font-medium">
                      {weekdayPct.toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Weekends
                      </span>
                    </div>
                    <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                      {formatAmount(weekendSpend)}
                    </p>
                    <p className="text-xs text-orange-400 font-medium">
                      {weekendPct.toFixed(0)}%
                    </p>
                  </div>
                </div>
                {weekendPct > 50 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                    💡 Over half your spending happens on weekends. Consider
                    planning weekend activities with a budget.
                  </p>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Row 3: Budget Utilization */}
        {budgetHealth.length > 0 && (
          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-icons text-indigo-500 text-xl">
                  account_balance
                </span>
                <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Budget Health
                </h2>
              </div>
              {budgetAlerts.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <span className="material-icons text-sm">warning</span>
                  {budgetAlerts.length} alert
                  {budgetAlerts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {budgetHealth.map((b) => (
                <BudgetRow key={b.id} {...b} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Row 4: Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgetHealth.length > 0 && (
            <SectionCard>
              <SectionTitle icon="bar_chart">Budget vs. Actual</SectionTitle>
              <div className="h-56">
                <Bar key={`bva-${theme}`} data={bvaData} options={bvaOptions} />
              </div>
            </SectionCard>
          )}

          <SectionCard>
            <SectionTitle icon="show_chart">
              6-Month Income vs. Expense
            </SectionTitle>
            <div className="h-56">
              <Line
                key={`mom-${theme}`}
                data={momLineData}
                options={momLineOptions}
              />
            </div>
          </SectionCard>
        </div>

        {/* Row 5: Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard>
            <SectionTitle icon="pie_chart">
              Category Breakdown (This Month)
            </SectionTitle>
            {topCategories.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No expense data for this month
                </p>
              </div>
            ) : (
              <div className="h-56">
                <Bar
                  key={`cat-${theme}`}
                  data={catBarData}
                  options={catBarOptions}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle icon="lightbulb">
              AI Tips &amp; Recommendations
            </SectionTitle>
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
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
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
          </SectionCard>
        </div>

        {/* Row 6: Anomaly & Subscription Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard>
            <SectionTitle icon="notifications_active">
              Anomaly Detection
            </SectionTitle>
            {anomalies.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="material-icons text-3xl text-emerald-400">
                  check_circle
                </span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No unusual transactions detected this month. Your spending
                  looks normal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-4">
                  {anomalies.length} transaction
                  {anomalies.length > 1 ? 's' : ''} significantly higher than
                  your usual amounts in their category.
                </p>
                {anomalies.slice(0, 4).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="material-icons text-amber-500 text-base flex-shrink-0 mt-0.5">
                        warning_amber
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                          {a.description}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {a.category} · {formatDate(a.date)}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          {a.sigmasAbove.toFixed(1)}× above your avg{' '}
                          {formatAmount(a.categoryAvg)} for this category
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                      {formatAmount(a.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle icon="repeat">Recurring Expenses</SectionTitle>
            {recurringExpenses.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="material-icons text-3xl text-gray-300 dark:text-gray-600">
                  event_repeat
                </span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No recurring expenses detected yet. They appear once you have
                  2+ months of similar transactions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {recurringExpenses.length} recurring expense
                    {recurringExpenses.length > 1 ? 's' : ''} detected
                  </p>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                    ~{formatAmount(recurringTotal)}/mo total
                  </span>
                </div>
                {recurringExpenses.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 py-2.5 border-b border-border-light dark:border-border-dark last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-icons text-indigo-400 text-base flex-shrink-0">
                        repeat
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                          {r.description}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {r.category} · seen {r.occurrences}× in last 3 months
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark flex-shrink-0">
                      {formatAmount(r.amount)}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* AI Chat Interface */}
        <AIChatSection stats={financialStats} />
      </div>
    </div>
  );
};
