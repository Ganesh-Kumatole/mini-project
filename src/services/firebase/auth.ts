import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './config';

const registerUser = async (
  email: string,
  password: string,
  anonymous: string,
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(userCredential.user, { displayName: anonymous });
  return userCredential.user;
};

const signInWithGoogle = async (): Promise<{
  user: User;
  isNewUser: boolean;
}> => {
  try {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);

    // isNewUser will be true if this is the user's first sign-in
    const isNewUser =
      result.user.metadata?.creationTime ===
      result.user.metadata?.lastSignInTime;

    return { user: result.user, isNewUser };
  } catch (error: any) {
    console.error('Google sign-in error:', error.message);
    throw error;
  }
};

const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};

const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export { registerUser, loginUser, signInWithGoogle, logoutUser };
