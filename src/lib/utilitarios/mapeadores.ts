import type {
  AgendamentoDetalhado,
  AvaliacaoResumo,
  BarbeariaDetalhada,
  BarbeariaResumo,
  BarbeiroResumo,
  DisponibilidadeResumo,
  FavoritoResumo,
  FotoResumo,
  ServicoResumo,
  UsuarioResumo
} from "@/tipos/dados";
import type { DiaSemana, PerfilUsuario, StatusAgendamento } from "@/tipos/enums";

// ============================================================
// Tipos internos para os shapes vindos do Supabase
// Substituem os tipos Prisma.XxxGetPayload
// ============================================================

export interface PerfilDB {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url: string | null;
  criado_em: string;
}

export interface BarbeariaDB {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  bairro: string;
  cidade: string;
  imagem: string | null;
  avaliacao_media: number;
  destaque: boolean;
  responsavel_id: string;
  criado_em: string;
}

export interface BarbeariaComRelacoesDB extends BarbeariaDB {
  responsavel: PerfilDB;
  barbeiros: BarbeiroDB[];
  servicos: ServicoDB[];
}

export interface BarbeiroDB {
  id: string;
  nome: string;
  especialidade: string;
  descricao: string;
  telefone: string;
  ativo: boolean;
  usuario_id: string | null;
  barbearia_id: string | null;
  criado_em: string;
}

export interface BarbeiroComRelacoesDB extends BarbeiroDB {
  barbearia: BarbeariaDB | null;
  disponibilidades?: DisponibilidadeDB[];
}

export interface ServicoDB {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
  barbearia_id: string;
  criado_em?: string;
}

export interface DisponibilidadeDB {
  id: string;
  barbeiro_id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export interface AvaliacaoDB {
  id: string;
  agendamento_id: string;
  nota: number;
  comentario: string | null;
  criado_em: string;
}

export interface AgendamentoComRelacoesDB {
  id: string;
  contratante_id: string;
  barbearia_id: string;
  barbeiro_id: string;
  servico_id: string;
  data: string;
  hora: string;
  status: string;
  observacao: string | null;
  criado_em: string;
  contratante: PerfilDB;
  barbearia: BarbeariaDB;
  barbeiro: BarbeiroDB;
  servico: ServicoDB;
  avaliacoes: AvaliacaoDB[] | null;
}

export interface FavoritoDB {
  id: string;
  usuario_id: string;
  barbearia_id: string;
  criado_em: string;
  barbearia: BarbeariaDB;
}

export interface FotoDB {
  id: string;
  barbearia_id: string;
  url: string;
  descricao: string | null;
  criado_em: string;
}

// ============================================================
// Funções de mapeamento (DB → DTOs de resposta)
// ============================================================

function serializarData(data: string | Date) {
  if (data instanceof Date) {
    return data.toISOString();
  }
  return data;
}

export function mapearUsuarioResumo(perfil: PerfilDB): UsuarioResumo {
  return {
    id: perfil.id,
    nome: perfil.nome,
    email: perfil.email,
    perfil: perfil.perfil as PerfilUsuario,
    criadoEm: serializarData(perfil.criado_em)
  };
}

export function mapearBarbeariaResumo(barbearia: BarbeariaComRelacoesDB): BarbeariaResumo {
  return {
    id: barbearia.id,
    nome: barbearia.nome,
    descricao: barbearia.descricao,
    endereco: barbearia.endereco,
    telefone: barbearia.telefone,
    bairro: barbearia.bairro,
    cidade: barbearia.cidade,
    avaliacaoMedia: barbearia.avaliacao_media,
    destaque: barbearia.destaque,
    imagem: barbearia.imagem,
    criadoEm: serializarData(barbearia.criado_em),
    responsavelId: barbearia.responsavel_id,
    responsavelNome: barbearia.responsavel.nome,
    quantidadeBarbeiros: barbearia.barbeiros.length,
    quantidadeServicos: barbearia.servicos.length
  };
}

export function mapearBarbeariaDetalhada(barbearia: BarbeariaComRelacoesDB): BarbeariaDetalhada {
  return {
    ...mapearBarbeariaResumo(barbearia),
    barbeiros: barbearia.barbeiros.map((barbeiro) =>
      mapearBarbeiroResumo({
        ...barbeiro,
        barbearia: barbearia
      })
    ),
    servicos: barbearia.servicos.map(mapearServicoResumo)
  };
}

export function mapearBarbeiroResumo(barbeiro: BarbeiroComRelacoesDB): BarbeiroResumo {
  return {
    id: barbeiro.id,
    nome: barbeiro.nome,
    especialidade: barbeiro.especialidade,
    descricao: barbeiro.descricao,
    telefone: barbeiro.telefone,
    ativo: barbeiro.ativo,
    usuarioId: barbeiro.usuario_id,
    barbeariaId: barbeiro.barbearia_id,
    barbeariaNome: barbeiro.barbearia?.nome ?? null,
    criadoEm: serializarData(barbeiro.criado_em)
  };
}

export function mapearServicoResumo(servico: ServicoDB): ServicoResumo {
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco,
    duracaoMinutos: servico.duracao_minutos,
    ativo: servico.ativo,
    barbeariaId: servico.barbearia_id
  };
}

export function mapearDisponibilidadeResumo(disponibilidade: DisponibilidadeDB): DisponibilidadeResumo {
  return {
    id: disponibilidade.id,
    barbeiroId: disponibilidade.barbeiro_id,
    diaSemana: disponibilidade.dia_semana as DiaSemana,
    horaInicio: disponibilidade.hora_inicio,
    horaFim: disponibilidade.hora_fim
  };
}

function mapearAvaliacao(avaliacoes: AvaliacaoDB[] | null): AvaliacaoResumo | null {
  if (!avaliacoes || avaliacoes.length === 0) {
    return null;
  }

  const avaliacao = avaliacoes[0];

  return {
    nota: avaliacao.nota,
    comentario: avaliacao.comentario,
    criadoEm: serializarData(avaliacao.criado_em)
  };
}

export function mapearAgendamentoDetalhado(agendamento: AgendamentoComRelacoesDB): AgendamentoDetalhado {
  return {
    id: agendamento.id,
    contratanteId: agendamento.contratante_id,
    contratanteNome: agendamento.contratante.nome,
    barbeariaId: agendamento.barbearia_id,
    barbeariaNome: agendamento.barbearia.nome,
    barbeiroId: agendamento.barbeiro_id,
    barbeiroNome: agendamento.barbeiro.nome,
    servicoId: agendamento.servico_id,
    servicoNome: agendamento.servico.nome,
    precoServico: agendamento.servico.preco,
    duracaoMinutos: agendamento.servico.duracao_minutos,
    data: serializarData(agendamento.data),
    hora: agendamento.hora,
    status: agendamento.status as StatusAgendamento,
    observacao: agendamento.observacao,
    criadoEm: serializarData(agendamento.criado_em),
    avaliacao: mapearAvaliacao(agendamento.avaliacoes)
  };
}

export function mapearFavoritoResumo(favorito: FavoritoDB): FavoritoResumo {
  return {
    id: favorito.id,
    usuarioId: favorito.usuario_id,
    barbeariaId: favorito.barbearia_id,
    barbeariaNome: favorito.barbearia.nome,
    criadoEm: serializarData(favorito.criado_em)
  };
}

export function mapearFotoResumo(foto: FotoDB): FotoResumo {
  return {
    id: foto.id,
    barbeariaId: foto.barbearia_id,
    url: foto.url,
    descricao: foto.descricao,
    criadoEm: serializarData(foto.criado_em)
  };
}
