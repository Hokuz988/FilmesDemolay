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
    <TelaAutenticacao titulo="Entrar" subtitulo="Acesse para votar no filme da próxima noite.">
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
        <BotaoEnviar className="btn btn-primario w-full">Entrar</BotaoEnviar>
      </FormAcao>
      {process.env.CODIGO_CONVITE && (
        <p className="mt-6 text-center text-sm text-suave">
          Recebeu um convite?{' '}
          <Link href="/registrar" className="font-semibold text-ouro hover:text-ouro-claro">
            Criar conta
          </Link>
        </p>
      )}
    </TelaAutenticacao>
  );
}
