import { useState, useCallback } from 'react';
import { ToastMessageType } from '@/types/toast';

const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessageType[]>([]);

  const addToast = useCallback((newToast: Omit<ToastMessageType, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { ...newToast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
};

export default useToast;
