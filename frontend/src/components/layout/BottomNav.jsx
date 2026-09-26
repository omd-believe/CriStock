import { NavLink } from 'react-router-dom';
import { LayoutGrid, PieChart, Star, Trophy, ClipboardList } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/market', icon: LayoutGrid, label: 'Market' },
    { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
    { path: '/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/watchlist', icon: Star, label: 'Watchlist' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
  ];
  return <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[#07111f]/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-lg justify-around">{navItems.map(({path,icon:Icon,label}) => <NavLink key={path} to={path} className={({isActive}) => `flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${isActive ? 'bg-cyan-300/8 text-cyan-200' : 'text-slate-600'}`}><Icon size={18}/><span className="text-[9px] font-bold uppercase tracking-wide">{label}</span></NavLink>)}</div></div>;
}
