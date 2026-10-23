import Link from 'next/link';
import { sair } from '@/app/acoes/conta';
import { Marca } from '@/components/Coroa';
import { LinkNav } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-borda/70 bg-fundo/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Início">
            <Marca />
          </Link>
          <div className="flex items-center gap-3 sm:order-last">
            <span className="hidden text-sm text-suave md:inline">
              Olá, <strong className="text-texto">{primeiroNome}</strong>
            </span>
            <form action={sair}>
              <button type="submit" className="btn btn-fantasma btn-pequeno">
                Sair
              </button>
            </form>
          </div>
          <nav className="-mx-1 flex w-full gap-1 overflow-x-auto sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center">
            <LinkNav href="/" exato>
              Votação
            </LinkNav>
            {usuario.papel === 'admin' && <LinkNav href="/admin">Painel admin</LinkNav>}
            <LinkNav href="/conta">Minha conta</LinkNav>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">{children}</main>

      <footer className="border-t border-borda/60 py-6 text-center text-xs text-suave/60">
        Filminhos DeMoleycos · Noite de Filmes do Capítulo
      </footer>
    </div>
  );
}
