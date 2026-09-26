import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';
import { getLeaderboard } from '../api/portfolio';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatCompact = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 mt-8 animate-pulse px-2">
        <div className="h-64 bg-white/5 rounded-2xl w-full max-w-2xl mx-auto"></div>
        <div className="h-96 bg-white/5 rounded-xl w-full"></div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return <div className="text-center text-white/40 mt-10 px-4">No market data available for the leaderboard.</div>;
  }

  const topThree = [leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean);
  const restOfBoard = leaderboard.slice(3);

  const renderPodiumCard = (player, position) => {
    if (!player) return null;
    const isFirst = position === 1;
    const heightClass = isFirst ? 'h-64' : position === 2 ? 'h-52' : 'h-44';
    const bgClass = isFirst ? 'bg-[#1A1A26] border-cse-green/30' : 'bg-[#12121A] border-white/5';
    
    const changePct = Number(player.percentageChange || 0);
    const isPos = changePct >= 0;
    const colorClass = isPos ? 'text-cse-green' : 'text-cse-red';
    
    return (
      <div 
        key={`podium-${player.playerId}`}
        onClick={() => navigate(`/player/${player.playerId}`)}
        className={`flex flex-col items-center justify-end cursor-pointer hover:-translate-y-2 transition-transform duration-300 ${isFirst ? 'z-10 -mx-2 md:-mx-4' : 'z-0'}`}
      >
        <div className={`w-full w-[110px] sm:w-[150px] md:max-w-[180px] rounded-t-2xl border-t border-x p-2 sm:p-4 flex flex-col items-center relative ${heightClass} ${bgClass}`}>
          {isFirst && (
            <div className="absolute -top-6 bg-cse-green/20 p-2 rounded-full border border-cse-green/30">
              <Trophy size={20} className="text-cse-green sm:w-6 sm:h-6" />
            </div>
          )}
          {!isFirst && (
            <div className="absolute -top-5 bg-white/5 p-2 rounded-full border border-white/10">
              <Medal size={16} className={`${position === 2 ? 'text-gray-300' : 'text-[#CD7F32]'} sm:w-5 sm:h-5`} />
            </div>
          )}
          
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full mt-4 flex items-center justify-center font-bold text-black text-lg sm:text-xl ${isFirst ? 'bg-cse-green' : 'bg-white'}`}>
            {player.playerName.charAt(0)}
          </div>
          
          <p className="text-white font-medium mt-2 sm:mt-3 text-center truncate w-full text-xs sm:text-sm">{player.playerName}</p>
          <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">{player.team}</p>
          
          <div className="mt-auto w-full text-center bg-black/20 py-1.5 sm:py-2 rounded-lg">
            <p className="text-white font-mono font-semibold text-xs sm:text-base">{formatCurrency(player.currentPrice)}</p>
            <p className={`font-mono text-[10px] sm:text-sm mt-0.5 ${colorClass}`}>
              {isPos ? '+' : ''}{changePct.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">
      <div className="flex flex-col items-center justify-center mt-4 sm:mt-8 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-8 sm:mb-12">Top Trending Players</h1>
        <div className="flex items-end justify-center w-full max-w-3xl">
          {renderPodiumCard(topThree[0], 2)}
          {renderPodiumCard(topThree[1], 1)}
          {renderPodiumCard(topThree[2], 3)}
        </div>
      </div>

      <div className="bg-[#12121A] rounded-xl border border-white/10 overflow-hidden w-full">
        {/* Mobile Horizontal Scroll Wrapper */}
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#1A1A26]">
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold w-16">Rank</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">Player</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">Team</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Price</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">Market Cap</th>
                <th className="px-4 sm:px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-semibold text-right">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {restOfBoard.map((player, index) => {
                const rank = index + 4; 
                const changePct = Number(player.percentageChange || 0);
                const isPos = changePct >= 0;
                const sign = isPos ? '+' : '';
                
                return (
                  <tr 
                    key={player.playerId} 
                    onClick={() => navigate(`/player/${player.playerId}`)}
                    className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 font-mono text-gray-400">#{rank}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-white">{player.playerName}</td>
                    <td className="px-4 sm:px-6 py-4 text-gray-300 text-sm">{player.team}</td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right font-medium text-white">
                      {formatCurrency(player.currentPrice)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-mono text-right text-gray-300">
                      {formatCompact(player.marketCap)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-mono px-2 py-1 rounded font-medium text-sm ${isPos ? 'bg-cse-green/15 text-cse-green' : 'bg-cse-red/15 text-cse-red'}`}>
                        {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{sign}{changePct.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}