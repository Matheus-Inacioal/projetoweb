"use client";

import { useState, useEffect } from "react";
import { criarClienteSupabaseNavegador } from "@/lib/banco/supabase-client";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { Search, Eye, Calendar, ShoppingBag, Heart, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Consumidor {
  id: string;
  usuario_id: string;
  created_at: string;
  usuarios: {
    nome: string;
    email: string;
    telefone: string | null;
    foto_url: string | null;
  } | null;
}

interface AgendamentoHistorico {
  id: string;
  agenda_data: string | null;
  hora_inicio: string | null;
  status: string;
  valor: number;
  servico_nome: string;
  prestador_nome: string;
}

interface PedidoHistorico {
  id: string;
  valor_total: number;
  status: string;
  created_at: string;
}

interface FavoritoHistorico {
  id: string;
  prestadores: {
    especialidade: string;
    usuarios: {
      nome: string;
    } | null;
  } | null;
}

export default function ConsumidoresAdminPage() {
  const [consumidores, setConsumidores] = useState<Consumidor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Modal stats
  const [consumidorSelecionado, setConsumidorSelecionado] = useState<Consumidor | null>(null);
  const [agendamentos, setAgendamentos] = useState<AgendamentoHistorico[]>([]);
  const [pedidos, setPedidos] = useState<PedidoHistorico[]>([]);
  const [favoritos, setFavoritos] = useState<FavoritoHistorico[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const supabase = criarClienteSupabaseNavegador();

  const carregarConsumidores = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("consumidores")
        .select("*, usuarios(nome, email, telefone, foto_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConsumidores((data as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar consumidores: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarConsumidores();
  }, []);

  const abrirHistorico = async (consumidor: Consumidor) => {
    setConsumidorSelecionado(consumidor);
    setCarregandoHistorico(true);
    try {
      // 1. Carrega histórico de agendamentos
      const { data: ags, error: agsErr } = await supabase
        .from("vw_agendamentos_detalhados")
        .select("agendamento_id, agenda_data, hora_inicio, status, valor, servico_nome, prestador_nome")
        .eq("consumidor_id", consumidor.id);
      if (agsErr) throw agsErr;
      
      setAgendamentos(
        (ags || []).map((a: any) => ({
          id: a.agendamento_id,
          agenda_data: a.agenda_data || null,
          hora_inicio: a.hora_inicio || null,
          status: a.status || "pendente",
          valor: Number(a.valor || 0),
          servico_nome: a.servico_nome || "Serviço Removido",
          prestador_nome: a.prestador_nome || "Barbeiro Removido"
        }))
      );

      // 2. Carrega histórico de pedidos de produtos
      const { data: pds, error: pdsErr } = await supabase
        .from("pedidos")
        .select("id, valor_total, status, created_at")
        .eq("consumidor_id", consumidor.id)
        .order("created_at", { ascending: false });
      if (pdsErr) throw pdsErr;
      
      setPedidos(
        (pds || []).map((p: any) => ({
          id: p.id,
          valor_total: Number(p.valor_total),
          status: p.status,
          created_at: p.created_at
        }))
      );

      // 3. Carrega favoritos
      const { data: favs, error: favsErr } = await supabase
        .from("favoritos")
        .select("id, prestadores(especialidade, usuarios(nome))")
        .eq("consumidor_id", consumidor.id);
      if (favsErr) throw favsErr;
      
      setFavoritos((favs as any) || []);
    } catch (err: any) {
      toast.error("Erro ao carregar dados do histórico: " + err.message);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const filtrados = consumidores.filter(c => {
    const nome = c.usuarios?.nome || "";
    const email = c.usuarios?.email || "";
    const query = busca.toLowerCase();

    return nome.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const formatarData = (dataSql?: string | null) => {
    if (!dataSql) return "--/--/----";
    try {
      // If it contains a "T" or timezone info, it's a full ISO timestamp
      if (dataSql.includes("T") || dataSql.includes("+") || dataSql.includes("Z")) {
        return new Date(dataSql).toLocaleDateString("pt-BR");
      }
      // If it is just a date string like YYYY-MM-DD
      const partes = dataSql.split("-");
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return new Date(dataSql).toLocaleDateString("pt-BR");
    } catch {
      return dataSql;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <p className="texto-destaque mb-1">Módulos de Controle</p>
        <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Gestão de Consumidores</h1>
        <p className="text-sm text-texto_secundario">Visualize perfis de clientes, veja seu histórico de compras, agendamentos e preferências.</p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative w-full bg-off_white p-4 rounded-xl border border-bege_borda shadow-suave">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-texto_secundario" />
        <input
          type="text"
          placeholder="Buscar cliente por nome ou email..."
          className="campo-base pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela de Consumidores */}
      {carregando ? (
        <EstadoCarregando texto="Carregando lista de consumidores..." />
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-verde_petroleo/5 border-b border-bege_borda text-xs font-semibold text-verde_petroleo uppercase tracking-wider">
                <th className="p-4">Cliente</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Data de Cadastro</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bege_borda text-sm text-texto_principal">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-texto_secundario font-medium">
                    Nenhum cliente correspondente encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-bege_borda/10 transition">
                    <td className="p-4 flex items-center gap-3">
                      {c.usuarios?.foto_url ? (
                        <img
                          src={c.usuarios.foto_url}
                          alt={c.usuarios.nome}
                          className="w-10 h-10 rounded-full object-cover border border-bege_borda"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-verde_petroleo/10 text-verde_petroleo flex items-center justify-center font-bold font-serif">
                          {c.usuarios?.nome.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-verde_petroleo">{c.usuarios?.nome}</span>
                    </td>
                    <td className="p-4 text-texto_secundario">{c.usuarios?.email}</td>
                    <td className="p-4 text-texto_secundario">{c.usuarios?.telefone || "Não informado"}</td>
                    <td className="p-4 text-texto_secundario">{formatarData(c.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => abrirHistorico(c)}
                          className="botao-secundario px-4 py-1.5 text-xs flex items-center gap-1.5"
                          title="Visualizar Histórico"
                        >
                          <Eye className="w-4 h-4" />
                          Histórico
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Histórico Completo */}
      {consumidorSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-off_white rounded-2xl border border-bege_borda shadow-premium w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setConsumidorSelecionado(null)}
              className="absolute right-4 top-4 p-1 hover:bg-bege_borda/20 rounded-full text-texto_secundario transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="pb-6 border-b border-bege_borda space-y-1">
              <h2 className="text-2xl font-serif font-bold text-verde_petroleo">
                Ficha do Cliente: {consumidorSelecionado.usuarios?.nome}
              </h2>
              <p className="text-sm text-texto_secundario">
                Contato: {consumidorSelecionado.usuarios?.email} | {consumidorSelecionado.usuarios?.telefone || "Sem telefone"}
              </p>
            </div>

            {/* Abas Internas com Scroll */}
            <div className="flex-1 overflow-y-auto py-6 space-y-8">
              {carregandoHistorico ? (
                <EstadoCarregando texto="Buscando histórico de compras e contratações..." />
              ) : (
                <>
                  {/* Agendamentos */}
                  <div className="space-y-3">
                    <h3 className="text-base font-serif font-bold text-verde_escuro flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-dourado" />
                      Agendamentos de Serviços ({agendamentos.length})
                    </h3>
                    {agendamentos.length === 0 ? (
                      <p className="text-sm text-texto_secundario italic">Nenhum agendamento registrado para este cliente.</p>
                    ) : (
                      <div className="border border-bege_borda rounded-xl overflow-hidden divide-y divide-bege_borda">
                        {agendamentos.map((a) => (
                          <div key={a.id} className="p-4 bg-off_white flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-verde_petroleo">{a.servico_nome}</p>
                              <p className="text-xs text-texto_secundario">Barbeiro: {a.prestador_nome}</p>
                              <p className="text-xs text-texto_secundario">Data/Hora: {formatarData(a.agenda_data)} às {a.hora_inicio?.slice(0, 5) || "--:--"}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-serif font-bold text-verde_escuro">R$ {a.valor.toFixed(2)}</span>
                              <p className="text-xs font-semibold capitalize mt-1 text-dourado">{a.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Compras de Produtos */}
                  <div className="space-y-3">
                    <h3 className="text-base font-serif font-bold text-verde_escuro flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-dourado" />
                      Pedidos e E-commerce ({pedidos.length})
                    </h3>
                    {pedidos.length === 0 ? (
                      <p className="text-sm text-texto_secundario italic">Nenhum pedido de produtos realizado.</p>
                    ) : (
                      <div className="border border-bege_borda rounded-xl overflow-hidden divide-y divide-bege_borda">
                        {pedidos.map((p) => (
                          <div key={p.id} className="p-4 bg-off_white flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-verde_petroleo">Pedido ID: #{p.id?.slice(0, 8).toUpperCase() || "REMOVIDO"}</p>
                              <p className="text-xs text-texto_secundario">Data da Compra: {formatarData(p.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-serif font-bold text-verde_escuro">R$ {p.valor_total.toFixed(2)}</span>
                              <p className="text-xs font-semibold capitalize mt-1 text-dourado">{p.status.replace("_", " ")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Favoritos */}
                  <div className="space-y-3">
                    <h3 className="text-base font-serif font-bold text-verde_escuro flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                      Prestadores Favoritos ({favoritos.length})
                    </h3>
                    {favoritos.length === 0 ? (
                      <p className="text-sm text-texto_secundario italic">Nenhum profissional favoritado.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {favoritos.map((f) => (
                          <div key={f.id} className="px-4 py-2 border border-bege_borda rounded-full bg-verde_petroleo/5 text-sm font-medium text-verde_petroleo flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-dourado" />
                            <span>{f.prestadores?.usuarios?.nome || "Profissional"}</span>
                            <span className="text-xs text-texto_secundario">({f.prestadores?.especialidade})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Rodapé */}
            <div className="border-t border-bege_borda pt-4">
              <button
                onClick={() => setConsumidorSelecionado(null)}
                className="botao-primario w-full py-2 text-sm"
              >
                Voltar para Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
