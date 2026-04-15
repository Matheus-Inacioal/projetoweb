"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { CampoSelecao } from "@/componentes/ui/CampoSelecao";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { useHorariosDisponiveis } from "@/hooks/useHorariosDisponiveis";
import { useMutacao } from "@/hooks/useMutacao";
import { adicionarDias, formatarData, formatarDataParaInput, formatarMoeda } from "@/lib/utilitarios/datas";
import type { AgendamentoDetalhado, BarbeiroResumo, ServicoResumo } from "@/tipos/dados";

type ModoSelecaoData = "HOJE" | "AMANHA" | "ESCOLHER_DIA";

function descreverDataDisponibilidade(data: string) {
  const dataHoje = formatarDataParaInput(new Date());
  const dataAmanha = formatarDataParaInput(adicionarDias(new Date(), 1));
  const dataDisponibilidade = formatarDataParaInput(data);

  if (dataDisponibilidade === dataHoje) {
    return "hoje";
  }

  if (dataDisponibilidade === dataAmanha) {
    return "amanha";
  }

  return formatarData(data);
}

export function FormularioAgendamento({
  barbeariaId,
  barbeiros,
  servicos,
  barbeiroInicialId
}: {
  barbeariaId: string;
  barbeiros: BarbeiroResumo[];
  servicos: ServicoResumo[];
  barbeiroInicialId?: string;
}) {
  const router = useRouter();
  const dataHoje = formatarDataParaInput(new Date());
  const dataAmanha = formatarDataParaInput(adicionarDias(new Date(), 1));
  const [barbeiroId, setBarbeiroId] = useState(barbeiroInicialId || barbeiros[0]?.id || "");
  const [servicoId, setServicoId] = useState(servicos[0]?.id || "");
  const [modoSelecaoData, setModoSelecaoData] = useState<ModoSelecaoData>("HOJE");
  const [data, setData] = useState(dataHoje);
  const [hora, setHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const horariosDisponiveis = useHorariosDisponiveis(barbeiroId, servicoId, data);
  const { executar, carregando, erro } = useMutacao<
    AgendamentoDetalhado,
    { barbeariaId: string; barbeiroId: string; servicoId: string; data: string; hora: string; observacao?: string }
  >("/api/agendamentos");

  const barbeiroSelecionado = barbeiros.find((barbeiroAtual) => barbeiroAtual.id === barbeiroId) ?? null;
  const servicoSelecionado = servicos.find((servicoAtual) => servicoAtual.id === servicoId) ?? null;
  const opcoesBarbeiro = barbeiros.map((barbeiro) => ({
    valor: barbeiro.id,
    label: `${barbeiro.nome} • ${barbeiro.especialidade}`
  }));

  const opcoesServico = servicos.map((servico) => ({
    valor: servico.id,
    label: `${servico.nome} • ${servico.duracaoMinutos} min`
  }));

  useEffect(() => {
    if (horariosDisponiveis.dados?.primeiroHorarioDisponivel) {
      setHora(horariosDisponiveis.dados.primeiroHorarioDisponivel);
      return;
    }

    setHora("");
  }, [horariosDisponiveis.dados?.primeiroHorarioDisponivel, barbeiroId, servicoId, data]);

  async function agendar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await executar({
      barbeariaId,
      barbeiroId,
      servicoId,
      data,
      hora,
      observacao
    });

    router.push("/meus-agendamentos");
    router.refresh();
  }

  function selecionarHoje() {
    setModoSelecaoData("HOJE");
    setData(dataHoje);
  }

  function selecionarAmanha() {
    setModoSelecaoData("AMANHA");
    setData(dataAmanha);
  }

  function selecionarEscolhaManual() {
    setModoSelecaoData("ESCOLHER_DIA");

    if (!data) {
      setData(dataHoje);
    }
  }

  const horariosVazios = !horariosDisponiveis.carregando && !!horariosDisponiveis.dados?.semHorariosDisponiveis;
  const podeConfirmarAgendamento =
    !carregando && !horariosDisponiveis.carregando && !!hora && !!horariosDisponiveis.dados?.horariosDisponiveis.length;

  return (
    <form className="cartao space-y-4 p-6" onSubmit={(evento) => void agendar(evento)}>
      <CampoSelecao label="Barbeiro" onChange={(evento) => setBarbeiroId(evento.target.value)} opcoes={opcoesBarbeiro} value={barbeiroId} />
      <CampoSelecao label="Servico" onChange={(evento) => setServicoId(evento.target.value)} opcoes={opcoesServico} value={servicoId} />

      <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
        <div className="flex flex-wrap gap-3">
          <Botao
            className={modoSelecaoData === "HOJE" ? "!border-destaque !bg-destaque !text-white" : ""}
            onClick={selecionarHoje}
            type="button"
            variante="secundario"
          >
            Hoje
          </Botao>
          <Botao
            className={modoSelecaoData === "AMANHA" ? "!border-destaque !bg-destaque !text-white" : ""}
            onClick={selecionarAmanha}
            type="button"
            variante="secundario"
          >
            Amanha
          </Botao>
          <Botao
            className={modoSelecaoData === "ESCOLHER_DIA" ? "!border-destaque !bg-destaque !text-white" : ""}
            onClick={selecionarEscolhaManual}
            type="button"
            variante="secundario"
          >
            Escolher dia
          </Botao>
        </div>

        {modoSelecaoData === "ESCOLHER_DIA" ? (
          <div className="mt-4">
            <CampoTexto
              label="Data do atendimento"
              min={dataHoje}
              onChange={(evento) => setData(evento.target.value || dataHoje)}
              type="date"
              value={data}
            />
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Data selecionada</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatarData(data)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Servico atual</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{servicoSelecionado?.nome ?? "Selecione um servico"}</p>
            {servicoSelecionado ? (
              <p className="mt-1 text-sm text-slate-600">
                {servicoSelecionado.duracaoMinutos} min + 5 min de intervalo • {formatarMoeda(servicoSelecionado.preco)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destaque">Horarios disponiveis</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {barbeiroSelecionado ? `Agenda de ${barbeiroSelecionado.nome}` : "Selecione um barbeiro"}
          </h3>
        </div>

        {horariosDisponiveis.carregando ? <EstadoCarregando texto="Carregando horarios disponiveis..." /> : null}

        {horariosDisponiveis.erro ? (
          <EstadoErro mensagem={horariosDisponiveis.erro} onTentarNovamente={() => void horariosDisponiveis.recarregar()} />
        ) : null}

        {!horariosDisponiveis.carregando && horariosVazios ? (
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              Atencao: Nenhum horario disponivel para este dia. Tente selecionar outra data.
            </p>
            {horariosDisponiveis.dados?.proximaDisponibilidade ? (
              <p className="text-sm text-amber-800">
                Proximo horario disponivel:{" "}
                {`${descreverDataDisponibilidade(horariosDisponiveis.dados.proximaDisponibilidade.data)} as ${
                  horariosDisponiveis.dados.proximaDisponibilidade.hora
                }`}
              </p>
            ) : null}
          </div>
        ) : null}

        {!horariosDisponiveis.carregando && horariosDisponiveis.dados?.horariosDisponiveis.length ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              O primeiro horario disponivel ja vem destacado para agilizar o agendamento.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {horariosDisponiveis.dados.horariosDisponiveis.map((horarioAtual, indice) => (
                <Botao
                  className={
                    hora === horarioAtual
                      ? "!border-destaque !bg-destaque !text-white"
                      : indice === 0
                        ? "!border-destaque/50 !bg-destaque/10 !text-destaque"
                        : ""
                  }
                  key={horarioAtual}
                  onClick={() => setHora(horarioAtual)}
                  type="button"
                  variante="secundario"
                >
                  {horarioAtual}
                </Botao>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <AreaTexto
        label="Observacao"
        onChange={(evento) => setObservacao(evento.target.value)}
        placeholder="Detalhes opcionais para o atendimento"
        value={observacao}
      />

      {erro ? <MensagemRetorno mensagem={erro} tipo="erro" /> : null}

      <Botao disabled={!podeConfirmarAgendamento} larguraTotal type="submit">
        {carregando ? "Confirmando..." : "Confirmar agendamento"}
      </Botao>
    </form>
  );
}
