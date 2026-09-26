import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Footer from './Footer';

export default function AppLayout() {
  return <div className="min-h-screen overflow-x-hidden bg-[#050b14] text-slate-200"><div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block"><Sidebar /></div><div className="min-h-screen md:pl-[256px]"><TopBar/><main className="min-h-screen px-3 pb-24 pt-[88px] sm:px-5 md:px-6 md:pb-8"><div className="mx-auto max-w-[1600px]"><Outlet/><Footer/></div></main></div><BottomNav/></div>;
}
