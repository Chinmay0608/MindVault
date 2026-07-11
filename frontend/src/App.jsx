import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import JournalListPage from './pages/JournalListPage';
import JournalEntryPage from './pages/JournalEntryPage';
import NewEntryPage from './pages/NewEntryPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyShieldPage from './pages/PrivacyShieldPage';
import ZeroKnowledgePage from './pages/ZeroKnowledgePage';
import DataAuditPage from './pages/DataAuditPage';
import Layout from './components/Layout';

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
        <Routes>
          {/* Public Auth Routes without header/footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Routes sharing the same header and footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
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
