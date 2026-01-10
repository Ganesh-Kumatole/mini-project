import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './config'
import { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types'

const getBudgetsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'budgets')
}

export const createBudget = async (
  userId: string,
  data: CreateBudgetInput
): Promise<string> => {
  const docRef = await addDoc(getBudgetsCollection(userId), {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export const updateBudget = async (
  userId: string,
  data: UpdateBudgetInput
): Promise<void> => {
  const { id, ...updateData } = data
  const docRef = doc(db, 'users', userId, 'budgets', id)
  await updateDoc(docRef, {
    ...updateData,
    startDate: updateData.startDate ? Timestamp.fromDate(updateData.startDate) : undefined,
    endDate: updateData.endDate ? Timestamp.fromDate(updateData.endDate) : undefined,
    updatedAt: Timestamp.now(),
  })
}

export const deleteBudget = async (
  userId: string,
  budgetId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'budgets', budgetId)
  await deleteDoc(docRef)
}

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  const snapshot = await getDocs(getBudgetsCollection(userId))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate.toDate(),
    endDate: doc.data().endDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Budget[]
}

export const subscribeToBudgets = (
  userId: string,
  callback: (budgets: Budget[]) => void
): () => void => {
  return onSnapshot(getBudgetsCollection(userId), (snapshot) => {
    const budgets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Budget[]
    callback(budgets)
  })
}
