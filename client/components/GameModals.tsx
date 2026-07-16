/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import { signOut } from 'next-auth/react';

export default function GameModals({ 
  isGameOver, 
  showRetryConfirm, 
  setShowRetryConfirm, 
  showLogoutConfirm, 
  setShowLogoutConfirm, 
  activeModal, 
  setActiveModal, 
  intelDetails,
  showInventory,    
  setShowInventory, 
  intelFiles,
  onRestart,
  isGameWon
}: any) {
  
  if (isGameWon) {
    return (
      <div className="absolute inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-md text-center">
         <h1 className="text-3xl md:text-6xl text-cyan-500 font-bold tracking-[0.15em] md:tracking-[0.3em] mb-4 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] [text-shadow:0_0_15px_rgb(34_211_238)]">
             [EXTRACTION SUCCESSFUL]
         </h1>
         <p className="text-cyan-900 font-mono tracking-widest text-base md:text-xl mb-8 md:mb-12">CASE ZERO &mdash; SURVIVED.</p>
         <button 
             onClick={onRestart}
             className="px-6 md:px-8 py-3 md:py-4 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-500 font-bold tracking-widest border border-cyan-900/50 rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:border-cyan-700 text-sm md:text-base"
         >
             BEGIN NEW OPERATION
         </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="absolute inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-md text-center">
         <h1 className="text-3xl md:text-6xl text-red-700 font-bold tracking-[0.15em] md:tracking-[0.3em] mb-4 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] [text-shadow:0_0_15px_rgb(239_68_68)]">
             [YOU DIED]
         </h1>
         <p className="text-red-900 font-mono tracking-widest text-base md:text-xl mb-8 md:mb-12">CASE ZERO &mdash; CLOSED.</p>
         <button 
             onClick={onRestart} 
             className="px-6 md:px-8 py-3 md:py-4 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:border-red-700 text-sm md:text-base"
         >
             RESTART OPERATION
         </button>
      </div>
    );
  }

  if (showRetryConfirm) {
    return (
      <div className="absolute inset-0 z-60 bg-black/90 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
        <div className="relative max-w-md w-full border border-yellow-900/50 bg-[#050505] p-5 md:p-8 rounded-sm shadow-2xl shadow-yellow-900/10 flex flex-col items-center text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-yellow-600/50 flex items-center justify-center mb-4 md:mb-6 bg-yellow-950/20">
              <span className="text-yellow-500 font-bold text-lg md:text-xl [text-shadow:0_0_10px_rgb(234_179_8/50%)]">?</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-200 tracking-widest mb-3 md:mb-4">RESTART OPERATION?</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
            This will abort your current run. All progress, inventory items, and vitals will be wiped.
          </p>
          <div className="flex gap-3 md:gap-4 w-full">
             <button onClick={() => setShowRetryConfirm(false)} className="flex-1 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs md:text-sm font-bold border border-slate-700 transition-all shadow-md">
               CANCEL
             </button>
            <button onClick={onRestart} className="flex-1 py-2.5 md:py-3 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:border-red-700 text-xs md:text-sm">
              CONFIRM RESTART
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showLogoutConfirm) {
    return (
      <div className="absolute inset-0 z-60 bg-black/90 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
        <div className="relative max-w-md w-full border border-red-900 bg-[#050505] p-5 md:p-8 rounded-sm shadow-2xl shadow-red-900/20 flex flex-col items-center text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-red-600/50 flex items-center justify-center mb-4 md:mb-6 bg-red-950/30">
              <span className="text-red-500 font-bold text-lg md:text-xl [text-shadow:0_0_10px_rgb(239_68_68/60%)]">!</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-200 tracking-widest mb-3 md:mb-4">TERMINATE CONNECTION?</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
            Severing the radio link will abort the current operation. You will need to re-authenticate to re-establish contact. 
          </p>
          <div className="flex gap-3 md:gap-4 w-full">
             <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs md:text-sm font-bold border border-slate-700 transition-all shadow-md">
               CANCEL
             </button>
            <button onClick={() => signOut({ callbackUrl: '/landing' })} className="flex-1 py-2.5 md:py-3 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:border-red-700 text-xs md:text-sm">
              CONFIRM ABORT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showInventory) {
    return (
      <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-3 md:p-8 backdrop-blur-md">
        <div className="relative max-w-2xl w-full border border-cyan-900/50 bg-[#050505] p-4 md:p-6 rounded shadow-2xl flex flex-col min-h-[50vh] max-h-[85vh]">
           <button 
             onClick={() => setShowInventory(false)} 
             className="absolute top-3 right-3 md:top-4 md:right-4 text-cyan-600 hover:text-cyan-400 font-bold tracking-widest z-10 text-xs md:text-sm"
           >
             [X] CLOSE
           </button>
           <h2 className="text-lg md:text-xl font-bold text-slate-200 tracking-widest mb-4 md:mb-6 border-b border-slate-800 pb-2 pr-16">
             TACTICAL INVENTORY
           </h2>
           
           <div className="flex flex-col gap-3 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800">
              {intelFiles.map((intel: any) => (
                <button
                  key={intel.id}
                  onClick={() => {
                     setShowInventory(false);
                     setActiveModal(intel.id); 
                  }}
                  className="w-full text-left p-3 md:p-4 border border-slate-800 bg-black hover:border-cyan-700 hover:bg-cyan-950/20 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 group rounded shadow-sm"
                >
                   <div className="flex flex-col min-w-0">
                       <span className="text-slate-300 text-base md:text-lg font-mono group-hover:text-cyan-400 transition-colors">
                         {intel.title}
                       </span>
                       <span className="text-slate-500 text-xs mt-1 md:mt-2 truncate max-w-full sm:max-w-md">
                         {intel.desc}
                       </span>
                   </div>
                   <span className="text-xs text-slate-600 font-bold tracking-widest group-hover:text-cyan-500 transition-colors shrink-0">
                     [ EXAMINE ]
                   </span>
                </button>
              ))}
              {intelFiles.length === 0 && (
                  <p className="text-slate-500 text-center italic mt-10">Inventory is empty.</p>
              )}
           </div>
        </div>
      </div>
    );
  }

  if (activeModal && intelDetails[activeModal]) {
    return (
      <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-3 md:p-8 backdrop-blur-md">
        <div className="relative max-w-3xl w-full border border-red-900/50 bg-slate-950 p-4 md:p-6 rounded shadow-2xl shadow-red-900/10 flex flex-col max-h-[90vh] overflow-y-auto">
          <button 
            onClick={() => setActiveModal(null)}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-red-500 hover:text-red-400 font-bold tracking-widest z-10 [text-shadow:0_0_10px_rgb(239_68_68/60%)] text-xs md:text-sm"
          >
            [X] CLOSE
          </button>
          
          <div className="relative w-full h-[35vh] md:h-[50vh] mt-8 md:mt-6 border border-slate-900 bg-black">
             <Image 
               src={intelDetails[activeModal].src} 
               alt="Classified Intel" 
               fill
               className="object-contain grayscale contrast-125 opacity-90" 
             />
          </div>

          <div className="mt-4 p-3 md:p-4 border border-slate-800 bg-[#020202] relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-red-900/50"></div>
              <p className="text-cyan-600/80 text-xs font-bold tracking-widest mb-2 border-b border-slate-800/50 pb-1 inline-block">
                INTEL TYPE: {intelDetails[activeModal].title.toUpperCase()}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed [text-shadow:0_0_8px_rgb(148_163_184/30%)]">
                {intelDetails[activeModal].desc}
              </p>
          </div>
          <p className="mt-4 text-center text-red-500 font-bold tracking-widest text-xs [text-shadow:0_0_10px_rgb(239_68_68/60%)]">
            [CLASSIFIED INTEL - CASE ZERO]
          </p>
        </div>
      </div>
    );
  }

  return null;
}