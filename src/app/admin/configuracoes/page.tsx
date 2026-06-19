"use client";

import { useState } from "react";
import { Settings, Shield, CreditCard, Bell, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function ConfiguracoesAdminPage() {
  const [comissao, setComissao] = useState("15");
  const [cancelamentoMinutos, setCancelamentoMinutos] = useState("120");
  const [mockPayments, setMockPayments] = useState(true);
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      toast.success("Configurações salvas com sucesso!");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <p className="texto-destaque mb-1">Módulos de Controle</p>
        <h1 className="text-3xl font-serif font-bold text-verde_petroleo">Configurações Gerais</h1>
        <p className="text-sm text-texto_secundario">Ajuste chaves de API, taxas de serviço do marketplace e regras de agendamento.</p>
      </div>

      <form onSubmit={salvar} className="grid gap-6 md:grid-cols-2">
        {/* Regulamento do Marketplace */}
        <div className="cartao p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
            <Shield className="w-5 h-5 text-dourado" />
            Regras de Negócio
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                Taxa de Comissão do Marketplace (%)
              </label>
              <input
                type="number"
                className="campo-base"
                value={comissao}
                onChange={(e) => setComissao(e.target.value)}
              />
              <p className="text-[10px] text-texto_secundario mt-1">
                Porcentagem retida de cada agendamento/venda aprovada no sistema.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-texto_secundario uppercase mb-1.5">
                Prazo Limite para Cancelamento (Minutos)
              </label>
              <input
                type="number"
                className="campo-base"
                value={cancelamentoMinutos}
                onChange={(e) => setCancelamentoMinutos(e.target.value)}
              />
              <p className="text-[10px] text-texto_secundario mt-1">
                Tempo mínimo antes do horário do agendamento para permitir reembolso automático.
              </p>
            </div>
          </div>
        </div>

        {/* Integrações */}
        <div className="cartao p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-dourado" />
            Gateway de Pagamento
          </h2>

          <div className="space-y-4">
            <div className="p-3 bg-bege_borda/15 rounded-lg border border-bege_borda/40">
              <p className="text-xs font-semibold text-verde_petroleo">Mercado Pago Credentials</p>
              <p className="text-[10px] text-texto_secundario mt-0.5">Carregado a partir do arquivo .env.local</p>
              <div className="mt-2 font-mono text-xs bg-marfim p-2 rounded border border-bege_borda/30 truncate">
                PublicKey: TEST-be4a8a82-0e00-4177-a97d...
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="mock"
                className="w-4 h-4 mt-0.5 accent-verde_petroleo cursor-pointer"
                checked={mockPayments}
                onChange={(e) => setMockPayments(e.target.checked)}
              />
              <div>
                <label htmlFor="mock" className="text-sm font-semibold text-texto_principal select-none cursor-pointer">
                  Modo Simulação Ativo (Mock Mode)
                </label>
                <p className="text-xs text-texto_secundario mt-0.5">
                  Permite gerar pagamentos simulados e confirmá-los imediatamente de forma fictícia para apresentações acadêmicas e testes locais.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="cartao p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
            <Bell className="w-5 h-5 text-dourado" />
            Notificações & Alertas
          </h2>

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="notif_email"
              className="w-4 h-4 mt-0.5 accent-verde_petroleo cursor-pointer"
              checked={notificacoesEmail}
              onChange={(e) => setNotificacoesEmail(e.target.checked)}
            />
            <div>
              <label htmlFor="notif_email" className="text-sm font-semibold text-texto_principal select-none cursor-pointer">
                Disparar Webhooks & Avisos por Email
              </label>
              <p className="text-xs text-texto_secundario mt-0.5">
                Envia emails automatizados de confirmação e alteração de horários para clientes e prestadores de serviços.
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="cartao p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-verde_petroleo flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-dourado" />
            Status do Sistema
          </h2>

          <div className="space-y-2 text-sm text-texto_secundario">
            <div className="flex justify-between border-b border-bege_borda/50 pb-1.5">
              <span>Versão do App</span>
              <span className="font-semibold text-texto_principal">v0.2.0</span>
            </div>
            <div className="flex justify-between border-b border-bege_borda/50 pb-1.5">
              <span>Conexão Supabase</span>
              <span className="font-semibold text-emerald-600">Conectado (URL Ativa)</span>
            </div>
            <div className="flex justify-between">
              <span>Ambiente</span>
              <span className="font-semibold text-texto_principal">Desenvolvimento Local</span>
            </div>
          </div>
        </div>

        {/* Ação Principal */}
        <div className="col-span-full pt-4 border-t border-bege_borda">
          <button
            type="submit"
            disabled={salvando}
            className="botao-primario px-6 py-2.5 font-bold float-right"
          >
            {salvando ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
