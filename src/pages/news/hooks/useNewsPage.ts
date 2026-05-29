import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchFinancialNews,
  NewsFilterOptions,
  NewsDataType,
  SortOption,
  NewsArticle,
  NewsCategory,
} from '@/services/news/newsService';

export const useNewsPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('fintracker-saved-news') || '[]'));
    } catch {
      return new Set();
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filter state
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDatatypes, setSelectedDatatypes] = useState<NewsDataType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevancy');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPages, setPrevPages] = useState<string[]>([]);

  // Auto-refresh timer state
  const [refreshCountdown, setRefreshCountdown] = useState(30 * 60);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetches news data based on applied filters
  const loadNews = useCallback(async (filters: NewsFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFinancialNews(filters);
      setArticles(response.articles);
      setNextPageToken(response.nextPage);
      setRefreshCountdown(30 * 60); // Reset timer
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger data load when filters change
  useEffect(() => {
    const filters: NewsFilterOptions = {
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
      datatypes: selectedDatatypes.length > 0 ? selectedDatatypes : undefined,
      sort: sortBy,
      page: currentPage || undefined,
    };
    loadNews(filters);
  }, [selectedCountries, selectedDatatypes, sortBy, currentPage, loadNews]);

  // Handle auto-refresh functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((c) => {
        if (c <= 1) {
          loadNews({
            countries: selectedCountries.length > 0 ? selectedCountries : undefined,
            sort: sortBy,
          });
          return 30 * 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCountries, sortBy, loadNews]);

  // Handle keyboard shortcut for focusing search
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

  // Compute derived view data
  const filteredArticles = articles.filter((a) => {
    if (showSaved && !savedIds.has(a.id)) return false;
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle bookmarking of an article
  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('fintracker-saved-news', JSON.stringify([...next]));
      return next;
    });
  };

  // Toggle country filter
  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 5
          ? [...prev, code]
          : prev
    );
    setCurrentPage('');
    setPrevPages([]);
  };

  // Toggle data type filter
  const toggleDatatype = (dt: NewsDataType) => {
    setSelectedDatatypes((prev) =>
      prev.includes(dt)
        ? prev.filter((d) => d !== dt)
        : prev.length < 5
          ? [...prev, dt]
          : prev
    );
    setCurrentPage('');
    setPrevPages([]);
  };

  // Navigate to the next page of results
  const handleNextPage = () => {
    if (nextPageToken) {
      setPrevPages((p) => [...p, currentPage]);
      setCurrentPage(nextPageToken);
    }
  };

  // Navigate to the previous page of results
  const handlePrevPage = () => {
    if (prevPages.length > 0) {
      const pages = [...prevPages];
      const prev = pages.pop()!;
      setPrevPages(pages);
      setCurrentPage(prev);
    }
  };

  // Immediate manual refresh
  const refreshNow = () => {
    loadNews({
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
      sort: sortBy,
    });
  };

  // Formatting utility for countdown
  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountries([]);
    setSelectedDatatypes([]);
    setShowSaved(false);
    setActiveCategory('all');
  };

  return {
    articles,
    filteredArticles,
    savedIds,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    selectedCountries,
    setSelectedCountries,
    selectedDatatypes,
    setSelectedDatatypes,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showSaved,
    setShowSaved,
    currentPage,
    setCurrentPage,
    nextPageToken,
    prevPages,
    setPrevPages,
    refreshCountdown,
    searchInputRef,
    toggleSaved,
    toggleCountry,
    toggleDatatype,
    handleNextPage,
    handlePrevPage,
    refreshNow,
    formatCountdown,
    clearFilters,
  };
};
