import { ROTULO_STATUS } from '@/lib/datas';
import type { StatusNoite } from '@/lib/tipos';
import { EscudoEstrela } from './Emblema';

const CORES_STATUS: Record<StatusNoite, string> = {
  rascunho: 'border border-linha text-cinza',
  aberta: 'bg-ouro text-marinho',
  encerrada: 'bg-marinho text-white',
};

export function SeloStatus({ status, rotulo }: { status: StatusNoite; rotulo?: string }) {
  return <span className={`etiqueta ${CORES_STATUS[status]}`}>{rotulo ?? ROTULO_STATUS[status]}</span>;
}

/** Capa do filme; sem imagem, mostra o escudo da Ordem sobre o azul-marinho. */
export function Capa({ url, titulo, className = '' }: { url: string | null; titulo: string; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-marinho ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Capa de ${titulo}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 text-center">
          <EscudoEstrela className="w-8 sm:w-11" />
          <span className="line-clamp-3 text-xs font-bold text-white/85 sm:text-sm">{titulo}</span>
        </div>
      )}
    </div>
  );
}

/** Número do filme num escudo vermelho, como o do logotipo da Ordem. */
export function Escudo({ numero }: { numero: number }) {
  return (
    <span className="relative grid h-9 w-8 place-items-center pb-1 text-sm font-black text-white">
      <svg viewBox="0 0 32 36" className="absolute inset-0 size-full drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)]" aria-hidden="true">
        <path d="M1 1H31V17C31 26 24 32 16 35C8 32 1 26 1 17Z" fill="var(--color-vermelho)" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <span className="relative">{numero}</span>
    </span>
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
      {dica && <span className="mt-1 block text-sm text-cinza">{dica}</span>}
    </label>
  );
}
