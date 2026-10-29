'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function LinkNav({ href, exato, children }: { href: string; exato?: boolean; children: React.ReactNode }) {
  const caminho = usePathname();
  const ativo = exato ? caminho === href : caminho === href || caminho.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`border-b-2 px-2 py-1.5 font-titulo text-[0.7rem] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition sm:text-xs sm:tracking-[0.18em] ${
        ativo ? 'border-ouro text-ouro' : 'border-transparent text-marfim/70 hover:text-marfim'
      }`}
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
      <p className={`leading-relaxed whitespace-pre-line text-marfim/80 ${longa && !aberta ? 'line-clamp-4' : ''}`}>{texto}</p>
      {longa && (
        <button
          type="button"
          onClick={() => setAberta(!aberta)}
          className="mt-1 text-sm font-semibold text-ouro underline decoration-ouro/50 underline-offset-4 hover:text-ouro-claro"
        >
          {aberta ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>
      )}
    </div>
  );
}
