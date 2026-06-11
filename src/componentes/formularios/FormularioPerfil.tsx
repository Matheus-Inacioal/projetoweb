"use client";

import { useEffect, useState } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { useMutacao } from "@/hooks/useMutacao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";

export function FormularioPerfil() {
  const { dados: perfil, carregando, erro, recarregar } = useBuscarDados<any>("/api/perfil");
  const { executar: atualizarPerfil, carregando: atualizando, erro: erroSalvar } = useMutacao<any, any>("/api/perfil", "PUT");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Campos específicos de Prestador
  const [especialidade, setEspecialidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");

  const [subindoFoto, setSubindoFoto] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || "");
      setTelefone(perfil.telefone || "");
      setFotoUrl(perfil.fotoUrl || null);

      if (perfil.tipo === "prestador" && perfil.prestador) {
        setEspecialidade(perfil.prestador.especialidade || "");
        setDescricao(perfil.prestador.descricao || "");
        setEndereco(perfil.prestador.endereco || "");
        setCidade(perfil.prestador.cidade || "");
      }
    }
  }, [perfil]);

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setSubindoFoto(true);
    const formData = new FormData();
    formData.append("foto", arquivo);

    try {
      const response = await fetch("/api/perfil/foto", {
        method: "POST",
        body: formData
      });
      const res = await response.json();
      if (res.sucesso && res.dados?.fotoUrl) {
        setFotoUrl(res.dados.fotoUrl);
      }
    } catch (err) {
      console.error("Erro no upload de foto", err);
    } finally {
      setSubindoFoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSucesso(false);

    try {
      const payload: any = { nome, telefone };

      if (perfil.tipo === "prestador") {
        payload.especialidade = especialidade;
        payload.descricao = descricao;
        payload.endereco = endereco;
        payload.cidade = cidade;
      }

      await atualizarPerfil(payload);
      setSucesso(true);
      recarregar();
    } catch {
      // erro tratado automaticamente pelo hook
    }
  }

  if (carregando) {
    return <EstadoCarregando texto="Carregando dados do perfil..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={recarregar} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sucesso && <MensagemRetorno tipo="sucesso" mensagem="Perfil atualizado com sucesso!" />}
      {erroSalvar && <MensagemRetorno tipo="erro" mensagem={erroSalvar} />}

      {/* Foto de Perfil */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-marfim p-6 rounded-2xl border border-bege_borda">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-bege_borda border-2 border-dourado shadow-suave">
          {fotoUrl ? (
            <img src={fotoUrl} alt={nome} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-verde_petroleo font-black">
              {nome.charAt(0)}
            </div>
          )}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <label className="botao-secundario text-xs cursor-pointer inline-block">
            {subindoFoto ? "Enviando..." : "Alterar Foto de Perfil"}
            <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" disabled={subindoFoto} />
          </label>
          <p className="text-xs text-texto_secundario">Imagens PNG ou JPG. Limite de 2MB.</p>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-texto_principal border-b border-bege_borda pb-2">Dados Pessoais</h3>
        
        <CampoTexto
          label="Nome completo"
          id="perfil-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <CampoTexto
          label="Telefone de Contato"
          id="perfil-tel"
          placeholder="(99) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>

      {/* Informações de Prestador */}
      {perfil?.tipo === "prestador" && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-texto_principal border-b border-bege_borda pb-2">Informações Profissionais</h3>
          
          <CampoTexto
            label="Especialidade Principal"
            id="perfil-esp"
            placeholder="Ex: Cortes Modernos, Barboterapia"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            required
          />

          <AreaTexto
            label="Sobre Você (Descrição)"
            id="perfil-desc"
            placeholder="Fale um pouco sobre sua experiência e serviços..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <CampoTexto
            label="Endereço de Atendimento"
            id="perfil-end"
            placeholder="Ex: Av. Beira Mar, 1000"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />

          <CampoTexto
            label="Cidade"
            id="perfil-cid"
            placeholder="Ex: Fortaleza - CE"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
        </div>
      )}

      <Botao type="submit" larguraTotal disabled={atualizando}>
        {atualizando ? "Salvando..." : "Salvar Alterações"}
      </Botao>
    </form>
  );
}
