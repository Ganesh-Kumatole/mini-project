const FeatureCard = ({
  title,
  icon,
  desc,
}: {
  title: string;
  icon: string;
  desc: string;
}) => {
  return (
    <div className="relative p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark group hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <span className="material-icons-outlined text-indigo-600 dark:text-indigo-400 text-2xl">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export { FeatureCard };
