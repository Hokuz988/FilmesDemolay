import { ROTULO_STATUS } from '@/lib/datas';
import type { StatusNoite } from '@/lib/tipos';
import { Coroa } from './Coroa';

const CORES_STATUS: Record<StatusNoite, string> = {
  rascunho: 'bg-white/5 text-suave ring-white/15',
  aberta: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  encerrada: 'bg-ouro/10 text-ouro ring-ouro/40',
};

export function SeloStatus({ status, rotulo }: { status: StatusNoite; rotulo?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${CORES_STATUS[status]}`}>
      {status === 'aberta' && <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />}
      {rotulo ?? ROTULO_STATUS[status]}
    </span>
  );
}

export function Capa({ url, titulo, className = '' }: { url: string | null; titulo: string; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-vermelho-escuro to-painel-2 ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Capa de ${titulo}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <Coroa className="w-10 text-ouro/60" />
          <span className="line-clamp-3 font-titulo text-xs text-texto/80">{titulo}</span>
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
      {dica && <span className="mt-1 block text-xs text-suave/70">{dica}</span>}
    </label>
  );
}
