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
  const pnlColor = isPositivePnL ? 'text-cse-green' : 'text-cse-red';
  const pnlSign = isPositivePnL ? '+' : '';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white hidden md:block">Your Portfolio</h1>

      {/* Grid Pattern for Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value={fmt(portfolioValue)} />
        <StatCard label="Invested" value={fmt(investedAmount)} />
        <div className="bg-[#12121A] rounded-xl p-4 sm:p-5 border border-white/5">
          <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-2">Total P&amp;L</p>
          <p className={`font-mono text-lg sm:text-2xl font-semibold ${pnlColor} truncate`}>
            {pnlSign}{fmt(Math.abs(profitLoss))}
            <span className="text-xs sm:text-sm ml-1 block sm:inline opacity-80">({pnlSign}{pnlPercent.toFixed(2)}%)</span>
          </p>
        </div>
        <StatCard label="Cash" value={fmt(walletBalance)} />
      </div>

      <div className="bg-[#12121A] rounded-xl border border-white/10 overflow-hidden w-full">
        {/* Mobile Horizontal Scroll Wrapper */}
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#1A1A26]">
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">Player</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Shares</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Avg Price</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Current</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Value</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-white/40">
                  No holdings yet. <span className="text-cse-green cursor-pointer hover:underline" onClick={() => navigate('/market')}>Browse market →</span>
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
                    className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 text-white font-medium">{h.name}</td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right text-gray-300">{h.shares}</td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right text-gray-300">{fmt(h.avgPrice)}</td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right text-white">{fmt(h.currentPrice)}</td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right font-semibold text-white">{fmt(h.currentValue)}</td>
                    <td className={`px-4 sm:px-6 py-4 font-mono text-right font-medium ${isPos ? 'text-cse-green' : 'text-cse-red'}`}>
                      {sign}{fmt(Math.abs(pnl))} <span className="opacity-80 ml-1">({sign}{pnlPct.toFixed(1)}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#12121A] rounded-xl border border-white/10 overflow-hidden w-full">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="font-semibold text-white">Transaction History</span>
          {showTransactions ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>
        {showTransactions && (
          <div className="border-t border-white/10 divide-y divide-white/5">
            {transactions.length === 0 && (
              <div className="px-6 py-8 text-center text-white/40">No transactions yet.</div>
            )}
            {transactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              return (
                <div key={tx.id} className="px-4 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2 rounded-full ${isBuy ? 'bg-cse-green/15 text-cse-green' : 'bg-cse-red/15 text-cse-red'}`}>
                      {isBuy ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{tx.player}</p>
                      <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">
                        {tx.date ? new Date(tx.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium text-sm sm:text-base ${isBuy ? 'text-cse-green' : 'text-cse-red'}`}>
                      {tx.type} {tx.qty}
                    </p>
                    <p className="text-gray-400 font-mono text-[10px] sm:text-sm mt-0.5">{fmt(tx.price)} / share</p>
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