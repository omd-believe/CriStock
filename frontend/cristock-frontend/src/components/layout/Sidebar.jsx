import { NavLink } from 'react-router-dom';
import { LayoutGrid, PieChart, Star, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  

  const isMarketOpen = true; 

  const navItems = [
    { path: '/market', name: 'Market', icon: LayoutGrid },
    { path: '/portfolio', name: 'Portfolio', icon: PieChart },
    { path: '/watchlist', name: 'Watchlist', icon: Star },
    { path: '/leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="w-[240px] h-screen bg-[#0E0E16] border-r border-white/5 fixed left-0 top-0 flex flex-col justify-between">
      <div>

        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #00FF87 0%, #00C9FF 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-black" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8.5 16a5 5 0 0 1-2.5-6.5"/>
              <path d="M15.5 16a5 5 0 0 0 2.5-6.5"/>
            </svg>
          </div>
          <span className="font-sans font-semibold text-white text-lg tracking-tight">Cricket SE</span>
        </div>


        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'bg-cse-green/10 text-cse-green border-cse-green font-medium'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-transparent'
                  }`
                }
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center px-2 mb-4">
          <span className={`w-2 h-2 rounded-full mr-2 ${isMarketOpen ? 'bg-cse-green animate-pulse' : 'bg-[#FF4757]'}`}></span>
          <span className="text-white/60 text-sm font-medium">
            {isMarketOpen ? 'Market Open' : 'Market Closed'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="overflow-hidden">
            <p className="text-sm text-white font-medium truncate">{user?.name || 'Trader'}</p>
            <p className="text-xs text-cse-green font-mono mt-0.5 truncate">
              ₹{user?.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-white/40 hover:text-cse-red transition-colors duration-200 p-1"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}