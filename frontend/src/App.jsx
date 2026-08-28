// frontend/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ReadingScreen from './pages/ReadingScreen';
import SummaryScreen from './pages/SummaryScreen';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // If there is no token, trap them on the login screen
  if (!token) {
    return <AuthPage onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  // If they are logged in, provide the router
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard token={token} onLogout={handleLogout} />} />
        <Route path="/library/:childId" element={<Library onLogout={handleLogout} />} />
        <Route path="/read/:childId/:bookId" element={<ReadingScreen />} />
        <Route path="/summary/:childId/:bookId" element={<SummaryScreen />} />
        
        {/* Catch-all redirect back to dashboard if they type a weird URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}