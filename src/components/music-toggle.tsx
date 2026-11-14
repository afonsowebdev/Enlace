"use client";

import { useEffect, useRef, useState } from "react";

const GESTURES = ["pointerdown", "touchend", "keydown", "click"] as const;

/**
 * Música do convite. Tenta tocar logo que o convite abre; se o browser não
 * deixar (sem interação não há som), começa ao primeiro toque, clique ou tecla
 * do convidado. O botão flutuante pausa e retoma.
 */
export function MusicToggle({ src }: { src: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pausedByGuest = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!src || !audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    const stopListening = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    function onGesture(e: Event) {
      // O botão da música decide sozinho (tocar ou pausar).
      if (buttonRef.current?.contains(e.target as Node)) return;
      stopListening();
      if (!pausedByGuest.current && audio!.paused) audio!.play().catch(() => {});
    }

    audio.volume = 0.6;
    audio.play().catch(() => {
      // Bloqueado pelo browser: espera pela primeira interação.
      GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
    });

    return () => {
      stopListening();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, [src]);

  if (!src) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      pausedByGuest.current = false;
      audio.play().catch(() => {});
    } else {
      pausedByGuest.current = true;
      audio.pause();
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" playsInline />
      <button
        type="button"
        ref={buttonRef}
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
