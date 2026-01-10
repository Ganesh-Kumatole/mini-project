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
import { Account, CreateAccountInput, UpdateAccountInput } from '@/types'

const getAccountsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'accounts')
}

export const createAccount = async (
  userId: string,
  data: CreateAccountInput
): Promise<string> => {
  const docRef = await addDoc(getAccountsCollection(userId), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export const updateAccount = async (
  userId: string,
  data: UpdateAccountInput
): Promise<void> => {
  const { id, ...updateData } = data
  const docRef = doc(db, 'users', userId, 'accounts', id)
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: Timestamp.now(),
  })
}

export const deleteAccount = async (
  userId: string,
  accountId: string
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'accounts', accountId)
  await deleteDoc(docRef)
}

export const getAccounts = async (userId: string): Promise<Account[]> => {
  const snapshot = await getDocs(getAccountsCollection(userId))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Account[]
}

export const subscribeToAccounts = (
  userId: string,
  callback: (accounts: Account[]) => void
): () => void => {
  return onSnapshot(getAccountsCollection(userId), (snapshot) => {
    const accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Account[]
    callback(accounts)
  })
}
