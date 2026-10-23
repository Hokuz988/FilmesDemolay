'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirAdmin } from '@/lib/auth';
import { apagarCapa, salvarCapa, validarLinkCapa } from '@/lib/capas';
import { deInputLocal } from '@/lib/datas';
import { REGEX_LOGIN, hashSenha, idValido, texto, validarSenha } from '@/lib/seguranca';
import { ErroUsuario, type Estado, type StatusNoite } from '@/lib/tipos';

function revalidarNoite(id: number) {
  revalidatePath('/admin');
  revalidatePath(`/admin/noites/${id}`);
  revalidatePath('/');
}

function lerNoite(fd: FormData) {
  const titulo = texto(fd, 'titulo', 120);
  const descricao = texto(fd, 'descricao', 2000);
  const dataEvento = deInputLocal(texto(fd, 'data_evento'));
  const prazo = deInputLocal(texto(fd, 'prazo_votacao'));
  if (!titulo) return { erro: 'Informe o título da noite de filme.' };
  return {
    titulo,
    descricao,
    dataEvento: dataEvento?.toISOString() ?? null,
    prazo: prazo?.toISOString() ?? null,
  };
}

// ---------- Noites de filme ----------

export async function criarNoite(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const dados = lerNoite(fd);
  if ('erro' in dados) return dados;

  const sql = await db();
  const [criada] = (await sql`
    INSERT INTO noites (titulo, descricao, data_evento, prazo_votacao)
    VALUES (${dados.titulo}, ${dados.descricao}, ${dados.dataEvento}, ${dados.prazo})
    RETURNING id
  `) as { id: number }[];
  revalidatePath('/admin');
  redirect(`/admin/noites/${criada.id}`);
}

export async function atualizarNoite(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const id = idValido(fd, 'id');
  if (!id) return { erro: 'Noite inválida.' };
  const dados = lerNoite(fd);
  if ('erro' in dados) return dados;

  const sql = await db();
  await sql`
    UPDATE noites SET titulo = ${dados.titulo}, descricao = ${dados.descricao},
      data_evento = ${dados.dataEvento}, prazo_votacao = ${dados.prazo}
    WHERE id = ${id}
  `;
  revalidarNoite(id);
  return { ok: 'Dados salvos.' };
}

export async function alterarStatusNoite(fd: FormData) {
  await exigirAdmin();
  const id = idValido(fd, 'id');
  const status = texto(fd, 'status') as StatusNoite;
  if (!id || !['rascunho', 'aberta', 'encerrada'].includes(status)) return;

  const sql = await db();
  if (status === 'aberta') {
    // Apenas uma votação aberta por vez.
    await sql`UPDATE noites SET status = 'encerrada' WHERE status = 'aberta' AND id <> ${id}`;
  }
  await sql`UPDATE noites SET status = ${status} WHERE id = ${id}`;
  revalidarNoite(id);
}

export async function zerarVotos(fd: FormData) {
  await exigirAdmin();
  const id = idValido(fd, 'id');
  if (!id) return;
  const sql = await db();
  await sql`DELETE FROM votos WHERE noite_id = ${id}`;
  revalidarNoite(id);
}

export async function excluirNoite(fd: FormData) {
  await exigirAdmin();
  const id = idValido(fd, 'id');
  if (!id) return;
  const sql = await db();
  const capas = (await sql`DELETE FROM filmes WHERE noite_id = ${id} RETURNING capa_url`) as { capa_url: string | null }[];
  await sql`DELETE FROM noites WHERE id = ${id}`;
  await Promise.all(capas.map((c) => apagarCapa(c.capa_url)));
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

// ---------- Filmes ----------

export async function salvarFilme(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const noiteId = idValido(fd, 'noite_id');
  const filmeId = idValido(fd, 'filme_id');
  const titulo = texto(fd, 'titulo', 150);
  const descricao = texto(fd, 'descricao', 3000);
  const duracaoTexto = texto(fd, 'duracao_min', 5);
  if (!noiteId) return { erro: 'Noite inválida.' };
  if (!titulo) return { erro: 'Informe o nome do filme.' };

  let duracao: number | null = null;
  if (duracaoTexto) {
    duracao = Number(duracaoTexto);
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 600) {
      return { erro: 'Duração inválida: informe os minutos (entre 1 e 600).' };
    }
  }

  const sql = await db();
  let capaAnterior: string | null = null;
  if (filmeId) {
    const [atual] = (await sql`
      SELECT capa_url FROM filmes WHERE id = ${filmeId} AND noite_id = ${noiteId}
    `) as { capa_url: string | null }[];
    if (!atual) return { erro: 'Filme não encontrado.' };
    capaAnterior = atual.capa_url;
  }

  let capa = capaAnterior;
  try {
    const arquivo = fd.get('capa');
    const link = texto(fd, 'capa_url', 1000);
    if (arquivo instanceof File && arquivo.size > 0) capa = await salvarCapa(arquivo);
    else if (link) capa = validarLinkCapa(link);
    else if (fd.get('remover_capa') === 'on') capa = null;
  } catch (e) {
    if (e instanceof ErroUsuario) return { erro: e.message };
    throw e;
  }

  if (filmeId) {
    await sql`
      UPDATE filmes SET titulo = ${titulo}, descricao = ${descricao}, duracao_min = ${duracao}, capa_url = ${capa}
      WHERE id = ${filmeId}
    `;
    if (capaAnterior !== capa) await apagarCapa(capaAnterior);
  } else {
    await sql`
      INSERT INTO filmes (noite_id, titulo, descricao, duracao_min, capa_url)
      VALUES (${noiteId}, ${titulo}, ${descricao}, ${duracao}, ${capa})
    `;
  }
  revalidarNoite(noiteId);
  return { ok: filmeId ? 'Filme atualizado.' : 'Filme adicionado.' };
}

export async function excluirFilme(fd: FormData) {
  await exigirAdmin();
  const id = idValido(fd, 'filme_id');
  if (!id) return;
  const sql = await db();
  const [removido] = (await sql`
    DELETE FROM filmes WHERE id = ${id} RETURNING noite_id, capa_url
  `) as { noite_id: number; capa_url: string | null }[];
  if (!removido) return;
  await apagarCapa(removido.capa_url);
  revalidarNoite(removido.noite_id);
}

// ---------- Usuários ----------

export async function criarUsuario(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const nome = texto(fd, 'nome', 80);
  const login = texto(fd, 'login', 32).toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  const papel = fd.get('papel') === 'admin' ? 'admin' : 'membro';
  if (!nome) return { erro: 'Informe o nome.' };
  if (!REGEX_LOGIN.test(login)) {
    return { erro: 'Usuário deve ter de 3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou _.' };
  }
  const erroSenha = validarSenha(senha);
  if (erroSenha) return { erro: erroSenha };

  const sql = await db();
  const criado = await sql`
    INSERT INTO usuarios (nome, login, senha_hash, papel)
    VALUES (${nome}, ${login}, ${await hashSenha(senha)}, ${papel})
    ON CONFLICT (login) DO NOTHING RETURNING id
  `;
  if (!criado.length) return { erro: 'Esse nome de usuário já está em uso.' };
  revalidatePath('/admin/usuarios');
  return { ok: `Conta de ${nome} criada.` };
}

/** Ações sobre outro usuário; o admin não pode alterar a própria conta por aqui. */
async function alvo(fd: FormData) {
  const admin = await exigirAdmin();
  const id = idValido(fd, 'id');
  if (!id || id === admin.id) return null;
  return id;
}

export async function alterarPapel(fd: FormData) {
  const id = await alvo(fd);
  if (!id) return;
  const papel = fd.get('papel') === 'admin' ? 'admin' : 'membro';
  const sql = await db();
  await sql`UPDATE usuarios SET papel = ${papel} WHERE id = ${id}`;
  revalidatePath('/admin/usuarios');
}

export async function alternarAtivo(fd: FormData) {
  const id = await alvo(fd);
  if (!id) return;
  const sql = await db();
  await sql`UPDATE usuarios SET ativo = NOT ativo, versao_sessao = versao_sessao + 1 WHERE id = ${id}`;
  revalidatePath('/admin/usuarios');
}

export async function desconectarUsuario(fd: FormData) {
  const id = await alvo(fd);
  if (!id) return;
  const sql = await db();
  await sql`UPDATE usuarios SET versao_sessao = versao_sessao + 1 WHERE id = ${id}`;
  revalidatePath('/admin/usuarios');
}

export async function redefinirSenha(_: Estado, fd: FormData): Promise<Estado> {
  const id = await alvo(fd);
  if (!id) return { erro: 'Use "Minha conta" para trocar a sua própria senha.' };
  const senha = String(fd.get('senha') ?? '');
  const erroSenha = validarSenha(senha);
  if (erroSenha) return { erro: erroSenha };
  const sql = await db();
  await sql`
    UPDATE usuarios SET senha_hash = ${await hashSenha(senha)}, versao_sessao = versao_sessao + 1,
      tentativas_falhas = 0, bloqueado_ate = NULL
    WHERE id = ${id}
  `;
  return { ok: 'Senha redefinida.' };
}

export async function excluirUsuario(fd: FormData) {
  const id = await alvo(fd);
  if (!id) return;
  const sql = await db();
  await sql`DELETE FROM usuarios WHERE id = ${id}`;
  revalidatePath('/admin/usuarios');
  revalidatePath('/admin');
}
