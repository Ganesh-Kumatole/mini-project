import { useDashboard } from '../hooks/useDashboard';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useDashboardCharts } from '../hooks/useDashboardCharts';
import { useTransactions } from '@/pages/transactions/hooks/useTransactions';
import { useNewsPage } from '@/pages/news/hooks/useNewsPage';
import { useModal } from '@/shared/hooks/useModal';
import { DashboardHeader } from './DashboardHeader';
import { CardsWrapper } from './CardsWrapper';
import { ChartsWrapper } from './ChartsWrapper';
import { NewsWrapper } from './NewsWrapper';
import { AddTransactionModal } from '@/pages/transactions/components/AddTransactionModal';

const Dashboard = () => {
  // Data fetching hooks
  const { loading: dashboardLoading, monthly } = useDashboard();
  const { createTransaction } = useTransactions();

  // Business logic hooks
  const dashboardMetrics = useDashboardMetrics();
  const dashboardCharts = useDashboardCharts();
  const newsData = useNewsPage();
  const addTxModal = useModal(false);

  const {
    currentMonthMetrics,
    momDisplay,
    momColor,
    budgetUsedPct,
    budgetHealth,
  } = dashboardMetrics;
  const { donutData, budgetVsActualData, recentTransactions } = dashboardCharts;
  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshNow,
  } = newsData;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <DashboardHeader onAddTransaction={addTxModal.open} />

      {/* Metrics cards */}
      <CardsWrapper
        loading={dashboardLoading}
        income={currentMonthMetrics.income}
        expense={currentMonthMetrics.expense}
        savingsRate={currentMonthMetrics.savingsRate}
        momChange={momDisplay}
        momColor={momColor}
        budgetUsedPct={budgetUsedPct}
        budgetHealth={budgetHealth}
      />

      {/* Charts section */}
      <ChartsWrapper
        loading={dashboardLoading}
        donutData={donutData}
        monthly={monthly}
        bvaData={budgetVsActualData}
        recentTx={recentTransactions}
        setShowAddTx={addTxModal.open}
      />

      {/* Financial news section */}
      <NewsWrapper
        articles={articles}
        loading={newsLoading}
        error={newsError}
        onRefresh={refreshNow}
      />

      {/* Add transaction modal */}
      {addTxModal.isOpen && (
        <AddTransactionModal
          isOpen={addTxModal.isOpen}
          onClose={addTxModal.close}
          onCreate={async (input) => {
            await createTransaction(input);
            addTxModal.close();
          }}
        />
      )}
    </div>
  );
};

export { Dashboard };
