import { useState } from 'react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  lastUpdated: string;
}

export const Accounts = () => {
  const [accounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Primary Checking',
      type: 'checking',
      balance: 5420.5,
      lastUpdated: 'Jul 28, 2024',
    },
    {
      id: '2',
      name: 'Emergency Fund',
      type: 'savings',
      balance: 15230.0,
      lastUpdated: 'Jul 25, 2024',
    },
    {
      id: '3',
      name: 'Credit Card',
      type: 'credit',
      balance: -780.2,
      lastUpdated: 'Jul 28, 2024',
    },
  ]);

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = accounts
    .filter((acc) => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return 'account_balance';
      case 'savings':
        return 'savings';
      case 'credit':
        return 'credit_card';
      case 'investment':
        return 'trending_up';
      default:
        return 'account_balance';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Accounts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your connected bank accounts and credit cards
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all">
            <span className="material-icons-outlined text-xl">refresh</span>
            Refresh
          </button>
          <button className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
            <span className="material-icons-outlined text-xl">add</span>
            Add Account
          </button>
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="mb-8 p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-blue-900/40 dark:via-slate-800 dark:to-slate-900 rounded-2xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
              Total Net Worth
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-2">
              ${totalNetWorth.toFixed(2)}
            </h2>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="material-icons-outlined text-sm">
                trending_up
              </span>
              <span className="text-sm font-medium">+2.3% from last month</span>
            </div>
          </div>
          <div className="flex gap-8 text-center md:text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-emerald-400 text-sm font-medium mb-1">
                Assets
              </p>
              <p className="text-2xl font-bold">${totalAssets.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-rose-400 text-sm font-medium mb-1">
                Liabilities
              </p>
              <p className="text-2xl font-bold">
                ${totalLiabilities.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-primary text-white">
          All Accounts
        </button>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
          Checking
        </button>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
          Savings
        </button>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
          Credit Cards
        </button>
        <button className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
          Investments
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="material-icons text-blue-600 dark:text-blue-400">
                  {getAccountIcon(account.type)}
                </span>
              </div>
              <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
              {account.name}
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-4">
              Updated {account.lastUpdated}
            </p>
            <div className="pt-4 border-t border-border-light dark:border-border-dark">
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                Balance
              </p>
              <p
                className={`text-2xl font-bold ${
                  account.balance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                ${account.balance.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
            <span className="material-icons-outlined text-3xl text-primary group-hover:scale-110 transition-transform">
              swap_horiz
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Transfer
            </span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
            <span className="material-icons-outlined text-3xl text-emerald-500 group-hover:scale-110 transition-transform">
              receipt
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pay Bills
            </span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
            <span className="material-icons-outlined text-3xl text-blue-500 group-hover:scale-110 transition-transform">
              send
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Send Money
            </span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
            <span className="material-icons-outlined text-3xl text-purple-500 group-hover:scale-110 transition-transform">
              account_balance_wallet
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              View Details
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
