import type { Prisma, Usuario } from "@prisma/client";
import type {
  AgendamentoDetalhado,
  AvaliacaoResumo,
  BarbeariaDetalhada,
  BarbeariaResumo,
  BarbeiroResumo,
  DisponibilidadeResumo,
  ServicoResumo,
  UsuarioResumo
} from "@/tipos/dados";
import type { DiaSemana, PerfilUsuario, StatusAgendamento } from "@/tipos/enums";

type BarbeariaComRelacoes = Prisma.BarbeariaGetPayload<{
  include: {
    responsavel: true;
    barbeiros: true;
    servicos: true;
  };
}>;

type BarbeiroComRelacoes = Prisma.BarbeiroGetPayload<{
  include: {
    barbearia: true;
  };
}>;

type ServicoBasico = Prisma.ServicoGetPayload<Record<string, never>>;
type DisponibilidadeBasica = Prisma.DisponibilidadeGetPayload<Record<string, never>>;
type AgendamentoComRelacoes = Prisma.AgendamentoGetPayload<{
  include: {
    contratante: true;
    barbearia: true;
    barbeiro: true;
    servico: true;
    avaliacao: true;
  };
}>;

function serializarData(data: Date) {
  return data.toISOString();
}

export function mapearUsuarioResumo(usuario: Usuario): UsuarioResumo {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil as PerfilUsuario,
    criadoEm: serializarData(usuario.criadoEm)
  };
}

export function mapearBarbeariaResumo(barbearia: BarbeariaComRelacoes): BarbeariaResumo {
  return {
    id: barbearia.id,
    nome: barbearia.nome,
    descricao: barbearia.descricao,
    endereco: barbearia.endereco,
    telefone: barbearia.telefone,
    bairro: barbearia.bairro,
    cidade: barbearia.cidade,
    avaliacaoMedia: barbearia.avaliacaoMedia,
    destaque: barbearia.destaque,
    imagem: barbearia.imagem,
    criadoEm: serializarData(barbearia.criadoEm),
    responsavelId: barbearia.responsavelId,
    responsavelNome: barbearia.responsavel.nome,
    quantidadeBarbeiros: barbearia.barbeiros.length,
    quantidadeServicos: barbearia.servicos.length
  };
}

export function mapearBarbeariaDetalhada(barbearia: BarbeariaComRelacoes): BarbeariaDetalhada {
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

export function mapearBarbeiroResumo(barbeiro: BarbeiroComRelacoes): BarbeiroResumo {
  return {
    id: barbeiro.id,
    nome: barbeiro.nome,
    especialidade: barbeiro.especialidade,
    descricao: barbeiro.descricao,
    telefone: barbeiro.telefone,
    ativo: barbeiro.ativo,
    usuarioId: barbeiro.usuarioId,
    barbeariaId: barbeiro.barbeariaId,
    barbeariaNome: barbeiro.barbearia?.nome ?? null,
    criadoEm: serializarData(barbeiro.criadoEm)
  };
}

export function mapearServicoResumo(servico: ServicoBasico): ServicoResumo {
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco,
    duracaoMinutos: servico.duracaoMinutos,
    ativo: servico.ativo,
    barbeariaId: servico.barbeariaId
  };
}

export function mapearDisponibilidadeResumo(disponibilidade: DisponibilidadeBasica): DisponibilidadeResumo {
  return {
    id: disponibilidade.id,
    barbeiroId: disponibilidade.barbeiroId,
    diaSemana: disponibilidade.diaSemana as DiaSemana,
    horaInicio: disponibilidade.horaInicio,
    horaFim: disponibilidade.horaFim
  };
}

function mapearAvaliacao(avaliacao: AgendamentoComRelacoes["avaliacao"]): AvaliacaoResumo | null {
  if (!avaliacao) {
    return null;
  }

  return {
    nota: avaliacao.nota,
    comentario: avaliacao.comentario,
    criadoEm: serializarData(avaliacao.criadoEm)
  };
}

export function mapearAgendamentoDetalhado(agendamento: AgendamentoComRelacoes): AgendamentoDetalhado {
  return {
    id: agendamento.id,
    contratanteId: agendamento.contratanteId,
    contratanteNome: agendamento.contratante.nome,
    barbeariaId: agendamento.barbeariaId,
    barbeariaNome: agendamento.barbearia.nome,
    barbeiroId: agendamento.barbeiroId,
    barbeiroNome: agendamento.barbeiro.nome,
    servicoId: agendamento.servicoId,
    servicoNome: agendamento.servico.nome,
    precoServico: agendamento.servico.preco,
    duracaoMinutos: agendamento.servico.duracaoMinutos,
    data: serializarData(agendamento.data),
    hora: agendamento.hora,
    status: agendamento.status as StatusAgendamento,
    observacao: agendamento.observacao,
    criadoEm: serializarData(agendamento.criadoEm),
    avaliacao: mapearAvaliacao(agendamento.avaliacao)
  };
}
