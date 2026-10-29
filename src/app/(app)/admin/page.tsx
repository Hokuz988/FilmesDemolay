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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="titulo-secao flex-1">Sessões</h2>
          <span className="shrink-0 text-sm text-nevoa">{membros} membros ativos</span>
        </div>
        {noites.length === 0 ? (
          <p className="cartao p-6 text-center text-nevoa">Nenhuma noite criada ainda. Comece pelo formulário ao lado.</p>
        ) : (
          <ul className="space-y-3">
            {noites.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/admin/noites/${n.id}`}
                  className="cartao cartao-interativo flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="font-titulo text-sm font-bold text-ouro">Nº {String(n.id).padStart(3, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-titulo text-lg font-bold text-marfim">{n.titulo}</p>
                    <p className="text-sm text-nevoa">
                      {n.data_evento ? `Sessão ${formatarDataCurta(n.data_evento)}` : 'Sem data definida'}
                      {n.prazo_votacao && ` · prazo ${formatarDataCurta(n.prazo_votacao)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-nevoa">
                    <span>
                      {n.total_filmes} {n.total_filmes === 1 ? 'filme' : 'filmes'}
                    </span>
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
        <h2 className="titulo-secao">Nova noite de filmes</h2>
        <p className="mt-2 text-sm text-nevoa">Ela começa como rascunho: adicione os filmes e depois abra a votação.</p>
        <FormAcao acao={criarNoite} className="mt-5 space-y-4">
          <CamposNoite />
          <BotaoEnviar className="btn btn-primario w-full">Criar noite</BotaoEnviar>
        </FormAcao>
      </section>
    </div>
  );
}
