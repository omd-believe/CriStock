import { useEffect, useMemo, useState } from 'react';
import { X, Zap, Target, Clock3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { buyShares } from '../../api/trading';

const money = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function BuyModal({ player, isOpen, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setOrderType('MARKET');
      setLimitPrice('');
      setError('');
    }
  }, [isOpen]);

  const safeQty = Math.max(0, Number(quantity) || 0);
  const currentPrice = Number(player?.price || 0);
  const selectedPrice = orderType === 'LIMIT' ? Number(limitPrice || 0) : currentPrice;
  const estimatedTotal = safeQty * selectedPrice;
  const wallet = Number(user?.walletBalance || 0);
  const canAfford = orderType === 'LIMIT' ? true : estimatedTotal <= wallet;
  const hasValidLimit = orderType === 'MARKET' || selectedPrice > 0;
  const canSubmit = safeQty >= 1 && hasValidLimit && canAfford && !loading &&
    (orderType === 'LIMIT' || safeQty <= Number(player?.sharesAvail || 0));

  const limitHint = useMemo(() => {
    if (orderType !== 'LIMIT' || !selectedPrice) return null;
    if (selectedPrice >= currentPrice) {
      return 'A buy limit order executes when the market price reaches your limit or lower.';
    }
    return 'This order will stay pending until the market price falls to your limit.';
  }, [orderType, selectedPrice, currentPrice]);

  if (!isOpen || !player) return null;

  const handleConfirm = async () => {
    setError('');
    if (safeQty < 1) return setError('Quantity must be at least 1');
    if (orderType === 'MARKET' && safeQty > Number(player.sharesAvail || 0)) {
      return setError('Not enough shares available in market');
    }
    if (orderType === 'LIMIT' && (!limitPrice || Number(limitPrice) <= 0)) {
      return setError('Enter a valid limit price');
    }
    if (orderType === 'MARKET' && estimatedTotal > wallet) {
      return setError('Insufficient funds');
    }

    setLoading(true);
    try {
      const result = await buyShares(player.id, safeQty, orderType, limitPrice);
      const isMarket = result?.transactionId != null;

      if (isMarket) await refreshUser();

      onSuccess(
        isMarket
          ? `Bought ${safeQty} ${safeQty === 1 ? 'share' : 'shares'} of ${player.name} at ₹${money(result.price)}`
          : `Limit buy placed: ${safeQty} ${safeQty === 1 ? 'share' : 'shares'} at ₹${money(result.limitPrice)}`
      );
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Order could not be placed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">New buy order</p>
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            <p className="mt-1 font-mono text-sm text-slate-400">Market ₹{money(currentPrice)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Order type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#07101D] p-1 border border-white/5">
              <button onClick={() => setOrderType('MARKET')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${orderType === 'MARKET' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10' : 'text-slate-400 hover:text-white'}`}>
                <Zap size={15} /> Market
              </button>
              <button onClick={() => setOrderType('LIMIT')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${orderType === 'LIMIT' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10' : 'text-slate-400 hover:text-white'}`}>
                <Target size={15} /> Limit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#07101D] px-4 py-3 font-mono text-white outline-none transition focus:border-cyan-400/60" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">{orderType === 'LIMIT' ? 'Limit price' : 'Execution price'}</label>
              {orderType === 'LIMIT' ? (
                <input type="number" min="0.01" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={currentPrice.toFixed(2)} className="w-full rounded-xl border border-white/10 bg-[#07101D] px-4 py-3 font-mono text-white outline-none transition focus:border-cyan-400/60" />
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#07101D] px-4 py-3 font-mono text-slate-300">₹{money(currentPrice)}</div>
              )}
            </div>
          </div>

          {orderType === 'LIMIT' && (
            <div className="flex gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-100/70">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-cyan-300" />
              <span>{limitHint || 'Limit orders remain pending until the price condition is met and expire after 24 hours.'}</span>
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-white/5 bg-[#07101D] p-4">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Quantity</span><span className="font-mono text-white">{safeQty}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Price</span><span className="font-mono text-white">₹{money(selectedPrice)}</span></div>
            <div className="my-2 border-t border-white/5" />
            <div className="flex justify-between"><span className="font-medium text-slate-300">{orderType === 'LIMIT' ? 'Estimated cost' : 'Total cost'}</span><span className="font-mono font-semibold text-white">₹{money(estimatedTotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Wallet</span><span className="font-mono text-slate-300">₹{money(wallet)}</span></div>
          </div>

          {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <button onClick={handleConfirm} disabled={!canSubmit} className="w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? 'Processing…' : orderType === 'LIMIT' ? 'Place Limit Buy' : `Buy ${safeQty} ${safeQty === 1 ? 'share' : 'shares'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
