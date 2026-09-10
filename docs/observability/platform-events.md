# Platform Events

> **Status:** Active
> **Scope:** Platform-level events and administrative activity
> **Primary consumers:** Platform operators, super-admins, developers and security teams
> **Related:** [Observability Overview](../observability/overview.md), [Infrastructure Logging](./infrastructure-logging.md), [Audit Logging](./audit-logging.md), [Correlation](./correlation.md)

---

# 1. Purpose

Este documento define o conceito, a finalidade e as responsabilidades dos **Platform Events** no Exactum.

Platform Events representam acontecimentos relevantes no nível da **plataforma**, especialmente aqueles relacionados à administração global, segurança, gerenciamento de tenants, impersonation e operações que ultrapassam o contexto de um único tenant.

Seu objetivo é fornecer uma trilha estruturada dos acontecimentos relevantes para a operação da plataforma, permitindo:

- investigação de incidentes;
- acompanhamento de operações administrativas;
- rastreabilidade de ações de super-admin;
- acompanhamento do ciclo de vida dos tenants;
- rastreamento de impersonation;
- investigação de eventos de segurança;
- correlação com infrastructure logs;
- suporte a processos operacionais e administrativos.

Platform Events não são simplesmente mensagens de log.

Um evento representa um **acontecimento significativo**, enquanto um infrastructure log representa principalmente uma informação técnica sobre a execução do sistema.

---

# 2. What Is a Platform Event?

Um Platform Event representa algo que aconteceu dentro do contexto operacional da plataforma e que possui significado próprio para administração, segurança ou operação.

Exemplos:

```text
tenant_created
tenant_suspended
tenant_activated
tenant_deleted
user_blocked
user_unblocked
impersonation_started
impersonation_stopped
administrative_operation_completed
security_policy_changed
```

O evento deve representar um acontecimento claramente identificável.

Por exemplo:

```text
database_error
```

é um **infrastructure log**.

Enquanto:

```text
tenant_suspended
```

é um **Platform Event**.

A diferença está no significado do acontecimento e em quem precisa consumi-lo.

---

# 3. Platform Events vs Infrastructure Logs

As duas categorias podem representar a mesma operação em perspectivas diferentes.

Considere a suspensão de um tenant.

O infrastructure logging pode registrar:

```json
{
  "event": "http_request_completed",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/platform/tenants/01K.../suspend",
  "status_code": 200,
  "duration_ms": 84.12
}
```

O Platform Event representa o significado da operação:

```json
{
  "event": "tenant_suspended",
  "tenant_id": "01K...",
  "actor_id": "01K..."
}
```

O primeiro responde:

> Como a requisição foi processada?

O segundo responde:

> O que aconteceu com a plataforma?

Essa separação é fundamental para manter a observabilidade organizada.

---

# 4. Platform Events vs Audit Logs

Platform Events também não substituem **Tenant Audit Logs**.

A diferença principal é o **escopo**.

### Platform Events

Representam acontecimentos no nível da plataforma.

Exemplos:

- tenant suspended;
- tenant activated;
- impersonation started;
- impersonation stopped;
- platform-level administrative action;
- global security event.

### Tenant Audit Logs

Representam ações realizadas dentro do contexto operacional de um tenant.

Exemplos:

- produto criado;
- produto alterado;
- preço alterado;
- venda registrada;
- estoque alterado;
- usuário do tenant alterado.

De forma simplificada:

```text
Platform
   │
   ├── Platform Events
   │
   └── Infrastructure Logs
   │
   └── Tenant
         │
         └── Audit Logs
```

Uma operação pode gerar mais de uma dessas representações, desde que cada uma tenha uma finalidade diferente.

---

# 5. Why Platform Events Exist

Infrastructure logs são excelentes para troubleshooting técnico, mas não são ideais para representar o histórico operacional da plataforma.

Considere uma investigação:

> “Quando esse tenant foi suspenso?”

Seria possível procurar uma requisição HTTP nos logs, mas isso exige conhecer:

- endpoint;
- período;
- status;
- request ID;
- formato da requisição.

Um Platform Event permite responder diretamente:

```text
tenant_suspended
tenant_id
actor_id
timestamp
```

O evento transforma um acontecimento relevante em uma unidade de informação própria.

---

# 6. Event Characteristics

Um Platform Event deve possuir algumas características.

## 6.1 Explicit

O evento deve representar claramente o acontecimento.

Preferir:

```text
tenant_suspended
```

em vez de:

```text
tenant_updated
```

quando a suspensão possui significado próprio.

---

## 6.2 Contextual

O evento deve possuir contexto suficiente para identificar:

- o que aconteceu;
- quem realizou;
- qual recurso foi afetado;
- quando aconteceu;
- em qual contexto aconteceu.

---

## 6.3 Structured

Os eventos devem possuir estrutura consistente e previsível.

Isso permite:

- armazenamento;
- busca;
- filtragem;
- análise;
- integração futura;
- geração de métricas;
- auditoria operacional.

---

## 6.4 Traceable

Quando o evento for originado por uma requisição HTTP, deve ser possível correlacioná-lo com o `request_id`.

Isso permite navegar entre:

```text
Platform Event
       ↓
Request
       ↓
Infrastructure Logs
       ↓
Database / Redis / External Services
```

---

# 7. Event Structure

Uma estrutura conceitual pode ser representada por:

```json
{
  "event": "tenant_suspended",
  "timestamp": "2026-09-08T21:40:12.120Z",
  "actor_id": "01K...",
  "tenant_id": "01K...",
  "request_id": "01K..."
}
```

Campos podem variar conforme o evento.

O princípio é manter uma estrutura suficientemente consistente para que diferentes eventos possam ser processados da mesma maneira.

---

# 8. Core Event Fields

Os seguintes campos são relevantes para Platform Events.

| Field         | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `event`       | Nome do evento                                              |
| `timestamp`   | Momento em que o evento ocorreu                             |
| `actor_id`    | Identificador de quem originou a ação                       |
| `tenant_id`   | Tenant afetado, quando aplicável                            |
| `resource_id` | Recurso afetado, quando aplicável                           |
| `request_id`  | Request/correlation ID, quando originado por uma requisição |
| `metadata`    | Informações adicionais específicas do evento                |

Nem todos os eventos precisam possuir todos os campos.

Eventos de nível global, por exemplo, podem não possuir `tenant_id`.

---

# 9. Event Naming Convention

Os nomes dos eventos devem ser:

- em inglês;
- descritivos;
- consistentes;
- orientados ao acontecimento;
- preferencialmente no formato `resource_action`.

Exemplos:

```text
tenant_created
tenant_suspended
tenant_activated
tenant_deleted

user_blocked
user_unblocked

impersonation_started
impersonation_stopped
```

Evitar nomes excessivamente genéricos:

```text
operation
event
action
update
change
```

Quanto mais específico o evento, maior seu valor operacional.

---

# 10. Event Categories

Platform Events podem ser agrupados em categorias.

## 10.1 Tenant Lifecycle

Eventos relacionados ao ciclo de vida de um tenant.

Exemplos:

```text
tenant_created
tenant_activated
tenant_suspended
tenant_deleted
```

Esses eventos ajudam a reconstruir a evolução operacional de um tenant.

---

## 10.2 User Administration

Eventos relacionados ao gerenciamento administrativo de usuários em nível de plataforma.

Exemplos:

```text
user_blocked
user_unblocked
user_platform_role_changed
```

Quando a operação estiver restrita ao contexto de um tenant, ela pode pertencer ao domínio de **Tenant Audit Logging** em vez de Platform Events.

---

## 10.3 Impersonation

Impersonation possui importância especial porque altera temporariamente o contexto de execução de um administrador.

Eventos principais:

```text
impersonation_started
impersonation_stopped
```

Esses eventos devem permitir identificar:

- super-admin original;
- usuário impersonated;
- tenant afetado;
- início da impersonation;
- encerramento;
- request/correlation context quando disponível.

---

# 11. Impersonation Traceability

O Exactum permite que um super-admin atue temporariamente como outro usuário.

Essa operação precisa ser rastreável.

Um evento de início pode possuir:

```json
{
  "event": "impersonation_started",
  "actor_id": "01K-SUPER-ADMIN",
  "target_user_id": "01K-USER",
  "tenant_id": "01K-TENANT",
  "request_id": "01K..."
}
```

Ao finalizar:

```json
{
  "event": "impersonation_stopped",
  "actor_id": "01K-SUPER-ADMIN",
  "target_user_id": "01K-USER",
  "tenant_id": "01K-TENANT",
  "request_id": "01K..."
}
```

Os identificadores acima são ilustrativos.

A informação importante é preservar a distinção entre:

```text
Original Actor
      ↓
Impersonated User
      ↓
Tenant Context
```

Isso impede que operações realizadas durante impersonation sejam interpretadas simplesmente como ações originadas pelo usuário impersonated.

---

# 12. Tenant Lifecycle

O ciclo de vida de um tenant pode produzir eventos relevantes.

Exemplo:

```text
tenant_created
      ↓
tenant_activated
      ↓
tenant_suspended
      ↓
tenant_activated
      ↓
tenant_deleted
```

Essa sequência permite reconstruir acontecimentos administrativos importantes.

Um tenant suspenso, por exemplo, não deve ser tratado apenas como uma alteração de campo no banco.

A suspensão possui significado operacional próprio.

---

# 13. Security Events

Alguns eventos de segurança podem possuir importância suficiente para serem representados como Platform Events.

Exemplos:

```text
user_blocked
user_unblocked
security_policy_changed
administrative_access_granted
administrative_access_revoked
```

Entretanto, nem todo evento de segurança deve automaticamente se tornar um Platform Event.

A decisão deve considerar:

- importância operacional;
- necessidade de retenção;
- necessidade de auditoria;
- volume;
- sensibilidade;
- consumidores do evento.

---

# 14. Administrative Operations

Operações administrativas de alto privilégio podem gerar Platform Events.

Exemplos:

- criação de tenant;
- suspensão de tenant;
- alteração de configurações globais;
- gerenciamento de super-admin;
- impersonation;
- operações administrativas extraordinárias.

A finalidade é permitir responder:

> Quem realizou essa operação?

> O que foi alterado?

> Quando ocorreu?

> Qual recurso foi afetado?

---

# 15. Actor Context

Todo evento que represente uma ação deve, quando possível, identificar seu **actor**.

O actor é a identidade que originou a operação.

Isso é especialmente importante em operações administrativas.

Exemplo:

```text
actor_id = super-admin
target_user_id = regular-user
```

Esses conceitos não devem ser confundidos.

### Actor

Quem executou a operação.

### Target

Quem ou o que foi afetado pela operação.

Por exemplo:

```text
Actor:
Super Admin A

Target:
User B

Tenant:
Tenant C
```

Essa distinção é fundamental para impersonation e administração da plataforma.

---

# 16. System-Generated Events

Nem todo Platform Event precisa possuir um usuário como actor.

Alguns eventos podem ser gerados automaticamente pelo sistema.

Exemplo:

```text
tenant_suspension_expired
session_cleanup_completed
platform_health_state_changed
```

Nesses casos, o actor pode representar um componente do sistema ou simplesmente indicar que a operação foi **system-generated**.

O modelo deve permitir distinguir:

```text
human actor
```

de:

```text
system actor
```

quando necessário.

---

# 17. Event Metadata

Eventos podem possuir metadata adicional.

Exemplo:

```json
{
  "event": "tenant_suspended",
  "actor_id": "01K...",
  "tenant_id": "01K...",
  "metadata": {
    "reason": "administrative_action"
  }
}
```

Metadata deve ser utilizada para informações específicas do evento.

Não deve se transformar em um mecanismo para armazenar dados arbitrários.

---

# 18. Sensitive Information

Platform Events devem seguir os mesmos princípios de segurança definidos para infrastructure logs.

Nunca armazenar diretamente:

- passwords;
- access tokens;
- refresh tokens;
- session cookies;
- API keys;
- secrets;
- database credentials.

Também deve ser evitado armazenar informações pessoais ou comerciais que não sejam necessárias para representar o evento.

---

# 19. Event Immutability

Depois de registrado, um Platform Event deve ser tratado conceitualmente como um registro histórico.

O evento representa:

> “Isso aconteceu.”

Não:

> “Esse registro representa o estado atual.”

Por isso, eventos históricos não devem ser alterados para refletir mudanças posteriores no sistema.

Por exemplo:

```text
2026-09-01
tenant_suspended
```

continua representando que o tenant foi suspenso naquela data, mesmo que posteriormente tenha sido reativado.

O histórico seria:

```text
tenant_suspended
       ↓
tenant_activated
```

e não uma alteração retroativa do primeiro evento.

---

# 20. Event Ordering

Eventos relacionados podem precisar de ordenação temporal.

Exemplo:

```text
impersonation_started
       ↓
administrative_operation
       ↓
impersonation_stopped
```

O timestamp permite reconstruir a sequência.

Entretanto, consumidores não devem assumir que timestamps isolados são suficientes para resolver todos os problemas de ordenação em sistemas distribuídos.

À medida que a arquitetura evoluir para processamento assíncrono, mecanismos adicionais de correlação e ordering poderão ser necessários.

---

# 21. Correlation

Platform Events originados por requisições devem preservar o `request_id` sempre que possível.

Exemplo:

```text
Request
request_id=01K...
        │
        ├── infrastructure logs
        │
        └── platform event
              │
              └── tenant_suspended
```

Isso permite investigar tanto:

- o significado operacional da operação;
- quanto sua execução técnica.

A estratégia detalhada está documentada em [Correlation](./correlation.md).

---

# 22. Event and HTTP Request

Uma única ação administrativa pode gerar múltiplas representações.

Exemplo:

```text
POST /api/platform/tenants/{id}/suspend
```

Pode resultar em:

### Infrastructure Log

```text
http_request_completed
```

### Platform Event

```text
tenant_suspended
```

Esses registros não são duplicados.

Eles respondem perguntas diferentes.

```text
Infrastructure Log
→ Como a requisição foi processada?

Platform Event
→ O que aconteceu na plataforma?
```

---

# 23. Event and Database State

Platform Events também não substituem o estado atual do banco.

Considere:

```text
tenant.status = ACTIVE
```

Isso representa o estado atual.

Enquanto:

```text
tenant_suspended
tenant_activated
```

representam acontecimentos históricos.

Os dois conceitos são complementares.

```text
Current State
      +
Historical Events
```

permitem uma compreensão mais completa do sistema.

---

# 24. Transactional Consistency

Quando um Platform Event representa uma alteração persistente importante, a aplicação deve considerar a consistência entre:

```text
Business State
       +
Platform Event
```

Um cenário problemático seria:

```text
Database update succeeds
        ↓
Event persistence fails
```

ou:

```text
Event persisted
        ↓
Database update fails
```

Essas situações podem produzir um histórico inconsistente.

Conforme a arquitetura do Exactum evoluir, mecanismos como **transactional event persistence** ou **outbox pattern** poderão ser considerados para eventos que exigem garantias mais fortes de consistência.

---

# 25. Event Delivery

Platform Events podem ter diferentes destinos.

Inicialmente, eles podem ser utilizados principalmente para:

- persistência;
- administração;
- observabilidade;
- investigação.

No futuro, podem alimentar:

- notification systems;
- metrics;
- dashboards;
- asynchronous processing;
- message brokers;
- integrations.

A existência de um Platform Event não implica necessariamente que ele será publicado externamente.

---

# 26. Synchronous vs Asynchronous Events

Um evento pode ser criado dentro de uma operação síncrona:

```text
HTTP Request
    ↓
Application Service
    ↓
State Change
    ↓
Platform Event
```

Ou futuramente participar de um fluxo assíncrono:

```text
Application
    ↓
Event
    ↓
Message Broker
    ↓
Worker
    ↓
Consumer
```

A estratégia atual deve evitar acoplar o conceito de Platform Event a um mecanismo específico de transporte.

---

# 27. Event Consumers

Os consumidores de Platform Events podem incluir:

- platform administrators;
- security operators;
- developers;
- monitoring systems;
- background workers;
- future integrations.

Cada consumidor pode utilizar somente uma parte das informações do evento.

Por isso, o schema deve ser estável e previsível.

---

# 28. Event Versioning

À medida que novos consumidores forem introduzidos, mudanças no formato dos eventos devem ser tratadas com cuidado.

Alterações incompatíveis podem quebrar consumidores existentes.

Quando necessário, uma estratégia de versionamento pode ser introduzida.

Exemplo conceitual:

```text
tenant_suspended.v1
tenant_suspended.v2
```

ou através de um campo:

```json
{
  "event": "tenant_suspended",
  "version": 1
}
```

O mecanismo definitivo de versionamento dependerá da evolução da arquitetura.

---

# 29. Event Storage

O armazenamento de Platform Events deve considerar:

- capacidade de busca;
- retenção;
- segurança;
- integridade;
- volume;
- acesso administrativo;
- necessidade de auditoria.

Eventos de plataforma podem possuir requisitos de retenção diferentes dos infrastructure logs.

Por exemplo:

```text
Infrastructure Logs
→ troubleshooting

Platform Events
→ operational history
```

Essa diferença deve ser refletida na estratégia de armazenamento.

---

# 30. Access Control

Platform Events podem revelar informações administrativas e de segurança.

Seu acesso deve ser restrito de acordo com a responsabilidade do usuário.

Em especial, informações relacionadas a:

- super-admin operations;
- impersonation;
- tenant lifecycle;
- security events;

não devem ficar disponíveis indiscriminadamente para usuários comuns do sistema.

---

# 31. Tenant Visibility

Nem todo Platform Event deve ser visível para usuários de tenants.

Platform Events são, por definição, eventos de nível da plataforma.

Um tenant pode ter acesso apenas a informações que pertencem ao seu próprio contexto e que façam parte de sua superfície administrativa.

Isso reforça a separação:

```text
Platform Scope
       ≠
Tenant Scope
```

---

# 32. Relation With RBAC

O acesso a Platform Events deve respeitar o modelo de autorização da plataforma.

Um usuário comum não deve receber automaticamente acesso a eventos administrativos apenas porque consegue acessar outros recursos.

A autorização deve considerar:

- identidade;
- role;
- permission;
- platform context;
- tenant context.

O backend permanece responsável por aplicar a autorização.

---

# 33. Observability Integration

Platform Events são uma das fontes de observabilidade do Exactum.

A visão geral pode ser representada como:

```text
                 Observability
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
Infrastructure   Platform       Audit
   Logs           Events         Logs
        │             │             │
        └─────────────┼─────────────┘
                      │
                  Correlation
```

Cada mecanismo responde a uma classe diferente de perguntas.

---

# 34. Investigation Example

Considere que um operador descubra que um tenant está suspenso inesperadamente.

A investigação pode começar pelo Platform Event:

```text
tenant_suspended
```

A partir dele:

```text
tenant_id
actor_id
timestamp
request_id
```

podem ser utilizados para encontrar a requisição correspondente.

Depois:

```text
request_id
      ↓
Infrastructure Logs
      ↓
HTTP Request
      ↓
Application Service
      ↓
Database Operation
```

Isso permite reconstruir tanto o **que aconteceu** quanto **como aconteceu**.

---

# 35. Impersonation Investigation Example

Considere uma operação realizada durante impersonation.

O histórico pode ser:

```text
impersonation_started
        │
        ▼
administrative operation
        │
        ▼
impersonation_stopped
```

Com os identificadores apropriados, é possível determinar:

```text
Original Actor
        ↓
Impersonated User
        ↓
Tenant
        ↓
Operation
        ↓
Request
```

Esse nível de rastreabilidade é importante para operações administrativas de alto privilégio.

---

# 36. Failure Handling

A criação de um Platform Event deve ser tratada de acordo com a criticidade do evento.

Para eventos puramente informativos, uma falha de persistência pode não justificar interromper a operação principal.

Para eventos necessários para segurança ou consistência histórica, a aplicação pode precisar de garantias mais fortes.

Essa decisão deve ser feita individualmente conforme a natureza do evento.

Não existe uma regra universal de:

```text
event failed → request must fail
```

nem de:

```text
event failed → always ignore
```

A criticidade do evento determina o comportamento apropriado.

---

# 37. Idempotency

Eventos que possam ser processados por consumidores externos ou assíncronos devem considerar **idempotency**.

Por exemplo:

```text
tenant_suspended
```

não deve produzir efeitos duplicados se o mesmo evento for processado mais de uma vez.

Uma evolução futura poderá utilizar um identificador único de evento:

```json
{
  "event_id": "01K...",
  "event": "tenant_suspended"
}
```

Isso permite que consumidores detectem eventos já processados.

---

# 38. Event ID

Um `event_id` pode ser utilizado para identificar exclusivamente cada Platform Event.

Exemplo:

```json
{
  "event_id": "01K...",
  "event": "tenant_suspended",
  "tenant_id": "01K..."
}
```

Esse identificador é particularmente útil quando os eventos passam a ser:

- armazenados;
- publicados;
- reenviados;
- processados de forma assíncrona.

A adoção definitiva de `event_id` deve acompanhar a evolução do event infrastructure.

---

# 39. Domain Events vs Platform Events

O conceito de Platform Event não deve ser confundido com **Domain Event**.

### Domain Event

Representa uma mudança ou ocorrência significativa dentro de um domínio de negócio.

Exemplo conceitual:

```text
SaleCompleted
```

### Platform Event

Representa um acontecimento relevante no nível da plataforma.

Exemplo:

```text
tenant_suspended
```

Os dois podem compartilhar infraestrutura de eventos no futuro, mas possuem responsabilidades diferentes.

Uma possível arquitetura futura:

```text
Domain
   │
   └── Domain Events
             │
             ▼
Application
             │
             ▼
Infrastructure
             │
             ├── Platform Events
             ├── Audit Logs
             ├── Metrics
             └── Message Broker
```

---

# 40. DDD Evolution

A evolução do Exactum em direção a uma arquitetura mais próxima de **DDD** pode aumentar a quantidade de eventos significativos produzidos pelo sistema.

Isso não significa que todo acontecimento interno deverá se tornar um Platform Event.

O princípio deve continuar sendo:

> **Um evento deve existir quando o acontecimento possuir significado próprio para um consumidor.**

Eventos internos de implementação não precisam necessariamente ser persistidos ou expostos.

---

# 41. Avoiding Event Noise

Assim como logs excessivos prejudicam a observabilidade, eventos excessivos também reduzem seu valor.

Evitar transformar operações triviais em Platform Events sem necessidade.

Por exemplo:

```text
product_query_executed
```

provavelmente possui maior valor como infrastructure log ou metric.

Enquanto:

```text
tenant_suspended
```

possui significado operacional próprio.

A criação de eventos deve ser orientada pelo valor da informação.

---

# 42. Security Considerations

Platform Events devem ser tratados como dados potencialmente sensíveis.

A implementação deve garantir:

- authentication;
- authorization;
- tenant scope quando aplicável;
- access control;
- sensitive data minimization;
- secure storage;
- appropriate retention.

Especial atenção deve ser dada aos eventos relacionados a:

- super-admin;
- impersonation;
- security;
- tenant administration.

---

# 43. Testing

Platform Events devem possuir testes que garantam seu comportamento esperado.

Testes podem verificar:

- evento correto é produzido;
- actor correto é registrado;
- target correto é registrado;
- tenant correto é associado;
- request ID é preservado;
- evento não é gerado indevidamente;
- dados sensíveis não são incluídos;
- operações críticas não geram eventos duplicados.

Exemplo conceitual:

```text
Given:
Super Admin suspends Tenant A

Then:
tenant_suspended event is created

And:
actor_id = Super Admin

And:
tenant_id = Tenant A
```

---

# 44. Operational Queries

A estrutura dos eventos deve permitir perguntas operacionais como:

```text
Which tenants were suspended recently?
```

```text
Who suspended this tenant?
```

```text
When did this impersonation start?
```

```text
Which user performed this administrative action?
```

```text
What platform-level security events occurred?
```

Essas perguntas representam um dos principais motivos para manter Platform Events estruturados e persistentes.

---

# 45. Example Event Set

Um conjunto inicial de eventos pode incluir:

### Tenant

```text
tenant_created
tenant_activated
tenant_suspended
tenant_deleted
```

### User

```text
user_blocked
user_unblocked
```

### Impersonation

```text
impersonation_started
impersonation_stopped
```

### Security

```text
security_policy_changed
administrative_access_granted
administrative_access_revoked
```

A lista não deve ser considerada definitiva.

Novos eventos devem ser adicionados conforme surgirem necessidades reais da plataforma.

---

# 46. Current State

Atualmente, Platform Events fazem parte da estratégia de observabilidade e rastreabilidade administrativa do Exactum.

O foco está principalmente em eventos relacionados a:

- platform administration;
- tenant lifecycle;
- security;
- super-admin operations;
- impersonation.

A implementação deve continuar evoluindo junto com a arquitetura de observabilidade e com a separação progressiva entre responsabilidades de domínio, aplicação e infraestrutura.

---

# 47. Future Evolution

A evolução futura pode incluir:

- event persistence mais robusta;
- `event_id`;
- event versioning;
- outbox pattern;
- asynchronous processing;
- message broker;
- event consumers;
- metrics derived from events;
- centralized event storage;
- integration with monitoring systems.

Uma possível arquitetura futura:

```text
                     Application
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
          Domain Events      Platform Events
                 │                 │
                 └────────┬────────┘
                          ▼
                       Outbox
                          │
                          ▼
                    Message Broker
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Workers      Metrics      External
                                   Integrations
```

Essa arquitetura não representa necessariamente a implementação atual, mas uma possível direção de evolução.

---

# 48. Design Principles Summary

A estratégia de Platform Events do Exactum pode ser resumida nos seguintes princípios:

1. **Represent meaningful events** — eventos devem representar acontecimentos relevantes.
2. **Keep platform scope** — Platform Events devem permanecer focados no nível da plataforma.
3. **Separate technical logs** — infrastructure logs possuem outra responsabilidade.
4. **Separate tenant auditing** — ações de negócio pertencentes ao tenant devem ser tratadas como audit logs.
5. **Preserve actor context** — identificar quem originou a operação.
6. **Preserve target context** — identificar quem ou o que foi afetado.
7. **Correlate requests** — utilizar request/correlation IDs quando disponíveis.
8. **Protect sensitive data** — eventos não devem armazenar secrets ou credenciais.
9. **Prefer immutable history** — eventos representam acontecimentos passados.
10. **Avoid noise** — nem toda operação deve gerar um evento.
11. **Prepare for asynchronous processing** — a estrutura deve permitir evolução futura.
12. **Keep architectural boundaries** — Platform Events não devem substituir Domain Events ou Audit Logs.

---

# 49. Related Documentation

- [Observability Overview](./overview.md)
- [Infrastructure Logging](./infrastructure-logging.md)
- [Correlation](./correlation.md)
- [Audit Logging](./audit-logging.md)
- [Authentication](../security/authentication.md)
- [Authorization](../security/authorization.md)
- [Session Management](../security/session-management.md)
- [Tenant Isolation](../security/tenant-isolation.md)
- [Threat Model](../security/threat-model.md)
- [Domain Boundaries](../architecture/domain-boundaries.md)

---

# 50. Status

**Status:** Active

Este documento representa a estratégia atual de **Platform Events** do Exactum e deve evoluir conforme novos requisitos administrativos, de segurança, observabilidade e arquitetura forem introduzidos.

---

> **Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.
>
> A organização descrita também poderá evoluir conforme o sistema avance. Alguns conceitos ou responsabilidades atualmente agrupados em determinados domínios poderão posteriormente ser extraídos para contextos próprios, como parte da evolução arquitetural planejada. Portanto, este documento deve ser interpretado como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.
