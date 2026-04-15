import { z } from "zod";

export const esquemaCriacaoAgendamento = z.object({
  barbeariaId: z.string().min(1, "Selecione a barbearia."),
  barbeiroId: z.string().min(1, "Selecione o barbeiro."),
  servicoId: z.string().min(1, "Selecione o servico."),
  data: z.string().min(1, "Selecione a data do agendamento."),
  hora: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Selecione um horario valido."),
  observacao: z.string().max(300, "A observacao pode ter no maximo 300 caracteres.").optional().nullable()
});

export type EntradaCriacaoAgendamento = z.infer<typeof esquemaCriacaoAgendamento>;

