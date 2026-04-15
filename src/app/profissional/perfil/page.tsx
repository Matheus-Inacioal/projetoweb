"use client";

import { FormularioPerfilProfissional } from "@/componentes/formularios/FormularioPerfilProfissional";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { usePerfilProfissional } from "@/hooks/usePerfis";

export default function PerfilProfissionalPage() {
  const { dados, carregando, erro, recarregar } = usePerfilProfissional();

  if (carregando) {
    return <EstadoCarregando texto="Carregando perfil profissional..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel localizar seu perfil." titulo="Perfil indisponivel" />;
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Atualize suas informacoes profissionais que serao exibidas na vitrine da plataforma."
        subtitulo="Perfil do barbeiro"
        titulo="Perfil profissional"
      />
      <FormularioPerfilProfissional barbeiro={dados.barbeiro} onSalvo={() => void recarregar()} />
    </div>
  );
}

