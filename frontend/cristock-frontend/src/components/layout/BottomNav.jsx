import { NavLink } from 'react-router-dom';
import { LayoutGrid, PieChart, Star, Trophy } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/market', icon: LayoutGrid, label: 'Market' },
    { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
    { path: '/watchlist', icon: Star, label: 'Watchlist' },
    { path: '/leaderboard', icon: Trophy, label: 'Rankings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E0E14] border-t border-white/5 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-cse-green' : 'text-white/40 hover:text-white/80'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}