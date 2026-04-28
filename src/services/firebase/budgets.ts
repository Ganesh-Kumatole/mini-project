import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

const getBudgetsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'budgets');
};

export const createBudget = async (
  userId: string,
  data: CreateBudgetInput,
): Promise<string> => {
  const docRef = await addDoc(getBudgetsCollection(userId), {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateBudget = async (
  userId: string,
  data: UpdateBudgetInput,
): Promise<void> => {
  const { id, startDate, endDate, ...rest } = data;
  const docRef = doc(db, 'users', userId, 'budgets', id);

  // Strip undefined values — Firestore rejects them
  const updateData: Record<string, any> = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  );

  if (startDate) updateData.startDate = Timestamp.fromDate(startDate);
  if (endDate) updateData.endDate = Timestamp.fromDate(endDate);
  updateData.updatedAt = Timestamp.now();

  await updateDoc(docRef, updateData);
};

export const deleteBudget = async (
  userId: string,
  budgetId: string,
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await deleteDoc(docRef);
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const snapshot = await getDocs(getBudgetsCollection(userId));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate.toDate(),
    endDate: doc.data().endDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Budget[];
};

export const subscribeToBudgets = (
  userId: string,
  callback: (budgets: Budget[]) => void,
): (() => void) => {
  return onSnapshot(getBudgetsCollection(userId), (snapshot) => {
    const budgets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Budget[];
    callback(budgets);
  });
};

// Calculate spent amount for a budget
export const calculateBudgetSpent = async (
  userId: string,
  budget: Budget,
): Promise<number> => {
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(
    transactionsRef,
    where('category', '==', budget.category),
    where('type', '==', 'expense'),
    where('date', '>=', Timestamp.fromDate(budget.startDate)),
    where('date', '<=', Timestamp.fromDate(budget.endDate)),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
};

// Update budget's spentAmount field
export const updateBudgetSpent = async (
  userId: string,
  budgetId: string,
  spentAmount: number,
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await updateDoc(docRef, {
    spentAmount,
    updatedAt: Timestamp.now(),
  });
};
