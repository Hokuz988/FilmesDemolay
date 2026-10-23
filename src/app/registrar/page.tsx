import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { registrar } from '@/app/acoes/conta';
import { CamposCadastro } from '@/components/CamposCadastro';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { TelaAutenticacao } from '@/components/TelaAutenticacao';
import { usuarioAtual } from '@/lib/auth';

export const metadata = { title: 'Criar conta' };

export default async function PaginaRegistrar() {
  if (!process.env.CODIGO_CONVITE) notFound();
  if (await usuarioAtual()) redirect('/');

  return (
    <TelaAutenticacao titulo="Criar conta" subtitulo="Use o código de convite enviado pelo capítulo.">
      <FormAcao acao={registrar} className="space-y-4">
        <CamposCadastro rotuloCodigo="Código de convite" />
        <BotaoEnviar className="btn btn-primario w-full py-3">Criar conta</BotaoEnviar>
      </FormAcao>
      <p className="mt-6 text-sm text-suave">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-vermelho underline underline-offset-2 hover:text-vermelho-vivo">
          Entrar
        </Link>
      </p>
    </TelaAutenticacao>
  );
}
