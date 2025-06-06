import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // correct named import
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Visualization from './components/Visualization';
import FetchAnalyze from './components/FetchAnalyze';
import RiskDashboard from './components/RiskDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUserEmail(decoded.email);
        }
      } catch (error) {
        logout();
      }
    } else {
      setUserEmail(null);
    }
  }, [token]);

  function logout() {
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem('token');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={token ? <Dashboard token={token} logout={logout} userEmail={userEmail} /> : <Navigate to="/login" />}
        />
        <Route
          path="/visualization"
          element={token ? <Visualization token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/fetch"
          element={token ? <FetchAnalyze token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/risk"
          element={
            token ? (
              <RiskDashboard
                logs={[
                  { eventName: 'ConsoleLogin', risk: 'High', reason: 'Root login' },
                  { eventName: 'DescribeInstances', risk: 'Low', reason: 'Standard activity' },
                  { eventName: 'DeleteBucket', risk: 'Medium', reason: 'Suspicious deletion' },
                ]}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
