import { useState, useMemo, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import StatCard from '../components/ui/StatCard';
import PlayerCard from '../components/ui/PlayerCard';
import BuyModal from '../components/modals/BuyModal';
import SellModal from '../components/modals/SellModal';
import { getPortfolio } from '../api/portfolio';

const TABS = ['All', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER', 'Top Gainers', 'Top Losers'];
const TAB_LABELS = {
  All: 'All', BATSMAN: 'Batsman', BOWLER: 'Bowler',
  ALL_ROUNDER: 'Allrounder', WICKET_KEEPER: 'WK', 'Top Gainers': '↑ Gainers', 'Top Losers': '↓ Losers',
};
const SORTS = ['Price ↑', 'Price ↓', 'Change %', 'Name A-Z'];

export default function MarketPage() {
  const { players, loading } = useMarket();
  const [activeTab, setActiveTab] = useState('All');
  const [sort, setSort] = useState('Price ↑');
  const [buyModalPlayer, setBuyModalPlayer] = useState(null);
  const [sellModalPlayer, setSellModalPlayer] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [holdingsMap, setHoldingsMap] = useState({});

  
  useEffect(() => {
    getPortfolio()
      .then(portfolio => {
        const map = {};
        (portfolio.holdings || []).forEach(h => { map[h.playerId.toString()] = h.shares; });
        setHoldingsMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const filtered = useMemo(() => {
    let list = [...players];
    if (activeTab === 'Top Gainers') list = [...list].sort((a, b) => b.changePercent - a.changePercent).slice(0, 20);
    else if (activeTab === 'Top Losers') list = [...list].sort((a, b) => a.changePercent - b.changePercent).slice(0, 20);
    else if (activeTab !== 'All') list = list.filter(p => p.rawRole === activeTab);

    switch (sort) {
      case 'Price ↓': return [...list].sort((a, b) => b.price - a.price);
      case 'Price ↑': return [...list].sort((a, b) => a.price - b.price);
      case 'Change %': return [...list].sort((a, b) => b.changePercent - a.changePercent);
      case 'Name A-Z': return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default: return list;
    }
  }, [players, activeTab, sort]);

  const totalMarketCap = players.reduce((s, p) => s + p.marketCap, 0);
  const formatCompact = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Players" value={players.length.toString()} />
        <StatCard label="Active Gainers" value={players.filter(p => p.changePercent > 0).length.toString()} />
        <StatCard label="Market Cap" value={formatCompact(totalMarketCap)} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30'
                  : 'text-white/60 bg-[#12121A] border border-white/5 hover:bg-white/5'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
        <select
          value={sort} onChange={(e) => setSort(e.target.value)}
          className="bg-[#12121A] border border-white/5 text-white text-sm rounded-lg px-4 py-1.5 outline-none focus:border-white/20 cursor-pointer"
        >
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40">No players found for this filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onBuyClick={setBuyModalPlayer}
              onSellClick={setSellModalPlayer}
            />
          ))}
        </div>
      )}

      <BuyModal
        isOpen={!!buyModalPlayer}
        player={buyModalPlayer}
        onClose={() => setBuyModalPlayer(null)}
        onSuccess={(msg) => {
          setToastMessage(msg);
          
          getPortfolio().then(p => {
            const map = {};
            (p.holdings || []).forEach(h => { map[h.playerId.toString()] = h.shares; });
            setHoldingsMap(map);
          }).catch(() => {});
        }}
      />
      <SellModal
        isOpen={!!sellModalPlayer}
        player={sellModalPlayer}
        sharesOwned={sellModalPlayer ? (holdingsMap[sellModalPlayer.id] || 0) : 0}
        onClose={() => setSellModalPlayer(null)}
        onSuccess={(msg) => {
          setToastMessage(msg);
          getPortfolio().then(p => {
            const map = {};
            (p.holdings || []).forEach(h => { map[h.playerId.toString()] = h.shares; });
            setHoldingsMap(map);
          }).catch(() => {});
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A26] border border-[#00FF87]/30 px-6 py-4 rounded-xl">
          <p className="text-[#00FF87] font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}