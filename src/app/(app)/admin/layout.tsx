import { LinkNav } from '@/components/Interativos';
import { exigirAdmin } from '@/lib/auth';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-ouro/30 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="sobretitulo">Secretaria do capítulo</p>
          <h1 className="mt-1 font-titulo text-2xl font-bold sm:text-4xl">Painel do administrador</h1>
        </div>
        <nav className="-mx-2 flex gap-1 sm:mx-0 sm:gap-3">
          <LinkNav href="/admin" exato>
            Noites de filme
          </LinkNav>
          <LinkNav href="/admin/usuarios">Membros</LinkNav>
        </nav>
      </div>
      {children}
    </div>
  );
}
