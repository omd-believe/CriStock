import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-12 border-t border-white/5 flex flex-col items-center justify-center text-center">

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00FF87] to-[#00C9FF] text-black font-bold text-xs shadow-[0_0_15px_rgba(0,255,135,0.3)]">
          OMD
        </div>
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