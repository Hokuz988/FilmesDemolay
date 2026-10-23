export type Estado = { erro?: string; ok?: string } | undefined;

export type Papel = 'admin' | 'membro';
export type StatusNoite = 'rascunho' | 'aberta' | 'encerrada';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  papel: Papel;
  ativo: boolean;
  versao_sessao: number;
}

export interface Noite {
  id: number;
  titulo: string;
  descricao: string;
  data_evento: Date | null;
  prazo_votacao: Date | null;
  status: StatusNoite;
  criado_em: Date;
}

export interface Filme {
  id: number;
  noite_id: number;
  titulo: string;
  descricao: string;
  duracao_min: number | null;
  capa_url: string | null;
}

export interface FilmeComVotos extends Filme {
  votos: number;
}

/** Erro cuja mensagem pode ser mostrada ao usuário. */
export class ErroUsuario extends Error {}
