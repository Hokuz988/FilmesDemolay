'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Estado } from '@/lib/tipos';

export function FormAcao({
  acao,
  children,
  className,
}: {
  acao: (estado: Estado, fd: FormData) => Promise<Estado>;
  children: React.ReactNode;
  className?: string;
}) {
  const [estado, enviar] = useActionState(acao, undefined);
  return (
    <form action={enviar} className={className}>
      {children}
      {estado?.erro && (
        <p role="alert" className="border-l-2 border-rubi-vivo bg-rubi/15 px-3 py-2 text-sm text-alerta">
          {estado.erro}
        </p>
      )}
      {estado?.ok && (
        <p role="status" className="border-l-2 border-ouro bg-ouro/10 px-3 py-2 text-sm text-ouro-claro">
          {estado.ok}
        </p>
      )}
    </form>
  );
}

export function BotaoEnviar({
  children,
  className = 'btn btn-primario',
  confirmar,
}: {
  children: React.ReactNode;
  className?: string;
  /** Mensagem de confirmação exibida antes de enviar. */
  confirmar?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {pending && (
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
