import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";
import { createClient } from "@supabase/supabase-js";

export const prestadorServico = {
  async listarPrestadores(filtros?: { cidade?: string; termo?: string; lojaId?: string }) {
    const supabase = criarClienteSupabaseServidor();

    let query = supabase
      .from("prestadores")
      .select(`
        *,
        usuarios (
          nome,
          email,
          telefone
        )
      `)
      .eq("ativo", true);

    if (filtros?.lojaId) {
      query = query.eq("loja_id", filtros.lojaId);
    }

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
      lojaId: p.loja_id,
      nome: p.usuarios?.nome ?? "",
      email: p.usuarios?.email ?? "",
      telefone: p.usuarios?.telefone ?? null,
      fotoUrl: p.foto_url ?? null,
      descricao: p.descricao,
      especialidade: p.especialidade,
      endereco: p.endereco,
      cidade: p.cidade,
      avaliacaoMedia: p.avaliacao_media,
      ativo: p.ativo,
      criadoEm: p.created_at
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
          telefone
        )
      `)
      .eq("id", id)
      .single();

    if (error || !prestador) {
      throw new ErroAplicacao("Prestador não encontrado.", 404);
    }

    // Busca serviços da loja associados
    const { data: servicos } = await supabase
      .from("servicos")
      .select("*")
      .eq("loja_id", prestador.loja_id)
      .eq("ativo", true);

    // Busca anúncios do prestador
    const { data: anuncios } = await supabase
      .from("anuncios")
      .select("*")
      .eq("prestador_id", id)
      .eq("ativo", true);

    return {
      id: prestador.id,
      usuarioId: prestador.usuario_id,
      lojaId: prestador.loja_id,
      nome: prestador.usuarios?.nome ?? "",
      email: prestador.usuarios?.email ?? "",
      telefone: prestador.usuarios?.telefone ?? null,
      fotoUrl: prestador.foto_url ?? null,
      descricao: prestador.descricao,
      especialidade: prestador.especialidade,
      endereco: prestador.endereco,
      cidade: prestador.cidade,
      avaliacaoMedia: prestador.avaliacao_media,
      ativo: prestador.ativo,
      criadoEm: prestador.created_at,
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

    const { data: prestador } = await supabase
      .from("prestadores")
      .select("loja_id")
      .eq("id", prestadorId)
      .single();

    const lojaId = prestador?.loja_id ?? "00000000-0000-0000-0000-000000000000";

    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("loja_id", lojaId)
      .order("nome");

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async criarServico(prestadorId: string, dados: { nome: string; descricao: string; preco: number; duracaoMinutos: number }) {
    const supabase = criarClienteSupabaseServidor();

    const { data: prestador } = await supabase
      .from("prestadores")
      .select("loja_id")
      .eq("id", prestadorId)
      .single();

    const lojaId = prestador?.loja_id ?? "00000000-0000-0000-0000-000000000000";

    const { data, error } = await supabase
      .from("servicos")
      .insert({
        loja_id: lojaId,
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
      .eq("id", servicoId);

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return true;
  },

  async criarPrestador(
    lojaId: string,
    dados: {
      nome: string;
      email: string;
      telefone: string;
      especialidade: string;
      descricao: string;
      fotoUrl?: string;
    }
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const clienteTemp = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const senhaProvisoria = Math.random().toString(36).slice(-8) + "A1!";

    const { data: authData, error: authError } = await clienteTemp.auth.signUp({
      email: dados.email,
      password: senhaProvisoria,
      options: {
        data: {
          nome: dados.nome,
          telefone: dados.telefone,
          tipo_usuario: "prestador",
          loja_id: lojaId
        }
      }
    });

    if (authError) {
      throw new ErroAplicacao(authError.message, 400);
    }

    const authUser = authData.user;
    if (!authUser) {
      throw new ErroAplicacao("Não foi possível registrar o barbeiro no Supabase Auth.", 400);
    }

    const supabase = criarClienteSupabaseServidor();
    let prestadorRecord = null;

    for (let i = 0; i < 5; i++) {
      const { data } = await supabase
        .from("prestadores")
        .select("id")
        .eq("usuario_id", authUser.id)
        .maybeSingle();
      if (data) {
        prestadorRecord = data;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!prestadorRecord) {
      throw new ErroAplicacao("Perfil do prestador não foi criado a tempo pelo trigger do banco de dados.", 400);
    }

    const { error: updateError } = await supabase
      .from("prestadores")
      .update({
        especialidade: dados.especialidade,
        descricao: dados.descricao,
        foto_url: dados.fotoUrl || null,
        loja_id: lojaId,
        ativo: true
      })
      .eq("id", prestadorRecord.id);

    if (updateError) {
      throw new ErroAplicacao(updateError.message, 400);
    }

    return {
      usuarioId: authUser.id,
      prestadorId: prestadorRecord.id,
      email: dados.email,
      senhaProvisoria
    };
  },

  async atualizarPrestador(
    id: string,
    dados: {
      nome: string;
      telefone: string;
      especialidade: string;
      descricao: string;
      fotoUrl?: string | null;
      ativo?: boolean;
    }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data: prestador, error: getError } = await supabase
      .from("prestadores")
      .select("usuario_id")
      .eq("id", id)
      .single();

    if (getError || !prestador) {
      throw new ErroAplicacao("Prestador não encontrado.", 404);
    }

    const { error: userError } = await supabase
      .from("usuarios")
      .update({
        nome: dados.nome,
        telefone: dados.telefone
      })
      .eq("id", prestador.usuario_id);

    if (userError) {
      throw new ErroAplicacao(userError.message, 400);
    }

    const { data, error } = await supabase
      .from("prestadores")
      .update({
        especialidade: dados.especialidade,
        descricao: dados.descricao,
        foto_url: dados.fotoUrl,
        ativo: dados.ativo !== undefined ? dados.ativo : true
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async excluirPrestador(id: string) {
    const supabase = criarClienteSupabaseServidor();
    const { data: prestador } = await supabase
      .from("prestadores")
      .select("usuario_id")
      .eq("id", id)
      .single();

    if (prestador) {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", prestador.usuario_id);

      if (error) {
        throw new ErroAplicacao(error.message, 400);
      }
    }
    return true;
  }
};
