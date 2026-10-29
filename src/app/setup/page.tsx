import { redirect } from 'next/navigation';
import { configurarInicial } from '@/app/acoes/conta';
import { CamposCadastro } from '@/components/CamposCadastro';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { TelaAutenticacao } from '@/components/TelaAutenticacao';
import { db } from '@/lib/db';

export const metadata = { title: 'Configuração inicial' };

export default async function PaginaSetup() {
  const sql = await db();
  const [{ total }] = (await sql`SELECT COUNT(*)::int AS total FROM usuarios`) as { total: number }[];
  if (total > 0) redirect('/login');

  return (
    <TelaAutenticacao titulo="Configuração inicial" subtitulo="Crie a conta do primeiro administrador.">
      {!process.env.CODIGO_SETUP ? (
        <p className="border-l-2 border-ouro bg-ouro/10 p-4">
          Defina a variável de ambiente <code className="font-mono text-sm text-ouro-claro">CODIGO_SETUP</code> no painel da Vercel e
          faça um novo deploy para continuar.
        </p>
      ) : (
        <FormAcao acao={configurarInicial} className="space-y-4">
          <CamposCadastro rotuloCodigo="Código de configuração" dicaCodigo="O valor de CODIGO_SETUP definido na Vercel." />
          <BotaoEnviar className="btn btn-primario w-full py-3">Criar administrador</BotaoEnviar>
        </FormAcao>
      )}
    </TelaAutenticacao>
  );
}
