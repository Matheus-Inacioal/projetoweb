import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const comissaoServico = {
  async obterComissoesLoja(lojaId: string) {
    const supabase = criarClienteSupabaseServidor();

    // Query comissões juntando dados do prestador e da contratação
    const { data, error } = await supabase
      .from("comissoes")
      .select(`
        *,
        contratacoes (
          valor_total,
          status,
          servicos (
            nome
          )
        ),
        prestadores!inner (
          id,
          loja_id,
          usuarios (
            nome
          )
        )
      `)
      .eq("prestadores.loja_id", lojaId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      prestadorId: c.prestador_id,
      prestadorNome: c.prestadores?.usuarios?.nome ?? "Barbeiro",
      contratacaoId: c.contratacao_id,
      servicoNome: c.contratacoes?.servicos?.nome ?? "Serviço",
      valorServico: Number(c.contratacoes?.valor_total ?? 0),
      percentual: Number(c.percentual),
      valor: Number(c.valor),
      status: c.status,
      createdAt: c.created_at
    }));
  },

  async obterComissoesPrestador(prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("comissoes")
      .select(`
        *,
        contratacoes (
          valor_total,
          status,
          servicos (
            nome
          )
        )
      `)
      .eq("prestador_id", prestadorId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data.map((c: any) => ({
      id: c.id,
      prestadorId: c.prestador_id,
      contratacaoId: c.contratacao_id,
      servicoNome: c.contratacoes?.servicos?.nome ?? "Serviço",
      valorServico: Number(c.contratacoes?.valor_total ?? 0),
      percentual: Number(c.percentual),
      valor: Number(c.valor),
      status: c.status,
      createdAt: c.created_at
    }));
  },

  async pagarComissao(comissaoId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("comissoes")
      .update({ status: "paga" })
      .eq("id", comissaoId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  }
};
