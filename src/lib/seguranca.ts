import { createHash, timingSafeEqual } from 'node:crypto';
import { compare, hash } from 'bcryptjs';

const CUSTO_BCRYPT = 12;

export const REGEX_LOGIN = /^[a-z0-9._-]{3,32}$/;

export function hashSenha(senha: string) {
  return hash(senha, CUSTO_BCRYPT);
}

let hashFalso: Promise<string> | null = null;

/**
 * Compara a senha com o hash. Sem hash (usuário inexistente), compara com um hash
 * falso para que a resposta leve o mesmo tempo e não revele quais usuários existem.
 */
export async function conferirSenha(senha: string, hashSalvo: string | undefined) {
  if (hashSalvo) return compare(senha, hashSalvo);
  hashFalso ??= hash('senha-inexistente', CUSTO_BCRYPT);
  await compare(senha, await hashFalso);
  return false;
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (senha.length > 72) return 'A senha deve ter no máximo 72 caracteres.';
  return null;
}

/** Compara códigos (convite/setup) em tempo constante. */
export function codigoConfere(informado: string, esperado: string | undefined) {
  if (!esperado) return false;
  const a = createHash('sha256').update(informado).digest();
  const b = createHash('sha256').update(esperado).digest();
  return timingSafeEqual(a, b);
}

export function texto(fd: FormData, nome: string, max = 200) {
  return String(fd.get(nome) ?? '').trim().slice(0, max);
}

export function idValido(fd: FormData, nome: string): number | null {
  const n = Number(fd.get(nome));
  return Number.isInteger(n) && n > 0 ? n : null;
}
