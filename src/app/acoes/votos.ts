'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import { votacaoAberta } from '@/lib/datas';
import { idValido } from '@/lib/seguranca';
import type { Noite } from '@/lib/tipos';

export async function votar(fd: FormData) {
  const usuario = await exigirUsuario();
  const filmeId = idValido(fd, 'filme_id');
  if (!filmeId) return;

  const sql = await db();
  const [filme] = (await sql`
    SELECT f.noite_id, n.status, n.prazo_votacao
    FROM filmes f JOIN noites n ON n.id = f.noite_id
    WHERE f.id = ${filmeId}
  `) as (Pick<Noite, 'status' | 'prazo_votacao'> & { noite_id: number })[];
  if (!filme || !votacaoAberta(filme)) return;

  await sql`
    INSERT INTO votos (noite_id, usuario_id, filme_id) VALUES (${filme.noite_id}, ${usuario.id}, ${filmeId})
    ON CONFLICT (noite_id, usuario_id) DO UPDATE SET filme_id = EXCLUDED.filme_id, criado_em = now()
  `;
  revalidatePath('/');
}

export async function removerVoto(fd: FormData) {
  const usuario = await exigirUsuario();
  const noiteId = idValido(fd, 'noite_id');
  if (!noiteId) return;

  const sql = await db();
  const [noite] = (await sql`SELECT status, prazo_votacao FROM noites WHERE id = ${noiteId}`) as Noite[];
  if (!noite || !votacaoAberta(noite)) return;

  await sql`DELETE FROM votos WHERE noite_id = ${noiteId} AND usuario_id = ${usuario.id}`;
  revalidatePath('/');
}
