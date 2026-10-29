import { paraInputLocal } from '@/lib/datas';
import type { Noite } from '@/lib/tipos';
import { Campo } from './Comuns';

export function CamposNoite({ noite }: { noite?: Noite }) {
  return (
    <>
      <Campo rotulo="Título">
        <input
          name="titulo"
          required
          maxLength={120}
          defaultValue={noite?.titulo}
          placeholder="Ex.: Noite de Filme de Outubro"
          className="campo"
        />
      </Campo>
      <Campo rotulo="Descrição (opcional)">
        <textarea
          name="descricao"
          rows={3}
          maxLength={2000}
          defaultValue={noite?.descricao}
          placeholder="Local, o que levar, pipoca..."
          className="campo"
        />
      </Campo>
      {/* Duas colunas só quando o formulário tem largura para isso (nos painéis laterais fica uma). */}
      <div className="@container">
        <div className="grid gap-4 @md:grid-cols-2">
          <Campo rotulo="Data e hora da sessão">
            <input name="data_evento" type="datetime-local" defaultValue={paraInputLocal(noite?.data_evento ?? null)} className="campo" />
          </Campo>
          <Campo rotulo="Prazo da votação" dica="Horário de Brasília. Opcional.">
            <input name="prazo_votacao" type="datetime-local" defaultValue={paraInputLocal(noite?.prazo_votacao ?? null)} className="campo" />
          </Campo>
        </div>
      </div>
    </>
  );
}
