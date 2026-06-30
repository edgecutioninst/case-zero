/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react'; 

const intelDetails: Record<string, { title: string, src: string, desc: string }> = {
  map: {
    title: 'Tactical Radar',
    src: '/map.jpeg',
    desc: 'Satellite survey of Blackwood Village. The eastern ridge is completely frozen over. Ground units reported localized temporal anomalies near the old church. Approach with extreme caution.'
  },
  casefile: {
    title: 'Case File',
    src: '/casefile.jpeg',
    desc: 'Initial assessment of the incident. Contains erratic blueprints and paranoid ramblings about a "gate" beneath the village. The dates on these documents do not align with our timeline.'
  },
  chief: {
    title: 'Target: Chief',
    src: '/chief.jpeg',
    desc: 'Picture of the village chief, taken 3 days before the disappearance. Age: 29 (Severe anomalous aging reported). Nature: Calm, highly intelligent, deeply manipulative.'
  },
  entity: {
    title: 'Entity Sighting',
    src: '/monster.jpeg',
    desc: 'Subject designation: "The Frost Walker". Caught on a corrupted trail cam at 0300 hours. Ambient temperature dropped by 40 degrees prior to capture. It does not leave footprints.'
  }
};

const locationCoords: Record<string, { top: string, left: string }> = {
  village_entrance: { top: '85%', left: '50%' },
  village_square: { top: '45%', left: '50%' },
  old_church: { top: '65%', left: '40%' },
  chiefs_manor: { top: '35%', left: '61%' },
  smithy: { top: '60%', left: '65%' },
  cultist_camp: { top: '40%', left: '45%' },
  survivor_hideout: { top: '65%', left: '58%' },
  inrfs_camp: { top: '65%', left: '20%' },
};

export default function GameDashboard() {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(6);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [currentRoom, setCurrentRoom] = useState<string>('village_entrance');

  const intelFiles = [
    { id: 'casefile', ...intelDetails['casefile'] },
    { id: 'chief', ...intelDetails['chief'] },
    { id: 'entity', ...intelDetails['entity'] }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-300 p-4 font-mono flex gap-4 relative selection:bg-cyan-900 selection:text-cyan-100">
      
      {/* LOGOUT CONFIRMATION MODAL OVERLAY */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="relative max-w-md w-full border border-red-900 bg-[#050505] p-8 rounded-sm shadow-2xl shadow-red-900/20 flex flex-col items-center text-center">
            
            <div className="w-12 h-12 rounded-full border border-red-600/50 flex items-center justify-center mb-6 bg-red-950/30">
                <span className="text-red-500 font-bold text-xl [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]">!</span>
            </div>

            <h2 className="text-xl font-bold text-slate-200 tracking-widest mb-4">
              TERMINATE CONNECTION?
            </h2>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-8 [text-shadow:_0_0_8px_rgb(100_116_139_/_30%)]">
              Severing the radio link will abort the current operation. You will need to re-authenticate to re-establish contact with Command. 
            </p>

            <div className="flex gap-4 w-full">
               <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-sm font-bold border border-slate-700 transition-all shadow-md"
              >
                CANCEL
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: '/landing' })}
                className="flex-1 py-3 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:border-red-700"
              >
                CONFIRM ABORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASSIFIED INTEL MODAL OVERLAY */}
      {activeModal && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md">
          <div className="relative max-w-3xl w-full border border-red-900/50 bg-slate-950 p-6 rounded shadow-2xl shadow-red-900/10 flex flex-col">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-400 font-bold tracking-widest z-10 [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]"
            >
              [X] CLOSE
            </button>
            
            {/* Image Container */}
            <div className="relative w-full h-[50vh] mt-6 border border-slate-900 bg-black">
               <Image 
                 src={intelDetails[activeModal]?.src || ''} 
                 alt="Classified Intel" 
                 fill
                 className="object-contain grayscale contrast-125 opacity-90" 
               />
               
               {/* MODAL MAP MARKER */}
               {activeModal === 'map' && locationCoords[currentRoom] && (
                  <div 
                    className="absolute w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)] border-2 border-red-900 z-20 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: locationCoords[currentRoom].top, left: locationCoords[currentRoom].left }}
                  />
               )}
            </div>

            {/* Lore Text Box */}
            <div className="mt-4 p-4 border border-slate-800 bg-[#020202] relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-red-900/50"></div>
                <p className="text-cyan-600/80 text-xs font-bold tracking-widest mb-2 border-b border-slate-800/50 pb-1 inline-block">
                  INTEL TYPE: {intelDetails[activeModal]?.title.toUpperCase()}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed [text-shadow:_0_0_8px_rgb(148_163_184_/_30%)]">
                  {intelDetails[activeModal]?.desc}
                </p>
            </div>

            <p className="mt-4 text-center text-red-500 font-bold tracking-widest text-xs [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]">
              [CLASSIFIED INTEL - CASE ZERO]
            </p>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: The Terminal */}
      <div className="w-2/3 border border-slate-900 bg-[#050505] rounded-lg flex flex-col relative overflow-hidden shadow-lg shadow-black">
        
        {/* ENHANCED TERMINAL OUTPUT */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          
          <div className="border-l-2 border-green-700/50 pl-4 py-1">
            <p className="text-green-500 font-bold mb-3 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)] tracking-wide">
              [RADIO INCOMING] Command here. Do you copy, Rookie?
            </p>
            <p className="text-green-500/90 leading-relaxed text-sm mb-3">
              Blackwood village went dark overnight. No bodies, no distress calls, just silence. 
              We've dropped you at the perimeter with a standard-issue pistol, a torch, and 6 rounds. That's all we could authorize. If you need more ammo, you'll have to scavenge the ruins. 
            </p>
            <p className="text-green-500/90 leading-relaxed text-sm mb-3">
              Check your Case Files. We've uploaded the town's satellite map, a profile on the Village Chief, and a corrupted trail-cam sighting of an unknown entity operating in the area. 
            </p>
            <p className="text-green-500 font-bold leading-relaxed text-sm drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]">
              Your orders: Find out what happened, and neutralize the threat. Be smart. Good luck.
            </p>
          </div>

          <p className="text-slate-400 text-sm [text-shadow:_0_0_10px_rgb(148_163_184_/_40%)] animate-pulse">
            &gt; Awaiting input...
          </p>
        </div>

        {/* Dynamic Input Area */}
        <div className="p-4 border-t border-slate-900 min-h-20 flex items-center justify-center bg-black">
          {showInput ? (
            <div className="flex items-center gap-3 w-full max-w-2xl px-2">
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
            <div className="grid grid-cols-3 w-full items-center">
              
              {/* LEFT: LOGOUT BUTTON */}
              <div className="flex justify-start">
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-4 py-2 bg-black hover:bg-red-950/20 text-red-700 hover:text-red-500 rounded text-xs font-bold border border-red-900/30 transition-all shadow-md hover:shadow-red-900/10"
                >
                  [ABORT MISSION]
                </button>
              </div>

              {/* CENTER: CORE ACTIONS */}
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowInput(true)} className="whitespace-nowrap px-6 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded text-sm font-bold border border-slate-700 transition-all shadow-md hover:shadow-cyan-900/20 hover:[text-shadow:_0_0_8px_rgb(34_211_238_/_50%)]">
                  Take a Turn
                </button>
                <button className="whitespace-nowrap px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors">
                  Continue
                </button>
                <button className="whitespace-nowrap px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors">
                  Retry
                </button>
              </div>
              
              {/* RIGHT: CALL HANDLER */}
              <div className="flex justify-end">
                <button 
                  onClick={() => console.log("Calling Handler...")}
                  className="px-5 py-2 bg-black hover:bg-green-950/20 text-green-600 hover:text-green-400 rounded text-sm font-bold border border-green-900/40 transition-all shadow-md hover:shadow-green-900/10 hover:[text-shadow:_0_0_8px_rgb(34_197_94_/_50%)] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Call Handler
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Tactical HUD */}
      <div className="w-1/3 flex flex-col gap-4">
        
        {/* The Map */}
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
                 
                 {/* MINI RADAR MARKER */}
                 {locationCoords[currentRoom] && (
                    <div 
                      className="absolute w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)] z-20 transform -translate-x-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ top: locationCoords[currentRoom].top, left: locationCoords[currentRoom].left }}
                    />
                 )}
            </div>
        </button>

        {/* Player Stats */}
        <div className="border border-slate-900 bg-[#050505] rounded-lg p-6 flex flex-col gap-6">
          <div>
            <p className="text-xs text-slate-400 mb-2 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">VITALS</p>
            <div className="h-3 w-full bg-black rounded overflow-hidden border border-slate-900">
              <div className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_10px_rgba(185,28,28,0.5)]" style={{ width: `${health}%` }}></div>
            </div>
            <p className="text-right text-[10px] mt-2 text-red-500 font-bold tracking-wider [text-shadow:_0_0_8px_rgb(239_68_68_/_60%)]">{health}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">AMMUNITION</p>
            <div className="flex gap-2">
              {Array.from({ length: ammo }).map((_, i) => (
                <div key={i} className="h-5 w-2.5 bg-yellow-300/80 rounded-sm shadow-[0_0_8px_rgba(202,138,4,0.4)] border border-yellow-900/50"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Files / Intel Grid */}
        <div className="flex-1 border border-slate-900 bg-[#050505] rounded-lg p-5 flex flex-col">
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-900 pb-3 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">INVENTORY</p>
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