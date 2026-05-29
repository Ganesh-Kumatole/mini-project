import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  AuthProvider,
  CurrencyProvider,
  ThemeProvider,
  NotificationsProvider,
  ToastProvider,
} from '@/shared/context';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { SignupPage, LoginPage } from '@/pages/auth';
import { Dashboard } from '@/pages/dashboard';
import { Transactions } from '@/pages/transactions';
import { Budgets } from '@/pages/budgets';
import { Insights } from '@/pages/insights';
import { Settings } from '@/pages/settings';
import { NewsPage } from '@/pages/news';
import { ProtectedRoute } from '@/shared/components/layout';
import { HomePage } from '@/pages/home';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationsProvider>
              <CurrencyProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute>
                          <Transactions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/budgets"
                      element={
                        <ProtectedRoute>
                          <Budgets />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/insights"
                      element={
                        <ProtectedRoute>
                          <Insights />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/news"
                      element={
                        <ProtectedRoute>
                          <NewsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </BrowserRouter>
              </CurrencyProvider>
            </NotificationsProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
