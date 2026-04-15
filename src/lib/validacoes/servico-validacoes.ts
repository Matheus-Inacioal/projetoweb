import { z } from "zod";

export const esquemaServico = z.object({
  nome: z.string().min(3, "Informe o nome do servico."),
  descricao: z.string().min(10, "Descreva o servico."),
  preco: z.coerce.number().positive("Informe um preco valido."),
  duracaoMinutos: z.coerce.number().int().min(10, "A duracao precisa ser de pelo menos 10 minutos."),
  ativo: z.boolean().optional()
});

export type EntradaServico = z.infer<typeof esquemaServico>;

