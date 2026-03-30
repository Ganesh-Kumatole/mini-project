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
  /** Budget lines at or above their notification threshold */
  budgetAlerts: BudgetHealth[];
  /** Largest single expense transaction this month */
  biggestExpense: { description: string; amount: number; category: string } | null;
}

// ── Helper ───────────────────────────────────────────────────────────────────

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useInsights = () => {
  const { transactions, loading: loadingT } = useTransactions();
  const { budgets, loading: loadingB } = useBudgets();

  const [aiResult, setAiResult] = useState<AIInsightsResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Track the serialised key of stats we last sent to AI to avoid duplicate calls
  const lastStatsKey = useRef<string>('');

  // ── 1. Compute local insights (synchronous, instant) ─────────────────────

  const computed = useMemo<ComputedInsights>(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const prevMonthStart = startOfPrevMonth(now);
    const prevMonthEnd = endOfPrevMonth(now);

    const thisMonth = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart
    );
    const prevMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });

    // Totals
    const currentIncome = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const currentExpense = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevExpense = prevMonth
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    // Savings rate
    const savingsRate =
      currentIncome > 0
        ? Math.min(
            Math.max(
              ((currentIncome - currentExpense) / currentIncome) * 100,
              0
            ),
            100
          )
        : 0;

    // Month-over-month change in spending
    const monthOverMonthChange =
      prevExpense > 0
        ? ((currentExpense - prevExpense) / prevExpense) * 100
        : null;

    // Top categories
    const catMap = new Map<string, number>();
    thisMonth
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
      });

    const topCategories: CategoryTotal[] = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Budget health — compute spentAmount live from transactions instead of
    // trusting the denormalized b.spentAmount field (which is only updated via
    // the app's own write path and is always 0 for seeded data).
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

    // Biggest single expense
    const expenses = thisMonth
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount);

    const biggestExpense =
      expenses.length > 0
        ? {
            description: expenses[0].description,
            amount: expenses[0].amount,
            category: expenses[0].category,
          }
        : null;

    return {
      currentIncome,
      currentExpense,
      savingsRate,
      monthOverMonthChange,
      topCategories,
      budgetHealth,
      budgetAlerts,
      biggestExpense,
    };
  }, [transactions, budgets]);

  // ── 2. Fetch AI insights whenever computed data changes ───────────────────

  useEffect(() => {
    if (loadingT || loadingB) return;
    if (transactions.length === 0 && budgets.length === 0) return;

    const stats: FinancialStats = {
      totalIncome: computed.currentIncome,
      totalExpense: computed.currentExpense,
      savingsRate: computed.savingsRate,
      monthOverMonthChange: computed.monthOverMonthChange ?? 0,
      topCategories: computed.topCategories,
      budgetAlerts: computed.budgetAlerts.map((b) => ({
        category: b.category,
        percentUsed: b.percentUsed,
      })),
      biggestExpense: computed.biggestExpense,
    };

    // Serialise to detect real changes and avoid refetching on unrelated renders
    const key = JSON.stringify(stats);
    if (key === lastStatsKey.current) return;
    lastStatsKey.current = key;

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);

    generateFinancialInsights(stats)
      .then((result) => {
        if (!cancelled) {
          setAiResult(result);
          setAiLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('useInsights AI error:', err);
          setAiError(err.message);
          setAiLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [computed, loadingT, loadingB, transactions.length, budgets.length]);

  // ── 3. Manual refresh ─────────────────────────────────────────────────────

  const refreshAI = () => {
    lastStatsKey.current = ''; // Force re-fetch on next render
    setAiResult(null);
    setAiLoading(true);
    setAiError(null);

    const stats: FinancialStats = {
      totalIncome: computed.currentIncome,
      totalExpense: computed.currentExpense,
      savingsRate: computed.savingsRate,
      monthOverMonthChange: computed.monthOverMonthChange ?? 0,
      topCategories: computed.topCategories,
      budgetAlerts: computed.budgetAlerts.map((b) => ({
        category: b.category,
        percentUsed: b.percentUsed,
      })),
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
