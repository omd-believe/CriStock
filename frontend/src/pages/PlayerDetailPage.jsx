import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Clock3, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlayerDetails, getPlayerChart } from '../api/players';
import { getPortfolio } from '../api/portfolio';
import BuyModal from '../components/modals/BuyModal';
import SellModal from '../components/modals/SellModal';

const money = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1220] p-3 shadow-xl">
      <p className="mb-1 text-xs text-slate-500">{payload[0]?.payload?.time || ''}</p>
      <p className="font-mono text-lg font-semibold text-cyan-300">₹{Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
};

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1D');
  const [sharesOwned, setSharesOwned] = useState(0);
  const [buyOpen, setBuyOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshHolding = () => {
    getPortfolio().then((portfolio) => {
      const holding = (portfolio.holdings || []).find((h) => String(h.playerId) === String(id));
      setSharesOwned(holding?.shares || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const [playerData, history] = await Promise.all([
          getPlayerDetails(id),
          getPlayerChart(id, timeRange),
        ]);
        setPlayer(playerData);
        setChartData(history);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id, timeRange]);

  useEffect(() => {
    refreshHolding();
  }, [id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading || !player) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-80 rounded-2xl bg-white/5" />
        <div className="grid gap-6 lg:grid-cols-2"><div className="h-64 rounded-2xl bg-white/5" /><div className="h-64 rounded-2xl bg-white/5" /></div>
      </div>
    );
  }

  const positive = player.change >= 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white">
        <ArrowLeft size={16} /> Back
      </button>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-xl font-bold text-slate-950 shadow-lg shadow-cyan-400/10">
              {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{player.name}</h1>
                {!player.active && <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-semibold text-rose-300">Trading suspended</span>}
              </div>
              <p className="text-sm text-slate-500">{player.team} · {player.role} · {player.country || 'International'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-7">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Current price</p>
              <p className="mt-1 font-mono text-3xl font-bold text-white">₹{money(player.price)}</p>
              <p className={`mt-1 flex items-center gap-1 text-sm font-mono ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>
                {positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {positive ? '+' : '-'}₹{money(Math.abs(player.change))} ({positive ? '+' : ''}{player.changePercent}%)
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-wider text-slate-500">Market cap</p>
              <p className="mt-1 font-mono font-semibold text-white">₹{Number(player.marketCap || 0).toLocaleString('en-IN')}</p>
              <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Available shares</p>
              <p className="mt-1 font-mono font-semibold text-white">{Number(player.sharesAvail || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button disabled={!player.active} onClick={() => setBuyOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">
            <ShoppingCart size={17} /> Buy
          </button>
          <button disabled={!player.active || sharesOwned < 1} onClick={() => setSellOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 font-semibold text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-40">
            <TrendingDown size={17} /> Sell
          </button>
          <div className="rounded-xl border border-white/5 bg-[#07101D] px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Your holding</p>
            <p className="mt-1 font-mono font-semibold text-white">{sharesOwned.toLocaleString('en-IN')} shares</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#07101D] px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Wallet</p>
            <p className="mt-1 font-mono font-semibold text-cyan-200">₹{money(user?.walletBalance)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><h2 className="font-semibold text-white">Price history</h2><p className="text-xs text-slate-500">Market price movement</p></div>
          <div className="flex rounded-lg border border-white/5 bg-[#07101D] p-1">
            {['1H', '1D', '1W', '1M'].map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${timeRange === range ? 'bg-white/10 text-cyan-300' : 'text-slate-500 hover:text-white'}`}>{range}</button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">Price history will appear here once data is recorded.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs><linearGradient id="cristockPriceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} width={58} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,.12)', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} fill="url(#cristockPriceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2"><Clock3 size={17} className="text-cyan-300" /><h2 className="font-semibold text-white">Market information</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ['Previous price', `₹${money(player.prevClose)}`],
            ['Total shares', Number(player.totalShares || 0).toLocaleString('en-IN')],
            ['Available shares', Number(player.sharesAvail || 0).toLocaleString('en-IN')],
            ['Your holdings', `${sharesOwned.toLocaleString('en-IN')} shares`],
            ['Team', player.team || '—'],
            ['Role', player.role || '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/5 bg-[#07101D] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 font-mono text-sm text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <BuyModal isOpen={buyOpen} player={player} onClose={() => setBuyOpen(false)} onSuccess={(message) => { setToast(message); refreshHolding(); }} />
      <SellModal isOpen={sellOpen} player={player} sharesOwned={sharesOwned} onClose={() => setSellOpen(false)} onSuccess={(message) => { setToast(message); refreshHolding(); }} />

      {toast && <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl border border-cyan-400/20 bg-[#0B1220] px-5 py-4 text-sm font-medium text-cyan-200 shadow-2xl">{toast}</div>}
    </div>
  );
}
