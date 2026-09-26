
import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Mail,
  Shield,
  TrendingUp,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPortfolio } from '../api/portfolio';
import { getOrders } from '../api/orders';

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([
        getPortfolio(),
        getOrders(),
      ]);

      setPortfolio(p);
      setOrders(o);

      await refreshUser();
    } catch (_) {}
  }, [refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

  const initials = (user?.name || 'Trader')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const executed = orders.filter(
    (order) => order.status === 'EXECUTED'
  ).length;

  const pending = orders.filter(
    (order) => order.status === 'PENDING'
  ).length;

  const holdings = portfolio?.holdings?.length || 0;

  const walletBalance = Number(
    portfolio?.walletBalance ?? user?.walletBalance ?? 0
  );

  const reservedBalance = Number(
    portfolio?.reservedBalance ?? user?.reservedBalance ?? 0
  );

  const availableBalance = Math.max(
    walletBalance - reservedBalance,
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">

      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#0b1524] p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-cyan-500 text-2xl font-black text-[#06101b] shadow-xl shadow-cyan-950/30">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-white">
                {user?.name || 'Trader'}
              </h1>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                <BadgeCheck size={12} />
                Active
              </span>
            </div>

            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Mail size={15} />
              {user?.email || 'No email available'}
            </p>

            <p className="mt-3 text-sm text-slate-600">
              Your CriStock trading identity and account overview.
            </p>
          </div>
        </div>
      </section>

      {/* Account Snapshot */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Wallet balance
            </p>
            <WalletCards
              size={17}
              className="text-cyan-300/70"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {money(walletBalance)}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Total virtual funds
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available balance
            </p>
            <WalletCards
              size={17}
              className="text-emerald-300/70"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-emerald-300">
            {money(availableBalance)}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Ready to trade
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Portfolio value
            </p>
            <TrendingUp
              size={17}
              className="text-cyan-300/70"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {money(portfolio?.portfolioValue)}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Current holdings
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Open orders
            </p>
            <ClipboardList
              size={17}
              className="text-amber-300/70"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {pending}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Pending orders
          </p>
        </div>
      </section>

      {/* Account + Trading */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* Account Details */}
        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5 sm:p-6">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
              <UserRound size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Account details
              </h2>

              <p className="text-xs text-slate-500">
                Your CriStock account information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">

            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
              <span className="text-slate-500">
                Full name
              </span>

              <span className="text-right font-medium text-slate-200">
                {user?.name || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
              <span className="text-slate-500">
                Email
              </span>

              <span className="max-w-[65%] truncate text-right text-slate-200">
                {user?.email || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">
                Account status
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Active
              </span>
            </div>

          </div>
        </div>

        {/* Trading Profile */}
        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5 sm:p-6">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
              <Shield size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Trading profile
              </h2>

              <p className="text-xs text-slate-500">
                Your current market footprint
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
              <p className="text-xs text-slate-600">
                Holdings
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {holdings}
              </p>
            </div>

            <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
              <p className="text-xs text-slate-600">
                Invested
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {money(portfolio?.investedAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
              <p className="text-xs text-slate-600">
                Profit / Loss
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  Number(portfolio?.profitLoss || 0) >= 0
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                }`}
              >
                {money(portfolio?.profitLoss)}
              </p>
            </div>

            <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
              <p className="text-xs text-slate-600">
                Reserved
              </p>

              <p className="mt-2 text-xl font-bold text-amber-200">
                {money(reservedBalance)}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
              <Activity size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Executed transactions
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {executed}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1524]/90 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300">
              <ClipboardList size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending orders
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {pending}
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

