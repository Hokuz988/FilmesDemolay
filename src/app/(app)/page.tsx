import Link from 'next/link';
import { removerVoto, votar } from '@/app/acoes/votos';
import { Capa, SeloStatus } from '@/components/Comuns';
import { Coroa } from '@/components/Coroa';
import { BotaoEnviar } from '@/components/Formularios';
import { Sinopse } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';
import { formatarData, formatarDuracao, tempoRestante, votacaoAberta } from '@/lib/datas';
import { db } from '@/lib/db';
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
      <div className="cartao mx-auto max-w-lg p-8 text-center">
        <Coroa className="mx-auto w-14 text-ouro" />
        <h1 className="mt-4 font-titulo text-2xl font-bold">Nenhuma votação no momento</h1>
        <p className="mt-2 text-suave">Assim que a próxima noite de filme for aberta, os filmes aparecem aqui.</p>
        {usuario.papel === 'admin' && (
          <Link href="/admin" className="btn btn-ouro mt-6">
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
  const totalVotos = filmes.reduce((soma, f) => soma + f.votos, 0);
  const maisVotos = Math.max(0, ...filmes.map((f) => f.votos));
  const filmeEscolhido = filmes.find((f) => f.id === meuVoto?.filme_id);
  const vencedores = !aberta && maisVotos > 0 ? filmes.filter((f) => f.votos === maisVotos) : [];
  const restante = aberta && noite.prazo_votacao ? tempoRestante(noite.prazo_votacao) : null;
  const ordenados = aberta ? filmes : [...filmes].sort((a, b) => b.votos - a.votos);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Cabeçalho da noite */}
      <section className="text-center">
        <p className="font-titulo text-xs tracking-[0.35em] text-ouro uppercase">Noite de Filme</p>
        <h1 className="mt-2 font-titulo text-3xl font-bold text-balance sm:text-5xl">{noite.titulo}</h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-suave">
          <SeloStatus status={aberta ? 'aberta' : 'encerrada'} rotulo={aberta ? 'Votação aberta' : 'Votação encerrada'} />
          {noite.data_evento && <span className="rounded-full bg-white/5 px-3 py-1">🎬 {formatarData(noite.data_evento)}</span>}
          {restante && <span className="rounded-full bg-white/5 px-3 py-1">⏳ Encerra em {restante}</span>}
        </div>
        {noite.descricao && <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-suave">{noite.descricao}</p>}
        <div className="filete mx-auto mt-8 max-w-md" />
      </section>

      {/* Situação do voto / resultado */}
      {aberta ? (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="cartao p-5 sm:p-6">
            <h2 className="titulo-secao">Como votar</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                'Confira os filmes abaixo: capa, duração e sinopse.',
                'Toque em “Votar neste filme” no seu favorito. Cada membro tem 1 voto.',
                'Mudou de ideia? É só votar em outro filme até a votação encerrar.',
              ].map((passo, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-vermelho font-titulo text-sm font-bold text-ouro">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-texto/90">{passo}</span>
                </li>
              ))}
            </ol>
          </div>
          <div
            className={`cartao flex flex-col justify-center p-5 sm:p-6 ${
              filmeEscolhido ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-ouro/30'
            }`}
          >
            {filmeEscolhido ? (
              <>
                <p className="text-sm text-emerald-300">✓ Seu voto foi registrado</p>
                <p className="mt-1 font-titulo text-xl font-bold">{filmeEscolhido.titulo}</p>
                <form action={removerVoto} className="mt-4">
                  <input type="hidden" name="noite_id" value={noite.id} />
                  <BotaoEnviar className="btn btn-fantasma btn-pequeno">Remover meu voto</BotaoEnviar>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-ouro">Você ainda não votou</p>
                <p className="mt-1 text-texto/90">Escolha um dos {filmes.length} filmes abaixo.</p>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="cartao border-ouro/40 p-5 text-center sm:p-6">
          {vencedores.length > 0 ? (
            <>
              <Coroa className="mx-auto w-10 text-ouro" />
              <p className="mt-2 text-sm text-suave">{vencedores.length > 1 ? 'Empate entre' : 'Filme escolhido'}</p>
              <p className="mt-1 font-titulo text-2xl font-bold text-ouro-claro">
                {vencedores.map((f) => f.titulo).join(' · ')}
              </p>
              <p className="mt-2 text-sm text-suave">
                {totalVotos} {totalVotos === 1 ? 'voto' : 'votos'} no total
              </p>
            </>
          ) : (
            <p className="text-suave">A votação foi encerrada sem votos.</p>
          )}
        </section>
      )}

      {/* Filmes */}
      <section>
        <h2 className="titulo-secao mb-4">{aberta ? 'Filmes concorrendo' : 'Resultado'}</h2>
        {filmes.length === 0 ? (
          <p className="cartao p-6 text-center text-suave">Os filmes desta noite ainda não foram cadastrados.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {ordenados.map((filme) => {
              const meu = filme.id === meuVoto?.filme_id;
              const vencedor = vencedores.some((v) => v.id === filme.id);
              const pct = totalVotos ? Math.round((filme.votos / totalVotos) * 100) : 0;
              return (
                <li
                  key={filme.id}
                  className={`cartao group flex overflow-hidden sm:flex-col ${
                    vencedor ? 'ring-2 ring-ouro' : meu ? 'ring-2 ring-vermelho-vivo' : ''
                  }`}
                >
                  <div className="relative min-h-48 w-32 shrink-0 sm:min-h-0 sm:w-full">
                    <Capa url={filme.capa_url} titulo={filme.titulo} className="h-full sm:h-auto" />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {vencedor && (
                        <span className="rounded-full bg-ouro px-2 py-0.5 text-[0.7rem] font-bold text-fundo">Vencedor</span>
                      )}
                      {meu && (
                        <span className="rounded-full bg-vermelho px-2 py-0.5 text-[0.7rem] font-bold text-white">Seu voto</span>
                      )}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                    <div>
                      <h3 className="font-titulo text-lg leading-snug font-bold">{filme.titulo}</h3>
                      {filme.duracao_min && (
                        <p className="mt-0.5 text-xs font-medium text-ouro">⏱ {formatarDuracao(filme.duracao_min)}</p>
                      )}
                    </div>
                    <Sinopse texto={filme.descricao} />
                    <div className="mt-auto pt-2">
                      {aberta ? (
                        meu ? (
                          <p className="btn w-full cursor-default bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/40">
                            ✓ Voto registrado
                          </p>
                        ) : (
                          <form action={votar}>
                            <input type="hidden" name="filme_id" value={filme.id} />
                            <BotaoEnviar className="btn btn-primario w-full">
                              {meuVoto ? 'Trocar para este filme' : 'Votar neste filme'}
                            </BotaoEnviar>
                          </form>
                        )
                      ) : (
                        <div>
                          <div className="flex justify-between text-xs text-suave">
                            <span>
                              {filme.votos} {filme.votos === 1 ? 'voto' : 'votos'}
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${vencedor ? 'bg-ouro' : 'bg-vermelho'}`}
                              style={{ width: `${pct}%` }}
                            />
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
