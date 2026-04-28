import { createContext, useContext, ReactNode } from 'react';
import { formatInr } from '@/utils';
import { CurrencyContextType } from '@/types/currency';
import useCurrency from '@/hooks/useCurrency';

// define context
const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
  exchangeRate: undefined,
  rateLoading: true,
  rateError: null,
  formatAmount: (n) => formatInr(n),
  symbol: '₹',
});

// context provider
const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const currencyContextVal: CurrencyContextType = useCurrency();

  return (
    <CurrencyContext.Provider value={currencyContextVal}>
      {children}
    </CurrencyContext.Provider>
  );
};

// context consumer
const useCurrencyContext = () => {
  const contextVal = useContext(CurrencyContext);

  if (!contextVal) {
    throw new Error('useCurrencyContext must be used within CurrencyProvider');
  }

  return contextVal;
};

export { CurrencyProvider, useCurrencyContext };
