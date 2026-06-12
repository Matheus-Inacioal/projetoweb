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

export interface ResumoPainelAdmin {
  totalUsuarios: number;
  totalPrestadores: number;
  totalConsumidores: number;
  totalContratacoes: number;
  totalAnuncios: number;
}
