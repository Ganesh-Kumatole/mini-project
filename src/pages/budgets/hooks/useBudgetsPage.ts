import { useState, useMemo, useEffect } from 'react';
import { useBudgets } from './useBudgets';
import { useTransactions } from '@/pages/transactions/hooks/useTransactions'; // using new module
import useNotifications from '@/shared/hooks/useNotifications';
import { useToastContext } from '@/shared/context';
import { Budget, BudgetPeriod } from '../types/budget';
import { getBudgetPercentage, shouldNotify } from '../types/budget';
import { useCurrencyContext } from '@/shared/context';

export type PeriodFilter = 'all' | BudgetPeriod;

export const useBudgetsPage = () => {
  const { formatAmount } = useCurrencyContext();
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { createNotification } = useNotifications();
  const { addToast } = useToastContext();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // Calculate per-budget spent amount
  const spentByBudget = useMemo(() => {
    const map: Record<string, number> = {};
    for (const budget of budgets) {
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      map[budget.id] = transactions.reduce((sum, tx) => {
        const d = new Date(tx.date);
        if (
          tx.category === budget.category &&
          tx.type === 'expense' &&
          d >= start &&
          d <= end
        ) {
          return sum + tx.amount;
        }
        return sum;
      }, 0);
    }
    return map;
  }, [budgets, transactions]);

  // Overall summary statistics
  const totalLimit = useMemo(() => budgets.reduce((sum, b) => sum + b.limitAmount, 0), [budgets]);
  const totalSpent = useMemo(() => Object.values(spentByBudget).reduce((sum, v) => sum + v, 0), [spentByBudget]);
  
  const overBudgetCount = useMemo(
    () => budgets.filter((b) => (spentByBudget[b.id] || 0) > b.limitAmount).length,
    [budgets, spentByBudget]
  );

  // Budgets filtered by selected period
  const filteredBudgets = useMemo(
    () => (periodFilter === 'all' ? budgets : budgets.filter((b) => b.period === periodFilter)),
    [budgets, periodFilter]
  );

  const budgetUsagePercent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  // Background budget notifications checking
  useEffect(() => {
    if (!budgets.length || !transactions.length) return;
    
    const checkNotifications = async () => {
      for (const budget of budgets) {
        const spent = spentByBudget[budget.id] || 0;
        const percentage = getBudgetPercentage(spent, budget.limitAmount);
        
        if (
          shouldNotify(
            percentage,
            budget.notificationThreshold,
            budget.notificationSent,
            budget.lastNotificationDate
          )
        ) {
          try {
            await createNotification({
              type: percentage > 100 ? 'budget_exceeded' : 'budget_warning',
              title: `Budget Alert: ${budget.category}`,
              message: `You've used ${percentage}% of your ${budget.category} budget (${formatAmount(spent)} of ${formatAmount(budget.limitAmount)})`,
              actionUrl: '/budgets',
              metadata: {
                budgetId: budget.id,
                category: budget.category,
                percentageUsed: percentage,
              },
            });
            await updateBudget({
              id: budget.id,
              notificationSent: true,
              lastNotificationDate: new Date(),
              spentAmount: spent,
            });
            addToast({
              type: 'warning',
              title: 'Budget Alert',
              message: `${budget.category} budget is ${percentage}% used`,
            });
          } catch (error) {
            console.error('Failed to trigger budget notification', error);
          }
        }
      }
    };
    
    checkNotifications();
  }, [budgets, transactions, spentByBudget, createNotification, updateBudget, addToast, formatAmount]);

  // Event handlers
  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setShowEditModal(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setDeletingBudget(budget);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    setDeleteLoading(true);
    try {
      await deleteBudget(deletingBudget.id);
      addToast({
        type: 'success',
        title: 'Budget deleted',
        message: `${deletingBudget.category} budget removed.`,
      });
      setDeletingBudget(null);
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete budget.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = async (data: Partial<Budget> & { id: string }) => {
    await updateBudget(data);
    addToast({
      type: 'success',
      title: 'Budget updated',
      message: 'Changes saved successfully.',
    });
  };

  const handleViewDetails = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  return {
    budgets,
    filteredBudgets,
    transactions,
    spentByBudget,
    totalLimit,
    totalSpent,
    budgetUsagePercent,
    overBudgetCount,
    loading,
    periodFilter,
    setPeriodFilter,
    showAddModal,
    setShowAddModal,
    showDetailsModal,
    setShowDetailsModal,
    selectedBudget,
    setSelectedBudget,
    showEditModal,
    setShowEditModal,
    editingBudget,
    setEditingBudget,
    deletingBudget,
    setDeletingBudget,
    deleteLoading,
    createBudget,
    handleEditClick,
    handleDeleteClick,
    handleConfirmDelete,
    handleSaveEdit,
    handleViewDetails,
    formatAmount,
  };
};
