/** Emblema da Ordem DeMolay (versão estilizada): coroa, elmo e crescente. */
export function Emblema({
  className,
  detalhe = 'var(--color-vermelho-escuro)',
}: {
  className?: string;
  /** Cor dos detalhes vazados (viseira e joias), normalmente a cor do fundo. */
  detalhe?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" role="img" aria-label="Emblema da Ordem DeMolay">
      {/* Crescente */}
      <path d="M14 56 A36 36 0 0 0 86 56 A36 22 0 0 1 14 56 Z" />
      {/* Elmo */}
      <path d="M33 74 H67 L62.5 66 H37.5 Z" />
      <path d="M37 66 V45 Q37 28.5 50 27 Q63 28.5 63 45 V66 Z" />
      <g fill="none" stroke={detalhe} strokeWidth="2.4" strokeLinecap="round">
        <path d="M50 30 V64" />
        <path d="M41 46 H46.5 M53.5 46 H59 M41 51.5 H46.5 M53.5 51.5 H59 M41 57 H46.5 M53.5 57 H59" />
      </g>
      {/* Coroa */}
      <path d="M35.5 24.5 L34 12 L42.5 18.5 L50 7.5 L57.5 18.5 L66 12 L64.5 24.5 Z" />
      <rect x="34.5" y="23" width="31" height="4.5" rx="1" />
      <circle cx="34" cy="11" r="2.6" />
      <circle cx="50" cy="6.5" r="2.6" />
      <circle cx="66" cy="11" r="2.6" />
      <g fill={detalhe}>
        <circle cx="42" cy="25.25" r="1.3" />
        <circle cx="50" cy="25.25" r="1.3" />
        <circle cx="58" cy="25.25" r="1.3" />
      </g>
    </svg>
  );
}

export function Marca({ tom = 'escuro' }: { tom?: 'escuro' | 'claro' }) {
  const escuro = tom === 'escuro';
  return (
    <span className="inline-flex items-center gap-3">
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-dourado bg-vermelho shadow-[0_0_0_3px_var(--color-vermelho-escuro)]">
        <Emblema className="w-9 text-dourado" detalhe="var(--color-vermelho)" />
      </span>
      <span className="leading-none">
        <span className={`block font-titulo text-xl font-bold italic ${escuro ? 'text-papel' : 'text-tinta'}`}>Filminhos</span>
        <span className={`mt-1 block font-letreiro text-[0.65rem] tracking-[0.38em] uppercase ${escuro ? 'text-dourado' : 'text-vermelho'}`}>
          DeMoleycos
        </span>
      </span>
    </span>
  );
}
