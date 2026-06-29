import api from './axios';

export const buyShares = async (playerId, quantity) => {
  const { data } = await api.post('/trading/buy', { playerId, quantity });
  return data; 
};

export const sellShares = async (playerId, quantity) => {
  const { data } = await api.post('/trading/sell', { playerId, quantity });
  return data;
};