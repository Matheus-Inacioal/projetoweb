export const TIPOS_USUARIO = ["prestador", "consumidor", "admin"] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

export const STATUS_AGENDAMENTO = ["pendente", "pago", "confirmado", "concluido", "cancelado"] as const;
export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

export const rotulosTipoUsuario: Record<TipoUsuario, string> = {
  admin: "Administrador",
  prestador: "Prestador",
  consumidor: "Consumidor"
};

export const rotulosStatusAgendamento: Record<StatusAgendamento, string> = {
  pendente: "Pendente",
  pago: "Pago",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado"
};
