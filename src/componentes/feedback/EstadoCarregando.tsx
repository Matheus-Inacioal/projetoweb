export function EstadoCarregando({ texto = "Carregando dados..." }: { texto?: string }) {
  return (
    <div className="cartao p-6">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-destaque" />
        <p className="text-sm text-slate-600">{texto}</p>
      </div>
    </div>
  );
}

