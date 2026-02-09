import { useState } from 'react';
import { useTransactions } from '@/hooks';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Transaction } from '@/types';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';

export const Transactions = () => {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleAdd = () => setShowAdd(true);
  const handleClose = () => setShowAdd(false);
  const handleCreate = async (input: any) => {
    await createTransaction(input);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowEdit(true);
  };
  const handleEditClose = () => {
    setShowEdit(false);
    setEditingTransaction(null);
  };
  const handleEditSave = async (input: any) => {
    await updateTransaction(input);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
    } catch (e) {
      // noop
    }
  };

  // Filter & Search Logic
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false;
    }

    // Date range filter
    const transDate = new Date(transaction.date);
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      if (transDate < fromDate) return false;
    }
    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      if (transDate > toDate) return false;
    }

    return true;
  });

  // Toggle transaction selection
  const handleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
    setSelectAll(false);
  };

  // Select/Deselect all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions(new Set());
      setSelectAll(false);
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map((t) => t.id)));
      setSelectAll(true);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) {
      alert('Please select transactions to delete');
      return;
    }

    const confirmDelete = confirm(
      `Delete ${selectedTransactions.size} transaction(s)? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      for (const id of selectedTransactions) {
        await deleteTransaction(id);
      }
      setSelectedTransactions(new Set());
      setSelectAll(false);
    } catch (err) {
      console.error('Error deleting transactions:', err);
      alert('Error deleting some transactions');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateFromFilter('');
    setDateToFilter('');
    setSelectedTransactions(new Set());
    setSelectAll(false);
  };

  // Get unique categories from transactions
  const categories = Array.from(
    new Set(transactions.map((t) => t.category))
  ).sort();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and manage all your financial transactions.
        </p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* Filters Section */}
        <div className="p-5 border-b border-border-light dark:border-border-dark space-y-4">
          <div className="w-full">
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Search transactions..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Filter Row 1: Date Range & Category */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              {/* Date Range */}
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-1 sm:flex-none"
                  title="From Date"
                />
                <span className="text-gray-400 hidden sm:inline">to</span>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-1 sm:flex-none"
                  title="To Date"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Row 2: Type Buttons & Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-sm font-medium border border-border-light dark:border-border-dark w-full sm:w-auto">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                    selectedType === 'all'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedType('income')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                    selectedType === 'income'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setSelectedType('expense')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
                    selectedType === 'expense'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
              {(dateFromFilter || dateToFilter || selectedCategory !== 'all' || selectedType !== 'all' || searchText) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
                >
                  <span className="material-icons-outlined text-lg">close</span>
                  <span className="hidden md:inline">Clear Filters</span>
                  <span className="md:hidden">Clear</span>
                </button>
              )}
              <button
                onClick={handleBulkDelete}
                disabled={selectedTransactions.size === 0}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none border ${
                  selectedTransactions.size === 0
                    ? 'border-border-light dark:border-border-dark text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                    : 'border-red-300 dark:border-red-700/50 text-white bg-red-600 hover:bg-red-700 dark:hover:bg-red-600 shadow-md hover:shadow-lg dark:bg-red-600/90'
                }`}
              >
                <span className="material-icons-outlined text-lg">
                  delete_outline
                </span>
                <span className="hidden md:inline">Delete ({selectedTransactions.size})</span>
                <span className="md:hidden">{selectedTransactions.size}</span>
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex-1 sm:flex-none"
              >
                <span className="material-icons-outlined text-lg">add</span>
                <span className="hidden md:inline">Add Transaction</span>
                <span className="md:hidden">Add</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-text-secondary-light"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-text-secondary-light dark:text-gray-400"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {(error as any).message || 'Failed to load transactions'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      selectedTransactions.has(tx.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(tx.id)}
                        onChange={() => handleSelectTransaction(tx.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {formatDate(new Date(tx.date))}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-100 font-semibold">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}
                      >
                        {tx.type[0].toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                          onClick={() => handleEditClick(tx)}
                        >
                          <span className="material-icons-outlined text-lg">
                            edit
                          </span>
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors"
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
      </div>
      {showAdd && (
        <AddTransactionModal
          isOpen={showAdd}
          onClose={handleClose}
          onCreate={handleCreate}
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
    </div>
  );
};
