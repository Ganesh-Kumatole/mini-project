import { useMemo } from 'react';
import { useTransactions } from '@/pages/transactions/hooks/useTransactions';
import { useInsightsPage } from '@/pages/insights/hooks/useInsightsPage';

export const useDashboardMetrics = () => {
  const { transactions } = useTransactions();
  const { computed } = useInsightsPage();

  const metrics = useMemo(() => {
    const now = new Date();
    const currentMnt = now.getMonth();
    const currentYr = now.getFullYear();

    const lastMnt = currentMnt === 0 ? 11 : currentMnt - 1;
    const lastMntYr = currentMnt === 0 ? currentYr - 1 : currentYr;

    const currentMntTransactions = transactions.filter(
      (t: any) =>
        new Date(t.date).getMonth() === currentMnt &&
        new Date(t.date).getFullYear() === currentYr,
    );

    const lastMonthTransactions = transactions.filter(
      (t: any) =>
        new Date(t.date).getMonth() === lastMnt &&
        new Date(t.date).getFullYear() === lastMntYr,
    );

    const income = currentMntTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const expense = currentMntTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const savingsRate =
      income > 0
        ? ((income - expense) / income) * 100
        : expense > 0
          ? -100
          : 0;

    const expenseLastMonth = lastMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((s: number, t: any) => s + t.amount, 0);

    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const pct = ((curr - prev) / prev) * 100;
      return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}% vs last mo`;
    };

    const momDisplay = calculateChange(expense, expenseLastMonth);
    const momColor =
      expense > expenseLastMonth ? 'text-red-500' : 'text-emerald-500';

    return {
      currentMonthMetrics: {
        income,
        expense,
        savingsRate,
      },
      momDisplay,
      momColor,
    };
  }, [transactions]);

  const budgetHealth = computed?.budgetHealth || [];
  const totalLimit = budgetHealth.reduce((sum: number, b: any) => sum + b.limitAmount, 0);
  const totalSpent = budgetHealth.reduce((sum: number, b: any) => sum + b.spentAmount, 0);
  const budgetUsedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return {
    ...metrics,
    budgetUsedPct,
    budgetHealth,
  };
};
