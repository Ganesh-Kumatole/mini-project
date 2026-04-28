import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthContextType } from '@/types/auth';

// define context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// provide context
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// consume context
const useAuthContext = () => {
  const contextVal = useContext(AuthContext);

  if (!contextVal) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return contextVal;
};

export { AuthProvider, useAuthContext };
