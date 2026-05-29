import { DashboardHeaderProps } from '@/pages/dashboard/types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddTransaction,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {currentDate} overview
        </p>
      </div>
      <button
        id="dashboard-add-tx"
        onClick={onAddTransaction}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
      >
        <span className="material-icons text-base">add</span>
        Add Transaction
      </button>
    </div>
  );
};
