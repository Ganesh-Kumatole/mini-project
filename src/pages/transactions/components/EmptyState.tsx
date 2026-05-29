export const EmptyState = ({
  filtersActive,
  onClear,
}: {
  filtersActive: boolean;
  onClear: () => void;
}) => (
  <tr>
    <td colSpan={7}>
      <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          <span className="material-icons text-3xl text-indigo-400">
            {filtersActive ? 'filter_alt_off' : 'receipt_long'}
          </span>
        </div>
        <div className="text-center">
          <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
            {filtersActive ? 'No results match your filters' : 'No transactions yet'}
          </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {filtersActive
              ? 'Try widening your search or date range'
              : 'Add your first transaction to get started'}
          </p>
        </div>
        {filtersActive && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons text-base">close</span>
            Clear Filters
          </button>
        )}
      </div>
    </td>
  </tr>
);
