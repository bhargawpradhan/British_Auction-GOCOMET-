import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AuctionPage = lazy(() => import('./pages/AuctionPage'));
const Network = lazy(() => import('./pages/Network'));
const Profile = lazy(() => import('./pages/Profile'));
const Events = lazy(() => import('./pages/Events'));

import Navbar from './components/layout/Navbar';
import BottomDock from './components/layout/BottomDock';
import BackgroundSystem from './components/layout/BackgroundSystem';
import StartupSequence from './components/layout/StartupSequence';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/login" 
          element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
              <Login />
            </motion.div>
          } 
        />
        <Route 
          path="/register" 
          element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
              <Register />
            </motion.div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <Dashboard />
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auction/:id" 
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.5 }}>
                <ErrorBoundary>
                  <AuctionPage />
                </ErrorBoundary>
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/network" 
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <Network />
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events" 
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <Events />
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <Profile />
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Check if already initialized in this session to avoid re-playing
  useEffect(() => {
    const hasInit = sessionStorage.getItem('aeon_initialized');
    if (hasInit) {
      setIsInitializing(false);
    }
  }, []);

  const handleInitComplete = () => {
    sessionStorage.setItem('aeon_initialized', 'true');
    setIsInitializing(false);
  };

  return (
    <Router>
      <div className="app-container">
        <AnimatePresence mode="wait">
          {isInitializing ? (
            <StartupSequence key="startup" onComplete={handleInitComplete} />
          ) : (
            <motion.div 
              key="app-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ minHeight: '100vh' }}
            >
              <BackgroundSystem />
              <Navbar />
              <main style={{ paddingTop: '120px', paddingBottom: '120px', position: 'relative', zIndex: 2 }}>
                <Suspense fallback={<div className="loading-node">SYNCING NEURAL FEED...</div>}>
                  <AnimatedRoutes />
                </Suspense>
              </main>
              <BottomDock />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
