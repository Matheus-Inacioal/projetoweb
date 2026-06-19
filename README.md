# BarberGo — Marketplace de Barbearias

Plataforma web acadêmica completa para **marketplace de barbearias**, conectando consumidores, barbeiros (prestadores), gestores de loja e administradores. O sistema permite agendamento de serviços, compra de produtos, pagamento via PIX (Mercado Pago), gestão multi-lojas e dashboards analíticos.

---

## Integrantes

| Nome | Matrícula |
|------|-----------|
| **Matheus Inacio de Almeida Arruda** | UC22200674 |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) — App Router com React Server Components |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Estilização** | [Tailwind CSS 3](https://tailwindcss.com/) + Design System customizado |
| **Banco de Dados** | [Supabase](https://supabase.com/) — PostgreSQL com Row Level Security |
| **Autenticação** | Supabase Auth (email/senha com criação automática de perfis via trigger) |
| **Storage** | Supabase Storage (buckets: `perfil`, `produtos`, `anuncios`, `lojas`) |
| **Pagamentos** | [Mercado Pago SDK](https://www.mercadopago.com.br/developers) — PIX com QR Code |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Validação** | [Zod](https://zod.dev/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |

---

## Perfis de Usuário

### 👤 Consumidor (Cliente)
- Cadastro e login
- Edição de perfil com upload de foto
- Busca de lojas e prestadores por cidade/termo
- Visualização de serviços, horários e anúncios
- Agendamento de serviços com escolha de horário
- Visualização e gerenciamento de contratações (cancelar, aceitar/recusar remarcações)
- Compra de produtos via carrinho
- Pagamento PIX (agendamentos e pedidos)
- Lista de prestadores favoritos
- Histórico completo de contratações

### ✂️ Prestador (Barbeiro)
- Login e edição de perfil profissional
- Gestão de agenda de horários disponíveis
- Visualização de agendamentos recebidos
- Confirmação, recusa e solicitação de remarcação
- Gestão de anúncios promocionais
- Upload de imagem de perfil

### 🏢 Gestor de Loja
- Dashboard com métricas da loja (faturamento, agendamentos, prestadores)
- Gestão de prestadores da loja (criar, editar, ativar/desativar)
- Gestão de serviços da loja
- Gestão de produtos e estoque
- Gestão de comissões dos prestadores

### 🔑 Administrador
- Dashboard completo com métricas globais do marketplace
- Gráficos: contratações por mês, receita mensal, serviços mais contratados, produtos mais vendidos, evolução de usuários
- Gestão completa de: Usuários, Prestadores, Consumidores, Gestores, Lojas, Serviços, Produtos, Contratações, Agenda, Pagamentos, Comissões, Anúncios
- Relatórios analíticos
- Configurações do sistema

---

## Funcionalidades Principais

| Funcionalidade | Status |
|---------------|--------|
| Autenticação (Login/Cadastro/Logout) | ✅ |
| Cadastro com seleção de tipo (Consumidor/Prestador) | ✅ |
| Perfil editável com upload de foto | ✅ |
| Marketplace de Lojas/Barbearias | ✅ |
| Busca por cidade e termo | ✅ |
| Agendamento de serviços | ✅ |
| Fluxo completo de contratação (pendente → confirmado → concluído) | ✅ |
| Remarcação de agendamentos (solicitação e resposta) | ✅ |
| Cancelamento com liberação de horário | ✅ |
| Carrinho de compras de produtos | ✅ |
| Pedidos de produtos com controle de estoque | ✅ |
| Pagamento PIX via Mercado Pago (com modo Mock acadêmico) | ✅ |
| Webhook de pagamento | ✅ |
| Comissões automáticas ao concluir atendimento | ✅ |
| Favoritos | ✅ |
| Anúncios promocionais | ✅ |
| Avaliações e média de estrelas | ✅ |
| Dashboard Administrativo com gráficos | ✅ |
| Dashboard Gestor de Loja | ✅ |
| Dashboard Prestador/Barbeiro | ✅ |
| Histórico de contratações com log de ações | ✅ |
| Middleware de proteção de rotas por tipo de usuário | ✅ |
| Row Level Security (RLS) em todas as tabelas | ✅ |

---

## Estrutura do Banco de Dados

O schema completo está em `supabase/schema.sql`. São **20 tabelas** com RLS, triggers, views e índices:

| # | Tabela | Descrição |
|---|--------|-----------|
| 1 | `usuarios` | Espelho de `auth.users` — criada automaticamente via trigger |
| 2 | `lojas` | Cadastro de barbearias/estabelecimentos |
| 3 | `gestores` | Associação de gestores de loja |
| 4 | `prestadores` | Perfil profissional dos barbeiros com comissão |
| 5 | `consumidores` | Perfil dos clientes |
| 6 | `servicos` | Catálogo de serviços vinculados à loja |
| 7 | `agenda` | Horários disponíveis de cada prestador |
| 8 | `contratacoes` | Agendamentos/contratações de serviços |
| 9 | `historico_contratacoes` | Log de alterações de status |
| 10 | `comissoes` | Comissões geradas para barbeiros |
| 11 | `pagamentos` | Pagamentos PIX de contratações |
| 12 | `avaliacoes` | Notas e comentários dos consumidores |
| 13 | `favoritos` | Prestadores favoritos |
| 14 | `anuncios` | Promoções dos prestadores |
| 15 | `produtos` | Catálogo de produtos à venda |
| 16 | `carrinhos` | Carrinho de compras |
| 17 | `carrinho_itens` | Itens no carrinho |
| 18 | `pedidos` | Pedidos de produtos |
| 19 | `pedido_itens` | Itens de cada pedido |
| 20 | `pagamentos_produtos` | Pagamentos PIX de pedidos |

### Views
- `vw_dashboard_admin` — Resumo geral do sistema
- `vw_agendamentos_detalhados` — Contratações com nomes e serviços
- `vw_prestadores_ranking` — Ranking por avaliação
- `vw_agenda_disponivel` — Horários realmente livres
- `vw_faturamento_prestador` — Faturamento e comissões

### Triggers
- `handle_new_user()` — Cria perfil automático ao registrar via Supabase Auth
- `atualizar_avaliacao_media()` — Atualiza média de estrelas do prestador
- `calcular_comissao_automatica()` — Gera comissão quando contratação é concluída
- `atualizar_updated_at()` — Timestamp automático em tabelas principais

---

## Estrutura de Arquivos

```text
src/
 ├─ app/                         # Páginas (Next.js App Router) e API Routes
 │   ├─ admin/                   # Dashboard e gestão administrativa (14 subpáginas)
 │   ├─ api/                     # API Routes REST (38+ endpoints)
 │   ├─ area-prestador/          # Páginas exclusivas do barbeiro
 │   ├─ gestor/                  # Dashboard e gestão do gestor de loja
 │   ├─ loja/                    # Vitrine de produtos da loja
 │   ├─ lojas/                   # Listagem e detalhe de lojas
 │   ├─ cadastro/                # Página de cadastro
 │   ├─ login/                   # Página de login
 │   ├─ dashboard/               # Dashboard redirecionador por perfil
 │   ├─ perfil/                  # Edição de perfil do usuário
 │   ├─ favoritos/               # Lista de favoritos (consumidor)
 │   ├─ contratacoes/            # Histórico de contratações
 │   ├─ agenda/                  # Gestão de agenda (prestador)
 │   └─ prestadores/             # Detalhe do prestador
 ├─ componentes/                 # Componentes React reutilizáveis
 │   ├─ admin/                   # Sidebar e componentes admin
 │   ├─ contratacoes/            # Histórico de contratações
 │   ├─ dashboard/               # Dashboards por perfil
 │   ├─ favoritos/               # Lista de favoritos
 │   ├─ feedback/                # Componentes de feedback (toast, loading)
 │   ├─ formularios/             # Formulários (perfil, agenda, serviços)
 │   ├─ layouts/                 # Cabeçalho da aplicação
 │   ├─ prestadores/             # Detalhes do prestador
 │   └─ ui/                      # Componentes UI genéricos
 ├─ hooks/                       # React Hooks reutilizáveis
 ├─ lib/                         # Configurações do Supabase, Session Helpers
 │   ├─ autenticacao/            # Helpers de sessão
 │   ├─ banco/                   # Cliente Supabase Server
 │   └─ utilitarios/             # Utilitários (formatação, respostas API)
 ├─ services/                    # Serviços de negócio (14 serviços)
 ├─ tipos/                       # Definições de Tipos TypeScript e Enums
 └─ middleware.ts                # Proteção de rotas por tipo de usuário

supabase/
 ├─ schema.sql                   # Schema completo do banco (20 tabelas + views + triggers)
 ├─ seed.sql                     # Dados de demonstração
 ├─ policies.sql                 # Políticas RLS avulsas
 └─ *.sql                        # Migrations auxiliares
```

---

## Como Configurar e Rodar Localmente

### 1. Pré-requisitos
- **Node.js** 18+ instalado
- Conta no [Supabase](https://supabase.com/) com um projeto criado
- (Opcional) Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers) para pagamentos reais

### 2. Clonar o Repositório
```bash
git clone https://github.com/Matheus-Inacioal/projetoweb.git
cd projetoweb
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha com seus dados:
```bash
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do seu projeto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
MERCADOPAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Nota:** Deixe `MERCADOPAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN` para usar o **modo Mock** (pagamentos simulados automaticamente como aprovados).

### 5. Configurar o Banco de Dados
No **SQL Editor** do Supabase Dashboard, execute **sequencialmente**:

1. `supabase/schema.sql` — Cria tabelas, triggers, views, políticas RLS e buckets de storage
2. `supabase/seed.sql` — Popula dados de demonstração

### 6. Executar o Projeto
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Dados de Demonstração

Após executar o `seed.sql`, os seguintes usuários estarão disponíveis:

| Perfil | Email | Senha | Descrição |
|--------|-------|-------|-----------|
| **Admin** | `admin@barbergo.com` | `123456` | Acesso total ao painel administrativo |
| **Gestor** | `gestor1@barbergo.com` | `123456` | Gestor da BarberGo Matriz |
| **Gestor** | `gestor2@barbergo.com` | `123456` | Gestor da Barbearia Imperial |
| **Prestador** | `joao@barbergo.com` | `123456` | João Barbeiro — BarberGo Matriz |
| **Prestador** | `pedro@barbergo.com` | `123456` | Pedro Navalha — Barbearia Imperial |
| **Consumidor** | `maria@barbergo.com` | `123456` | Maria Silva — Cliente |
| **Consumidor** | `carlos@barbergo.com` | `123456` | Carlos Souza — Cliente |

### Dados pré-cadastrados no seed:
- **2 lojas** (BarberGo Matriz + Barbearia Imperial)
- **10 serviços** (5 por loja)
- **20 horários** de agenda (10 por prestador, próximos 5 dias)
- **5 contratações** em diferentes status
- **5 pagamentos** PIX
- **10 produtos** categorizados (com alertas de estoque baixo)
- **5 pedidos** em diferentes status
- **2 anúncios** promocionais
- **5 avaliações** com comentários
- **3 favoritos**
- **1 comissão** registrada

---

## Licença

Projeto acadêmico — uso exclusivamente educacional.
