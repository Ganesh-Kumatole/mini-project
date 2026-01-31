import { useState } from 'react';
import { CreateTransactionInput } from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTransactionInput) => Promise<string | void>;
};

export const AddTransactionModal = ({ isOpen, onClose, onCreate }: Props) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || !category) {
      alert('Please enter amount and category');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        amount: amt,
        description,
        category,
        date: new Date(date),
        type,
      });
      // TODO: handle `file` upload to storage later
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create transaction');
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
            <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
              Add New Transaction
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Enter transaction details or upload a receipt to get started.
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
            <label className="block text-sm font-semibold mb-1.5">Amount</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                $
              </div>
              <input
                className="block w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-main-light dark:text-text-main-dark focus:border-primary focus:ring-primary sm:text-sm pl-7 py-2.5 placeholder-text-muted-light"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full appearance-none rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-main-light dark:text-text-main-dark focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 pr-10 shadow-sm transition-colors cursor-pointer"
              >
                <option value="">Select a category</option>
                <option>Food &amp; Dining</option>
                <option>Transportation</option>
                <option>Utilities</option>
                <option>Entertainment</option>
                <option>Healthcare</option>
                <option>Misc</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-light dark:text-text-muted-dark">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Date</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-main-light dark:text-text-main-dark focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3"
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-main-light dark:text-text-main-dark focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Transaction Type
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center gap-2">
                <input
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                  type="radio"
                  name="tx-type"
                />{' '}
                Income
              </label>
              <label className="flex items-center gap-2">
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
            <label className="text-sm font-semibold">
              Recurring Transaction
            </label>
            <input
              className="toggle-checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              type="checkbox"
            />
          </div>

          <div className="pt-2">
            <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-border-light dark:border-border-dark px-6 pt-8 pb-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group relative">
              <input
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
                id="file-upload"
                name="file-upload"
                type="file"
              />
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <span className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors">
                    <span className="material-icons text-text-muted-light dark:text-text-muted-dark group-hover:text-primary">
                      cloud_upload
                    </span>
                  </span>
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  <span className="font-medium text-primary hover:text-primary-hover">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                  PNG, JPG, PDF up to 10MB (AI Scan supported)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-main-light dark:text-text-main-dark bg-white dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionModal;
