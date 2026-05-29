export const DeleteBudgetModal = ({
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
