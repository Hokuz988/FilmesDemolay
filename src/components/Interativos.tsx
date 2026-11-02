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
      className={`border-b-[3px] px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
        ativo ? 'border-vermelho text-marinho' : 'border-transparent text-cinza hover:text-marinho'
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
      <p className={`text-[0.9375rem] leading-relaxed whitespace-pre-line text-cinza ${longa && !aberta ? 'line-clamp-4' : ''}`}>
        {texto}
      </p>
      {longa && (
        <button
          type="button"
          onClick={() => setAberta(!aberta)}
          className="mt-1 text-sm font-semibold text-vermelho underline underline-offset-2 hover:text-vermelho-escuro"
        >
          {aberta ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>
      )}
    </div>
  );
}
