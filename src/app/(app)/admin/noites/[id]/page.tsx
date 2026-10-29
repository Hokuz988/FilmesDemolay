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
import { romano } from '@/lib/romano';
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
        <Link href="/admin" className="font-titulo text-[0.7rem] font-bold tracking-[0.16em] text-nevoa uppercase hover:text-ouro">
          ← Todas as sessões
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="sobretitulo">Sessão nº {String(id).padStart(3, '0')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="font-titulo text-2xl font-bold sm:text-3xl">{noite.titulo}</h2>
              <SeloStatus status={noite.status} />
            </div>
            <p className="mt-1 text-nevoa">
              {noite.data_evento ? formatarData(noite.data_evento) : 'Sem data definida'}
              {noite.prazo_votacao && ` · votação até ${formatarData(noite.prazo_votacao)}`}
            </p>
            {prazoVencido && (
              <p className="mt-2 border-l-2 border-ouro bg-ouro/10 px-3 py-1.5 text-sm text-ouro-claro">
                O prazo já passou: a votação está fechada para os membros.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {noite.status !== 'aberta' && (
              <BotaoStatus id={id} status="aberta" className="btn btn-primario">
                {noite.status === 'encerrada' ? 'Reabrir votação' : 'Abrir votação'}
              </BotaoStatus>
            )}
            {noite.status === 'aberta' && (
              <BotaoStatus id={id} status="encerrada" className="btn btn-ouro">
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
          <p className="mt-4 border-t border-linha pt-3 text-sm text-nevoa">
            Rascunhos não aparecem para os membros. Ao abrir a votação, qualquer outra votação aberta é encerrada.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Filmes */}
        <section className="min-w-0 space-y-4">
          <h3 className="titulo-secao">Filmes indicados · {filmes.length}</h3>

          <details className="cartao group p-5 sm:p-6" open={filmes.length === 0}>
            <summary className="cursor-pointer list-none font-titulo text-sm font-bold tracking-[0.16em] text-ouro uppercase [&::-webkit-details-marker]:hidden">
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
                  <div className="w-20 shrink-0 sm:w-24">
                    <Capa url={filme.capa_url} titulo={filme.titulo} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-titulo text-xs font-bold tracking-[0.14em] text-ouro uppercase">Indicado {romano(i + 1)}</p>
                    <p className="mt-0.5 font-titulo text-lg leading-snug font-bold text-marfim">{filme.titulo}</p>
                    <p className="mt-0.5 text-sm text-nevoa">
                      {formatarDuracao(filme.duracao_min) || 'Duração não informada'} · {filme.votos}{' '}
                      {filme.votos === 1 ? 'voto' : 'votos'}
                    </p>
                    <p className="mt-2 line-clamp-3 text-marfim/75">{filme.descricao || 'Sem sinopse.'}</p>
                  </div>
                </div>
                <details className="border-t border-linha">
                  <summary className="cursor-pointer px-4 py-3 font-titulo text-[0.7rem] font-bold tracking-[0.16em] text-nevoa uppercase hover:text-ouro">
                    Editar filme
                  </summary>
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

        <div className="min-w-0 space-y-8">
          {/* Apuração ao vivo (apenas admin) */}
          <section className="medalhao ceu p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-titulo text-sm font-bold tracking-[0.22em] text-ouro uppercase">Apuração ao vivo</h3>
              <span className="text-sm text-marfim/70">
                {totalVotos} {totalVotos === 1 ? 'voto' : 'votos'}
              </span>
            </div>
            {filmes.length === 0 ? (
              <p className="mt-3 text-marfim/60">Adicione filmes para ver a apuração.</p>
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
                        <div className="flex items-end gap-2">
                          <span className={`min-w-0 truncate font-titulo text-sm font-bold ${lider ? 'text-ouro' : 'text-marfim'}`}>
                            {filme.titulo}
                          </span>
                          <span className="mb-1.5 flex-1 border-b border-dotted border-marfim/25" />
                          <span className="shrink-0 font-titulo text-xs font-semibold text-marfim/80">
                            {filme.votos} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-marfim/10">
                          <div className={`h-full ${lider ? 'bg-ouro' : 'bg-rubi-vivo'}`} style={{ width: `${pct}%` }} />
                        </div>
                        {nomes.length > 0 && <p className="mt-1 text-sm text-marfim/60">{nomes.join(', ')}</p>}
                      </li>
                    );
                  })}
              </ul>
            )}
            {pendentes.length > 0 && (
              <div className="mt-5 border-t border-ouro/20 pt-4">
                <p className="font-titulo text-xs font-bold tracking-[0.16em] text-ouro/85 uppercase">Ainda não votaram ({pendentes.length})</p>
                <p className="mt-1 text-sm text-marfim/60">{pendentes.map((p) => p.nome).join(', ')}</p>
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
            <FormAcao acao={atualizarNoite} className="mt-5 space-y-4">
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
