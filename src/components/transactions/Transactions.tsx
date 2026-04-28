import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import { useCurrency } from '@/context/CurrencyContext';
import { Transaction } from '@/types';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';

// ── Types ──────────────────────────────────────────────────────────────────────
type SortKey = 'date' | 'amount' | 'description' | 'category';
type SortDir = 'asc' | 'desc';

// ── Styled Confirm Modal ───────────────────────────────────────────────────────
const ConfirmModal = ({
  isOpen, count, onConfirm, onCancel, loading,
}: { isOpen: boolean; count: number; onConfirm: () => void; onCancel: () => void; loading: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-red-200 dark:border-red-800 animate-[fadeIn_0.15s_ease]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40">
            <span className="material-icons text-red-500 text-xl">delete_forever</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              Delete {count} Transaction{count !== 1 ? 's' : ''}?
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-5">
          You are about to permanently delete <span className="font-semibold text-red-600 dark:text-red-400">{count} transaction{count !== 1 ? 's' : ''}</span>. All associated data will be lost.
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
            {loading && <span className="material-icons text-base animate-spin">refresh</span>}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sort Header Button ─────────────────────────────────────────────────────────
const SortTh = ({
  label, sortKey, currentKey, dir, onSort, className = '',
}: { label: string; sortKey: SortKey; currentKey: SortKey; dir: SortDir; onSort: (k: SortKey) => void; className?: string }) => {
  const active = currentKey === sortKey;
  return (
    <th
      className={`px-6 py-4 cursor-pointer select-none group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`material-icons text-sm transition-colors ${active ? 'text-indigo-500' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
          {active && dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </span>
    </th>
  );
};

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ filtersActive, onClear }: { filtersActive: boolean; onClear: () => void }) => (
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

// ── Pagination Control ─────────────────────────────────────────────────────────
const PAGE_SIZE = 25;

const Pagination = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark">
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-icons text-base">chevron_left</span>
          Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4));
          const p = start + i;
          if (p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <span className="material-icons text-base">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const Transactions = () => {
  const { formatAmount } = useCurrency();
  const { transactions, loading, error, createTransaction, updateTransaction, deleteTransaction } = useTransactions();

  // ── Modal state ──
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: Set<string>; single?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Filters ──
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // ── Sorting ──
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Pagination ──
  const [page, setPage] = useState(1);

  const hasActiveFilters = !!(searchText || selectedType !== 'all' || selectedCategory !== 'all' || dateFromFilter || dateToFilter);

  // ── Categories unique list ──
  const categories = useMemo(() =>
    Array.from(new Set(transactions.map((t) => t.category))).sort(), [transactions]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.amount.toString().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      }
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      const d = new Date(t.date);
      if (dateFromFilter && d < new Date(dateFromFilter)) return false;
      if (dateToFilter) { const to = new Date(dateToFilter); to.setHours(23,59,59,999); if (d > to) return false; }
      return true;
    });
  }, [transactions, searchText, selectedType, selectedCategory, dateFromFilter, dateToFilter]);

  // ── Sorted list ──
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else if (sortKey === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Paginated list ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handler: toggle sort ──
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  // ── Handlers: selection ──
  const handleSelectTransaction = (id: string) => {
    const s = new Set(selectedTransactions);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedTransactions(s);
    setSelectAll(false);
  };
  const handleSelectAll = () => {
    if (selectAll) { setSelectedTransactions(new Set()); setSelectAll(false); }
    else { setSelectedTransactions(new Set(filtered.map(t => t.id))); setSelectAll(true); }
  };

  // ── Handlers: delete flow ──
  const handleDelete = (id: string) => {
    setConfirmDelete({ ids: new Set([id]), single: id });
  };
  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) return;
    setConfirmDelete({ ids: new Set(selectedTransactions) });
  };
  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      for (const id of confirmDelete.ids) await deleteTransaction(id);
      setSelectedTransactions(new Set());
      setSelectAll(false);
      setConfirmDelete(null);
    } catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  // ── Handlers: edit ──
  const handleEditClick = (tx: Transaction) => { setEditingTransaction(tx); setShowEdit(true); };
  const handleEditClose = () => { setShowEdit(false); setEditingTransaction(null); };
  const handleEditSave = async (input: any) => { await updateTransaction(input); };

  // ── Handler: reset ──
  const handleResetFilters = () => {
    setSearchText(''); setSelectedType('all'); setSelectedCategory('all');
    setDateFromFilter(''); setDateToFilter('');
    setSelectedTransactions(new Set()); setSelectAll(false);
    setPage(1);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Transactions</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
          {transactions.length > 0
            ? `${transactions.length} total · ${filtered.length} shown`
            : 'Manage your income and expenses'}
        </p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="p-5 border-b border-border-light dark:border-border-dark space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              placeholder="Search by description, category, or amount…"
              type="text"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {/* Row 1: Dates + Category */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => { setDateFromFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    title="From Date"
                  />
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">to</span>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => { setDateToFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    title="To Date"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Row 2: Type tabs + actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Type Toggle */}
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-sm font-medium border border-border-light dark:border-border-dark w-full sm:w-auto">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSelectedType(t); setPage(1); }}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md capitalize transition-all ${
                      selectedType === t
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All' : t === 'income' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-icons-outlined text-base">filter_alt_off</span>
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
                  <span className="material-icons-outlined text-base">delete_outline</span>
                  {selectedTransactions.size > 0 && (
                    <span className="font-semibold">{selectedTransactions.size}</span>
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

        {/* ── Table ─────────────────────────────────────────────────────── */}
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
                <SortTh label="Date" sortKey="date" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Description" sortKey="description" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Category" sortKey="category" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Amount" sortKey="amount" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
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
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                    {(error as any).message || 'Failed to load transactions'}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <EmptyState filtersActive={hasActiveFilters} onClear={handleResetFilters} />
              ) : (
                paginated.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                      selectedTransactions.has(tx.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
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
                    <td className={`px-6 py-4 text-right font-semibold tabular-nums ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary-light dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : ''}{formatAmount(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'expense'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        <span className="material-icons text-xs mr-1">{tx.type === 'income' ? 'north' : 'south'}</span>
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
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {!loading && sorted.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {showAdd && (
        <AddTransactionModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onCreate={async (input) => { await createTransaction(input); }}
        />
      )}
      {showEdit && (
        <EditTransactionModal
          isOpen={showEdit}
          onClose={handleEditClose}
          transaction={editingTransaction}
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
