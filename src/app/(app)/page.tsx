import Link from 'next/link';
import { removerVoto, votar } from '@/app/acoes/votos';
import { Capa } from '@/components/Comuns';
import { Emblema } from '@/components/Emblema';
import { BotaoEnviar } from '@/components/Formularios';
import { Sinopse } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';
import { formatarData, formatarDuracao, tempoRestante, votacaoAberta } from '@/lib/datas';
import { db } from '@/lib/db';
import type { FilmeComVotos, Noite } from '@/lib/tipos';

export const metadata = { title: 'Votação' };

const PASSOS = [
  'Confira a programação abaixo: capa, duração e sinopse de cada filme.',
  'Toque no ingresso “Votar neste filme” do seu favorito. Cada membro tem um voto.',
  'Mudou de ideia? Vote em outro filme. Vale o último voto até a votação encerrar.',
];
const ROMANOS = ['I', 'II', 'III'];

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
        <Emblema className="mx-auto w-20 text-vermelho" detalhe="var(--color-cartao)" />
        <p className="mt-5 font-maquina text-xs tracking-[0.2em] text-vermelho uppercase">Sala vazia</p>
        <h1 className="mt-1 font-titulo text-3xl font-black">Nenhuma sessão em cartaz</h1>
        <p className="mt-3 text-suave">Assim que a próxima noite de filme for aberta, a programação aparece aqui.</p>
        {usuario.papel === 'admin' && (
          <Link href="/admin" className="btn btn-primario mt-6">
            Criar noite de filme
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
  const numero = new Map(filmes.map((f, i) => [f.id, String(i + 1).padStart(2, '0')]));
  const totalVotos = filmes.reduce((soma, f) => soma + f.votos, 0);
  const maisVotos = Math.max(0, ...filmes.map((f) => f.votos));
  const filmeEscolhido = filmes.find((f) => f.id === meuVoto?.filme_id);
  const vencedores = !aberta && maisVotos > 0 ? filmes.filter((f) => f.votos === maisVotos) : [];
  const restante = aberta && noite.prazo_votacao ? tempoRestante(noite.prazo_votacao) : null;
  const ordenados = aberta ? filmes : [...filmes].sort((a, b) => b.votos - a.votos);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Letreiro */}
      <section className="letreiro">
        <div className="letreiro-painel px-5 py-9 text-center sm:px-10 sm:py-14">
          <p className="font-maquina text-xs tracking-[0.2em] text-dourado uppercase sm:text-sm">
            {aberta ? 'Em cartaz · votação aberta' : 'Votação encerrada'} — sessão nº {String(noite.id).padStart(3, '0')}
          </p>
          <h1 className="mt-4 font-letreiro text-4xl leading-[0.95] font-semibold tracking-wide text-balance text-papel uppercase sm:text-6xl">
            {noite.titulo}
          </h1>
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 font-letreiro text-xs tracking-[0.18em] uppercase sm:text-sm">
            {noite.data_evento && <span className="text-dourado">{formatarData(noite.data_evento)}</span>}
            {restante && <span className="text-papel/75">Votação encerra em {restante}</span>}
          </div>
          {noite.descricao && (
            <p className="mx-auto mt-6 max-w-2xl font-titulo text-lg whitespace-pre-line text-papel/75 italic">{noite.descricao}</p>
          )}
        </div>
      </section>

      {/* Instruções e ingresso do usuário, ou resultado final */}
      {aberta ? (
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="cartao p-5 sm:p-7">
            <h2 className="titulo-secao">Instruções ao espectador</h2>
            <ol className="mt-5 space-y-4">
              {PASSOS.map((passo, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-9 shrink-0 font-titulo text-2xl leading-none font-bold text-vermelho">{ROMANOS[i]}</span>
                  <p className="text-tinta/85">{passo}</p>
                </li>
              ))}
            </ol>
          </div>

          {filmeEscolhido ? (
            <div className="flex flex-col justify-center bg-tinta p-5 text-papel sm:p-7">
              <p className="font-maquina text-xs tracking-[0.2em] text-dourado uppercase">
                Seu ingresso · Nº {numero.get(filmeEscolhido.id)}
              </p>
              <p className="mt-2 font-titulo text-2xl font-bold">{filmeEscolhido.titulo}</p>
              <p className="mt-1 text-sm text-papel/65">Voto registrado. Dá para trocar até o fim da votação.</p>
              <form action={removerVoto} className="mt-5">
                <input type="hidden" name="noite_id" value={noite.id} />
                <BotaoEnviar className="btn btn-pequeno border border-papel/40 text-papel hover:bg-papel hover:text-tinta">
                  Remover meu voto
                </BotaoEnviar>
              </form>
            </div>
          ) : (
            <div className="cartao flex flex-col justify-center border-vermelho/70 p-5 sm:p-7">
              <p className="font-maquina text-xs tracking-[0.2em] text-vermelho uppercase">Seu ingresso</p>
              <p className="mt-2 font-titulo text-2xl font-bold">Você ainda não votou</p>
              <p className="mt-1 text-sm text-suave">Escolha um dos {filmes.length} filmes da programação abaixo.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="cartao px-5 py-9 text-center sm:py-12">
          {vencedores.length > 0 ? (
            <>
              <Emblema className="mx-auto w-16 text-vermelho" detalhe="var(--color-cartao)" />
              <p className="mt-4 font-letreiro text-xs tracking-[0.3em] text-suave uppercase">
                {vencedores.length > 1 ? 'Empate entre' : 'O filme escolhido é'}
              </p>
              <p className="mt-2 font-titulo text-3xl font-black text-balance sm:text-5xl">
                {vencedores.map((f) => f.titulo).join(' & ')}
              </p>
              <p className="mt-4 font-maquina text-sm text-suave">
                {totalVotos} {totalVotos === 1 ? 'voto apurado' : 'votos apurados'}
              </p>
            </>
          ) : (
            <p className="text-suave">A votação foi encerrada sem votos.</p>
          )}
        </section>
      )}

      {/* Programação */}
      <section>
        <h2 className="titulo-secao mb-6">{aberta ? 'Programação' : 'Apuração'}</h2>
        {filmes.length === 0 ? (
          <p className="cartao p-6 text-center text-suave">Os filmes desta noite ainda não foram anunciados.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {ordenados.map((filme) => {
              const n = numero.get(filme.id);
              const meu = filme.id === meuVoto?.filme_id;
              const vencedor = vencedores.some((v) => v.id === filme.id);
              const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
              return (
                <li key={filme.id} className={`cartao flex sm:flex-col ${meu ? 'bg-creme' : ''}`}>
                  <div className="w-28 shrink-0 bg-tinta p-1.5 sm:w-full sm:p-2">
                    <Capa url={filme.capa_url} titulo={filme.titulo} className="h-full min-h-44 sm:h-auto sm:min-h-0" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-maquina text-xs">
                      <span className="text-vermelho">Nº {n}</span>
                      {filme.duracao_min ? <span className="text-suave">{formatarDuracao(filme.duracao_min)}</span> : null}
                    </div>
                    {(vencedor || meu) && (
                      <div className="mt-2 flex gap-2">
                        {vencedor && <span className="carimbo border-vermelho text-vermelho">Escolhido</span>}
                        {meu && <span className="carimbo border-tinta text-tinta">Seu voto</span>}
                      </div>
                    )}
                    <h3 className="mt-1.5 font-titulo text-xl leading-tight font-bold sm:text-2xl">{filme.titulo}</h3>
                    <div className="mt-2">
                      <Sinopse texto={filme.descricao} />
                    </div>

                    <div className="mt-auto pt-5">
                      {aberta ? (
                        meu ? (
                          <div className="ingresso flex items-center justify-between bg-tinta px-6 py-3.5 font-letreiro text-sm tracking-[0.14em] text-dourado uppercase">
                            <span>✓ Voto registrado</span>
                            <span className="border-l border-dashed border-dourado/50 pl-3 font-maquina normal-case">Nº {n}</span>
                          </div>
                        ) : (
                          <form action={votar}>
                            <input type="hidden" name="filme_id" value={filme.id} />
                            <BotaoEnviar className="btn btn-primario ingresso w-full justify-between px-6 py-3.5">
                              <span>{meuVoto ? 'Trocar para este' : 'Votar neste filme'}</span>
                              <span className="border-l border-dashed border-papel/50 pl-3 font-maquina normal-case">Nº {n}</span>
                            </BotaoEnviar>
                          </form>
                        )
                      ) : (
                        <div>
                          <div className="flex items-end font-maquina text-sm">
                            <span>
                              {filme.votos} {filme.votos === 1 ? 'voto' : 'votos'}
                            </span>
                            <span className="mx-2 mb-1 flex-1 border-b border-dotted border-suave/60" />
                            <span className="font-bold">{pct}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 bg-creme">
                            <div className={`h-full ${vencedor ? 'bg-vermelho' : 'bg-tinta/50'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
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
