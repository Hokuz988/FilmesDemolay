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
    <div className="space-y-8">
      {/* Cabeçalho e controle da votação */}
      <section className="cartao p-5 sm:p-6">
        <Link href="/admin" className="text-sm font-semibold text-cinza hover:text-marinho">
          ← Todas as noites
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight font-stretch-expanded sm:text-3xl">{noite.titulo}</h2>
              <SeloStatus status={noite.status} />
            </div>
            <p className="mt-1 text-cinza">
              Nº {id} · {noite.data_evento ? formatarData(noite.data_evento) : 'sem data definida'}
              {noite.prazo_votacao && ` · votação até ${formatarData(noite.prazo_votacao)}`}
            </p>
            {prazoVencido && (
              <p className="mt-3 rounded-[3px] border-l-4 border-ouro bg-ouro/25 px-3 py-2 text-sm">
                O prazo já passou: a votação está fechada para os membros.
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {noite.status !== 'aberta' && (
              <BotaoStatus id={id} status="aberta" className="btn btn-primario">
                {noite.status === 'encerrada' ? 'Reabrir votação' : 'Abrir votação'}
              </BotaoStatus>
            )}
            {noite.status === 'aberta' && (
              <BotaoStatus id={id} status="encerrada" className="btn btn-marinho">
                Encerrar votação
              </BotaoStatus>
            )}
            {noite.status !== 'rascunho' && (
              <BotaoStatus id={id} status="rascunho" className="btn btn-contorno">
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
          <p className="mt-4 border-t border-linha pt-3 text-sm text-cinza">
            Rascunhos não aparecem para os membros. Ao abrir a votação, qualquer outra votação aberta é encerrada.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Filmes */}
        <section className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h3 className="titulo-secao">Filmes indicados</h3>
            <span className="text-sm text-cinza">
              {filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}
            </span>
          </div>

          <details className="cartao group mb-4 p-5 sm:p-6" open={filmes.length === 0}>
            <summary className="cursor-pointer list-none font-bold text-vermelho [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">+ Adicionar filme</span>
              <span className="hidden group-open:inline">Adicionar filme</span>
            </summary>
            <FormAcao acao={salvarFilme} className="mt-5 space-y-4">
              <CamposFilme noiteId={id} />
              <BotaoEnviar className="btn btn-primario w-full sm:w-auto">Adicionar filme</BotaoEnviar>
            </FormAcao>
          </details>

          <ul className="space-y-4">
            {filmes.map((filme, i) => (
              <li key={filme.id} className="cartao">
                <div className="flex gap-4 p-4">
                  <Capa url={filme.capa_url} titulo={filme.titulo} className="w-20 shrink-0 rounded-[3px] sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-vermelho">Filme {i + 1}</p>
                    <p className="mt-0.5 text-lg leading-snug font-extrabold">{filme.titulo}</p>
                    <p className="mt-0.5 text-sm text-cinza">
                      {formatarDuracao(filme.duracao_min) || 'Duração não informada'} · {filme.votos}{' '}
                      {filme.votos === 1 ? 'voto' : 'votos'}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] text-cinza">{filme.descricao || 'Sem sinopse.'}</p>
                  </div>
                </div>
                <details className="border-t border-linha">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-cinza hover:text-marinho">Editar filme</summary>
                  <div className="space-y-4 px-4 pb-4">
                    <FormAcao acao={salvarFilme} className="space-y-4">
                      <CamposFilme noiteId={id} filme={filme} />
                      <BotaoEnviar className="btn btn-marinho">Salvar alterações</BotaoEnviar>
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

        <div className="min-w-0 space-y-8">
          {/* Apuração ao vivo (apenas admin) */}
          <section className="overflow-hidden rounded-[4px] bg-marinho text-white">
            <div className="p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-extrabold font-stretch-semi-expanded">Apuração ao vivo</h3>
                <span className="text-sm text-white/70">
                  {totalVotos} {totalVotos === 1 ? 'voto' : 'votos'}
                </span>
              </div>
              {filmes.length === 0 ? (
                <p className="mt-3 text-white/70">Adicione filmes para ver a apuração.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {[...filmes]
                    .sort((a, b) => b.votos - a.votos)
                    .map((filme) => {
                      const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
                      const lider = maisVotos > 0 && filme.votos === maisVotos;
                      const nomes = eleitores.filter((e) => e.filme_id === filme.id).map((e) => e.nome);
                      return (
                        <li key={filme.id}>
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className={`min-w-0 truncate font-bold ${lider ? 'text-ouro' : ''}`}>{filme.titulo}</span>
                            <span className="shrink-0 text-white/80">
                              {filme.votos} · {pct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full ${lider ? 'bg-ouro' : 'bg-white/45'}`} style={{ width: `${pct}%` }} />
                          </div>
                          {nomes.length > 0 && <p className="mt-1 text-sm text-white/60">{nomes.join(', ')}</p>}
                        </li>
                      );
                    })}
                </ul>
              )}
              {pendentes.length > 0 && (
                <div className="mt-5 border-t border-white/15 pt-4">
                  <p className="text-sm font-bold">Ainda não votaram ({pendentes.length})</p>
                  <p className="mt-1 text-sm text-white/60">{pendentes.map((p) => p.nome).join(', ')}</p>
                </div>
              )}
              {totalVotos > 0 && (
                <form action={zerarVotos} className="mt-5">
                  <input type="hidden" name="id" value={id} />
                  <BotaoEnviar
                    className="btn btn-pequeno border border-white/30 text-white hover:border-white hover:bg-vermelho"
                    confirmar="Apagar todos os votos desta noite?"
                  >
                    Zerar votos
                  </BotaoEnviar>
                </form>
              )}
            </div>
            <div className="h-1.5 bg-vermelho" />
          </section>

          {/* Dados da noite */}
          <section className="cartao p-5 sm:p-6">
            <h3 className="titulo-secao">Dados da noite</h3>
            <FormAcao acao={atualizarNoite} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={id} />
              <CamposNoite noite={noite} />
              <BotaoEnviar className="btn btn-marinho">Salvar dados</BotaoEnviar>
            </FormAcao>
          </section>
        </div>
      </div>
    </div>
  );
}
