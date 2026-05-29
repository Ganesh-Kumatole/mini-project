export interface ToastMessageType {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastPropsType extends ToastMessageType {
  onDismiss: (id: string) => void;
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastMessageType, 'id'>) => void;
  removeToast: (id: string) => void;
}
