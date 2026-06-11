import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const prestadorServico = {
  async listarPrestadores(filtros?: { cidade?: string; termo?: string }) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from("prestadores")
      .select(`
        *,
        usuarios (
          nome,
          email,
          telefone,
          foto_url
        )
      `)
      .eq("ativo", true);

    if (filtros?.cidade) {
      query = query.ilike("cidade", `%${filtros.cidade}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    let resultados = data.map((p: any) => ({
      id: p.id,
      usuarioId: p.usuario_id,
      nome: p.usuarios?.nome ?? "",
      email: p.usuarios?.email ?? "",
      telefone: p.usuarios?.telefone ?? null,
      fotoUrl: p.usuarios?.foto_url ?? null,
      descricao: p.descricao,
      especialidade: p.especialidade,
      endereco: p.endereco,
      cidade: p.cidade,
      avaliacaoMedia: p.avaliacao_media,
      ativo: p.ativo,
      criadoEm: p.criado_em
    }));

    if (filtros?.termo) {
      const termo = filtros.termo.toLowerCase();
      resultados = resultados.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.especialidade.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo)
      );
    }

    return resultados;
  },

  async obterPrestadorPorId(id: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: prestador, error } = await supabase
      .from("prestadores")
      .select(`
        *,
        usuarios (
          nome,
          email,
          telefone,
          foto_url
        )
      `)
      .eq("id", id)
      .single();

    if (error || !prestador) {
      throw new ErroAplicacao("Prestador não encontrado.", 404);
    }

    // Busca serviços
    const { data: servicos } = await supabase
      .from("servicos")
      .select("*")
      .eq("prestador_id", id)
      .eq("ativo", true);

    // Busca anúncios
    const { data: anuncios } = await supabase
      .from("anuncios")
      .select("*")
      .eq("prestador_id", id)
      .eq("ativo", true);

    return {
      id: prestador.id,
      usuarioId: prestador.usuario_id,
      nome: prestador.usuarios?.nome ?? "",
      email: prestador.usuarios?.email ?? "",
      telefone: prestador.usuarios?.telefone ?? null,
      fotoUrl: prestador.usuarios?.foto_url ?? null,
      descricao: prestador.descricao,
      especialidade: prestador.especialidade,
      endereco: prestador.endereco,
      cidade: prestador.cidade,
      avaliacaoMedia: prestador.avaliacao_media,
      ativo: prestador.ativo,
      criadoEm: prestador.criado_em,
      servicos: servicos ?? [],
      anuncios: anuncios ?? []
    };
  },

  async obterPrestadorPorUsuarioId(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: prestador, error } = await supabase
      .from("prestadores")
      .select("*")
      .eq("usuario_id", usuarioId)
      .single();

    if (error || !prestador) {
      throw new ErroAplicacao("Prestador não encontrado para este usuário.", 404);
    }

    return prestador;
  },

  async listarServicos(prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("prestador_id", prestadorId)
      .order("nome");

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async criarServico(prestadorId: string, dados: { nome: string; descricao: string; preco: number; duracaoMinutos: number }) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("servicos")
      .insert({
        prestador_id: prestadorId,
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        duracao_minutos: dados.duracaoMinutos,
        ativo: true
      })
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async atualizarServico(
    servicoId: string,
    prestadorId: string,
    dados: { nome: string; descricao: string; preco: number; duracaoMinutos: number; ativo?: boolean }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data, error } = await supabase
      .from("servicos")
      .update({
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        duracao_minutos: dados.duracaoMinutos,
        ativo: dados.ativo ?? true
      })
      .eq("id", servicoId)
      .eq("prestador_id", prestadorId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async excluirServico(servicoId: string, prestadorId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", servicoId)
      .eq("prestador_id", prestadorId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  }
};
