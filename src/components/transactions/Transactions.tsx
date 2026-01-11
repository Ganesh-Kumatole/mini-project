import { useState } from 'react';

export const Transactions = () => {
  const [transactions] = useState([
    {
      id: '1',
      date: 'Jul 28, 2024',
      description: 'Weekly groceries from SuperMart',
      category: 'Groceries',
      amount: 85.5,
      type: 'Expense',
    },
    {
      id: '2',
      date: 'Jul 27, 2024',
      description: 'Freelance project payment (May-June)',
      category: 'Income',
      amount: 1500.0,
      type: 'Income',
    },
  ]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and manage all your financial transactions.
        </p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* Filters Section */}
        <div className="p-5 border-b border-border-light dark:border-border-dark space-y-4">
          <div className="w-full">
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Search transactions..."
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="material-icons-outlined text-gray-500 dark:text-gray-400 text-lg">
                  calendar_today
                </span>
                Date Range
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="material-icons-outlined text-gray-500 dark:text-gray-400 text-lg">
                  filter_list
                </span>
                All Categories
              </button>
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-sm font-medium border border-border-light dark:border-border-dark">
                <button className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm rounded-md transition-all">
                  All
                </button>
                <button className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Income
                </button>
                <button className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Expense
                </button>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 lg:flex-none">
                <span className="material-icons-outlined text-lg">
                  delete_outline
                </span>
                Bulk Delete
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md transition-colors flex-1 lg:flex-none">
                <span className="material-icons-outlined text-lg">add</span>
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-100 font-semibold">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'Expense'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <span className="material-icons-outlined text-lg">
                          edit
                        </span>
                      </button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-icons-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
