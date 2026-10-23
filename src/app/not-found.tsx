import Link from 'next/link';
import { Coroa } from '@/components/Coroa';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Coroa className="w-16 text-ouro" />
      <h1 className="font-titulo text-3xl font-bold">Página não encontrada</h1>
      <p className="text-suave">Esse rolo de filme se perdeu no caminho.</p>
      <Link href="/" className="btn btn-primario">
        Voltar ao início
      </Link>
    </main>
  );
}
