import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  createTransaction as createTransactionSvc,
  updateTransaction as updateTransactionSvc,
  deleteTransaction as deleteTransactionSvc,
  getTransactions as getTransactionsSvc,
  subscribeToTransactions,
} from '@/services/firebase/transactions';
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/types';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTransactionsSvc(user.uid);
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
      setLoading(false);
      setError(null);
    });

    // fallback fetch in case snapshot doesn't fire immediately
    refresh().catch(() => {});

    return () => unsubscribe();
  }, [user, refresh]);

  const createTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      if (!user) throw new Error('Not authenticated');
      return await createTransactionSvc(user.uid, input);
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (input: UpdateTransactionInput) => {
      if (!user) throw new Error('Not authenticated');
      return await updateTransactionSvc(user.uid, input);
    },
    [user],
  );

  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      if (!user) throw new Error('Not authenticated');
      return await deleteTransactionSvc(user.uid, transactionId);
    },
    [user],
  );

  return {
    transactions,
    loading,
    error,
    refresh,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

export default useTransactions;
