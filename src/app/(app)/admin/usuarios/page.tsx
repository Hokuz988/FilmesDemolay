import {
  alterarPapel,
  alternarAtivo,
  criarUsuario,
  desconectarUsuario,
  excluirUsuario,
  redefinirSenha,
} from '@/app/acoes/admin';
import { Campo } from '@/components/Comuns';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { exigirAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Usuario } from '@/lib/tipos';

export const metadata = { title: 'Membros' };

function AcaoUsuario({
  acao,
  id,
  extra,
  children,
  className = 'btn btn-fantasma btn-pequeno',
  confirmar,
}: {
  acao: (fd: FormData) => Promise<void>;
  id: number;
  extra?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
  confirmar?: string;
}) {
  return (
    <form action={acao}>
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <BotaoEnviar className={className} confirmar={confirmar}>
        {children}
      </BotaoEnviar>
    </form>
  );
}

export default async function PaginaUsuarios() {
  const eu = await exigirAdmin();
  const sql = await db();
  const usuarios = (await sql`
    SELECT id, nome, login, papel, ativo, versao_sessao, bloqueado_ate FROM usuarios ORDER BY papel, nome
  `) as (Usuario & { bloqueado_ate: Date | null })[];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0">
        <h2 className="titulo-secao mb-4">Membros · {usuarios.length}</h2>
        <ul className="space-y-3">
          {usuarios.map((u) => {
            const souEu = u.id === eu.id;
            const bloqueado = u.bloqueado_ate && new Date(u.bloqueado_ate).getTime() > Date.now();
            return (
              <li key={u.id} className={`cartao p-4 ${u.ativo ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo text-lg font-bold text-marfim">
                      {u.nome} {souEu && <span className="font-texto text-sm font-normal text-nevoa italic">(você)</span>}
                    </p>
                    <p className="text-sm text-nevoa">@{u.login}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`selo ${u.papel === 'admin' ? 'border-ouro bg-ouro text-anil' : 'border-nevoa/50 text-nevoa'}`}>
                      {u.papel === 'admin' ? 'Admin' : 'Membro'}
                    </span>
                    {!u.ativo && <span className="selo border-nevoa/40 text-nevoa">Desativado</span>}
                    {bloqueado && <span className="selo border-rubi-vivo/70 text-alerta">Bloqueado</span>}
                  </div>
                </div>

                {!souEu && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-linha pt-3">
                    <AcaoUsuario acao={alterarPapel} id={u.id} extra={{ papel: u.papel === 'admin' ? 'membro' : 'admin' }}>
                      {u.papel === 'admin' ? 'Tornar membro' : 'Tornar admin'}
                    </AcaoUsuario>
                    <AcaoUsuario acao={alternarAtivo} id={u.id}>
                      {u.ativo ? 'Desativar' : 'Reativar'}
                    </AcaoUsuario>
                    <AcaoUsuario acao={desconectarUsuario} id={u.id}>
                      Desconectar
                    </AcaoUsuario>
                    <AcaoUsuario
                      acao={excluirUsuario}
                      id={u.id}
                      className="btn btn-perigo btn-pequeno"
                      confirmar={`Excluir a conta de ${u.nome}? Os votos dessa pessoa também serão apagados.`}
                    >
                      Excluir
                    </AcaoUsuario>
                    <details className="w-full">
                      <summary className="cursor-pointer font-titulo text-[0.7rem] font-bold tracking-[0.16em] text-nevoa uppercase hover:text-ouro">
                        Redefinir senha
                      </summary>
                      <FormAcao acao={redefinirSenha} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          name="senha"
                          type="password"
                          required
                          minLength={8}
                          maxLength={72}
                          autoComplete="new-password"
                          placeholder="Nova senha (mín. 8)"
                          className="campo sm:flex-1"
                        />
                        <BotaoEnviar className="btn btn-ouro">Redefinir</BotaoEnviar>
                      </FormAcao>
                    </details>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="cartao order-first h-fit p-5 sm:p-6 lg:order-none">
        <h2 className="titulo-secao">Novo membro</h2>
        <p className="mt-2 text-sm text-nevoa">Envie o usuário e a senha para a pessoa; ela pode trocar a senha em “Minha conta”.</p>
        <FormAcao acao={criarUsuario} className="mt-5 space-y-4">
          <Campo rotulo="Nome">
            <input name="nome" required maxLength={80} className="campo" />
          </Campo>
          <Campo rotulo="Usuário" dica="Sem espaços nem acentos: letras, números, ponto, hífen ou _. Ex.: joao.silva">
            <input name="login" required maxLength={32} autoCapitalize="none" autoComplete="off" className="campo" />
          </Campo>
          <Campo rotulo="Senha inicial" dica="Mínimo de 8 caracteres.">
            <input name="senha" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="campo" />
          </Campo>
          <Campo rotulo="Permissão">
            <select name="papel" defaultValue="membro" className="campo">
              <option value="membro">Membro (pode votar)</option>
              <option value="admin">Administrador (controle total)</option>
            </select>
          </Campo>
          <BotaoEnviar className="btn btn-primario w-full">Criar membro</BotaoEnviar>
        </FormAcao>
      </section>
    </div>
  );
}
