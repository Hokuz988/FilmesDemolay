import Link from 'next/link';
import { Emblema } from '@/components/Emblema';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="flex max-w-lg flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        <Emblema className="w-24 shrink-0" />
        <div>
          <p className="text-sm font-bold text-vermelho">Erro 404</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight font-stretch-expanded">Página não encontrada</h1>
          <p className="mt-2 text-cinza">O endereço pode estar errado ou a página foi removida.</p>
          <Link href="/" className="btn btn-marinho mt-5">
            Voltar para a votação
          </Link>
        </div>
      </div>
    </main>
  );
}
