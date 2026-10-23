import { LinkNav } from '@/components/Interativos';
import { exigirAdmin } from '@/lib/auth';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b-[3px] border-double border-tinta/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-maquina text-xs tracking-[0.2em] text-vermelho uppercase">Cabine de projeção</p>
          <h1 className="font-titulo text-3xl font-black sm:text-4xl">Painel do administrador</h1>
        </div>
        <nav className="flex gap-4">
          <LinkNav href="/admin" exato tom="claro">
            Noites de filme
          </LinkNav>
          <LinkNav href="/admin/usuarios" tom="claro">
            Membros
          </LinkNav>
        </nav>
      </div>
      {children}
    </div>
  );
}
