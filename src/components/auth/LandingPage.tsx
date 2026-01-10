import { Link } from 'react-router-dom'

export const LandingPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <nav className="fixed w-full z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-icons-round text-xl">account_balance_wallet</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Fintracker
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 transition-all shadow-lg hover:shadow-glow"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                Master your money with{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  AI-Powered
                </span>{' '}
                insights.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Stop guessing where your money goes. Fintracker uses advanced AI to categorize
                expenses, scan receipts, and visualize your financial health in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl text-white bg-primary hover:bg-blue-700 transition-all shadow-lg"
                >
                  Start Free Trial{' '}
                  <span className="material-icons-round ml-2 text-sm">arrow_forward</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
