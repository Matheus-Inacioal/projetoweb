"use client";

import { FormularioBarbeiro } from "@/componentes/formularios/FormularioBarbeiro";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CartaoBarbeiro } from "@/componentes/listas/CartaoBarbeiro";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { usePerfilBarbearia } from "@/hooks/usePerfis";

export default function BarbeirosBarbeariaPage() {
  const { dados, carregando, erro, recarregar } = usePerfilBarbearia();

  if (carregando) {
    return <EstadoCarregando texto="Carregando equipe da barbearia..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados?.barbearia) {
    return (
      <EstadoVazio
        descricao="Cadastre primeiro a barbearia na aba de perfil para comecar a adicionar barbeiros."
        titulo="Barbearia nao configurada"
      />
    );
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Cadastre e acompanhe os barbeiros vinculados ao estabelecimento."
        subtitulo="Equipe"
        titulo="Barbeiros da barbearia"
      />

      <FormularioBarbeiro barbeariaId={dados.barbearia.id} onSucesso={() => void recarregar()} />

      {dados.barbeiros.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dados.barbeiros.map((barbeiro) => (
            <CartaoBarbeiro barbeiro={barbeiro} key={barbeiro.id} />
          ))}
        </div>
      ) : (
        <EstadoVazio descricao="Nenhum barbeiro cadastrado nesta barbearia." titulo="Equipe vazia" />
      )}
    </div>
  );
}

