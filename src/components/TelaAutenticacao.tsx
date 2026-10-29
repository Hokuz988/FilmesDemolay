import { Divisor } from './Comuns';
import { Emblema, Estrela, VIRTUDES } from './Emblema';

export function TelaAutenticacao({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 border border-ouro/45 bg-painel shadow-[0_30px_70px_-30px_rgb(0_0_0/0.95)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Brasão: o emblema sob o céu do medalhão, com as sete virtudes */}
          <aside className="ceu flex items-center gap-4 border-b border-ouro/30 p-5 md:flex-col md:justify-center md:gap-0 md:border-r md:border-b-0 md:p-10 md:text-center">
            <Emblema className="w-16 shrink-0 drop-shadow-[0_0_22px_rgb(246_180_12/0.22)] md:w-44" />
            <div className="md:mt-7">
              <p className="font-ornamental text-2xl font-bold text-marfim md:text-4xl">Filminhos</p>
              <p className="mt-1.5 font-titulo text-xs font-bold tracking-[0.45em] text-ouro uppercase">DeMolay</p>
            </div>
            <div className="hidden w-full md:mt-8 md:block">
              <Divisor className="mx-auto max-w-[14rem]" />
              <ul className="mt-5 space-y-1.5 font-titulo text-[0.68rem] font-semibold tracking-[0.16em] text-marfim/75 uppercase">
                {VIRTUDES.map((virtude) => (
                  <li key={virtude}>{virtude}</li>
                ))}
              </ul>
            </div>
          </aside>
          <section className="p-6 sm:p-10">
            <p className="sobretitulo">Noite de filmes do capítulo</p>
            <h1 className="mt-2 font-titulo text-3xl font-bold sm:text-4xl">{titulo}</h1>
            {subtitulo && <p className="mt-2 text-nevoa">{subtitulo}</p>}
            <div className="contas my-6" aria-hidden="true" />
            {children}
          </section>
        </div>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center font-titulo text-[0.6rem] font-semibold tracking-[0.2em] text-nevoa uppercase md:hidden">
          {VIRTUDES.map((virtude, i) => (
            <span key={virtude} className="flex items-center gap-2.5">
              {i > 0 && <Estrela className="size-2 text-ouro/70" />}
              {virtude}
            </span>
          ))}
        </p>
      </div>
    </main>
  );
}
