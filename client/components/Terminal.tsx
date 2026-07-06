/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

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

export default function Terminal({ terminalLog, isProcessing, isGameOver, scrollRef }: any) {
  return (
    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent]">
      {terminalLog.map((log: any, index: number) => (
        <div 
          key={index} 
          className={
            log.role === 'user' ? 'text-cyan-400 text-lg ml-4' : 
            log.role === 'system' ? 'border-l-2 border-green-700/50 pl-4 py-1 text-green-500/90 text-[15px] leading-relaxed whitespace-pre-wrap' : 
            'text-slate-300 text-lg leading-relaxed whitespace-pre-wrap'
          }
        >
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
        <p className="text-slate-400 text-lg [text-shadow:0_0_10px_rgb(148_163_184/40%)] animate-pulse">
          &gt; Awaiting input...
        </p>
      )}
      <div ref={scrollRef} />
    </div>
  );
}