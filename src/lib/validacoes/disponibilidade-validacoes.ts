import { z } from "zod";
import { DIAS_SEMANA } from "@/tipos/enums";

export const esquemaDisponibilidade = z.object({
  diaSemana: z.enum(DIAS_SEMANA, {
    message: "Selecione um dia da semana valido."
  }),
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Informe um horario inicial valido."),
  horaFim: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Informe um horario final valido.")
});

export type EntradaDisponibilidade = z.infer<typeof esquemaDisponibilidade>;

