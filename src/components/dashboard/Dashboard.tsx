import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '@/hooks';
import { useInsights } from '@/hooks/useInsights';
import { useCurrency } from '@/context/CurrencyContext';
import { formatDate } from '@/utils/formatters';
import { LineChart, DonutChart, BudgetBarChart } from './Charts';
import { NewsCard } from './NewsCard';
import { fetchFinancialNews, NewsArticle } from '@/services/news/newsService';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';
import { useTransactions } from '@/hooks';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  id, icon, iconBg, label, value, sub, subColor, progress,
}: {
  id: string; icon: string; iconBg: string; label: string;
  value: string; sub: string; subColor?: string; progress?: number;
}) => (
  <div id={id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        <span className="material-icons text-white text-xl">{icon}</span>
      </div>
      <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">{label}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{value}</p>
      <p className={`text-xs mt-1 font-medium ${subColor || 'text-text-secondary-light dark:text-text-secondary-dark'}`}>{sub}</p>
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

// ── Skeleton pulse ─────────────────────────────────────────────────────────────
const Skeleton = ({ h = 'h-4', w = 'w-full', rounded = 'rounded' }: { h?: string; w?: string; rounded?: string }) => (
  <div className={`${h} ${w} ${rounded} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { formatAmount } = useCurrency();
  const { monthly, loading } = useDashboard();
  const { transactions, createTransaction } = useTransactions();
  // useInsights is used only for monthOverMonthChange & budgetHealth (complex calcs)
  const insights = useInsights();
  const { monthOverMonthChange, budgetHealth } = insights.computed || {};

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [showAddTx, setShowAddTx] = useState(false);

  // ── Current-month stats derived directly from the live transactions array
  // This avoids a race condition where useInsights has a separate useTransactions
  // instance that may lag behind the one on this page.
  const { currentIncome, currentExpense, savingsRate } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = transactions.filter(t => new Date(t.date) >= startOfMonth);
    const income  = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const rate    = income > 0 ? Math.min(Math.max(((income - expense) / income) * 100, 0), 100) : 0;
    return { currentIncome: income, currentExpense: expense, savingsRate: rate };
  }, [transactions]);

  // Load news on mount
  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true); setNewsError(null);
        const response = await fetchFinancialNews({ sort: 'relevancy' });
        setNews(response.articles.slice(0, 3));
      } catch { setNewsError('Unable to load news at the moment'); }
      finally { setNewsLoading(false); }
    };
    loadNews();
    const iv = setInterval(loadNews, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Computed stat card values ──
  const momDisplay = useMemo(() => {
    if (monthOverMonthChange == null) return '—';
    const sign = monthOverMonthChange > 0 ? '+' : '';
    return `${sign}${monthOverMonthChange.toFixed(1)}% vs last month`;
  }, [monthOverMonthChange]);

  const momColor = monthOverMonthChange != null && monthOverMonthChange > 0
    ? 'text-red-500' : 'text-emerald-500';

  const budgetUsedPct = useMemo(() => {
    const list = budgetHealth || [];
    const totalLimit = list.reduce((s: number, b: any) => s + b.limitAmount, 0);
    const totalSpent = list.reduce((s: number, b: any) => s + b.spentAmount, 0);
    return totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  }, [budgetHealth]);

  // ── Donut chart data (last 30 days expenses by category) ──
  const donutData = useMemo(() => {
    const since = new Date(); since.setDate(since.getDate() - 30);
    const expenses = transactions.filter(t => new Date(t.date) >= since && t.type === 'expense');
    const grouped = expenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) };
  }, [transactions]);

  // ── Budget vs Actual Bar data ──
  const bvaData = useMemo(() => {
    const list = budgetHealth || [];
    return {
      labels: list.slice(0, 6).map((b: any) => b.category),
      budgeted: list.slice(0, 6).map((b: any) => b.limitAmount),
      actual: list.slice(0, 6).map((b: any) => b.spentAmount),
    };
  }, [budgetHealth]);

  // ── Recent transactions (last 5) ──
  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [transactions]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Dashboard</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} overview
          </p>
        </div>
        <button
          id="dashboard-add-tx"
          onClick={() => setShowAddTx(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <span className="material-icons text-base">add</span>
          Add Transaction
        </button>
      </div>

      {/* ── 4 Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark space-y-3">
            <Skeleton h="h-10" w="w-10" rounded="rounded-xl" />
            <Skeleton h="h-7" w="w-24" />
            <Skeleton h="h-3" w="w-32" />
          </div>
        )) : <>
          <StatCard
            id="stat-balance"
            icon="account_balance_wallet"
            iconBg="bg-indigo-500"
            label="Net Balance"
            value={formatAmount(currentIncome - currentExpense)}
            sub={`Savings rate: ${savingsRate.toFixed(1)}%`}
            subColor={savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}
          />
          <StatCard
            id="stat-income"
            icon="north"
            iconBg="bg-emerald-500"
            label="Monthly Income"
            value={formatAmount(currentIncome)}
            sub={momDisplay}
            subColor="text-emerald-500"
          />
          <StatCard
            id="stat-expense"
            icon="south"
            iconBg="bg-red-500"
            label="Monthly Expenses"
            value={formatAmount(currentExpense)}
            sub={momDisplay}
            subColor={momColor}
          />
          <StatCard
            id="stat-budget"
            icon="savings"
            iconBg={budgetUsedPct > 90 ? 'bg-red-500' : budgetUsedPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}
            label="Budget Used"
            value={`${budgetUsedPct}%`}
            sub={`${budgetHealth.length} budget${budgetHealth.length !== 1 ? 's' : ''} active`}
            subColor={budgetUsedPct > 90 ? 'text-red-500' : 'text-text-secondary-light dark:text-text-secondary-dark'}
            progress={budgetUsedPct}
          />
        </>}
      </div>

      {/* ── Row 2: Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: Category breakdown */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Spending by Category <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">(last 30 days)</span>
          </h3>
          <div className="h-60">
            {loading ? <Skeleton h="h-full" rounded="rounded-xl" /> :
              donutData.labels.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <span className="material-icons text-3xl text-gray-300">donut_large</span>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No expenses in last 30 days</p>
                </div>
              ) : <DonutChart labels={donutData.labels} data={donutData.data} />
            }
          </div>
        </div>

        {/* Line: Income vs Expense trend */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
            Income vs. Expenses <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">(6 months)</span>
          </h3>
          <div className="h-60">
            {loading ? <Skeleton h="h-full" rounded="rounded-xl" /> : (
              <LineChart
                labels={monthly.map(m => m.month)}
                income={monthly.map(m => m.income)}
                expense={monthly.map(m => m.expense)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Budget Bar Chart + Recent Transactions ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Bar */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">Budget vs. Actual</h3>
            <Link to="/budgets" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">Manage →</Link>
          </div>
          <div className="h-52">
            {loading ? <Skeleton h="h-full" rounded="rounded-xl" /> :
              bvaData.labels.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <span className="material-icons text-3xl text-gray-300">bar_chart</span>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No budgets set yet</p>
                  <Link to="/budgets" className="text-xs text-indigo-500 font-medium mt-1">Create a budget →</Link>
                </div>
              ) : (
                <BudgetBarChart labels={bvaData.labels} budgeted={bvaData.budgeted} actual={bvaData.actual} />
              )
            }
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <Skeleton h="h-9" w="w-9" rounded="rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton h="h-3.5" w="w-3/4" />
                    <Skeleton h="h-3" w="w-1/3" />
                  </div>
                  <Skeleton h="h-4" w="w-16" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <span className="material-icons text-3xl text-gray-300">receipt_long</span>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No transactions yet</p>
              <button onClick={() => setShowAddTx(true)} className="text-xs text-indigo-500 font-medium mt-1">Add your first →</button>
            </div>
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <span className={`material-icons text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.type === 'income' ? 'north' : 'south'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">{tx.description}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{tx.category} · {formatDate(new Date(tx.date))}</p>
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 tabular-nums ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Financial News ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Financial News</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Stay informed with relevant market updates</p>
          </div>
          <button
            onClick={async () => {
              setNewsLoading(true);
              try { const r = await fetchFinancialNews({ sort: 'relevancy' }); setNews(r.articles.slice(0, 3)); setNewsError(null); }
              catch { setNewsError('Refresh failed'); }
              finally { setNewsLoading(false); }
            }}
            disabled={newsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <span className={`material-icons-outlined text-base ${newsLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>

        {newsError ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
            <span className="material-icons-outlined text-amber-500">info</span>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">{newsError}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Check your API configuration or try again later.</p>
            </div>
          </div>
        ) : newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map(article => (
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
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-10 text-center">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-3 block">newspaper</span>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">No news articles available right now</p>
          </div>
        )}
      </div>

      {/* ── Quick-Add Modal ───────────────────────────────────────── */}
      {showAddTx && (
        <AddTransactionModal
          isOpen={showAddTx}
          onClose={() => setShowAddTx(false)}
          onCreate={async (input) => { await createTransaction(input); setShowAddTx(false); }}
        />
      )}
    </div>
  );
};
