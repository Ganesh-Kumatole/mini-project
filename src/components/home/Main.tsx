import { Link } from 'react-router-dom';
import { DashboardPreview, FeatureCard } from './';
import { User as FirebaseUser } from 'firebase/auth';

const Main = ({ user }: { user: FirebaseUser | null }) => {
  return (
    <main className="flex-1 pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-[100%] pointer-events-none -z-10" />

      <div className="text-center max-w-3xl border border-gray-400/20 dark:border-gray-500/20 rounded-full px-4 py-1.5 mb-8 inline-flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-mono">
          Personal finance workspace
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark mb-6 leading-[1.1]">
        Your money, <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          mapped out perfectly.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mb-10 leading-relaxed">
        An open, secure, and intelligent workspace designed to give you absolute
        clarity over your income, expenses, and savings goals without the
        commercial clutter.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          to={user ? '/dashboard' : '/signup'}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto text-center"
        >
          {user ? 'Open Workspace' : 'Start tracking locally'}
        </Link>
        <a
          href="#features"
          className="px-8 py-3.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark font-medium text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full sm:w-auto text-center"
        >
          Explore features
        </a>
      </div>

      {/* Dashboard Live Mockup */}
      <DashboardPreview />

      {/* ── Features Section */}
      <div id="features" className="w-full mt-32 grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon="speed"
          title="Instant Clarity"
          desc="No more spreadsheets. View your net balance, monthly burn rate, and savings percentage updated in real-time."
        />
        <FeatureCard
          icon="auto_awesome"
          title="Intelligent Insights"
          desc="Our local AI engine automatically parses your spending habits and provides actionable anomalies and warnings without sending data to third parties."
        />
        <FeatureCard
          icon="lock"
          title="Secure & Private"
          desc="Built on a robust localized architecture. Your financial tracking environment remains strictly your own."
        />
      </div>
    </main>
  );
};

export { Main };
