import { criarClienteSupabaseServidor } from "@/lib/banco/supabase-server";
import { ErroAplicacao } from "@/lib/utilitarios/erro-aplicacao";

export const usuarioServico = {
  async obterPerfil(usuarioId: string) {
    const supabase = criarClienteSupabaseServidor();

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", usuarioId)
      .single();

    if (usuarioError || !usuario) {
      throw new ErroAplicacao("Perfil de usuário não encontrado.", 404);
    }

    let prestadorInfo = null;
    let consumidorInfo = null;

    if (usuario.tipo === "prestador") {
      const { data } = await supabase
        .from("prestadores")
        .select("*")
        .eq("usuario_id", usuarioId)
        .single();
      prestadorInfo = data;
    } else if (usuario.tipo === "consumidor") {
      const { data } = await supabase
        .from("consumidores")
        .select("*")
        .eq("usuario_id", usuarioId)
        .single();
      consumidorInfo = data;
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      fotoUrl: usuario.foto_url,
      tipo: usuario.tipo,
      criadoEm: usuario.criado_em,
      prestador: prestadorInfo,
      consumidor: consumidorInfo
    };
  },

  async atualizarPerfil(usuarioId: string, dados: { nome: string; telefone: string; fotoUrl?: string | null }) {
    const supabase = criarClienteSupabaseServidor();

    const updates: any = {
      nome: dados.nome,
      telefone: dados.telefone
    };

    if (dados.fotoUrl !== undefined) {
      updates.foto_url = dados.fotoUrl;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update(updates)
      .eq("id", usuarioId)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async atualizarDadosPrestador(
    usuarioId: string,
    dados: {
      descricao: string;
      especialidade: string;
      endereco: string;
      cidade: string;
      ativo?: boolean;
    }
  ) {
    const supabase = criarClienteSupabaseServidor();

    const { data: prestador } = await supabase
      .from("prestadores")
      .select("id")
      .eq("usuario_id", usuarioId)
      .single();

    if (!prestador) {
      throw new ErroAplicacao("Prestador não encontrado.", 404);
    }

    const { data, error } = await supabase
      .from("prestadores")
      .update({
        descricao: dados.descricao,
        especialidade: dados.especialidade,
        endereco: dados.endereco,
        cidade: dados.cidade,
        ativo: dados.ativo ?? true
      })
      .eq("id", prestador.id)
      .select()
      .single();

    if (error) {
      throw new ErroAplicacao(error.message, 400);
    }

    return data;
  },

  async fazerUploadFoto(usuarioId: string, arquivo: Buffer, nomeArquivo: string, mimeType: string) {
    const supabase = criarClienteSupabaseServidor();

    const extensao = nomeArquivo.split(".").pop();
    const caminhoArquivo = `${usuarioId}/${Date.now()}.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from("perfis")
      .upload(caminhoArquivo, arquivo, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      throw new ErroAplicacao("Erro no upload do arquivo: " + uploadError.message, 400);
    }

    const { data } = supabase.storage
      .from("perfis")
      .getPublicUrl(caminhoArquivo);

    // Salva a URL no perfil do usuário
    await supabase
      .from("usuarios")
      .update({ foto_url: data.publicUrl })
      .eq("id", usuarioId);

    return data.publicUrl;
  }
};
