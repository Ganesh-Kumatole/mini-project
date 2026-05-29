import { useState, useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { Transaction, SortKey, SortDir } from '../types';

const PAGE_SIZE = 25;

export const useTransactionsPage = () => {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // Modal and interaction states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: Set<string>; single?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Sorting and pagination states
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const hasActiveFilters = !!(
    searchText ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    dateFromFilter ||
    dateToFilter
  );

  // Derive unique categories from transactions
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );

  // Filter logic
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !t.description.toLowerCase().includes(q) &&
          !t.amount.toString().includes(q) &&
          !t.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      
      const d = new Date(t.date);
      if (dateFromFilter && d < new Date(dateFromFilter)) return false;
      if (dateToFilter) {
        const to = new Date(dateToFilter);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    });
  }, [transactions, searchText, selectedType, selectedCategory, dateFromFilter, dateToFilter]);

  // Sorting logic
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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handlers
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleSelectTransaction = (id: string) => {
    const s = new Set(selectedTransactions);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedTransactions(s);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions(new Set());
      setSelectAll(false);
    } else {
      setSelectedTransactions(new Set(filtered.map((t) => t.id)));
      setSelectAll(true);
    }
  };

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
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
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

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateFromFilter('');
    setDateToFilter('');
    setSelectedTransactions(new Set());
    setSelectAll(false);
    setPage(1);
  };

  return {
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
    setShowEdit,
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
  };
};
