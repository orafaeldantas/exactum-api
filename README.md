# Exactum

> Plataforma SaaS multi-tenant de ERP para gestão de estoque, vendas e PDV, projetada com foco em segurança, autorização, observabilidade e confiabilidade operacional.

O **Exactum** é uma plataforma ERP web voltada para pequenas e médias empresas do varejo. Ela centraliza operações de estoque, vendas e ponto de venda (PDV), com arquitetura multi-tenant, isolamento de tenants, autorização granular e observabilidade operacional.

O projeto é desenvolvido com forte foco em engenharia de backend, arquitetura de software, segurança, integridade de dados e confiabilidade operacional.

🔗 **[Demo ao Vivo](https://exactum.app.br/)** · 📖 **[Documentação](#documentação)** · 📑 **[Documentação da API](#api-documentation)** · 🐛 **[Reportar Bug](https://github.com/orafaeldantas/exactum-api/issues)**

<br>

![Status](https://img.shields.io/badge/Status-Alpha-orange)
![Versão](https://img.shields.io/badge/version-0.2.0--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI Build Status](https://github.com/orafaeldantas/exactum-api/actions/workflows/ci.yml/badge.svg)](https://github.com/orafaeldantas/exactum-api/actions)
[![Codecov Coverage](https://codecov.io/gh/orafaeldantas/exactum-api/graph/badge.svg)](https://codecov.io/gh/orafaeldantas/exactum-api)

![Python](https://img.shields.io/badge/python-3670A0?logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DC382D.svg?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?logo=nginx&logoColor=white)

<p align="center">
  <br>
  <img src="./docs/readme-imgs/dashboard.png" alt="Dashboard Principal" width="85%">
</p>

<details>
<summary>📸 Ver capturas de tela adicionais</summary>
<br>

**Ponto de Venda (PDV)**
<img src="./docs/readme-imgs/pdv.png" alt="PDV" width="85%">

**Vendas**
<img src="./docs/readme-imgs/sales.png" alt="Vendas" width="85%">

**Receita**
<img src="./docs/readme-imgs/revenue.png" alt="Receita" width="85%">

**Ticket Médio**
<img src="./docs/readme-imgs/average-ticket.png" alt="Ticket Médio" width="85%">

**Documentação da API (Swagger)**
<img src="./docs/readme-imgs/swagger.png" alt="Swagger" width="85%">

</details>

---

## Índice

- [Visão Geral](#visão-geral)
- [Status do Projeto](#status-do-projeto)
- [Limitações Conhecidas](#limitações-conhecidas)
- [Destaques de Engenharia](#destaques-de-engenharia)
- [Capacidades do Produto](#capacidades-do-produto)
- [Arquitetura](#arquitetura)
- [Segurança](#segurança)
- [Autorização & RBAC](#autorização--rbac)
- [Multi-Tenancy](#multi-tenancy)
- [Observabilidade & Auditoria](#observabilidade--auditoria)
- [Stack Tecnológica](#stack-tecnológica)
- [Decisões Técnicas](#decisões-técnicas)
- [Versionamento & Releases](#versionamento--releases)
- [Documentação da API](#api-documentation)
- [Como Executar Localmente](#como-executar-localmente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Roadmap](#roadmap)
- [Filosofia do Projeto](#filosofia-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Visão Geral

O Exactum é uma plataforma SaaS de ERP focada nas necessidades operacionais de pequenas e médias empresas do varejo.

A gestão de estoque no pequeno varejo ainda costuma ser feita "no olho". O resultado é um ciclo prejudicial: capital imobilizado em mercadoria parada ou perda de faturamento por falta de produto. O Exactum centraliza o fluxo de entradas, saídas e PDV, utilizando o histórico de movimentação para transformar a reposição de estoque em uma decisão orientada a dados — em vez de intuição.

A plataforma reúne:

- Gestão de estoque
- Gestão de produtos
- Vendas
- Ponto de venda (PDV)
- Dashboards de negócio
- Gestão de usuários
- Gestão de papéis (roles) e permissões
- Administração de tenants
- Impersonate administrativo
- Auditoria
- Observabilidade da plataforma

O projeto é desenhado como um SaaS multi-tenant, no qual múltiplas empresas compartilham a mesma infraestrutura de aplicação enquanto seus dados de negócio permanecem logicamente isolados.

Além da funcionalidade de negócio, o Exactum é também um projeto contínuo de engenharia de software, explorando como uma aplicação SaaS real pode evoluir em direção a fronteiras arquiteturais mais fortes, controles de segurança e maturidade operacional.

## Status do Projeto

**Versão atual:** v0.2.0-alpha

⚠️ O Exactum está atualmente em **fase Alpha** e em desenvolvimento ativo. Os módulos centrais de ERP já estão operacionais, enquanto a arquitetura passa por uma evolução progressiva em direção a fronteiras de domínio mais explícitas.

A versão 0.2.0 representa uma evolução significativa da plataforma, particularmente em:

- Segurança de autenticação
- Gestão de sessão
- Autorização
- RBAC
- Administração de tenants
- Observabilidade
- Log de auditoria
- Rate limiting
- Tratamento de exceções
- Soft deletion
- Experiência do usuário

O projeto está funcional e implantado em produção (VPS), mas ainda deve ser considerado um produto de software em evolução, e não uma plataforma comercial finalizada.

> O deploy em VPS foi realizado ainda na fase Alpha para validar o comportamento do sistema fora do ambiente local e orientar futuras decisões de infraestrutura, observabilidade e escalabilidade.

## Limitações Conhecidas

Como o Exactum está em fase Alpha, algumas capacidades ainda estão em evolução. Atualmente, as principais limitações incluem:

- A arquitetura ainda está passando por uma evolução em direção a fronteiras de domínio mais explícitas.
- A camada de observabilidade ainda está baseada principalmente em logging estruturado, com integração futura planejada para métricas e dashboards operacionais dedicados.
- Algumas capacidades de processamento assíncrono ainda não foram introduzidas.
- A infraestrutura atual está dimensionada para o estágio atual do projeto e não representa uma arquitetura de alta disponibilidade.
- Algumas funcionalidades previstas no roadmap ainda não estão disponíveis em produção.

Essas limitações são acompanhadas através do roadmap e podem resultar em alterações arquiteturais nas próximas versões.

## Destaques de Engenharia

O Exactum não é construído apenas em torno de suas funcionalidades de negócio. Diversas preocupações transversais (*cross-cutting concerns*) são tratadas como componentes de primeira classe da plataforma.

**Segurança**
- Autenticação baseada em cookies HttpOnly
- Separação entre access token e refresh token
- Rotação de refresh token
- Gestão de sessão apoiada em Redis
- Revogação de refresh token
- Bloqueio de usuários
- Suspensão de tenants
- Rate limiting de API
- Identificadores externos baseados em UUID
- Fluxos estruturados de autenticação e autorização

**Autorização**
- Role-Based Access Control (RBAC)
- Gestão granular de permissões
- Autorização escopada por tenant
- Capacidades de super-admin
- Impersonate administrativo
- Autorização aplicada no backend
- UX sensível a permissões no frontend

**Multi-Tenancy**
- Isolamento lógico de tenants
- Contexto de tenant estabelecido em nível de requisição
- Filtro explícito de tenant na camada de persistência
- Usuários, papéis e dados de negócio escopados por tenant
- Gestão de ciclo de vida do tenant
- Suspensão administrativa de tenant

**Observabilidade**
- Logging estruturado de requisições em JSON
- IDs de correlação de requisição
- Telemetria operacional baseada em logs estruturados de requisições HTTP (métricas e dashboards dedicados ainda não implementados — ver [Limitações Conhecidas](#limitações-conhecidas))
- Contexto de usuário e tenant
- Eventos de plataforma
- Logs de auditoria por tenant
- Separação entre observabilidade operacional e de negócio

**Confiabilidade & Integridade**
- Operações críticas executadas dentro de transações
- Controle de consistência entre vendas e estoque
- Tratamento centralizado de exceções
- Migrações versionadas de banco de dados
- Soft deletion para entidades aplicáveis
- Identificação e rastreamento de requisições

**Dados & Persistência**
- PostgreSQL
- ORM SQLAlchemy
- Operações de negócio transacionais
- Migrações de banco de dados
- Persistência baseada em repositórios
- Soft deletion
- Identificadores públicos baseados em UUID

**Práticas de Engenharia**
- Testes automatizados
- Integração contínua
- Deploy automatizado
- Desenvolvimento e deploy baseados em Docker
- Análise estática e linting
- Documentação de API via OpenAPI
- Configuração baseada em ambiente

## Capacidades do Produto

**Estoque**

O Exactum fornece a base para gestão de estoque no varejo, incluindo:

- Cadastro de produtos
- Gestão de produtos
- Controle de estoque
- Limites mínimos de estoque
- Movimentação de estoque
- Indicadores de estoque baixo
- Integração com operações de venda

**Vendas & Ponto de Venda**

O módulo de PDV oferece um fluxo operacional para registro de vendas mantendo a consistência do estoque.

Principais capacidades:
- Registro de vendas
- Seleção de produtos
- Baixa automática de estoque
- Histórico de vendas
- Métricas de transações
- Indicadores de receita

**Dashboard Gerencial**

O dashboard oferece visibilidade em nível de negócio através de indicadores como:
- Receita
- Volume de vendas
- Ticket médio
- Movimentação de produtos
- Indicadores de estoque
- Alertas de estoque baixo

**Administração**

As capacidades administrativas incluem:
- Gestão de usuários
- Gestão de papéis (roles)
- Gestão de permissões
- Gestão de tenants
- Bloqueio de contas
- Suspensão de tenants
- Gestão de sessões
- Impersonate administrativo

## Arquitetura

Em alto nível, o Exactum segue uma arquitetura de backend em camadas, com separação explícita entre tratamento HTTP, lógica de aplicação e persistência.

```
                         ┌──────────────────┐
                         │      Browser     │
                         │   React / Vite   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Nginx       │
                         │  Reverse Proxy   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Exactum API    │
                         │      Flask       │
                         └────────┬─────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
          ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
          │ PostgreSQL  │  │    Redis    │  │Observability│
          │ Application │  │  Sessions   │  │    Logs     │
          │    Data     │  │  & Tokens   │  │ & Auditing  │
          └─────────────┘  └─────────────┘  └─────────────┘
```

**Evolução arquitetural**

A arquitetura atual é predominantemente orientada a camadas. A partir da
v0.3.x, o projeto passa a evoluir progressivamente para uma organização
orientada a domínios, buscando reduzir o acoplamento entre regras de negócio,
framework e infraestrutura.

A organização atual pode ser simplificada como:

```
HTTP
 │
 ▼
Routes / Controllers
 │
 ▼
Application Services
 │
 ▼
Repositories
 │
 ▼
Persistence
```

Essa estrutura **não representa uma arquitetura DDD completa**. Ela representa o estágio atual de evolução do projeto e serve como base para a introdução progressiva de conceitos de domínio, application services e infraestrutura mais desacoplada.

Preocupações transversais de infraestrutura são isoladas na camada de infraestrutura, incluindo observabilidade, infraestrutura relacionada à autenticação e outras questões de plataforma.

→ [Ler a Documentação de Arquitetura](./docs/architecture/overview.md)

## Segurança

Segurança é tratada como uma preocupação arquitetural de primeira classe no Exactum.

A arquitetura de autenticação evoluiu de uma implementação simples baseada em JWT para um modelo consciente de sessão, usando cookies HttpOnly seguros e gestão de sessão apoiada em Redis.

**Autenticação**

A arquitetura atual de autenticação separa credenciais de acesso e de renovação:

```
                         Login
                           │
                           ▼
                  Validate credentials
                           │
                           ▼
                   Create session
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       Access Token              Refresh Token
              │                         │
              ▼                         ▼
       HttpOnly Cookie            HttpOnly Cookie
                                        │
                                        ▼
                                      Redis
```

Refresh tokens são rotacionados durante operações de renovação, permitindo que sessões previamente emitidas sejam revogadas quando necessário.

**Gestão de Sessão**

O Redis é utilizado como parte da camada de gestão de sessão para suportar operações como:
- Rastreamento de sessões ativas
- Gestão de refresh tokens
- Revogação de tokens
- Invalidação por logout
- Bloqueio de usuários
- Suspensão de tenants
- Gestão do ciclo de vida da sessão

**Fronteiras de Segurança**

O backend é a única autoridade para operações sensíveis à segurança. O frontend nunca é considerado uma fronteira de segurança: as verificações de permissão no lado do cliente existem apenas para controlar UX e visibilidade, e não têm nenhum efeito sobre a autorização real, que é sempre validada pela API.

→ [Documentação de Autenticação](./docs/security/authentication.md) · → [Gestão de Sessão](./docs/security/session-management.md)

## Autorização & RBAC

O Exactum implementa Role-Based Access Control com permissões granulares:

```
                    User
                      │
                      ▼
                     Role
                      │
                      ▼
                Permissions
                      │
                      ▼
                Authorization
```

Papéis podem ser criados e gerenciados de acordo com as necessidades de cada tenant, enquanto as permissões determinam quais operações estão disponíveis para cada papel.

A autorização é aplicada no backend e refletida no frontend para garantir uma experiência de usuário consistente. A plataforma também fornece um contexto de super-admin para administração e diagnóstico em nível de plataforma.

**Impersonate Administrativo**

Super-administradores podem operar temporariamente no contexto de outro usuário, para fins diagnósticos e administrativos. O impersonate é explicitamente rastreado através de eventos de plataforma, incluindo:
- Início do impersonate
- Fim do impersonate
- Usuário-alvo
- Tenant-alvo
- Administrador original
- Metadados da requisição

→ [Documentação de RBAC & Autorização](./docs/security/authorization.md)

## Multi-Tenancy

O Exactum utiliza uma arquitetura multi-tenant lógica. O contexto do tenant é estabelecido durante o processamento da requisição e propagado por toda a aplicação. Na camada de persistência, os repositórios escopam explicitamente as queries de dados pertencentes a um tenant.

```
                    Request
                       │
                       ▼
               Authentication
                       │
                       ▼
                Tenant Context
                       │
                       ▼
                Authorization
                       │
                       ▼
                 Application
                       │
                       ▼
                 Repository
                       │
                       ▼
               Tenant-scoped Query
                       │
                       ▼
                  PostgreSQL
```

**Isolamento defensivo de tenants**

O Exactum evita depender de uma única camada para garantir o isolamento entre tenants. O contexto do tenant é estabelecido durante o processamento da requisição, enquanto a camada de persistência aplica filtros explícitos nas consultas que operam sobre dados tenant-scoped.

Essa abordagem cria uma segunda barreira contra erros de implementação que poderiam resultar em acesso cruzado entre tenants, reduzindo o risco de exposição acidental de dados causada por futuras mudanças na lógica de negócio ou nas queries do banco.

→ [Documentação de Multi-Tenancy](./docs/architecture/multi-tenancy.md)

## Observabilidade & Auditoria

O Exactum separa a observabilidade operacional dos eventos de plataforma e da auditoria voltada ao tenant.

```
                           Exactum
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       Infrastructure      Platform         Tenant
           Logs             Events         Audit Logs
              │               │               │
              ▼               ▼               ▼
        Operations       Super Admin       Tenant Admin
```

| Camada | Propósito | Consumidor |
|---|---|---|
| Logs de Infraestrutura | Requisições HTTP e diagnóstico operacional | Plataforma / operações |
| Eventos de Plataforma | Atividade administrativa e de plataforma | Super-admin |
| Logs de Auditoria | Histórico de atividade visível ao tenant | Administradores do tenant |

**Logs de Infraestrutura**

Os logs de requisição capturam informações operacionais como: ID da requisição, método HTTP, path, status da resposta, duração, contexto de usuário/tenant/super-admin, IP e user agent. Os logs são emitidos como JSON estruturado para facilitar futura ingestão por sistemas de observabilidade.

**Eventos de Plataforma**

Representam operações em nível de plataforma, como: criação, suspensão e reativação de tenant, ações administrativas, impersonate e operações de conta em nível de plataforma.

**Logs de Auditoria**

Desenhados para responsabilização histórica voltada ao tenant. Exemplos: criação/atualização de usuários e produtos, alterações de perfil, exclusão de produtos, operações de venda e demais ações de negócio escopadas por tenant.

A camada de auditoria separa intencionalmente o conceito de quem executou uma ação, qual entidade foi afetada, qual foi o contexto da mudança e quando ela ocorreu:

```
Quem?          →  user_uuid
Qual tenant?   →  tenant_uuid
O que houve?   →  event
Qual entidade? →  entity
Qual contexto? →  payload
Quando?        →  created_at
```

Esse modelo evita que a auditoria seja apenas "uma tabela de logs": cada registro carrega ator, tenant, entidade afetada, contexto estruturado e timestamp de forma consistente.

→ [Documentação de Observabilidade](./docs/observability/overview.md) · → [Logs de Auditoria](./docs/observability/audit-logging.md)

## Stack Tecnológica

**Backend**

| Tecnologia | Propósito |
|---|---|
| Python | Linguagem principal do backend |
| Flask | Framework web |
| Flask-Smorest | API REST e integração com OpenAPI |
| Marshmallow | Validação e serialização |
| SQLAlchemy | ORM e abstração de persistência |
| PostgreSQL | Banco de dados relacional principal |
| Redis | Gestão de sessão e tokens |

**Frontend**

| Tecnologia | Propósito |
|---|---|
| React | Interface de usuário |
| Vite | Build tooling do frontend |
| Tailwind CSS | Estilização da UI |

**Infraestrutura**

| Tecnologia | Propósito |
|---|---|
| Docker | Containerização |
| Docker Compose | Orquestração de serviços |
| Nginx | Reverse proxy e servidor web |
| Linux | Ambiente de produção |
| Hetzner VPS | Hospedagem da aplicação |

**Desenvolvimento & Qualidade**

| Tecnologia | Propósito |
|---|---|
| Pytest | Testes automatizados |
| Ruff | Linting e qualidade de código |
| GitHub Actions | CI/CD |
| Alembic / Flask-Migrate | Migrações de banco de dados |
| OpenAPI / Swagger | Documentação da API |

## Decisões Técnicas

**🔒 Dupla camada de isolamento de tenant**

Uma abordagem comum em aplicações multi-tenant é confiar em um único filtro para isolar os dados dos clientes, o que deixa pouca margem de segurança em queries mais complexas. No Exactum, adotamos uma abordagem com dupla validação:

1. **Validação via contexto da requisição:** toda requisição que entra na API passa pelas etapas de autenticação e estabelecimento do contexto de segurança. A partir desse contexto, o tenant associado à operação é determinado e propagado pela aplicação.
2. **Filtro explícito na persistência:** a camada de persistência não confia exclusivamente no contexto da requisição; operações sobre dados tenant-scoped aplicam explicitamente o tenant correspondente.

> As duas camadas precisam bater perfeitamente para que qualquer dado seja exposto. Esse isolamento redundante reduz significativamente o risco de vazamento de informações entre contas — nenhuma estratégia de isolamento elimina esse risco por completo.

**🔑 Recuperação de senha via credencial temporária**

Em vez do fluxo tradicional de e-mail com links de expiração rápida, o administrador define uma senha temporária para o usuário. No primeiro login, o sistema força a troca imediata para uma senha definitiva — um fluxo desenhado sob medida para o perfil do pequeno varejo, onde o gestor tem contato direto com sua equipe de frente de caixa.

**🔑 Evolução da estratégia de autenticação: de JWT em sessionStorage para cookies HttpOnly**

O sistema evoluiu de uma autenticação stateless baseada em JWT armazenado no `sessionStorage` do cliente para um modelo consciente de sessão, com cookies HttpOnly/Secure gerenciados pelo backend e sessão apoiada em Redis. Isso reduz a exposição dos tokens a scripts executados no contexto do navegador, mitigando uma classe importante de riscos associados à exfiltração de tokens via XSS, já que o ecossistema React deixa de ter acesso direto ao token via JavaScript.

**⚡ Flask-Smorest + Marshmallow vs FastAPI**

O Flask-Smorest entrega o melhor dos dois mundos: mantém a flexibilidade e a maturidade do ecossistema Flask enquanto gera documentação OpenAPI automaticamente a partir dos schemas Marshmallow. Isso elimina duplicação de código e centraliza validação e serialização em uma única fonte de verdade.

**🚀 Ruff como linter único**

Substitui completamente a cadeia composta por Flake8 + isort + Black, com configuração unificada em um único arquivo e velocidade significativamente maior. Em um ambiente com CI/CD ativo, a redução no tempo de execução do pipeline otimiza os ciclos de entrega.

## Documentação da API

O Exactum expõe uma API REST documentada via OpenAPI. A documentação é gerada automaticamente a partir dos schemas e definições de endpoints da aplicação.

Ao rodar a aplicação localmente:

```
http://localhost:5000/doc/swagger
```

A documentação cobre os endpoints disponíveis, schemas de requisição/resposta e requisitos de validação.

→ [Documentação da API](./docs/api/overview.md)

## Como Executar Localmente

**Pré-requisitos**

Certifique-se de ter instalado:
- Git
- Docker & Docker Compose
- Node.js 22+

**1. Clonar o repositório**

```bash
git clone https://github.com/orafaeldantas/exactum-api.git
cd exactum-api
```

**2. Configurar o ambiente**

```bash
cp .env.example .env
```

Ajuste as variáveis de ambiente necessárias conforme seu ambiente local.

> ⚠️ Nunca faça commit de credenciais, tokens ou segredos de produção no repositório.

**3. Subir o backend**

```bash
docker compose up -d --build
```

**4. Rodar as migrações do banco**

```bash
docker compose exec api bash && flask db upgrade
```

**5. Subir o frontend**

```bash
cd frontend
npm install
npm run dev
```

**Serviços locais**

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/doc/swagger |

Para o ambiente de desenvolvimento completo e procedimentos de troubleshooting:

→ [Documentação de Desenvolvimento](./docs/operations/development.md)

## Estrutura do Projeto

O repositório é organizado em torno de código de aplicação, infraestrutura, testes e documentação.

```text
exactum-api/
├── ...
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │
│   │   ├── domains/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── tenants/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   └── ...
│   │   │
│   │   ├── infra/
│   │   │   ├── observability/
│   │   │   └── ...
│   │   │
│   │   └── ...
│   │
│   ├── migrations/
│   │
│   ├── tests/
│   │
│   └── ...
│
├── frontend/
│   └── src/
│
├── nginx/
│   ├── conf.d/
│   └── ...
│
├── docs/
│   ├── README.md
│   │
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── system-context.md
│   │   ├── application-architecture.md
│   │   ├── domain-boundaries.md
│   │   ├── multi-tenancy.md
│   │   └── decisions/          # ADRs
│   │
│   ├── security/
│   │   ├── overview.md
│   │   ├── authentication.md
│   │   ├── authorization.md
│   │   ├── session-management.md
│   │   ├── tenant-isolation.md
│   │   └── threat-model.md
│   │
│   ├── observability/
│   │   ├── overview.md
│   │   ├── infrastructure-logging.md
│   │   ├── platform-events.md
│   │   ├── audit-logging.md
│   │   └── correlation.md
│   │
│   ├── api/
│   │   ├── overview.md
│   │   ├── conventions.md
│   │   ├── authentication.md
│   │   ├── errors.md
│   │   └── versioning.md
│   │
│   ├── database/
│   │   ├── overview.md
│   │   ├── schema.md
│   │   ├── migrations.md
│   │   └── soft-delete.md
│   │
│   ├── operations/
│   │   ├── development.md
│   │   ├── docker.md
│   │   ├── deployment.md
│   │   ├── nginx.md
│   │   └── runbook.md
│   │
│   ├── testing/
│   │   ├── strategy.md
│   │   └── ci.md
│   │
│   └── readme-imgs/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
└── README.md
```

O README é a porta de entrada do projeto — ele responde rapidamente "o que é, por que existe, o que possui, como é arquitetado e como executar". Detalhes de arquitetura, threat model, ADRs, schema de banco e contratos de auditoria ficam documentados em `docs/`, mantendo o README principal focado em conceitos de sistema.

→ [Arquitetura da Aplicação](./docs/architecture/application-architecture.md)

## Documentação

A documentação do Exactum é organizada por área de engenharia.

**Arquitetura**
- [Visão Geral da Arquitetura](./docs/architecture/overview.md)
- [Contexto do Sistema](./docs/architecture/system-context.md)
- [Arquitetura da Aplicação](./docs/architecture/application-architecture.md)
- [Fronteiras de Domínio](./docs/architecture/domain-boundaries.md)
- [Multi-Tenancy](./docs/architecture/multi-tenancy.md)
- [Registros de Decisão Arquitetural (ADRs)](./docs/architecture/decisions/)

**Segurança**
- [Visão Geral de Segurança](./docs/security/overview.md)
- [Autenticação](./docs/security/authentication.md)
- [Autorização & RBAC](./docs/security/authorization.md)
- [Gestão de Sessão](./docs/security/session-management.md)
- [Isolamento de Tenant](./docs/security/tenant-isolation.md)
- [Threat Model](./docs/security/threat-model.md)

**Observabilidade**
- [Visão Geral de Observabilidade](./docs/observability/overview.md)
- [Logs de Infraestrutura](./docs/observability/infrastructure-logging.md)
- [Eventos de Plataforma](./docs/observability/platform-events.md)
- [Logs de Auditoria](./docs/observability/audit-logging.md)

**API**
- [Visão Geral da API](./docs/api/overview.md)
- [Autenticação](./docs/api/authentication.md)
- [Convenções da API](./docs/api/conventions.md)
- [Tratamento de Erros](./docs/api/errors.md)
- [Versionamento da API](./docs/api/versioning.md)

**Banco de Dados**
- [Arquitetura do Banco](./docs/database/overview.md)
- [Schema do Banco](./docs/database/schema.md)
- [Migrações do Banco](./docs/database/migrations.md)

**Operações**
- [Ambiente de Desenvolvimento](./docs/operations/development.md)
- [Deploy](./docs/operations/deployment.md)
- [Docker](./docs/operations/docker.md)
- [Nginx](./docs/operations/nginx.md)
- [Runbook Operacional](./docs/operations/runbook.md)

**Testes**
- [Estratégia de Testes](./docs/testing/strategy.md)
- [CI/CD](./docs/testing/ci.md)

**Outros documentos de primeira classe**
- [CHANGELOG.md](./CHANGELOG.md) — histórico de versões e mudanças
- [SECURITY.md](./SECURITY.md) — política de segurança e reporte de vulnerabilidades

→ [Abrir o Hub de Documentação](./docs/README.md)

**Registros de Decisão Arquitetural (ADRs)**

Decisões técnicas importantes são documentadas através de Registros de Decisão Arquitetural (ADRs). O objetivo é preservar não apenas o que foi implementado, mas também por que uma determinada abordagem foi escolhida e quais alternativas foram consideradas.

Exemplos de decisões documentadas: estratégia de isolamento multi-tenant, arquitetura de autenticação, gestão de sessão via Redis, arquitetura de RBAC, arquitetura de observabilidade, log de auditoria, soft deletion, rate limiting, identificadores externos via UUID.

→ [Ver Architecture Decisions](./docs/architecture/decisions/)

## Versionamento & Releases

O Exactum segue um esquema de versionamento no estilo `vMAJOR.MINOR.PATCH-stage` (ex.: `v0.2.0-alpha`), ainda em fase pré-1.0:

- **MAJOR** permanece `0` enquanto o projeto está em fase Alpha/Beta e a API pode sofrer mudanças incompatíveis.
- **MINOR** representa um ciclo de desenvolvimento com mudanças e funcionalidades relevantes.
- **PATCH** representa correções e ajustes compatíveis dentro do ciclo atual.
- O sufixo (`-alpha`, `-beta`) indica a maturidade da versão.

No Exactum, versões MINOR também são utilizadas para representar **ciclos temáticos de evolução**.

Mudanças relevantes de cada versão são registradas no [CHANGELOG.md](./CHANGELOG.md).

## Roadmap

**v0.2.x — Segurança, Autorização & Observabilidade**

- [x] Cookies de autenticação HttpOnly
- [x] Separação access / refresh token
- [x] Rotação de refresh token
- [x] Gestão de sessão via Redis
- [x] Revogação de sessão
- [x] Bloqueio de usuários
- [x] Suspensão de tenant
- [x] RBAC granular
- [x] Gestão de papéis (roles)
- [x] Gestão de permissões
- [x] Impersonate administrativo
- [x] Log de eventos de plataforma
- [x] Log de auditoria por tenant
- [x] Logging estruturado de requisições
- [x] IDs de correlação de requisição
- [x] Rate limiting
- [x] Soft delete
- [x] Tratamento de exceções aprimorado
- [x] Melhorias de UX
- [x] Documentação da API profissionalizada

**v0.3.x — Evolução Arquitetural**

O próximo grande ciclo de desenvolvimento está focado em melhorar as fronteiras arquiteturais internas:

- [ ] Fronteiras de domínio mais fortes
- [ ] Refatoração adicional inspirada em DDD
- [ ] Refinamento de services e repositories
- [ ] Redução do acoplamento com o framework na lógica de aplicação
- [ ] Modelagem de domínio aprimorada
- [ ] Ampliação da cobertura de testes automatizados
- [ ] Melhorias contínuas de observabilidade
- [ ] Cache de alta performance com Redis
- [ ] Processamento assíncrono de tarefas com Celery + RabbitMQ
- [ ] Observabilidade centralizada com Prometheus + Grafana

**Futuro**

Capacidades futuras em exploração:

- [ ] Análise preditiva de estoque com machine learning
- [ ] Insights de negócio assistidos por IA (integração com Groq API)
- [ ] Processamento de tarefas em background
- [ ] Integrações com marketplaces externos (Mercado Livre, Shopee, WooCommerce)
- [ ] Arquitetura de webhooks e consumo de APIs externas
- [ ] Relatórios avançados / exportação (CSV/PDF)
- [ ] Notificações em tempo real
- [ ] Integração com Telegram Bot
- [ ] Mural de avisos internos (arquitetura orientada a eventos)
- [ ] Emissão de Nota Fiscal Eletrônica (API simulada)

O roadmap representa áreas de exploração e desenvolvimento planejado. As funcionalidades podem mudar conforme os requisitos arquiteturais e de produto evoluem.

## Filosofia do Projeto

O Exactum é desenvolvido intencionalmente como algo além de um protótipo funcional de ERP. O projeto também é uma exploração de como um produto de software pode evoluir de uma arquitetura inicialmente funcional para práticas de engenharia mais sólidas.

Os principais princípios que guiam o projeto são:

**Segurança por Design**
Decisões de segurança devem ser incorporadas à arquitetura, em vez de adicionadas apenas após a funcionalidade estar pronta.

**Fronteiras Explícitas**
Lógica de negócio, preocupações de infraestrutura, preocupações HTTP e persistência devem ter responsabilidades claramente definidas.

**Observabilidade como Preocupação de Primeira Classe**
Um sistema em produção deve fornecer informação suficiente para entender o que aconteceu, quando aconteceu e em qual contexto.

**Isolamento de Dados**
Sistemas multi-tenant exigem fronteiras explícitas e defensivas de acesso a dados.

**Evolução sobre Perfeição**
A arquitetura pode evoluir conforme o sistema se torna mais complexo. Decisões técnicas são documentadas para preservar contexto e tornar futuras refatorações deliberadas, e não acidentais.

**Engenharia através da Prática**
O Exactum é desenvolvido como um ambiente prático para aplicar conceitos como arquitetura de software, modelagem de domínio, engenharia de backend, design de banco de dados, conceitos de sistemas distribuídos, segurança, observabilidade, CI/CD, infraestrutura e testes.

## Contribuindo

Contribuições, sugestões e discussões técnicas são bem-vindas.

Antes de enviar alterações, revise o [CONTRIBUTING.md](./CONTRIBUTING.md).

Para questões relacionadas à segurança, consulte a [política de segurança](./SECURITY.md). Para o histórico de mudanças entre versões, consulte o [CHANGELOG.md](./CHANGELOG.md).

## Licença

O Exactum é distribuído sob a licença MIT. Veja [LICENSE](./LICENSE) para o texto completo.

<p align="center">
Desenvolvido com ☕ e 💻 por <strong>Rafael Dantas</strong> · 2026
</p>
