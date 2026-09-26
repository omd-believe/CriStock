import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar() {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Market';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (

    <div className="h-16 bg-[#0E0E14] border-b border-white/5 fixed top-0 left-0 md:left-[240px] right-0 z-10 flex items-center justify-between px-4 md:px-6">
      <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>

      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input
          type="text"
          placeholder="Search players..."
          className="w-80 bg-[#15151E] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 border border-transparent focus:border-white/10 focus:outline-none transition-all duration-200"
        />
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-white/40 text-sm hidden sm:inline">Wallet:</span>
          <span className="text-cse-green font-mono font-semibold text-sm sm:text-base">
            ₹{user?.walletBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <button className="relative text-white/40 hover:text-white transition-colors duration-200">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cse-green rounded-full border-2 border-[#0E0E14]"></span>
        </button>
      </div>
    </div>
  );
}