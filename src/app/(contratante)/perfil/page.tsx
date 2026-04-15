"use client";

import { FormularioPerfilUsuario } from "@/componentes/formularios/FormularioPerfilUsuario";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { CartaoMetrica } from "@/componentes/ui/CartaoMetrica";
import { usePerfilContratante } from "@/hooks/usePerfis";

export default function PerfilContratantePage() {
  const { dados, carregando, erro, recarregar } = usePerfilContratante();

  if (carregando) {
    return <EstadoCarregando texto="Carregando seu perfil..." />;
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
        descricao="Atualize seus dados basicos e acompanhe um resumo da sua jornada na plataforma."
        subtitulo="Perfil"
        titulo="Meu perfil"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CartaoMetrica titulo="Proximos agendamentos" valor={dados.proximosAgendamentos.length} />
        <CartaoMetrica titulo="Historico" valor={dados.historicoAgendamentos.length} />
        <CartaoMetrica titulo="Perfil" valor={dados.usuario.perfil} />
      </div>

      <FormularioPerfilUsuario onSalvo={() => void recarregar()} usuario={dados.usuario} />
    </div>
  );
}

