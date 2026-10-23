# Filminhos DeMolay 🎬👑

Sistema de votação para a noite de filmes do capítulo. Feito em Next.js, com banco Postgres (Neon) e upload das capas no Vercel Blob, pronto para hospedar na Vercel.

## Funcionalidades

**Membros**
- Login com opção “manter conectado” (30 dias) ou sessão curta (12 horas).
- Página de votação com capa, nome, duração e sinopse de cada filme, e um passo a passo de como votar.
- 1 voto por pessoa; dá para trocar ou remover o voto enquanto a votação estiver aberta.
- Quando a votação encerra, aparece o resultado com o filme vencedor.
- Troca da própria senha em “Minha conta”.

**Administradores** (`/admin`)
- Criar noites de filme (título, descrição, data da sessão, prazo da votação).
- Adicionar, editar e excluir filmes: nome, duração, sinopse e capa (upload ou link).
- Abrir, encerrar, reabrir a votação ou voltar a noite para rascunho; zerar votos.
- Ver o resultado ao vivo, quem votou em qual filme e quem ainda não votou.
- Gerenciar usuários: criar, promover a admin / rebaixar a membro, desativar, desconectar de todos os dispositivos, redefinir senha e excluir.

## Segurança

- Senhas guardadas com **bcrypt** (custo 12). Nenhuma senha é armazenada em texto.
- Login em cookie **httpOnly + Secure + SameSite**, assinado com **JWT HS256**.
- Permissões conferidas no banco **a cada requisição**: desativar, rebaixar ou trocar a senha de alguém derruba a sessão na hora.
- Bloqueio de 15 minutos após 5 senhas erradas seguidas; mensagens de erro não revelam se o usuário existe.
- Todas as ações de admin conferem a permissão no servidor; as Server Actions do Next já protegem contra CSRF.
- Consultas SQL parametrizadas (sem risco de SQL injection).
- Cabeçalhos de segurança (HSTS, anti-clickjacking, nosniff). A Vercel serve tudo por HTTPS.
- Upload só aceita imagens (JPG, PNG, WEBP, AVIF, GIF) de até 4 MB.

## Publicando na Vercel

1. Envie esta pasta para um repositório no GitHub e importe o projeto na [Vercel](https://vercel.com/new).
2. No projeto da Vercel, vá em **Storage**:
   - **Create Database → Neon (Postgres)** e conecte ao projeto. Isso cria a variável `DATABASE_URL`.
   - **Create → Blob** e conecte ao projeto. Isso cria `BLOB_READ_WRITE_TOKEN` (upload das capas).
3. Em **Settings → Environment Variables**, adicione:
   | Variável | Valor |
   |---|---|
   | `SESSION_SECRET` | Texto aleatório com 32+ caracteres. Gere em https://generate-secret.vercel.app/48 ou com `openssl rand -base64 48`. |
   | `CODIGO_SETUP` | Uma senha qualquer, usada uma única vez para criar o primeiro admin. |
   | `CODIGO_CONVITE` | *(Opcional)* Código para os membros criarem conta sozinhos em `/registrar`. Sem ele, só o admin cria contas. |
4. Faça o deploy (ou **Redeploy** depois de adicionar as variáveis).
5. Abra o site: ele leva para `/setup`. Informe o `CODIGO_SETUP` e crie sua conta de administrador.
   As tabelas do banco são criadas automaticamente no primeiro acesso.

## Rodando no computador (opcional)

Requer [Node.js 20+](https://nodejs.org).

```bash
npm install
cp .env.example .env.local   # e preencha os valores
npm run dev
```

Acesse http://localhost:3000.

## Uso rápido

1. Em **Painel admin**, crie uma noite de filme.
2. Adicione os filmes com capa, duração e sinopse.
3. Clique em **Abrir votação**. Os membros já podem votar em `/`.
4. Clique em **Encerrar votação** (ou espere o prazo). Todos veem o filme vencedor.

Horários são sempre no horário de Brasília.
