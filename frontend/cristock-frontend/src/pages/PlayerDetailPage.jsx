import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlayerDetails, getPlayerChart } from '../api/players';
import { buyShares, sellShares } from '../api/trading';
import { getPortfolio } from '../api/portfolio';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A26] border border-white/10 rounded-lg p-3">
        <p className="text-white/60 text-xs mb-1">{payload[0]?.payload?.time || ''}</p>
        <p className="text-[#00FF87] font-mono text-lg font-semibold">₹{Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function PlayerDetailPage() {
  const { id } = useParams();
  const { user, updateWalletBalance } = useAuth();
  const [player, setPlayer] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1D');
  const [tradeType, setTradeType] = useState('Buy');
  const [quantity, setQuantity] = useState(1);
  const [tradeStatus, setTradeStatus] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [sharesOwned, setSharesOwned] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [playerData, histData] = await Promise.all([
          getPlayerDetails(id),
          getPlayerChart(id, timeRange),
        ]);
        setPlayer(playerData);
        setChartData(histData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, timeRange]);


  useEffect(() => {
    getPortfolio()
      .then(p => {
        const h = (p.holdings || []).find(h => h.playerId.toString() === id.toString());
        setSharesOwned(h ? h.shares : 0);
      })
      .catch(() => {});
  }, [id]);

  if (loading || !player) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-white/5 rounded-xl" />
        <div className="h-72 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const isPositive = player.change >= 0;
  const colorClass = isPositive ? 'text-[#00FF87]' : 'text-[#FF4757]';
  const totalCost = quantity * player.price;
  const walletBalance = Number(user?.walletBalance) || 0;

  const handleQuantityChange = (val) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1) setQuantity(n);
  };

  const executeTrade = async () => {
    setTradeStatus({ type: 'loading' });
    try {
      if (tradeType === 'Buy') {
  const result = await buyShares(Number(player.id), quantity);
  const deduction = (result && result.totalAmount) ? Number(result.totalAmount) : totalCost;
  updateWalletBalance(walletBalance - deduction);
  setSharesOwned(prev => prev + quantity);
} else {
  const result = await sellShares(Number(player.id), quantity);
  const addition = (result && result.totalAmount) ? Number(result.totalAmount) : totalCost;
  updateWalletBalance(walletBalance + addition);
  setSharesOwned(prev => Math.max(0, prev - quantity));
}
      setTradeStatus({
        type: 'success',
        message: `${tradeType === 'Buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${player.name}`,
      });
      setTimeout(() => setTradeStatus(null), 3000);
    } catch (error) {
      setTradeStatus({ type: 'error', message: error.response?.data?.message || 'Trade failed' });
      setTimeout(() => setTradeStatus(null), 4000);
    }
  };

  const canTrade = tradeType === 'Buy'
    ? totalCost <= walletBalance && player.sharesAvail >= quantity
    : quantity <= sharesOwned;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold text-xl"
            style={{ background: 'linear-gradient(135deg, #00FF87, #00C9FF)' }}>
            {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{player.name}</h1>
            <p className="text-white/60 mt-0.5">{player.team} · {player.role}</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-mono font-bold text-white">₹{player.price.toFixed(2)}</span>
              <span className={`font-mono font-medium ${colorClass}`}>
                {isPositive ? '↑ +' : '↓ '}₹{Math.abs(player.change).toFixed(2)} ({isPositive ? '+' : ''}{player.changePercent}%)
              </span>
            </div>
            <p className="text-white/40 text-sm font-mono">Prev close: ₹{player.prevClose.toFixed(2)}</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-white/40 text-xs mb-1">Market Cap</p>
            <p className="text-white font-mono font-medium mb-3">
              ₹{player.marketCap.toLocaleString('en-IN')}
            </p>
            <p className="text-white/40 text-xs mb-1">Shares available</p>
            <p className="text-white font-mono font-medium">{player.sharesAvail.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>


      <div className="bg-[#12121A] border border-white/5 rounded-xl p-6">
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            {['1H', '1D', '1W', '1M'].map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${timeRange === r ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >{r}</button>
            ))}
          </div>
        </div>
        <div className="h-[280px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/20 text-sm">
              Price history will appear here once available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'JetBrains Mono' }} minTickGap={30}/>
                <YAxis domain={['auto','auto']} axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => `₹${v}`} width={60}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <Area type="monotone" dataKey="price" stroke="#00FF87" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#12121A] rounded-xl p-6 border border-white/5">
          <div className="flex p-1 bg-[#1A1A26] rounded-lg mb-6">
            {['Buy', 'Sell'].map(type => (
              <button key={type} onClick={() => setTradeType(type)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  tradeType === type
                    ? type === 'Buy' ? 'bg-[#00FF87]/20 text-[#00FF87]' : 'bg-[#FF4757]/20 text-[#FF4757]'
                    : 'text-white/60 hover:text-white'
                }`}
              >{type}</button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Quantity</label>
              <div className="flex items-center bg-[#1A1A26] border border-white/10 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <Minus size={18} />
                </button>
                <input type="number" value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="flex-1 bg-transparent text-center text-white font-mono outline-none" min="1"/>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-b border-white/5">
              <span className="text-white/60 text-sm">Total {tradeType === 'Buy' ? 'cost' : 'received'}</span>
              <span className="text-xl text-white font-mono font-semibold">
                ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-sm text-white/40 font-mono text-center">
              {tradeType === 'Buy'
                ? `Balance: ₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : `You own ${sharesOwned} share${sharesOwned !== 1 ? 's' : ''}`}
            </div>

            <button
              onClick={executeTrade}
              disabled={tradeStatus?.type === 'loading' || !canTrade}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] ${
                tradeType === 'Buy' ? 'bg-[#00FF87] text-black hover:bg-[#00E87A]' : 'bg-[#FF4757] text-white hover:bg-[#FF3344]'
              } ${(tradeStatus?.type === 'loading' || !canTrade) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {tradeStatus?.type === 'loading' ? 'Processing...' : `${tradeType} ${quantity} share${quantity !== 1 ? 's' : ''}`}
            </button>

            {tradeStatus && tradeStatus.type !== 'loading' && (
              <div className={`p-3 border rounded-lg text-sm text-center ${
                tradeStatus.type === 'success'
                  ? 'bg-[#00FF87]/10 border-[#00FF87]/20 text-[#00FF87]'
                  : 'bg-[#FF4757]/10 border-[#FF4757]/20 text-[#FF4757]'
              }`}>
                {tradeStatus.message}
              </div>
            )}
          </div>
        </div>


        <div className="bg-[#12121A] rounded-xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Player Info</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Country', value: player.country || '—' },
              { label: 'Team', value: player.team },
              { label: 'Role', value: player.role },
              { label: 'Total Shares', value: player.totalShares?.toLocaleString('en-IN') || '—' },
              { label: 'Available Shares', value: player.sharesAvail?.toLocaleString('en-IN') || '—' },
              { label: 'Your Holdings', value: sharesOwned > 0 ? `${sharesOwned} shares` : 'None' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1A1A26] p-4 rounded-lg border border-white/5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-white font-mono text-base">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}