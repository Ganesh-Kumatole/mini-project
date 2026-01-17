import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const LandingPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-icons-round text-xl">
                  account_balance_wallet
                </span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Fintracker
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={toggleTheme}
              >
                <span
                  className={`material-icons-round ${isDark ? 'hidden' : ''}`}
                >
                  dark_mode
                </span>
                <span
                  className={`material-icons-round ${isDark ? '' : 'hidden'}`}
                >
                  light_mode
                </span>
              </button>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:border-slate-50 dark:hover:text-white transition-colors px-3 py-2 rounded-lg border border-transparent hover:border-primary"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-10 lg:pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                v2.0 is now live
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                Take Control of Your
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {' '}
                  Finances
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Manage transactions, set budgets, track expenses, and gain
                insights into your spending patterns. Fintracker gives you
                complete visibility and control over your financial life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl text-white bg-primary hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Get Started Now
                  <span className="material-icons-round ml-2 text-sm">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative lg:h-[600px] w-full flex items-center justify-center">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="flex h-[300px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 items-center justify-center">
                  <div className="text-center">
                    <span className="material-icons text-6xl text-slate-300 dark:text-slate-600 mb-4">
                      dashboard
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 mt-4">
                      Dashboard Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-surface-light dark:bg-surface-dark"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              All-in-One Financial Management
            </p>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Powerful tools integrated into one seamless dashboard to give you
              complete control.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-primary mb-6">
                <span className="material-icons-outlined text-2xl">
                  account_balance_wallet
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Transaction Management
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Track all your income and expenses across multiple categories.
                Organize transactions with custom tags and easily find spending
                patterns.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <span className="material-icons-outlined text-2xl">
                  pie_chart
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Budget Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Set budgets for each category and monitor your spending in
                real-time. Get alerts when approaching your budget limits.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <span className="material-icons-outlined text-2xl">
                  analytics
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Smart Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Get AI-powered recommendations to optimize your spending.
                Visualize your financial health with comprehensive reports and
                charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="py-20 bg-primary relative overflow-hidden"
        id="testimonials"
      >
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="material-icons-round text-6xl text-blue-300 mb-6 block mx-auto opacity-50">
            format_quote
          </span>
          <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 leading-relaxed">
            "I used to track my expenses in a messy spreadsheet. Fintracker
            completely changed how I view my money. The automated insights alone
            saved me over $300 last month."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <img
              alt="Testimonial User"
              className="w-14 h-14 rounded-full border-2 border-white/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtE7X-_WJ6SXjAsoxEaDNPdaNhhSQL2aFKRzqcFo4fCB1ydF0l2E-OQT1wCI6mhm7fN0kkHu2uUlkQgzRkFgiOW7LKX5_5C5FrySfJAupF6c2NDhch4R6dWzzRQtr2JJAaF5xGxGL3Kph1LdlLbvpNvyoYDRBWt5olEUcTEeFq7plSumzYaLxuWrEoiy59_n5qkkvbiwQ8qdgpCAN0-WpCrmfJdP2nTTHeQMUKGSORGDZNsHdL7tg77RoWj7fO4fuOdVMl6AJD4HA"
            />
            <div className="text-left">
              <div className="text-white font-bold text-lg">Alex Johnson</div>
              <div className="text-blue-200">Freelance Designer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-light dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white p-1 rounded flex items-center justify-center">
                  <span className="material-icons-round text-lg">
                    account_balance_wallet
                  </span>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  Fintracker
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Making personal finance management simple, automated, and
                intelligent for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#features"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Pricing
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2026 Fintracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
