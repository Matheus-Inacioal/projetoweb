export const PERFIS_USUARIO = ["CONTRATANTE", "PRESTADOR_PF", "PRESTADOR_PJ", "ADMIN"] as const;
export const PERFIS_CADASTRAVEIS = ["CONTRATANTE", "PRESTADOR_PF", "PRESTADOR_PJ"] as const;
export const STATUS_AGENDAMENTO = ["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"] as const;
export const DIAS_SEMANA = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const;

export type PerfilUsuario = (typeof PERFIS_USUARIO)[number];
export type PerfilCadastro = (typeof PERFIS_CADASTRAVEIS)[number];
export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const rotulosPerfil: Record<PerfilUsuario, string> = {
  ADMIN: "Administrador",
  CONTRATANTE: "Contratante",
  PRESTADOR_PF: "Prestador PF",
  PRESTADOR_PJ: "Prestador PJ / Barbearia"
};

export const rotulosStatusAgendamento: Record<StatusAgendamento, string> = {
  CANCELADO: "Cancelado",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluido",
  PENDENTE: "Pendente"
};

export const rotulosDiaSemana: Record<DiaSemana, string> = {
  DOMINGO: "Domingo",
  SEGUNDA: "Segunda-feira",
  TERCA: "Terca-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sabado"
};

