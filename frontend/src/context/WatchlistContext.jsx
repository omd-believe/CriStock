import { createContext, useState, useContext, useEffect } from 'react';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cse_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const toggleWatchlist = (playerId) => {
    setWatchlist((prev) => {
      const updated = prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId];
      
      localStorage.setItem('cse_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isWatchlisted = (playerId) => watchlist.includes(playerId);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isWatchlisted }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);