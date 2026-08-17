import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy-load heavy components & pages to optimize initial bundle size
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const JournalListPage = lazy(() => import('./pages/JournalListPage'));
const JournalEntryPage = lazy(() => import('./pages/JournalEntryPage'));
const NewEntryPage = lazy(() => import('./pages/NewEntryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PrivacyShieldPage = lazy(() => import('./pages/PrivacyShieldPage'));
const ZeroKnowledgePage = lazy(() => import('./pages/ZeroKnowledgePage'));
const DataAuditPage = lazy(() => import('./pages/DataAuditPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const Layout = lazy(() => import('./components/Layout'));

const PageFallback = () => (
  <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center text-slate-400">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const { loading } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Smoothly fade/unmount splash screen when auth check completes */}
      <AnimatePresence mode="wait">
        {loading && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* Routes are rendered immediately underneath the splash screen to avoid mounting delay */}
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public routes without sidebar layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Routes sharing the dashboard sidebar layout */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <JournalListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journal/id/:id"
                element={
                  <ProtectedRoute>
                    <JournalEntryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-entry"
                element={
                  <ProtectedRoute>
                    <NewEntryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy-shield"
                element={
                  <ProtectedRoute>
                    <PrivacyShieldPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/zero-knowledge"
                element={
                  <ProtectedRoute>
                    <ZeroKnowledgePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-audit"
                element={
                  <ProtectedRoute>
                    <DataAuditPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirect rules */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
