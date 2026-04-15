export function CabecalhoPagina({
  subtitulo,
  titulo,
  descricao
}: {
  subtitulo?: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="space-y-2">
      {subtitulo ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-destaque">{subtitulo}</p> : null}
      <h1 className="text-3xl font-bold text-slate-900">{titulo}</h1>
      {descricao ? <p className="max-w-3xl text-sm text-slate-600">{descricao}</p> : null}
    </div>
  );
}

