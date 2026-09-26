import api from './axios';

const displayRole = (role) => {
  if (!role) return '';
  return role.replace('_', ' '); 
};

const mapPlayerToFrontend = (p) => {
  const currentPrice = Number(p.currentPrice) || 0;
  const previousPrice = Number(p.previousPrice) || currentPrice;
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
  return {
    id: p.id.toString(),
    name: p.name,
    team: p.team,
    country: p.country,
    role: displayRole(p.role),
    rawRole: p.role,              
    price: currentPrice,
    change,
    changePercent: Number(changePercent.toFixed(2)),
    prevClose: previousPrice,
    sharesAvail: p.availableShares || 0,
    totalShares: p.totalShares || 0,
    marketCap: Number(p.marketCap || 0),
    active: p.active,
    chartData: [],
  };
};

export const getPlayers = async () => {
  const { data } = await api.get('/players');
  return Array.isArray(data) ? data.map(mapPlayerToFrontend) : [];
};


export const getPlayerDetails = async (id) => {
  const { data } = await api.get(`/players/${id}`);
  return mapPlayerToFrontend(data);
};


export const getPlayerChart = async (id, timeframe = '1D') => {
  try {
    const { data } = await api.get(`/players/${id}/chart`, { params: { timeframe } });
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
};