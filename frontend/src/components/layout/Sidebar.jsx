import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, PieChart, Star, Trophy, LogOut, ClipboardList, WalletCards, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { path: '/market', name: 'Market', icon: LayoutGrid },
    { path: '/portfolio', name: 'Portfolio', icon: PieChart },
    { path: '/orders', name: 'Orders', icon: ClipboardList },
    { path: '/watchlist', name: 'Watchlist', icon: Star },
    { path: '/leaderboard', name: 'Leaderboard', icon: Trophy },
  ];
  const initials = (user?.name || 'Trader').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="flex h-screen w-[256px] flex-col border-r border-white/7 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="flex h-[72px] items-center border-b border-white/6 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-sm font-black text-[#06101b] shadow-lg shadow-cyan-950/30">CS</div>
        <div className="ml-3"><p className="text-[17px] font-black tracking-tight text-white">CriStock</p><p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">Cricket exchange</p></div>
      </div>

      <div className="px-3 pt-5"><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Workspace</p><nav className="space-y-1">{navItems.map((item) => { const Icon=item.icon; return <NavLink key={item.path} to={item.path} className={({isActive}) => `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? 'bg-cyan-300/8 text-cyan-200 shadow-inner shadow-cyan-400/5' : 'text-slate-500 hover:bg-white/[0.035] hover:text-slate-200'}`}><Icon size={18} className="shrink-0" />{item.name}</NavLink>; })}</nav></div>

      <div className="mt-auto p-3">
        <button onClick={() => navigate('/wallet')} className="mb-2 flex w-full items-center gap-3 rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/8"><div className="rounded-lg bg-cyan-300/10 p-2 text-cyan-300"><WalletCards size={16} /></div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Wallet</p><p className="truncate font-mono text-sm font-semibold text-slate-200">₹{Number(user?.walletBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p></div></button>
        <div className="rounded-xl border border-white/6 bg-white/[0.025] p-3"><button onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 text-left"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-xs font-black text-slate-900">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-200">{user?.name || 'Trader'}</p><p className="truncate text-xs text-slate-600">{user?.email || 'Account'}</p></div><UserRound size={16} className="text-slate-600" /></button><button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/6 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-400/15 hover:text-rose-300"><LogOut size={14} /> Sign out</button></div>
      </div>
    </aside>
  );
}
