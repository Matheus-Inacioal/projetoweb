# BarberGo

Plataforma premium que conecta consumidores (clientes) e prestadores de serviços (barbeiros). O sistema gerencia cadastros, autenticação via Supabase Auth, controle de perfis de usuário, agenda operacional, favoritos, anúncios patrocinados e um painel de administração completo.

## Integrantes

- **Matheus Inacio de Almeida Arruda** — **UC22200674**
- **Wellington Gabriel Menezes da Silva** — **UC22101982**

## Stack do Projeto

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) com React Server Components
- **Linguagem**: [TypeScript](https://www.typescript.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **Storage**: Supabase Storage (bucket `perfis` para fotos de usuários e anúncios)
- **Middleware**: Controle de acesso por cookies de sessão e proteção de rotas

## Perfis Suportados

- **Consumidor (Cliente)**: Cria conta, edita perfil, adiciona foto, localiza prestadores por cidade ou termo, favorita profissionais, realiza contratações de serviços e visualiza histórico.
- **Prestador (Profissional)**: Cria conta, gerencia descrição/telefone/especialidade/localização, adiciona foto de perfil, gerencia agenda de horários disponíveis, cadastra catálogo de serviços com preços e duração, gerencia anúncios patrocinados e visualiza contratações recebidas.
- **Admin**: Dashboard completo com métricas gerais e contagem de usuários, prestadores, consumidores, contratações e anúncios cadastrados.

## Estrutura do Banco de Dados (Supabase PostgreSQL)

O schema está contido em `supabase/schema.sql` e as políticas de segurança RLS (Row Level Security) em `supabase/policies.sql`. As tabelas incluem:
1. `usuarios` (vínculo automático com `auth.users` via trigger)
2. `prestadores` (informações profissionais)
3. `consumidores` (informações de clientes)
4. `servicos` (catálogo de atendimento)
5. `agenda` (horários disponíveis de cada prestador)
6. `contratacoes` (pedidos de serviço)
7. `favoritos` (profissionais prediletos do consumidor)
8. `anuncios` (campanhas e ofertas)

## Políticas de RLS (Row Level Security)

Segurança em nível de linha ativada em todas as tabelas:
- **usuarios**: Leitura por autenticados, alteração apenas do próprio perfil.
- **servicos / agenda / anuncios**: Inserção/Edição/Remoção permitida apenas ao prestador proprietário. Leitura pública/anônima.
- **contratacoes**: Apenas o consumidor comprador pode criar. Leitura pelo consumidor comprador, pelo prestador contratado ou por administradores.
- **favoritos**: Operações restritas ao consumidor proprietário.

## Estrutura de Arquivos

```text
src/
 ├─ app/                 # Páginas (Next.js App Router) e API Routes
 ├─ componentes/         # Componentes React (UI, Layouts, Formulários)
 ├─ hooks/               # React Hooks reutilizáveis
 ├─ lib/                 # Configurações do Supabase, Session Helpers e Utilitários
 ├─ tipos/               # Definições de Tipos TypeScript e Enums
 └─ middleware.ts        # Proteção de rotas e verificação de sessões
```

## Como Configurar e Rodar Localmente

### 1. Pré-requisitos
- Criar um projeto no [Supabase](https://supabase.com/).
- Obter a URL do projeto e a Anon Key.

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz com:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sbwfmxuldrdicvsfbduu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 3. Configurar o Banco de Dados
No **SQL Editor** do Supabase Dashboard, execute sequencialmente:
1. Conteúdo de `supabase/schema.sql` (Criação de tabelas, triggers e bucket de storage)
2. Conteúdo de `supabase/policies.sql` (Políticas de segurança RLS)
3. Conteúdo de `supabase/seed.sql` (Para povoar dados de teste após criar contas de login)

### 4. Executar o Projeto
Instale as dependências e inicie o servidor de desenvolvimento:
```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
