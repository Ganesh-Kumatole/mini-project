import { useMemo, useState, useEffect, useRef } from 'react';
import { useTransactions } from '@/pages/transactions/hooks/useTransactions';
import { useBudgets } from '@/pages/budgets/hooks/useBudgets';
import {
  generateFinancialInsights,
  AIInsightsResult,
  FinancialStats,
} from '@/services/ai/huggingface';
import { getBudgetPercentage } from '@/pages/budgets/types';
import {
  CategoryTotal,
  BudgetHealth,
  MonthlyTrend,
  AnomalyTransaction,
  RecurringExpense,
  ComputedInsights,
} from '../types/insights';

// Date utilities for filtering and grouping transactions

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);

const normalizeKey = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\d+/g, '#');

// Custom hook for generating financial insights and AI recommendations

export const useInsights = () => {
  const { transactions, loading: loadingT } = useTransactions();
  const { budgets, loading: loadingB } = useBudgets();

  const [aiResult, setAiResult] = useState<AIInsightsResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const lastStatsKey = useRef<string>('');

  // 1. Core Data Computation
  // All heavy data processing is memoized to prevent unnecessary recalculations.
  const computed = useMemo<ComputedInsights>(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const prevMonthStart = startOfPrevMonth(now);
    const prevMonthEnd = endOfPrevMonth(now);

    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Partition transactions by time window
    const thisMonth = transactions.filter((t: any) => new Date(t.date) >= thisMonthStart);
    const prevMonth = transactions.filter((t: any) => {
      const d = new Date(t.date);
      return d >= prevMonthStart && d <= prevMonthEnd;
    });

    const currentIncome = thisMonth
      .filter((t: any) => t.type === 'income')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const currentExpense = thisMonth
      .filter((t: any) => t.type === 'expense')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const prevExpense = prevMonth
      .filter((t: any) => t.type === 'expense')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const savingsRate =
      currentIncome > 0
        ? Math.min(Math.max(((currentIncome - currentExpense) / currentIncome) * 100, 0), 100)
        : 0;

    const monthOverMonthChange =
      prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : null;

    // Aggregate category totals
    const catMap = new Map<string, number>();
    thisMonth
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount));

    const topCategories: CategoryTotal[] = [...catMap.entries()]
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Evaluate real-time budget utilization
    const budgetHealth: BudgetHealth[] = budgets
      .map((b: any) => {
        const budgetStart = new Date(b.startDate);
        const budgetEnd = new Date(b.endDate);
        const liveSpent = transactions
          .filter(
            (t: any) =>
              t.type === 'expense' &&
              t.category === b.category &&
              new Date(t.date) >= budgetStart &&
              new Date(t.date) <= budgetEnd,
          )
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const limit = b.limitAmount ?? 0;
        return {
          id: b.id,
          category: b.category,
          spentAmount: liveSpent,
          limitAmount: limit,
          percentUsed: getBudgetPercentage(liveSpent, limit),
        };
      })
      .sort((a: any, b: any) => b.percentUsed - a.percentUsed);

    const budgetAlerts = budgetHealth.filter((b: any) => b.percentUsed >= 80);

    const expenses = thisMonth
      .filter((t: any) => t.type === 'expense')
      .sort((a: any, b: any) => b.amount - a.amount);

    const biggestExpense =
      expenses.length > 0
        ? { description: expenses[0].description, amount: expenses[0].amount, category: expenses[0].category }
        : null;

    // Track rolling 6-month historical trend
    const byMonth = new Map<string, { income: number; expense: number }>();
    const keyFor = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    transactions.forEach((t: any) => {
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

    const dailyBurnRate = daysElapsed > 0 ? currentExpense / daysElapsed : 0;
    const projectedMonthlySpend = dailyBurnRate * daysInMonth;

    // Anomaly Detection: statistical outlier identification based on standard deviation
    const catStats = new Map<string, { amounts: number[] }>();
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        if (!catStats.has(t.category)) catStats.set(t.category, { amounts: [] });
        catStats.get(t.category)!.amounts.push(t.amount);
      });

    const anomalies: AnomalyTransaction[] = [];
    thisMonth
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const stats = catStats.get(t.category);
        if (!stats || stats.amounts.length < 3) return;
        const mean = stats.amounts.reduce((s: number, v: any) => s + v, 0) / stats.amounts.length;
        const variance =
          stats.amounts.reduce((s: number, v: any) => s + (v - mean) ** 2, 0) / stats.amounts.length;
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
    anomalies.sort((a: any, b: any) => b.sigmasAbove - a.sigmasAbove);

    // Behavioral breakdown: Weekday vs. Weekend
    let weekdaySpend = 0;
    let weekendSpend = 0;
    thisMonth
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const dow = new Date(t.date).getDay();
        if (dow === 0 || dow === 6) weekendSpend += t.amount;
        else weekdaySpend += t.amount;
      });
    const totalSpend = weekdaySpend + weekendSpend;
    const weekdayPct = totalSpend > 0 ? (weekdaySpend / totalSpend) * 100 : 0;
    const weekendPct = totalSpend > 0 ? (weekendSpend / totalSpend) * 100 : 0;

    // Subscriptions/Recurring Detection: Requires persistence across recent months
    const recurMap = new Map<string, Map<string, { amounts: number[]; category: string; original: string }>>();

    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const txDate = new Date(t.date);
        const monthKey = keyFor(txDate);
        const normKey = normalizeKey(t.description);
        if (!recurMap.has(normKey)) recurMap.set(normKey, new Map());
        const monthMap = recurMap.get(normKey)!;
        if (!monthMap.has(monthKey)) monthMap.set(monthKey, { amounts: [], category: t.category, original: t.description });
        monthMap.get(monthKey)!.amounts.push(t.amount);
      });

    const last3Months = new Set(
      [0, 1, 2].map((i) => keyFor(new Date(now.getFullYear(), now.getMonth() - i, 1)))
    );

    const recurringExpenses: RecurringExpense[] = [];
    recurMap.forEach((monthMap, normKey) => {
      const relevantMonths = [...monthMap.keys()].filter((m: any) => last3Months.has(m));
      if (relevantMonths.length < 2) return;

      let totalAmt = 0;
      let count = 0;
      let category = '';
      let original = '';
      relevantMonths.forEach((m: any) => {
        const entry = monthMap.get(m)!;
        const avg = entry.amounts.reduce((s: number, v: any) => s + v, 0) / entry.amounts.length;
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
    recurringExpenses.sort((a: any, b: any) => b.amount - a.amount);

    const recurringTotal = recurringExpenses.reduce((s: number, r: any) => s + r.amount, 0);

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

  // 2. Automated AI Recommendations Engine
  // Triggers request to HuggingFace whenever core data changes substantively
  useEffect(() => {
    if (loadingT || loadingB) return;
    if (transactions.length === 0 && budgets.length === 0) return;

    const stats: FinancialStats = {
      totalIncome: computed.currentIncome,
      totalExpense: computed.currentExpense,
      savingsRate: computed.savingsRate,
      monthOverMonthChange: computed.monthOverMonthChange ?? 0,
      topCategories: computed.topCategories,
      budgetAlerts: computed.budgetAlerts.map((b: any) => ({ category: b.category, percentUsed: b.percentUsed })),
      biggestExpense: computed.biggestExpense,
    };

    const key = JSON.stringify(stats);
    if (key === lastStatsKey.current) return;
    lastStatsKey.current = key;

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);

    generateFinancialInsights(stats)
      .then((result: any) => { if (!cancelled) { setAiResult(result); setAiLoading(false); } })
      .catch((err: Error) => { if (!cancelled) { console.error('useInsights AI error:', err); setAiError(err.message); setAiLoading(false); } });

    return () => { cancelled = true; };
  }, [computed, loadingT, loadingB, transactions.length, budgets.length]);

  // 3. User-Initiated Analysis Refresh
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
      budgetAlerts: computed.budgetAlerts.map((b: any) => ({ category: b.category, percentUsed: b.percentUsed })),
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
