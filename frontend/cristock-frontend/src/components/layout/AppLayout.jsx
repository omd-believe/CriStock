import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#050508] overflow-x-hidden">
      <div className="hidden md:flex w-[240px] fixed h-full z-20">
        <Sidebar />
      </div>
      
      <div className="flex-1 md:ml-[240px] flex flex-col relative w-full min-w-0">
        <TopBar />
        
        
        <main className="flex-1 mt-16 p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}