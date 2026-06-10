import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import SharedReportPage from './pages/SharedReportPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/features"  element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/signup"    element={<SignupPage />} />

          {/* Public shared report — no auth required */}
          <Route path="/shared/:token" element={<SharedReportPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/analyzer"  element={<PrivateRoute><AnalyzerPage /></PrivateRoute>} />
          <Route path="/report/:id" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
          <Route path="/history"   element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
