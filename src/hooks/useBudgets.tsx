import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  createBudget as createBudgetSvc,
  updateBudget as updateBudgetSvc,
  deleteBudget as deleteBudgetSvc,
  getBudgets as getBudgetsSvc,
  subscribeToBudgets,
} from '@/services/firebase/budgets';
import { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getBudgetsSvc(user.uid);
      setBudgets(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToBudgets(user.uid, (data) => {
      setBudgets(data);
      setLoading(false);
      setError(null);
    });

    refresh().catch(() => {});

    return () => unsubscribe();
  }, [user, refresh]);

  const createBudget = useCallback(
    async (input: CreateBudgetInput) => {
      if (!user) throw new Error('Not authenticated');
      return await createBudgetSvc(user.uid, input);
    },
    [user],
  );

  const updateBudget = useCallback(
    async (input: UpdateBudgetInput) => {
      if (!user) throw new Error('Not authenticated');
      return await updateBudgetSvc(user.uid, input);
    },
    [user],
  );

  const deleteBudget = useCallback(
    async (budgetId: string) => {
      if (!user) throw new Error('Not authenticated');
      return await deleteBudgetSvc(user.uid, budgetId);
    },
    [user],
  );

  return {
    budgets,
    loading,
    error,
    refresh,
    createBudget,
    updateBudget,
    deleteBudget,
  };
};

export default useBudgets;
