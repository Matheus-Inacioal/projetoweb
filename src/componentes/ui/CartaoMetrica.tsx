export function CartaoMetrica({
  titulo,
  valor,
  detalhe
}: {
  titulo: string;
  valor: string | number;
  detalhe?: string;
}) {
  return (
    <div className="cartao p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{titulo}</p>
      <p className="mt-3 text-3xl font-bold text-primaria">{valor}</p>
      {detalhe ? <p className="mt-2 text-sm text-slate-600">{detalhe}</p> : null}
    </div>
  );
}

