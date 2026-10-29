import { alterarSenha, sair } from '@/app/acoes/conta';
import { Campo } from '@/components/Comuns';
import { BotaoEnviar, FormAcao } from '@/components/Formularios';
import { exigirUsuario } from '@/lib/auth';

export const metadata = { title: 'Minha conta' };

export default async function PaginaConta() {
  const usuario = await exigirUsuario();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="sobretitulo">Ficha do membro</p>
        <h1 className="mt-1 font-titulo text-3xl font-bold sm:text-4xl">Minha conta</h1>
      </div>

      <section className="cartao p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="rotulo">Nome</dt>
            <dd className="font-titulo text-lg font-bold">{usuario.nome}</dd>
          </div>
          <div className="min-w-0">
            <dt className="rotulo">Usuário</dt>
            <dd className="text-marfim/85">@{usuario.login}</dd>
          </div>
          <div>
            <dt className="rotulo">Permissão</dt>
            <dd>
              <span className={`selo ${usuario.papel === 'admin' ? 'border-ouro bg-ouro text-anil' : 'border-nevoa/50 text-nevoa'}`}>
                {usuario.papel === 'admin' ? 'Administrador' : 'Membro'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="cartao p-5 sm:p-6">
        <h2 className="titulo-secao">Alterar senha</h2>
        <FormAcao acao={alterarSenha} className="mt-5 space-y-4">
          <Campo rotulo="Senha atual">
            <input name="atual" type="password" required autoComplete="current-password" className="campo" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nova senha" dica="Mínimo de 8 caracteres.">
              <input name="nova" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="campo" />
            </Campo>
            <Campo rotulo="Confirmar nova senha">
              <input name="confirmar" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="campo" />
            </Campo>
          </div>
          <BotaoEnviar>Salvar nova senha</BotaoEnviar>
        </FormAcao>
      </section>

      <form action={sair}>
        <button type="submit" className="btn btn-perigo w-full sm:w-auto">
          Sair desta conta
        </button>
      </form>
    </div>
  );
}
