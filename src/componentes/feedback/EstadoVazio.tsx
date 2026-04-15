export function EstadoVazio({
  titulo,
  descricao
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="cartao space-y-2 border border-dashed border-slate-300 p-6">
      <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
      <p className="text-sm text-slate-600">{descricao}</p>
    </div>
  );
}

