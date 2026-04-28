import { useMemo, useEffect, useState } from 'react';
import { useBudgets, useTransactions } from '@/hooks';
import useNotifications from '@/hooks/useNotifications';
import { useToastContext } from '@/context/ToastContext';
import { useCurrencyContext } from '@/context/CurrencyContext';
import { getBudgetPercentage, shouldNotify } from '@/types/budget';
import { Budget, BudgetPeriod, NotificationThreshold } from '@/types';
import { AddBudgetModal, BudgetDetailsModal } from './index';

// ── Category icon map ──────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': 'restaurant',
  Transportation: 'directions_car',
  Utilities: 'bolt',
  Entertainment: 'movie',
  Healthcare: 'local_hospital',
  Shopping: 'shopping_bag',
  Education: 'school',
  'Housing & Rent': 'home',
  'Personal Care': 'self_improvement',
  Travel: 'flight',
  Subscriptions: 'subscriptions',
  'Fitness & Wellness': 'fitness_center',
  'Gifts & Donations': 'card_giftcard',
  Insurance: 'health_and_safety',
  'Taxes & Fees': 'receipt_long',
  Other: 'category',
};
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-500',
  Transportation: 'bg-blue-500',
  Utilities: 'bg-yellow-500',
  Entertainment: 'bg-purple-500',
  Healthcare: 'bg-red-500',
  Shopping: 'bg-pink-500',
  Education: 'bg-teal-500',
  'Housing & Rent': 'bg-lime-500',
  'Personal Care': 'bg-rose-400',
  Travel: 'bg-cyan-500',
  Subscriptions: 'bg-violet-500',
  'Fitness & Wellness': 'bg-emerald-500',
  'Gifts & Donations': 'bg-amber-400',
  Insurance: 'bg-sky-500',
  'Taxes & Fees': 'bg-slate-500',
  Other: 'bg-gray-500',
};

// ── Edit Budget Modal ──────────────────────────────────────────────────────────
const EditBudgetModal = ({
  isOpen,
  onClose,
  budget,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSave: (data: Partial<Budget> & { id: string }) => Promise<void>;
}) => {
  const { symbol } = useCurrencyContext();
  const [limitAmount, setLimitAmount] = useState('');
  const [notificationThreshold, setNotificationThreshold] =
    useState<NotificationThreshold>(75);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (budget) {
      setLimitAmount(String(budget.limitAmount));
      setNotificationThreshold(
        budget.notificationThreshold as NotificationThreshold,
      );
      setPeriod(budget.period as BudgetPeriod);
      setSaveError(null);
    }
  }, [budget, isOpen]);

  if (!isOpen || !budget) return null;

  const handleSave = async () => {
    const amount = Number(limitAmount);
    if (!amount || amount <= 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        id: budget.id,
        limitAmount: amount,
        notificationThreshold,
        period,
      });
      onClose();
    } catch (e: any) {
      console.error('[EditBudget] save failed:', e);
      setSaveError(e?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Edit Budget
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              {budget.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons text-gray-400">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
              Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark font-medium">
                {symbol}
              </span>
              <input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-2.5 border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
              Alert Threshold
            </label>
            <div className="flex gap-3">
              {[50, 75, 90].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setNotificationThreshold(t as NotificationThreshold)
                  }
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    notificationThreshold === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-indigo-400'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
              className="w-full px-3 py-2.5 border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {saveError && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <span className="material-icons text-red-500 text-sm mt-0.5">
              error_outline
            </span>
            <p className="text-xs text-red-700 dark:text-red-300">
              {saveError}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !limitAmount || Number(limitAmount) <= 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving && (
              <span className="material-icons text-base animate-spin">
                refresh
              </span>
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
const DeleteBudgetModal = ({
  isOpen,
  category,
  onConfirm,
  onCancel,
  loading,
}: {
  isOpen: boolean;
  category: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40">
            <span className="material-icons text-red-500 text-xl">
              delete_forever
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Delete Budget?
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {category}
            </p>
          </div>
        </div>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-5">
          This will permanently delete the <strong>{category}</strong> budget.
          Your transactions will not be affected.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading && (
              <span className="material-icons text-base animate-spin">
                refresh
              </span>
            )}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
type PeriodFilter = 'all' | BudgetPeriod;

export const Budgets = () => {
  const { formatAmount } = useCurrencyContext();
  const { budgets, loading, createBudget, updateBudget, deleteBudget } =
    useBudgets();
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

  // ── Computed per-budget spent ──
  const spentByBudget = useMemo(() => {
    const map: Record<string, number> = {};
    for (const budget of budgets) {
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      map[budget.id] = transactions.reduce((s, t) => {
        const d = new Date(t.date);
        if (
          t.category === budget.category &&
          t.type === 'expense' &&
          d >= start &&
          d <= end
        )
          return s + t.amount;
        return s;
      }, 0);
    }
    return map;
  }, [budgets, transactions]);

  // ── Summary stats ──
  const totalLimit = useMemo(
    () => budgets.reduce((s, b) => s + b.limitAmount, 0),
    [budgets],
  );
  const totalSpent = useMemo(
    () => Object.values(spentByBudget).reduce((s, v) => s + v, 0),
    [spentByBudget],
  );
  const overBudgetCount = useMemo(
    () =>
      budgets.filter((b) => (spentByBudget[b.id] || 0) > b.limitAmount).length,
    [budgets, spentByBudget],
  );

  // ── Period-filtered budgets ──
  const filteredBudgets = useMemo(
    () =>
      periodFilter === 'all'
        ? budgets
        : budgets.filter((b) => b.period === periodFilter),
    [budgets, periodFilter],
  );

  // ── Budget notifications ──
  useEffect(() => {
    if (!budgets.length || !transactions.length) return;
    const check = async () => {
      for (const budget of budgets) {
        const spent = spentByBudget[budget.id] || 0;
        const percentage = getBudgetPercentage(spent, budget.limitAmount);
        if (
          shouldNotify(
            percentage,
            budget.notificationThreshold,
            budget.notificationSent,
            budget.lastNotificationDate,
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
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    check();
  }, [
    budgets,
    transactions,
    spentByBudget,
    createNotification,
    updateBudget,
    addToast,
    formatAmount,
  ]);

  // ── Handlers ──
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

  const budgetUsagePercent =
    totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            id="budgets-heading"
            className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
          >
            Budget Management
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} ·{' '}
            {overBudgetCount > 0
              ? `${overBudgetCount} over limit`
              : 'All within limits'}
          </p>
        </div>
        <button
          id="budgets-add-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <span className="material-icons text-base">add</span>
          Add Budget
        </button>
      </div>

      {/* ── Summary Banner ────────────────────────────────────────── */}
      {budgets.length > 0 && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Total Limit
              </p>
              <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                {formatAmount(totalLimit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Total Spent
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${budgetUsagePercent > 90 ? 'text-red-500' : 'text-text-primary-light dark:text-text-primary-dark'}`}
              >
                {formatAmount(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Remaining
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatAmount(Math.max(totalLimit - totalSpent, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Overall Usage
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${budgetUsagePercent > 90 ? 'text-red-500' : budgetUsagePercent > 70 ? 'text-amber-500' : 'text-text-primary-light dark:text-text-primary-dark'}`}
              >
                {budgetUsagePercent.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${budgetUsagePercent > 90 ? 'bg-red-500' : budgetUsagePercent > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
          {overBudgetCount > 0 && (
            <div className="flex items-center gap-2 mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <span className="material-icons text-red-500 text-sm">
                warning
              </span>
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                {overBudgetCount} budget{overBudgetCount !== 1 ? 's' : ''}{' '}
                exceeded — review your spending.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Period Tabs ───────────────────────────────────────────── */}
      {budgets.length > 0 && (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 border border-border-light dark:border-border-dark w-fit">
          {(['all', 'monthly', 'weekly', 'yearly'] as PeriodFilter[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  periodFilter === p
                    ? 'bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark shadow-sm'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                }`}
              >
                {p === 'all' ? 'All' : p[0].toUpperCase() + p.slice(1)}
                {p !== 'all' && (
                  <span className="ml-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                    {budgets.filter((b) => b.period === p).length}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      )}

      {/* ── Budget Cards ──────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="material-icons text-3xl text-indigo-400">
              savings
            </span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {periodFilter === 'all'
                ? 'No budgets yet'
                : `No ${periodFilter} budgets`}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {periodFilter === 'all'
                ? 'Create your first budget to start tracking.'
                : 'Try a different period filter.'}
            </p>
          </div>
          {periodFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <span className="material-icons text-base">add</span>
              Add Your First Budget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const spent = spentByBudget[budget.id] || 0;
            const percentage = getBudgetPercentage(spent, budget.limitAmount);
            const isNearLimit = percentage >= budget.notificationThreshold;
            const isExceeded = percentage > 100;
            const barColor = isExceeded
              ? 'bg-red-500'
              : isNearLimit
                ? 'bg-amber-400'
                : 'bg-emerald-500';
            const icon = CATEGORY_ICONS[budget.category] || 'category';
            const iconBg = CATEGORY_COLORS[budget.category] || 'bg-gray-500';

            return (
              <div
                key={budget.id}
                className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  isExceeded
                    ? 'border-red-300 dark:border-red-700/60'
                    : isNearLimit
                      ? 'border-amber-300 dark:border-amber-700/60'
                      : 'border-border-light dark:border-border-dark'
                }`}
              >
                {/* Card header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="material-icons text-white text-lg">
                          {icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark leading-tight">
                          {budget.category}
                        </h3>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">
                          {budget.period}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExceeded && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      {isNearLimit && !isExceeded && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        Spent
                      </span>
                      <span
                        className={`font-semibold ${isExceeded ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-text-primary-light dark:text-text-primary-dark'}`}
                      >
                        {formatAmount(spent)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      <span>{formatAmount(budget.limitAmount)} limit</span>
                      <span
                        className={`font-semibold ${isExceeded ? 'text-red-500' : isNearLimit ? 'text-amber-500' : ''}`}
                      >
                        {percentage}% used
                      </span>
                    </div>
                  </div>

                  {/* Alert */}
                  {isNearLimit && (
                    <div
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-3 ${
                        isExceeded
                          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <span
                        className={`material-icons text-sm mt-0.5 ${isExceeded ? 'text-red-500' : 'text-amber-500'}`}
                      >
                        warning
                      </span>
                      <p
                        className={`text-xs font-medium ${isExceeded ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                      >
                        {isExceeded
                          ? `Over by ${formatAmount(spent - budget.limitAmount)}`
                          : `${budget.notificationThreshold - percentage}% until alert limit`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditClick(budget)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="material-icons text-base">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewDetails(budget)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className="material-icons text-base">bar_chart</span>
                    Details
                  </button>
                  <button
                    onClick={() => handleDeleteClick(budget)}
                    className="p-2 border border-border-light dark:border-border-dark rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                    title="Delete"
                  >
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={async (input) => {
          await createBudget(input);
        }}
      />
      <BudgetDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        transactions={transactions}
      />
      <EditBudgetModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        onSave={handleSaveEdit}
      />
      <DeleteBudgetModal
        isOpen={!!deletingBudget}
        category={deletingBudget?.category ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBudget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
