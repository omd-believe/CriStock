import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getPortfolio, getTransactions } from '../api/portfolio';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [showTransactions, setShowTransactions] = useState(false);
  const [portfolio, setPortfolio] = useState(null);  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [pData, txData] = await Promise.all([getPortfolio(), getTransactions()]);
        setPortfolio(pData);
        setTransactions(txData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fmt = (val) =>
    `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (!portfolio) return <div className="text-white/40 text-center py-20">Failed to load portfolio.</div>;

  const { walletBalance, portfolioValue, investedAmount, profitLoss, holdings } = portfolio;
  const pnlPercent = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;
  const isPositivePnL = profitLoss >= 0;
  const pnlColor = isPositivePnL ? 'text-[#00FF87]' : 'text-[#FF4757]';
  const pnlSign = isPositivePnL ? '+' : '';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white hidden md:block">Your Portfolio</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value={fmt(portfolioValue)} />
        <StatCard label="Invested Amount" value={fmt(investedAmount)} />
        <div className="bg-[#12121A] rounded-xl p-5 border border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Total P&amp;L</p>
          <p className={`font-mono text-2xl font-semibold ${pnlColor}`}>
            {pnlSign}{fmt(Math.abs(profitLoss))}
            <span className="text-sm ml-1">({pnlSign}{pnlPercent.toFixed(2)}%)</span>
          </p>
        </div>
        <StatCard label="Available Cash" value={fmt(walletBalance)} />
      </div>

      <div className="bg-[#12121A] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#1A1A26]">
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium">Player</th>
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium text-right">Shares</th>
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium text-right">Avg Price</th>
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium text-right">Current</th>
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium text-right">Value</th>
                <th className="px-6 py-4 text-white/40 text-xs uppercase tracking-wider font-medium text-right">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-white/40">
                  No holdings yet. <span className="text-[#00FF87] cursor-pointer hover:underline" onClick={() => navigate('/market')}>Browse market →</span>
                </td></tr>
              )}
              {holdings.map((h) => {
                const pnl = h.profitLoss;
                const pnlPct = h.avgPrice > 0 ? (pnl / (h.avgPrice * h.shares)) * 100 : 0;
                const isPos = pnl >= 0;
                const sign = isPos ? '+' : '';
                return (
                  <tr key={h.id}
                    onClick={() => navigate(`/player/${h.playerId}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-medium">{h.name}</td>
                    <td className="px-6 py-4 font-mono text-right text-white/80">{h.shares}</td>
                    <td className="px-6 py-4 font-mono text-right text-white/80">{fmt(h.avgPrice)}</td>
                    <td className="px-6 py-4 font-mono text-right text-white">{fmt(h.currentPrice)}</td>
                    <td className="px-6 py-4 font-mono text-right font-semibold text-white">{fmt(h.currentValue)}</td>
                    <td className={`px-6 py-4 font-mono text-right ${isPos ? 'text-[#00FF87]' : 'text-[#FF4757]'}`}>
                      {sign}{fmt(Math.abs(pnl))} ({sign}{pnlPct.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#12121A] rounded-xl border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="font-semibold text-white">Transaction History</span>
          {showTransactions ? <ChevronUp size={20} className="text-white/40" /> : <ChevronDown size={20} className="text-white/40" />}
        </button>
        {showTransactions && (
          <div className="border-t border-white/5 divide-y divide-white/5">
            {transactions.length === 0 && (
              <div className="px-6 py-8 text-center text-white/40">No transactions yet.</div>
            )}
            {transactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              return (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${isBuy ? 'bg-[#00FF87]/10 text-[#00FF87]' : 'bg-[#FF4757]/10 text-[#FF4757]'}`}>
                      {isBuy ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{tx.player}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {tx.date ? new Date(tx.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium ${isBuy ? 'text-[#00FF87]' : 'text-[#FF4757]'}`}>
                      {tx.type} {tx.qty}
                    </p>
                    <p className="text-white font-mono text-sm mt-0.5">{fmt(tx.price)} / share</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}