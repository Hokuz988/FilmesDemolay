import Link from 'next/link';
import { sair } from '@/app/acoes/conta';
import { Emblema, Marca } from '@/components/Emblema';
import { LinkNav } from '@/components/Interativos';
import { exigirUsuario } from '@/lib/auth';

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b-4 border-double border-dourado bg-vermelho-escuro text-papel">
        <p className="border-b border-dourado/25 py-1.5 text-center font-letreiro text-[0.6rem] tracking-[0.35em] text-dourado/80 uppercase sm:text-[0.65rem]">
          Ordem DeMolay · Noite de filmes do capítulo
        </p>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Início">
            <Marca />
          </Link>
          <div className="flex items-center gap-4 sm:order-last">
            <span className="hidden font-maquina text-sm text-papel/70 md:inline">Olá, {primeiroNome}</span>
            <form action={sair}>
              <button
                type="submit"
                className="btn btn-pequeno border border-dourado/50 text-dourado hover:bg-dourado hover:text-vermelho-escuro"
              >
                Sair
              </button>
            </form>
          </div>
          <nav className="-mx-2 flex w-full gap-3 overflow-x-auto sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center sm:gap-5">
            <LinkNav href="/" exato>
              Votação
            </LinkNav>
            {usuario.papel === 'admin' && <LinkNav href="/admin">Painel admin</LinkNav>}
            <LinkNav href="/conta">Minha conta</LinkNav>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-16 sm:px-6 sm:pt-12">{children}</main>

      <footer className="border-t-[3px] border-double border-tinta/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="flex items-center gap-2 font-letreiro text-xs tracking-[0.2em] text-suave uppercase">
            <Emblema className="w-6 text-vermelho" detalhe="var(--color-papel)" />
            Filminhos DeMoleycos
          </span>
          <span className="font-maquina text-xs text-suave">Pipoca por conta do capítulo.</span>
        </div>
      </footer>
    </div>
  );
}
