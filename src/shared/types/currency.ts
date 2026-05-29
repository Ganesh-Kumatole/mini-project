export type Currency = 'INR' | 'USD';

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number | undefined;
  rateLoading: boolean;
  rateError: string | null;
  formatAmount: (amountInr: number) => string;
  symbol: string;
}
