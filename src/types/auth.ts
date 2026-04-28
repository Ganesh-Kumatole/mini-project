import { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}
