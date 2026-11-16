import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Lazy-loaded pages for maximum performance and instant FCP
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateDecisionPage = lazy(() => import('./pages/CreateDecisionPage'));
const EvaluationResultsPage = lazy(() => import('./pages/EvaluationResultsPage'));
const CompareOptionsPage = lazy(() => import('./pages/CompareOptionsPage'));
const DecisionHistoryPage = lazy(() => import('./pages/DecisionHistoryPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
    <span className="loading loading-ring loading-md text-primary" />
    <span className="text-xs text-base-content/50 font-mono tracking-wider uppercase">
      Loading Matrix Module...
    </span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Main Application with Sidebar & Navbar Layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="decisions/new" element={<CreateDecisionPage />} />
                <Route path="decisions/:id" element={<EvaluationResultsPage />} />
                <Route path="decisions/:id/compare" element={<CompareOptionsPage />} />
                <Route path="compare" element={<CompareOptionsPage />} />
                <Route path="history" element={<DecisionHistoryPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
