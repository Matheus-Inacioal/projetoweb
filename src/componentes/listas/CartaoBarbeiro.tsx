import Link from "next/link";
import type { BarbeiroResumo } from "@/tipos/dados";

export function CartaoBarbeiro({
  barbeiro,
  barbeariaId,
  exibirAcaoAgendar = false
}: {
  barbeiro: BarbeiroResumo;
  barbeariaId?: string;
  exibirAcaoAgendar?: boolean;
}) {
  return (
    <article className="cartao h-full space-y-4 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destaque">Profissional</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{barbeiro.nome}</h3>
        <p className="mt-1 text-sm font-medium text-primaria">{barbeiro.especialidade}</p>
      </div>

      <p className="text-sm text-slate-600">{barbeiro.descricao}</p>

      <div className="space-y-1 text-sm text-slate-600">
        <p>{barbeiro.telefone}</p>
        <p>{barbeiro.ativo ? "Ativo para agendamentos" : "Indisponivel no momento"}</p>
      </div>

      {exibirAcaoAgendar && barbeariaId ? (
        <Link className="botao-primario w-full" href={`/barbearias/${barbeariaId}/agendar?barbeiroId=${barbeiro.id}`}>
          Agendar com este barbeiro
        </Link>
      ) : null}
    </article>
  );
}

