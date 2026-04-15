"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-pagina">
      <div className="cartao space-y-4 p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-perigo">Falha no aplicativo</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Nao foi possivel carregar esta tela</h1>
        </div>
        <p className="text-sm text-slate-600">{error.message || "Tente novamente em instantes."}</p>
        <button className="botao-primario" onClick={reset} type="button">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

