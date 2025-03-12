import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './config/api';  // Import directly from config
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MarkDone from './components/MarkDone';

// Log configuration
console.log('Using API URL:', API_URL);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/medications/:id/mark-done" element={<MarkDone />} />
      </Routes>
    </BrowserRouter>
  );
}

// Protected route component
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default App;