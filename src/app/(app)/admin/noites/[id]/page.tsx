import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  alterarStatusNoite,
  atualizarNoite,
  excluirFilme,
  excluirNoite,
  salvarFilme,
  zerarVotos,
} from '@/app/acoes/admin';
import { CamposFilme } from '@/components/CamposFilme';
import { CamposNoite } from '@/components/CamposNoite';
import { Capa, SeloStatus } from '@/components/Comuns';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { exigirAdmin } from '@/lib/auth';
import { formatarData, formatarDuracao, votacaoAberta } from '@/lib/datas';
import { db } from '@/lib/db';
import type { FilmeComVotos, Noite, StatusNoite } from '@/lib/tipos';

export const metadata = { title: 'Gerenciar noite' };

function BotaoStatus({ id, status, children, className }: { id: number; status: StatusNoite; children: React.ReactNode; className: string }) {
  return (
    <form action={alterarStatusNoite}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <BotaoEnviar className={className}>{children}</BotaoEnviar>
    </form>
  );
}

export default async function PaginaNoite({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const sql = await db();
  const [noite] = (await sql`SELECT * FROM noites WHERE id = ${id}`) as Noite[];
  if (!noite) notFound();

  const filmes = (await sql`
    SELECT f.*, COUNT(v.usuario_id)::int AS votos
    FROM filmes f LEFT JOIN votos v ON v.filme_id = f.id
    WHERE f.noite_id = ${id}
    GROUP BY f.id ORDER BY f.criado_em
  `) as FilmeComVotos[];
  const eleitores = (await sql`
    SELECT v.filme_id, u.nome FROM votos v JOIN usuarios u ON u.id = v.usuario_id
    WHERE v.noite_id = ${id} ORDER BY u.nome
  `) as { filme_id: number; nome: string }[];
  const pendentes = (await sql`
    SELECT nome FROM usuarios
    WHERE ativo AND id NOT IN (SELECT usuario_id FROM votos WHERE noite_id = ${id})
    ORDER BY nome
  `) as { nome: string }[];

  const totalVotos = eleitores.length;
  const maisVotos = Math.max(0, ...filmes.map((f) => f.votos));
  const prazoVencido = noite.status === 'aberta' && !votacaoAberta(noite);

  return (
    <div className="space-y-6">
      {/* Cabeçalho e controle da votação */}
      <section className="cartao p-5 sm:p-6">
        <Link href="/admin" className="text-sm text-suave hover:text-ouro">
          ← Todas as noites
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-titulo text-2xl font-bold">{noite.titulo}</h2>
              <SeloStatus status={noite.status} />
            </div>
            <p className="mt-1 text-sm text-suave">
              {noite.data_evento ? formatarData(noite.data_evento) : 'Sem data definida'}
              {noite.prazo_votacao && ` · votação até ${formatarData(noite.prazo_votacao)}`}
            </p>
            {prazoVencido && (
              <p className="mt-2 text-sm text-ouro">O prazo já passou: a votação está fechada para os membros.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {noite.status !== 'aberta' && (
              <BotaoStatus id={id} status="aberta" className="btn btn-ouro">
                {noite.status === 'encerrada' ? 'Reabrir votação' : 'Abrir votação'}
              </BotaoStatus>
            )}
            {noite.status === 'aberta' && (
              <BotaoStatus id={id} status="encerrada" className="btn btn-primario">
                Encerrar votação
              </BotaoStatus>
            )}
            {noite.status !== 'rascunho' && (
              <BotaoStatus id={id} status="rascunho" className="btn btn-fantasma">
                Voltar a rascunho
              </BotaoStatus>
            )}
            <form action={excluirNoite}>
              <input type="hidden" name="id" value={id} />
              <BotaoEnviar className="btn btn-perigo" confirmar="Excluir esta noite, todos os filmes e votos? Isso não pode ser desfeito.">
                Excluir
              </BotaoEnviar>
            </form>
          </div>
        </div>
        {noite.status === 'rascunho' && (
          <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-suave">
            Rascunhos não aparecem para os membros. Ao abrir a votação, qualquer outra votação aberta é encerrada.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Filmes */}
        <section className="space-y-4">
          <h3 className="titulo-secao">Filmes ({filmes.length})</h3>

          <details className="cartao group p-5 sm:p-6" open={filmes.length === 0}>
            <summary className="cursor-pointer list-none font-semibold text-ouro-claro">
              <span className="group-open:hidden">＋ Adicionar filme</span>
              <span className="hidden group-open:inline">Adicionar filme</span>
            </summary>
            <FormAcao acao={salvarFilme} className="mt-4 space-y-4">
              <CamposFilme noiteId={id} />
              <BotaoEnviar className="btn btn-ouro w-full sm:w-auto">Adicionar filme</BotaoEnviar>
            </FormAcao>
          </details>

          <ul className="space-y-3">
            {filmes.map((filme) => (
              <li key={filme.id} className="cartao overflow-hidden">
                <div className="flex gap-4 p-4">
                  <Capa url={filme.capa_url} titulo={filme.titulo} className="w-20 shrink-0 rounded-lg sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <p className="font-titulo text-lg font-bold">{filme.titulo}</p>
                    <p className="text-xs text-ouro">
                      {formatarDuracao(filme.duracao_min) || 'Duração não informada'} · {filme.votos}{' '}
                      {filme.votos === 1 ? 'voto' : 'votos'}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-suave">{filme.descricao || 'Sem sinopse.'}</p>
                  </div>
                </div>
                <details className="border-t border-borda">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-suave hover:text-ouro">Editar filme</summary>
                  <div className="space-y-4 px-4 pb-4">
                    <FormAcao acao={salvarFilme} className="space-y-4">
                      <CamposFilme noiteId={id} filme={filme} />
                      <BotaoEnviar>Salvar alterações</BotaoEnviar>
                    </FormAcao>
                    <form action={excluirFilme}>
                      <input type="hidden" name="filme_id" value={filme.id} />
                      <BotaoEnviar className="btn btn-perigo btn-pequeno" confirmar={`Excluir "${filme.titulo}" e seus votos?`}>
                        Excluir filme
                      </BotaoEnviar>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          {/* Resultados ao vivo (apenas admin) */}
          <section className="cartao p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="titulo-secao">Resultado</h3>
              <span className="text-xs text-suave">{totalVotos} votos</span>
            </div>
            {filmes.length === 0 ? (
              <p className="mt-3 text-sm text-suave">Adicione filmes para ver o resultado.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {[...filmes]
                  .sort((a, b) => b.votos - a.votos)
                  .map((filme) => {
                    const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
                    const lider = maisVotos > 0 && filme.votos === maisVotos;
                    const nomes = eleitores.filter((e) => e.filme_id === filme.id).map((e) => e.nome);
                    return (
                      <li key={filme.id}>
                        <div className="flex justify-between gap-2 text-sm">
                          <span className={`truncate font-medium ${lider ? 'text-ouro-claro' : ''}`}>{filme.titulo}</span>
                          <span className="shrink-0 text-suave">
                            {filme.votos} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${lider ? 'bg-ouro' : 'bg-vermelho'}`} style={{ width: `${pct}%` }} />
                        </div>
                        {nomes.length > 0 && <p className="mt-1 text-xs text-suave/80">{nomes.join(', ')}</p>}
                      </li>
                    );
                  })}
              </ul>
            )}
            {pendentes.length > 0 && (
              <div className="mt-5 border-t border-borda pt-4">
                <p className="text-xs font-semibold text-suave">Ainda não votaram ({pendentes.length})</p>
                <p className="mt-1 text-xs text-suave/80">{pendentes.map((p) => p.nome).join(', ')}</p>
              </div>
            )}
            {totalVotos > 0 && (
              <form action={zerarVotos} className="mt-5">
                <input type="hidden" name="id" value={id} />
                <BotaoEnviar className="btn btn-perigo btn-pequeno" confirmar="Apagar todos os votos desta noite?">
                  Zerar votos
                </BotaoEnviar>
              </form>
            )}
          </section>

          {/* Dados da noite */}
          <section className="cartao p-5 sm:p-6">
            <h3 className="titulo-secao">Dados da noite</h3>
            <FormAcao acao={atualizarNoite} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={id} />
              <CamposNoite noite={noite} />
              <BotaoEnviar>Salvar dados</BotaoEnviar>
            </FormAcao>
          </section>
        </div>
      </div>
    </div>
  );
}
