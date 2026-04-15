import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-pagina">
      <div className="cartao space-y-4 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destaque">Rota nao encontrada</p>
        <h1 className="text-3xl font-bold text-slate-900">Esta pagina nao existe no BarberGo</h1>
        <p className="text-sm text-slate-600">
          Verifique o endereco acessado ou volte para a pagina inicial do marketplace.
        </p>
        <Link className="botao-primario" href="/">
          Voltar para o inicio
        </Link>
      </div>
    </div>
  );
}
