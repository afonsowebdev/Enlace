"use client";

import { useRef, useState } from "react";

/** Botão flutuante da música. Os browsers não deixam tocar sozinha: começa quando o convidado carrega. */
export function MusicToggle({ src }: { src: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!src) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pausar a música" : "Tocar a música"}
        className="fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full bg-cartao text-sobre-cartao shadow-[0_10px_25px_-8px_rgba(60,15,20,0.55)] transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className={`size-5 ${playing ? "animate-[spin_6s_linear_infinite]" : ""}`} aria-hidden="true">
          <path
            fill="currentColor"
            d="M17 3v10.6A3.5 3.5 0 1 0 19 16.5V7h2V3h-4ZM9 6v9.6A3.5 3.5 0 1 0 11 18.5V10l6-1.2V6.7L9 8.3V6Z"
          />
        </svg>
      </button>
    </>
  );
}
