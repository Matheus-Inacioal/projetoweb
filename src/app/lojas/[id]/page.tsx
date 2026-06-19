"use client";

import { useState } from "react";
import Link from "next/link";
import { useBuscarDados } from "@/hooks/useBuscarDados";
import { EstadoCarregando } from "@/componentes/feedback/EstadoCarregando";
import { EstadoErro } from "@/componentes/feedback/EstadoErro";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { Botao } from "@/componentes/ui/Botao";
import { formatarMoeda } from "@/lib/utilitarios/datas";
import toast, { Toaster } from "react-hot-toast";
import { Star, MapPin, Phone, Mail, FileText, Scissors, ShoppingBag, User } from "lucide-react";

export default function LojaDetalhesPage({ params }: { params: { id: string } }) {
  const [abaAtiva, setAbaAtiva] = useState<"barbeiros" | "servicos" | "produtos">("barbeiros");
  const [adicionandoCarrinho, setAdicionandoCarrinho] = useState<string | null>(null);

  // 1. Carrega dados da loja
  const { dados: loja, carregando: cLoja, erro: eLoja, recarregar: rLoja } =
    useBuscarDados<any>(`/api/lojas/${params.id}`);

  // 2. Carrega barbeiros, serviços e produtos
  const { dados: barbeiros, carregando: cBarbeiros } =
    useBuscarDados<any[]>(`/api/lojas/${params.id}/prestadores`);

  const { dados: servicos, carregando: cServicos } =
    useBuscarDados<any[]>(`/api/lojas/${params.id}/servicos`);

  const { dados: produtos, carregando: cProdutos } =
    useBuscarDados<any[]>(`/api/lojas/${params.id}/produtos`);

  async function handleAdicionarAoCarrinho(produtoId: string) {
    setAdicionandoCarrinho(produtoId);
    try {
      const response = await fetch("/api/carrinho/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade: 1 })
      });
      const res = await response.json();
      if (response.ok && res.sucesso) {
        toast.success(res.mensagem || "Produto adicionado ao carrinho!");
      } else {
        toast.error(res.mensagem || "Erro ao adicionar ao carrinho.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setAdicionandoCarrinho(null);
    }
  }

  if (cLoja) return <EstadoCarregando texto="Carregando dados da barbearia..." />;
  if (eLoja || !loja) return <EstadoErro mensagem={eLoja || "Barbearia não encontrada."} onTentarNovamente={rLoja} />;

  return (
    <div className="container-pagina py-12 space-y-12">
      <Toaster position="top-center" />

      {/* Cabeçalho Premium da Loja */}
      <div className="relative rounded-3xl overflow-hidden border border-bege_borda bg-white shadow-suave">
        {/* Capa */}
        <div className="h-48 w-full bg-gradient-to-r from-verde_petroleo to-verde_escuro relative">
          {loja.capaUrl && (
            <img src={loja.capaUrl} alt={loja.nome} className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Informações Principais */}
        <div className="p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          {/* Logo sobreposto */}
          <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-premium absolute -top-12 left-8">
            {loja.logoUrl ? (
              <img src={loja.logoUrl} alt={loja.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-verde_petroleo text-3xl bg-marfim">
                {loja.nome.charAt(0)}
              </div>
            )}
          </div>

          <div className="pt-12 md:pt-0 space-y-2 md:pl-28">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-texto_principal">{loja.nome}</h1>
            <p className="text-sm text-texto_secundario leading-relaxed max-w-xl">
              {loja.descricao || "Uma experiência premium de estética e corte masculino."}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-texto_secundario">
              {loja.endereco && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-dourado" /> {loja.endereco}, {loja.cidade} - {loja.estado}
                </span>
              )}
              {loja.telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-dourado" /> {loja.telefone}
                </span>
              )}
              {loja.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-dourado" /> {loja.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-marfim px-4 py-2 rounded-xl border border-bege_borda self-start md:self-end">
            <Star className="h-5 w-5 text-dourado fill-current" />
            <span className="font-serif font-black text-verde_petroleo text-lg">5.0</span>
            <span className="text-xs text-texto_secundario">Avaliação</span>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-6 border-b border-bege_borda pb-1">
        <button
          onClick={() => setAbaAtiva("barbeiros")}
          className={`pb-3 text-lg font-serif font-bold border-b-2 transition flex items-center gap-2 ${
            abaAtiva === "barbeiros"
              ? "border-dourado text-verde_petroleo"
              : "border-transparent text-texto_secundario hover:text-texto_principal"
          }`}
        >
          <User className="h-5 w-5" /> Equipe de Barbeiros
        </button>
        <button
          onClick={() => setAbaAtiva("servicos")}
          className={`pb-3 text-lg font-serif font-bold border-b-2 transition flex items-center gap-2 ${
            abaAtiva === "servicos"
              ? "border-dourado text-verde_petroleo"
              : "border-transparent text-texto_secundario hover:text-texto_principal"
          }`}
        >
          <Scissors className="h-5 w-5" /> Catálogo de Serviços
        </button>
        <button
          onClick={() => setAbaAtiva("produtos")}
          className={`pb-3 text-lg font-serif font-bold border-b-2 transition flex items-center gap-2 ${
            abaAtiva === "produtos"
              ? "border-dourado text-verde_petroleo"
              : "border-transparent text-texto_secundario hover:text-texto_principal"
          }`}
        >
          <ShoppingBag className="h-5 w-5" /> Loja de Produtos
        </button>
      </div>

      {/* Renderização das Abas */}
      <div className="min-h-96">
        {/* ABA BARBEIROS */}
        {abaAtiva === "barbeiros" && (
          <div>
            {cBarbeiros ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando profissionais...</p>
            ) : barbeiros && barbeiros.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {barbeiros.map((b) => (
                  <div key={b.id} className="cartao p-6 border border-bege_borda bg-white hover:shadow-premium transition flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-bege_borda border border-dourado flex-shrink-0">
                        {b.fotoUrl ? (
                          <img src={b.fotoUrl} alt={b.nome} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-serif text-xl font-bold text-verde_petroleo bg-marfim">
                            {b.nome.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-texto_principal">{b.nome}</h3>
                        <p className="text-xs font-semibold text-dourado uppercase tracking-wider">{b.especialidade || "Geral"}</p>
                      </div>
                    </div>

                    <p className="text-xs text-texto_secundario leading-relaxed line-clamp-3 my-4">
                      {b.descricao || "Profissional especialista em visagismo e cortes sob medida."}
                    </p>

                    <Link href={`/prestadores/${b.id}`} className="botao-primario w-full text-center block">
                      Agendar com {b.nome.split(" ")[0]}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum barbeiro cadastrado" descricao="Esta barbearia ainda não registrou barbeiros em sua equipe." />
            )}
          </div>
        )}

        {/* ABA SERVIÇOS */}
        {abaAtiva === "servicos" && (
          <div>
            {cServicos ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando catálogo...</p>
            ) : servicos && servicos.length > 0 ? (
              <div className="grid gap-4 max-w-3xl">
                {servicos.map((s) => (
                  <div key={s.id} className="bg-white border border-bege_borda p-6 rounded-2xl flex justify-between items-center shadow-suave">
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-lg text-texto_principal">{s.nome}</h4>
                      <p className="text-xs text-texto_secundario">{s.descricao || "Sem descrição."}</p>
                      <p className="text-xs text-texto_secundario font-semibold pt-1">⏱️ {s.duracao_minutos} min</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-serif font-black text-verde_petroleo text-xl">{formatarMoeda(s.preco)}</p>
                      <p className="text-[10px] text-texto_secundario uppercase tracking-wider font-bold">
                        Agende na aba Barbeiros
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum serviço disponível" descricao="Esta barbearia ainda não adicionou serviços ao catálogo." />
            )}
          </div>
        )}

        {/* ABA PRODUTOS */}
        {abaAtiva === "produtos" && (
          <div>
            {cProdutos ? (
              <p className="text-sm text-texto_secundario animate-pulse">Carregando produtos...</p>
            ) : produtos && produtos.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {produtos.map((p) => (
                  <div key={p.id} className="cartao bg-white border border-bege_borda p-5 hover:shadow-premium transition flex flex-col justify-between">
                    <div>
                      {/* Imagem do Produto */}
                      <div className="h-40 w-full bg-marfim rounded-xl overflow-hidden border border-bege_borda flex items-center justify-center mb-4 relative">
                        {p.imagemUrl ? (
                          <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-12 w-12 text-bege_borda" />
                        )}
                        {p.estoque <= p.estoqueMinimo && (
                          <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Estoque Baixo
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] bg-marfim text-dourado border border-bege_borda px-2 py-0.5 rounded font-bold uppercase">
                          {p.categoria || "Geral"}
                        </span>
                        <h4 className="font-bold text-texto_principal text-base pt-1">{p.nome}</h4>
                        <p className="text-xs text-texto_secundario line-clamp-2">{p.descricao || "Sem descrição."}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-texto_secundario">Estoque: {p.estoque} un</span>
                        <span className="font-serif font-black text-verde_petroleo text-lg">{formatarMoeda(p.preco)}</span>
                      </div>
                      <Botao
                        onClick={() => handleAdicionarAoCarrinho(p.id)}
                        larguraTotal
                        disabled={adicionandoCarrinho === p.id || p.estoque <= 0}
                      >
                        {p.estoque <= 0
                          ? "Esgotado"
                          : adicionandoCarrinho === p.id
                          ? "Adicionando..."
                          : "Adicionar ao Carrinho"}
                      </Botao>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum produto à venda" descricao="Esta barbearia ainda não disponibilizou produtos para venda." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
