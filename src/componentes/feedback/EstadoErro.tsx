export function EstadoErro({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente?: () => void }) {
  return (
    <div className="cartao space-y-4 border border-perigo/20 p-6">
      <div>
        <p className="text-sm font-semibold text-perigo">Erro ao carregar</p>
        <p className="mt-1 text-sm text-slate-600">{mensagem}</p>
      </div>
      {onTentarNovamente ? (
        <button className="botao-secundario" onClick={onTentarNovamente} type="button">
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

