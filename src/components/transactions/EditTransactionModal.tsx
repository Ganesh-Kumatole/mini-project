import { useEffect, useState } from 'react';
import { Transaction, UpdateTransactionInput } from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (input: UpdateTransactionInput) => Promise<void>;
};

export const EditTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  onSave,
}: Props) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction && isOpen) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().slice(0, 10));
      setDescription(transaction.description);
      setType(transaction.type);
      setRecurring(false);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || !category) {
      alert('Please enter amount and category');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        id: transaction.id,
        amount: amt,
        description,
        category,
        date: new Date(date),
        type,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
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
              Edit Transaction
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Update transaction details below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark transition-colors rounded-full p-1"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted-light dark:text-gray-400">
                $
              </div>
              <input
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm pl-7 py-2.5 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

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
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Food &amp; Dining
                </option>
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Transportation
                </option>
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Utilities
                </option>
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Entertainment
                </option>
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Healthcare
                </option>
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  Misc
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-light dark:text-gray-400">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Date
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3"
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-text-main-light dark:text-white">
              Transaction Type
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center gap-2 text-text-main-light dark:text-white cursor-pointer">
                <input
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                  type="radio"
                  name="tx-type"
                />{' '}
                Income
              </label>
              <label className="flex items-center gap-2 text-text-main-light dark:text-white cursor-pointer">
                <input
                  checked={type === 'expense'}
                  onChange={() => setType('expense')}
                  type="radio"
                  name="tx-type"
                />{' '}
                Expense
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-text-main-light dark:text-white">
              Recurring Transaction
            </label>
            <input
              className="toggle-checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              type="checkbox"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-white dark:bg-gray-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-main-light dark:text-white bg-gray-100 dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransactionModal;
