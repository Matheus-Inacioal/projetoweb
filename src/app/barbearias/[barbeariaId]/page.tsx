"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { ListaServicos } from "@/componentes/listas/ListaServicos";
import { CabecalhoPagina } from "@/componentes/ui/CabecalhoPagina";
import { useBarbeariaDetalhes } from "@/hooks/useBarbearias";

export default function DetalhesBarbeariaPage() {
  const params = useParams<{ barbeariaId: string }>();
  const { dados, carregando, erro, recarregar } = useBarbeariaDetalhes(params.barbeariaId);

  if (carregando) {
    return (
      <div className="container-pagina">
        <EstadoCarregando texto="Carregando detalhes da barbearia..." />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="container-pagina">
        <EstadoErro mensagem={erro} onTentarNovamente={() => void recarregar()} />
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="container-pagina">
        <EstadoVazio descricao="A barbearia solicitada nao foi encontrada." titulo="Barbearia indisponivel" />
      </div>
    );
  }

  return (
    <div className="container-pagina space-y-8">
      <CabecalhoPagina descricao={dados.descricao} subtitulo="Detalhes da barbearia" titulo={dados.nome} />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="cartao space-y-3 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Sobre a barbearia</h2>
          <p className="text-sm text-slate-600">{dados.endereco}</p>
          <p className="text-sm text-slate-600">{dados.telefone}</p>
          <p className="text-sm text-slate-600">Responsavel: {dados.responsavelNome}</p>
          <p className="text-sm text-slate-600">
            {dados.quantidadeBarbeiros} barbeiros cadastrados • {dados.quantidadeServicos} servicos disponiveis
          </p>
        </div>

        <div className="cartao space-y-4 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Proximo passo</h2>
          <p className="text-sm text-slate-600">
            Consulte os profissionais da barbearia e siga para o agendamento com o barbeiro de sua preferencia.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="botao-primario" href={`/barbearias/${dados.id}/barbeiros`}>
              Ver barbeiros
            </Link>
            <Link className="botao-secundario" href="/">
              Voltar para a vitrine
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Servicos cadastrados</h2>
        {dados.servicos.length ? (
          <ListaServicos servicos={dados.servicos} />
        ) : (
          <EstadoVazio descricao="Esta barbearia ainda nao cadastrou servicos." titulo="Sem servicos disponiveis" />
        )}
      </section>
    </div>
  );
}

