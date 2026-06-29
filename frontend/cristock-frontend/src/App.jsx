import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { WatchlistProvider } from './context/WatchlistContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/layout/AppLayout';
import MarketPage from './pages/MarketPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import LeaderboardPage from './pages/LeaderboardPage';
import WatchlistPage from './pages/WatchlistPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/market" element={<MarketPage />} />
        <Route path="/player/:id" element={<PlayerDetailPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/market" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WatchlistProvider>
      </MarketProvider>
    </AuthProvider>
  );
}