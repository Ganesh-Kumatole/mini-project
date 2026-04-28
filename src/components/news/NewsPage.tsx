import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsCard } from '../dashboard/NewsCard';
import {
  fetchFinancialNews,
  NewsFilterOptions,
  NewsDataType,
  SortOption,
  NewsArticle,
  NewsCategory,
} from '../../services/news/newsService';

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  { code: 'IN', label: '🇮🇳 India', flag: '🇮🇳' },
  { code: 'US', label: '🇺🇸 USA', flag: '🇺🇸' },
  { code: 'GB', label: '🇬🇧 UK', flag: '🇬🇧' },
  { code: 'CA', label: '🇨🇦 Canada', flag: '🇨🇦' },
  { code: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺' },
  { code: 'DE', label: '🇩🇪 Germany', flag: '🇩🇪' },
  { code: 'JP', label: '🇯🇵 Japan', flag: '🇯🇵' },
  { code: 'SG', label: '🇸🇬 Singapore', flag: '🇸🇬' },
];

const CATEGORY_FILTERS: { value: NewsCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'newspaper' },
  { value: 'investment', label: 'Investing', icon: 'trending_up' },
  { value: 'savings', label: 'Savings', icon: 'savings' },
  { value: 'inflation', label: 'Inflation', icon: 'price_change' },
  { value: 'interest-rate', label: 'Interest Rates', icon: 'percent' },
  { value: 'spending', label: 'Spending', icon: 'shopping_cart' },
  { value: 'general', label: 'General', icon: 'public' },
];

const SORT_OPTIONS: { label: string; value: SortOption; icon: string }[] = [
  { label: 'Most Relevant', value: 'relevancy', icon: 'recommend' },
  { label: 'By Source', value: 'source', icon: 'source' },
  { label: 'Newest', value: 'fetched_at', icon: 'schedule' },
];

const DATATYPE_OPTIONS: { label: string; value: NewsDataType }[] = [
  { label: 'News', value: 'news' },
  { label: 'Blog', value: 'blog' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Opinion', value: 'opinion' },
  { label: 'Research', value: 'research' },
  { label: 'Press Release', value: 'press_release' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fintracker-saved-news') || '[]')); }
    catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDatatypes, setSelectedDatatypes] = useState<NewsDataType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevancy');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPages, setPrevPages] = useState<string[]>([]);

  // Auto-refresh countdown
  const [refreshCountdown, setRefreshCountdown] = useState(30 * 60);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Load articles ──
  const loadNews = useCallback(async (filters: NewsFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFinancialNews(filters);
      setArticles(response.articles);
      setNextPageToken(response.nextPage);
      setRefreshCountdown(30 * 60);
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filters: NewsFilterOptions = {
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
      datatypes: selectedDatatypes.length > 0 ? selectedDatatypes : undefined,
      sort: sortBy,
      page: currentPage || undefined,
    };
    loadNews(filters);
  }, [selectedCountries, selectedDatatypes, sortBy, currentPage, loadNews]);

  // Auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(c => {
        if (c <= 1) {
          loadNews({ countries: selectedCountries.length > 0 ? selectedCountries : undefined, sort: sortBy });
          return 30 * 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCountries, sortBy, loadNews]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Derived data ──
  const filteredArticles = articles.filter(a => {
    if (showSaved && !savedIds.has(a.id)) return false;
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Handlers ──
  const toggleSaved = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('fintracker-saved-news', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code)
        : prev.length < 5 ? [...prev, code] : prev
    );
    setCurrentPage(''); setPrevPages([]);
  };

  const toggleDatatype = (dt: NewsDataType) => {
    setSelectedDatatypes(prev =>
      prev.includes(dt) ? prev.filter(d => d !== dt)
        : prev.length < 5 ? [...prev, dt] : prev
    );
    setCurrentPage(''); setPrevPages([]);
  };

  const handleNextPage = () => {
    if (nextPageToken) { setPrevPages(p => [...p, currentPage]); setCurrentPage(nextPageToken); }
  };
  const handlePrevPage = () => {
    if (prevPages.length > 0) {
      const pages = [...prevPages];
      const prev = pages.pop()!;
      setPrevPages(pages);
      setCurrentPage(prev);
    }
  };

  const refreshNow = () => {
    loadNews({ countries: selectedCountries.length > 0 ? selectedCountries : undefined, sort: sortBy });
  };

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Financial News</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Live market updates · Auto-refreshes in{' '}
            <span className="font-medium text-indigo-500">{formatCountdown(refreshCountdown)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSaved(s => !s); }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showSaved ? 'bg-indigo-600 text-white border-indigo-600' : 'border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-indigo-400'}`}
          >
            <span className="material-icons text-base">{showSaved ? 'bookmark' : 'bookmark_border'}</span>
            Saved {savedIds.size > 0 && <span className="bg-white/20 text-xs px-1 rounded">{savedIds.size}</span>}
          </button>
          <button
            onClick={refreshNow}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:border-indigo-400 transition-colors disabled:opacity-50"
          >
            <span className={`material-icons text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────── */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-text-secondary-light dark:text-text-secondary-dark text-lg">search</span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Search articles… (press "/" to focus)'
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-lg">close</button>
        )}
      </div>

      {/* ── Category Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:border-indigo-400'
            }`}
          >
            <span className="material-icons-outlined text-sm">{cat.icon}</span>
            {cat.label}
            {cat.value !== 'all' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {articles.filter(a => a.category === cat.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Filter Panel ────────────────────────────────────────────── */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Countries */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide mb-2">
              Countries <span className="font-normal">(max 5)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRY_OPTIONS.map(c => (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  disabled={selectedCountries.length >= 5 && !selectedCountries.includes(c.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedCountries.includes(c.code)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-border-light dark:bg-border-dark hidden md:block" />

          {/* Content Type */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide mb-2">
              Content Type <span className="font-normal">(max 5)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DATATYPE_OPTIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => toggleDatatype(d.value)}
                  disabled={selectedDatatypes.length >= 5 && !selectedDatatypes.includes(d.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedDatatypes.includes(d.value)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-border-light dark:bg-border-dark hidden md:block" />

          {/* Sort */}
          <div>
            <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide mb-2">Sort By</p>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setCurrentPage(''); setPrevPages([]); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="material-icons-outlined text-sm">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters summary */}
        {(selectedCountries.length > 0 || selectedDatatypes.length > 0) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border-light dark:border-border-dark">
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Active filters:</span>
            {selectedCountries.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                {c}
                <button onClick={() => toggleCountry(c)} className="material-icons text-xs leading-none">close</button>
              </span>
            ))}
            {selectedDatatypes.map(d => (
              <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                {d}
                <button onClick={() => toggleDatatype(d)} className="material-icons text-xs leading-none">close</button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedCountries([]); setSelectedDatatypes([]); setCurrentPage(''); setPrevPages([]); }}
              className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Error State ─────────────────────────────────────────────── */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
          <span className="material-icons-outlined text-amber-500 mt-0.5">info</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{error}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Check your API configuration or try again later.</p>
          </div>
          <button onClick={refreshNow} className="text-xs text-amber-700 dark:text-amber-300 font-medium hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
            Retry →
          </button>
        </div>
      )}

      {/* ── Articles Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Showing <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{filteredArticles.length}</span> articles
            {searchQuery && <> matching "<span className="italic">{searchQuery}</span>"</>}
            {showSaved && ' · Saved only'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <div key={article.id} className="relative group">
                <NewsCard
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
                {/* Bookmark overlay */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSaved(article.id); }}
                  className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition-all ${savedIds.has(article.id) ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400'} opacity-0 group-hover:opacity-100`}
                  title={savedIds.has(article.id) ? 'Remove bookmark' : 'Bookmark'}
                >
                  <span className="material-icons text-sm">{savedIds.has(article.id) ? 'bookmark' : 'bookmark_border'}</span>
                </button>
              </div>
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-light dark:border-border-dark">
            <button
              onClick={handlePrevPage}
              disabled={prevPages.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-icons text-base">arrow_back</span>
              Previous
            </button>
            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Page {prevPages.length + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!nextPageToken}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <span className="material-icons text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="material-icons-outlined text-3xl text-indigo-400">
              {showSaved ? 'bookmark_border' : 'newspaper'}
            </span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {showSaved ? 'No saved articles' : searchQuery ? 'No results found' : 'No articles available'}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {showSaved ? 'Hover over a card and click the bookmark icon to save articles.'
                : searchQuery ? `Try a different search term or clear filters.`
                : 'Try adjusting your country or content type filters.'}
            </p>
          </div>
          {(searchQuery || selectedCountries.length > 0 || selectedDatatypes.length > 0 || showSaved) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCountries([]); setSelectedDatatypes([]); setShowSaved(false); setActiveCategory('all'); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <span className="material-icons text-base">refresh</span>
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
