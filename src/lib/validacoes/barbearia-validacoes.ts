import { z } from "zod";

export const esquemaBarbearia = z.object({
  nome: z.string().min(3, "Informe o nome da barbearia."),
  descricao: z.string().min(10, "Descreva a proposta da barbearia."),
  endereco: z.string().min(8, "Informe o endereco da barbearia."),
  telefone: z.string().min(8, "Informe um telefone valido.")
});

export type EntradaBarbearia = z.infer<typeof esquemaBarbearia>;

