import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sellShares } from '../../api/trading';

export default function SellModal({ player, isOpen, onClose, onSuccess, sharesOwned = 0 }) {
  const { user, updateWalletBalance } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { setQuantity(1); setError(''); }
  }, [isOpen]);

  if (!isOpen || !player) return null;

  const safeQty = Math.max(0, Number(quantity) || 0);
  const total = safeQty * player.price;
  const available = Number(user?.walletBalance) || 0;
  const afterTrade = available + total;

  const handleConfirm = async () => {
    setError('');
    if (safeQty < 1) { setError('Quantity must be at least 1'); return; }
    if (sharesOwned > 0 && safeQty > sharesOwned) {
      setError(`You only own ${sharesOwned} shares`); return;
    }

    setLoading(true);
    try {
      const result = await sellShares(Number(player.id), safeQty);
      updateWalletBalance(available + Number(result.totalAmount || total));
      onSuccess(`Sold ${safeQty} shares of ${player.name} at ₹${player.price.toFixed(2)}`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A26] rounded-2xl p-6 w-full max-w-md border border-white/10 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Sell {player.name}</h2>
          <p className="text-[#FF4757] font-mono text-lg">₹{player.price.toFixed(2)}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-white/60 mb-2">Quantity</label>
          <input
            type="number" min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-[#0A0A0F] border border-white/10 text-white font-mono rounded-lg px-4 py-3 outline-none focus:border-[#FF4757] transition-colors"
          />
          {sharesOwned > 0 && (
            <p className="text-white/40 text-xs mt-2 text-right">
              You own {sharesOwned.toLocaleString('en-IN')} shares
            </p>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Quantity</span>
            <span className="text-white font-mono">{safeQty} shares</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Price per share</span>
            <span className="text-white font-mono">₹{player.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-y border-white/5 my-2">
            <span className="text-white/60 font-medium">You receive</span>
            <span className="text-white font-mono font-semibold">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Current balance</span>
            <span className="text-white font-mono">₹{available.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">After trade</span>
            <span className="font-mono text-[#00FF87]">₹{afterTrade.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-[#FF4757] text-sm font-medium mb-4">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={loading || safeQty < 1 || (sharesOwned > 0 && safeQty > sharesOwned)}
          className={`w-full bg-[#FF4757] text-white font-semibold rounded-lg py-3 transition-all ${
            loading || safeQty < 1 || (sharesOwned > 0 && safeQty > sharesOwned)
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:bg-[#FF3344] active:scale-[0.98]'
          }`}
        >
          {loading ? 'Processing...' : `Confirm Sell ${safeQty > 0 ? `— ₹${total.toFixed(2)}` : ''}`}
        </button>
      </div>
    </div>
  );
}