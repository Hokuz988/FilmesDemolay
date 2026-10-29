import Link from 'next/link';
import { Divisor } from '@/components/Comuns';
import { Emblema } from '@/components/Emblema';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Emblema className="w-28 drop-shadow-[0_0_22px_rgb(246_180_12/0.25)]" />
      <p className="sobretitulo mt-8">Erro 404</p>
      <h1 className="mt-2 font-titulo text-3xl font-bold sm:text-4xl">Página não encontrada</h1>
      <Divisor className="mt-5 w-48" />
      <p className="mt-5 max-w-sm text-nevoa">Esta página não consta nos registros do capítulo.</p>
      <Link href="/" className="btn btn-primario mt-8">
        Voltar ao início
      </Link>
    </main>
  );
}
