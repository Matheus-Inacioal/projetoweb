import { clsx } from "clsx";
import { rotulosStatusAgendamento, type StatusAgendamento } from "@/tipos/enums";

export function IndicadorStatus({ status }: { status: StatusAgendamento }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        status === "aguardando_pagamento" && "bg-amber-100 text-amber-800",
        status === "pendente" && "bg-yellow-100 text-yellow-800",
        status === "concluido" && "bg-green-100 text-green-800",
        status === "cancelado" && "bg-red-100 text-red-800",
        status === "pago" && "bg-purple-100 text-purple-800"
      )}
    >
      {rotulosStatusAgendamento[status]}
    </span>
  );
}
