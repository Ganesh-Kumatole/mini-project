const Card = ({
  id,
  icon,
  iconBg,
  label,
  value,
  sub,
  subColor,
  progress,
}: {
  id: string;
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  progress?: number;
}) => (
  <div
    id={id}
    className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-3"
  >
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        <span className="material-icons text-white text-xl">{icon}</span>
      </div>
      <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </span>
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
        {value}
      </p>
      <p
        className={`text-xs mt-1 font-medium ${subColor || 'text-text-secondary-light dark:text-text-secondary-dark'}`}
      >
        {sub}
      </p>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    )}
  </div>
);

export { Card };
