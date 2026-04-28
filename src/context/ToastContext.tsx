import { createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '@/components/common/Toast';
import { ToastContextType } from '@/types/toast';
import useToast from '@/hooks/useToast';

// define context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// provide context
const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {children}
    </ToastContext.Provider>
  );
};

// consume context
const useToastContext = () => {
  const contextVal = useContext(ToastContext);

  if (!contextVal) {
    throw new Error('useToastContext must be used within ToastProvider');
  }

  return contextVal;
};

export { ToastProvider, useToastContext };
