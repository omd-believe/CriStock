import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-cse-bg">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col relative">
        <TopBar />
        <main className="flex-1 mt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}