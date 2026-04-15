# BarberGo

Marketplace de agendamento com foco inicial em **barbearias**, permitindo cadastro, login, diferenciação de perfis, gestão operacional e agendamento de serviços com barbeiro, data e horário.

## Integrantes

- **Matheus Inacio de Almeida Arruda** — **UC22200674**
- **Wellington Gabriel Menezes da Silva** — **UC22101982**

## Stack do MVP

- **Next.js** com **App Router**
- **TypeScript**
- **Tailwind CSS**
- **Prisma**
- **SQLite**
- **React Server Components** para layouts e guardas
- **API Routes** para autenticação, cadastros e agendamentos

## Perfis suportados

- **Contratante**
- **Prestador PF**
- **Prestador PJ / Barbearia**
- **Admin**

## Funcionalidades implementadas

### Contratante
- cadastro e login
- listagem pública de barbearias
- visualização de detalhes da barbearia
- visualização de barbeiros por barbearia
- agendamento com barbeiro, serviço, data e horário
- visualização de próximos agendamentos e histórico
- cancelamento de agendamento
- atualização de perfil

### Prestador PF
- dashboard com agenda do dia
- página completa de agenda
- cadastro de disponibilidade
- atualização de perfil profissional

### Prestador PJ / Barbearia
- dashboard da barbearia
- agenda geral da barbearia
- cadastro de barbeiros
- cadastro de serviços
- atualização de perfil da barbearia

### Admin
- dashboard administrativo com métricas
- listagem de usuários
- listagem de barbearias
- listagem de agendamentos

## Arquitetura

O projeto segue a separação:

```text
UI -> Hook -> Serviço -> Repositório -> Banco
```

Estrutura principal:

```text
src/
  app/
  componentes/
  hooks/
  lib/
    autenticacao/
    banco/
    repositorios/
    servicos/
    utilitarios/
    validacoes/
  tipos/
prisma/
```

## Seed inicial

O seed cria:

- 1 admin
- 2 contratantes
- 1 prestador PF
- 1 prestador PJ
- 1 barbearia
- 2 barbeiros
- 3 serviços
- disponibilidades
- agendamentos de exemplo
- 1 avaliação

### Credenciais seed

Senha padrão para todas as contas:

```text
123456
```

Usuários:

- `admin@barbergo.com`
- `carlos@barbergo.com`
- `joao@barbergo.com`
- `rafael@barbergo.com`
- `contato@barbergocentro.com`

## Como rodar

```bash
npm install
npm run prisma:generate
npm run banco:preparar
npm run dev
```

Aplicação:

```text
http://localhost:3000
```

## Observações acadêmicas

- O foco do projeto é um **MVP funcional**, simples e escalável.
- A autenticação usa **cookie de sessão assinado** para simplificar o cenário local.
- O banco é **SQLite**, ideal para demonstração local e desenvolvimento acadêmico.

## Licença

Projeto desenvolvido para fins acadêmicos.
