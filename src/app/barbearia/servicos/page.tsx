"use client";

import { FormularioServico } from "@/componentes/formularios/FormularioServico";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaServicos } from "@/componentes/listas/ListaServicos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { usePerfilBarbearia } from "@/hooks/usePerfis";

export default function ServicosBarbeariaPage() {
  const { dados, carregando, erro, recarregar } = usePerfilBarbearia();

  if (carregando) {
    return <EstadoCarregando texto="Carregando servicos da barbearia..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados?.barbearia) {
    return (
      <EstadoVazio
        descricao="Cadastre primeiro a barbearia na aba de perfil para comecar a adicionar servicos."
        titulo="Barbearia nao configurada"
      />
    );
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Gerencie os servicos que podem ser contratados pelos clientes no marketplace."
        subtitulo="Catalogo"
        titulo="Servicos da barbearia"
      />

      <FormularioServico barbeariaId={dados.barbearia.id} onSucesso={() => void recarregar()} />

      {dados.servicos.length ? (
        <ListaServicos servicos={dados.servicos} />
      ) : (
        <EstadoVazio descricao="Nenhum servico cadastrado nesta barbearia." titulo="Catalogo vazio" />
      )}
    </div>
  );
}

