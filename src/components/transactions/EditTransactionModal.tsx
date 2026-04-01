import { useEffect, useState } from 'react';
import { Transaction, UpdateTransactionInput } from '@/types';
import { getCategoriesForType } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (input: UpdateTransactionInput) => Promise<void>;
};

export const EditTransactionModal = ({ isOpen, onClose, transaction, onSave }: Props) => {
  const { symbol } = useCurrency();

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction && isOpen) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().slice(0, 10));
      setDescription(transaction.description);
      setType(transaction.type);
      setRecurring(false);
      setError(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const categories = getCategoriesForType(type);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    // Only reset category if the current category doesn't belong to the new type
    if (!getCategoriesForType(newType).includes(category)) {
      setCategory('');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount greater than 0'); return; }
    if (!category) { setError('Please select a category'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSave({ id: transaction.id, amount: amt, description, category, date: new Date(date), type });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light dark:bg-surface-dark z-10">
          <div>
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Edit Transaction</h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Update the transaction details below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors rounded-full p-1"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="material-icons text-red-500 text-base flex-shrink-0">error_outline</span>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                    type === t
                      ? t === 'income'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-red-500 border-red-500 text-white'
                      : 'border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-indigo-400'
                  }`}
                >
                  <span className="material-icons text-base">{t === 'income' ? 'north' : 'south'}</span>
                  {t === 'income' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">Amount</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light dark:text-text-secondary-dark font-medium select-none">
                {symbol}
              </div>
              <input
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm pl-8 py-2.5 transition-all"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Category — filtered by type */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">
              Category
              <span className={`ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full ${
                type === 'income'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {type}
              </span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm py-2.5 px-3 pr-10 cursor-pointer"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary-light dark:text-text-secondary-dark">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">Date</label>
            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm py-2.5 px-3"
              type="date"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">
              Description <span className="text-text-secondary-light dark:text-text-secondary-dark font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm py-2.5 px-3 resize-none"
              rows={2}
            />
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Recurring Transaction</span>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Mark if this repeats monthly</p>
            </div>
            <input
              className="toggle-checkbox"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
              type="checkbox"
            />
          </label>
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="p-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-gray-100 dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {submitting && <span className="material-icons text-base animate-spin">refresh</span>}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransactionModal;
