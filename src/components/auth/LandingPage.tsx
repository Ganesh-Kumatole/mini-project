import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import dashboardPreviewImg from '../../assets/images/dashboard-preview_landingPage.avif';

// ── Dashboard UI Preview Image ────────────────────────────────────────────────
const DashboardPreview = () => (
  <div className="relative w-full max-w-5xl mx-auto mt-16 lg:mt-24 perspective-1000">
    <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent z-10 pointer-events-none" />
    
    <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-700 hover:scale-[1.02]">
      {/* Fake Top Bar (macOS style window controls) */}
      <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-3 bg-gray-50/10 dark:bg-gray-900/10 backdrop-blur-md z-20 border-b border-white/10 dark:border-border-dark/50 pointer-events-none">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
        </div>
      </div>

      {/* Actual Dashboard Screenshot Placeholder 
          (Using the local dashboard preview image from the root images folder) */}
      <img 
        src={dashboardPreviewImg}
        alt="Fintracker Dashboard Live Preview"
        className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  </div>
);

// ── Value Props Component ─────────────────────────────────────────────────────
const ValueProp = ({ title, desc, icon }: { title: string; desc: string; icon: string }) => (
  <div className="relative p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark group hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <span className="material-icons-outlined text-indigo-600 dark:text-indigo-400 text-2xl">{icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">{title}</h3>
    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">{desc}</p>
  </div>
);

// ── Main Layout ───────────────────────────────────────────────────────────────
export const LandingPage = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark selection:bg-indigo-500/30 transition-colors duration-300 flex flex-col overflow-hidden">
      
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-light/50 dark:border-border-dark/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="material-icons-outlined text-white text-base">account_balance_wallet</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Fintracker
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <span className="material-icons-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="h-5 w-px bg-border-light dark:bg-border-dark" />
            
            {user ? (
              <Link 
                to="/dashboard"
                className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Go to Workspace →
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-text-primary-light dark:bg-text-primary-dark text-background-light dark:text-background-dark text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Create space
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────── */}
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
          An open, secure, and intelligent workspace designed to give you absolute clarity over your income, expenses, and savings goals without the commercial clutter.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to={user ? "/dashboard" : "/signup"}
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
        
        {/* ── Features Section ──────────────────────────────────────── */}
        <div id="features" className="w-full mt-32 grid md:grid-cols-3 gap-6">
          <ValueProp 
            icon="speed"
            title="Instant Clarity"
            desc="No more spreadsheets. View your net balance, monthly burn rate, and savings percentage updated in real-time."
          />
          <ValueProp 
            icon="auto_awesome"
            title="Intelligent Insights"
            desc="Our local AI engine automatically parses your spending habits and provides actionable anomalies and warnings without sending data to third parties."
          />
          <ValueProp 
            icon="lock"
            title="Secure & Private"
            desc="Built on a robust localized architecture. Your financial tracking environment remains strictly your own."
          />
        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border-light dark:border-border-dark py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg">code</span>
            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Built as a personal utility tracker.
            </p>
          </div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-mono bg-surface-light dark:bg-surface-dark px-3 py-1 rounded border border-border-light dark:border-border-dark">
            Fintracker // {new Date().getFullYear()}
          </p>
        </div>
      </footer>

    </div>
  );
};
