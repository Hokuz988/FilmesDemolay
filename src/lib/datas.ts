import type { Noite, StatusNoite } from './tipos';

// Horário de Brasília (sem horário de verão desde 2019).
export const FUSO = 'America/Sao_Paulo';
const DESLOCAMENTO = '-03:00';

export function formatarData(d: Date | string | null) {
  if (!d) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d));
}

export function formatarDataCurta(d: Date | string | null) {
  if (!d) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d));
}

/** Converte uma data para o formato do <input type="datetime-local">, no horário de Brasília. */
export function paraInputLocal(d: Date | string | null) {
  if (!d) return '';
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(d))
      .map((p) => [p.type, p.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

/** Lê o valor de um <input type="datetime-local"> como horário de Brasília. */
export function deInputLocal(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}:00${DESLOCAMENTO}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarDuracao(minutos: number | null) {
  if (!minutos) return '';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function tempoRestante(d: Date | string) {
  const ms = new Date(d).getTime() - Date.now();
  if (ms <= 0) return null;
  const horas = Math.floor(ms / 3_600_000);
  if (horas < 1) return 'menos de 1 hora';
  if (horas < 48) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${Math.floor(horas / 24)} dias`;
}

export function votacaoAberta(noite: Pick<Noite, 'status' | 'prazo_votacao'>) {
  if (noite.status !== 'aberta') return false;
  return !noite.prazo_votacao || new Date(noite.prazo_votacao).getTime() > Date.now();
}

export const ROTULO_STATUS: Record<StatusNoite, string> = {
  rascunho: 'Rascunho',
  aberta: 'Votação aberta',
  encerrada: 'Encerrada',
};
