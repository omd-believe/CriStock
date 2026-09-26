import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, WalletCards } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const path = location.pathname.split('/')[1];

  const titles = {
    market: 'Market',
    portfolio: 'Portfolio',
    orders: 'Orders',
    watchlist: 'Watchlist',
    leaderboard: 'Leaderboard',
    wallet: 'Wallet',
    profile: 'Profile',
    player: 'Player',
  };

  const title = titles[path] || 'Market';

  const initials = (user?.name || 'T')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-white/6 bg-[#07111f]/90 px-3 backdrop-blur-xl md:left-[256px] md:px-6">
      <div className="flex h-full items-center justify-between gap-3">

        {/* PAGE TITLE */}
        <div className="min-w-0 shrink-0">
          <p className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 sm:block">
            Trading terminal
          </p>

          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-lg font-bold text-white sm:text-xl">
              {title}
            </h1>

            {path === 'player' && (
              <ChevronRight
                size={15}
                className="text-slate-700"
              />
            )}
          </div>
        </div>

        {/* #BELIEVE ANIMATION */}
        <div className="hidden flex-1 justify-center px-6 md:flex">
          <div className="relative select-none">

            {/* Soft outer glow */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl animate-believe-glow" />

            {/* Text */}
            <div className="relative overflow-hidden px-4 py-1">
              <span className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-xl font-black tracking-[0.18em] text-transparent animate-believe">
                #Believe
              </span>

              {/* Moving light sweep */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-believe-shimmer" />
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">

          {/* WALLET */}
          <button
            onClick={() => navigate('/wallet')}
            className="group flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/5 px-2.5 py-2 transition hover:border-emerald-300/20 hover:bg-emerald-300/10 sm:px-3"
          >
            <WalletCards
              size={16}
              className="text-emerald-300"
            />

            <div className="hidden text-left sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Cash
              </p>

              <p className="font-mono text-xs font-bold text-emerald-200">
                ₹
                {Number(user?.walletBalance || 0).toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </p>
            </div>
          </button>

          {/* PROFILE */}
          <button
            onClick={() => navigate('/profile')}
            aria-label="Open profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/6 bg-white/[0.025] text-xs font-black text-cyan-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/5"
          >
            {initials}
          </button>

          {/* NOTIFICATIONS */}
          <button
            aria-label="Notifications"
            className="relative hidden rounded-xl border border-white/6 bg-white/[0.025] p-2.5 text-slate-500 transition hover:border-white/10 hover:text-slate-200 sm:block"
          >
            <Bell size={17} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </button>
        </div>
      </div>
    </header>
  );
}