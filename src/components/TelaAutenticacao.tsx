import { Emblema, Marca, Virtudes } from './Emblema';

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
        <div className="grid grid-cols-1 overflow-hidden rounded-[4px] border border-linha bg-white shadow-[0_24px_60px_-34px_rgb(35_45_69/0.5)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <aside className="flex items-center gap-5 bg-marinho px-5 py-6 md:flex-col md:justify-center md:gap-9 md:px-10 md:py-14">
            <Emblema className="w-16 shrink-0 md:w-40" />
            <Marca claro className="text-[1.45rem] md:text-[2.1rem]" />
          </aside>
          <section className="p-6 sm:p-10">
            <h1 className="text-3xl font-black tracking-tight font-stretch-expanded">{titulo}</h1>
            {subtitulo && <p className="mt-2 text-cinza">{subtitulo}</p>}
            <div className="mt-8">{children}</div>
          </section>
        </div>
        <Virtudes className="mx-auto mt-5 max-w-2xl text-center text-sm text-balance text-cinza" />
      </div>
    </main>
  );
}
