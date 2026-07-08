'use client';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-mono flex flex-col items-center justify-center p-8 selection:bg-cyan-900 selection:text-cyan-100 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-250 bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Terminal Container */}
      <div className="max-w-7xl w-full min-h-150 bg-[#030303] border border-slate-800 rounded-lg shadow-2xl shadow-black/80 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Lore & Atmosphere */}
        <div className="w-full md:w-1/2 relative border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-12 bg-black">
          
          {/* Background Image - The Casefile */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/casefile.jpeg" 
              alt="Classified Documents" 
              fill
              className="object-cover opacity-20 grayscale contrast-150 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent"></div>
          </div>

          {/* Top text */}
          <div className="relative z-10 mt-8">
            <p className="text-red-600 font-bold tracking-[0.3em] text-sm mb-3 [text-shadow:0_0_10px_rgb(239_68_68/60%)]">
              [ TOP SECRET // NOFORN ]
            </p>
            <h1 className="text-4xl font-bold text-slate-200 tracking-wider mb-4">
              OPERATION: <span className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">CASE ZERO</span>
            </h1>
            <div className="h-0.5 w-1/3 bg-slate-800 mb-6"></div>
          </div>

          {/* Bottom text */}
          <div className="relative z-10 mb-8 space-y-4">
            <div className="border-l-2 border-red-900/50 pl-6 py-2">
              <p className="text-slate-400 text-base leading-relaxed mb-3">
                <strong className="text-slate-300">LOCATION:</strong> Blackwood Village
              </p>
              <p className="text-slate-400 text-base leading-relaxed mb-3">
                <strong className="text-slate-300">STATUS:</strong> Total Communication Blackout
              </p>
              <p className="text-slate-400 text-base leading-relaxed">
                <strong className="text-slate-300">DIRECTIVE:</strong> Infiltrate. Assess. Neutralize.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center bg-[#050505] relative">
          
          <div className="w-full max-w-md flex flex-col items-center">
            {/* lock icon */}
            <div className="w-20 h-20 border border-cyan-900/50 rounded-full flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(8,145,178,0.2)] bg-black">
              <span className="text-cyan-500 font-bold text-3xl">?</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-200 tracking-widest mb-4 text-center">
              IDENTITY VERIFICATION
            </h2>
            <p className="text-slate-500 text-sm text-center mb-10 leading-relaxed [text-shadow:0_0_8px_rgb(100_116_139/30%)]">
              Authorized agency personnel only. Secure connection required to establish radio link with Command.
            </p>

            {/* NextAuth Login Button */}
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full py-5 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-500 font-bold tracking-widest border border-cyan-900/50 rounded transition-all shadow-[0_0_15px_rgba(8,145,178,0.1)] hover:shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:border-cyan-700 flex items-center justify-center gap-4 group text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse group-hover:bg-cyan-400"></div>
              ESTABLISH SECURE LINK
            </button>

            <p className="mt-10 text-xs text-slate-700 text-center uppercase tracking-widest">
              By authenticating, you accept full liability for mission outcomes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}