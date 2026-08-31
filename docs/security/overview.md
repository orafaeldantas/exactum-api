# Security Overview

## Objetivo

A segurança do Exactum é tratada como uma preocupação arquitetural de primeira classe.

Como uma plataforma SaaS multi-tenant, o sistema precisa proteger não apenas contas individuais, mas também os dados e operações de diferentes tenants compartilhando a mesma infraestrutura de aplicação.

O modelo de segurança do Exactum é baseado na combinação de:

- Autenticação segura;
- Gestão explícita de sessão;
- Autorização baseada em permissões;
- Isolamento defensivo de tenants;
- Separação entre contexto administrativo e contexto de tenant;
- Auditoria de operações relevantes;
- Rate limiting;
- Tratamento centralizado de exceções;
- Identificação e rastreamento de requisições;
- Princípio de menor privilégio.

O objetivo não é eliminar completamente a possibilidade de falhas, mas estabelecer múltiplas fronteiras independentes capazes de reduzir a probabilidade e o impacto de falhas de implementação.

---

## Modelo de Segurança

Em alto nível, uma requisição ao Exactum passa por múltiplas etapas antes de alcançar uma operação de negócio:

```text
                         Client
                           │
                           ▼
                         Nginx
                           │
                           ▼
                    HTTP / API Layer
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
                  Application Logic
                           │
                           ▼
                    Data Access
                           │
                           ▼
                  Tenant-scoped Data
```

Cada etapa possui uma responsabilidade específica.

A autenticação determina **quem está realizando a requisição**.

O contexto de tenant determina **em qual contexto a operação está sendo executada**.

A autorização determina **quais operações o ator pode executar**.

A camada de aplicação executa as regras de negócio.

A camada de persistência aplica as restrições necessárias para impedir acesso indevido a dados fora do contexto autorizado.

---

## Princípios de Segurança

### Backend como autoridade

O backend é a única autoridade para decisões de segurança.

O frontend pode ocultar funcionalidades, desabilitar controles de interface e adaptar a experiência de acordo com as permissões conhecidas do usuário.

Entretanto, nenhuma decisão de autorização tomada exclusivamente pelo frontend é considerada confiável.

Uma requisição pode ser enviada diretamente à API independentemente da interface apresentada ao usuário. Portanto, operações protegidas precisam ser novamente validadas no backend.

```text
Frontend
   │
   │ UX / visibility
   ▼
User Interface
   │
   ▼
Backend
   │
   ├── Authentication
   ├── Authorization
   ├── Tenant Isolation
   └── Business Rules
```

Essa separação garante que a interface do usuário não seja considerada uma fronteira de segurança.

---

### Princípio do menor privilégio

Usuários e componentes devem possuir somente os privilégios necessários para executar suas respectivas responsabilidades.

No contexto do Exactum, isso se manifesta principalmente através do modelo de RBAC e das permissões associadas às operações.

O mesmo princípio também é aplicado à separação entre:

- Usuários comuns;
- Administradores de tenant;
- Super-administradores;
- Operações de plataforma;
- Operações de negócio.

---

### Defesa em profundidade

O Exactum evita depender de um único mecanismo para proteger recursos críticos.

Por exemplo, o isolamento de tenants não depende somente do contexto estabelecido durante a requisição.

A camada de persistência também aplica filtros explícitos de tenant nas operações que acessam dados tenant-scoped.

```text
                Request
                   │
                   ▼
           Tenant Context
                   │
                   ▼
            Authorization
                   │
                   ▼
          Application Logic
                   │
                   ▼
       Explicit Tenant Filter
                   │
                   ▼
              Database
```

A existência de múltiplas barreiras reduz o impacto de uma eventual falha em uma camada individual.

---

## Trust Boundaries

O sistema possui diferentes fronteiras de confiança.

```text
┌─────────────────────────────────────────────────────┐
│                    Untrusted Zone                   │
│                                                     │
│  Browser / Client                                  │
│                                                     │
└───────────────────────┬─────────────────────────────┘
                        │
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Application Zone                   │
│                                                     │
│  Nginx                                              │
│     │                                               │
│     ▼                                               │
│  Flask API                                          │
│     │                                               │
│     ├── Authentication                              │
│     ├── Authorization                               │
│     ├── Tenant Context                              │
│     └── Application Logic                           │
│                                                     │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 Persistence Zone                    │
│                                                     │
│  PostgreSQL                                         │
│  Redis                                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

O cliente é considerado não confiável.

Informações provenientes do navegador, incluindo dados enviados em requisições, não são consideradas suficientes para estabelecer autorização.

A API atua como fronteira de confiança entre o cliente e os recursos protegidos da plataforma.

---

## Autenticação

A autenticação é responsável por estabelecer a identidade associada a uma sessão.

A implementação atual utiliza:

- JWT;
- Access tokens;
- Refresh tokens;
- Cookies HttpOnly;
- Cookies Secure;
- Rotação de refresh tokens;
- Redis para gestão de sessão;
- Revogação de sessões.

O fluxo geral pode ser representado como:

```text
                    Login
                      │
                      ▼
             Validate Credentials
                      │
                      ▼
                Create Session
                      │
              ┌───────┴───────┐
              ▼               ▼
        Access Token     Refresh Token
              │               │
              ▼               ▼
       HttpOnly Cookie   HttpOnly Cookie
                              │
                              ▼
                            Redis
```

O navegador não possui acesso direto aos tokens através de JavaScript.

Essa arquitetura reduz a exposição dos tokens a scripts executados no contexto da aplicação e elimina a necessidade de armazená-los diretamente em mecanismos acessíveis pelo código JavaScript da aplicação.

Os detalhes do fluxo de autenticação estão documentados em:

→ [`authentication.md`](./authentication.md)

---

## Gestão de Sessão

Embora os tokens utilizados pelo sistema sejam baseados em JWT, o Exactum mantém um modelo consciente de sessão.

O Redis é utilizado para manter informações necessárias à gestão e revogação das sessões, permitindo que uma sessão possa ser invalidada antes da expiração natural dos tokens.

Entre as operações suportadas estão:

- Criação de sessão;
- Rastreamento de refresh tokens;
- Rotação de refresh tokens;
- Revogação;
- Logout;
- Invalidação de sessão;
- Bloqueio de usuários;
- Suspensão de tenants.

Esse modelo permite combinar as vantagens de tokens assinados com controle explícito do ciclo de vida das sessões.

Os detalhes estão documentados em:

→ [`session-management.md`](./session-management.md)

---

## Autorização

Após a autenticação, o sistema precisa determinar quais operações o ator autenticado pode executar.

O Exactum utiliza Role-Based Access Control (RBAC), associado a permissões granulares.

```text
User
 │
 ▼
Role
 │
 ▼
Permissions
 │
 ▼
Authorization Decision
 │
 ├── Allow
 └── Deny
```

As permissões são avaliadas no backend e podem ser utilizadas para controlar operações específicas da API.

O sistema também diferencia o contexto de usuários pertencentes a tenants do contexto de super-admins responsáveis por operações em nível de plataforma.

Os detalhes do modelo de autorização estão documentados em:

→ [`authorization.md`](./authorization.md)

---

## Isolamento de Tenant

O isolamento entre tenants é uma das principais fronteiras de segurança do Exactum.

O sistema utiliza um modelo de multi-tenancy lógico no qual múltiplas empresas compartilham a infraestrutura da aplicação, enquanto seus dados permanecem associados ao respectivo tenant.

O contexto de tenant é estabelecido durante o processamento da requisição.

Posteriormente, as operações de persistência que acessam dados tenant-scoped utilizam filtros explícitos de tenant.

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

Essa abordagem representa uma estratégia de defesa em profundidade.

O isolamento de tenant não depende exclusivamente de uma única camada da aplicação.

Os detalhes estão documentados em:

→ [`tenant-isolation.md`](./tenant-isolation.md)

---

## Super-Admin e Operações de Plataforma

O Exactum possui um contexto administrativo separado para operações que não pertencem diretamente ao escopo de um tenant.

Super-administradores podem executar operações como:

- Administração de tenants;
- Suspensão e reativação de tenants;
- Administração de contas;
- Diagnóstico;
- Impersonate administrativo;
- Operações de plataforma.

Essas operações possuem maior nível de privilégio e, portanto, exigem tratamento diferenciado em relação às operações comuns de usuários.

O impersonate administrativo, em particular, representa uma operação privilegiada e é rastreado através de eventos de plataforma.

O sistema registra informações como:

- Administrador original;
- Usuário-alvo;
- Tenant-alvo;
- Início do impersonate;
- Finalização do impersonate;
- Contexto da operação.

---

## Auditoria

A segurança do sistema não termina na prevenção de operações indevidas.

Operações relevantes também precisam ser rastreáveis posteriormente.

O Exactum mantém uma camada de auditoria voltada para registrar atividades relevantes dentro do contexto de cada tenant.

Um registro de auditoria identifica, quando aplicável:

```text
Quem?          → user_uuid
Qual tenant?   → tenant_uuid
O que ocorreu? → event
Qual entidade? → entity
Qual contexto? → payload
Quando?        → created_at
```

O objetivo é permitir responder perguntas como:

- Quem executou determinada operação?
- Em qual tenant?
- Qual entidade foi afetada?
- Qual operação ocorreu?
- Quando a operação ocorreu?
- Qual era o contexto associado à operação?

A auditoria é separada dos logs operacionais de infraestrutura e dos eventos de plataforma.

Os detalhes estão documentados em:

→ [`../observability/audit-logging.md`](../observability/audit-logging.md)

---

## Rate Limiting

A API utiliza rate limiting como mecanismo adicional de proteção contra abuso e excesso de requisições.

O rate limiting contribui para reduzir riscos associados a:

- Abuso de endpoints;
- Tentativas repetitivas de autenticação;
- Consumo excessivo de recursos;
- Automação não autorizada;
- Sobrecarga acidental ou maliciosa.

O rate limiting não é considerado um mecanismo de autenticação ou autorização.

Ele funciona como uma camada adicional de proteção da disponibilidade da API.

---

## Tratamento de Exceções

Erros de aplicação são tratados através de uma estratégia centralizada.

O objetivo é evitar que exceções internas exponham informações desnecessárias ao cliente e manter respostas de erro consistentes.

A camada HTTP traduz erros internos em respostas apropriadas para a API, enquanto detalhes internos permanecem restritos aos mecanismos de observabilidade e diagnóstico.

Essa separação contribui para:

- Evitar exposição de detalhes internos;
- Padronizar respostas;
- Facilitar diagnóstico;
- Separar erros esperados de falhas inesperadas.

---

## Identidade e Identificadores Públicos

O Exactum utiliza identificadores públicos baseados em UUID para recursos expostos pela API.

Essa estratégia separa o identificador utilizado externamente do identificador interno utilizado pelo banco de dados.

Em termos arquiteturais:

```text
External API
     │
     ▼
  UUID
     │
     ▼
Application
     │
     ▼
Internal Identifier
     │
     ▼
Database
```

A utilização de identificadores externos não deve ser interpretada como um mecanismo de autorização.

Um UUID não substitui autenticação, autorização ou isolamento de tenant.

Seu objetivo é estabelecer uma separação entre a representação pública dos recursos e sua representação interna.

---

## Segurança e Observabilidade

Segurança e observabilidade possuem responsabilidades diferentes, mas complementares.

A segurança determina se uma operação deve ser permitida.

A observabilidade fornece informações para compreender o comportamento da plataforma.

O Exactum registra informações operacionais como:

- Request ID;
- Método HTTP;
- Path;
- Status;
- Duração;
- Contexto de usuário;
- Contexto de tenant;
- IP;
- User agent.

Além disso, eventos administrativos e operações de auditoria são registrados em mecanismos específicos.

```text
                 Security
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Authentication          Authorization
        │                       │
        └───────────┬───────────┘
                    ▼
              Audit / Events
                    │
                    ▼
             Observability
```

Essa separação permite diferenciar:

- Logs operacionais;
- Eventos de plataforma;
- Auditoria de tenant.

---

## Responsabilidades por Camada

A segurança do Exactum é distribuída entre diferentes componentes.

| Camada          | Responsabilidade                      |
| --------------- | ------------------------------------- |
| Browser / React | UX, visibilidade e interação          |
| Nginx           | Entrada HTTP e reverse proxy          |
| Flask API       | Fronteira de segurança da aplicação   |
| Authentication  | Identidade e sessão                   |
| Authorization   | Decisão de acesso                     |
| Application     | Regras de negócio                     |
| Repository      | Acesso a dados e escopo de tenant     |
| PostgreSQL      | Persistência e integridade dos dados  |
| Redis           | Gestão de sessão e tokens             |
| Observability   | Rastreamento, diagnóstico e auditoria |

Nenhuma camada individual deve ser considerada responsável por todos os aspectos de segurança.

A arquitetura utiliza responsabilidades complementares para formar as fronteiras de proteção do sistema.

---

## Modelo de Defesa

O modelo geral pode ser resumido da seguinte forma:

```text
                         Client
                           │
                           ▼
                    ┌─────────────┐
                    │    Nginx    │
                    └──────┬──────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Authentication  │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │  Tenant Context   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Authorization   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Application Logic │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │     Repository    │
                 │ Tenant Filtering  │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    PostgreSQL     │
                 └───────────────────┘

             ┌───────────────────────────┐
             │          Redis            │
             │ Session / Token Lifecycle │
             └───────────────────────────┘

             ┌───────────────────────────┐
             │      Observability       │
             │ Logs / Events / Auditing │
             └───────────────────────────┘
```

A segurança do sistema emerge da combinação dessas fronteiras, e não de um único mecanismo.

---

## Threat Model

O modelo de segurança é complementado por um threat model dedicado.

O threat model documenta:

- Ativos que precisam ser protegidos;
- Atores e níveis de privilégio;
- Trust boundaries;
- Principais ameaças;
- Vetores de ataque relevantes;
- Mitigações existentes;
- Riscos residuais;
- Áreas que ainda precisam evoluir.

→ [`threat-model.md`](./threat-model.md)

---

## Documentos Relacionados

### Autenticação

→ [`authentication.md`](./authentication.md)

Detalha o fluxo de autenticação, tokens, cookies, login, refresh e logout.

### Gestão de Sessão

→ [`session-management.md`](./session-management.md)

Detalha o ciclo de vida das sessões, Redis, rotação e revogação.

### Autorização

→ [`authorization.md`](./authorization.md)

Detalha RBAC, permissões, escopos e operações administrativas.

### Isolamento de Tenant

→ [`tenant-isolation.md`](./tenant-isolation.md)

Detalha os mecanismos utilizados para garantir o isolamento lógico entre tenants.

### Threat Model

→ [`threat-model.md`](./threat-model.md)

Documenta ameaças, riscos, trust boundaries e respectivas mitigações.

### Auditoria

→ [`../observability/audit-logging.md`](../observability/audit-logging.md)

Documenta a estrutura e o funcionamento dos registros de auditoria.

---

## Evolução da Segurança

A arquitetura de segurança do Exactum não é considerada estática.

Conforme a plataforma evolui, novas funcionalidades podem introduzir novos vetores de ataque, novos requisitos de autorização e novas necessidades de observabilidade.

A evolução da arquitetura deve preservar alguns princípios fundamentais:

- O backend permanece como autoridade de segurança;
- Novas funcionalidades devem respeitar o escopo de tenant;
- Operações privilegiadas devem ser explicitamente identificadas;
- Alterações relevantes de segurança devem ser documentadas;
- Decisões arquiteturais importantes devem ser registradas através de ADRs;
- Mecanismos de segurança devem evoluir junto com a arquitetura de aplicação.

A evolução arquitetural prevista para a v0.3.x, incluindo a introdução progressiva de fronteiras de domínio mais fortes, deverá manter essas propriedades de segurança independentemente da organização interna dos módulos.

---

## Resumo

A arquitetura de segurança do Exactum é baseada em **defesa em profundidade**, com múltiplas fronteiras complementares:

```text
Authentication
      +
Session Management
      +
Authorization
      +
Tenant Isolation
      +
Least Privilege
      +
Rate Limiting
      +
Auditability
      +
Observability
      =
Security Architecture
```

O objetivo é garantir que identidade, autorização, isolamento de dados e operações privilegiadas sejam tratados como responsabilidades explícitas da arquitetura.

Os documentos desta seção detalham cada mecanismo individualmente, enquanto este documento estabelece o modelo geral que conecta essas partes.
