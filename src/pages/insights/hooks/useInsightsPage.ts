import { useInsights } from './useInsights';
import { useInsightsExport } from './useInsightsExport';
import { useCurrencyContext, useThemeContext } from '@/shared/context';

export const useInsightsPage = () => {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const { formatAmount, symbol } = useCurrencyContext();
  const { exportRef, exporting, handleExport } = useInsightsExport();

  const {
    computed,
    aiSummary,
    aiTips,
    loading,
    aiLoading,
    aiError,
    refreshAI,
  } = useInsights();

  // Derived display configurations for the UI components

  const currentSaved = Math.max(computed.currentIncome - computed.currentExpense, 0);

  // Theme-aware chart palette
  const ct = isDark ? '#9ca3af' : '#6b7280';
  const cg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const barColors = isDark
    ? [
        'rgba(129,140,248,0.85)',
        'rgba(251,146,60,0.85)',
        'rgba(251,113,133,0.85)',
        'rgba(52,211,153,0.85)',
        'rgba(196,181,253,0.85)',
      ]
    : [
        'rgba(99,102,241,0.8)',
        'rgba(249,115,22,0.8)',
        'rgba(244,63,94,0.8)',
        'rgba(52,211,153,0.8)',
        'rgba(167,139,250,0.8)',
      ];

  // Spending trend stats mapping
  const momDisplay =
    computed.monthOverMonthChange !== null
      ? `${computed.monthOverMonthChange >= 0 ? '+' : ''}${computed.monthOverMonthChange.toFixed(1)}% vs last month`
      : 'No previous month data';
  
  const momColor =
    computed.monthOverMonthChange === null
      ? ''
      : computed.monthOverMonthChange > 0
      ? 'text-red-500'
      : 'text-emerald-500';
  
  const momIcon =
    computed.monthOverMonthChange !== null && computed.monthOverMonthChange > 0
      ? 'trending_up'
      : 'trending_down';
  
  const savingsColor =
    computed.savingsRate >= 20
      ? 'text-emerald-500'
      : computed.savingsRate >= 10
      ? 'text-amber-500'
      : 'text-red-500';

  // Category Breakdown Bar Chart Config
  const catBarData = {
    labels: computed.topCategories.map((c) => c.name),
    datasets: [
      {
        label: 'Spent',
        data: computed.topCategories.map((c) => c.amount),
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };

  const baseScaleOpts = { ticks: { color: ct }, grid: { color: cg } };
  
  const catBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${formatAmount(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ...baseScaleOpts, ticks: { ...baseScaleOpts.ticks, font: { size: 11 } } },
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { color: ct, callback: (v: any) => `${symbol}${v}` } },
    },
  };

  // Budget vs Actual Grouped Bar Chart Config
  const bvaLabels = computed.budgetHealth.map((b) => b.category);
  const bvaData = {
    labels: bvaLabels,
    datasets: [
      {
        label: 'Budget Limit',
        data: computed.budgetHealth.map((b) => b.limitAmount),
        backgroundColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)',
        borderColor: isDark ? 'rgba(129,140,248,0.8)' : 'rgba(99,102,241,0.8)',
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false as const,
      },
      {
        label: 'Actual Spent',
        data: computed.budgetHealth.map((b) => b.spentAmount),
        backgroundColor: computed.budgetHealth.map((b) =>
          b.percentUsed >= 90
            ? isDark ? 'rgba(251,113,133,0.85)' : 'rgba(244,63,94,0.8)'
            : b.percentUsed >= 60
            ? isDark ? 'rgba(251,191,36,0.8)' : 'rgba(245,158,11,0.75)'
            : isDark ? 'rgba(52,211,153,0.8)' : 'rgba(16,185,129,0.75)',
        ),
        borderRadius: 4,
        borderSkipped: false as const,
      },
    ],
  };
  
  const bvaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: ct, boxWidth: 12, padding: 12 } },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ...baseScaleOpts, ticks: { ...baseScaleOpts.ticks, font: { size: 11 } } },
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { color: ct, callback: (v: any) => `${symbol}${v}` } },
    },
  };

  // Month-over-Month Trend Line Chart Config
  const momLabels = computed.monthlyTrend.map((m) => {
    const [y, mo] = m.month.split('-');
    return new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleString('default', { month: 'short' });
  });
  
  const momLineData = {
    labels: momLabels,
    datasets: [
      {
        label: 'Income',
        data: computed.monthlyTrend.map((m) => m.income),
        borderColor: isDark ? '#34d399' : '#059669',
        backgroundColor: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Expenses',
        data: computed.monthlyTrend.map((m) => m.expense),
        borderColor: isDark ? '#f87171' : '#dc2626',
        backgroundColor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.07)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  
  const momLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: ct, boxWidth: 12, padding: 12 } },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: baseScaleOpts,
      y: { ...baseScaleOpts, beginAtZero: true, ticks: { color: ct, callback: (v: any) => `${symbol}${v}` } },
    },
  };

  // Structure required for the AI chat section
  const financialStats = {
    totalIncome: computed.currentIncome,
    totalExpense: computed.currentExpense,
    savingsRate: computed.savingsRate,
    monthOverMonthChange: computed.monthOverMonthChange ?? 0,
    topCategories: computed.topCategories,
    budgetAlerts: computed.budgetAlerts.map((b) => ({ category: b.category, percentUsed: b.percentUsed })),
    biggestExpense: computed.biggestExpense,
  };

  return {
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
  };
};
