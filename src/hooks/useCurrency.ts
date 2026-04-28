import { useState, useEffect, useCallback } from 'react';
import {
  CURRENCY_KEY,
  FALLBACK_RATE,
  RATE_CACHE_KEY,
  RATE_CACHE_TTL_MS,
  formatInr,
  formatUsd,
} from '@/utils';
import { Currency } from '@/types/currency';

const useCurrency = () => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(CURRENCY_KEY) as Currency) || 'INR';
  });

  const [exchangeRate, setExchangeRate] = useState<number | undefined>(() => {
    // Try restoring from cache first so the app renders immediately
    try {
      const cached = localStorage.getItem(RATE_CACHE_KEY);
      if (cached) {
        const { rate, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < RATE_CACHE_TTL_MS) return rate as number;
      }
    } catch {
      /* ignore */
    }
    return undefined;
  });

  const [rateLoading, setRateLoading] = useState<boolean>(
    exchangeRate === undefined,
  );

  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled: boolean = false;

    const loadRate = async () => {
      setRateLoading(true);
      try {
        // Check cache first
        const cached = localStorage.getItem(RATE_CACHE_KEY);
        if (cached) {
          const { rate, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < RATE_CACHE_TTL_MS) {
            if (!cancelled) {
              setExchangeRate(rate);
              setRateLoading(false);
            }
            return;
          }
        }

        // Frankfurter API — free, no API key needed
        const res = await fetch(
          'https://api.frankfurter.app/latest?from=USD&to=INR',
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rate: number = data.rates?.INR;
        if (!rate) throw new Error('Rate not found in response');

        localStorage.setItem(
          RATE_CACHE_KEY,
          JSON.stringify({ rate, timestamp: Date.now() }),
        );

        if (!cancelled) {
          setExchangeRate(rate);
          setRateError(null);
        }
      } catch (err) {
        console.warn('Exchange rate fetching failed, using fallback:', err);
        if (!cancelled) {
          setExchangeRate(FALLBACK_RATE);
          setRateError('Using cached/fallback rate');
        }
      } finally {
        if (!cancelled) setRateLoading(false);
      }
    };

    loadRate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  const formatAmount = useCallback(
    (amountInr: number): string => {
      if (currency === 'INR') return formatInr(amountInr);
      // Convert INR → USD using live rate
      const rate = exchangeRate ?? FALLBACK_RATE;
      return formatUsd(amountInr / rate);
    },
    [currency, exchangeRate],
  );

  const symbol = currency === 'INR' ? '₹' : '$';

  return {
    currency,
    setCurrency,
    exchangeRate,
    rateLoading,
    rateError,
    formatAmount,
    symbol,
  };
};

export default useCurrency;
