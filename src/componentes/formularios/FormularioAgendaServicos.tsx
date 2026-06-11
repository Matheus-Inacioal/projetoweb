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
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";

export function FormularioAgendaServicos() {
  const [abaAtiva, setAbaAtiva] = useState<"agenda" | "servicos">("agenda");

  // 1. Carrega o perfil do prestador logado para descobrir o ID do prestador
  const { dados: perfil, carregando: cPerfil, erro: ePerfil } = useBuscarDados<any>("/api/perfil");
  const prestadorId = perfil?.prestador?.id;

  // 2. Carrega a agenda e serviços do prestador
  const { dados: slots, carregando: cSlots, erro: eSlots, recarregar: rSlots } =
    useBuscarDados<any[]>(prestadorId ? `/api/agenda?prestadorId=${prestadorId}` : null);

  const { dados: servicos, carregando: cServicos, erro: eServicos, recarregar: rServicos } =
    useBuscarDados<any[]>(prestadorId ? `/api/prestadores/${prestadorId}/servicos` : null);

  // 3. Estados dos Formulários
  // Agenda
  const [dataSlot, setDataSlot] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [msgAgenda, setMsgAgenda] = useState<string | null>(null);

  // Serviços
  const [nomeServico, setNomeServico] = useState("");
  const [descServico, setDescServico] = useState("");
  const [precoServico, setPrecoServico] = useState("");
  const [duracaoServico, setDuracaoServico] = useState("30");
  const [msgServico, setMsgServico] = useState<string | null>(null);

  // Mutations
  const { executar: criarSlot, carregando: addSlotCarregando, erro: addSlotErro } =
    useMutacao<any, any>("/api/agenda", "POST");

  const { executar: criarServico, carregando: addServicoCarregando, erro: addServicoErro } =
    useMutacao<any, any>(prestadorId ? `/api/prestadores/${prestadorId}/servicos` : "", "POST");

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!dataSlot || !horaInicio || !horaFim) return;
    setMsgAgenda(null);

    try {
      await criarSlot({
        data: dataSlot,
        horaInicio,
        horaFim
      });
      setMsgAgenda("Horário adicionado com sucesso!");
      setDataSlot("");
      setHoraInicio("");
      setHoraFim("");
      rSlots();
      setTimeout(() => setMsgAgenda(null), 3000);
    } catch {
      // erro tratado pelo hook
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm("Remover este horário da sua agenda?")) return;
    try {
      const response = await fetch(`/api/agenda/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        rSlots();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddServico(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeServico || !precoServico) return;
    setMsgServico(null);

    try {
      await criarServico({
        nome: nomeServico,
        descricao: descServico,
        preco: Number(precoServico),
        duracaoMinutos: Number(duracaoServico)
      });
      setMsgServico("Serviço cadastrado com sucesso!");
      setNomeServico("");
      setDescServico("");
      setPrecoServico("");
      setDuracaoServico("30");
      rServicos();
      setTimeout(() => setMsgServico(null), 3000);
    } catch {
      // erro tratado pelo hook
    }
  }

  async function handleDeleteServico(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const response = await fetch(`/api/prestadores/${prestadorId}/servicos/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        rServicos();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (cPerfil) return <EstadoCarregando texto="Carregando perfil..." />;
  if (ePerfil) return <EstadoErro mensagem={ePerfil} />;

  return (
    <div className="space-y-8">
      {/* Navegação por Abas */}
      <div className="flex gap-4 border-b border-bege_borda pb-1">
        <button
          onClick={() => setAbaAtiva("agenda")}
          className={`pb-3 text-lg font-serif font-bold border-b-2 transition ${
            abaAtiva === "agenda"
              ? "border-dourado text-verde_petroleo"
              : "border-transparent text-texto_secundario hover:text-texto_principal"
          }`}
        >
          Minha Agenda (Horários)
        </button>
        <button
          onClick={() => setAbaAtiva("servicos")}
          className={`pb-3 text-lg font-serif font-bold border-b-2 transition ${
            abaAtiva === "servicos"
              ? "border-dourado text-verde_petroleo"
              : "border-transparent text-texto_secundario hover:text-texto_principal"
          }`}
        >
          Catálogo de Serviços
        </button>
      </div>

      {/* ABA: AGENDA */}
      {abaAtiva === "agenda" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Adicionar Horário */}
          <form onSubmit={handleAddSlot} className="cartao p-6 bg-marfim border border-bege_borda h-fit space-y-4">
            <h3 className="font-bold text-verde_petroleo">Disponibilizar Horário</h3>
            {msgAgenda && <MensagemRetorno tipo="sucesso" mensagem={msgAgenda} />}
            {addSlotErro && <MensagemRetorno tipo="erro" mensagem={addSlotErro} />}

            <CampoTexto
              label="Data disponível"
              id="slot-data"
              type="date"
              value={dataSlot}
              onChange={(e) => setDataSlot(e.target.value)}
              required
            />

            <CampoTexto
              label="Hora Início"
              id="slot-inicio"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
            />

            <CampoTexto
              label="Hora Término"
              id="slot-fim"
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              required
            />

            <Botao type="submit" larguraTotal disabled={addSlotCarregando}>
              {addSlotCarregando ? "Adicionando..." : "Disponibilizar"}
            </Botao>
          </form>

          {/* Listagem Horários */}
          <div className="space-y-4">
            <h3 className="font-bold text-texto_principal">Horários Cadastrados</h3>
            {cSlots ? (
              <p className="text-sm text-texto_secundario animate-pulse">Buscando agenda...</p>
            ) : slots && slots.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {slots.map((s) => (
                  <div key={s.id} className="bg-white border border-bege_borda p-4 rounded-xl flex items-center justify-between shadow-suave">
                    <div>
                      <p className="font-bold text-texto_principal">{formatarData(s.data)}</p>
                      <p className="text-xs text-texto_secundario">⏰ {s.hora_inicio} às {s.hora_fim}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        s.disponivel ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {s.disponivel ? "Livre" : "Contratado"}
                      </span>
                    </div>
                    {s.disponivel && (
                      <button
                        onClick={() => handleDeleteSlot(s.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Agenda vazia" descricao="Adicione horários de atendimento no painel lateral." />
            )}
          </div>
        </div>
      )}

      {/* ABA: SERVIÇOS */}
      {abaAtiva === "servicos" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Adicionar Serviço */}
          <form onSubmit={handleAddServico} className="cartao p-6 bg-marfim border border-bege_borda h-fit space-y-4">
            <h3 className="font-bold text-verde_petroleo">Novo Serviço</h3>
            {msgServico && <MensagemRetorno tipo="sucesso" mensagem={msgServico} />}
            {addServicoErro && <MensagemRetorno tipo="erro" mensagem={addServicoErro} />}

            <CampoTexto
              label="Nome do Serviço"
              id="serv-nome"
              placeholder="Ex: Corte Degradê"
              value={nomeServico}
              onChange={(e) => setNomeServico(e.target.value)}
              required
            />

            <AreaTexto
              label="Descrição do Serviço"
              id="serv-desc"
              placeholder="Ex: Lavagem inclusa, finalizado com pomada."
              value={descServico}
              onChange={(e) => setDescServico(e.target.value)}
            />

            <CampoTexto
              label="Preço (R$)"
              id="serv-preco"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={precoServico}
              onChange={(e) => setPrecoServico(e.target.value)}
              required
            />

            <CampoTexto
              label="Duração em Minutos"
              id="serv-dur"
              type="number"
              value={duracaoServico}
              onChange={(e) => setDuracaoServico(e.target.value)}
              required
            />

            <Botao type="submit" larguraTotal disabled={addServicoCarregando}>
              {addServicoCarregando ? "Adicionando..." : "Cadastrar Serviço"}
            </Botao>
          </form>

          {/* Listagem Serviços */}
          <div className="space-y-4">
            <h3 className="font-bold text-texto_principal">Catálogo Vigente</h3>
            {cServicos ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando catálogo...</p>
            ) : servicos && servicos.length > 0 ? (
              <div className="grid gap-4">
                {servicos.map((serv) => (
                  <div key={serv.id} className="bg-white border border-bege_borda p-5 rounded-xl flex items-center justify-between shadow-suave">
                    <div>
                      <h4 className="font-bold text-texto_principal">{serv.nome}</h4>
                      <p className="text-xs text-texto_secundario mt-0.5">{serv.descricao || "Sem descrição."}</p>
                      <p className="text-xs text-texto_secundario mt-2">⏱️ {serv.duracao_minutos} min • 💰 {formatarMoeda(serv.preco)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteServico(serv.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum serviço" descricao="Cadastre seu primeiro serviço para habilitar agendamentos." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
