# Arquitetura — Visão Geral

> Visão arquitetural de alto nível do Exactum, suas principais fronteiras,
> responsabilidades, relações entre componentes e direção de evolução.

---

## 1. Objetivo

Este documento apresenta a arquitetura do Exactum em nível sistêmico e
aplicacional.

Seu objetivo é estabelecer uma visão comum sobre:

- os principais componentes da plataforma;
- as responsabilidades de cada camada;
- as fronteiras entre aplicação, domínio e infraestrutura;
- o fluxo geral de uma requisição;
- as principais preocupações transversais;
- a estratégia de multi-tenancy;
- a direção de evolução arquitetural do projeto.

Este documento descreve **como a arquitetura é organizada e como seus
componentes se relacionam**, mas não busca detalhar implementações
específicas.

Detalhes de autenticação, autorização, persistência, observabilidade,
multi-tenancy, contratos de API e decisões arquiteturais específicas são
mantidos em documentos especializados.

---

## 2. Contexto Arquitetural

O Exactum é uma plataforma SaaS multi-tenant de ERP voltada para pequenas e
médias empresas do varejo.

A plataforma centraliza operações relacionadas a:

- produtos;
- estoque;
- vendas;
- ponto de venda;
- usuários;
- papéis e permissões;
- administração de tenants;
- auditoria;
- observabilidade.

A aplicação é disponibilizada como uma aplicação web composta por frontend,
backend e serviços de infraestrutura.

Em alto nível, o sistema pode ser representado da seguinte forma:

```text
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
          │ Application │  │ Sessions &  │  │ Logs &      │
          │    Data     │  │   Tokens    │  │  Auditing   │
          └─────────────┘  └─────────────┘  └─────────────┘
```

O frontend atua como cliente da API, enquanto o backend concentra as regras
de segurança, autorização e acesso aos dados.

O PostgreSQL é o armazenamento persistente principal. O Redis fornece
infraestrutura de suporte principalmente para mecanismos relacionados a
sessões e autenticação.

---

## 3. Estilo Arquitetural Atual

A arquitetura atual do backend é predominantemente orientada a camadas.

As principais responsabilidades são separadas entre tratamento HTTP, lógica
de aplicação, persistência e infraestrutura.

Em uma representação simplificada:

```text
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

Essa organização fornece uma separação inicial de responsabilidades, mas não
representa uma arquitetura DDD completa.

A estrutura atual é resultado da evolução incremental do projeto e ainda
contém acoplamentos relacionados ao framework e à organização histórica da
aplicação.

Isso é considerado parte do estado atual do sistema e não necessariamente
representa a arquitetura alvo.

### 3.1 Direção Arquitetural

A partir da `v0.3.x`, o projeto passa a evoluir progressivamente para uma
organização orientada a domínios.

O objetivo é fortalecer as fronteiras entre:

- regras de negócio;
- lógica de aplicação;
- transporte HTTP;
- persistência;
- infraestrutura;
- framework.

A evolução busca reduzir o acoplamento entre regras de negócio e detalhes
tecnológicos, tornando a aplicação mais testável, compreensível e
sustentável.

A transição será incremental e não representa uma reescrita completa do
sistema.

---

## 4. Fronteiras Arquiteturais

A arquitetura pode ser compreendida através de quatro grandes áreas de
responsabilidade:

```text
┌─────────────────────────────────────────────────────┐
│                    HTTP / API                       │
│                                                     │
│ Routes · Controllers · Schemas · HTTP Errors        │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                Application Layer                    │
│                                                     │
│ Use Cases · Application Services · Orchestration    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Domain Layer                       │
│                                                     │
│ Business Rules · Domain Concepts · Policies         │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                Infrastructure                       │
│                                                     │
│ Database · Redis · Logging · External Services      │
└─────────────────────────────────────────────────────┘
```

> **Importante:** o diagrama acima representa principalmente a direção
> arquitetural desejada. A implementação atual ainda está em processo de
> evolução para fronteiras de domínio mais explícitas.

A separação entre essas responsabilidades é uma das principais preocupações
da evolução arquitetural da `v0.3.x`.

---

## 5. Organização por Domínios

O backend possui uma organização progressivamente orientada a domínios.

Entre os principais domínios atualmente identificados estão:

```text
app/
└── domains/
    ├── auth/
    ├── users/
    ├── tenants/
    ├── products/
    ├── sales/
    └── ...
```

A organização por domínio representa uma tentativa de aproximar a estrutura
do código das responsabilidades do negócio.

Um domínio não deve ser interpretado apenas como uma pasta contendo arquivos
relacionados.

A direção arquitetural é fazer com que cada domínio concentre progressivamente:

- conceitos de negócio;
- regras relacionadas;
- casos de uso;
- contratos necessários;
- interfaces para dependências externas;
- implementações específicas quando apropriado.

As fronteiras específicas entre os domínios são descritas em:

→ [Fronteiras de Domínio](./domain-boundaries.md)

---

## 6. Fluxo de uma Requisição

Uma requisição típica percorre múltiplas fronteiras do sistema.

```text
Client
  │
  ▼
Nginx
  │
  ▼
Flask / HTTP
  │
  ├── Authentication
  │
  ├── Tenant Context
  │
  ├── Authorization
  │
  ▼
Controller / Route
  │
  ▼
Application Service
  │
  ▼
Repository
  │
  ▼
PostgreSQL
```

Durante esse fluxo, preocupações transversais podem participar do ciclo de
vida da requisição, incluindo:

- autenticação;
- autorização;
- contexto de tenant;
- logging;
- correlation IDs;
- tratamento de exceções;
- auditoria;
- controle de rate limiting.

O frontend pode refletir o estado de autenticação e as permissões para
controlar a experiência do usuário, mas não constitui uma fronteira de
segurança.

A autoridade final sobre autenticação, autorização e acesso aos dados
permanece no backend.

---

## 7. Multi-Tenancy

O Exactum utiliza um modelo de multi-tenancy lógico.

Múltiplos tenants compartilham a infraestrutura da aplicação, enquanto os
dados pertencentes a cada tenant permanecem logicamente isolados.

O fluxo arquitetural simplificado é:

```text
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

O isolamento não depende de uma única camada.

O contexto do tenant é estabelecido durante o processamento da requisição,
enquanto a camada de persistência aplica explicitamente o escopo de tenant
nas operações que trabalham com dados tenant-scoped.

Essa abordagem fornece uma estratégia defensiva contra erros de implementação
que poderiam resultar em acesso cruzado entre tenants.

Os detalhes dessa estratégia são documentados em:

→ [Multi-Tenancy](./multi-tenancy.md)

---

## 8. Segurança

Segurança é tratada como uma preocupação arquitetural transversal.

Entre os principais mecanismos atualmente utilizados estão:

- autenticação baseada em cookies HttpOnly;
- separação entre access token e refresh token;
- rotação de refresh tokens;
- gestão de sessão apoiada em Redis;
- revogação de sessões;
- RBAC;
- permissões granulares;
- isolamento de tenant;
- rate limiting;
- bloqueio de usuários;
- suspensão de tenants;
- impersonate administrativo.

A segurança é distribuída entre diferentes responsabilidades da aplicação.

Por exemplo, a autenticação possui lógica de aplicação e regras de segurança,
enquanto mecanismos como Redis e bibliotecas de JWT pertencem às
preocupações de infraestrutura.

Essa separação permite que mecanismos tecnológicos sejam substituídos ou
evoluídos sem necessariamente alterar as regras de negócio que dependem deles.

Documentação relacionada:

- [Visão Geral de Segurança](../security/overview.md)
- [Autenticação](../security/authentication.md)
- [Autorização](../security/authorization.md)
- [Gestão de Sessão](../security/session-management.md)
- [Isolamento de Tenant](../security/tenant-isolation.md)

---

## 9. Persistência

O PostgreSQL é o banco de dados relacional principal do Exactum.

A aplicação utiliza SQLAlchemy como ORM e repositories como uma abstração
para operações de persistência.

De forma simplificada:

```text
Application
     │
     ▼
Repository
     │
     ▼
SQLAlchemy
     │
     ▼
PostgreSQL
```

Os repositories são responsáveis por concentrar operações relacionadas à
persistência e evitar que detalhes de acesso ao banco sejam espalhados pela
lógica de aplicação.

Operações de negócio que exigem consistência entre múltiplas alterações são
executadas dentro de transações.

As alterações estruturais do banco são controladas através de migrações
versionadas utilizando Alembic / Flask-Migrate.

Documentação relacionada:

- [Arquitetura do Banco](../database/overview.md)
- [Schema](../database/schema.md)
- [Migrações](../database/migrations.md)
- [Soft Delete](../database/soft-delete.md)

---

## 10. Redis

O Redis é utilizado como infraestrutura de suporte para mecanismos que
dependem de estado temporário e operações de baixa latência.

Atualmente, suas principais responsabilidades estão relacionadas à gestão de
sessões e autenticação, incluindo:

- armazenamento de informações de sessão;
- controle de refresh tokens;
- revogação de sessões;
- invalidação de sessões;
- mecanismos relacionados ao ciclo de vida da autenticação.

O Redis não representa a fonte persistente principal dos dados de negócio.

A utilização futura do Redis como camada de cache de alta performance está
prevista no roadmap da `v0.3.x`.

---

## 11. Observabilidade

A observabilidade é tratada como uma preocupação transversal da arquitetura.

Atualmente, a plataforma possui:

- logging estruturado;
- logs em JSON;
- correlation IDs;
- contexto de usuário;
- contexto de tenant;
- eventos de plataforma;
- logs de auditoria.

A arquitetura diferencia três categorias principais:

```text
                         Exactum
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      Infrastructure      Platform       Tenant
          Logs             Events       Audit Logs
             │              │              │
             ▼              ▼              ▼
        Operations      Super Admin    Tenant Admin
```

### 11.1 Logs de Infraestrutura

São destinados ao diagnóstico e operação da plataforma.

Podem incluir informações como:

- request ID;
- método HTTP;
- path;
- status da resposta;
- duração;
- usuário;
- tenant;
- IP;
- user agent.

Os logs são emitidos em formato estruturado para facilitar futura ingestão
por ferramentas de observabilidade.

### 11.2 Eventos de Plataforma

Representam operações administrativas em nível de plataforma.

Exemplos incluem:

- criação de tenant;
- suspensão de tenant;
- reativação de tenant;
- operações administrativas;
- início de impersonate;
- encerramento de impersonate.

### 11.3 Logs de Auditoria

São destinados à responsabilização histórica dentro do contexto de um
tenant.

Um evento de auditoria busca registrar de forma estruturada:

```text
Quem?          → user_uuid
Qual tenant?   → tenant_uuid
O que houve?   → event
Qual entidade? → entity
Qual contexto? → payload
Quando?        → created_at
```

A auditoria, portanto, não é tratada apenas como uma coleção de mensagens de
log, mas como registros estruturados de atividade.

Documentação relacionada:

- [Observabilidade](../observability/overview.md)
- [Infrastructure Logging](../observability/infrastructure-logging.md)
- [Platform Events](../observability/platform-events.md)
- [Audit Logging](../observability/audit-logging.md)

---

## 12. Frontend

O frontend do Exactum é desenvolvido utilizando:

- React;
- Vite;
- Tailwind CSS.

Sua responsabilidade principal é fornecer a interface de interação com o
sistema e consumir os recursos disponibilizados pela API.

O frontend pode adaptar sua interface de acordo com:

- autenticação;
- permissões;
- estado da aplicação;
- contexto operacional.

Entretanto, essas informações não constituem mecanismos de segurança.

Qualquer operação protegida deve ser validada novamente pelo backend.

A arquitetura mantém, portanto, uma separação clara entre:

```text
Frontend
   │
   │ UX / Presentation
   ▼
Backend
   │
   │ Security / Authorization
   ▼
Data
```

---

## 13. Infraestrutura

A infraestrutura atual é baseada em containers Docker executados em um
ambiente Linux hospedado em uma VPS.

Em alto nível:

```text
                         Internet
                            │
                            ▼
                         Nginx
                            │
                            ▼
                       Docker Host
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        Exactum API     PostgreSQL       Redis
```

O Nginx atua como proxy reverso e ponto de entrada HTTP.

Docker fornece isolamento e empacotamento dos componentes da aplicação.

Docker Compose é utilizado para coordenar os serviços do ambiente.

A infraestrutura atual é adequada ao estágio Alpha do projeto, mas não
representa uma arquitetura de alta disponibilidade.

A evolução futura da infraestrutura poderá incluir mecanismos adicionais de:

- observabilidade;
- processamento assíncrono;
- cache;
- escalabilidade;
- automação operacional.

Documentação relacionada:

- [Docker](../operations/docker.md)
- [Deploy](../operations/deployment.md)
- [Nginx](../operations/nginx.md)
- [Runbook](../operations/runbook.md)

---

## 14. Testes e Qualidade

A qualidade da aplicação é suportada por testes automatizados, análise
estática e integração contínua.

A stack atual inclui:

- Pytest;
- Ruff;
- GitHub Actions;
- testes automatizados;
- validações executadas durante o CI.

A estratégia de testes deverá evoluir junto com as fronteiras arquiteturais,
especialmente durante a refatoração da `v0.3.x`.

O fortalecimento das fronteiras de domínio também deve permitir que uma
parcela maior das regras de negócio seja testada sem depender diretamente do
framework ou de componentes externos.

→ [Estratégia de Testes](../testing/strategy.md)

---

## 15. Princípios Arquiteturais

A evolução da arquitetura é orientada por alguns princípios:

### Segurança por Design

Preocupações de segurança devem ser consideradas durante a definição da
arquitetura e não adicionadas apenas posteriormente.

### Fronteiras Explícitas

Responsabilidades de domínio, aplicação, HTTP, persistência e infraestrutura
devem possuir limites claros.

### Backend como Autoridade

O backend é a autoridade para autenticação, autorização e acesso aos dados.

### Isolamento Defensivo

Sistemas multi-tenant devem utilizar múltiplas barreiras para reduzir o risco
de acesso cruzado entre tenants.

### Observabilidade como Preocupação de Primeira Classe

Um sistema operacionalmente confiável deve produzir informações suficientes
para entender o que aconteceu, quando aconteceu e em qual contexto.

### Evolução Incremental

A arquitetura deve evoluir de forma progressiva, evitando reescritas
desnecessárias e preservando a funcionalidade existente.

### Independência de Framework

Regras de negócio devem progressivamente depender menos de detalhes
específicos do framework utilizado.

---

## 16. Evolução Arquitetural

A arquitetura do Exactum é tratada como uma arquitetura evolutiva.

O projeto não busca estabelecer uma arquitetura perfeita antecipadamente.
As fronteiras são fortalecidas conforme a complexidade do sistema aumenta.

A evolução pode ser representada de forma simplificada:

```text
Arquitetura em Camadas
        │
        ▼
Fronteiras de Responsabilidade
        │
        ▼
Organização por Domínios
        │
        ▼
Maior Independência do Framework
        │
        ▼
Maior Testabilidade
        │
        ▼
Arquitetura mais Sustentável
```

### v0.2.x

O ciclo atual concentrou-se principalmente em:

- segurança;
- autenticação;
- gestão de sessão;
- autorização;
- RBAC;
- multi-tenancy;
- observabilidade;
- auditoria;
- confiabilidade operacional.

### v0.3.x

O próximo ciclo concentra-se na evolução interna da arquitetura:

- fortalecimento das fronteiras de domínio;
- organização orientada a domínios;
- refinamento de services e repositories;
- redução do acoplamento com Flask;
- maior separação entre aplicação e infraestrutura;
- modelagem de domínio aprimorada;
- ampliação da cobertura de testes;
- preparação para processamento assíncrono;
- evolução da observabilidade;
- introdução de mecanismos de cache.

A transição será incremental.

A funcionalidade existente continuará sendo preservada enquanto componentes
internos forem refatorados.

---

## 17. Documentos Relacionados

Este documento funciona como ponto de entrada para a documentação
arquitetural do Exactum.

### Arquitetura

- [Contexto do Sistema](./system-context.md)
- [Arquitetura da Aplicação](./application-architecture.md)
- [Fronteiras de Domínio](./domain-boundaries.md)
- [Multi-Tenancy](./multi-tenancy.md)
- [Architecture Decision Records](./decisions/)

### Segurança

- [Visão Geral](../security/overview.md)
- [Autenticação](../security/authentication.md)
- [Autorização](../security/authorization.md)
- [Gestão de Sessão](../security/session-management.md)
- [Isolamento de Tenant](../security/tenant-isolation.md)
- [Threat Model](../security/threat-model.md)

### Observabilidade

- [Visão Geral](../observability/overview.md)
- [Infrastructure Logging](../observability/infrastructure-logging.md)
- [Platform Events](../observability/platform-events.md)
- [Audit Logging](../observability/audit-logging.md)
- [Correlation](../observability/correlation.md)

### Banco de Dados

- [Arquitetura do Banco](../database/overview.md)
- [Schema](../database/schema.md)
- [Migrações](../database/migrations.md)
- [Soft Delete](../database/soft-delete.md)

### API

- [Visão Geral](../api/overview.md)
- [Convenções](../api/conventions.md)
- [Autenticação](../api/authentication.md)
- [Erros](../api/errors.md)
- [Versionamento](../api/versioning.md)

### Operações

- [Desenvolvimento](../operations/development.md)
- [Docker](../operations/docker.md)
- [Deploy](../operations/deployment.md)
- [Nginx](../operations/nginx.md)
- [Runbook](../operations/runbook.md)

### Testes

- [Estratégia de Testes](../testing/strategy.md)
- [CI](../testing/ci.md)

---

## 18. Status do Documento

**Status:** Living Document

Este documento representa o estado arquitetural conhecido do Exactum e sua
direção de evolução.

Como o projeto permanece em desenvolvimento ativo, mudanças arquiteturais
relevantes devem ser refletidas neste documento.

Decisões que alterem significativamente a arquitetura, introduzam novos
padrões ou modifiquem fronteiras existentes devem ser registradas através de
um Architecture Decision Record (ADR).

→ [Architecture Decision Records](./decisions/)
