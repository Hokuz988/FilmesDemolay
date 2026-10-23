export function Coroa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 14l12 10 16-20 16 20 12-10-6 26H10z" />
      <rect x="10" y="42" width="44" height="5" rx="1.5" />
      <circle cx="4" cy="12" r="3.5" />
      <circle cx="32" cy="4" r="3.5" />
      <circle cx="60" cy="12" r="3.5" />
    </svg>
  );
}

export function Marca({ tamanho = 'normal' }: { tamanho?: 'normal' | 'grande' }) {
  const grande = tamanho === 'grande';
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`grid place-items-center rounded-xl bg-vermelho shadow-lg shadow-vermelho/30 ring-1 ring-ouro/40 ${
          grande ? 'size-14' : 'size-10'
        }`}
      >
        <Coroa className={`text-ouro ${grande ? 'w-9' : 'w-6'}`} />
      </span>
      <span className="leading-tight">
        <span className={`block font-titulo font-bold tracking-wider text-texto ${grande ? 'text-2xl' : 'text-base'}`}>
          Filminhos
        </span>
        <span className={`block font-titulo tracking-[0.2em] text-ouro uppercase ${grande ? 'text-sm' : 'text-[0.65rem]'}`}>
          DeMoleycos
        </span>
      </span>
    </span>
  );
}
