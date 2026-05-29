import { getBudgetPercentage } from '../types/budget';
import { AddBudgetModal } from './AddBudgetModal';
import { BudgetDetailsModal } from './BudgetDetailsModal';
import { EditBudgetModal } from './EditBudgetModal';
import { DeleteBudgetModal } from './DeleteBudgetModal';
import { useBudgetsPage, PeriodFilter } from '../hooks/useBudgetsPage';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../utils';

export const Budgets = () => {
  const {
    budgets,
    filteredBudgets,
    transactions,
    spentByBudget,
    totalLimit,
    totalSpent,
    budgetUsagePercent,
    overBudgetCount,
    loading,
    periodFilter,
    setPeriodFilter,
    showAddModal,
    setShowAddModal,
    showDetailsModal,
    setShowDetailsModal,
    selectedBudget,
    setSelectedBudget,
    showEditModal,
    setShowEditModal,
    editingBudget,
    setEditingBudget,
    deletingBudget,
    setDeletingBudget,
    deleteLoading,
    createBudget,
    handleEditClick,
    handleDeleteClick,
    handleConfirmDelete,
    handleSaveEdit,
    handleViewDetails,
    formatAmount,
  } = useBudgetsPage();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            id="budgets-heading"
            className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
          >
            Budget Management
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} ·{' '}
            {overBudgetCount > 0
              ? `${overBudgetCount} over limit`
              : 'All within limits'}
          </p>
        </div>
        <button
          id="budgets-add-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <span className="material-icons text-base">add</span>
          Add Budget
        </button>
      </div>

      {/* Summary statistics banner */}
      {budgets.length > 0 && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Total Limit
              </p>
              <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                {formatAmount(totalLimit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Total Spent
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  budgetUsagePercent > 90
                    ? 'text-red-500'
                    : 'text-text-primary-light dark:text-text-primary-dark'
                }`}
              >
                {formatAmount(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Remaining
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatAmount(Math.max(totalLimit - totalSpent, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Overall Usage
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  budgetUsagePercent > 90
                    ? 'text-red-500'
                    : budgetUsagePercent > 70
                      ? 'text-amber-500'
                      : 'text-text-primary-light dark:text-text-primary-dark'
                }`}
              >
                {budgetUsagePercent.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetUsagePercent > 90
                  ? 'bg-red-500'
                  : budgetUsagePercent > 70
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
          {overBudgetCount > 0 && (
            <div className="flex items-center gap-2 mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <span className="material-icons text-red-500 text-sm">
                warning
              </span>
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                {overBudgetCount} budget{overBudgetCount !== 1 ? 's' : ''}{' '}
                exceeded — review your spending.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Period filtering tabs */}
      {budgets.length > 0 && (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 border border-border-light dark:border-border-dark w-fit">
          {(['all', 'monthly', 'weekly', 'yearly'] as PeriodFilter[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  periodFilter === p
                    ? 'bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark shadow-sm'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                }`}
              >
                {p === 'all' ? 'All' : p[0].toUpperCase() + p.slice(1)}
                {p !== 'all' && (
                  <span className="ml-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                    {budgets.filter((b) => b.period === p).length}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      )}

      {/* Budgets grid display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="material-icons text-3xl text-indigo-400">
              savings
            </span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {periodFilter === 'all'
                ? 'No budgets yet'
                : `No ${periodFilter} budgets`}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {periodFilter === 'all'
                ? 'Create your first budget to start tracking.'
                : 'Try a different period filter.'}
            </p>
          </div>
          {periodFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <span className="material-icons text-base">add</span>
              Add Your First Budget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const spent = spentByBudget[budget.id] || 0;
            const percentage = getBudgetPercentage(spent, budget.limitAmount);
            const isNearLimit = percentage >= budget.notificationThreshold;
            const isExceeded = percentage > 100;
            const barColor = isExceeded
              ? 'bg-red-500'
              : isNearLimit
                ? 'bg-amber-400'
                : 'bg-emerald-500';
            const icon = CATEGORY_ICONS[budget.category] || 'category';
            const iconBg = CATEGORY_COLORS[budget.category] || 'bg-gray-500';

            return (
              <div
                key={budget.id}
                className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  isExceeded
                    ? 'border-red-300 dark:border-red-700/60'
                    : isNearLimit
                      ? 'border-amber-300 dark:border-amber-700/60'
                      : 'border-border-light dark:border-border-dark'
                }`}
              >
                {/* Individual card header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="material-icons text-white text-lg">
                          {icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark leading-tight">
                          {budget.category}
                        </h3>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">
                          {budget.period}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExceeded && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      {isNearLimit && !isExceeded && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress visualization */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary-light dark:text-text-secondary-dark">
                        Spent
                      </span>
                      <span
                        className={`font-semibold ${
                          isExceeded
                            ? 'text-red-500'
                            : isNearLimit
                              ? 'text-amber-500'
                              : 'text-text-primary-light dark:text-text-primary-dark'
                        }`}
                      >
                        {formatAmount(spent)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      <span>{formatAmount(budget.limitAmount)} limit</span>
                      <span
                        className={`font-semibold ${
                          isExceeded
                            ? 'text-red-500'
                            : isNearLimit
                              ? 'text-amber-500'
                              : ''
                        }`}
                      >
                        {percentage}% used
                      </span>
                    </div>
                  </div>

                  {/* Alert messages */}
                  {isNearLimit && (
                    <div
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-3 ${
                        isExceeded
                          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <span
                        className={`material-icons text-sm mt-0.5 ${isExceeded ? 'text-red-500' : 'text-amber-500'}`}
                      >
                        warning
                      </span>
                      <p
                        className={`text-xs font-medium ${isExceeded ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                      >
                        {isExceeded
                          ? `Over by ${formatAmount(spent - budget.limitAmount)}`
                          : `${budget.notificationThreshold - percentage}% until alert limit`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditClick(budget)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="material-icons text-base">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewDetails(budget)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className="material-icons text-base">bar_chart</span>
                    Details
                  </button>
                  <button
                    onClick={() => handleDeleteClick(budget)}
                    className="p-2 border border-border-light dark:border-border-dark rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                    title="Delete"
                  >
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Modals */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={async (input) => {
          await createBudget(input);
        }}
      />
      <BudgetDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        transactions={transactions}
      />
      <EditBudgetModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        onSave={handleSaveEdit}
      />
      <DeleteBudgetModal
        isOpen={!!deletingBudget}
        category={deletingBudget?.category ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBudget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
