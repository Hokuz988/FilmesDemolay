import { randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';
import { ErroUsuario } from './tipos';

const TAMANHO_MAXIMO = 4 * 1024 * 1024;

const EXTENSOES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

/** Envia a capa para o Vercel Blob e retorna a URL pública. */
export async function salvarCapa(arquivo: File) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new ErroUsuario('Upload de imagens não configurado (Vercel Blob). Use um link para a capa.');
  }
  const extensao = EXTENSOES[arquivo.type];
  if (!extensao) throw new ErroUsuario('Formato de imagem não aceito. Use JPG, PNG, WEBP, AVIF ou GIF.');
  if (arquivo.size > TAMANHO_MAXIMO) throw new ErroUsuario('A imagem deve ter no máximo 4 MB.');

  const { url } = await put(`capas/${randomUUID()}.${extensao}`, arquivo, {
    access: 'public',
    contentType: arquivo.type,
  });
  return url;
}

export function validarLinkCapa(link: string) {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new ErroUsuario('Link da capa inválido.');
  }
  if (url.protocol !== 'https:') throw new ErroUsuario('O link da capa deve começar com https://');
  return url.toString();
}

/** Remove do Blob uma capa que foi enviada por upload (links externos são ignorados). */
export async function apagarCapa(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN || !url.includes('.blob.vercel-storage.com')) return;
  try {
    await del(url);
  } catch {
    // Não impede a operação principal se a imagem já não existir.
  }
}
