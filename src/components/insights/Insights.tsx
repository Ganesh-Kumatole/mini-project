import { useInsights } from '@/hooks/useInsights';
import { formatDate } from '@/utils/formatters';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { askFollowUp, FinancialStats } from '@/services/ai/huggingface';
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
import { useState, useRef, useCallback } from 'react';

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

// ── Small reusable primitives ─────────────────────────────────────────────────

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
  />
);

const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-6">
    <span className="material-icons text-indigo-500 text-xl">{icon}</span>
    <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
      {children}
    </h2>
  </div>
);

// ── StatCard ─────────────────────────────────────────────────────────────────

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
  <div
    id={id}
    className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-3 transition-all hover:shadow-md"
  >
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
      <p
        className={`text-xs font-medium ${subColor ?? 'text-text-secondary-light dark:text-text-secondary-dark'}`}
      >
        {sub}
      </p>
    )}
  </div>
);

// ── BudgetRow ─────────────────────────────────────────────────────────────────

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
  const { formatAmount } = useCurrency();
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
          {formatAmount(spentAmount)}{' '}
          <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal">
            / {formatAmount(limitAmount)}
          </span>
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className={`text-xs ${textColor} text-right`}>
        {clamped.toFixed(0)}% used
      </p>
    </div>
  );
};

// ── AI Chat Section ────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'Why is my spending so high this month?',
  'How can I improve my savings rate?',
  'Which budget category needs most attention?',
  "What's a realistic savings goal for me?",
];

const AIChatSection = ({ stats }: { stats: FinancialStats }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isAsking) return;
      setInput('');
      setIsAsking(true);
      const history = messages
        .filter((m) => !m.loading)
        .map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: '', loading: true },
      ]);
      setTimeout(scrollToBottom, 50);
      try {
        const answer = await askFollowUp(stats, question, history);
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { role: 'assistant', content: answer } : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? {
                  role: 'assistant',
                  content: "Sorry, couldn't get a response. Try again.",
                }
              : m,
          ),
        );
      } finally {
        setIsAsking(false);
        setTimeout(scrollToBottom, 50);
      }
    },
    [messages, isAsking, stats],
  );

  return (
    <SectionCard className="flex flex-col overflow-hidden !p-0">
      <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b border-border-light dark:border-border-dark">
        <span className="material-icons text-indigo-500">forum</span>
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
          Ask Your Finance AI
        </h2>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-6 py-4 space-y-4 min-h-[220px] max-h-[340px]">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="material-icons text-indigo-500 text-base mt-1 flex-shrink-0">
                  auto_awesome
                </span>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-bl-sm'}`}
              >
                {msg.loading ? (
                  <span className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Type a question…"
            disabled={isAsking}
            className="flex-1 bg-transparent text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark outline-none disabled:opacity-50"
          />
          <button
            id="ai-chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isAsking}
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="material-icons text-sm">
              {isAsking ? 'hourglass_empty' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

// ── Savings Goal Tracker ───────────────────────────────────────────────────────

const GOAL_KEY = 'fintracker_savings_goal';

const SavingsGoalSection = ({ currentSaved }: { currentSaved: number }) => {
  const { formatAmount, symbol } = useCurrency();
  const [goal, setGoal] = useState<number>(() => {
    const stored = localStorage.getItem(GOAL_KEY);
    return stored ? parseFloat(stored) : 0;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const saveGoal = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      localStorage.setItem(GOAL_KEY, String(parsed));
    }
    setEditing(false);
  };

  const pct = goal > 0 ? Math.min((currentSaved / goal) * 100, 100) : 0;
  const barColor =
    pct >= 100
      ? 'bg-emerald-500'
      : pct >= 60
        ? 'bg-indigo-500'
        : pct >= 30
          ? 'bg-amber-400'
          : 'bg-red-400';
  const remaining = Math.max(goal - currentSaved, 0);

  return (
    <SectionCard>
      <SectionTitle icon="flag">{`Savings Goal`}</SectionTitle>

      {goal === 0 ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">
            savings
          </span>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
            Set a monthly savings goal to track your progress.
          </p>
          <button
            onClick={() => {
              setDraft('');
              setEditing(true);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Set Goal
          </button>
        </div>
      ) : editing ? null : (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {formatAmount(currentSaved)}
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                saved of {formatAmount(goal)} goal
              </p>
            </div>
            <div className="text-right">
              {pct >= 100 ? (
                <span className="text-emerald-500 font-semibold text-sm">
                  🎉 Goal reached!
                </span>
              ) : (
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                  {formatAmount(remaining)} to go
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`${barColor} h-3 rounded-full transition-all duration-700 relative`}
              style={{ width: `${pct}%` }}
            >
              {pct > 15 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setDraft(String(goal));
              setEditing(true);
            }}
            className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Change goal
          </button>
        </div>
      )}

      {editing && (
        <div className="bg-surface-light dark:bg-surface-dark mt-2 border border-border-light dark:border-border-dark p-4 rounded-xl space-y-4 shadow-sm animate-[fadeIn_0.2s_ease]">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">
              Monthly savings goal
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light dark:text-text-secondary-dark font-medium select-none">
                {symbol}
              </div>
              <input
                autoFocus
                type="number"
                min="0"
                step="50"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveGoal();
                  if (e.key === 'Escape') setEditing(false);
                }}
                placeholder="e.g. 500.00"
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm pl-8 py-2.5 transition-all"
              />
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono border border-border-light dark:border-border-dark shadow-sm">Enter</kbd> to save.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveGoal}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const Insights = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatAmount, symbol } = useCurrency();
  const {
    computed,
    aiSummary,
    aiTips,
    loading,
    aiLoading,
    aiError,
    refreshAI,
  } = useInsights();
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const {
    currentIncome,
    currentExpense,
    savingsRate,
    monthOverMonthChange,
    topCategories,
    budgetHealth,
    budgetAlerts,
    biggestExpense,
    monthlyTrend,
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

  // ── Current month net savings ──
  const currentSaved = Math.max(currentIncome - currentExpense, 0);

  // ── PDF export (lazy import) ──
  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = pw - 20;
      const ih = (canvas.height * iw) / canvas.width;
      let yPos = 10,
        remaining = ih;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 10, yPos, iw, ih);
        remaining -= ph - 20;
        if (remaining > 0) {
          pdf.addPage();
          yPos = -(ih - remaining) - 10;
        }
      }
      const month = new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      pdf.save(`FinTracker_Insights_${month.replace(' ', '_')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // ── Theme-aware chart palette ──
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
  const momIcon =
    monthOverMonthChange !== null && monthOverMonthChange > 0
      ? 'trending_up'
      : 'trending_down';
  const savingsColor =
    savingsRate >= 20
      ? 'text-emerald-500'
      : savingsRate >= 10
        ? 'text-amber-500'
        : 'text-red-500';

  // ── Category breakdown bar chart ──
  const catBarData = {
    labels: topCategories.map((c) => c.name),
    datasets: [
      {
        label: 'Spent',
        data: topCategories.map((c) => c.amount),
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
      x: {
        ...baseScaleOpts,
        ticks: { ...baseScaleOpts.ticks, font: { size: 11 } },
      },
      y: {
        ...baseScaleOpts,
        beginAtZero: true,
        ticks: { color: ct, callback: (v: any) => `${symbol}${v}` },
      },
    },
  };

  // ── Budget vs Actual grouped bar chart ──
  const bvaLabels = budgetHealth.map((b) => b.category);
  const bvaData = {
    labels: bvaLabels,
    datasets: [
      {
        label: 'Budget Limit',
        data: budgetHealth.map((b) => b.limitAmount),
        backgroundColor: isDark
          ? 'rgba(99,102,241,0.35)'
          : 'rgba(99,102,241,0.25)',
        borderColor: isDark ? 'rgba(129,140,248,0.8)' : 'rgba(99,102,241,0.8)',
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false as const,
      },
      {
        label: 'Actual Spent',
        data: budgetHealth.map((b) => b.spentAmount),
        backgroundColor: budgetHealth.map((b) =>
          b.percentUsed >= 90
            ? isDark
              ? 'rgba(251,113,133,0.85)'
              : 'rgba(244,63,94,0.8)'
            : b.percentUsed >= 60
              ? isDark
                ? 'rgba(251,191,36,0.8)'
                : 'rgba(245,158,11,0.75)'
              : isDark
                ? 'rgba(52,211,153,0.8)'
                : 'rgba(16,185,129,0.75)',
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
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ...baseScaleOpts,
        ticks: { ...baseScaleOpts.ticks, font: { size: 11 } },
      },
      y: {
        ...baseScaleOpts,
        beginAtZero: true,
        ticks: { color: ct, callback: (v: any) => `${symbol}${v}` },
      },
    },
  };

  // ── MoM Trend (sparkline-style line chart, last 6 months) ──
  const momLabels = monthlyTrend.map((m) => {
    const [y, mo] = m.month.split('-');
    return new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleString(
      'default',
      { month: 'short' },
    );
  });
  const momLineData = {
    labels: momLabels,
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map((m) => m.income),
        borderColor: isDark ? '#34d399' : '#059669',
        backgroundColor: isDark
          ? 'rgba(52,211,153,0.12)'
          : 'rgba(5,150,105,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map((m) => m.expense),
        borderColor: isDark ? '#f87171' : '#dc2626',
        backgroundColor: isDark
          ? 'rgba(248,113,113,0.1)'
          : 'rgba(220,38,38,0.07)',
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
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: baseScaleOpts,
      y: {
        ...baseScaleOpts,
        beginAtZero: true,
        ticks: { color: ct, callback: (v: any) => `${symbol}${v}` },
      },
    },
  };

  // ── Financial stats for AI chat ──
  const financialStats: FinancialStats = {
    totalIncome: currentIncome,
    totalExpense: currentExpense,
    savingsRate,
    monthOverMonthChange: monthOverMonthChange ?? 0,
    topCategories,
    budgetAlerts: budgetAlerts.map((b) => ({
      category: b.category,
      percentUsed: b.percentUsed,
    })),
    biggestExpense,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Page header ────────────────────────────────────────────────── */}
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

      {/* ── Exportable content ──────────────────────────────────────────── */}
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

        {/* ── Row 1: 4 Stat Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            id="stat-spending-trend"
            icon={momIcon}
            iconColor={
              monthOverMonthChange !== null && monthOverMonthChange > 0
                ? 'text-red-500'
                : 'text-emerald-500'
            }
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

        {/* ── Row 2: Predicted spend + Savings Goal + Weekday/Weekend ──── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Predicted End-of-Month Spend */}
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

          {/* Savings Goal */}
          <SavingsGoalSection currentSaved={currentSaved} />

          {/* Weekday vs Weekend Breakdown */}
          <SectionCard>
            <SectionTitle icon="date_range">Weekday vs Weekend</SectionTitle>
            {weekdaySpend + weekendSpend === 0 ? (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No expense data yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Stacked visual bar */}
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

        {/* ── Row 3: Budget Health ──────────────────────────────────────── */}
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

        {/* ── Row 4: Budget vs Actual + MoM Trend ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Actual Bar Chart */}
          {budgetHealth.length > 0 && (
            <SectionCard>
              <SectionTitle icon="bar_chart">Budget vs. Actual</SectionTitle>
              <div className="h-56">
                <Bar key={`bva-${theme}`} data={bvaData} options={bvaOptions} />
              </div>
            </SectionCard>
          )}

          {/* Month-over-Month Trend Sparkline */}
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

        {/* ── Row 5: Category Breakdown + AI Tips ──────────────────────── */}
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

        {/* ── Row 6: Anomalies + Recurring Expenses ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomaly Detection */}
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
                  your usual {anomalies.length > 1 ? 'amounts' : 'amount'} in
                  their category.
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

          {/* Recurring Expense Detection */}
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

        {/* ── AI Chat — full width ──────────────────────────────────────── */}
        <AIChatSection stats={financialStats} />
      </div>
    </div>
  );
};
