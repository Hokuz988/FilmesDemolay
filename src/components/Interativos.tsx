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
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
        ativo ? 'bg-vermelho/20 text-ouro-claro ring-1 ring-vermelho/50' : 'text-suave hover:bg-white/5 hover:text-texto'
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
      <p className={`whitespace-pre-line text-sm leading-relaxed text-suave ${longa && !aberta ? 'line-clamp-4' : ''}`}>
        {texto}
      </p>
      {longa && (
        <button
          type="button"
          onClick={() => setAberta(!aberta)}
          className="mt-1 text-xs font-semibold text-ouro hover:text-ouro-claro"
        >
          {aberta ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>
      )}
    </div>
  );
}
