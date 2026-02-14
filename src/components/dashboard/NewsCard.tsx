import { FC } from 'react';
import { NewsCategory } from '@/services/news/newsService';

interface NewsCardProps {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  imageUrl: string;
  category: NewsCategory;
  url: string;
  relevance: number;
  country?: string;
}

const categoryConfig: Record<
  NewsCategory,
  { bg: string; text: string; icon: string; label: string }
> = {
  inflation: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    icon: 'trending_up',
    label: 'Inflation',
  },
  'interest-rate': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'percent',
    label: 'Interest Rates',
  },
  investment: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'trending_up',
    label: 'Investment',
  },
  savings: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    icon: 'savings',
    label: 'Savings',
  },
  spending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'shopping_cart',
    label: 'Spending',
  },
  general: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    icon: 'newspaper',
    label: 'News',
  },
};

export const NewsCard: FC<NewsCardProps> = ({
  title,
  description,
  source,
  publishedAt,
  imageUrl,
  category,
  url,
  relevance,
  country,
}) => {
  const config = categoryConfig[category];
  const relevancePercent = Math.round(relevance * 100);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="h-40 overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'https://via.placeholder.com/400x200?text=Financial+News';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category & Meta */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            <span className="material-icons-outlined text-sm">
              {config.icon}
            </span>
            {config.label}
          </span>
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
            {relevancePercent}% relevant
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
          <div className="text-xs flex-1">
            <p className="font-medium text-text-primary-light dark:text-text-primary-dark truncate">
              {source}
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {publishedAt}
              {country && ` • ${country}`}
            </p>
          </div>
          <span className="material-icons-outlined text-sm text-primary ml-2">
            open_in_new
          </span>
        </div>
      </div>
    </a>
  );
};
