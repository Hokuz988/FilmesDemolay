import { LinkNav } from '@/components/Interativos';
import { exigirAdmin } from '@/lib/auth';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-titulo text-xs tracking-[0.3em] text-ouro uppercase">Administração</p>
          <h1 className="font-titulo text-2xl font-bold sm:text-3xl">Painel de controle</h1>
        </div>
        <nav className="flex gap-1 rounded-xl border border-borda bg-painel/80 p-1">
          <LinkNav href="/admin" exato>
            Noites de filme
          </LinkNav>
          <LinkNav href="/admin/usuarios">Usuários</LinkNav>
        </nav>
      </div>
      {children}
    </div>
  );
}
