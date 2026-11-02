import { LinkNav } from '@/components/Interativos';
import { exigirAdmin } from '@/lib/auth';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-linha sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-black tracking-tight font-stretch-expanded sm:pb-3 sm:text-3xl">Administração</h1>
        <nav className="-mx-2.5 -mb-px flex gap-1 sm:mx-0">
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
