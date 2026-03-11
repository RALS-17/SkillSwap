import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';

import Home        from './pages/Home';
import Browse      from './pages/Browse';
import Profile     from './pages/Profile';
import Messages    from './pages/Messages';
import SwapDetails from './pages/SwapDetails';
import Login       from './components/auth/Login';
import ProfileSetup from './components/auth/ProfileSetup';
import SwapRequest from './components/matching/SwapRequest';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/browse"  element={<Browse />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/profile/:userId" element={<Profile />} />

        <Route path="/setup"   element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:chatId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/swap/:swapId" element={<ProtectedRoute><SwapDetails /></ProtectedRoute>} />
        <Route path="/swap-request/:userId" element={<ProtectedRoute><SwapRequest /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
