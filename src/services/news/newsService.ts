// NewsData.io API Integration

export type NewsCategory =
  | 'inflation'
  | 'interest-rate'
  | 'savings'
  | 'spending'
  | 'investment'
  | 'general';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
  category: NewsCategory;
  relevance: number; // 0-1 score
  country?: string;
}

const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;
const API_BASE_URL = 'https://newsdata.io/api/1/market';

// Categorize articles based on keywords
function categorizeArticle(title: string, content: string): NewsCategory {
  const text = (title + ' ' + content).toLowerCase();

  if (
    text.includes('inflation') ||
    text.includes('price') ||
    text.includes('cost of living')
  ) {
    return 'inflation';
  }
  if (
    text.includes('interest rate') ||
    text.includes('rbi') ||
    text.includes('central bank') ||
    text.includes('rate cut') ||
    text.includes('rate hike')
  ) {
    return 'interest-rate';
  }
  if (
    text.includes('saving') ||
    text.includes('investment') ||
    text.includes('portfolio') ||
    text.includes('mutual fund')
  ) {
    return 'investment';
  }
  if (
    text.includes('spend') ||
    text.includes('expense') ||
    text.includes('budget')
  ) {
    return 'spending';
  }
  if (
    text.includes('money') ||
    text.includes('budget') ||
    text.includes('financial')
  ) {
    return 'general';
  }

  return 'general';
}

// Calculate relevance score (higher = more relevant to personal finance)
function calculateRelevance(category: NewsCategory): number {
  const scores: Record<NewsCategory, number> = {
    inflation: 0.95,
    'interest-rate': 0.95,
    investment: 0.85,
    savings: 0.85,
    spending: 0.75,
    general: 0.6,
  };
  return scores[category];
}

// Format relative time (e.g., "2h ago", "Just now")
function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

// Main fetch function
export async function fetchFinancialNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  try {
    const response = await fetch(
      `${API_BASE_URL}?apikey=${API_KEY}&language=en&size=7`,
    );

    if (!response.ok) {
      console.error(`NewsData.io error :`, response.statusText);
    }

    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((article: any, index: number) => {
        const articleCategory = categorizeArticle(
          article.title,
          article.description || '',
        );
        const relevance = calculateRelevance(articleCategory);

        allArticles.push({
          id: `newsdata-${index}`,
          title: article.title,
          description: article.description || 'Read more for full story',
          source: article.source_id || 'NewsData',
          publishedAt: getRelativeTime(article.pubDate),
          url: article.link,
          imageUrl:
            article.image_url ||
            'https://via.placeholder.com/400x200?text=Financial+News',
          category: articleCategory,
          relevance,
          country: article.country?.[0] || 'Global',
        });
      });
    }
  } catch (error) {
    console.error('Failed to fetch news from NewsData.io:', error);
  }

  return allArticles;
}
