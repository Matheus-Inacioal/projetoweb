import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const lojaServico = {
  async listarLojas(filtros?: { cidade?: string; termo?: string }) {
    const supabase = criarClienteSupabaseServidor();
    let query = supabase.from("lojas").select("*").eq("ativo", true);

    if (filtros?.cidade) {
      query = query.ilike("cidade", `%${filtros.cidade}%`);
    }

    const { data: lojas, error } = await query;
    if (error) throw new ErroAplicacao(error.message, 400);

    const resultados = [];
    for (const loja of lojas) {
      // Conta serviços vinculados a esta loja
      const { count: qtdeServicos } = await supabase
        .from("servicos")
        .select("id", { count: "exact", head: true })
        .eq("loja_id", loja.id)
        .eq("ativo", true);

      // Média de avaliação dos prestadores da loja
      const { data: prests } = await supabase
        .from("prestadores")
        .select("avaliacao_media")
        .eq("loja_id", loja.id)
        .eq("ativo", true);

      const totalPrests = prests?.length ?? 0;
      const avaliacaoMedia = totalPrests > 0 && prests
        ? prests.reduce((acc: number, p: any) => acc + (p.avaliacao_media ?? 0), 0) / totalPrests
        : 5.0;

      resultados.push({
        id: loja.id,
        nome: loja.nome,
        descricao: loja.descricao,
        logoUrl: loja.logo_url,
        capaUrl: loja.capa_url,
        cidade: loja.cidade,
        estado: loja.estado,
        avaliacaoMedia: Number(avaliacaoMedia.toFixed(1)),
        quantidadeServicos: qtdeServicos ?? 0
      });
    }

    if (filtros?.termo) {
      const termo = filtros.termo.toLowerCase();
      return resultados.filter(l =>
        l.nome.toLowerCase().includes(termo) ||
        (l.descricao && l.descricao.toLowerCase().includes(termo))
      );
    }

    return resultados;
  },

  async obterLojaPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data: loja, error } = await supabase
      .from("lojas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !loja) {
      throw new ErroAplicacao("Loja não encontrada.", 404);
    }

    return {
      id: loja.id,
      nome: loja.nome,
      descricao: loja.descricao,
      cnpj: loja.cnpj,
      telefone: loja.telefone,
      email: loja.email,
      endereco: loja.endereco,
      cidade: loja.cidade,
      estado: loja.estado,
      cep: loja.cep,
      logoUrl: loja.logo_url,
      capaUrl: loja.capa_url,
      ativo: loja.ativo,
      createdAt: loja.created_at
    };
  },

  async criarLoja(dados: {
    nome: string;
    descricao?: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    logoUrl?: string;
    capaUrl?: string;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("lojas")
      .insert({
        nome: dados.nome,
        descricao: dados.descricao,
        cnpj: dados.cnpj,
        telefone: dados.telefone,
        email: dados.email,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        logo_url: dados.logoUrl,
        capa_url: dados.capaUrl,
        ativo: true
      })
      .select()
      .single();

    if (error) throw new ErroAplicacao(error.message, 400);
    return data;
  },

  async atualizarLoja(id: string, dados: {
    nome: string;
    descricao?: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    logoUrl?: string;
    capaUrl?: string;
    ativo?: boolean;
  }) {
    const supabase = criarClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("lojas")
      .update({
        nome: dados.nome,
        descricao: dados.descricao,
        cnpj: dados.cnpj,
        telefone: dados.telefone,
        email: dados.email,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        logo_url: dados.logoUrl,
        capa_url: dados.capaUrl,
        ativo: dados.ativo
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ErroAplicacao(error.message, 400);
    return data;
  }
};
