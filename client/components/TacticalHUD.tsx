/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import BgmPlayer from './BgmPlayer';

export default function TacticalHUD({ 
  health, ammo, setShowInventory, invNotice, currentRoom, locationCoords 
}: any) {
  return (
    <div className="w-full flex flex-col gap-3 md:gap-4">
        
      {/* PINNED MAP */}
      <div className="border border-slate-900 bg-[#050505] rounded-lg relative h-44 md:h-56 overflow-hidden shadow-lg shadow-black group">
        <Image src="/map2.jpeg" alt="Tactical Radar" fill className="object-cover grayscale contrast-125 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-2 right-3 z-30">
            <p className="text-[9px] md:text-[10px] text-cyan-500 font-bold tracking-widest bg-black/60 px-2 py-1 rounded border border-cyan-900/50 drop-shadow-md">
                RADAR ACTIVE
            </p>
        </div>
        
        {locationCoords[currentRoom] && (
          <div className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-700 ease-in-out" style={{ top: locationCoords[currentRoom].top, left: locationCoords[currentRoom].left }}>
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)] border-2 border-red-900" />
            <span className="text-[8px] font-bold text-red-500 bg-black/80 px-1 py-0.5 rounded border border-red-900/50 whitespace-nowrap [text-shadow:0_0_5px_rgb(239_68_68/80%)]">YOU ARE HERE</span>
          </div>
        )}
      </div>

      {/* VITALS & AMBIENCE */}
      <div className="border border-slate-900 bg-[#050505] rounded-lg p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <div className="flex w-full">
          <div className="w-1/2 pr-3 md:pr-4 border-r border-slate-900">
            <p className="text-[11px] md:text-xs text-slate-400 mb-2 font-bold tracking-widest">VITALS</p>
            <div className="h-3 w-full bg-black rounded overflow-hidden border border-slate-900">
              <div className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_10px_rgba(185,28,28,0.5)]" style={{ width: `${health}%` }}></div>
            </div>
            <p className="text-right text-[10px] mt-2 text-red-500 font-bold tracking-wider">{health}%</p>
          </div>

          <div className="w-1/2 pl-3 md:pl-4 flex flex-col justify-between">
            <p className="text-[11px] md:text-xs text-slate-400 font-bold tracking-widest mb-2">AMBIENCE</p>
            <div className="flex-1 flex items-center">
              <BgmPlayer />
            </div>
          </div>
        </div>

        <div className="flex w-full mt-2">
          <div className="w-1/2 pr-3 md:pr-4 border-r border-slate-900 flex flex-col justify-between">
            <div className="flex justify-between items-end mb-3">
              <p className="text-[11px] md:text-xs text-slate-400 font-bold tracking-widest">AMMUNITION</p>
              <p className="text-[12px] md:text-[13px] text-yellow-500 font-bold tracking-wider">{ammo} BULLET{ammo !== 1 ? 'S' : ''}</p>
            </div>
            <div className="flex gap-1.5 md:gap-2 items-center flex-wrap min-h-5">
              {ammo > 0 ? Array.from({ length: ammo }).map((_, i) => (
                  <div key={`bullet-${i}`} className="h-5 w-2.5 bg-yellow-300/80 rounded-sm shadow-[0_0_8px_rgba(202,138,4,0.4)] border border-yellow-900/50"></div>
                )) : <span className="text-red-600 text-[10px] font-bold tracking-widest animate-pulse">[EMPTY]</span>}
            </div>
          </div>
          <div className="w-1/2 pl-3 md:pl-4 flex flex-col justify-between">
             <p className="text-[11px] md:text-xs text-slate-400 font-bold tracking-widest mb-3">COMBAT KNIFE</p>
             <div className="h-full w-full min-h-11 flex items-center justify-center border border-slate-800 bg-black rounded-sm relative group overflow-hidden shadow-inner shadow-black transition-all hover:border-slate-600">
                <Image src="/knife.jpeg" alt="Combat Knife" fill className="object-contain scale-[1.2] invert grayscale opacity-60 group-hover:opacity-100 group-hover:scale-[1.3] transition-all duration-300" />
             </div>
          </div>
        </div>
      </div>

      {/* BIG INVENTORY BUTTON */}
      <div className="md:flex-1 border border-slate-900 bg-[#050505] rounded-lg p-4 md:p-5 flex flex-col justify-center relative overflow-hidden group">
        {invNotice && (
          <span className="absolute top-3 right-3 text-[9px] md:text-[10px] text-green-500 font-bold tracking-widest animate-pulse [text-shadow:0_0_8px_rgba(34,197,94,0.6)]">
            {invNotice}
          </span>
        )}
        <button 
          onClick={() => setShowInventory(true)}
          className="w-full py-4 md:py-6 bg-slate-900/40 hover:bg-slate-800 text-cyan-500 hover:text-cyan-400 font-bold tracking-widest text-base md:text-lg border border-slate-700 rounded transition-all shadow-md group-hover:shadow-cyan-900/20 group-hover:border-cyan-800"
        >
          [ OPEN INVENTORY ]
        </button>
      </div>
      
    </div>
  );
}