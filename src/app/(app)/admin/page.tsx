import Link from 'next/link';
import { criarNoite } from '@/app/acoes/admin';
import { CamposNoite } from '@/components/CamposNoite';
import { SeloStatus } from '@/components/Comuns';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { exigirAdmin } from '@/lib/auth';
import { formatarDataCurta } from '@/lib/datas';
import { db } from '@/lib/db';
import type { Noite } from '@/lib/tipos';

export const metadata = { title: 'Painel admin' };

export default async function PaginaAdmin() {
  await exigirAdmin();
  const sql = await db();
  const noites = (await sql`
    SELECT n.*,
      (SELECT COUNT(*)::int FROM filmes f WHERE f.noite_id = n.id) AS total_filmes,
      (SELECT COUNT(*)::int FROM votos v WHERE v.noite_id = n.id) AS total_votos
    FROM noites n
    ORDER BY n.criado_em DESC
  `) as (Noite & { total_filmes: number; total_votos: number })[];
  const [{ membros }] = (await sql`SELECT COUNT(*)::int AS membros FROM usuarios WHERE ativo`) as { membros: number }[];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="titulo-secao">Noites de filme</h2>
          <span className="text-xs text-suave">{membros} membros ativos</span>
        </div>
        {noites.length === 0 ? (
          <p className="cartao p-6 text-center text-suave">Nenhuma noite criada ainda. Comece pelo formulário ao lado.</p>
        ) : (
          <ul className="space-y-3">
            {noites.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/admin/noites/${n.id}`}
                  className="cartao flex flex-col gap-2 p-4 transition hover:border-ouro/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-titulo text-lg font-bold">{n.titulo}</p>
                    <p className="text-xs text-suave">
                      {n.data_evento ? `Sessão: ${formatarDataCurta(n.data_evento)}` : 'Sem data definida'}
                      {n.prazo_votacao && ` · Prazo: ${formatarDataCurta(n.prazo_votacao)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-suave">
                    <span>{n.total_filmes} filmes</span>
                    <span>
                      {n.total_votos}/{membros} votos
                    </span>
                    <SeloStatus status={n.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cartao order-first h-fit p-5 sm:p-6 lg:order-none">
        <h2 className="titulo-secao">Nova noite de filme</h2>
        <p className="mt-1 text-sm text-suave">Ela começa como rascunho: adicione os filmes e depois abra a votação.</p>
        <FormAcao acao={criarNoite} className="mt-4 space-y-4">
          <CamposNoite />
          <BotaoEnviar className="btn btn-ouro w-full">Criar noite</BotaoEnviar>
        </FormAcao>
      </section>
    </div>
  );
}
