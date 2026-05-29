import { useState, useEffect } from 'react';
import { useCurrencyContext } from '@/shared/context';
import { Budget, BudgetPeriod, NotificationThreshold } from '../types/budget';

export const EditBudgetModal = ({
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
