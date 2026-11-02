import Link from 'next/link';
import { sair } from '@/app/acoes/conta';
import { Emblema, Marca, Virtudes } from '@/components/Emblema';
import { LinkNav } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-linha bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 px-4 pt-3 sm:flex-nowrap sm:px-6 sm:py-3">
          <Link href="/" aria-label="Filminhos DeMolay, início" className="shrink-0">
            <Marca className="text-[1.4rem] sm:text-[1.6rem]" />
          </Link>
          <nav className="order-last -mx-2.5 mt-1.5 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:mt-0 sm:w-auto sm:flex-1">
            <LinkNav href="/" exato>
              Votação
            </LinkNav>
            {usuario.papel === 'admin' && <LinkNav href="/admin">Admin</LinkNav>}
            <LinkNav href="/conta">Minha conta</LinkNav>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-cinza md:inline">{primeiroNome}</span>
            <form action={sair}>
              <button type="submit" className="btn btn-contorno btn-pequeno">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">{children}</main>

      <footer className="border-t border-linha">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Emblema className="w-9 shrink-0" />
            <div className="leading-snug">
              <p className="font-bold">Filminhos DeMolay</p>
              <p className="text-sm text-cinza">Noite de filmes do capítulo</p>
            </div>
          </div>
          <Virtudes className="max-w-xl text-sm text-balance text-cinza sm:text-right" />
        </div>
      </footer>
    </div>
  );
}
