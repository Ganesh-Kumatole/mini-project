export const Insights = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
        AI-Powered Insights
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Insight Cards */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Spending Trend
            </h3>
            <span className="material-icons text-blue-500">trending_up</span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Your spending has increased by 12% compared to last month. Consider
            reviewing your entertainment expenses.
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Savings Goal
            </h3>
            <span className="material-icons text-green-500">savings</span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            You're on track to save $2,400 this month. Keep up the good work!
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Budget Alert
            </h3>
            <span className="material-icons text-red-500">warning</span>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Your groceries budget is 80% used with 10 days remaining in the
            month.
          </p>
        </div>
      </div>

      <p className="text-text-secondary-light dark:text-text-secondary-dark mt-12 text-center">
        More insights coming soon...
      </p>
    </div>
  );
};
