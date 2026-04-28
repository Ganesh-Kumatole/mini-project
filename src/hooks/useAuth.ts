import { useAuthContext } from '@/context/AuthContext';
import { logoutUser } from '@/services/firebase/auth';

const useAuth = () => {
  const { user, loading } = useAuthContext();

  const logout = async () => {
    await logoutUser();
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };
};

export { useAuth };
