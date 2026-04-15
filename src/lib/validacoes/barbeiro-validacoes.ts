import { z } from "zod";

export const esquemaBarbeiro = z.object({
  nome: z.string().min(3, "Informe o nome do barbeiro."),
  especialidade: z.string().min(3, "Informe a especialidade principal."),
  descricao: z.string().min(10, "Descreva brevemente o perfil profissional."),
  telefone: z.string().min(8, "Informe um telefone valido."),
  ativo: z.boolean().optional(),
  barbeariaId: z.string().optional().nullable()
});

export type EntradaBarbeiro = z.infer<typeof esquemaBarbeiro>;

