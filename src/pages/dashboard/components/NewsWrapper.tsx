import { NewsCard } from './NewsCard';

interface NewsWrapperProps {
  articles: any[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const NewsWrapper = ({
  articles,
  loading,
  error,
  onRefresh,
}: NewsWrapperProps) => (
  <div>
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Financial News
        </h2>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          Stay informed with relevant market updates
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        <span
          className={`material-icons-outlined text-base ${loading ? 'animate-spin' : ''}`}
        >
          refresh
        </span>
        Refresh
      </button>
    </div>

    {error ? (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
        <span className="material-icons-outlined text-amber-500">info</span>
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
            {error}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            Try again later.
          </p>
        </div>
      </div>
    ) : loading ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    ) : articles.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((article) => (
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
        <span className="material-icons-outlined text-4xl text-gray-300 mb-3 block">
          newspaper
        </span>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          No news articles available right now
        </p>
      </div>
    )}
  </div>
);
