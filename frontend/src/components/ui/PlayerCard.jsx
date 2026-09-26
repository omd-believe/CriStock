import {
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriceBadge from './PriceBadge';
import MiniChart from './MiniChart';
import { useWatchlist } from '../../context/WatchlistContext';

export default function PlayerCard({
  player,
  onBuyClick,
  onSellClick,
}) {
  const navigate = useNavigate();

  const {
    toggleWatchlist,
    isWatchlisted,
  } = useWatchlist();

  const active = isWatchlisted(player.id);

  const positive = Number(player.change || 0) >= 0;

  const initials = String(player.name || 'Player')
    .split(' ')
    .map((name) => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const playerImage =
    player.image || '/players/default-player.webp';

  return (
    <article
      onClick={() =>
        navigate(`/player/${player.id}`)
      }
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-[#0b1524]/90 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-cyan-300/15 hover:bg-[#0d1929]"
    >
      {/* PLAYER HEADER */}
      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <div className="flex min-w-0 items-center gap-3">

          {/* PLAYER PHOTO */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/10 via-[#10243a] to-emerald-300/10">
            <img
              src={playerImage}
              alt={player.name}
              loading="lazy"
              className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
              onError={(event) => {
                if (
                  event.currentTarget.src.endsWith(
                    '/players/default-player.webp'
                  )
                ) {
                  return;
                }

                event.currentTarget.src =
                  '/players/default-player.webp';
              }}
            />

            {/* subtle photo glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06101b]/35 via-transparent to-transparent" />

            {/* fallback initials */}
            <span className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-cyan-300/80 to-emerald-300/80 text-xs font-black text-[#06101b]">
              {initials}
            </span>
          </div>

          {/* PLAYER INFO */}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-100">
              {player.name}
            </h3>

            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {player.team || '—'}
              {player.country
                ? ` · ${player.country}`
                : ''}
            </p>

            {player.role && (
              <span className="mt-1.5 inline-block rounded-md border border-cyan-300/10 bg-cyan-300/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-300/70">
                {player.role}
              </span>
            )}
          </div>
        </div>

        {/* WATCHLIST */}
        <button
          aria-label="Toggle watchlist"
          className={`shrink-0 rounded-lg p-1.5 transition ${
            active
              ? 'bg-amber-300/10 text-amber-300'
              : 'text-slate-700 hover:bg-white/5 hover:text-slate-300'
          }`}
          onClick={(event) => {
            event.stopPropagation();
            toggleWatchlist(player.id);
          }}
        >
          <Star
            size={17}
            fill={active ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* PRICE */}
      <div className="mt-5 flex items-end justify-between gap-3 px-4">
        <div>
          <PriceBadge
            price={player.price}
            change={player.change}
            changePercent={player.changePercent}
          />

          <div
            className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${
              positive
                ? 'text-emerald-300'
                : 'text-rose-300'
            }`}
          >
            {positive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}

            {positive ? '+' : ''}
            {Number(
              player.changePercent || 0
            ).toFixed(2)}
            %
          </div>
        </div>

        <MiniChart
          data={player.chartData}
          isPositive={positive}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 grid grid-cols-2 gap-2 p-4 pt-0">
        <button
          className="rounded-xl border border-cyan-300/15 bg-cyan-300/7 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/12"
          onClick={(event) => {
            event.stopPropagation();
            onBuyClick(player);
          }}
        >
          Buy
        </button>

        <button
          className="rounded-xl border border-rose-300/15 bg-rose-300/7 py-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-300/12"
          onClick={(event) => {
            event.stopPropagation();
            onSellClick(player);
          }}
        >
          Sell
        </button>
      </div>
    </article>
  );
}