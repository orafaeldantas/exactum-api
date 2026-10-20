# Exactum — Documentação Técnica

> Documentação técnica e arquitetural do Exactum ERP.

---

## 1. Sobre esta documentação

Esta documentação descreve a arquitetura, segurança, API, banco de dados, observabilidade, operações e estratégia de testes do **Exactum**, um ERP multi-tenant desenvolvido para pequenos e médios negócios.

O objetivo não é apenas documentar como executar ou utilizar o sistema, mas registrar as principais **decisões técnicas, responsabilidades arquiteturais, mecanismos de segurança e princípios de evolução** adotados no projeto.

A documentação deve servir como referência para:

- desenvolvimento;
- manutenção;
- debugging;
- onboarding;
- evolução arquitetural;
- análise de segurança;
- operação em produção;
- entendimento do modelo de dados;
- entendimento dos contratos da API;
- testes;
- tomada de decisões técnicas futuras.

O Exactum encontra-se atualmente em evolução arquitetural. Portanto, alguns documentos representam simultaneamente:

1. o comportamento atual da aplicação;
2. as decisões arquiteturais já implementadas;
3. a direção planejada para versões futuras.

Sempre que houver diferença entre o estado atual e a arquitetura futura, essa diferença deve ser explicitamente identificada.

---

# 2. Visão geral da documentação

A documentação está organizada por responsabilidade técnica:

```text
docs/
├── README.md
│
├── architecture/
│   ├── overview.md
│   ├── system-context.md
│   ├── application-architecture.md
│   ├── domain-boundaries.md
│   └── decisions/
│
├── security/
│   ├── overview.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── session-management.md
│   ├── tenant-isolation.md
│   └── threat-model.md
│
├── observability/
│   ├── overview.md
│   ├── infrastructure-logging.md
│   ├── platform-events.md
│   ├── audit-logging.md
│   └── correlation.md
│
├── api/
│   ├── overview.md
│   ├── conventions.md
│   ├── authentication.md
│   ├── errors.md
│   └── versioning.md
│
├── database/
│   ├── overview.md
│   ├── schema.md
│   ├── migrations.md
│   └── soft-delete.md
│
├── operations/
│   ├── development.md
│   ├── docker.md
│   ├── deployment.md
│   ├── nginx.md
│   └── runbook.md
│
├── testing/
│   ├── strategy.md
│   └── ci.md
│
└── readme-imgs/
```

Além da documentação dentro de `docs/`, o projeto possui documentos de referência na raiz do repositório:

```text
CHANGELOG.md
CONTRIBUTING.md
LICENSE
SECURITY.md
```

---

# 3. Arquitetura

A seção `architecture/` descreve a organização estrutural e conceitual do sistema.

Ela responde principalmente às perguntas:

- Como o Exactum é estruturado?
- Quais são suas principais camadas?
- Quais são seus principais domínios?
- Como os componentes se relacionam?
- Onde cada responsabilidade deve existir?
- Quais são as fronteiras arquiteturais?
- Qual é a direção de evolução da arquitetura?

## Documentos

### `architecture/overview.md`

Apresenta a visão arquitetural geral do Exactum.

Inclui:

- visão geral do sistema;
- principais componentes;
- frontend;
- backend;
- PostgreSQL;
- Redis;
- Docker;
- Nginx;
- infraestrutura;
- GitHub Actions;
- separação entre aplicação e infraestrutura;
- princípios arquiteturais;
- direção de evolução.

---

### `architecture/system-context.md`

Descreve o Exactum em nível de **System Context**.

O documento apresenta:

- sistema principal;
- usuários;
- administradores;
- super-administradores;
- frontend;
- backend;
- banco de dados;
- Redis;
- infraestrutura;
- serviços externos;
- fronteiras do sistema.

O objetivo é permitir compreender o sistema sem precisar conhecer detalhes internos de implementação.

---

### `architecture/application-architecture.md`

Descreve a arquitetura interna da aplicação.

A estrutura atual segue principalmente o fluxo:

```text
HTTP
 ↓
Routes / Controllers
 ↓
Application Services
 ↓
Repositories
 ↓
Persistence
```

O documento detalha as responsabilidades de cada camada e as regras de dependência entre elas.

Também documenta a direção de evolução para uma arquitetura com maior separação de responsabilidades e menor acoplamento entre regras de negócio e framework.

---

### `architecture/domain-boundaries.md`

Documenta as principais fronteiras de domínio do Exactum.

Entre os conceitos atualmente presentes estão:

- Authentication;
- Users;
- Tenants;
- Products;
- Sales;
- Permissions;
- Roles;
- Sessions;
- Audit;
- Platform Events.

O documento também registra que algumas responsabilidades ainda estão agrupadas na implementação atual e poderão ser extraídas para contextos próprios no futuro.

Um exemplo é a evolução planejada de responsabilidades relacionadas a:

```text
Products / Sales
      ↓
Inventory
```

e:

```text
Operational domains
      ↓
Reporting
```

Essas separações representam direção arquitetural futura e não devem ser interpretadas como contextos independentes já existentes na implementação atual.

---

### `architecture/decisions/`

Diretório destinado aos **Architecture Decision Records (ADRs)**.

ADRs podem ser adicionados conforme decisões arquiteturais relevantes sejam tomadas.

Exemplos de decisões que podem ser registradas futuramente:

- escolha de UUID público;
- estratégia de multi-tenancy;
- adoção de HttpOnly cookies;
- estratégia de refresh token;
- Redis para session management;
- decisão de arquitetura de domínio;
- adoção de Celery/RabbitMQ;
- estratégia de observabilidade;
- eventual adoção de OpenTelemetry.

---

# 4. Segurança

A seção `security/` documenta os mecanismos responsáveis pela proteção do sistema.

Security é tratada como uma propriedade transversal da aplicação, abrangendo:

- Authentication;
- Authorization;
- Session Management;
- Tenant Isolation;
- Rate Limiting;
- proteção de dados;
- auditoria;
- observabilidade de eventos de segurança.

## Documentos

### `security/overview.md`

Apresenta a visão geral da estratégia de segurança.

Define os principais mecanismos utilizados para proteger:

- identidade;
- sessões;
- recursos;
- tenants;
- operações administrativas;
- dados;
- APIs.

---

### `security/authentication.md`

Documenta o mecanismo de Authentication.

Atualmente o Exactum utiliza:

```text
Access Token
+
Refresh Token
+
HttpOnly Cookies
+
Redis-backed Sessions
```

O documento aborda:

- login;
- access token;
- refresh token;
- cookies;
- rotação;
- revogação;
- logout;
- bloqueio de usuário;
- suspensão de tenant;
- impersonation;
- limitações atuais;
- considerações relacionadas a CSRF.

---

### `security/authorization.md`

Documenta o mecanismo de Authorization.

O Exactum utiliza uma combinação de:

```text
Roles
+
Permissions
+
Tenant Context
```

A autorização é aplicada no backend.

O frontend pode utilizar as permissões para melhorar a experiência do usuário, mas não é considerado uma fronteira de segurança.

---

### `security/session-management.md`

Documenta o gerenciamento de sessões.

Inclui:

- refresh sessions;
- JTI;
- Redis;
- refresh token rotation;
- revogação;
- logout;
- expiração;
- sessões associadas ao usuário;
- invalidação por eventos de segurança;
- relação entre sessão e tenant.

---

### `security/tenant-isolation.md`

Documenta a estratégia de isolamento entre tenants.

O princípio central é:

> uma operação pertencente a um tenant não deve conseguir acessar recursos pertencentes a outro tenant.

O mecanismo utiliza contexto de tenant associado à requisição e filtros explícitos na camada de persistência.

A arquitetura adota uma estratégia de **defesa em profundidade**, evitando depender de uma única camada para garantir isolamento.

---

### `security/threat-model.md`

Documenta as principais ameaças consideradas na arquitetura.

Entre os cenários analisados estão:

- acesso não autenticado;
- privilege escalation;
- tenant breakout;
- manipulação de identificadores;
- roubo/reutilização de tokens;
- abuso de sessões;
- impersonation;
- exposição de informações;
- ataques contra endpoints;
- abuso de permissões;
- falhas de isolamento;
- vazamento de informações através de logs.

O documento também diferencia controles existentes de controles planejados.

---

# 5. Observabilidade

A seção `observability/` descreve como o Exactum registra, correlaciona e acompanha o comportamento da aplicação.

A estratégia atual utiliza três conceitos principais:

```text
Infrastructure Logs
Platform Events
Audit Logs
```

Eles possuem responsabilidades diferentes e não devem ser tratados como equivalentes.

---

## Documentos

### `observability/overview.md`

Apresenta a estratégia geral de observabilidade.

Inclui:

- logging;
- events;
- audit;
- correlation;
- contexto de usuário;
- contexto de tenant;
- request lifecycle;
- exception observability;
- security observability;
- impersonation observability;
- futuras métricas;
- futura integração com Prometheus/Grafana.

---

### `observability/infrastructure-logging.md`

Documenta os logs operacionais da infraestrutura e da aplicação.

São considerados elementos importantes:

```text
timestamp
level
event
message
request_id
method
path
status_code
duration_ms
user_id
tenant_id
role
component
exception_type
error_code
```

O documento também aborda:

- Structured Logging;
- log levels;
- exception logging;
- autenticação;
- autorização;
- PostgreSQL;
- Redis;
- Nginx;
- rate limiting;
- performance;
- sanitização;
- informações sensíveis;
- troubleshooting.

---

### `observability/platform-events.md`

Documenta os eventos relacionados ao funcionamento e administração da plataforma.

Exemplos:

- criação de tenant;
- suspensão de tenant;
- operações administrativas;
- criação/alteração de usuários;
- impersonation;
- eventos de segurança;
- operações realizadas por super-admin.

O conceito de `actor` é utilizado de maneira arquitetural para representar quem originou a ação.

Na implementação atual, esse conceito pode ser representado por campos como `user_uuid`.

---

### `observability/audit-logging.md`

Documenta os registros de auditoria relacionados às operações relevantes realizadas dentro dos tenants.

Um Audit Log pode registrar conceitos como:

```text
actor
action
resource
target
tenant
timestamp
outcome
request_id
metadata
before
after
```

Audit Logs possuem como objetivo principal responder:

> quem fez o quê, sobre qual recurso, em qual tenant e em qual contexto?

---

### `observability/correlation.md`

Documenta a estratégia de correlação de operações.

O principal identificador atual é o:

```text
request_id
```

Ele permite correlacionar:

```text
HTTP Request
   ↓
Application Logs
   ↓
Database Operations
   ↓
Audit Logs
   ↓
Platform Events
```

Também existe direção de evolução para mecanismos mais completos de distributed tracing.

---

# 6. API

A seção `api/` documenta o contrato da API do Exactum.

Ela descreve:

- recursos;
- endpoints;
- autenticação;
- autorização;
- validação;
- erros;
- convenções;
- versionamento;
- observabilidade;
- compatibilidade.

## Documentos

### `api/overview.md`

Apresenta a visão geral da API.

A API atua como principal interface entre o frontend e o backend e também representa uma importante fronteira de segurança.

---

### `api/conventions.md`

Documenta convenções utilizadas pelos endpoints.

Inclui:

- naming;
- HTTP methods;
- UUIDs;
- request bodies;
- query parameters;
- pagination;
- filtering;
- sorting;
- response structure;
- status codes;
- timestamps;
- nullability;
- validation;
- idempotency;
- concurrency;
- compatibility.

---

### `api/authentication.md`

Documenta Authentication no contexto específico da API.

Descreve:

```text
POST /login
       ↓
Access + Refresh Cookies
       ↓
Authenticated Requests
       ↓
POST /refresh
       ↓
Rotated Tokens
```

Também documenta logout, sessões, Redis, impersonation e limitações atuais relacionadas à proteção contra CSRF.

---

### `api/errors.md`

Documenta o contrato de erros: os formatos retornados atualmente (`{"error": "<mensagem>"}` para exceções da aplicação, o formato padrão do flask-smorest para validação e os identificadores dos erros de JWT) e o contrato planejado com códigos semânticos:

```json
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Também são documentados:

- HTTP 400;
- HTTP 401;
- HTTP 403;
- HTTP 404;
- HTTP 409;
- HTTP 422;
- HTTP 429;
- HTTP 500.

---

### `api/versioning.md`

Documenta a estratégia de versionamento da API.

O objetivo é permitir evolução do contrato sem introduzir mudanças inesperadas para consumidores existentes.

O documento também aborda:

- breaking changes;
- backward compatibility;
- migrations;
- deprecation;
- evolução de recursos;
- compatibilidade frontend/backend.

---

# 7. Banco de Dados

A seção `database/` documenta o modelo de persistência do Exactum.

A infraestrutura de dados utiliza principalmente:

```text
PostgreSQL
+
SQLAlchemy
+
Alembic / Flask-Migrate
```

Redis é utilizado separadamente para estados de sessão e mecanismos relacionados à aplicação.

## Documentos

### `database/overview.md`

Apresenta a visão geral da estratégia de persistência.

---

### `database/schema.md`

Documenta o modelo de dados e os principais relacionamentos.

Entre os conceitos presentes estão:

- Tenant;
- User;
- Product;
- Sale;
- Sale Items;
- Role;
- Permission;
- Session;
- Audit Log;
- Platform Event.

Também são documentados conceitos futuros, como:

- Inventory;
- Reporting.

Importante: Inventory e Reporting ainda não são contextos independentes na implementação atual.

---

### `database/migrations.md`

Documenta a estratégia de evolução do schema.

A ferramenta utilizada é baseada em:

```text
Alembic
/
Flask-Migrate
```

As migrations devem ser tratadas como parte do histórico do banco e não como scripts descartáveis.

O documento deve orientar:

- criação;
- revisão;
- execução;
- rollback quando aplicável;
- validação;
- execução em CI;
- execução durante deployment;
- compatibilidade entre código e schema.

---

### `database/soft-delete.md`

Documenta o padrão de Soft Delete.

O conceito central é o uso de estado de exclusão lógica, normalmente representado por:

```text
deleted_at
```

O documento diferencia:

```text
Soft Deleted
≠
Inactive
≠
Revoked
```

Também aborda:

- repositories;
- filtros;
- uniqueness;
- restore;
- authorization;
- audit;
- tenant isolation;
- retenção;
- purge;
- performance;
- testes.

---

# 8. Operações

A seção `operations/` documenta como desenvolver, executar, empacotar, publicar e operar o Exactum.

A infraestrutura atual utiliza:

```text
Docker
Docker Compose
Nginx
GitHub Actions
Hetzner VPS
Cloudflare
```

## Documentos

### `operations/development.md`

Documenta o ambiente de desenvolvimento.

Inclui:

- Python;
- uv;
- Node;
- PostgreSQL;
- Redis;
- frontend;
- backend;
- Vite;
- migrations;
- testes;
- Ruff;
- Swagger;
- debugging;
- DBeaver;
- autenticação;
- impersonation;
- desenvolvimento multi-tenant.

---

### `operations/docker.md`

Documenta o uso de Docker.

A arquitetura utiliza containers para componentes como:

```text
Frontend
Backend
PostgreSQL
Redis
Nginx
```

O documento aborda:

- Docker Compose;
- networks;
- volumes;
- environment variables;
- health checks;
- development;
- production;
- persistência;
- troubleshooting;
- isolamento entre serviços.

---

### `operations/deployment.md`

Documenta o processo de deployment.

Atualmente o Exactum possui deployment automatizado através de:

```text
GitHub
   ↓
GitHub Actions
   ↓
SSH
   ↓
Production VPS
   ↓
Docker Compose
```

As migrations são tratadas separadamente do processo de atualização dos containers.

---

### `operations/nginx.md`

Documenta o Nginx como camada de entrada HTTP da aplicação.

Responsabilidades incluem:

- servir frontend;
- reverse proxy;
- encaminhar `/api`;
- integração com Cloudflare;
- headers;
- cookies;
- limites;
- timeouts;
- logs;
- troubleshooting;
- proteção operacional.

---

### `operations/runbook.md`

Contém procedimentos operacionais para incidentes comuns.

Exemplos:

- API indisponível;
- PostgreSQL indisponível;
- Redis indisponível;
- falha de deployment;
- migration problemática;
- problemas de autenticação;
- problemas HTTPS;
- falta de espaço;
- erros 502/504;
- investigação através de logs.

---

# 9. Testes

A seção `testing/` documenta a estratégia de qualidade e validação do Exactum.

O objetivo não é apenas medir coverage, mas verificar comportamento, segurança, integração entre componentes e regressões.

## Documentos

### `testing/strategy.md`

Define a estratégia geral de testes.

Abrange:

- testing pyramid;
- unit tests;
- integration tests;
- API tests;
- security tests;
- authentication;
- authorization;
- tenant isolation;
- impersonation;
- PostgreSQL;
- Redis;
- fixtures;
- test data;
- critical paths;
- coverage;
- CI;
- evolução arquitetural.

---

### `testing/ci.md`

Documenta a execução dos testes e quality gates dentro da Continuous Integration.

O pipeline verifica, entre outros aspectos:

```text
Static Quality
      ↓
Dependencies
      ↓
Database / Services
      ↓
Tests
      ↓
Coverage
      ↓
Build
      ↓
Quality Gate
```

A documentação também cobre:

- GitHub Actions;
- Python/uv;
- PostgreSQL;
- Redis;
- Ruff;
- Pytest;
- coverage;
- migrations;
- security regression;
- authentication;
- authorization;
- tenant isolation;
- impersonation;
- Docker build;
- deployment gates;
- failure diagnosis;
- flaky tests;
- caching;
- reproducibility.

---

# 10. Documentação na raiz do projeto

Além da documentação técnica dentro de `docs/`, alguns arquivos possuem responsabilidades específicas no nível do repositório.

## `CHANGELOG.md`

Registra alterações relevantes entre versões.

Deve permitir identificar:

- novas funcionalidades;
- correções;
- mudanças arquiteturais;
- breaking changes;
- alterações de segurança;
- alterações operacionais.

---

## `CONTRIBUTING.md`

Define como contribuir para o projeto.

Pode incluir:

- workflow de branches;
- commits;
- pull requests;
- testes;
- lint;
- documentação;
- revisão;
- padrões de código;
- critérios de qualidade.

---

## `SECURITY.md`

Documento dedicado à comunicação de vulnerabilidades e práticas relacionadas à segurança do projeto.

---

## `LICENSE`

Define os termos legais de distribuição e utilização do código.

---

# 11. Relação entre as áreas da documentação

As diferentes áreas da documentação não devem ser interpretadas como documentos isolados.

Existe uma relação entre elas.

Por exemplo:

```text
Architecture
     │
     ├── define boundaries
     │
     ↓
Security
     │
     ├── define trust boundaries
     │
     ↓
API
     │
     ├── exposes resources
     │
     ↓
Database
     │
     ├── persists state
     │
     ↓
Operations
     │
     ├── runs the system
     │
     ↓
Observability
     │
     ├── monitors behavior
     │
     ↓
Testing
     │
     └── validates the system
```

Uma alteração em uma dessas áreas pode exigir alterações em outras.

Por exemplo, uma mudança na estratégia de Authentication pode afetar:

```text
Security
API
Session Management
Observability
Testing
Operations
```

Da mesma forma, uma mudança no modelo de Tenant Isolation pode afetar:

```text
Architecture
Security
API
Database
Testing
Observability
```

A documentação deve acompanhar essas relações.

---

# 12. Princípios da documentação

A documentação do Exactum segue alguns princípios.

## 12.1 Documentar o sistema real

A documentação deve representar o comportamento real do sistema sempre que estiver descrevendo o estado atual.

Não se deve documentar uma arquitetura futura como se ela já estivesse implementada.

Quando uma decisão representar direção futura, isso deve ser explicitado.

---

## 12.2 Diferenciar estado atual e evolução

Sempre que necessário, utilizar uma distinção semelhante a:

```text
Current State
Future Evolution
```

Isso evita confundir:

```text
"o sistema possui"
```

com:

```text
"o sistema pretende possuir"
```

---

## 12.3 Documentar decisões, não apenas estruturas

Uma documentação arquitetural útil deve explicar não apenas:

> o que existe?

mas também:

> por que existe dessa maneira?

Por isso, decisões relevantes devem ser registradas através de ADRs quando apropriado.

---

## 12.4 Evitar documentação excessivamente acoplada à implementação

A documentação pode utilizar nomes conceituais para representar responsabilidades arquiteturais.

Por exemplo:

```text
actor
tenant
resource
target
```

podem ser conceitos arquiteturais.

Na implementação atual eles podem aparecer como:

```text
user_uuid
tenant_uuid
product_uuid
sale_uuid
```

Isso permite que a documentação preserve o significado arquitetural mesmo quando os nomes internos evoluírem.

---

# 13. Mantendo a documentação sincronizada

A documentação deve evoluir junto com o código.

Mudanças que normalmente devem provocar revisão documental incluem:

- novos domínios;
- novos endpoints;
- mudanças de autenticação;
- mudanças de autorização;
- mudanças no modelo de tenant;
- alterações no schema;
- migrations relevantes;
- mudanças no deployment;
- mudanças no CI;
- novos mecanismos de observabilidade;
- mudanças de infraestrutura;
- mudanças de segurança;
- breaking changes.

Uma mudança significativa não deve ser considerada completamente concluída enquanto sua documentação necessária estiver desatualizada.

---

# 14. Documentação e pull requests

Quando uma alteração possuir impacto arquitetural, de segurança, API, banco de dados, operação ou observabilidade, o Pull Request deve considerar a atualização dos documentos correspondentes.

Exemplos:

| Alteração                   | Documentação potencialmente afetada            |
| --------------------------- | ---------------------------------------------- |
| Novo endpoint               | `api/`                                         |
| Novo recurso                | `api/`, `database/`, `architecture/`           |
| Nova permission             | `security/`, `api/`                            |
| Mudança de autenticação     | `security/`, `api/`, `operations/`, `testing/` |
| Nova tabela                 | `database/`, `architecture/`                   |
| Nova migration relevante    | `database/`                                    |
| Mudança de deployment       | `operations/`                                  |
| Novo evento                 | `observability/`                               |
| Mudança de logging          | `observability/`                               |
| Novo mecanismo de segurança | `security/`, `testing/`                        |
| Mudança de CI               | `testing/`                                     |
| Refatoração arquitetural    | `architecture/`                                |

---

# 15. Documentation as an engineering artifact

A documentação do Exactum não deve ser tratada apenas como material complementar.

Ela funciona como um **engineering artifact**.

Isso significa que deve:

- registrar decisões;
- reduzir conhecimento implícito;
- facilitar manutenção;
- auxiliar debugging;
- melhorar onboarding;
- preservar contexto histórico;
- tornar responsabilidades explícitas;
- facilitar futuras refatorações;
- permitir avaliar impactos de mudanças.

Uma arquitetura complexa sem documentação adequada tende a transferir conhecimento para indivíduos.

A documentação reduz essa dependência.

---

# 16. Direção arquitetural atual

O Exactum encontra-se em uma fase de evolução de uma arquitetura predominantemente **layered** para uma organização com fronteiras de domínio mais explícitas.

A direção geral é:

```text
Current
────────────────────────────

Routes / Controllers
        ↓
Application Services
        ↓
Repositories
        ↓
Persistence


Future direction
────────────────────────────

Domain
   │
   ├── application
   ├── domain
   ├── infrastructure
   └── interfaces
```

A evolução não implica necessariamente uma migração imediata para uma arquitetura puramente DDD.

O objetivo é aumentar progressivamente:

- coesão;
- isolamento de responsabilidades;
- testabilidade;
- independência de framework;
- clareza de domínio;
- facilidade de evolução.

---

# 17. Áreas futuras de documentação

Conforme o Exactum evoluir, novos documentos poderão ser adicionados.

Possíveis áreas futuras incluem:

```text
architecture/decisions/
architecture/integration/
architecture/events/

security/
    csrf.md
    secrets.md

observability/
    metrics.md
    tracing.md

operations/
    backup.md
    disaster-recovery.md
    monitoring.md

testing/
    performance.md
    security-testing.md
    contract-testing.md
```

Esses documentos não devem ser criados apenas para aumentar a quantidade de documentação.

Devem ser adicionados quando existir complexidade real que justifique sua documentação.

---

# 18. Maturidade da documentação

A documentação pode evoluir juntamente com a maturidade técnica do sistema.

Uma possível evolução é:

```text
Basic
  ↓
Architecture Documentation
  ↓
Security Documentation
  ↓
Operational Documentation
  ↓
Testing Documentation
  ↓
Architecture Decision Records
  ↓
Observability Documentation
  ↓
Distributed Systems / Integration Documentation
```

O objetivo não é produzir documentação máxima desde o início.

O objetivo é manter documentação suficiente para que a complexidade do sistema permaneça compreensível.

---

# 19. Arquivos relacionados do projeto

Documentos externos à pasta `docs/` também fazem parte da documentação do projeto.

```text
README.md
CHANGELOG.md
CONTRIBUTING.md
SECURITY.md
LICENSE
```

O `README.md` deve funcionar como ponto de entrada público e apresentar uma visão resumida do projeto.

A documentação em `docs/` deve fornecer o nível de profundidade necessário para compreender a engenharia por trás do sistema.

Uma relação saudável é:

```text
README.md
   │
   └── "O que é o Exactum?"
             │
             ↓
docs/
   │
   └── "Como o Exactum funciona?"
             │
             ↓
Source Code
   │
   └── "Como isso está implementado?"
```

---

# 20. Navegação da documentação

Para compreender o Exactum progressivamente, uma ordem recomendada de leitura é:

```text
1. architecture/overview.md
          ↓
2. architecture/system-context.md
          ↓
3. architecture/application-architecture.md
          ↓
4. architecture/domain-boundaries.md
          ↓
5. security/overview.md
          ↓
6. security/authentication.md
          ↓
7. security/authorization.md
          ↓
8. security/tenant-isolation.md
          ↓
9. api/overview.md
          ↓
10. database/schema.md
          ↓
11. observability/overview.md
          ↓
12. operations/deployment.md
          ↓
13. testing/strategy.md
          ↓
14. testing/ci.md
```

Essa ordem acompanha aproximadamente a progressão:

```text
Architecture
      ↓
Security
      ↓
API
      ↓
Persistence
      ↓
Observability
      ↓
Operations
      ↓
Testing
```

---

# 21. Princípio final

A documentação do Exactum deve responder a três perguntas fundamentais:

### O quê?

O que o sistema possui?

### Por quê?

Por que foi projetado dessa maneira?

### Como?

Como isso é implementado e operado atualmente?

Quando essas três perguntas estão suficientemente documentadas, o código deixa de ser a única fonte de conhecimento sobre o sistema.

---

## Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados nesta documentação representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API.

Por exemplo:

```text
actor
```

pode ser representado atualmente por:

```text
user_uuid
```

enquanto:

```text
tenant
```

pode ser representado por:

```text
tenant_uuid
```

e:

```text
resource
```

pode ser representado por identificadores específicos como:

```text
product_uuid
sale_uuid
user_uuid
```

Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem limitar o conceito à sua implementação atual.

Da mesma forma, alguns limites de domínio descritos na documentação representam uma **direção arquitetural de evolução**.

Responsabilidades atualmente agrupadas em determinados domínios poderão posteriormente ser extraídas para contextos próprios conforme a complexidade do sistema justificar essa mudança.

Portanto, esta documentação deve ser interpretada como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.

---

# 22. Conclusão

A documentação técnica do Exactum existe para preservar o conhecimento arquitetural do sistema e tornar sua evolução previsível.

Ela cobre atualmente:

```text
Architecture
Security
Observability
API
Database
Operations
Testing
```

Essas áreas formam uma visão integrada da aplicação:

```text
                    Exactum
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  Architecture     Security         API
        │              │              │
        └──────────────┼──────────────┘
                       │
                   Database
                       │
              ┌────────┴────────┐
              │                 │
        Observability       Operations
              │                 │
              └────────┬────────┘
                       │
                    Testing
```

A documentação deve continuar evoluindo conforme o sistema adquirir novas capacidades, mas sempre preservando um princípio central:

> **documentar a complexidade real do sistema sem criar complexidade documental artificial.**
