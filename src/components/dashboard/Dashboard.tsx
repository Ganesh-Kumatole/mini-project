import { useState, useEffect } from 'react';
import { useDashboard, useTransactions } from '@/hooks';
import { formatCurrency } from '@/utils/formatters';
import { LineChart, DonutChart } from './Charts';
import { NewsCard } from './NewsCard';
import { fetchFinancialNews, NewsArticle } from '@/services/news/newsService';

export const Dashboard = () => {
  const { totals, monthly, loading } = useDashboard();
  const { transactions } = useTransactions();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Load news on mount
  useEffect(() => {
    loadNews();

    // Auto-refresh news every 30 minutes
    const interval = setInterval(loadNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      const response = await fetchFinancialNews({ sort: 'relevancy' });
      setNews(response.articles.slice(0, 3)); // Show top 3 most relevant
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsError('Unable to load news at the moment');
    } finally {
      setNewsLoading(false);
    }
  };

  const handleRefreshNews = () => {
    loadNews();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Total Balance
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            {formatCurrency(totals.totalIncome - totals.totalExpense)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_upward
              </span>
              {totals.totalIncome > 0
                ? `${(((totals.totalIncome - totals.totalExpense) / Math.max(totals.totalIncome, 1)) * 100).toFixed(1)}%`
                : '0%'}
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              this month
            </span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                north
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Monthly Income
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            {formatCurrency(totals.totalIncome)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_upward
              </span>
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              up from last month
            </span>
          </div>
        </div>

        {/* Monthly Expenses Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                south
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Monthly Expenses
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            {formatCurrency(totals.totalExpense)}
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-red-500 flex items-center font-medium">
              <span className="material-icons text-base mr-0.5">
                arrow_downward
              </span>
            </span>
            <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-xs">
              down from last month
            </span>
          </div>
        </div>

        {/* Budget Usage Card */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="material-icons text-gray-600 dark:text-gray-300">
                percent
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Budget Usage %
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
            {Math.min(
              Math.round(
                (totals.totalExpense / Math.max(totals.totalIncome, 1)) * 100,
              ),
              100,
            )}
            %
          </h3>
          <div className="flex items-center text-sm">
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
              approximate
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{
                width: `${Math.min((totals.totalExpense / Math.max(totals.totalIncome, 1)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense Breakdown (Donut) */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Expense Breakdown (Last 30 days)
          </h3>
          <div className="relative h-64 w-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              (() => {
                const recentSince = new Date();
                recentSince.setDate(recentSince.getDate() - 30);
                const recent = transactions.filter(
                  (t) =>
                    new Date(t.date) >= recentSince && t.type === 'expense',
                );
                const grouped = recent.reduce<Record<string, number>>(
                  (acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                  },
                  {},
                );
                const labels = Object.keys(grouped).slice(0, 8);
                const data = labels.map((l) => grouped[l] || 0);
                if (labels.length === 0)
                  return (
                    <div className="flex items-center justify-center">
                      No recent expenses
                    </div>
                  );
                return <DonutChart labels={labels} data={data} />;
              })()
            )}
          </div>
        </div>

        {/* Income vs Expense Trend (Line) */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6">
            Income vs. Expense Trend
          </h3>
          <div className="relative h-64 w-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              (() => {
                const labels = monthly.map((m) => m.month);
                const income = monthly.map((m) => m.income);
                const expense = monthly.map((m) => m.expense);
                return (
                  <LineChart
                    labels={labels}
                    income={income}
                    expense={expense}
                  />
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* FINANCIAL NEWS SECTION - NEW */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Financial News & Insights
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Stay updated with relevant financial news to help with your
              budgeting decisions
            </p>
          </div>
          <button
            onClick={handleRefreshNews}
            disabled={newsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span
              className={`material-icons-outlined ${newsLoading ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
            Refresh
          </button>
        </div>

        {/* News Grid */}
        {newsError ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 flex items-start gap-3">
            <span className="material-icons-outlined text-amber-600 dark:text-amber-400 mt-0.5">
              info
            </span>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {newsError}
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                Please check your API configuration or try again later
              </p>
            </div>
          </div>
        ) : newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse"
              />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard
                key={article.id}
                title={article.title}
                description={article.description}
                source={article.source}
                publishedAt={article.publishedAt}
                imageUrl={article.imageUrl}
                category={article.category}
                url={article.url}
                relevance={article.relevance}
                country={article.country}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-8 text-center">
            <span className="material-icons-outlined text-4xl text-gray-400 dark:text-gray-600 mb-3 block">
              newspaper
            </span>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              No news articles available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
