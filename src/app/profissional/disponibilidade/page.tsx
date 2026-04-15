"use client";

import { FormularioDisponibilidade } from "@/componentes/formularios/FormularioDisponibilidade";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { TabelaDados } from "@/componentes/ui/TabelaDados";
import { rotulosDiaSemana } from "@/tipos/enums";
import { usePerfilProfissional } from "@/hooks/usePerfis";

export default function DisponibilidadeProfissionalPage() {
  const { dados, carregando, erro, recarregar } = usePerfilProfissional();

  if (carregando) {
    return <EstadoCarregando texto="Carregando disponibilidades..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />;
  }

  if (!dados?.barbeiro) {
    return (
      <EstadoVazio
        descricao="Cadastre ou complete seu perfil profissional antes de adicionar disponibilidades."
        titulo="Perfil profissional nao configurado"
      />
    );
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        descricao="Cadastre os horarios em que voce atende para apoiar a validacao dos agendamentos."
        subtitulo="Disponibilidade"
        titulo="Minha disponibilidade"
      />

      <FormularioDisponibilidade barbeiroId={dados.barbeiro.id} onSucesso={() => void recarregar()} />

      {dados.disponibilidades.length ? (
        <TabelaDados
          colunas={[
            { chave: "dia", titulo: "Dia", renderizar: (linha) => rotulosDiaSemana[linha.diaSemana] },
            { chave: "inicio", titulo: "Hora inicial", renderizar: (linha) => linha.horaInicio },
            { chave: "fim", titulo: "Hora final", renderizar: (linha) => linha.horaFim }
          ]}
          linhas={dados.disponibilidades}
        />
      ) : (
        <EstadoVazio descricao="Nenhuma disponibilidade cadastrada ate o momento." titulo="Sem disponibilidades" />
      )}
    </div>
  );
}

