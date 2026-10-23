import type { Filme } from '@/lib/tipos';
import { Campo } from './Comuns';

export function CamposFilme({ noiteId, filme }: { noiteId: number; filme?: Filme }) {
  return (
    <>
      <input type="hidden" name="noite_id" value={noiteId} />
      {filme && <input type="hidden" name="filme_id" value={filme.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Campo rotulo="Nome do filme">
          <input name="titulo" required maxLength={150} defaultValue={filme?.titulo} className="campo" />
        </Campo>
        <Campo rotulo="Duração (min)">
          <input
            name="duracao_min"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            defaultValue={filme?.duracao_min ?? undefined}
            placeholder="Ex.: 128"
            className="campo"
          />
        </Campo>
      </div>
      <Campo rotulo="Sinopse / descrição">
        <textarea name="descricao" rows={4} maxLength={3000} defaultValue={filme?.descricao} className="campo" />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Capa (imagem)" dica="JPG, PNG, WEBP, AVIF ou GIF até 4 MB.">
          <input name="capa" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="campo" />
        </Campo>
        <Campo rotulo="…ou link da capa" dica={filme ? 'Deixe em branco para manter a capa atual.' : 'Endereço https:// da imagem.'}>
          <input name="capa_url" type="url" placeholder="https://" className="campo" />
        </Campo>
      </div>
      {filme?.capa_url && (
        <label className="flex items-center gap-2 text-sm text-suave">
          <input type="checkbox" name="remover_capa" className="size-4 accent-vermelho" />
          Remover a capa atual
        </label>
      )}
    </>
  );
}
