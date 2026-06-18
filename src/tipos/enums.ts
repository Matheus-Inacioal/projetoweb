export const TIPOS_USUARIO = ["prestador", "consumidor", "admin"] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

export const STATUS_AGENDAMENTO = ["pendente", "aguardando_pagamento", "pago", "concluido", "cancelado"] as const;
export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

export const STATUS_PAGAMENTO = ["pendente", "aprovado", "rejeitado", "cancelado", "estornado"] as const;
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

export const STATUS_PEDIDO = ["aguardando_pagamento", "pago", "enviado", "entregue", "cancelado"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const rotulosTipoUsuario: Record<TipoUsuario, string> = {
  admin: "Administrador",
  prestador: "Prestador",
  consumidor: "Consumidor"
};

export const rotulosStatusAgendamento: Record<StatusAgendamento, string> = {
  pendente: "Pendente",
  aguardando_pagamento: "Aguardando Pagamento",
  pago: "Pago",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

export const rotulosStatusPagamento: Record<StatusPagamento, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  cancelado: "Cancelado",
  estornado: "Estornado"
};

export const rotulosStatusPedido: Record<StatusPedido, string> = {
  aguardando_pagamento: "Aguardando Pagamento",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado"
};
