export interface User {
  uid: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  name: string
  email: string
}

export interface AuthContextType {
  user: any | null; // Using any for FirebaseUser to avoid tight coupling here if needed, or import User from firebase
  loading: boolean;
}

