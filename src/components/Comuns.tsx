import { ROTULO_STATUS } from '@/lib/datas';
import type { StatusNoite } from '@/lib/tipos';
import { Emblema } from './Emblema';

const CORES_STATUS: Record<StatusNoite, string> = {
  rascunho: 'border-suave/60 text-suave',
  aberta: 'border-verde text-verde',
  encerrada: 'border-vermelho text-vermelho',
};

export function SeloStatus({ status, rotulo }: { status: StatusNoite; rotulo?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-letreiro text-[0.7rem] font-medium tracking-[0.16em] uppercase ${CORES_STATUS[status]}`}
    >
      {status === 'aberta' && <span className="size-1.5 animate-pulse rounded-full bg-verde" />}
      {rotulo ?? ROTULO_STATUS[status]}
    </span>
  );
}

export function Capa({ url, titulo, className = '' }: { url: string | null; titulo: string; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-vermelho-escuro ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Capa de ${titulo}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 text-center">
          <Emblema className="w-12 text-dourado/70" />
          <span className="line-clamp-3 font-letreiro text-xs tracking-[0.12em] text-papel/80 uppercase">{titulo}</span>
        </div>
      )}
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
      {dica && <span className="mt-1 block text-xs text-suave">{dica}</span>}
    </label>
  );
}
