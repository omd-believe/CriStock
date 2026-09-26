import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock3, RefreshCw, ShieldCheck, WalletCards } from 'lucide-react';
import { getPortfolio, getTransactions } from '../api/portfolio';
import { getOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compact = (value) => {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return money(n);
};
const formatDate = (value) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError('');
      const [p, t, o] = await Promise.all([getPortfolio(), getTransactions(), getOrders()]);
      setPortfolio(p);
      setTransactions(t);
      setOrders(o);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load wallet data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => { load(); }, [load]);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const totalWealth = Number(portfolio?.walletBalance || 0) + Number(portfolio?.portfolioValue || 0);
  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  if (loading) return <div className="mx-auto max-w-7xl space-y-6 animate-pulse"><div className="h-52 rounded-[28px] bg-white/5" /><div className="grid gap-4 sm:grid-cols-3"><div className="h-32 rounded-2xl bg-white/5" /><div className="h-32 rounded-2xl bg-white/5" /><div className="h-32 rounded-2xl bg-white/5" /></div><div className="h-80 rounded-2xl bg-white/5" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-[#10243a] via-[#0b1728] to-[#09101d] p-5 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200"><WalletCards size={14} /> Wallet</div>
            <p className="text-sm text-slate-400">Available cash</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">{money(portfolio?.walletBalance ?? user?.walletBalance)}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Your virtual cash balance for market trades. Pending limit-buy funds are reserved by the trading engine and are released when orders execute, expire, or are cancelled.</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/20 hover:bg-white/10 disabled:opacity-50"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Cash balance', money(portfolio?.walletBalance), 'Ready for trading'],
          ['Portfolio value', compact(portfolio?.portfolioValue), 'Current holdings'],
          ['Total wealth', compact(totalWealth), 'Cash + holdings'],
          ['Open orders', pendingOrders.length, 'Pending limit orders'],
        ].map(([label, value, hint]) => <div key={label} className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5 shadow-lg shadow-black/10"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="mt-1 text-xs text-slate-600">{hint}</p></div>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b1524]/90">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4"><div><h2 className="font-semibold text-white">Recent cash activity</h2><p className="mt-0.5 text-xs text-slate-500">Executed transactions affecting your wallet</p></div><Clock3 size={18} className="text-slate-600" /></div>
          {recentTransactions.length === 0 ? <div className="px-5 py-14 text-center text-sm text-slate-600">No transactions yet.</div> : <div className="divide-y divide-white/5">{recentTransactions.map((tx) => { const buy = tx.type === 'BUY'; return <div key={tx.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><div className={`rounded-xl p-2.5 ${buy ? 'bg-cyan-400/10 text-cyan-300' : 'bg-rose-400/10 text-rose-300'}`}>{buy ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{tx.player}</p><p className="mt-0.5 text-xs text-slate-600">{tx.type} · {tx.qty} shares · {formatDate(tx.date)}</p></div></div><p className={`shrink-0 font-mono text-sm font-semibold ${buy ? 'text-rose-200' : 'text-emerald-200'}`}>{buy ? '-' : '+'}{money(tx.total)}</p></div>; })}</div>}
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><ShieldCheck size={18} /></div><div><h2 className="font-semibold text-white">Trading cash</h2><p className="text-xs text-slate-500">How your balance works</p></div></div>
          <div className="mt-5 space-y-3 text-sm text-slate-400"><div className="flex justify-between gap-4"><span>Wallet balance</span><span className="font-mono text-slate-200">{money(portfolio?.walletBalance)}</span></div><div className="flex justify-between gap-4"><span>Invested amount</span><span className="font-mono text-slate-200">{money(portfolio?.investedAmount)}</span></div><div className="flex justify-between gap-4"><span>Open limit orders</span><span className="font-mono text-amber-200">{pendingOrders.length}</span></div><div className="mt-4 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-100/70">CriStock uses virtual money. There are no real deposits or withdrawals in the simulator.</div></div>
        </div>
      </section>
    </div>
  );
}
