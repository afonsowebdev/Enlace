/** Separador: linha, uma pequena flor de quatro pétalas e outra linha. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-16 bg-current opacity-60 sm:w-24" />
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1">
        <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9Z M12 21c-2-3-2-6 0-9 2 3 2 6 0 9Z M3 12c3-2 6-2 9 0-3 2-6 2-9 0Z M21 12c-3 2-6 2-9 0 3-2 6-2 9 0Z" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-current opacity-60 sm:w-24" />
    </div>
  );
}
