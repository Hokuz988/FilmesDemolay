import Link from 'next/link';
import { votar } from '@/app/acoes/votos';
import { Capa, Escudo } from '@/components/Comuns';
import { Emblema } from '@/components/Emblema';
import { BotaoEnviar } from '@/components/Formularios';
import { Sinopse } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';
import { formatarDuracao, partesData, tempoRestante, votacaoAberta } from '@/lib/datas';
import { db } from '@/lib/db';
import type { FilmeComVotos, Noite } from '@/lib/tipos';

export const metadata = { title: 'Votação' };

/** Folhinha de calendário com a data da sessão. */
function Folhinha({ data }: { data: Date }) {
  const { semana, dia, mes, hora } = partesData(data);
  return (
    <div className="flex w-fit shrink-0 overflow-hidden rounded-[3px] bg-white text-marinho md:w-28 md:flex-col md:text-center">
      <span className="flex items-center bg-vermelho px-2.5 text-xs font-extrabold tracking-[0.12em] text-white uppercase md:justify-center md:py-1.5">
        {mes}
      </span>
      <span className="px-2.5 py-1.5 text-2xl leading-none font-black font-stretch-expanded md:px-0 md:pt-2 md:pb-0 md:text-5xl">{dia}</span>
      <span className="flex items-center pr-3 text-sm text-cinza md:justify-center md:p-0 md:pt-1.5 md:pb-2.5">
        {semana} · {hora}
      </span>
    </div>
  );
}

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
      <div className="cartao mx-auto flex max-w-xl flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <Emblema className="w-20 shrink-0" />
        <div>
          <h1 className="text-2xl font-black tracking-tight font-stretch-expanded">Nenhuma votação aberta</h1>
          <p className="mt-2 text-cinza">Quando a próxima noite de filmes for aberta, os filmes aparecem aqui.</p>
          {usuario.papel === 'admin' && (
            <Link href="/admin" className="btn btn-primario mt-5">
              Criar noite de filmes
            </Link>
          )}
        </div>
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
  const numero = new Map(filmes.map((f, i) => [f.id, i + 1]));
  const totalVotos = filmes.reduce((soma, f) => soma + f.votos, 0);
  const maisVotos = Math.max(0, ...filmes.map((f) => f.votos));
  const vencedores = !aberta && maisVotos > 0 ? filmes.filter((f) => f.votos === maisVotos) : [];
  const restante = aberta && noite.prazo_votacao ? tempoRestante(noite.prazo_votacao) : null;
  const ordenados = aberta ? filmes : [...filmes].sort((a, b) => b.votos - a.votos);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Cabeçalho da sessão */}
      <section className="overflow-hidden rounded-[4px] bg-marinho text-white">
        <div className="flex flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className={`etiqueta ${aberta ? 'bg-ouro text-marinho' : 'bg-white/15 text-white'}`}>
                {aberta ? 'Votação aberta' : 'Votação encerrada'}
              </span>
              {restante && <span className="text-white/75">encerra em {restante}</span>}
              <span className="text-white/60">Sessão nº {noite.id}</span>
            </div>
            <h1 className="mt-4 text-3xl leading-[1.05] font-black tracking-tight text-balance font-stretch-expanded sm:text-5xl">
              {noite.titulo}
            </h1>
            {noite.descricao && (
              <p className="mt-4 max-w-2xl whitespace-pre-line text-white/80 sm:text-lg">{noite.descricao}</p>
            )}
          </div>
          {noite.data_evento && <Folhinha data={noite.data_evento} />}
        </div>
        <div className="h-1.5 bg-vermelho" />
      </section>

      {/* Resultado */}
      {!aberta && (
        <section className="cartao flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {vencedores.length === 1 && (
            <Capa url={vencedores[0].capa_url} titulo={vencedores[0].titulo} className="w-24 shrink-0 rounded-[3px] sm:w-28" />
          )}
          {vencedores.length > 0 ? (
            <div className="min-w-0">
              <p className="text-sm font-bold text-vermelho">{vencedores.length > 1 ? 'Empate' : 'Filme escolhido'}</p>
              <p className="mt-1 text-2xl leading-tight font-black tracking-tight text-balance font-stretch-expanded sm:text-4xl">
                {vencedores.map((f) => f.titulo).join(' e ')}
              </p>
              <p className="mt-2 text-cinza">
                {maisVotos} de {totalVotos} {totalVotos === 1 ? 'voto' : 'votos'}
                {vencedores.length > 1 && ' cada'}
              </p>
            </div>
          ) : (
            <p className="text-cinza">A votação foi encerrada sem votos.</p>
          )}
        </section>
      )}

      {/* Filmes */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <h2 className="titulo-secao">{aberta ? 'Filmes indicados' : 'Resultado da votação'}</h2>
          {filmes.length > 0 && (
            <span className="text-sm text-cinza">
              {filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}
              {aberta && (meuVoto ? ' · você já votou' : ' · você ainda não votou')}
            </span>
          )}
        </div>
        {filmes.length === 0 ? (
          <p className="cartao p-6 text-cinza">Os filmes desta noite ainda não foram anunciados.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {ordenados.map((filme) => {
              const n = numero.get(filme.id) ?? 0;
              const meu = filme.id === meuVoto?.filme_id;
              const vencedor = vencedores.some((v) => v.id === filme.id);
              const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
              return (
                <li
                  key={filme.id}
                  className={`cartao flex flex-col overflow-hidden ${meu ? 'border-marinho ring-1 ring-marinho' : ''}`}
                >
                  <div className="flex flex-1 gap-3.5 p-3 sm:flex-col sm:gap-0 sm:p-0">
                    <div className="relative w-24 shrink-0 sm:w-full">
                      <Capa
                        url={filme.capa_url}
                        titulo={filme.titulo}
                        className="h-full w-full min-h-36 rounded-[3px] sm:h-auto sm:min-h-0 sm:rounded-none"
                      />
                      <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5">
                        <Escudo numero={n} />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col sm:px-5 sm:pt-5">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-cinza">
                        {meu && <span className="etiqueta bg-marinho text-white">Seu voto</span>}
                        {vencedor && <span className="etiqueta bg-ouro text-marinho">Escolhido</span>}
                        {filme.duracao_min ? <span>{formatarDuracao(filme.duracao_min)}</span> : null}
                      </div>
                      <h3 className="mt-1.5 text-[1.0625rem] leading-snug font-extrabold sm:text-xl">{filme.titulo}</h3>
                      <div className="mt-1.5">
                        <Sinopse texto={filme.descricao} />
                      </div>
                    </div>
                  </div>

                  <div className="px-3 pb-3 sm:p-5">
                    {aberta ? (
                      meu ? (
                        <p className="flex min-h-11 items-center gap-2 rounded-[3px] bg-marinho px-4 text-sm font-semibold text-white">
                          <svg
                            viewBox="0 0 24 24"
                            className="size-4 shrink-0 text-ouro"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            aria-hidden="true"
                          >
                            <path d="M4 12.5 9.5 18 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Seu voto está neste filme
                        </p>
                      ) : (
                        <form action={votar}>
                          <input type="hidden" name="filme_id" value={filme.id} />
                          <BotaoEnviar className="btn btn-primario min-h-11 w-full">
                            {meuVoto ? 'Mudar meu voto para este' : 'Votar neste filme'}
                          </BotaoEnviar>
                        </form>
                      )
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="font-semibold">
                            {filme.votos} {filme.votos === 1 ? 'voto' : 'votos'}
                          </span>
                          <span className="font-bold">{pct}%</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-nevoa">
                          <div className={`h-full ${vencedor ? 'bg-ouro' : 'bg-marinho/35'}`} style={{ width: `${pct}%` }} />
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
