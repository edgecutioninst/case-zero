/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

import Terminal from '@/components/Terminal';
import TacticalHUD from '@/components/TacticalHUD';
import GameModals from '@/components/GameModals';

const intelDetails: Record<string, { title: string, src: string, desc: string }> = {
  casefile: { title: 'Case File', src: '/casefile.jpeg', desc: 'Initial assessment of the incident. Contains erratic blueprints and paranoid ramblings about a "gate" beneath the village.' },
  chief: { title: 'Target: Chief', src: '/chief.jpeg', desc: 'Picture of the village chief. Age: 29 (Severe anomalous aging reported). Nature: Calm, highly intelligent, deeply manipulative.' },
  entity: { title: 'Entity Sighting', src: '/monster.jpeg', desc: 'Subject designation: "The Frost Walker". Caught on a corrupted trail cam at 0300 hours.' },
  manor_key: { title: 'Manor Key', src: '/manor-key.jpeg', desc: 'A heavy, wrought-iron key. The metal is unnaturally cold to the touch.' },
  church_key: { title: 'Church Key', src: '/church-key.jpeg', desc: 'An ancient, rusted key. The blood rusted onto the handle is fresh.' }
};

const locationCoords: Record<string, { top: string, left: string }> = {
  village_entrance: { top: '85%', left: '50%' },
  village_square: { top: '68%', left: '50%' },
  old_church: { top: '65%', left: '40%' },
  chiefs_manor: { top: '50%', left: '61%' },
  smithy: { top: '80%', left: '76%' },
  cultist_camp: { top: '40%', left: '45%' },
  survivor_hideout: { top: '73%', left: '58%' },
  inrfs_camp: { top: '87%', left: '15%' },
};

const INTRO_MESSAGE = { 
  role: 'system', 
  text: "[RADIO LINK ESTABLISHED]\n\nOp-Center: 'Rookie, listen closely. Blackwood village is completely dark. The Chief is missing, and our last squad vanished near the INRFS camp. Their final transmission mentioned... something in the ice.'\n\n'You have your sidearm, a combat knife, and six rounds. Do not waste them.'\n\n'Breach the main gates, push into the village square, and find out what happened to our men. Survive.'\n\n[TRANSMISSION END]\n\nThe freezing wind howls, biting through your tactical gear. The rusted iron gates of Blackwood loom directly in front of you.", 
  isTyping: false 
};

export default function GameDashboard() {
  const [health, setHealth] = useState(100);
  const [ammo, setAmmo] = useState(6);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasManorKey, setHasManorKey] = useState(false);
  const [hasChurchKey, setHasChurchKey] = useState(false);
  const [invNotice, setInvNotice] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string>('village_entrance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isGameWon, setIsGameWon] = useState(false);

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const noticeTimerRef = useRef<any>(null);

  const [terminalLog, setTerminalLog] = useState([INTRO_MESSAGE]);

  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!userEmail) {
      setIsInitialLoading(false);
      return;
    }

    const loadSaveFile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/state/${userEmail}`);
        const data = await res.json();
        
        if (data.status === "success") {
          if (data.chat_history && data.chat_history.length > 0) {
            const formattedHistory = data.chat_history.map((log: any) => ({
              role: log.role,
              text: log.role === 'user' ? `> ${log.text}` : log.text,
              isTyping: false
            }));
            setTerminalLog(formattedHistory);
          }
          
          setHealth(data.health);
          setAmmo(data.ammo);
          if (data.current_room) setCurrentRoom(data.current_room);
          setHasManorKey(data.has_manor_key);
          setHasChurchKey(data.has_church_key);
          setIsGameOver(data.is_game_over);
          // Catch the win state on load!
          setIsGameWon(data.is_game_won || data.is_won || false); 
        }
      } catch (error) {
        console.error("Failed to load save file:", error);
      } finally {
        setIsInitialLoading(false); 
      }
    };

    loadSaveFile();
  }, [session, status, userEmail]);

  useEffect(() => {
    if (scrollEndRef.current) scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [terminalLog]);

  const showNotification = (itemName: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setInvNotice(`[ ${itemName} ADDED IN INVENTORY ]`);
    noticeTimerRef.current = setTimeout(() => {
      setInvNotice(null);
      noticeTimerRef.current = null;
    }, 4000);
  };

  const handleRestart = async () => {
    if (!userEmail) return;
    setIsProcessing(true);
    
    try {
      // Tell backend to wipe the save
      await fetch(`http://localhost:8000/api/reset/${userEmail}`, { method: 'DELETE' });
      
      // Reset all local frontend state
      setTerminalLog([INTRO_MESSAGE]);
      setHealth(100);
      setAmmo(8);
      setCurrentRoom('village_entrance');
      setHasManorKey(false);
      setHasChurchKey(false);
      setIsGameOver(false);
      setIsGameWon(false); // Make sure to reset the win screen too!
      setShowRetryConfirm(false);
    } catch (e) {
      console.error("Failed to restart:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayerAction = async (actionText: string) => {
    if (!actionText.trim() || isProcessing || isGameOver || isGameWon || !userEmail) return;

    setTerminalLog(prev => prev.map(log => ({ ...log, isTyping: false })));
    setTerminalLog(prev => [...prev, { role: 'user', text: `> ${actionText}`, isTyping: false }]);
    setInputText('');
    setShowInput(false);
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:8000/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action: actionText })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTerminalLog(prev => [...prev, { role: 'ai', text: data.response_text, isTyping: true }]);
        setHealth(data.updated_health);
        setAmmo(data.updated_ammo);
        if (data.current_room) setCurrentRoom(data.current_room);

        if (data.has_manor_key && !hasManorKey) { setHasManorKey(true); showNotification('MANOR KEY'); }
        if (data.has_church_key && !hasChurchKey) { setHasChurchKey(true); showNotification('CHURCH KEY'); }
        if (data.is_over === true || data.updated_health <= 0) setIsGameOver(true);
        
        if (data.is_game_won === true || data.is_won === true) setIsGameWon(true); 
      }
    } catch (e) {
      setTerminalLog(prev => [...prev, { role: 'system', text: "[ERROR] Signal lost.", isTyping: true }]);
      console.log(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCallHandler = () => {
    if (isProcessing || isGameOver || isGameWon || isCalling) return;
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      handlePlayerAction("[RADIO TRANSMISSION] Requesting tactical analysis. Over.");
    }, 1500);
  };

  const intelFiles = [
    { id: 'casefile', ...intelDetails['casefile'] },
    { id: 'chief', ...intelDetails['chief'] },
    { id: 'entity', ...intelDetails['entity'] }
  ];
  if (hasManorKey) intelFiles.push({ id: 'manor_key', ...intelDetails['manor_key'] });
  if (hasChurchKey) intelFiles.push({ id: 'church_key', ...intelDetails['church_key'] });

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-cyan-600">
         <div className="w-12 h-12 border-t-2 border-cyan-600 rounded-full animate-spin mb-6"></div>
         <p className="tracking-widest text-sm animate-pulse drop-shadow-[0_0_8px_rgba(8,145,178,0.8)]">
           [ ESTABLISHING SECURE CONNECTION TO OP-CENTER... ]
         </p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black text-slate-300 p-4 font-mono flex gap-4 relative selection:bg-cyan-900 selection:text-cyan-100">
      
      <GameModals 
        isGameOver={isGameOver}
        isGameWon={isGameWon} 
        showRetryConfirm={showRetryConfirm} setShowRetryConfirm={setShowRetryConfirm}
        showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
        activeModal={activeModal} setActiveModal={setActiveModal}
        intelDetails={intelDetails}
        showInventory={showInventory} setShowInventory={setShowInventory}
        intelFiles={intelFiles}
        onRestart={handleRestart} 
      />

      <div className="w-2/3 border border-slate-900 bg-[#050505] rounded-lg flex flex-col relative overflow-hidden shadow-lg shadow-black">
        <Terminal 
          terminalLog={terminalLog} 
          isProcessing={isProcessing} 
          isGameOver={isGameOver} 
          scrollRef={scrollEndRef} 
        />

        <div className="p-4 border-t border-slate-900 min-h-20 flex items-center justify-center bg-black">
          {showInput ? (
            <div className="flex items-center gap-3 w-full max-w-2xl px-2">
              <span className="text-cyan-400 font-bold [text-shadow:0_0_10px_rgb(34_211_238/60%)]">&gt;</span>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePlayerAction(inputText); }}
                disabled={isProcessing || isGameOver || isGameWon} // DISABLED ON WIN
                className="w-full bg-transparent outline-none text-slate-200 focus:ring-0 placeholder:text-slate-600 [text-shadow:0_0_8px_rgb(226_232_240/40%)] text-lg"
                placeholder="Type your action and press Enter..." autoFocus
              />
              <button onClick={() => setShowInput(false)} className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">
                [CANCEL]
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 w-full items-center">
              <div className="flex justify-start gap-3">
                <button onClick={() => setShowLogoutConfirm(true)} className="px-3 py-2 bg-black hover:bg-red-950/20 text-red-700 hover:text-red-500 rounded text-xs font-bold border border-red-900/30 transition-all shadow-md">
                  [ABORT]
                </button>
                <button onClick={() => setShowRetryConfirm(true)} disabled={isGameOver || isGameWon || isProcessing || isCalling} className="px-3 py-2 bg-black hover:bg-yellow-950/20 text-yellow-700 hover:text-yellow-500 rounded text-xs font-bold border border-yellow-900/30 transition-all shadow-md disabled:opacity-50">
                  [RESTART]
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={() => setShowInput(true)} disabled={isGameOver || isGameWon || isCalling} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded text-sm font-bold border border-slate-700 transition-all shadow-md disabled:opacity-50">
                  Take a Turn
                </button>
                <button onClick={() => handlePlayerAction("I hold my position, stay quiet, and cautiously observe my surroundings.")} disabled={isGameOver || isGameWon || isProcessing || isCalling} className="px-6 py-2 bg-black hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded text-sm border border-slate-900 transition-colors disabled:opacity-50">
                  Continue
                </button>
              </div>
              
              <div className="flex justify-end">
                <button onClick={handleCallHandler} disabled={isGameOver || isGameWon || isProcessing || isCalling} className={`px-5 py-2 bg-black hover:bg-green-950/20 ${isCalling ? 'text-green-400 border-green-400 animate-pulse' : 'text-green-600 border-green-900/30'} rounded text-xs font-bold border transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}>
                  <span className={`w-2 h-2 rounded-full ${isCalling ? 'bg-green-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                  {isCalling ? '[ ENCRYPTING... ]' : 'Call Handler'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TacticalHUD 
        health={health} ammo={ammo} 
        setShowInventory={setShowInventory} 
        invNotice={invNotice} currentRoom={currentRoom} locationCoords={locationCoords} 
      />
    </div>
  );
}