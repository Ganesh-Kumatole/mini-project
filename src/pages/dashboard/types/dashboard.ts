import { TransactionType } from '@/pages/transactions/types';
import { Dispatch, SetStateAction } from 'react';
import { NewsArticle } from '@/services/news/newsService';
import { NewsCategory } from '@/services/news/newsService';

export interface DashboardHeaderProps {
  onAddTransaction: () => void;
}

export interface CardsWrapperProps {
  loading: boolean;
  income: number;
  expense: number;
  savingsRate: number;
  momChange: string;
  momColor: string;
  budgetUsedPct: number;
  budgetHealth: any[];
}

export interface ChartsWrapperProps {
  loading: boolean;
  donutData: { labels: string[]; data: number[] };
  monthly: { month: string; income: number; expense: number }[];
  bvaData: { labels: string[]; budgeted: number[]; actual: number[] };
  recentTx: {
    id: string;
    userId: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    type: TransactionType;
    createdAt: Date;
    updatedAt: Date;
  }[];
  setShowAddTx: (show: boolean) => void;
}

export interface NewsCardProps {
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

export interface NewsWrapperProps {
  news: NewsArticle[];
  setNews: Dispatch<SetStateAction<NewsArticle[]>>;
  newsLoading: boolean;
  setNewsLoading: Dispatch<SetStateAction<boolean>>;
  newsError: string | null;
  setNewsError: Dispatch<SetStateAction<string | null>>;
}
