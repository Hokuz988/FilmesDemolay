import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';
import type { Usuario } from './tipos';

const COOKIE = 'fd_sessao';
const TRINTA_DIAS = 60 * 60 * 24 * 30;
const DOZE_HORAS = 60 * 60 * 12;

function chave() {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error('SESSION_SECRET ausente ou curta (mínimo de 32 caracteres).');
  }
  return new TextEncoder().encode(segredo);
}

/** Grava o cookie de login. "lembrar" mantém o usuário conectado por 30 dias. */
export async function iniciarSessao(usuario: { id: number; versao_sessao: number }, lembrar: boolean) {
  const duracao = lembrar ? TRINTA_DIAS : DOZE_HORAS;
  const token = await new SignJWT({ v: usuario.versao_sessao, l: lembrar })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(usuario.id))
    .setIssuedAt()
    .setExpirationTime(`${duracao}s`)
    .sign(chave());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(lembrar ? { maxAge: duracao } : {}),
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

async function lerToken() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ['HS256'] });
    return { id: Number(payload.sub), versao: payload.v, lembrar: payload.l === true };
  } catch {
    return null;
  }
}

/** Usuário logado, sempre conferido no banco (permissões e status atualizados). */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const token = await lerToken();
  if (!token || !Number.isInteger(token.id)) return null;
  const sql = await db();
  const [usuario] = (await sql`
    SELECT id, nome, login, papel, ativo, versao_sessao FROM usuarios WHERE id = ${token.id}
  `) as Usuario[];
  if (!usuario || !usuario.ativo || usuario.versao_sessao !== token.versao) return null;
  return usuario;
});

export async function sessaoLembrada() {
  return (await lerToken())?.lembrar ?? false;
}

export async function exigirUsuario() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect('/login');
  return usuario;
}

export async function exigirAdmin() {
  const usuario = await exigirUsuario();
  if (usuario.papel !== 'admin') redirect('/');
  return usuario;
}
