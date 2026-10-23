import Link from 'next/link';
import { Emblema } from '@/components/Emblema';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Emblema className="w-20 text-vermelho" detalhe="var(--color-papel)" />
      <p className="font-maquina text-sm tracking-[0.2em] text-vermelho">ERRO 404</p>
      <h1 className="font-titulo text-4xl font-black">Fim do rolo</h1>
      <p className="text-suave">Essa página se perdeu na sala de projeção.</p>
      <Link href="/" className="btn btn-primario mt-2">
        Voltar ao início
      </Link>
    </main>
  );
}
