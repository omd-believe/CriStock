import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Clock3, RefreshCw, XCircle } from 'lucide-react';
import { cancelOrder, getOrders } from '../api/orders';

const money = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusStyles = {
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  EXECUTED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  CANCELLED: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  REJECTED: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  EXPIRED: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
};

const formatDate = (value) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setError('');
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => filter === 'ALL' ? orders : orders.filter((order) => order.status === filter), [orders, filter]);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleCancel = async (orderId) => {
    try {
      setActionId(orderId);
      await cancelOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel this order.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">Trading desk</p><h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Orders</h1><p className="mt-1 text-sm text-slate-500">Track market and limit orders, expiry and execution status.</p></div>
        <button onClick={loadOrders} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-white"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Total orders</p><p className="mt-2 text-2xl font-bold text-white">{orders.length}</p></div>
        <div className="rounded-2xl border border-amber-400/10 bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Pending</p><p className="mt-2 text-2xl font-bold text-amber-200">{pendingCount}</p></div>
        <div className="rounded-2xl border border-emerald-400/10 bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Executed</p><p className="mt-2 text-2xl font-bold text-emerald-200">{orders.filter((o) => o.status === 'EXECUTED').length}</p></div>
        <div className="rounded-2xl border border-violet-400/10 bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Expired</p><p className="mt-2 text-2xl font-bold text-violet-200">{orders.filter((o) => o.status === 'EXPIRED').length}</p></div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED', 'EXPIRED'].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${filter === item ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' : 'border-white/5 bg-[#0B1220] text-slate-500 hover:text-white'}`}>{item === 'ALL' ? 'All' : item}</button>
        ))}
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"><AlertCircle size={16} />{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]">
        {loading ? (
          <div className="space-y-3 p-5">{[1,2,3,4].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center"><Clock3 size={28} className="mb-3 text-slate-700" /><p className="font-medium text-slate-300">No orders found</p><p className="mt-1 text-sm text-slate-600">Your limit orders will appear here.</p></div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((order) => {
              const isBuy = order.transactionType === 'BUY';
              const isPending = order.status === 'PENDING';
              return (
                <div key={order.orderId} className="p-4 transition hover:bg-white/[0.02] sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`mt-0.5 rounded-xl p-2.5 ${isBuy ? 'bg-cyan-400/10 text-cyan-300' : 'bg-rose-400/10 text-rose-300'}`}>{isBuy ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}</div>
                      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-white">{order.playerName}</h3><span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-slate-400">{order.orderType}</span><span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[order.status] || statusStyles.CANCELLED}`}>{order.status}</span></div><p className="mt-1 text-xs text-slate-500">Order #{order.orderId} · {formatDate(order.createdAt)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4 lg:min-w-[520px]">
                      <div><p className="text-xs text-slate-600">Side</p><p className={`mt-1 font-semibold ${isBuy ? 'text-cyan-200' : 'text-rose-200'}`}>{order.transactionType}</p></div>
                      <div><p className="text-xs text-slate-600">Quantity</p><p className="mt-1 font-mono text-slate-200">{order.quantity}</p></div>
                      <div><p className="text-xs text-slate-600">Limit price</p><p className="mt-1 font-mono text-slate-200">₹{money(order.limitPrice)}</p></div>
                      <div><p className="text-xs text-slate-600">Expires</p><p className="mt-1 font-mono text-slate-300">{formatDate(order.expiresAt)}</p></div>
                    </div>
                    {isPending && <button disabled={actionId === order.orderId} onClick={() => handleCancel(order.orderId)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-50"><XCircle size={16} />{actionId === order.orderId ? 'Cancelling…' : 'Cancel'}</button>}
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
