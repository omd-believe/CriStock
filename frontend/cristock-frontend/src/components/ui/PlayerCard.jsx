import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriceBadge from './PriceBadge';
import MiniChart from './MiniChart';
import { useWatchlist } from '../../context/WatchlistContext';

export default function PlayerCard({ player, onBuyClick, onSellClick }) {
  const navigate = useNavigate();
  const { toggleWatchlist, isWatchlisted } = useWatchlist();
  
  const active = isWatchlisted(player.id);
  const isPositive = player.change >= 0;

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    toggleWatchlist(player.id);
  };

  return (
    <div 
      className="bg-[#12121A] rounded-xl p-4 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-200" 
      onClick={() => navigate(`/player/${player.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" 
            style={{ backgroundColor: getAvatarColor(player.name) }}
          >
            {getInitials(player.name)}
          </div>
          <div>
            <h3 className="font-medium text-white truncate max-w-[120px]">{player.name}</h3>
            <p className="text-xs text-white/40">{player.team} · {player.role}</p>
          </div>
        </div>
        <button 
          className={`transition-colors ${active ? 'text-[#FFD700]' : 'text-white/20 hover:text-[#FFD700]'}`} 
          onClick={handleStarClick}
        >
          <Star size={18} fill={active ? '#FFD700' : 'none'} />
        </button>
      </div>

      <div className="flex justify-between items-end mb-4">
        <PriceBadge price={player.price} change={player.change} changePercent={player.changePercent} />
        <MiniChart data={player.chartData} isPositive={isPositive} />
      </div>

      <div className="flex gap-2">
        <button 
          className="flex-1 bg-cse-green/10 text-cse-green border border-cse-green/20 hover:bg-cse-green/20 text-sm font-medium py-2 rounded-lg transition-all" 
          onClick={(e) => { e.stopPropagation(); onBuyClick(player); }}
        >
          Buy
        </button>
        <button 
          className="flex-1 bg-cse-red/10 text-cse-red border border-cse-red/20 hover:bg-cse-red/20 text-sm font-medium py-2 rounded-lg transition-all" 
          onClick={(e) => { e.stopPropagation(); onSellClick(player); }}
        >
          Sell
        </button>
      </div>
    </div>
  );
}