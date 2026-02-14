import { useState, useEffect } from 'react';
import { Layout } from '../layout';
import { NewsCard } from '../dashboard/NewsCard';
import {
  fetchFinancialNews,
  NewsFilterOptions,
  NewsDataType,
  SortOption,
  NewsArticle,
} from '../../services/news/newsService';

// List of common countries for filtering (ISO country codes)
const COUNTRY_OPTIONS = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'SG', label: 'Singapore' },
  { code: 'HK', label: 'Hong Kong' },
];

const DATATYPE_OPTIONS: { label: string; value: NewsDataType }[] = [
  { label: 'News', value: 'news' },
  { label: 'Blog', value: 'blog' },
  { label: 'Multimedia', value: 'multimedia' },
  { label: 'Forum', value: 'forum' },
  { label: 'Press Release', value: 'press_release' },
  { label: 'Review', value: 'review' },
  { label: 'Research', value: 'research' },
  { label: 'Opinion', value: 'opinion' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Podcast', value: 'podcast' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevancy', value: 'relevancy' },
  { label: 'Source', value: 'source' },
  { label: 'Fetched Date', value: 'fetched_at' },
];

export function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDatatypes, setSelectedDatatypes] = useState<NewsDataType[]>(
    [],
  );
  const [sortBy, setSortBy] = useState<SortOption>('relevancy');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<string>('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPages, setPrevPages] = useState<string[]>([]);

  // Load news articles
  const loadNews = async (filters: NewsFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFinancialNews(filters);
      setArticles(response.articles);
      setNextPageToken(response.nextPage);
    } catch (err) {
      setError('Failed to load news articles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const filters: NewsFilterOptions = {
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
      datatypes: selectedDatatypes.length > 0 ? selectedDatatypes : undefined,
      sort: sortBy,
      page: currentPage || undefined,
    };
    loadNews(filters);
  }, [selectedCountries, selectedDatatypes, sortBy, currentPage]);

  // Handle country filter change
  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else if (prev.length < 5) {
        return [...prev, code];
      }
      return prev;
    });
    setCurrentPage('');
    setPrevPages([]);
  };

  // Handle datatype filter change
  const toggleDatatype = (datatype: NewsDataType) => {
    setSelectedDatatypes((prev) => {
      if (prev.includes(datatype)) {
        return prev.filter((d) => d !== datatype);
      } else if (prev.length < 5) {
        return [...prev, datatype];
      }
      return prev;
    });
    setCurrentPage('');
    setPrevPages([]);
  };

  // Handle next page
  const handleNextPage = () => {
    if (nextPageToken) {
      setPrevPages((prev) => [...prev, currentPage]);
      setCurrentPage(nextPageToken);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (prevPages.length > 0) {
      const newPrevPages = [...prevPages];
      const previousPage = newPrevPages.pop();
      setPrevPages(newPrevPages);
      setCurrentPage(previousPage || '');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial News
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with the latest financial news and insights
          </p>
        </div>

        {/* Filters & Sort Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Countries (Max 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_OPTIONS.map((country) => (
                <button
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCountries.includes(country.code)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${
                    selectedCountries.length >= 5 &&
                    !selectedCountries.includes(country.code)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={
                    selectedCountries.length >= 5 &&
                    !selectedCountries.includes(country.code)
                  }
                >
                  {country.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datatype Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content Type (Max 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {DATATYPE_OPTIONS.map((dtype) => (
                <button
                  key={dtype.value}
                  onClick={() => toggleDatatype(dtype.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDatatypes.includes(dtype.value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${
                    selectedDatatypes.length >= 5 &&
                    !selectedDatatypes.includes(dtype.value)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={
                    selectedDatatypes.length >= 5 &&
                    !selectedDatatypes.includes(dtype.value)
                  }
                >
                  {dtype.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setCurrentPage('');
                setPrevPages([]);
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-800 rounded-lg h-80 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Articles Grid (3x3) */}
        {!loading && articles.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
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

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={prevPages.length === 0}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Page {prevPages.length + 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!nextPageToken}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No articles found with selected filters. Try adjusting your
              search.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
