import Link from 'next/link';
import { sair } from '@/app/acoes/conta';
import { Cruz, Estrela, Marca, VIRTUDES } from '@/components/Emblema';
import { LinkNav } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-abismo/90">
        <p className="flex items-center justify-center gap-2.5 border-b border-ouro/15 py-1.5 font-titulo text-[0.58rem] font-semibold tracking-[0.2em] text-ouro/80 uppercase sm:text-[0.65rem] sm:tracking-[0.32em]">
          <Estrela className="size-2" />
          Ordem DeMolay
          <Estrela className="size-2" />
          Noite de filmes do capítulo
          <Estrela className="size-2" />
        </p>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Início" className="shrink-0">
            <Marca />
          </Link>
          <div className="flex items-center gap-4 sm:order-last">
            <span className="hidden text-nevoa md:inline">
              Olá, <span className="text-marfim">{primeiroNome}</span>
            </span>
            <form action={sair}>
              <button type="submit" className="btn btn-fantasma btn-pequeno">
                Sair
              </button>
            </form>
          </div>
          <nav className="-mx-2 flex w-full gap-1 overflow-x-auto sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center sm:gap-4">
            <LinkNav href="/" exato>
              Votação
            </LinkNav>
            {usuario.papel === 'admin' && <LinkNav href="/admin">Painel admin</LinkNav>}
            <LinkNav href="/conta">Minha conta</LinkNav>
          </nav>
        </div>
        <div className="border-t border-ouro/40" />
        <div className="contas" aria-hidden="true" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-16 sm:px-6 sm:pt-12">{children}</main>

      <footer className="border-t border-ouro/25 bg-abismo/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
          <Cruz className="mx-auto w-9" />
          <p className="mt-3 font-titulo text-xs font-bold tracking-[0.3em] text-ouro uppercase">Filminhos DeMolay</p>
          <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-nevoa">
            {VIRTUDES.map((virtude, i) => (
              <li key={virtude} className="flex items-center gap-3">
                {i > 0 && <Estrela className="size-2 text-ouro/60" />}
                {virtude}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
