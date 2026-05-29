const Footer = () => {
  return (
    <footer className="border-t border-border-light dark:border-border-dark py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 opacity-80">
          <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg">
            code
          </span>
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Built as a personal utility tracker.
          </p>
        </div>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-mono bg-surface-light dark:bg-surface-dark px-3 py-1 rounded border border-border-light dark:border-border-dark">
          Fintracker // {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export { Footer };
