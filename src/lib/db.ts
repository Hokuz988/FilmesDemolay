import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'membro' CHECK (papel IN ('admin', 'membro')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    versao_sessao INTEGER NOT NULL DEFAULT 0,
    tentativas_falhas INTEGER NOT NULL DEFAULT 0,
    bloqueado_ate TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS noites (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    data_evento TIMESTAMPTZ,
    prazo_votacao TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aberta', 'encerrada')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS filmes (
    id SERIAL PRIMARY KEY,
    noite_id INTEGER NOT NULL REFERENCES noites(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    duracao_min INTEGER,
    capa_url TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS votos (
    noite_id INTEGER NOT NULL REFERENCES noites(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    filme_id INTEGER NOT NULL REFERENCES filmes(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (noite_id, usuario_id)
  )`,
  `CREATE INDEX IF NOT EXISTS filmes_noite_idx ON filmes (noite_id)`,
  `CREATE INDEX IF NOT EXISTS votos_filme_idx ON votos (filme_id)`,
];

let conexao: NeonQueryFunction<false, false> | null = null;
let esquemaPronto: Promise<void> | null = null;

/** Retorna a conexão com o banco, criando as tabelas na primeira chamada. */
export async function db() {
  if (!conexao) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL não configurada.');
    conexao = neon(url);
  }
  const sql = conexao;
  if (!esquemaPronto) {
    esquemaPronto = (async () => {
      for (const comando of ESQUEMA) await sql.query(comando);
    })().catch((e) => {
      esquemaPronto = null;
      throw e;
    });
  }
  await esquemaPronto;
  return sql;
}
