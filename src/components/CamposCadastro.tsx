import { Campo } from './Comuns';

export function CamposCadastro({ rotuloCodigo, dicaCodigo }: { rotuloCodigo: string; dicaCodigo?: string }) {
  return (
    <>
      <Campo rotulo="Nome">
        <input name="nome" required maxLength={80} autoComplete="name" className="campo" />
      </Campo>
      <Campo rotulo="Usuário" dica="Sem espaços nem acentos: letras, números, ponto, hífen ou _ (3 a 32). Ex.: joao.silva">
        <input
          name="login"
          required
          maxLength={32}
          autoComplete="username"
          autoCapitalize="none"
          className="campo"
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Senha" dica="Mínimo de 8 caracteres.">
          <input name="senha" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="campo" />
        </Campo>
        <Campo rotulo="Confirmar senha">
          <input name="confirmar" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="campo" />
        </Campo>
      </div>
      <Campo rotulo={rotuloCodigo} dica={dicaCodigo}>
        <input name="codigo" type="text" required autoComplete="off" autoCapitalize="none" spellCheck={false} className="campo" />
      </Campo>
    </>
  );
}
