/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react'; 

// --- Text Parser for Health Tags ---
const renderColoredText = (text: string) => {
  if (!text) return null;
  const regex = /(\[HP INCREASED BY \d+%\]|\[HP DECREASED BY \d+%\])/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (part.startsWith('[HP INCREASED')) {
      return <span key={i} className="text-green-500 font-bold tracking-widest drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse">{part}</span>;
    } else if (part.startsWith('[HP DECREASED')) {
      return <span key={i} className="text-red-500 font-bold tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

// --- The Typewriter Effect ---
const TypewriterText = ({ text, isTyping }: { text: string, isTyping: boolean }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(typingInterval);
      }
    }, 12); 

    return () => clearInterval(typingInterval);
  }, [text, isTyping]);

  return <>{renderColoredText(displayedText)}</>;
};
// --------------------------------------------

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
  },
  // --- HIDDEN ITEMS (Unlockable) ---
  manor_key: {
    title: 'Manor Key',
    src: '/manor-key.jpeg', 
    desc: 'A heavy, wrought-iron key recovered from the village. The metal is unnaturally cold to the touch, and it seems to hum with a low frequency.'
  },
  church_key: {
    title: 'Church Key',
    src: '/church-key.jpeg', 
    desc: 'An ancient, rusted key meant for the old church doors. The blood rusted onto the handle is fresh.'
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
  
  // Custom Confirmation Modals
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  
  // Progression States
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasManorKey, setHasManorKey] = useState(false);
  const [hasChurchKey, setHasChurchKey] = useState(false);
  
  // Inventory Notification & UI States
  const [invNotice, setInvNotice] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const [currentRoom, setCurrentRoom] = useState<string>('village_entrance');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // References
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const noticeTimerRef = useRef<any>(null);

  const [terminalLog, setTerminalLog] = useState([
    { 
      role: 'system', 
      text: "[ENCRYPTED TRANSMISSION START]\n\nOp-Center: 'Rookie, listen closely. Blackwood Village went off grid 48 hours ago. Ground Team Delta was sent in yesterday. We just received their final transmission: screaming, heavy radio static, and the sound of cracking ice. Then... nothing.'\n\n'You are stepping into a blind spot. Your objectives: Locate Delta's remains, and deal with whatever is haunting the village. Trust no one. The cold isn't the only thing hunting out there. Over and out.'\n\n[TRANSMISSION END]\n\nYou stand at the desolate entrance of Blackwood. The silence is deafening.",
      isTyping: false
    }
  ]);

  // Smooth scroll to bottom whenever logs update
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLog]);

  const showNotification = (itemName: string) => {
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    setInvNotice(`[ ${itemName} ADDED IN INVENTORY ]`);
    noticeTimerRef.current = setTimeout(() => {
      setInvNotice(null);
      noticeTimerRef.current = null;
    }, 4000);
  };

  const handlePlayerAction = async (actionText: string) => {
    if (!actionText.trim() || isProcessing || isGameOver) return;

    setTerminalLog(prev => prev.map(log => ({ ...log, isTyping: false })));
    setTerminalLog(prev => [...prev, { role: 'user', text: `> ${actionText}`, isTyping: false }]);
    setInputText('');
    setShowInput(false);
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:8000/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'rookie@gmail.com', 
          action: actionText
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTerminalLog(prev => [...prev, { role: 'ai', text: data.response_text, isTyping: true }]);
        
        setHealth(data.updated_health);
        setAmmo(data.updated_ammo);
        
        if (data.current_room) setCurrentRoom(data.current_room);

        // Check for state changes from main.py
        if (data.has_manor_key && !hasManorKey) {
          setHasManorKey(true);
          showNotification('MANOR KEY');
        }
        
        if (data.has_church_key && !hasChurchKey) {
          setHasChurchKey(true);
          showNotification('CHURCH KEY');
        }

        if (data.is_over === true || data.updated_health <= 0) {
           setIsGameOver(true);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setTerminalLog(prev => [...prev, { role: 'system', text: "[ERROR] Signal lost. Unable to reach Command.", isTyping: true }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCallHandler = () => {
    if (isProcessing || isGameOver || isCalling) return;
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      handlePlayerAction("[RADIO TRANSMISSION] Op-Center, this is Rookie. I'm operating blind right now. Requesting tactical analysis and immediate objective. Over.");
    }, 1500);
  };

  // Dynamically build the inventory list based on what is unlocked
  const intelFiles = [
    { id: 'casefile', ...intelDetails['casefile'] },
    { id: 'chief', ...intelDetails['chief'] },
    { id: 'entity', ...intelDetails['entity'] }
  ];
  if (hasManorKey) intelFiles.push({ id: 'manor_key', ...intelDetails['manor_key'] });
  if (hasChurchKey) intelFiles.push({ id: 'church_key', ...intelDetails['church_key'] });

  return (
    <div className="h-screen overflow-hidden bg-black text-slate-300 p-4 font-mono flex gap-4 relative selection:bg-cyan-900 selection:text-cyan-100">
      
      {/* GAME OVER OVERLAY */}
      {isGameOver && (
        <div className="absolute inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-md">
            <h1 className="text-6xl text-red-700 font-bold tracking-[0.3em] mb-4 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] [text-shadow:_0_0_15px_rgb(239_68_68)]">
                [YOU DIED]
            </h1>
            <p className="text-red-900 font-mono tracking-widest text-xl mb-12">CASE ZERO &mdash; CLOSED.</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:border-red-700"
            >
                RESTART OPERATION
            </button>
        </div>
      )}

      {/* RETRY CONFIRMATION MODAL */}
      {showRetryConfirm && (
        <div className="absolute inset-0 z-60 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="relative max-w-md w-full border border-yellow-900/50 bg-[#050505] p-8 rounded-sm shadow-2xl shadow-yellow-900/10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border border-yellow-600/50 flex items-center justify-center mb-6 bg-yellow-950/20">
                <span className="text-yellow-500 font-bold text-xl [text-shadow:0_0_10px_rgb(234_179_8/50%)]">?</span>
            </div>
            <h2 className="text-xl font-bold text-slate-200 tracking-widest mb-4">RESTART OPERATION?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 [text-shadow:0_0_8px_rgb(100_116_139/30%)]">
              This will abort your current run. All progress, inventory items, and vitals will be wiped. You will be redeployed at the village entrance.
            </p>
            <div className="flex gap-4 w-full">
               <button 
                onClick={() => setShowRetryConfirm(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-sm font-bold border border-slate-700 transition-all shadow-md"
              >
                CANCEL
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-red-950/20 hover:bg-red-900/40 text-red-500 font-bold tracking-widest border border-red-900/50 rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:border-red-700"
              >
                CONFIRM RESTART
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 z-60 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="relative max-w-md w-full border border-red-900 bg-[#050505] p-8 rounded-sm shadow-2xl shadow-red-900/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border border-red-600/50 flex items-center justify-center mb-6 bg-red-950/30">
                <span className="text-red-500 font-bold text-xl [text-shadow:0_0_10px_rgb(239_68_68/60%)]">!</span>
            </div>
            <h2 className="text-xl font-bold text-slate-200 tracking-widest mb-4">TERMINATE CONNECTION?</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 [text-shadow:0_0_8px_rgb(100_116_139/30%)]">
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

      {/* CLASSIFIED INTEL MODAL */}
      {activeModal && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md">
          <div className="relative max-w-3xl w-full border border-red-900/50 bg-slate-950 p-6 rounded shadow-2xl shadow-red-900/10 flex flex-col">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-400 font-bold tracking-widest z-10 [text-shadow:_0_0_10px_rgb(239_68_68_/_60%)]"
            >
              [X] CLOSE
            </button>
            
            <div className="relative w-full h-[50vh] mt-6 border border-slate-900 bg-black">
               <Image 
                 src={intelDetails[activeModal]?.src || ''} 
                 alt="Classified Intel" 
                 fill
                 className="object-contain grayscale contrast-125 opacity-90" 
               />
               
               {/* ENHANCED MODAL MAP MARKER */}
               {activeModal === 'map' && locationCoords[currentRoom] && (
                  <div 
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                    style={{ top: locationCoords[currentRoom].top, left: locationCoords[currentRoom].left }}
                  >
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)] border-2 border-red-900" />
                    <span className="text-[9px] font-bold text-red-500 bg-black/80 px-1 py-0.5 rounded border border-red-900/50 whitespace-nowrap [text-shadow:_0_0_5px_rgb(239_68_68_/_80%)]">
                      YOU ARE HERE
                    </span>
                  </div>
               )}
            </div>

            <div className="mt-4 p-4 border border-slate-800 bg-[#020202] relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-red-900/50"></div>
                <p className="text-cyan-600/80 text-xs font-bold tracking-widest mb-2 border-b border-slate-800/50 pb-1 inline-block">
                  INTEL TYPE: {intelDetails[activeModal]?.title.toUpperCase()}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed [text-shadow:0_0_8px_rgb(148_163_184/30%)]">
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
        
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
          
          {terminalLog.map((log, index) => (
            <div key={index} className={log.role === 'user' ? 'text-cyan-400 text-lg ml-4' : log.role === 'system' ? 'border-l-2 border-green-700/50 pl-4 py-1 text-green-500/90 text-lg whitespace-pre-wrap' : 'text-slate-300 text-lg leading-relaxed whitespace-pre-wrap'}>
              {log.role === 'ai' && log.isTyping ? (
                <TypewriterText text={log.text} isTyping={true} />
              ) : (
                renderColoredText(log.text) 
              )}
            </div>
          ))}

          {isProcessing && (
            <p className="text-slate-500 text-lg animate-pulse">
              [TRANSMITTING SIGNAL...]
            </p>
          )}

          {!isProcessing && !isGameOver && (
            <p className="text-slate-400 text-lg [text-shadow:_0_0_10px_rgb(148_163_184_/_40%)] animate-pulse">
              &gt; Awaiting input...
            </p>
          )}

          <div ref={scrollEndRef} />
        </div>

        {/* Dynamic Input Area */}
        <div className="p-4 border-t border-slate-900 min-h-20 flex items-center justify-center bg-black">
          {showInput ? (
            <div className="flex items-center gap-3 w-full max-w-2xl px-2">
              <span className="text-cyan-400 font-bold [text-shadow:0_0_10px_rgb(34_211_238/60%)]">&gt;</span>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePlayerAction(inputText);
                  }
                }}
                disabled={isProcessing || isGameOver}
                className="w-full bg-transparent outline-none text-slate-200 focus:ring-0 placeholder:text-slate-600 [text-shadow:_0_0_8px_rgb(226_232_240_/_40%)] text-lg"
                placeholder="Type your action and press Enter..."
                autoFocus
              />
              <button onClick={() => setShowInput(false)} className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">
                [CANCEL]
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 w-full items-center">
              
              <div className="flex justify-start gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-3 py-2 bg-black hover:bg-red-950/20 text-red-700 hover:text-red-500 rounded text-xs font-bold border border-red-900/30 transition-all shadow-md hover:shadow-red-900/10"
                >
                  [ABORT]
                </button>
                <button 
                  onClick={() => setShowRetryConfirm(true)}
                  disabled={isGameOver || isProcessing || isCalling}
                  className="px-3 py-2 bg-black hover:bg-yellow-950/20 text-yellow-700 hover:text-yellow-500 rounded text-xs font-bold border border-yellow-900/30 transition-all shadow-md hover:shadow-yellow-900/10 disabled:opacity-50"
                >
                  [RESTART]
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowInput(true)} 
                  disabled={isGameOver || isCalling}
                  className="whitespace-nowrap px-6 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded text-sm font-bold border border-slate-700 transition-all shadow-md hover:shadow-cyan-900/20 hover:[text-shadow:_0_0_8px_rgb(34_211_238_/_50%)] disabled:opacity-50"
                >
                  Take a Turn
                </button>
                <button 
                  onClick={() => handlePlayerAction("I hold my position, stay quiet, and cautiously observe my surroundings.")}
                  disabled={isGameOver || isProcessing || isCalling}
                  className="whitespace-nowrap px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleCallHandler}
                  disabled={isGameOver || isProcessing || isCalling}
                  className={`px-5 py-2 bg-black hover:bg-green-950/20 ${isCalling ? 'text-green-400 border-green-400 animate-pulse' : 'text-green-600 border-green-900/30'} rounded text-xs font-bold border transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCalling ? 'bg-green-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                  {isCalling ? '[ ENCRYPTING... ]' : 'Call Handler'}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Tactical HUD */}
      <div className="w-1/3 flex flex-col gap-4">
        
        {/* COMPACT MAP BUTTON */}
        <button 
          onClick={() => setActiveModal('map')}
          className="border border-slate-900 bg-[#050505] hover:bg-slate-900/50 rounded-lg p-4 flex items-center justify-between transition-colors group shadow-lg"
        >
            <span className="text-xs text-slate-400 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)] flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
              VILLAGE MAP
            </span>
            <span className="text-[10px] text-cyan-600 font-bold opacity-70 group-hover:opacity-100 transition-opacity">[ ACCESS ]</span>
        </button>

        {/* VITALS & COMBAT INVENTORY */}
        <div className="border border-slate-900 bg-[#050505] rounded-lg p-6 flex flex-col gap-6">
          
          {/* Vitals Section */}
          <div>
            <p className="text-xs text-slate-400 mb-2 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">VITALS</p>
            <div className="h-3 w-full bg-black rounded overflow-hidden border border-slate-900">
              <div className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_10px_rgba(185,28,28,0.5)]" style={{ width: `${health}%` }}></div>
            </div>
            <p className="text-right text-[10px] mt-2 text-red-500 font-bold tracking-wider [text-shadow:_0_0_8px_rgb(239_68_68_/_60%)]">{health}%</p>
          </div>
          
          {/* Combat Split: Ammunition | Melee */}
          <div className="flex w-full mt-2">
            
            {/* Left Side: Ammo Box */}
            <div className="w-1/2 pr-4 border-r border-slate-900 flex flex-col justify-between">
              <div className="flex justify-between items-end mb-3">
                <p className="text-xs text-slate-400 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">AMMUNITION</p>
                <p className="text-[13px] text-yellow-500 font-bold tracking-wider [text-shadow:_0_0_8px_rgba(234,179,8,0.5)]">
                  {ammo} BULLET{ammo !== 1 ? 'S' : ''}
                </p>
              </div>
              
              <div className="flex gap-2 items-center flex-wrap min-h-[20px]">
                {ammo > 0 ? (
                  Array.from({ length: ammo }).map((_, i) => (
                    <div key={`bullet-${i}`} className="h-5 w-2.5 bg-yellow-300/80 rounded-sm shadow-[0_0_8px_rgba(202,138,4,0.4)] border border-yellow-900/50"></div>
                  ))
                ) : (
                  <span className="text-red-600 text-[10px] font-bold tracking-widest animate-pulse [text-shadow:_0_0_8px_rgba(220,38,38,0.6)]">
                    [EMPTY]
                  </span>
                )}
              </div>
            </div>

            {/* Right Side: Melee */}
            <div className="w-1/2 pl-4 flex flex-col justify-between">
               <p className="text-xs text-slate-400 font-bold tracking-widest mb-3 [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">COMBAT KNIFE</p>
               
               {/* Fixed Melee Box With Scaled, Inverted JPEG */}
               <div className="h-full w-full min-h-[44px] flex items-center justify-center border border-slate-800 bg-black rounded-sm relative group overflow-hidden shadow-inner shadow-black transition-all hover:border-slate-600">
                  <Image 
                    src="/knife.jpeg" 
                    alt="Combat Knife"
                    fill
                    className="object-contain scale-[1.2] invert grayscale opacity-60 group-hover:opacity-100 group-hover:scale-[1.3] transition-all duration-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" 
                  />
               </div>
            </div>
            
          </div>
        </div>

        {/* LIST-STYLE LORE INVENTORY */}
        <div className="flex-1 border border-slate-900 bg-[#050505] rounded-lg p-5 flex flex-col relative overflow-hidden">
            
            <div className="flex justify-between items-end mb-4 border-b border-slate-900 pb-3">
              <p className="text-xs text-slate-400 font-bold tracking-widest [text-shadow:_0_0_5px_rgb(148_163_184_/_50%)]">INVENTORY</p>
              
              {/* NOTIFICATION POPUP */}
              {invNotice && (
                <span className="text-[10px] text-green-500 font-bold tracking-widest animate-pulse [text-shadow:_0_0_8px_rgba(34,197,94,0.6)]">
                  {invNotice}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800">
                {intelFiles.map((intel) => (
                    <button 
                        key={intel.id}
                        onClick={() => setActiveModal(intel.id)}
                        className="w-full text-left p-3 border border-slate-900/50 bg-black hover:border-cyan-900 hover:bg-cyan-950/10 transition-colors flex items-center justify-between group rounded-sm shadow-md"
                    >
                         <span className="text-slate-400 text-sm font-mono group-hover:text-cyan-400 transition-colors">&gt; {intel.title}</span>
                         <span className="text-[9px] text-slate-600 font-bold tracking-widest group-hover:text-cyan-600 transition-colors">[ VIEW ]</span>
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}