import { NewsCategory, SortOption, NewsDataType } from '@/services/news/newsService';

// Available country filters for the news API
export const COUNTRY_OPTIONS = [
  { code: 'IN', label: '🇮🇳 India', flag: '🇮🇳' },
  { code: 'US', label: '🇺🇸 USA', flag: '🇺🇸' },
  { code: 'GB', label: '🇬🇧 UK', flag: '🇬🇧' },
  { code: 'CA', label: '🇨🇦 Canada', flag: '🇨🇦' },
  { code: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺' },
  { code: 'DE', label: '🇩🇪 Germany', flag: '🇩🇪' },
  { code: 'JP', label: '🇯🇵 Japan', flag: '🇯🇵' },
  { code: 'SG', label: '🇸🇬 Singapore', flag: '🇸🇬' },
];

// Available category filters mapping
export const CATEGORY_FILTERS: { value: NewsCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'newspaper' },
  { value: 'investment', label: 'Investing', icon: 'trending_up' },
  { value: 'savings', label: 'Savings', icon: 'savings' },
  { value: 'inflation', label: 'Inflation', icon: 'price_change' },
  { value: 'interest-rate', label: 'Interest Rates', icon: 'percent' },
  { value: 'spending', label: 'Spending', icon: 'shopping_cart' },
  { value: 'general', label: 'General', icon: 'public' },
];

// Available sort options for the news
export const SORT_OPTIONS: { label: string; value: SortOption; icon: string }[] = [
  { label: 'Most Relevant', value: 'relevancy', icon: 'recommend' },
  { label: 'By Source', value: 'source', icon: 'source' },
  { label: 'Newest', value: 'fetched_at', icon: 'schedule' },
];

// Available content datatypes filters
export const DATATYPE_OPTIONS: { label: string; value: NewsDataType }[] = [
  { label: 'News', value: 'news' },
  { label: 'Blog', value: 'blog' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Opinion', value: 'opinion' },
  { label: 'Research', value: 'research' },
  { label: 'Press Release', value: 'press_release' },
];
