'use client';
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

const DEFAULT_VOLUME = 0.25;

export default function BgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = () => {
      if (hasStartedRef.current) return;
      audio.volume = volume;
      audio
        .play()
        .then(() => {
          hasStartedRef.current = true;
          setIsPlaying(true);
        })
        .catch(() => {
        });
    };

    tryPlay();

    const startOnInteraction = () => {
      if (hasStartedRef.current) return;
      tryPlay();
    };

    window.addEventListener('click', startOnInteraction);
    window.addEventListener('keydown', startOnInteraction);

    return () => {
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
      });
      hasStartedRef.current = true;
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src="/bgm.mp3" loop preload="auto" />

      <button
        onClick={toggleMusic}
        className="p-2 bg-black hover:bg-slate-900 border border-slate-800 rounded-full text-slate-500 hover:text-cyan-400 transition-all shadow-md flex-shrink-0"
        title={isPlaying ? "Pause ambience" : "Play ambience"}
      >
        {isPlaying ? <VolumeIcon size={16} /> : <VolumeX size={16} />}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolumeChange}
        className="w-16 accent-cyan-500 cursor-pointer"
      />
    </div>
  );
}