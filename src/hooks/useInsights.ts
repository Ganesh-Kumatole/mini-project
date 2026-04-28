import { useMemo, useState, useEffect, useRef } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';
import {
  generateFinancialInsights,
  AIInsightsResult,
  FinancialStats,
} from '@/services/ai/huggingface';
import { getBudgetPercentage } from '@/types/budget';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CategoryTotal {
  name: string;
  amount: number;
}

export interface BudgetHealth {
  id: string;
  category: string;
  spentAmount: number;
  limitAmount: number;
  percentUsed: number;
}

export interface MonthlyTrend {
  /** "YYYY-MM" label */
  month: string;
  income: number;
  expense: number;
}

export interface AnomalyTransaction {
  description: string;
  amount: number;
  category: string;
  date: Date;
  /** how many σ above the category average */
  sigmasAbove: number;
  categoryAvg: number;
}

export interface RecurringExpense {
  description: string;
  /** normalized key used for matching */
  key: string;
  amount: number;
  category: string;
  /** how many months it appeared in */
  occurrences: number;
}

export interface ComputedInsights {
  /** Current month total income */
  currentIncome: number;
  /** Current month total expense */
  currentExpense: number;
  /** (income - expense) / income * 100, clamped to [0, 100] */
  savingsRate: number;
  /** % change in spending vs previous month (positive = increased) */
  monthOverMonthChange: number | null;
  /** Top spending categories this month, sorted desc, max 5 */
  topCategories: CategoryTotal[];
  /** Live budget health for all budgets, sorted by percentUsed desc */
  budgetHealth: BudgetHealth[];
  /** Budget lines at or above 80% */
  budgetAlerts: BudgetHealth[];
  /** Largest single expense transaction this month */
  biggestExpense: { description: string; amount: number; category: string } | null;

  // ── NEW fields ──────────────────────────────────────────────────────────────
  /** Last 6 months income + expense for sparklines / MoM chart */
  monthlyTrend: MonthlyTrend[];
  /** Projected total spend at month-end based on current daily burn */
  projectedMonthlySpend: number;
  /** Days elapsed in current month (1-based) */
  daysElapsed: number;
  /** Total calendar days in current month */
  daysInMonth: number;
  /** Transactions this month whose amount is unusually high for their category */
  anomalies: AnomalyTransaction[];
  /** Expenses by weekday vs weekend, as % of total */
  weekdaySpend: number;
  weekendSpend: number;
  weekdayPct: number;
  weekendPct: number;
  /** Detected recurring expenses (appeared ≥ 2 of last 3 months) */
  recurringExpenses: RecurringExpense[];
  /** Total estimated monthly fixed cost from recurring expenses */
  recurringTotal: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);

const normalizeKey = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\d+/g, '#');

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useInsights = () => {
  const { transactions, loading: loadingT } = useTransactions();
  const { budgets, loading: loadingB } = useBudgets();

  const [aiResult, setAiResult] = useState<AIInsightsResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const lastStatsKey = useRef<string>('');

  // ── 1. All computations in one useMemo ───────────────────────────────────

  const computed = useMemo<ComputedInsights>(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const prevMonthStart = startOfPrevMonth(now);
    const prevMonthEnd = endOfPrevMonth(now);

    // ── Date helpers ──
    const daysElapsed = now.getDate(); // 1-based
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // ── Partition transactions ──
    const thisMonth = transactions.filter((t) => new Date(t.date) >= thisMonthStart);
    const prevMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });

    // ── Totals ──
    const currentIncome = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const currentExpense = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevExpense = prevMonth
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    // ── Savings rate ──
    const savingsRate =
      currentIncome > 0
        ? Math.min(Math.max(((currentIncome - currentExpense) / currentIncome) * 100, 0), 100)
        : 0;

    // ── MoM change ──
    const monthOverMonthChange =
      prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : null;

    // ── Top categories (this month) ──
    const catMap = new Map<string, number>();
    thisMonth
      .filter((t) => t.type === 'expense')
      .forEach((t) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount));

    const topCategories: CategoryTotal[] = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // ── Budget health (live from transactions) ──
    const budgetHealth: BudgetHealth[] = budgets
      .map((b) => {
        const budgetStart = new Date(b.startDate);
        const budgetEnd = new Date(b.endDate);
        const liveSpent = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category === b.category &&
              new Date(t.date) >= budgetStart &&
              new Date(t.date) <= budgetEnd,
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const limit = b.limitAmount ?? 0;
        return {
          id: b.id,
          category: b.category,
          spentAmount: liveSpent,
          limitAmount: limit,
          percentUsed: getBudgetPercentage(liveSpent, limit),
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed);

    const budgetAlerts = budgetHealth.filter((b) => b.percentUsed >= 80);

    // ── Biggest expense ──
    const expenses = thisMonth
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount);

    const biggestExpense =
      expenses.length > 0
        ? { description: expenses[0].description, amount: expenses[0].amount, category: expenses[0].category }
        : null;

    // ── NEW: Monthly trend (last 6 months) ───────────────────────────────────
    const byMonth = new Map<string, { income: number; expense: number }>();
    const keyFor = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    transactions.forEach((t) => {
      const key = keyFor(new Date(t.date));
      const prev = byMonth.get(key) ?? { income: 0, expense: 0 };
      if (t.type === 'income') prev.income += t.amount;
      else prev.expense += t.amount;
      byMonth.set(key, prev);
    });

    const monthlyTrend: MonthlyTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = keyFor(d);
      const entry = byMonth.get(key) ?? { income: 0, expense: 0 };
      monthlyTrend.push({ month: key, income: entry.income, expense: entry.expense });
    }

    // ── NEW: Projected month-end spend ───────────────────────────────────────
    const dailyBurnRate = daysElapsed > 0 ? currentExpense / daysElapsed : 0;
    const projectedMonthlySpend = dailyBurnRate * daysInMonth;

    // ── NEW: Anomaly detection ────────────────────────────────────────────────
    // Per-category: compute mean + stddev across ALL transactions (not just this month)
    const catStats = new Map<string, { amounts: number[] }>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!catStats.has(t.category)) catStats.set(t.category, { amounts: [] });
        catStats.get(t.category)!.amounts.push(t.amount);
      });

    const anomalies: AnomalyTransaction[] = [];
    thisMonth
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const stats = catStats.get(t.category);
        if (!stats || stats.amounts.length < 3) return; // need enough data
        const mean = stats.amounts.reduce((s, v) => s + v, 0) / stats.amounts.length;
        const variance =
          stats.amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / stats.amounts.length;
        const stddev = Math.sqrt(variance);
        if (stddev === 0) return;
        const sigmas = (t.amount - mean) / stddev;
        if (sigmas >= 1.8) {
          anomalies.push({
            description: t.description,
            amount: t.amount,
            category: t.category,
            date: new Date(t.date),
            sigmasAbove: sigmas,
            categoryAvg: mean,
          });
        }
      });
    anomalies.sort((a, b) => b.sigmasAbove - a.sigmasAbove);

    // ── NEW: Weekday vs Weekend split ─────────────────────────────────────────
    let weekdaySpend = 0;
    let weekendSpend = 0;
    thisMonth
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const dow = new Date(t.date).getDay(); // 0=Sun, 6=Sat
        if (dow === 0 || dow === 6) weekendSpend += t.amount;
        else weekdaySpend += t.amount;
      });
    const totalSpend = weekdaySpend + weekendSpend;
    const weekdayPct = totalSpend > 0 ? (weekdaySpend / totalSpend) * 100 : 0;
    const weekendPct = totalSpend > 0 ? (weekendSpend / totalSpend) * 100 : 0;

    // ── NEW: Recurring expense detection ─────────────────────────────────────
    // Group expenses by normalised description key, per calendar month
    const recurMap = new Map<string, Map<string, { amounts: number[]; category: string; original: string }>>();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const txDate = new Date(t.date);
        const monthKey = keyFor(txDate);
        const normKey = normalizeKey(t.description);
        if (!recurMap.has(normKey)) recurMap.set(normKey, new Map());
        const monthMap = recurMap.get(normKey)!;
        if (!monthMap.has(monthKey)) monthMap.set(monthKey, { amounts: [], category: t.category, original: t.description });
        monthMap.get(monthKey)!.amounts.push(t.amount);
      });

    // Only last 3 calendar months
    const last3Months = new Set(
      [0, 1, 2].map((i) => keyFor(new Date(now.getFullYear(), now.getMonth() - i, 1)))
    );

    const recurringExpenses: RecurringExpense[] = [];
    recurMap.forEach((monthMap, normKey) => {
      const relevantMonths = [...monthMap.keys()].filter((m) => last3Months.has(m));
      if (relevantMonths.length < 2) return; // must appear in at least 2 of last 3 months

      // Compute average amount across months
      let totalAmt = 0;
      let count = 0;
      let category = '';
      let original = '';
      relevantMonths.forEach((m) => {
        const entry = monthMap.get(m)!;
        const avg = entry.amounts.reduce((s, v) => s + v, 0) / entry.amounts.length;
        totalAmt += avg;
        count++;
        category = entry.category;
        original = entry.original;
      });

      recurringExpenses.push({
        description: original,
        key: normKey,
        amount: totalAmt / count,
        category,
        occurrences: relevantMonths.length,
      });
    });
    recurringExpenses.sort((a, b) => b.amount - a.amount);

    const recurringTotal = recurringExpenses.reduce((s, r) => s + r.amount, 0);

    return {
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
    };
  }, [transactions, budgets]);

  // ── 2. Fetch AI insights on data change ──────────────────────────────────

  useEffect(() => {
    if (loadingT || loadingB) return;
    if (transactions.length === 0 && budgets.length === 0) return;

    const stats: FinancialStats = {
      totalIncome: computed.currentIncome,
      totalExpense: computed.currentExpense,
      savingsRate: computed.savingsRate,
      monthOverMonthChange: computed.monthOverMonthChange ?? 0,
      topCategories: computed.topCategories,
      budgetAlerts: computed.budgetAlerts.map((b) => ({ category: b.category, percentUsed: b.percentUsed })),
      biggestExpense: computed.biggestExpense,
    };

    const key = JSON.stringify(stats);
    if (key === lastStatsKey.current) return;
    lastStatsKey.current = key;

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);

    generateFinancialInsights(stats)
      .then((result) => { if (!cancelled) { setAiResult(result); setAiLoading(false); } })
      .catch((err: Error) => { if (!cancelled) { console.error('useInsights AI error:', err); setAiError(err.message); setAiLoading(false); } });

    return () => { cancelled = true; };
  }, [computed, loadingT, loadingB, transactions.length, budgets.length]);

  // ── 3. Manual refresh ────────────────────────────────────────────────────

  const refreshAI = () => {
    lastStatsKey.current = '';
    setAiResult(null);
    setAiLoading(true);
    setAiError(null);

    const stats: FinancialStats = {
      totalIncome: computed.currentIncome,
      totalExpense: computed.currentExpense,
      savingsRate: computed.savingsRate,
      monthOverMonthChange: computed.monthOverMonthChange ?? 0,
      topCategories: computed.topCategories,
      budgetAlerts: computed.budgetAlerts.map((b) => ({ category: b.category, percentUsed: b.percentUsed })),
      biggestExpense: computed.biggestExpense,
    };

    generateFinancialInsights(stats)
      .then(setAiResult)
      .catch((err: Error) => setAiError(err.message))
      .finally(() => setAiLoading(false));
  };

  return {
    computed,
    aiSummary: aiResult?.summary ?? null,
    aiTips: aiResult?.tips ?? [],
    loading: loadingT || loadingB,
    aiLoading,
    aiError,
    refreshAI,
  };
};

export default useInsights;
