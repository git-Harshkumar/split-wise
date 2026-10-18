import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { PeoplePage } from './pages/PeoplePage';
import { GroupsPage } from './pages/GroupsPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { ManageExpensesPage } from './pages/ManageExpensesPage';
import { WhoPaidWhatPage } from './pages/WhoPaidWhatPage';
import { TripInvestmentPage } from './pages/TripInvestmentPage';
import { WhatEachPersonSpentPage } from './pages/WhatEachPersonSpentPage';
import { SettleUpPage } from './pages/SettleUpPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles/main.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <SignupPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/manage-expenses" element={<ManageExpensesPage />} />
        <Route path="/who-paid-what" element={<WhoPaidWhatPage />} />
        <Route path="/trip-investment" element={<TripInvestmentPage />} />
        <Route path="/what-each-spent" element={<WhatEachPersonSpentPage />} />
        <Route path="/settle-up" element={<SettleUpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;