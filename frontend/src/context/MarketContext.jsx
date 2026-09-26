import { createContext, useState, useContext, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { getPlayers } from '../api/players';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketOpen, setMarketOpen] = useState(true);
  const { connected, subscribe } = useWebSocket();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const data = await getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (connected && !loading) {
      subscriptionRef.current = subscribe('/topic/prices', (update) => {
        
        const currentPrice = Number(update.currentPrice) || 0;
        const previousPrice = Number(update.previousPrice) || currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        const MAX_CHART_POINTS = 20;

setPlayers(currentPlayers => 
  currentPlayers.map(player => {
    if (player.id === update.playerId.toString()) {
      const currentChart = player.chartData || [];
      const newChartData = currentChart.length >= MAX_CHART_POINTS 
        ? [...currentChart.slice(1), { value: currentPrice }]
        : [...currentChart, { value: currentPrice }];

      return {
        ...player,
        price: currentPrice,
        change: change,
        changePercent: Number(changePercent.toFixed(2)),
        chartData: newChartData
      };
    }
    return player;
          })
        );
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [connected, subscribe, loading]);

  return (
    <MarketContext.Provider value={{ players, loading, marketOpen }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);