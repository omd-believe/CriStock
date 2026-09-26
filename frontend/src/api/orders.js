import api from './axios';

export const getOrders = async () => {
  const { data } = await api.get('/trading/orders');
  return Array.isArray(data) ? data : [];
};

export const cancelOrder = async (orderId) => {
  await api.delete(`/trading/orders/${orderId}`);
};
