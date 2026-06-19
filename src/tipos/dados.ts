import type { TipoUsuario, StatusAgendamento } from "@/tipos/enums";

export interface RespostaApi<TDados> {
  sucesso: boolean;
  mensagem: string;
  dados: TDados;
}

export interface SessaoUsuario {
  usuarioId: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
  tipoUsuario: TipoUsuario;
  criadoEm: string;
}

export interface PrestadorResumo {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
  descricao: string;
  especialidade: string;
  endereco: string;
  cidade: string;
  avaliacaoMedia: number;
  ativo: boolean;
  criadoEm: string;
}

export interface ConsumidorResumo {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
  criadoEm: string;
}

export interface ServicoResumo {
  id: string;
  prestadorId: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  criadoEm: string;
}

export interface AgendaResumo {
  id: string;
  prestadorId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  disponivel: boolean;
  criadoEm: string;
}

export interface AgendamentoDetalhado {
  id: string;
  consumidorId: string;
  consumidorNome: string;
  consumidorEmail: string;
  prestadorId: string;
  prestadorNome: string;
  prestadorEspecialidade: string;
  agendaId: string | null;
  servicoId: string | null;
  servicoNome: string | null;
  data: string;
  horario: string;
  valor: number;
  status: StatusAgendamento;
  observacao: string | null;
  criadoEm: string;
}

export interface FavoritoResumo {
  id: string;
  consumidorId: string;
  prestadorId: string;
  prestadorNome: string;
  prestadorEspecialidade: string;
  prestadorFotoUrl: string | null;
  criadoEm: string;
}

export interface AnuncioResumo {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  prestadorFotoUrl: string | null;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface SerieMensal {
  rotulo: string;
  valor: number;
}

export interface SerieItem {
  nome: string;
  quantidade: number;
}

export interface ResumoPainelAdmin {
  totalUsuarios: number;
  totalPrestadores: number;
  totalConsumidores: number;
  totalContratacoes: number;
  totalAnuncios: number;
  totalServicos: number;
  totalProdutos: number;
  totalPagamentos: number;
  receitaTotal: number;
  receitaMes: number;
  ticketMedio: number;
  quantidadePixPagos: number;
  quantidadePixPendentes: number;
  contratacoesPorMes: SerieMensal[];
  receitaMensal: SerieMensal[];
  servicosMaisContratados: SerieItem[];
  produtosMaisVendidos: SerieItem[];
  prestadoresMaisContratados: SerieItem[];
  evolucaoUsuarios: SerieMensal[];
}

export interface ProdutoResumo {
  id: string;
  prestadorId: string;
  lojaId?: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  estoqueMinimo?: number;
  categoria?: string | null;
  imagemUrl: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface CarrinhoItemResumo {
  id: string;
  carrinhoId: string;
  produtoId: string;
  produtoNome: string;
  produtoImagemUrl: string | null;
  quantidade: number;
  precoUnitario: number;
}

export interface CarrinhoResumo {
  id: string;
  consumidorId: string;
  createdAt: string;
  itens: CarrinhoItemResumo[];
}

export interface PedidoItemResumo {
  id: string;
  pedidoId: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoResumo {
  id: string;
  consumidorId: string;
  valorTotal: number;
  status: string;
  createdAt: string;
  itens?: PedidoItemResumo[];
}

export interface PagamentoResumo {
  id: string;
  contratacaoId: string;
  mercadoPagoPaymentId: string | null;
  externalReference: string | null;
  qrCode: string | null;
  qrCodeBase64: string | null;
  valor: number;
  status: string;
  createdAt: string;
}

export interface HistoricoContratacao {
  id: string;
  contratacaoId: string;
  usuarioId: string;
  usuarioNome?: string;
  acao: string;
  statusAnterior: string | null;
  statusNovo: string;
  observacao: string | null;
  createdAt: string;
}

export interface PagamentoProdutoResumo {
  id: string;
  pedidoId: string;
  mercadoPagoPaymentId: string | null;
  externalReference: string | null;
  qrCode: string | null;
  qrCodeBase64: string | null;
  valor: number;
  status: string;
  createdAt: string;
}

export interface Loja {
  id: string;
  nome: string;
  descricao: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logoUrl: string | null;
  capaUrl: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface Gestor {
  id: string;
  usuarioId: string;
  lojaId: string;
  createdAt: string;
}

export interface Comissao {
  id: string;
  prestadorId: string;
  prestadorNome?: string;
  contratacaoId: string;
  percentual: number;
  valor: number;
  status: string;
  createdAt: string;
}

export interface LojaResumo {
  id: string;
  nome: string;
  descricao: string | null;
  logoUrl: string | null;
  avaliacaoMedia: number;
  cidade: string | null;
  quantidadeServicos: number;
}

