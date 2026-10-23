import { Marca } from './Coroa';

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
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Marca tamanho="grande" />
      </div>
      <div className="cartao w-full max-w-md p-6 sm:p-8">
        <h1 className="font-titulo text-2xl font-bold text-texto">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-suave">{subtitulo}</p>}
        <div className="filete my-5" />
        {children}
      </div>
      <p className="mt-8 text-center text-xs text-suave/60">Noite de Filmes do Capítulo · Amor Filial, Reverência, Cortesia</p>
    </main>
  );
}
