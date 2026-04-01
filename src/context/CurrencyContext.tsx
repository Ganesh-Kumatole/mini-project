import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Currency = 'INR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** USD → INR rate, e.g. ~83.5. undefined while loading. */
  exchangeRate: number | undefined;
  rateLoading: boolean;
  rateError: string | null;
  /**
   * Format a raw stored amount (always in INR) for display.
   * If currency = 'INR' → ₹ formatted.
   * If currency = 'USD' → converts using live rate and formats as $.
   */
  formatAmount: (amountInr: number) => string;
  /** Symbol for the active currency */
  symbol: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCY_KEY = 'fintracker_currency';
const RATE_CACHE_KEY = 'fintracker_exchange_rate_cache';
const RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const FALLBACK_RATE = 83.5; // fallback USD→INR when API is unavailable

// ── Helpers ──────────────────────────────────────────────────────────────────

const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

// ── Context ───────────────────────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
  exchangeRate: undefined,
  rateLoading: true,
  rateError: null,
  formatAmount: (n) => formatInr(n),
  symbol: '₹',
});

export const useCurrency = () => useContext(CurrencyContext);

// ── Provider ──────────────────────────────────────────────────────────────────

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
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
    } catch { /* ignore */ }
    return undefined;
  });

  const [rateLoading, setRateLoading] = useState<boolean>(exchangeRate === undefined);
  const [rateError, setRateError] = useState<string | null>(null);

  // ── Fetch live exchange rate (USD → INR) ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadRate = async () => {
      setRateLoading(true);
      try {
        // Check cache first
        const cached = localStorage.getItem(RATE_CACHE_KEY);
        if (cached) {
          const { rate, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < RATE_CACHE_TTL_MS) {
            if (!cancelled) { setExchangeRate(rate); setRateLoading(false); }
            return;
          }
        }

        // Frankfurter API — free, no API key needed
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rate: number = data.rates?.INR;
        if (!rate) throw new Error('Rate not found in response');

        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
        if (!cancelled) { setExchangeRate(rate); setRateError(null); }
      } catch (err) {
        console.warn('Exchange rate fetch failed, using fallback:', err);
        if (!cancelled) {
          setExchangeRate(FALLBACK_RATE);
          setRateError('Using cached/fallback rate');
        }
      } finally {
        if (!cancelled) setRateLoading(false);
      }
    };

    loadRate();
    return () => { cancelled = true; };
  }, []);

  // ── Persist currency choice ─────────────────────────────────────────────────
  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  // ── Format helper ───────────────────────────────────────────────────────────
  const formatAmount = useCallback((amountInr: number): string => {
    if (currency === 'INR') return formatInr(amountInr);
    // Convert INR → USD using live rate
    const rate = exchangeRate ?? FALLBACK_RATE;
    return formatUsd(amountInr / rate);
  }, [currency, exchangeRate]);

  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, rateLoading, rateError, formatAmount, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
