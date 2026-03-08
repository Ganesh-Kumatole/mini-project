import { useState } from 'react';
import {
  CreateBudgetInput,
  BudgetPeriod,
  NotificationThreshold,
} from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateBudgetInput) => Promise<string | void>;
};

export const AddBudgetModal = ({ isOpen, onClose, onCreate }: Props) => {
  const [category, setCategory] = useState<string>('');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [notificationThreshold, setNotificationThreshold] =
    useState<NotificationThreshold>(75);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amount = Number(limitAmount);
    if (!amount || !category) {
      alert('Please enter limit amount and category');
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      // Calculate start and end dates based on period
      switch (period) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      await onCreate({
        category,
        limitAmount: amount,
        period,
        startDate,
        endDate,
        notificationThreshold,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory('');
    setLimitAmount('');
    setPeriod('monthly');
    setNotificationThreshold(75);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light dark:bg-surface-dark z-10">
          <div>
            <h2 className="text-xl font-bold text-text-main-light dark:text-white">
              Add New Budget
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Set spending limits and get notified when approaching them.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark transition-colors rounded-full p-1"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3 pr-10 shadow-sm transition-all cursor-pointer"
              >
                <option
                  value=""
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Select a category
                </option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-light dark:text-text-muted-dark">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Budget Limit
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted-light dark:text-gray-400">
                $
              </div>
              <input
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm pl-7 py-2.5 transition-all"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Budget Period
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                className="block w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3 pr-10 shadow-sm transition-all cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-light dark:text-text-muted-dark">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {period === 'weekly' && 'Budget resets every Sunday'}
              {period === 'monthly' && 'Budget resets on the 1st of each month'}
              {period === 'yearly' && 'Budget resets on January 1st'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-text-main-light dark:text-white">
              Alert Threshold
            </label>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Get notified when you reach this percentage of your budget
            </p>
            <div className="flex items-center space-x-4">
              {[50, 75, 90].map((threshold) => (
                <label
                  key={threshold}
                  className="flex items-center gap-2 text-text-main-light dark:text-white cursor-pointer"
                >
                  <input
                    checked={notificationThreshold === threshold}
                    onChange={() =>
                      setNotificationThreshold(
                        threshold as NotificationThreshold,
                      )
                    }
                    type="radio"
                    name="threshold"
                  />
                  {threshold}%
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-white dark:bg-gray-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-text-main-light dark:text-white bg-gray-100 dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Budget'}
          </button>
        </div>
      </form>
    </div>
  );
};
