import { clsx } from "clsx";
import { rotulosStatusAgendamento, type StatusAgendamento } from "@/tipos/enums";

export function IndicadorStatus({ status }: { status: StatusAgendamento }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        status === "confirmado" && "bg-sucesso/10 text-sucesso",
        status === "pendente" && "bg-destaque/10 text-destaque",
        status === "concluido" && "bg-primaria/10 text-primaria",
        status === "cancelado" && "bg-perigo/10 text-perigo",
        status === "pago" && "bg-sucesso/10 text-sucesso"
      )}
    >
      {rotulosStatusAgendamento[status]}
    </span>
  );
}
