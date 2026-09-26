import api from './axios';

const buildRequest = (playerId, quantity, orderType, limitPrice) => ({
  playerId: Number(playerId),
  quantity: Number(quantity),
  orderType,
  ...(orderType === 'LIMIT' ? { limitPrice: Number(limitPrice) } : {}),
});

export const buyShares = async (playerId, quantity, orderType = 'MARKET', limitPrice = null) => {
  const { data } = await api.post(
    '/trading/buy',
    buildRequest(playerId, quantity, orderType, limitPrice)
  );
  return data;
};

export const sellShares = async (playerId, quantity, orderType = 'MARKET', limitPrice = null) => {
  const { data } = await api.post(
    '/trading/sell',
    buildRequest(playerId, quantity, orderType, limitPrice)
  );
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get('/trading/orders');
  return Array.isArray(data) ? data : [];
};

export const cancelOrder = async (orderId) => {
  await api.delete(`/trading/orders/${orderId}`);
};
