"use client";

import { useState } from "react";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { useMutacao } from "@/hooks/useMutacao";
import type { AgendamentoDetalhado, AnuncioResumo } from "@/tipos/dados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { MensagemRetorno } from "@/componentes/feedback/MensagemRetorno";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { AreaTexto } from "@/componentes/ui/AreaTexto";
import { Botao } from "@/componentes/ui/Botao";
import { formatarData, formatarMoeda } from "@/lib/utilitarios/datas";

export function DashboardPrestador() {
  const { dados: agendamentos, carregando: cCarregando, erro: cErro, recarregar: cRecarregar } =
    useBuscarDados<AgendamentoDetalhado[]>("/api/contratacoes");

  const { dados: anuncios, carregando: aCarregando, erro: aErro, recarregar: aRecarregar } =
    useBuscarDados<AnuncioResumo[]>("/api/anuncios");

  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [subindoImagem, setSubindoImagem] = useState(false);
  const [msgSucessoAd, setMsgSucessoAd] = useState<string | null>(null);

  const { executar: criarAnuncio, carregando: adCriando, erro: adErro } = useMutacao<any, any>("/api/anuncios", "POST");

  async function handleMudarStatus(id: string, novoStatus: string) {
    try {
      const response = await fetch(`/api/contratacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });
      if (response.ok) {
        cRecarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUploadImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setSubindoImagem(true);
    const formData = new FormData();
    formData.append("imagem", arquivo);

    try {
      const response = await fetch("/api/anuncios/imagem", {
        method: "POST",
        body: formData
      });
      const res = await response.json();
      if (res.sucesso && res.dados?.imagemUrl) {
        setImagemUrl(res.dados.imagemUrl);
      }
    } catch (err) {
      console.error("Erro ao subir imagem", err);
    } finally {
      setSubindoImagem(false);
    }
  }

  async function handleCriarAnuncio(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo || !novaDescricao) return;

    try {
      await criarAnuncio({
        titulo: novoTitulo,
        descricao: novaDescricao,
        imagemUrl
      });
      setNovoTitulo("");
      setNovaDescricao("");
      setImagemUrl(null);
      setMsgSucessoAd("Anúncio criado com sucesso!");
      aRecarregar();
      setTimeout(() => setMsgSucessoAd(null), 3000);
    } catch {
      // tratado pelo hook
    }
  }

  async function handleExcluirAnuncio(id: string) {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      const response = await fetch(`/api/anuncios/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        aRecarregar();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container-pagina py-8 space-y-12">
      <div>
        <p className="texto-destaque mb-2">PRESTADOR</p>
        <h1 className="text-4xl font-serif font-bold text-verde_petroleo">Painel de Controle</h1>
        <p className="text-texto_secundario">Gerencie seus agendamentos recebidos e promova seus serviços.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Agendamentos Recebidos */}
        <section className="space-y-6">
          <div className="border-b border-bege_borda pb-4">
            <h2 className="text-2xl font-serif font-bold text-texto_principal">Agenda de Atendimento</h2>
            <p className="text-sm text-texto_secundario">Acompanhe e confirme os serviços solicitados pelos clientes.</p>
          </div>

          {cCarregando ? (
            <EstadoCarregando texto="Carregando agendamentos..." />
          ) : cErro ? (
            <EstadoErro mensagem={cErro} onTentarNovamente={cRecarregar} />
          ) : agendamentos && agendamentos.length > 0 ? (
            <div className="space-y-4">
              {agendamentos.map((c) => (
                <div key={c.id} className="cartao p-6 bg-white border border-bege_borda flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-texto_principal">{c.consumidorNome}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === "pendente" && "bg-yellow-100 text-yellow-800"
                      } ${
                        c.status === "confirmado" && "bg-blue-100 text-blue-800"
                      } ${
                        c.status === "concluido" && "bg-green-100 text-green-800"
                      } ${
                        c.status === "cancelado" && "bg-red-100 text-red-800"
                      } ${
                        c.status === "pago" && "bg-purple-100 text-purple-800"
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-texto_secundario">
                      ✂️ <span className="font-medium text-texto_principal">{c.servicoNome}</span> • 💰 {formatarMoeda(c.valor)}
                    </p>
                    <p className="text-xs text-texto_secundario">
                      📅 Realizado em: {c.data ? formatarData(c.data) : "Não informada"} às {c.horario || ""}
                    </p>
                    {c.observacao && (
                      <p className="text-xs italic bg-marfim p-2 rounded text-texto_secundario">
                        💬 Obs: {c.observacao}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {c.status === "pendente" && (
                      <>
                        <Botao onClick={() => handleMudarStatus(c.id, "confirmado")} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700">
                          Confirmar
                        </Botao>
                        <Botao onClick={() => handleMudarStatus(c.id, "cancelado")} variante="perigo" className="px-3 py-1.5 text-xs">
                          Recusar
                        </Botao>
                      </>
                    )}

                    {c.status === "confirmado" && (
                      <>
                        <Botao onClick={() => handleMudarStatus(c.id, "concluido")} className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700">
                          Concluir
                        </Botao>
                        <Botao onClick={() => handleMudarStatus(c.id, "cancelado")} variante="perigo" className="px-3 py-1.5 text-xs">
                          Cancelar
                        </Botao>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio
              titulo="Nenhum agendamento encontrado"
              descricao="Quando os clientes contratarem seus serviços, eles aparecerão aqui."
            />
          )}
        </section>

        {/* Anúncios */}
        <section className="space-y-6">
          <div className="border-b border-bege_borda pb-4">
            <h2 className="text-2xl font-serif font-bold text-texto_principal">Divulgação (Anúncios)</h2>
            <p className="text-sm text-texto_secundario">Crie ofertas especiais para atrair mais clientes.</p>
          </div>

          {/* Form Novo Anúncio */}
          <form onSubmit={handleCriarAnuncio} className="cartao p-6 bg-marfim border border-bege_borda space-y-4">
            <h3 className="font-semibold text-verde_petroleo">Criar Novo Anúncio</h3>
            {msgSucessoAd && <MensagemRetorno tipo="sucesso" mensagem={msgSucessoAd} />}
            {adErro && <MensagemRetorno tipo="erro" mensagem={adErro} />}

            <CampoTexto
              label="Título da Oferta"
              id="ad-titulo"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              placeholder="Ex: Combo degradê + barba"
              required
            />

            <AreaTexto
              label="Descrição do Anúncio"
              id="ad-desc"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Descreva a oferta em detalhes..."
              required
            />

            <label className="block space-y-2">
              <span className="block text-sm font-medium text-slate-700">Imagem do Anúncio (Opcional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImagem}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-verde_petroleo file:text-white hover:file:bg-verde_escuro"
              />
            </label>

            {subindoImagem && <p className="text-xs text-texto_secundario animate-pulse">Subindo imagem...</p>}
            {imagemUrl && (
              <div className="relative h-24 w-full rounded overflow-hidden bg-slate-200">
                <img src={imagemUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}

            <Botao type="submit" larguraTotal disabled={adCriando || subindoImagem}>
              {adCriando ? "Criando..." : "Criar Anúncio"}
            </Botao>
          </form>

          {/* Lista de Anúncios */}
          <div className="space-y-4">
            <h3 className="font-semibold text-texto_principal">Seus Anúncios Cadastrados</h3>

            {aCarregando ? (
              <EstadoCarregando texto="Carregando anúncios..." />
            ) : aErro ? (
              <EstadoErro mensagem={aErro} onTentarNovamente={aRecarregar} />
            ) : anuncios && anuncios.length > 0 ? (
              <div className="space-y-4">
                {anuncios.map((ad) => (
                  <div key={ad.id} className="cartao p-4 bg-white border border-bege_borda space-y-3">
                    {ad.imagemUrl && (
                      <div className="h-32 w-full rounded overflow-hidden">
                        <img src={ad.imagemUrl} alt={ad.titulo} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-texto_principal text-base">{ad.titulo}</h4>
                      <p className="text-xs text-texto_secundario mt-1 leading-relaxed">{ad.descricao}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-bege_borda">
                      <span className={`text-xs px-2 py-0.5 rounded ${ad.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {ad.ativo ? "Ativo" : "Inativo"}
                      </span>
                      <button
                        onClick={() => handleExcluirAnuncio(ad.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum anúncio criado" descricao="Promova seu trabalho criando ofertas de serviços." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
