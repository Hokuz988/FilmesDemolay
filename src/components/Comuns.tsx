import { ROTULO_STATUS } from '@/lib/datas';
import type { StatusNoite } from '@/lib/tipos';
import { Cruz, Estrela } from './Emblema';

const CORES_STATUS: Record<StatusNoite, string> = {
  rascunho: 'border-nevoa/40 text-nevoa',
  aberta: 'border-ouro/70 text-ouro',
  encerrada: 'border-rubi-vivo/70 text-alerta',
};

export function SeloStatus({ status, rotulo }: { status: StatusNoite; rotulo?: string }) {
  return (
    <span className={`selo ${CORES_STATUS[status]}`}>
      {status === 'aberta' && <span className="size-1.5 animate-pulse rounded-full bg-ouro" />}
      {rotulo ?? ROTULO_STATUS[status]}
    </span>
  );
}

/** Capa em moldura dourada; sem imagem, mostra o céu do medalhão com a cruz da Ordem. */
export function Capa({ url, titulo, className = '' }: { url: string | null; titulo: string; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-abismo ring-1 ring-ouro/40 ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Capa de ${titulo}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="ceu absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 text-center">
          <Cruz className="w-12 sm:w-16" />
          <span className="line-clamp-3 font-titulo text-[0.7rem] font-semibold tracking-[0.12em] text-marfim/85 uppercase">
            {titulo}
          </span>
        </div>
      )}
    </div>
  );
}

/** Escudo heráldico com o número do filme em algarismos romanos. */
export function Escudo({ numero, className = '' }: { numero: string; className?: string }) {
  return (
    <span className={`relative inline-grid h-11 w-9 shrink-0 place-items-center pb-1.5 ${className}`}>
      <svg viewBox="0 0 36 44" className="absolute inset-0 size-full drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]" aria-hidden="true">
        <path d="M2 2H34V22C34 32 27 38.5 18 42C9 38.5 2 32 2 22Z" fill="var(--color-rubi)" stroke="var(--color-ouro)" strokeWidth="2" />
      </svg>
      <span className={`relative font-titulo font-bold text-marfim ${numero.length > 3 ? 'text-[0.55rem]' : 'text-[0.72rem]'}`}>
        {numero}
      </span>
    </span>
  );
}

/** Filete dourado com uma estrela ao centro. */
export function Divisor({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-ouro ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-ouro/60" />
      <Estrela className="size-3" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-ouro/60" />
    </div>
  );
}

export function Campo({
  rotulo,
  dica,
  children,
}: {
  rotulo: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="rotulo">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-sm text-nevoa">{dica}</span>}
    </label>
  );
}
