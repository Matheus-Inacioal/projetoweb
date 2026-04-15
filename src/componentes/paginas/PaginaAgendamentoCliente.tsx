"use client";

import { FormularioAgendamento } from "@/componentes/formularios/FormularioAgendamento";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useBarbeariaDetalhes } from "@/hooks/useBarbearias";
import { useBarbeirosPorBarbearia } from "@/hooks/useBarbeiros";
import { useServicosPorBarbearia } from "@/hooks/useServicos";

export function PaginaAgendamentoCliente({
  barbeariaId,
  barbeiroInicialId
}: {
  barbeariaId: string;
  barbeiroInicialId?: string;
}) {
  const detalhesBarbearia = useBarbeariaDetalhes(barbeariaId);
  const listaBarbeiros = useBarbeirosPorBarbearia(barbeariaId);
  const listaServicos = useServicosPorBarbearia(barbeariaId);

  if (detalhesBarbearia.carregando || listaBarbeiros.carregando || listaServicos.carregando) {
    return (
      <div className="container-pagina">
        <EstadoCarregando texto="Preparando formulario de agendamento..." />
      </div>
    );
  }

  if (detalhesBarbearia.erro || listaBarbeiros.erro || listaServicos.erro) {
    return (
      <div className="container-pagina">
        <EstadoErro
          mensagem={detalhesBarbearia.erro || listaBarbeiros.erro || listaServicos.erro || "Erro ao carregar dados."}
          onTentarNovamente={() => {
            void detalhesBarbearia.recarregar();
            void listaBarbeiros.recarregar();
            void listaServicos.recarregar();
          }}
        />
      </div>
    );
  }

  if (!detalhesBarbearia.dados || !listaBarbeiros.dados?.length || !listaServicos.dados?.length) {
    return (
      <div className="container-pagina">
        <EstadoVazio
          descricao="Cadastre pelo menos um barbeiro e um servico para habilitar o agendamento nesta barbearia."
          titulo="Agendamento indisponivel"
        />
      </div>
    );
  }

  return (
    <div className="container-pagina space-y-6">
      <CabecalhoPagina
        descricao={`Escolha profissional, servico, data e horario para agendar na ${detalhesBarbearia.dados.nome}.`}
        subtitulo="Novo agendamento"
        titulo="Agendar servico"
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <FormularioAgendamento
          barbeiroInicialId={barbeiroInicialId}
          barbeariaId={barbeariaId}
          barbeiros={listaBarbeiros.dados}
          servicos={listaServicos.dados}
        />

        <div className="cartao space-y-4 p-6">
          <h2 className="text-xl font-semibold text-slate-900">{detalhesBarbearia.dados.nome}</h2>
          <p className="text-sm text-slate-600">{detalhesBarbearia.dados.descricao}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>{detalhesBarbearia.dados.endereco}</p>
            <p>{detalhesBarbearia.dados.telefone}</p>
            <p>{detalhesBarbearia.dados.barbeiros.length} barbeiros disponiveis</p>
            <p>{detalhesBarbearia.dados.servicos.length} servicos ativos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

