import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-12 border-t border-white/5 flex flex-col items-center justify-center text-center">

      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-sm font-black text-[#06101b] shadow-lg shadow-cyan-950/30">CS</div>
        <span className="text-xl font-bold tracking-tight text-white">CriStock</span>
      </div>


      <p className="text-white/60 text-sm flex items-center gap-1.5 mb-1">
        Built with <Heart size={14} className="text-[#FF4757] fill-[#FF4757]" /> by
      </p>
      <h2 className="text-white font-semibold text-lg tracking-wide">Om Deshmukh</h2>
      <p className="text-[#00FF87] font-mono text-xs mt-1.5 uppercase tracking-widest">
     #Believe
      </p>


      <p className="text-white/30 text-[10px] mt-6 uppercase tracking-wider">
        © {new Date().getFullYear()} CriStock Trading. All rights reserved.
      </p>
    </footer>
  );
}