'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const [cortada, setCortada] = useState(false);
  const paragrafo = useRef<HTMLParagraphElement>(null);

  // O corte depende da largura da coluna (no celular é bem estreita), então mede o texto em vez de contar caracteres.
  useEffect(() => {
    const p = paragrafo.current;
    if (!p || aberta) return;
    const medir = () => setCortada(p.scrollHeight > p.clientHeight + 1);
    medir();
    document.fonts?.ready.then(medir);
    const observador = new ResizeObserver(medir);
    observador.observe(p);
    return () => observador.disconnect();
  }, [texto, aberta]);

  if (!texto) return null;
  return (
    <div>
      <p
        ref={paragrafo}
        className={`text-[0.9375rem] leading-relaxed whitespace-pre-line text-cinza ${aberta ? '' : 'line-clamp-4'}`}
      >
        {texto}
      </p>
      {(cortada || aberta) && (
        <button
          type="button"
          aria-expanded={aberta}
          onClick={() => setAberta(!aberta)}
          className="mt-1 text-sm font-semibold text-vermelho underline underline-offset-2 hover:text-vermelho-escuro"
        >
          {aberta ? 'Mostrar menos' : 'Ler sinopse completa'}
        </button>
      )}
    </div>
  );
}
