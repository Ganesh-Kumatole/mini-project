import { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, 0 = permanent
}

interface ToastProps extends ToastMessage {
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 5000,
  onDismiss,
}) => {
  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  }[type];

  const borderColor = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-yellow-200 dark:border-yellow-800',
    info: 'border-blue-200 dark:border-blue-800',
  }[type];

  const textColor = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[type];

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4 flex items-start gap-3 ${textColor}`}
    >
      <span className="material-icons flex-shrink-0 mt-0.5">
        {iconMap[type]}
      </span>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm mt-1">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-current hover:opacity-70"
      >
        <span className="material-icons text-lg">close</span>
      </button>
    </div>
  );
};

// Toast container component
export const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({
  toasts: toastList,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md space-y-2">
      {toastList.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => {}} />
      ))}
    </div>
  );
};
