'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { encerrarSessao, exigirUsuario, iniciarSessao, sessaoLembrada } from '@/lib/auth';
import {
  REGEX_LOGIN,
  codigoConfere,
  conferirSenha,
  hashSenha,
  texto,
  validarSenha,
} from '@/lib/seguranca';
import type { Estado } from '@/lib/tipos';

const MAX_TENTATIVAS = 5;

interface LinhaLogin {
  id: number;
  senha_hash: string;
  ativo: boolean;
  versao_sessao: number;
  bloqueado_ate: Date | null;
}

export async function entrar(_: Estado, fd: FormData): Promise<Estado> {
  const login = texto(fd, 'login', 32).toLowerCase();
  const senha = String(fd.get('senha') ?? '').slice(0, 200);
  const lembrar = fd.get('lembrar') === 'on';
  if (!login || !senha) return { erro: 'Informe usuário e senha.' };

  const sql = await db();
  const [usuario] = (await sql`
    SELECT id, senha_hash, ativo, versao_sessao, bloqueado_ate FROM usuarios WHERE login = ${login}
  `) as LinhaLogin[];

  if (usuario?.bloqueado_ate && new Date(usuario.bloqueado_ate).getTime() > Date.now()) {
    return { erro: 'Muitas tentativas incorretas. Aguarde 15 minutos e tente novamente.' };
  }

  const senhaCorreta = await conferirSenha(senha, usuario?.senha_hash);
  if (!usuario || !senhaCorreta) {
    if (usuario) {
      // Após 5 erros seguidos, a conta fica bloqueada por 15 minutos.
      await sql`
        UPDATE usuarios SET
          bloqueado_ate = CASE WHEN tentativas_falhas + 1 >= ${MAX_TENTATIVAS}
            THEN now() + interval '15 minutes' ELSE bloqueado_ate END,
          tentativas_falhas = CASE WHEN tentativas_falhas + 1 >= ${MAX_TENTATIVAS}
            THEN 0 ELSE tentativas_falhas + 1 END
        WHERE id = ${usuario.id}
      `;
    }
    return { erro: 'Usuário ou senha incorretos.' };
  }
  if (!usuario.ativo) return { erro: 'Sua conta está desativada. Fale com um administrador.' };

  await sql`UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = ${usuario.id}`;
  await iniciarSessao(usuario, lembrar);
  redirect('/');
}

export async function sair() {
  await encerrarSessao();
  redirect('/login');
}

function validarCadastro(fd: FormData) {
  const nome = texto(fd, 'nome', 80);
  const login = texto(fd, 'login', 32).toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  if (!nome) return { erro: 'Informe seu nome.' };
  if (!REGEX_LOGIN.test(login)) {
    return { erro: 'Usuário inválido: use de 3 a 32 caracteres, sem espaços nem acentos (letras, números, ponto, hífen ou _). Ex.: joao.silva' };
  }
  const erroSenha = validarSenha(senha);
  if (erroSenha) return { erro: erroSenha };
  if (senha !== String(fd.get('confirmar') ?? '')) return { erro: 'As senhas não conferem.' };
  return { nome, login, senha };
}

export async function configurarInicial(_: Estado, fd: FormData): Promise<Estado> {
  if (!process.env.CODIGO_SETUP) return { erro: 'Defina a variável CODIGO_SETUP na Vercel antes de continuar.' };
  if (!codigoConfere(texto(fd, 'codigo'), process.env.CODIGO_SETUP)) return { erro: 'Código de configuração incorreto.' };
  const dados = validarCadastro(fd);
  if ('erro' in dados) return dados;

  const sql = await db();
  const senhaHash = await hashSenha(dados.senha);
  const [criado] = (await sql`
    INSERT INTO usuarios (nome, login, senha_hash, papel)
    SELECT ${dados.nome}, ${dados.login}, ${senhaHash}, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM usuarios)
    RETURNING id, versao_sessao
  `) as { id: number; versao_sessao: number }[];
  if (!criado) return { erro: 'O sistema já foi configurado. Faça login.' };

  await iniciarSessao(criado, true);
  redirect('/admin');
}

export async function registrar(_: Estado, fd: FormData): Promise<Estado> {
  if (!codigoConfere(texto(fd, 'codigo'), process.env.CODIGO_CONVITE)) {
    return { erro: 'Código de convite incorreto.' };
  }
  const dados = validarCadastro(fd);
  if ('erro' in dados) return dados;

  const sql = await db();
  const senhaHash = await hashSenha(dados.senha);
  const [criado] = (await sql`
    INSERT INTO usuarios (nome, login, senha_hash) VALUES (${dados.nome}, ${dados.login}, ${senhaHash})
    ON CONFLICT (login) DO NOTHING
    RETURNING id, versao_sessao
  `) as { id: number; versao_sessao: number }[];
  if (!criado) return { erro: 'Esse nome de usuário já está em uso.' };

  await iniciarSessao(criado, true);
  redirect('/');
}

export async function alterarSenha(_: Estado, fd: FormData): Promise<Estado> {
  const usuario = await exigirUsuario();
  const atual = String(fd.get('atual') ?? '');
  const nova = String(fd.get('nova') ?? '');
  const erroSenha = validarSenha(nova);
  if (erroSenha) return { erro: erroSenha };
  if (nova !== String(fd.get('confirmar') ?? '')) return { erro: 'As senhas novas não conferem.' };

  const sql = await db();
  const [linha] = (await sql`SELECT senha_hash FROM usuarios WHERE id = ${usuario.id}`) as { senha_hash: string }[];
  if (!(await conferirSenha(atual, linha?.senha_hash))) return { erro: 'Senha atual incorreta.' };

  // Trocar a senha desconecta os outros dispositivos.
  const [atualizado] = (await sql`
    UPDATE usuarios SET senha_hash = ${await hashSenha(nova)}, versao_sessao = versao_sessao + 1
    WHERE id = ${usuario.id} RETURNING id, versao_sessao
  `) as { id: number; versao_sessao: number }[];
  await iniciarSessao(atualizado, await sessaoLembrada());
  return { ok: 'Senha alterada. Outros dispositivos foram desconectados.' };
}
