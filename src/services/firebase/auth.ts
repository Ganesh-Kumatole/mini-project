import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth'
import { auth } from './config'

export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: name })
  return userCredential.user
}

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const logoutUser = async (): Promise<void> => {
  await signOut(auth)
}
