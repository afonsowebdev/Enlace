"use client";

import { useEffect, useRef, useState } from "react";
import { buttonLink, buttonPrimary } from "./ui";

type Memory = { id: string; url: string; kind: "photo" | "video"; name: string };

const MAX_BYTES = 50 * 1024 * 1024; // limite por ficheiro (Supabase, plano gratuito)

export function Memories({ guestName }: { guestName: string | null }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  if (guestName === null) {
    return (
      <p className="rounded-md bg-esmalte px-4 py-3 text-sm">
        Para enviar e ver as memórias do casamento, <a href="#resposta" className={buttonLink}>responde primeiro ao convite</a>.
      </p>
    );
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const tooBig: string[] = [];
    const added: Memory[] = [];
    for (const file of Array.from(files)) {
      if (!/^(image|video)\//.test(file.type)) continue;
      if (file.size > MAX_BYTES) {
        tooBig.push(file.name);
        continue;
      }
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      added.push({ id: crypto.randomUUID(), url, kind: file.type.startsWith("video") ? "video" : "photo", name: file.name });
    }
    setRejected(tooBig);
    setMemories((prev) => [...added, ...prev]);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        id="memorias-ficheiros"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button type="button" className={buttonPrimary} onClick={() => inputRef.current?.click()}>
        Enviar fotos e vídeos
      </button>
      <p className="mt-3 text-sm text-pedra">Até 50 MB por ficheiro. Só os noivos podem descarregar as memórias.</p>

      {rejected.length > 0 && (
        <p role="alert" className="mt-4 text-sm">
          {rejected.length === 1 ? `"${rejected[0]}" tem mais de 50 MB` : `${rejected.length} ficheiros têm mais de 50 MB`} e não
          foi enviado. Experimenta enviar uma versão mais curta do vídeo.
        </p>
      )}

      {memories.length === 0 ? (
        <p className="mt-10 max-w-[48ch] text-pedra">
          Ainda não há memórias. As fotos e vídeos que os convidados enviarem aparecem aqui, para todos verem.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-3 gap-1.5 sm:gap-2" aria-label="Galeria de memórias">
          {memories.map((m) => (
            <li key={m.id} className="relative aspect-square overflow-hidden rounded-sm bg-esmalte">
              {m.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="size-full object-cover" onContextMenu={(e) => e.preventDefault()} />
              ) : (
                <video
                  src={m.url}
                  className="size-full object-cover"
                  muted
                  playsInline
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
              <span className="sr-only">{m.kind === "photo" ? "Foto" : "Vídeo"} enviado por ti</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
