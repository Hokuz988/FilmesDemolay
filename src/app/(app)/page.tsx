import Link from 'next/link';
import { votar } from '@/app/acoes/votos';
import { Capa, Divisor, Escudo } from '@/components/Comuns';
import { Coroa, Cruz, Emblema } from '@/components/Emblema';
import { BotaoEnviar } from '@/components/Formularios';
import { Sinopse } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';
import { formatarData, formatarDuracao, tempoRestante, votacaoAberta } from '@/lib/datas';
import { db } from '@/lib/db';
import { romano } from '@/lib/romano';
import type { FilmeComVotos, Noite } from '@/lib/tipos';

export const metadata = { title: 'Votação' };

export default async function PaginaVotacao() {
  const usuario = await exigirUsuario();
  const sql = await db();

  const [noite] = (await sql`
    SELECT * FROM noites WHERE status <> 'rascunho'
    ORDER BY (status = 'aberta') DESC, COALESCE(data_evento, criado_em) DESC
    LIMIT 1
  `) as Noite[];

  if (!noite) {
    return (
      <div className="cartao mx-auto max-w-lg px-6 py-12 text-center">
        <Emblema className="mx-auto w-28 drop-shadow-[0_0_22px_rgb(246_180_12/0.25)]" />
        <p className="sobretitulo mt-7">Aguardando convocação</p>
        <h1 className="mt-2 font-titulo text-2xl font-bold sm:text-3xl">Nenhuma sessão aberta</h1>
        <p className="mt-3 text-nevoa">Assim que a próxima noite de filmes for aberta, os filmes indicados aparecem aqui.</p>
        {usuario.papel === 'admin' && (
          <Link href="/admin" className="btn btn-primario mt-7">
            Criar noite de filmes
          </Link>
        )}
      </div>
    );
  }

  const filmes = (await sql`
    SELECT f.*, COUNT(v.usuario_id)::int AS votos
    FROM filmes f LEFT JOIN votos v ON v.filme_id = f.id
    WHERE f.noite_id = ${noite.id}
    GROUP BY f.id ORDER BY f.criado_em
  `) as FilmeComVotos[];
  const [meuVoto] = (await sql`
    SELECT filme_id FROM votos WHERE noite_id = ${noite.id} AND usuario_id = ${usuario.id}
  `) as { filme_id: number }[];

  const aberta = votacaoAberta(noite);
  const numero = new Map(filmes.map((f, i) => [f.id, romano(i + 1)]));
  const totalVotos = filmes.reduce((soma, f) => soma + f.votos, 0);
  const maisVotos = Math.max(0, ...filmes.map((f) => f.votos));
  const vencedores = !aberta && maisVotos > 0 ? filmes.filter((f) => f.votos === maisVotos) : [];
  const restante = aberta && noite.prazo_votacao ? tempoRestante(noite.prazo_votacao) : null;
  const ordenados = aberta ? filmes : [...filmes].sort((a, b) => b.votos - a.votos);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Medalhão: a noite estrelada do emblema */}
      <section className="medalhao ceu px-5 py-10 text-center sm:px-12 sm:py-16">
        <Cruz className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[26rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.07] sm:w-[36rem]" />
        <p className="sobretitulo text-[0.68rem] sm:text-xs">
          Sessão nº {String(noite.id).padStart(3, '0')} · {aberta ? 'Escrutínio aberto' : 'Escrutínio encerrado'}
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-titulo text-3xl leading-tight font-bold text-balance text-marfim sm:text-6xl sm:leading-[1.1]">
          {noite.titulo}
        </h1>
        <Divisor className="mx-auto mt-6 max-w-xs" />
        {(noite.data_evento || restante) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-titulo text-xs font-semibold tracking-[0.14em] uppercase sm:text-sm">
            {noite.data_evento && <span className="text-ouro">{formatarData(noite.data_evento)}</span>}
            {restante && <span className="text-marfim/75">Votação encerra em {restante}</span>}
          </div>
        )}
        {noite.descricao && (
          <p className="mx-auto mt-6 max-w-2xl text-lg whitespace-pre-line text-marfim/80 italic sm:text-xl">{noite.descricao}</p>
        )}
      </section>

      {/* Coroação do filme escolhido */}
      {!aberta && (
        <section className="cartao bg-[radial-gradient(ellipse_at_50%_0%,rgb(246_180_12/0.14),transparent_65%)] px-5 py-10 text-center sm:py-14">
          {vencedores.length > 0 ? (
            <>
              <Coroa className="mx-auto w-20 drop-shadow-[0_6px_14px_rgb(0_0_0/0.5)] sm:w-24" />
              <p className="sobretitulo mt-5 text-nevoa">{vencedores.length > 1 ? 'Empate entre' : 'O filme escolhido é'}</p>
              <p className="mx-auto mt-3 max-w-3xl font-titulo text-2xl leading-tight font-bold text-balance text-ouro sm:text-5xl">
                {vencedores.map((f) => f.titulo).join(' & ')}
              </p>
              <Divisor className="mx-auto mt-6 max-w-[12rem]" />
              <p className="mt-4 text-nevoa">
                {totalVotos} {totalVotos === 1 ? 'voto apurado' : 'votos apurados'}
              </p>
            </>
          ) : (
            <p className="text-nevoa">A votação foi encerrada sem votos.</p>
          )}
        </section>
      )}

      {/* Filmes indicados */}
      <section>
        <h2 className="titulo-secao mb-6">{aberta ? 'Filmes indicados' : 'Apuração'}</h2>
        {filmes.length === 0 ? (
          <p className="cartao p-6 text-center text-nevoa">Os filmes desta noite ainda não foram anunciados.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {ordenados.map((filme) => {
              const n = numero.get(filme.id) ?? '';
              const meu = filme.id === meuVoto?.filme_id;
              const vencedor = vencedores.some((v) => v.id === filme.id);
              const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
              return (
                <li key={filme.id} className={`cartao flex flex-col ${meu ? 'cartao-destaque' : ''}`}>
                  <div className="flex flex-1 sm:flex-col">
                    <div className="relative w-28 shrink-0 p-2 sm:w-full sm:p-3 sm:pb-0">
                      <Capa url={filme.capa_url} titulo={filme.titulo} className="h-full w-full min-h-44 sm:h-auto sm:min-h-0" />
                      <span className="absolute -top-px left-3.5 sm:left-5">
                        <Escudo numero={n} />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5 sm:pb-0">
                      {(vencedor || meu || filme.duracao_min) && (
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {vencedor && <span className="selo border-ouro bg-ouro text-anil">Escolhido</span>}
                          {meu && <span className="selo border-ouro/70 text-ouro">Seu voto</span>}
                          {filme.duracao_min ? (
                            <span className="ml-auto font-titulo text-[0.7rem] font-semibold tracking-[0.12em] text-nevoa uppercase">
                              {formatarDuracao(filme.duracao_min)}
                            </span>
                          ) : null}
                        </div>
                      )}
                      <h3 className="font-titulo text-lg leading-snug font-bold text-marfim sm:text-xl">{filme.titulo}</h3>
                      <div className="mt-2">
                        <Sinopse texto={filme.descricao} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-linha p-4 sm:border-0 sm:p-5">
                    {aberta ? (
                      meu ? (
                        <div className="flex items-center justify-between gap-3 border border-ouro/60 bg-ouro/10 px-5 py-3 font-titulo text-[0.8rem] font-bold tracking-[0.14em] text-ouro uppercase">
                          <span className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <path d="M4 12.5 9.5 18 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Voto registrado
                          </span>
                          <span className="border-l border-ouro/40 pl-3">{n}</span>
                        </div>
                      ) : (
                        <form action={votar}>
                          <input type="hidden" name="filme_id" value={filme.id} />
                          <BotaoEnviar className="btn btn-primario w-full justify-between px-5 py-3">
                            <span>{meuVoto ? 'Trocar para este' : 'Votar neste filme'}</span>
                            <span className="border-l border-marfim/30 pl-3">{n}</span>
                          </BotaoEnviar>
                        </form>
                      )
                    ) : (
                      <div>
                        <div className="flex items-end gap-2">
                          <span className="font-titulo text-sm font-semibold">
                            {filme.votos} {filme.votos === 1 ? 'voto' : 'votos'}
                          </span>
                          <span className="mb-1.5 flex-1 border-b border-dotted border-nevoa/40" />
                          <span className="font-titulo text-sm font-bold text-ouro">{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-campo ring-1 ring-linha">
                          <div className={`h-full ${vencedor ? 'bg-ouro' : 'bg-nevoa/50'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
