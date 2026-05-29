import { formatDate } from '@/shared/utils';
import { useCurrencyContext } from '@/shared/context';
import { AddTransactionModal } from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';
import { useTransactionsPage } from '../hooks/useTransactionsPage';
import { ConfirmModal } from './ConfirmModal';
import { SortTh } from './SortTh';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export const Transactions = () => {
  const { formatAmount } = useCurrencyContext();

  const {
    transactions,
    filtered,
    sorted,
    paginated,
    categories,
    loading,
    error,
    createTransaction,
    showAdd,
    setShowAdd,
    showEdit,
    editingTransaction,
    confirmDelete,
    setConfirmDelete,
    deleting,
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    selectedTransactions,
    selectAll,
    sortKey,
    sortDir,
    page,
    setPage,
    totalPages,
    hasActiveFilters,
    handleSort,
    handleSelectTransaction,
    handleSelectAll,
    handleDelete,
    handleBulkDelete,
    executeDelete,
    handleEditClick,
    handleEditClose,
    handleEditSave,
    handleResetFilters,
  } = useTransactionsPage();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Transactions
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
          {transactions.length > 0
            ? `${transactions.length} total · ${filtered.length} shown`
            : 'Manage your income and expenses'}
        </p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* Filters and search area */}
        <div className="p-5 border-b border-border-light dark:border-border-dark space-y-4">
          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              placeholder="Search by description, category, or amount…"
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => {
                      setDateFromFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    title="From Date"
                  />
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">to</span>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => {
                      setDateToFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    title="To Date"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-sm font-medium border border-border-light dark:border-border-dark w-full sm:w-auto">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setPage(1);
                    }}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md capitalize transition-all ${
                      selectedType === t
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t === 'all'
                      ? 'All'
                      : t === 'income'
                        ? '↑ Income'
                        : '↓ Expense'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-icons-outlined text-base">
                      filter_alt_off
                    </span>
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedTransactions.size === 0}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedTransactions.size === 0
                      ? 'border-border-light dark:border-border-dark text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-50'
                      : 'border-red-300 dark:border-red-700/50 text-white bg-red-600 hover:bg-red-700 shadow-sm'
                  }`}
                >
                  <span className="material-icons-outlined text-base">
                    delete_outline
                  </span>
                  {selectedTransactions.size > 0 && (
                    <span className="font-semibold">
                      {selectedTransactions.size}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all flex-1 sm:flex-none"
                >
                  <span className="material-icons-outlined text-base">add</span>
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 cursor-pointer"
                  />
                </th>
                <SortTh
                  label="Date"
                  sortKey="date"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Description"
                  sortKey="description"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Category"
                  sortKey="category"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Amount"
                  sortKey="amount"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {(error as any).message || 'Failed to load transactions'}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <EmptyState
                  filtersActive={hasActiveFilters}
                  onClear={handleResetFilters}
                />
              ) : (
                paginated.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                      selectedTransactions.has(tx.id)
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(tx.id)}
                        onChange={() => handleSelectTransaction(tx.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-text-secondary-light dark:text-gray-400 whitespace-nowrap text-xs font-medium">
                      {formatDate(new Date(tx.date))}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary-light dark:text-white max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold tabular-nums ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-text-primary-light dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'expense'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}
                      >
                        <span className="material-icons text-xs mr-1">
                          {tx.type === 'income' ? 'north' : 'south'}
                        </span>
                        {tx.type[0].toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          onClick={() => handleEditClick(tx)}
                        >
                          <span className="material-icons-outlined text-lg">
                            edit
                          </span>
                        </button>
                        <button
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <span className="material-icons-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && sorted.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>

      {/* Render Modals */}
      {showAdd && (
        <AddTransactionModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onCreate={async (input) => {
            await createTransaction(input);
          }}
        />
      )}
      {showEdit && (
        <EditTransactionModal
          isOpen={showEdit}
          onClose={handleEditClose}
          transaction={editingTransaction!}
          onSave={handleEditSave}
        />
      )}
      <ConfirmModal
        isOpen={!!confirmDelete}
        count={confirmDelete?.ids.size ?? 0}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />
    </div>
  );
};
