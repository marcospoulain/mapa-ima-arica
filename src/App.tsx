import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useApp } from './context/AppContext';
import LandingPage from './components/LandingPage/LandingPage';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { loadPropertiesFromStorage } = useApp();

  useEffect(() => {
    loadPropertiesFromStorage();
  }, [loadPropertiesFromStorage]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;