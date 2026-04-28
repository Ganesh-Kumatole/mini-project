import { useEffect, useState } from 'react';
import { ToastMessageType, ToastPropsType } from '@/types/toast';
import { STYLES } from '@/utils';

// ── Single Toast ──────────────────────────────────────────────────────────────
export const Toast: React.FC<ToastPropsType> = ({
  id,
  title,
  message,
  type,
  duration = 3000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const s = STYLES[type];

  // Slide in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss + progress bar countdown
  useEffect(() => {
    if (duration === 0) return;
    const start = Date.now();
    let frameId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        frameId = requestAnimationFrame(tick);
      } else {
        handleDismiss();
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [id, duration]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden w-80 max-w-[calc(100vw-2rem)] rounded-2xl
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl backdrop-saturate-150
        ring-1 ${s.ring}
        shadow-xl ${s.glow}
        transition-all duration-300 ease-out
        ${
          visible && !leaving
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-8 scale-95'
        }
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`material-icons flex-shrink-0 mt-0.5 text-xl ${s.iconColor}`}
        >
          {s.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss"
        >
          <span className="material-icons text-base">close</span>
        </button>
      </div>

      {/* Shrinking progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full ${s.bar} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ── Container ─────────────────────────────────────────────────────────────────
export const ToastContainer: React.FC<{
  toasts: ToastMessageType[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => (
  <div
    className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
    aria-label="Notifications"
  >
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onDismiss={onDismiss} />
    ))}
  </div>
);
