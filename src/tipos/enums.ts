export const TIPOS_USUARIO = ["prestador", "consumidor", "admin"] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

export const STATUS_CONTRATACAO = ["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"] as const;
export type StatusContratacao = (typeof STATUS_CONTRATACAO)[number];

export const rotulosTipoUsuario: Record<TipoUsuario, string> = {
  admin: "Administrador",
  prestador: "Prestador",
  consumidor: "Consumidor"
};

export const rotulosStatusContratacao: Record<StatusContratacao, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado"
};
