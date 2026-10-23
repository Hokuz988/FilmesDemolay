import Link from 'next/link';
import { redirect } from 'next/navigation';
import { entrar } from '@/app/acoes/conta';
import { Campo } from '@/components/Comuns';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { TelaAutenticacao } from '@/components/TelaAutenticacao';
import { usuarioAtual } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Entrar' };

export default async function PaginaLogin() {
  if (await usuarioAtual()) redirect('/');
  const sql = await db();
  const [{ total }] = (await sql`SELECT COUNT(*)::int AS total FROM usuarios`) as { total: number }[];
  if (total === 0) redirect('/setup');

  return (
    <TelaAutenticacao titulo="Entrar" subtitulo="Apresente seu ingresso para votar no filme da próxima sessão.">
      <FormAcao acao={entrar} className="space-y-4">
        <Campo rotulo="Usuário">
          <input name="login" required autoComplete="username" autoCapitalize="none" className="campo" />
        </Campo>
        <Campo rotulo="Senha">
          <input name="senha" type="password" required autoComplete="current-password" className="campo" />
        </Campo>
        <label className="flex items-center gap-2 text-sm text-suave">
          <input type="checkbox" name="lembrar" defaultChecked className="size-4 accent-vermelho" />
          Manter conectado neste dispositivo
        </label>
        <BotaoEnviar className="btn btn-primario w-full py-3">Entrar</BotaoEnviar>
      </FormAcao>
      {process.env.CODIGO_CONVITE && (
        <p className="mt-6 text-sm text-suave">
          Ainda não tem conta?{' '}
          <Link href="/registrar" className="font-semibold text-vermelho underline underline-offset-2 hover:text-vermelho-vivo">
            Criar conta com o código de convite
          </Link>
        </p>
      )}
    </TelaAutenticacao>
  );
}
