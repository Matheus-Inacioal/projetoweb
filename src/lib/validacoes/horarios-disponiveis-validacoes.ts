import { z } from "zod";

export const esquemaConsultaHorariosDisponiveis = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma data valida."),
  servicoId: z.string().min(1, "Selecione um servico valido.")
});

export type EntradaConsultaHorariosDisponiveis = z.infer<typeof esquemaConsultaHorariosDisponiveis>;
