'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function LinkNav({
  href,
  exato,
  tom = 'escuro',
  children,
}: {
  href: string;
  exato?: boolean;
  /** "escuro" para o cabeçalho vermelho, "claro" para fundo de papel. */
  tom?: 'escuro' | 'claro';
  children: React.ReactNode;
}) {
  const caminho = usePathname();
  const ativo = exato ? caminho === href : caminho === href || caminho.startsWith(`${href}/`);
  const cores =
    tom === 'escuro'
      ? ativo
        ? 'border-dourado text-dourado'
        : 'border-transparent text-papel/75 hover:text-papel'
      : ativo
        ? 'border-vermelho text-tinta'
        : 'border-transparent text-suave hover:text-tinta';
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`border-b-2 px-2 py-1.5 font-letreiro text-sm tracking-[0.16em] whitespace-nowrap uppercase transition ${cores}`}
    >
      {children}
    </Link>
  );
}

export function Sinopse({ texto }: { texto: string }) {
  const [aberta, setAberta] = useState(false);
  if (!texto) return null;
  const longa = texto.length > 180;
  return (
    <div>
      <p className={`text-sm leading-relaxed whitespace-pre-line text-tinta/80 ${longa && !aberta ? 'line-clamp-4' : ''}`}>
        {texto}
      </p>
      {longa && (
        <button
          type="button"
          onClick={() => setAberta(!aberta)}
          className="mt-1 text-xs font-semibold text-vermelho underline underline-offset-2 hover:text-vermelho-vivo"
        >
          {aberta ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>
      )}
    </div>
  );
}
