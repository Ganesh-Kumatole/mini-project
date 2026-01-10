import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  Timestamp,
  onSnapshot,
  Query,
} from 'firebase/firestore'
import { db } from './config'
import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '@/types'

const getTransactionsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'transactions')
}

export const createTransaction = async (
  userId: string,
  data: CreateTransactionInput
): Promise<string> => {
  const docRef = await addDoc(getTransactionsCollection(userId), {
    ...data,
    date: Timestamp.fromDate(data.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export const updateTransaction = async (
  userId: string,
  data: UpdateTransactionInput
): Promise<void> => {
  const { id, ...updateData } = data
  const docRef = doc(db, 'users', userId, 'transactions', id)
  await updateDoc(docRef, {
    ...updateData,
    date: updateData.date ? Timestamp.fromDate(updateData.date) : undefined,
    updatedAt: Timestamp.now(),
  })
}

export const deleteTransaction = async (
  userId: string,
  transactionId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'transactions', transactionId)
  await deleteDoc(docRef)
}

export const getTransactions = async (
  userId: string,
  accountId?: string
): Promise<Transaction[]> => {
  let q: Query = query(
    getTransactionsCollection(userId),
    orderBy('date', 'desc')
  )

  if (accountId) {
    q = query(q, where('accountId', '==', accountId))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Transaction[]
}

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  accountId?: string
): () => void => {
  let q: Query = query(
    getTransactionsCollection(userId),
    orderBy('date', 'desc')
  )

  if (accountId) {
    q = query(q, where('accountId', '==', accountId))
  }

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Transaction[]
    callback(transactions)
  })
}
