import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useWatchlist } from '../context/WatchlistContext';
import PlayerCard from '../components/ui/PlayerCard';
import BuyModal from '../components/modals/BuyModal';
import SellModal from '../components/modals/SellModal';

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { players } = useMarket();
  const { watchlist } = useWatchlist();
  const [buyModalPlayer, setBuyModalPlayer] = useState(null);
  const [sellModalPlayer, setSellModalPlayer] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const watchlistedPlayers = players.filter(p => watchlist.includes(p.id));

  const handleSuccess = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (watchlistedPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Star size={48} className="text-white/10" />
        <p className="text-white/40 text-lg">No players in your watchlist yet</p>
        <button
          onClick={() => navigate('/market')}
          className="px-6 py-2.5 bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 rounded-lg hover:bg-[#00FF87]/20 transition-all font-medium"
        >
          Browse Market
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
        <span className="text-white/40 text-sm">{watchlistedPlayers.length} player{watchlistedPlayers.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {watchlistedPlayers.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onBuyClick={setBuyModalPlayer}
            onSellClick={setSellModalPlayer}
          />
        ))}
      </div>

      <BuyModal
        isOpen={!!buyModalPlayer}
        player={buyModalPlayer}
        onClose={() => setBuyModalPlayer(null)}
        onSuccess={handleSuccess}
      />
      <SellModal
        isOpen={!!sellModalPlayer}
        player={sellModalPlayer}
        onClose={() => setSellModalPlayer(null)}
        onSuccess={handleSuccess}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A26] border border-[#00FF87]/30 px-6 py-4 rounded-xl">
          <p className="text-[#00FF87] font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}