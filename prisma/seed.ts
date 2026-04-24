import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function criarDataBase(deslocamentoDias: number) {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  data.setDate(data.getDate() + deslocamentoDias);
  return data;
}

const barbeariasData = [
  {
    nome: "Vilar Barber Club",
    descricao: "Barbearia premium com ambiente moderno e atendimento de excelência.",
    endereco: "Rua das Flores, 452",
    bairro: "Praia de Iracema",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1001",
    avaliacaoMedia: 4.8
  },
  {
    nome: "Barbearia Centro",
    descricao: "Referência em cortes clássicos e barba alinhada no coração de Fortaleza.",
    endereco: "Av. Central, 1250",
    bairro: "Centro",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1002",
    avaliacaoMedia: 4.9
  },
  {
    nome: "Navalha Prime",
    descricao: "Especialista em acabamento preciso com profissionais de experiência.",
    endereco: "Rua Augusta, 789",
    bairro: "Aldeota",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1003",
    avaliacaoMedia: 4.7
  },
  {
    nome: "Corte Nobre",
    descricao: "Excelência em barbearia com atendimento personalizado e diferenciado.",
    endereco: "Av. Beira Mar, 2000",
    bairro: "Barra do Ceará",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1004",
    avaliacaoMedia: 4.6
  },
  {
    nome: "Barbearia Dom Pedro",
    descricao: "Tradição e qualidade em cada corte desde 2015.",
    endereco: "Rua Monsenhor Catão, 523",
    bairro: "Montese",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1005",
    avaliacaoMedia: 4.5
  },
  {
    nome: "Black Beard Studio",
    descricao: "Studio completo de barbearia com foco em barba e estilo contemporâneo.",
    endereco: "Rua Dr. João Moreira, 156",
    bairro: "Meireles",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1006",
    avaliacaoMedia: 4.8
  },
  {
    nome: "Elite Barber House",
    descricao: "Experiência de luxo em barbearia com painéis premium e conforto total.",
    endereco: "Av. 2 de Julho, 1547",
    bairro: "Papicu",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1007",
    avaliacaoMedia: 4.9
  },
  {
    nome: "Rei da Régua",
    descricao: "Cortador experiente em técnicas clássicas e modernas, com toque artesanal.",
    endereco: "Rua Antônio Justa, 211",
    bairro: "Jacarecanga",
    cidade: "Fortaleza - CE",
    telefone: "(85) 3333-1008",
    avaliacaoMedia: 4.4
  }
];

const barbeirosDisponiveis = [
  "Rafael Silva",
  "Lucas Andrade",
  "Davi Martins",
  "Pedro Henrique",
  "João Victor",
  "Bruno Costa",
  "Matheus Lima",
  "Caio Oliveira",
  "Gabriel Santos",
  "Felipe Rocha"
];

const servicos = [
  { nome: "Corte masculino", descricao: "Corte clássico com acabamento e finalização.", preco: 35, duracao: 45 },
  { nome: "Barba completa", descricao: "Barba com toalha quente, hidratação e navalha.", preco: 30, duracao: 35 },
  { nome: "Corte + Barba", descricao: "Combo de corte e barba com acabamento premium.", preco: 60, duracao: 75 },
  { nome: "Sobrancelha", descricao: "Limpeza e design de sobrancelha.", preco: 15, duracao: 20 },
  { nome: "Pigmentação", descricao: "Pigmentação de barba para disfarçar falhas.", preco: 40, duracao: 30 },
  { nome: "Hidratação", descricao: "Hidratação facial profunda com produtos premium.", preco: 50, duracao: 40 },
  { nome: "Limpeza de pele", descricao: "Limpeza e esfoliação profissional.", preco: 45, duracao: 45 },
  { nome: "Acabamento", descricao: "Acabamento fino e preciso com navalha.", preco: 25, duracao: 25 }
];

async function main() {
  await prisma.avaliacao.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.disponibilidade.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.barbeiro.deleteMany();
  await prisma.barbearia.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaPadrao = await bcrypt.hash("123456", 10);

  // Criar usuários globais
  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador BarberGo",
      email: "admin@barbergo.com",
      senhaHash: senhaPadrao,
      perfil: "ADMIN"
    }
  });

  const contratanteUm = await prisma.usuario.create({
    data: {
      nome: "Carlos Eduardo",
      email: "carlos@barbergo.com",
      senhaHash: senhaPadrao,
      perfil: "CONTRATANTE"
    }
  });

  const contratanteDois = await prisma.usuario.create({
    data: {
      nome: "Joao Victor",
      email: "joao@barbergo.com",
      senhaHash: senhaPadrao,
      perfil: "CONTRATANTE"
    }
  });

  // Criar barbearias com seus próprios usuários responsáveis e barbeiros
  let contadorBarbeiros = 0;

  for (let i = 0; i < barbeariasData.length; i++) {
    const barbearia_data = barbeariasData[i];

    // Criar usuário responsável pela barbearia
    const responsavel = await prisma.usuario.create({
      data: {
        nome: barbearia_data.nome,
        email: `responsavel${i + 1}@barbergo.com`,
        senhaHash: senhaPadrao,
        perfil: "PRESTADOR_PJ"
      }
    });

    // Criar barbearia
    const barbearia = await prisma.barbearia.create({
      data: {
        nome: barbearia_data.nome,
        descricao: barbearia_data.descricao,
        endereco: barbearia_data.endereco,
        bairro: barbearia_data.bairro,
        cidade: barbearia_data.cidade,
        telefone: barbearia_data.telefone,
        avaliacaoMedia: barbearia_data.avaliacaoMedia,
        destaque: i < 4, // Primeiras 4 como destaque
        responsavelId: responsavel.id
      }
    });

    // Criar 2 barbeiros para cada barbearia
    const barbeiros = [];
    for (let j = 0; j < 2; j++) {
      const nomeBarbeiro = barbeirosDisponiveis[contadorBarbeiros % barbeirosDisponiveis.length];
      contadorBarbeiros++;

      // Criar usuário para o barbeiro
      const usuarioBarbeiro = await prisma.usuario.create({
        data: {
          nome: nomeBarbeiro,
          email: `barbeiro_${barbearia.id}_${j}@barbergo.com`,
          senhaHash: senhaPadrao,
          perfil: "PRESTADOR_PF"
        }
      });

      const barbeiro = await prisma.barbeiro.create({
        data: {
          nome: nomeBarbeiro,
          especialidade: servicos[j % servicos.length].nome,
          descricao: `Profissional experiente em ${servicos[j % servicos.length].nome.toLowerCase()} com excelentes avaliações.`,
          telefone: `(85) 9999${9000 + i * 100 + j}-${String(contadorBarbeiros).padStart(4, "0")}`,
          ativo: true,
          usuarioId: usuarioBarbeiro.id,
          barbeariaId: barbearia.id
        }
      });

      barbeiros.push(barbeiro);

      // Criar disponibilidade para o barbeiro
      await prisma.disponibilidade.createMany({
        data: [
          { barbeiroId: barbeiro.id, diaSemana: "SEGUNDA", horaInicio: "09:00", horaFim: "18:00" },
          { barbeiroId: barbeiro.id, diaSemana: "TERCA", horaInicio: "09:00", horaFim: "18:00" },
          { barbeiroId: barbeiro.id, diaSemana: "QUARTA", horaInicio: "09:00", horaFim: "18:00" },
          { barbeiroId: barbeiro.id, diaSemana: "QUINTA", horaInicio: "09:00", horaFim: "18:00" },
          { barbeiroId: barbeiro.id, diaSemana: "SEXTA", horaInicio: "09:00", horaFim: "18:00" },
          { barbeiroId: barbeiro.id, diaSemana: "SABADO", horaInicio: "08:00", horaFim: "15:00" }
        ]
      });
    }

    // Criar 3 serviços para cada barbearia
    const servicos_criados = [];
    for (let j = 0; j < 3; j++) {
      const servico = servicos[j % servicos.length];
      const servicoCriado = await prisma.servico.create({
        data: {
          nome: servico.nome,
          descricao: servico.descricao,
          preco: servico.preco,
          duracaoMinutos: servico.duracao,
          ativo: true,
          barbeariaId: barbearia.id
        }
      });
      servicos_criados.push(servicoCriado);
    }

    // Criar alguns agendamentos para demonstração
    if (i === 0) {
      const agendamentoPassado = await prisma.agendamento.create({
        data: {
          contratanteId: contratanteUm.id,
          barbeariaId: barbearia.id,
          barbeiroId: barbeiros[0].id,
          servicoId: servicos_criados[0].id,
          data: criarDataBase(-7),
          hora: "14:00",
          status: "CONCLUIDO",
          observacao: "Corte com acabamento marcado."
        }
      });

      await prisma.avaliacao.create({
        data: {
          agendamentoId: agendamentoPassado.id,
          nota: 5,
          comentario: "Atendimento excelente, muito satisfeito!"
        }
      });
    }
  }

  console.log("✅ Seed do BarberGo concluída com sucesso!");
  console.log("📍 8 barbearias cadastradas com destaque");
  console.log("💈 16 barbeiros profissionais distribuídos");
  console.log("🔧 Serviços e disponibilidades configurados");
  console.log("");
  console.log("🔑 Credenciais padrão: senha 123456");
  console.log(`👨‍💼 Admin: ${admin.email}`);
  console.log(`👤 Contratante 1: ${contratanteUm.email}`);
  console.log(`👤 Contratante 2: ${contratanteDois.email}`);
  console.log("📍 Barbearias responsáveis: responsavel1@barbergo.com até responsavel8@barbergo.com");
}

main()
  .catch((erro) => {
    console.error("❌ Erro ao executar seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
