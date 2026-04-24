import type { DiaSemana, PerfilUsuario, StatusAgendamento } from "@/tipos/enums";

export interface RespostaApi<TDados> {
  sucesso: boolean;
  mensagem: string;
  dados: TDados;
}

export interface SessaoUsuario {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm: string;
}

export interface BarbeariaResumo {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  bairro: string;
  cidade: string;
  avaliacaoMedia: number;
  destaque: boolean;
  imagem?: string | null;
  criadoEm: string;
  responsavelId: string;
  responsavelNome: string;
  quantidadeBarbeiros: number;
  quantidadeServicos: number;
}

export interface BarbeiroResumo {
  id: string;
  nome: string;
  especialidade: string;
  descricao: string;
  telefone: string;
  ativo: boolean;
  usuarioId?: string | null;
  barbeariaId?: string | null;
  barbeariaNome?: string | null;
  criadoEm: string;
}

export interface ServicoResumo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  barbeariaId: string;
}

export interface DisponibilidadeResumo {
  id: string;
  barbeiroId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
}

export interface AvaliacaoResumo {
  nota: number;
  comentario: string | null;
  criadoEm: string;
}

export interface AgendamentoDetalhado {
  id: string;
  contratanteId: string;
  contratanteNome: string;
  barbeariaId: string;
  barbeariaNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoId: string;
  servicoNome: string;
  precoServico: number;
  duracaoMinutos: number;
  data: string;
  hora: string;
  status: StatusAgendamento;
  observacao: string | null;
  criadoEm: string;
  avaliacao: AvaliacaoResumo | null;
}

export interface ProximaDisponibilidadeResumo {
  data: string;
  hora: string;
}

export interface HorariosDisponiveisResumo {
  data: string;
  barbeiroId: string;
  servicoId: string;
  duracaoServicoMinutos: number;
  gapMinutos: number;
  horariosDisponiveis: string[];
  primeiroHorarioDisponivel: string | null;
  semHorariosDisponiveis: boolean;
  proximaDisponibilidade: ProximaDisponibilidadeResumo | null;
}

export interface BarbeariaDetalhada extends BarbeariaResumo {
  barbeiros: BarbeiroResumo[];
  servicos: ServicoResumo[];
}

export interface PerfilContratante {
  usuario: UsuarioResumo;
  proximosAgendamentos: AgendamentoDetalhado[];
  historicoAgendamentos: AgendamentoDetalhado[];
}

export interface PerfilProfissional {
  usuario: UsuarioResumo;
  barbeiro: BarbeiroResumo | null;
  disponibilidades: DisponibilidadeResumo[];
  agendaHoje: AgendamentoDetalhado[];
}

export interface PerfilBarbearia {
  usuario: UsuarioResumo;
  barbearia: BarbeariaResumo | null;
  barbeiros: BarbeiroResumo[];
  servicos: ServicoResumo[];
  agendaHoje: AgendamentoDetalhado[];
}

export interface ResumoPainelAdmin {
  totalUsuarios: number;
  totalBarbearias: number;
  totalAgendamentos: number;
  agendamentosPendentes: number;
  agendamentosConfirmados: number;
}
