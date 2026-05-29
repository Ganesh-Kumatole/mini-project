import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Theme, ThemeContextType } from '@/shared/types/theme';

// define context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// helper function to get initial theme
const getInitialTheme = (): Theme => {
  // 1. Check localStorage for saved theme
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved as Theme;

  // 2. Check system preference
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  // 3. Default (Fallback) to light
  return 'light';
};

// define context provider
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // sync theme changes to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // memoizing the toggle function reference
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // memoizing the context value
  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// define context consumer
const useThemeContext = (): ThemeContextType => {
  const contextVal = useContext(ThemeContext);

  if (!contextVal) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return contextVal;
};

export { ThemeProvider, useThemeContext };
