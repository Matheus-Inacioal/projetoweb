"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { useMutacao } from "@/hooks/useMutacao";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { Botao } from "@/componentes/ui/Botao";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { formatarMoeda, formatarData } from "@/lib/utilitarios/datas";

export function DetalhesPrestador({ prestadorId }: { prestadorId: string }) {
  const router = useRouter();

  // 1. Carrega dados do prestador
  const { dados: prestador, carregando, erro, recarregar } = useBuscarDados<any>(`/api/prestadores/${prestadorId}`);

  // 2. Carrega status de favorito
  const { dados: favDados, recarregar: recarregarFav } = useBuscarDados<any>(`/api/favoritos/${prestadorId}`);
  const [eFavorito, setEFavorito] = useState(false);

  // 3. Gerenciamento do fluxo de agendamento
  const [servicoSelecionado, setServicoSelecionado] = useState<any | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [slotSelecionado, setSlotSelecionado] = useState<any | null>(null);
  const [observacao, setObservacao] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [erroAgendamento, setErroAgendamento] = useState<string | null>(null);

  // 4. Carrega horários disponíveis para a data selecionada
  const urlAgenda = dataSelecionada ? `/api/agenda?prestadorId=${prestadorId}&data=${dataSelecionada}` : null;
  const { dados: slotsDisponiveis, carregando: carregandoAgenda } = useBuscarDados<any[]>(urlAgenda);

  const { executar: favoritar } = useMutacao<any, any>("/api/favoritos", "POST");
  const { executar: contratar, carregando: contratando } = useMutacao<any, any>("/api/contratacoes", "POST");

  useEffect(() => {
    if (favDados) {
      setEFavorito(favDados.eFavorito);
    }
  }, [favDados]);

  // Limpa o slot selecionado caso mude de data
  useEffect(() => {
    setSlotSelecionado(null);
  }, [dataSelecionada]);

  async function handleToggleFavorito() {
    try {
      if (eFavorito) {
        await fetch(`/api/favoritos/${prestadorId}`, { method: "DELETE" });
        setEFavorito(false);
      } else {
        await favoritar({ prestadorId });
        setEFavorito(true);
      }
      recarregarFav();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmarAgendamento(e: React.FormEvent) {
    e.preventDefault();
    if (!servicoSelecionado || !slotSelecionado) return;
    setErroAgendamento(null);

    try {
      await contratar({
        prestadorId,
        agendaId: slotSelecionado.id,
        servicoId: servicoSelecionado.id,
        observacao
      });
      setSucesso(true);
      setTimeout(() => {
        router.push("/contratacoes");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setErroAgendamento(err.message || "Erro ao realizar agendamento.");
    }
  }

  if (carregando) {
    return <EstadoCarregando texto="Carregando detalhes do prestador..." />;
  }

  if (erro || !prestador) {
    return <EstadoErro mensagem={erro || "Prestador não encontrado."} onTentarNovamente={recarregar} />;
  }

  return (
    <div className="container-pagina py-12 space-y-12">
      {/* Header do Prestador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-off_white to-marfim p-8 rounded-3xl border border-bege_borda shadow-suave">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-bege_borda border-2 border-dourado shadow-suave">
            {prestador.fotoUrl ? (
              <img src={prestador.fotoUrl} alt={prestador.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-verde_petroleo font-black">
                {prestador.nome.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-texto_principal">{prestador.nome}</h1>
            <p className="text-sm font-semibold text-dourado uppercase tracking-wider">{prestador.especialidade || "Geral"}</p>
            <p className="text-xs text-texto_secundario">📍 {prestador.endereco} • {prestador.cidade}</p>
            {prestador.telefone && <p className="text-xs text-texto_secundario">📞 {prestador.telefone}</p>}
          </div>
        </div>

        <div>
          <Botao onClick={handleToggleFavorito} variante="secundario" className="flex items-center gap-2">
            {eFavorito ? "❤️ Favorito" : "🤍 Favoritar"}
          </Botao>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          {/* Sobre */}
          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold text-texto_principal border-b border-bege_borda pb-2">Sobre o Profissional</h2>
            <p className="text-sm text-texto_secundario leading-relaxed">
              {prestador.descricao || "Este profissional ainda não adicionou uma descrição."}
            </p>
          </section>

          {/* Anúncios/Ofertas */}
          {prestador.anuncios && prestador.anuncios.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-texto_principal border-b border-bege_borda pb-2">Ofertas & Anúncios</h2>
              <div className="grid gap-4">
                {prestador.anuncios.map((ad: any) => (
                  <div key={ad.id} className="bg-marfim p-6 rounded-2xl border border-bege_borda space-y-3">
                    {ad.imagemUrl && (
                      <img src={ad.imagemUrl} alt={ad.titulo} className="h-40 w-full object-cover rounded-xl" />
                    )}
                    <h3 className="font-bold text-verde_petroleo text-lg">{ad.titulo}</h3>
                    <p className="text-xs text-texto_secundario">{ad.descricao}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lista de Serviços */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-texto_principal border-b border-bege_borda pb-2">Serviços Disponíveis</h2>
            {prestador.servicos && prestador.servicos.length > 0 ? (
              <div className="grid gap-4">
                {prestador.servicos.map((serv: any) => (
                  <div
                    key={serv.id}
                    onClick={() => setServicoSelecionado(serv)}
                    className={`cartao p-5 border cursor-pointer hover:border-dourado transition flex justify-between items-center bg-white ${
                      servicoSelecionado?.id === serv.id ? "border-dourado ring-1 ring-dourado bg-marfim" : "border-bege_borda"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-texto_principal">{serv.nome}</h3>
                      <p className="text-xs text-texto_secundario mt-1">{serv.descricao}</p>
                      <p className="text-xs font-medium text-texto_secundario mt-2">⏱️ {serv.duracaoMinutos} min</p>
                    </div>
                    <span className="font-serif font-bold text-verde_petroleo">{formatarMoeda(serv.preco)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum serviço cadastrado" descricao="Este prestador ainda não cadastrou nenhum serviço." />
            )}
          </section>
        </div>

        {/* Agendamento */}
        <div className="h-fit cartao p-8 bg-marfim border border-bege_borda sticky top-8 space-y-6">
          <h2 className="text-2xl font-serif font-bold text-verde_petroleo border-b border-bege_borda pb-2">Agendar Serviço</h2>

          {sucesso && <MensagemRetorno tipo="sucesso" className="text-sm" mensagem="Agendamento efetuado! Redirecionando..." />}
          {erroAgendamento && <MensagemRetorno tipo="erro" className="text-sm" mensagem={erroAgendamento} />}

          {!servicoSelecionado ? (
            <p className="text-sm text-texto_secundario">Selecione um serviço ao lado para começar.</p>
          ) : (
            <form onSubmit={handleConfirmarAgendamento} className="space-y-6">
              {/* Resumo do Serviço Selecionado */}
              <div className="bg-white p-4 rounded-xl border border-bege_borda flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-dourado uppercase tracking-wider">Serviço Selecionado</p>
                  <p className="font-bold text-texto_principal">{servicoSelecionado.nome}</p>
                </div>
                <p className="font-serif font-black text-verde_petroleo">{formatarMoeda(servicoSelecionado.preco)}</p>
              </div>

              {/* Data */}
              <label className="block space-y-2">
                <span className="block text-sm font-medium text-slate-700">Selecione a Data</span>
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="campo-base bg-white w-full"
                  required
                />
              </label>

              {/* Horários */}
              {dataSelecionada && (
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-slate-700">Horários Disponíveis</span>
                  {carregandoAgenda ? (
                    <p className="text-xs text-texto_secundario animate-pulse">Carregando horários...</p>
                  ) : slotsDisponiveis && slotsDisponiveis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {slotsDisponiveis.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSlotSelecionado(slot)}
                          className={`p-2 text-xs font-bold rounded-lg border text-center transition ${
                            slotSelecionado?.id === slot.id
                              ? "bg-verde_petroleo text-white border-verde_petroleo"
                              : "bg-white border-bege_borda text-texto_principal hover:border-dourado"
                          }`}
                        >
                          {slot.hora_inicio}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-red-600">Nenhum horário disponível para esta data.</p>
                  )}
                </div>
              )}

              {/* Detalhes Finais */}
              {slotSelecionado && (
                <div className="space-y-4 pt-4 border-t border-bege_borda">
                  <div className="text-sm text-texto_principal space-y-1">
                    <p>📅 Data: <span className="font-bold">{formatarData(dataSelecionada)}</span></p>
                    <p>⏱️ Horário: <span className="font-bold">{slotSelecionado.hora_inicio}</span></p>
                  </div>

                  <AreaTexto
                    label="Alguma Observação? (Opcional)"
                    id="booking-obs"
                    placeholder="Ex: Cabelo curto, barba desenhada..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="bg-white"
                  />

                  <Botao type="submit" larguraTotal disabled={contratando}>
                    {contratando ? "Confirmando..." : "Confirmar Agendamento"}
                  </Botao>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
