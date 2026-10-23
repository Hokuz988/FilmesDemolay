import { Emblema } from './Emblema';

const VIRTUDES = ['Amor Filial', 'Reverência', 'Cortesia', 'Companheirismo', 'Fidelidade', 'Pureza', 'Patriotismo'];

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
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        {/* Ingresso: canhoto vermelho + corpo */}
        <div className="grid border-[3px] border-double border-tinta bg-cartao shadow-[0_24px_50px_-28px_rgb(29_23_21/0.6)] sm:grid-cols-[220px_1fr]">
          <aside className="flex items-center gap-4 border-b-2 border-dashed border-dourado/60 bg-vermelho-escuro p-5 text-papel sm:flex-col sm:justify-between sm:border-r-2 sm:border-b-0 sm:p-7 sm:text-center">
            <Emblema className="w-16 shrink-0 text-dourado sm:w-32" />
            <div>
              <p className="font-titulo text-2xl font-bold italic sm:text-3xl">Filminhos</p>
              <p className="mt-1 font-letreiro text-xs tracking-[0.4em] text-dourado uppercase">DeMolay</p>
            </div>
            <p className="hidden font-maquina text-xs leading-relaxed text-dourado/80 sm:block">
              ADMISSÃO
              <br />
              Nº 0001
            </p>
          </aside>
          <section className="p-6 sm:p-9">
            <p className="font-maquina text-xs tracking-[0.2em] text-vermelho uppercase">Noite de filmes do capítulo</p>
            <h1 className="mt-1 font-titulo text-3xl font-black sm:text-4xl">{titulo}</h1>
            {subtitulo && <p className="mt-2 text-sm text-suave">{subtitulo}</p>}
            <div className="my-6 border-t border-dashed border-linha" />
            {children}
          </section>
        </div>
        <p className="mt-6 text-center font-letreiro text-[0.65rem] leading-loose tracking-[0.25em] text-suave uppercase">
          {VIRTUDES.join(' · ')}
        </p>
      </div>
    </main>
  );
}
