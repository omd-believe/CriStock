import { useState, useMemo, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import StatCard from '../components/ui/StatCard';
import PlayerCard from '../components/ui/PlayerCard';
import BuyModal from '../components/modals/BuyModal';
import SellModal from '../components/modals/SellModal';
import { getPortfolio } from '../api/portfolio';
import {
  BarChart3,
  Users,
  TrendingUp,
  SlidersHorizontal,
  Search,
  X,
} from 'lucide-react';

const TABS = [
  'All',
  'BATSMAN',
  'BOWLER',
  'ALL_ROUNDER',
  'WICKET_KEEPER',
  'Top Gainers',
  'Top Losers',
];

const TAB_LABELS = {
  All: 'All',
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'Allrounder',
  WICKET_KEEPER: 'WK',
  'Top Gainers': '↑ Gainers',
  'Top Losers': '↓ Losers',
};

const SORTS = ['Price ↑', 'Price ↓', 'Change %', 'Name A-Z'];

export default function MarketPage() {
  const { players, loading } = useMarket();

  const [activeTab, setActiveTab] = useState('All');
  const [sort, setSort] = useState('Price ↑');
  const [searchQuery, setSearchQuery] = useState('');

  const [buyModalPlayer, setBuyModalPlayer] = useState(null);
  const [sellModalPlayer, setSellModalPlayer] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [holdingsMap, setHoldingsMap] = useState({});

  useEffect(() => {
    getPortfolio()
      .then((portfolio) => {
        const map = {};

        (portfolio.holdings || []).forEach((holding) => {
          map[holding.playerId.toString()] = holding.shares;
        });

        setHoldingsMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const filtered = useMemo(() => {
    let list = [...players];

    /*
     * SEARCH
     *
     * Searches across:
     * - Player name
     * - Country
     * - Team
     * - Role
     *
     * Example:
     * "virat"
     * "india"
     * "rcb"
     * "batsman"
     */
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter((player) => {
        const name = String(player.name || '').toLowerCase();
        const country = String(player.country || '').toLowerCase();
        const team = String(player.team || '').toLowerCase();
        const role = String(
          player.rawRole || player.role || ''
        ).toLowerCase();

        return (
          name.includes(query) ||
          country.includes(query) ||
          team.includes(query) ||
          role.includes(query)
        );
      });
    }

    /*
     * CATEGORY FILTER
     */
    if (activeTab === 'Top Gainers') {
      list = [...list]
        .sort(
          (a, b) =>
            Number(b.changePercent || 0) -
            Number(a.changePercent || 0)
        )
        .slice(0, 20);
    } else if (activeTab === 'Top Losers') {
      list = [...list]
        .sort(
          (a, b) =>
            Number(a.changePercent || 0) -
            Number(b.changePercent || 0)
        )
        .slice(0, 20);
    } else if (activeTab !== 'All') {
      list = list.filter(
        (player) => player.rawRole === activeTab
      );
    }

    /*
     * SORT
     */
    switch (sort) {
      case 'Price ↓':
        return [...list].sort(
          (a, b) =>
            Number(b.price || 0) - Number(a.price || 0)
        );

      case 'Price ↑':
        return [...list].sort(
          (a, b) =>
            Number(a.price || 0) - Number(b.price || 0)
        );

      case 'Change %':
        return [...list].sort(
          (a, b) =>
            Number(b.changePercent || 0) -
            Number(a.changePercent || 0)
        );

      case 'Name A-Z':
        return [...list].sort((a, b) =>
          String(a.name || '').localeCompare(
            String(b.name || '')
          )
        );

      default:
        return list;
    }
  }, [players, activeTab, sort, searchQuery]);

  const totalMarketCap = players.reduce(
    (sum, player) => sum + Number(player.marketCap || 0),
    0
  );

  const formatCompact = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    }

    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }

    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
  };

  const refreshHoldings = async () => {
    try {
      const portfolio = await getPortfolio();

      const map = {};

      (portfolio.holdings || []).forEach((holding) => {
        map[holding.playerId.toString()] = holding.shares;
      });

      setHoldingsMap(map);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/10 bg-gradient-to-br from-[#10243a] via-[#0b1728] to-[#09101d] p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-28 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
              Live market
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Trade the cricket market.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Follow live player prices, place market or limit
              orders, and build your virtual cricket portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/5 px-3 py-2 text-xs font-semibold text-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Live price feed
          </div>
        </div>
      </section>

      {/* MARKET STATS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Listed players"
          value={players.length.toString()}
          hint="Available in the market"
        />

        <StatCard
          icon={TrendingUp}
          label="Active gainers"
          value={players
            .filter((player) => Number(player.changePercent || 0) > 0)
            .length.toString()}
          hint="Positive price movement"
        />

        <StatCard
          icon={BarChart3}
          label="Market cap"
          value={formatCompact(totalMarketCap)}
          hint="Combined player value"
        />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search players, teams, countries or roles..."
          className="w-full rounded-2xl border border-white/8 bg-[#0b1524] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition-all focus:border-cyan-300/30 focus:bg-[#0d192a] focus:ring-1 focus:ring-cyan-300/10"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* FILTERS + SORT */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'
                  : 'border-white/6 bg-[#0b1524] text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={15}
            className="text-slate-600"
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="cursor-pointer rounded-lg border border-white/5 bg-[#12121A] px-4 py-1.5 text-sm text-white outline-none focus:border-white/20"
          >
            {SORTS.map((sortOption) => (
              <option key={sortOption}>
                {sortOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEARCH RESULT COUNT */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <p className="text-sm text-slate-400">
            Search results for{' '}
            <span className="font-semibold text-white">
              "{searchQuery}"
            </span>
          </p>

          <p className="text-xs font-semibold text-cyan-300">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'player' : 'players'}
          </p>
        </div>
      )}

      {/* PLAYERS */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/6 bg-[#0b1524] py-20 text-center">
          <Search
            size={30}
            className="mx-auto text-slate-700"
          />

          <p className="mt-4 text-sm font-semibold text-slate-400">
            No players found
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Try a different player name, team, country or role.
          </p>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-5 rounded-lg border border-cyan-300/10 bg-cyan-300/5 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onBuyClick={setBuyModalPlayer}
              onSellClick={setSellModalPlayer}
            />
          ))}
        </div>
      )}

      {/* BUY MODAL */}
      <BuyModal
        isOpen={!!buyModalPlayer}
        player={buyModalPlayer}
        onClose={() => setBuyModalPlayer(null)}
        onSuccess={(message) => {
          setToastMessage(message);
          refreshHoldings();
        }}
      />

      {/* SELL MODAL */}
      <SellModal
        isOpen={!!sellModalPlayer}
        player={sellModalPlayer}
        sharesOwned={
          sellModalPlayer
            ? holdingsMap[sellModalPlayer.id] || 0
            : 0
        }
        onClose={() => setSellModalPlayer(null)}
        onSuccess={(message) => {
          setToastMessage(message);
          refreshHoldings();
        }}
      />

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-300/20 bg-[#101b2b] px-6 py-4 shadow-2xl">
          <p className="font-medium text-emerald-300">
            {toastMessage}
          </p>
        </div>
      )}
    </div>
  );
}