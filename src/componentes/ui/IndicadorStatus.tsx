import { clsx } from "clsx";
import { rotulosStatusAgendamento, type StatusAgendamento } from "@/tipos/enums";

export function IndicadorStatus({ status }: { status: StatusAgendamento }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        status === "pendente" && "bg-yellow-100 text-yellow-800",
        status === "confirmado" && "bg-green-100 text-green-800",
        status === "remarcacao_solicitada" && "bg-orange-100 text-orange-800",
        status === "remarcado" && "bg-blue-100 text-blue-800",
        status === "concluido" && "bg-teal-100 text-teal-800",
        status === "recusado" && "bg-red-100 text-red-800",
        status === "cancelado" && "bg-gray-100 text-gray-800"
      )}
    >
      {rotulosStatusAgendamento[status]}
    </span>
  );
}
