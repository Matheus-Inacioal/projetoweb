import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function criarDataBase(deslocamentoDias: number) {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  data.setDate(data.getDate() + deslocamentoDias);
  return data;
}

async function main() {
  await prisma.avaliacao.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.disponibilidade.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.barbeiro.deleteMany();
  await prisma.barbearia.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaPadrao = await bcrypt.hash("123456", 10);

  const [admin, contratanteUm, contratanteDois, prestadorPf, prestadorPj] = await Promise.all([
    prisma.usuario.create({
      data: {
        nome: "Administrador BarberGo",
        email: "admin@barbergo.com",
        senhaHash: senhaPadrao,
        perfil: "ADMIN"
      }
    }),
    prisma.usuario.create({
      data: {
        nome: "Carlos Eduardo",
        email: "carlos@barbergo.com",
        senhaHash: senhaPadrao,
        perfil: "CONTRATANTE"
      }
    }),
    prisma.usuario.create({
      data: {
        nome: "Joao Victor",
        email: "joao@barbergo.com",
        senhaHash: senhaPadrao,
        perfil: "CONTRATANTE"
      }
    }),
    prisma.usuario.create({
      data: {
        nome: "Rafael Martins",
        email: "rafael@barbergo.com",
        senhaHash: senhaPadrao,
        perfil: "PRESTADOR_PF"
      }
    }),
    prisma.usuario.create({
      data: {
        nome: "BarberGo Centro",
        email: "contato@barbergocentro.com",
        senhaHash: senhaPadrao,
        perfil: "PRESTADOR_PJ"
      }
    })
  ]);

  const barbearia = await prisma.barbearia.create({
    data: {
      nome: "BarberGo Centro",
      descricao: "Barbearia moderna com foco em atendimento pontual e acabamento premium.",
      endereco: "Av. Central, 1250 - Centro, Fortaleza - CE",
      telefone: "(85) 99999-1000",
      responsavelId: prestadorPj.id
    }
  });

  const barbeiroUm = await prisma.barbeiro.create({
    data: {
      nome: "Rafael Martins",
      especialidade: "Corte social e degradê",
      descricao: "Atendimento detalhista, com foco em corte clássico e barba alinhada.",
      telefone: "(85) 99999-2001",
      usuarioId: prestadorPf.id,
      barbeariaId: barbearia.id
    }
  });

  const barbeiroDois = await prisma.barbeiro.create({
    data: {
      nome: "Lucas Almeida",
      especialidade: "Barba completa e acabamento navalhado",
      descricao: "Especialista em barba, pigmentação suave e acabamento fino.",
      telefone: "(85) 99999-2002",
      barbeariaId: barbearia.id
    }
  });

  await prisma.disponibilidade.createMany({
    data: [
      { barbeiroId: barbeiroUm.id, diaSemana: "SEGUNDA", horaInicio: "09:00", horaFim: "18:00" },
      { barbeiroId: barbeiroUm.id, diaSemana: "TERCA", horaInicio: "09:00", horaFim: "18:00" },
      { barbeiroId: barbeiroUm.id, diaSemana: "QUARTA", horaInicio: "09:00", horaFim: "18:00" },
      { barbeiroId: barbeiroUm.id, diaSemana: "QUINTA", horaInicio: "09:00", horaFim: "18:00" },
      { barbeiroId: barbeiroUm.id, diaSemana: "SEXTA", horaInicio: "09:00", horaFim: "18:00" },
      { barbeiroId: barbeiroDois.id, diaSemana: "TERCA", horaInicio: "10:00", horaFim: "19:00" },
      { barbeiroId: barbeiroDois.id, diaSemana: "QUARTA", horaInicio: "10:00", horaFim: "19:00" },
      { barbeiroId: barbeiroDois.id, diaSemana: "QUINTA", horaInicio: "10:00", horaFim: "19:00" },
      { barbeiroId: barbeiroDois.id, diaSemana: "SEXTA", horaInicio: "10:00", horaFim: "19:00" },
      { barbeiroId: barbeiroDois.id, diaSemana: "SABADO", horaInicio: "08:00", horaFim: "14:00" }
    ]
  });

  const [servicoCorte, servicoBarba, servicoPremium] = await Promise.all([
    prisma.servico.create({
      data: {
        nome: "Corte tradicional",
        descricao: "Corte com acabamento e finalização simples.",
        preco: 35,
        duracaoMinutos: 45,
        barbeariaId: barbearia.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: "Barba completa",
        descricao: "Barba com toalha quente, hidratação e navalha.",
        preco: 30,
        duracaoMinutos: 35,
        barbeariaId: barbearia.id
      }
    }),
    prisma.servico.create({
      data: {
        nome: "Combo premium",
        descricao: "Corte, barba e hidratação premium em uma sessão completa.",
        preco: 70,
        duracaoMinutos: 75,
        barbeariaId: barbearia.id
      }
    })
  ]);

  const agendamentoPassado = await prisma.agendamento.create({
    data: {
      contratanteId: contratanteUm.id,
      barbeariaId: barbearia.id,
      barbeiroId: barbeiroUm.id,
      servicoId: servicoPremium.id,
      data: criarDataBase(-7),
      hora: "14:00",
      status: "CONCLUIDO",
      observacao: "Preferencia por acabamento mais marcado."
    }
  });

  await prisma.avaliacao.create({
    data: {
      agendamentoId: agendamentoPassado.id,
      nota: 5,
      comentario: "Atendimento excelente e pontual."
    }
  });

  await prisma.agendamento.createMany({
    data: [
      {
        contratanteId: contratanteDois.id,
        barbeariaId: barbearia.id,
        barbeiroId: barbeiroDois.id,
        servicoId: servicoBarba.id,
        data: criarDataBase(-3),
        hora: "11:00",
        status: "CANCELADO",
        observacao: "Cancelado pelo cliente."
      },
      {
        contratanteId: contratanteUm.id,
        barbeariaId: barbearia.id,
        barbeiroId: barbeiroUm.id,
        servicoId: servicoCorte.id,
        data: criarDataBase(1),
        hora: "10:00",
        status: "CONFIRMADO",
        observacao: "Corte para evento no fim da tarde."
      },
      {
        contratanteId: contratanteDois.id,
        barbeariaId: barbearia.id,
        barbeiroId: barbeiroDois.id,
        servicoId: servicoPremium.id,
        data: criarDataBase(2),
        hora: "15:00",
        status: "PENDENTE",
        observacao: "Primeira visita na barbearia."
      },
      {
        contratanteId: contratanteUm.id,
        barbeariaId: barbearia.id,
        barbeiroId: barbeiroUm.id,
        servicoId: servicoBarba.id,
        data: criarDataBase(4),
        hora: "13:30",
        status: "CONFIRMADO",
        observacao: "Deseja manter desenho atual."
      }
    ]
  });

  console.log("Seed do BarberGo concluida com sucesso.");
  console.log("Credenciais padrao: senha 123456");
  console.log(`Admin: ${admin.email}`);
  console.log(`Contratante: ${contratanteUm.email}`);
  console.log(`Prestador PF: ${prestadorPf.email}`);
  console.log(`Prestador PJ: ${prestadorPj.email}`);
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
