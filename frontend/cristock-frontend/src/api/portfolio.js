import api from './axios';

export const getPortfolio = async () => {
  const { data } = await api.get('/trading/portfolio');
  const holdings = data?.holdings || [];
  return {
    walletBalance: Number(data?.walletBalance || 0),
    portfolioValue: Number(data?.portfolioValue || 0),
    investedAmount: Number(data?.investedAmount || 0),
    profitLoss: Number(data?.profitLoss || 0),
    holdings: holdings.map(h => ({
      id: h.playerId,
      playerId: h.playerId,
      name: h.playerName,
      shares: h.shares,
      avgPrice: Number(h.averageBuyPrice || 0),
      currentPrice: Number(h.currentPrice || 0),
      currentValue: Number(h.currentValue || 0),
      profitLoss: Number(h.profitLoss || 0),
    })),
  };
};

export const getTransactions = async () => {
  const { data } = await api.get('/trading/history');
  const txList = Array.isArray(data) ? data : [];
  return txList.map(tx => ({
    id: tx.transactionId,
    type: tx.type,          
    player: tx.playerName,
    qty: tx.quantity,
    price: Number(tx.price || 0),
    total: Number(tx.totalAmount || 0),
    date: tx.timestamp,
  }));
};


export const getLeaderboard = async (endpoint = '/leaderboard/gainers') => {
  try {
    const { data } = await api.get(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};