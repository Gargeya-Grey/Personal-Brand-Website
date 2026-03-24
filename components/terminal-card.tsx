import { Cpu } from 'lucide-react';

export function TerminalCard() {
  return (
    <div className="bg-primary-container/80 backdrop-blur-xl border border-white/10 p-8 rounded-soft shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-center">
      <div className="flex gap-2 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
      </div>
      
      <div className="font-label text-sm space-y-3 relative z-10">
        <p className="text-[#6ffbbe]">
          <span className="text-[#7c839b] opacity-50 mr-2">$</span> 
          run system-init --neural
        </p>
        <p className="text-white/80">Analyzing architecture nodes...</p>
        <p className="text-accent">Optimal performance achieved.</p>
        <p className="text-white/80">Ready for deployment.</p>
      </div>
      
      <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
        <Cpu className="w-64 h-64 text-white" />
      </div>
    </div>
  );
}
