import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  AuthProvider,
  CurrencyProvider,
  ThemeProvider,
  NotificationsProvider,
  ToastProvider,
} from './context';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './components/home';
import { SignupPage, LoginPage } from './components/auth';
import { Dashboard } from './components/dashboard';
import { Transactions } from './components/transactions';
import { Budgets } from './components/budgets';
import { Insights } from './components/insights';
import { Settings } from './components/settings';
import { NewsPage } from './components/news';
import { ProtectedRoute } from './components/layout';

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
