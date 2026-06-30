/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function GameDashboard() {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(6);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const intelFiles = [
    { id: 'casefile', title: 'Case File', src: '/casefile.jpeg' },
    { id: 'chief', title: 'Target: Chief', src: '/chief.jpeg' },
    { id: 'entity', title: 'Entity Sighting', src: '/monster.jpeg' }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-300 p-4 font-mono flex gap-4 relative selection:bg-cyan-900 selection:text-cyan-100">
      
      {/* CLASSIFIED INTEL MODAL OVERLAY */}
      {activeModal && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md">
          <div className="relative max-w-3xl w-full border border-red-900/50 bg-slate-950 p-6 rounded shadow-2xl shadow-red-900/10">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-400 font-bold tracking-widest z-10 [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]"
            >
              [X] CLOSE
            </button>
            <div className="relative w-full h-[60vh] mt-6 border border-slate-900 bg-black">
               <Image 
                 src={activeModal === 'map' ? '/map.jpeg' : (intelFiles.find(i => i.id === activeModal)?.src || '')} 
                 alt="Classified Intel" 
                 fill
                 className="object-contain grayscale contrast-125 opacity-90" 
               />
            </div>
            <p className="mt-6 text-center text-red-500 font-bold tracking-widest text-sm [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]">[CLASSIFIED INTEL - CASE ZERO]</p>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: The Terminal */}
      <div className="w-2/3 border border-slate-900 bg-[#050505] rounded-lg flex flex-col relative overflow-hidden shadow-lg shadow-black">
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Brighter cyan base + CRT text-shadow glow */}
          <p className="text-green-500 font-bold mb-4">
            [RADIO INCOMING] Command here. You've breached the village entrance. It's too quiet. Make your move, Rookie.
          </p>
          {/* Brighter slate base + subtle glow */}
          <p className="text-slate-400 [text-shadow:_0_0_10px_rgb(148_163_184_/_40%)]">
            &gt; Awaiting input...
          </p>
        </div>

        {/* Dynamic Input Area */}
        <div className="p-4 border-t border-slate-900 min-h-18 flex items-center justify-center bg-black">
          {showInput ? (
            <div className="flex items-center gap-3 w-full px-2">
              <span className="text-cyan-400 font-bold [text-shadow:_0_0_10px_rgb(34_211_238_/_60%)]">&gt;</span>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log("Sending prompt:", inputText);
                    setInputText('');
                    setShowInput(false);
                  }
                }}
                className="w-full bg-transparent outline-none text-slate-200 focus:ring-0 placeholder:text-slate-600 [text-shadow:_0_0_8px_rgb(226_232_240_/_40%)]"
                placeholder="Type your action and press Enter..."
                autoFocus
              />
              <button onClick={() => setShowInput(false)} className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">
                [CANCEL]
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setShowInput(true)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded text-sm font-bold border border-slate-700 transition-all shadow-md hover:shadow-cyan-900/20 hover:[text-shadow:_0_0_8px_rgb(34_211_238_/_50%)]">
                Take a Turn
              </button>
              <button className="px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors">
                Continue
              </button>
              <button className="px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors">
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Tactical HUD */}
      <div className="w-1/3 flex flex-col gap-4">
        
        {/* The Map / Target Container - Hardcoded source */}
        <button 
          onClick={() => setActiveModal('map')}
          className="h-48 border border-slate-900 bg-black rounded-lg p-2 flex flex-col relative overflow-hidden group hover:border-slate-700 transition-colors text-left"
        >
            <span className="absolute top-3 left-3 text-xs text-slate-400 font-bold z-10 tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">TACTICAL RADAR</span>
            <span className="absolute top-3 right-3 text-[10px] text-cyan-600 font-bold z-10 opacity-0 group-hover:opacity-100 transition-opacity">[EXPAND]</span>
            <div className="w-full h-full bg-[#020202] flex items-center justify-center relative mt-6 overflow-hidden border border-slate-900/50">
                 <Image 
                   src="/map.jpeg" 
                   alt="Area Map" 
                   fill
                   className="object-cover opacity-30 grayscale blur-[1px] group-hover:blur-none group-hover:opacity-50 transition-all duration-500" 
                 />
            </div>
        </button>

        {/* Player Stats */}
        <div className="border border-slate-900 bg-[#050505] rounded-lg p-6 flex flex-col gap-6">
          <div>
            <p className="text-xs text-slate-400 mb-2 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">VITALS</p>
            <div className="h-3 w-full bg-black rounded overflow-hidden border border-slate-900">
              <div className="h-full bg-red-800 transition-all duration-500 shadow-[0_0_10px_rgba(185,28,28,0.5)]" style={{ width: `${health}%` }}></div>
            </div>
            <p className="text-right text-[10px] mt-2 text-red-500 font-bold tracking-wider [text-shadow:_0_0_8px_rgb(239_68_68_/_60%)]">{health}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">AMMUNITION</p>
            <div className="flex gap-2">
              {Array.from({ length: ammo }).map((_, i) => (
                <div key={i} className="h-5 w-2.5 bg-yellow-600/80 rounded-sm shadow-[0_0_8px_rgba(202,138,4,0.4)] border border-yellow-900/50"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Files / Intel Grid */}
        <div className="flex-1 border border-slate-900 bg-[#050505] rounded-lg p-5 flex flex-col">
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-900 pb-3 font-bold tracking-widest [text-shadow:0_0_5px_rgb(148_163_184/50%)]">CASE FILES</p>
            <div className="grid grid-cols-3 gap-3">
                {intelFiles.map((intel) => (
                    <button 
                        key={intel.id}
                        onClick={() => setActiveModal(intel.id)}
                        className="aspect-square border border-slate-900 bg-black hover:border-cyan-800 transition-colors flex items-center justify-center relative overflow-hidden group shadow-lg"
                        title={intel.title}
                    >
                         <Image 
                           src={intel.src} 
                           alt={intel.title} 
                           fill
                           className="object-cover opacity-30 group-hover:opacity-80 transition-all duration-300 grayscale" 
                         />
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}