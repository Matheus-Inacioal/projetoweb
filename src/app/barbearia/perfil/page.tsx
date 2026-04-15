"use client";

import { FormularioBarbearia } from "@/componentes/formularios/FormularioBarbearia";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { usePerfilBarbearia } from "@/hooks/usePerfis";

export default function PerfilBarbeariaPage() {
  const { dados, carregando, erro, recarregar } = usePerfilBarbearia();

  if (carregando) {
    return <EstadoCarregando texto="Carregando perfil da barbearia..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados) {
    return <EstadoVazio descricao="Nao foi possivel carregar o perfil da barbearia." titulo="Perfil indisponivel" />;
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Cadastre ou atualize os dados institucionais da barbearia para exibir na vitrine publica."
        subtitulo="Perfil da barbearia"
        titulo="Dados da barbearia"
      />
      <FormularioBarbearia barbearia={dados.barbearia} onSalvo={() => void recarregar()} />
    </div>
  );
}

