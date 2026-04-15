import { clsx } from "clsx";
import { rotulosStatusAgendamento, type StatusAgendamento } from "@/tipos/enums";

export function IndicadorStatus({ status }: { status: StatusAgendamento }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        status === "CONFIRMADO" && "bg-sucesso/10 text-sucesso",
        status === "PENDENTE" && "bg-destaque/10 text-destaque",
        status === "CONCLUIDO" && "bg-primaria/10 text-primaria",
        status === "CANCELADO" && "bg-perigo/10 text-perigo"
      )}
    >
      {rotulosStatusAgendamento[status]}
    </span>
  );
}
