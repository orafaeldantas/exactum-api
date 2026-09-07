# Observability Overview

## 1. Overview

Observability é um dos pilares operacionais do Exactum.

O objetivo não é apenas registrar mensagens produzidas pela aplicação, mas tornar possível compreender o comportamento do sistema a partir dos sinais gerados durante sua execução.

No Exactum, observabilidade é tratada como uma combinação de:

- infrastructure logs;
- application logs;
- platform events;
- tenant audit logs;
- correlation IDs;
- contexto de usuário e tenant;
- tratamento estruturado de erros;
- métricas e dashboards como evolução futura.

O modelo atual pode ser representado como:

```text
                         Exactum
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
 Infrastructure        Platform          Tenant Audit
    Logs                Events              Logs
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                       Correlation
                            │
                            ▼
                      Investigation
```

O objetivo final é permitir responder perguntas como:

```text
O que aconteceu?
Quando aconteceu?
Quem executou?
Em qual tenant?
Qual requisição originou a operação?
Qual recurso foi afetado?
Qual foi o resultado?
```

---

# 2. Objectives

A arquitetura de observabilidade possui os seguintes objetivos:

1. facilitar diagnóstico de problemas;
2. permitir investigação de incidentes;
3. fornecer contexto operacional;
4. rastrear operações administrativas relevantes;
5. permitir auditoria de ações realizadas dentro de tenants;
6. relacionar eventos pertencentes à mesma requisição;
7. identificar falhas e comportamentos anômalos;
8. preservar contexto de usuário e tenant;
9. separar informações operacionais de informações de auditoria;
10. criar uma base para métricas e monitoramento futuro.

Observabilidade deve ajudar tanto durante desenvolvimento quanto em produção.

---

# 3. Observability Model

O Exactum utiliza três categorias principais de registros:

```text
Exactum
   │
   ├── Infrastructure Logs
   │
   ├── Platform Events
   │
   └── Tenant Audit Logs
```

Cada categoria possui uma finalidade diferente.

| Type                | Purpose                             | Primary Consumer        |
| ------------------- | ----------------------------------- | ----------------------- |
| Infrastructure Logs | Diagnóstico operacional             | Developers / Operators  |
| Platform Events     | Atividades relevantes da plataforma | Super Admin / Operators |
| Tenant Audit Logs   | Rastreabilidade de ações do tenant  | Tenant Administrators   |

Essas categorias não devem ser tratadas como equivalentes.

Um log de infraestrutura descreve **o comportamento técnico do sistema**.

Um platform event descreve **uma atividade relevante da plataforma**.

Um audit log descreve **uma ação relevante dentro do contexto de um tenant**.

---

# 4. Three Observability Layers

## 4.1. Infrastructure Logs

Infrastructure logs representam eventos técnicos relacionados à execução da aplicação.

Exemplos:

- requisições HTTP;
- erros;
- exceções;
- latência;
- status HTTP;
- informações operacionais;
- eventos relacionados à infraestrutura.

Seu principal objetivo é responder:

> **"O que aconteceu tecnicamente?"**

---

## 4.2. Platform Events

Platform events representam atividades relevantes para a operação da plataforma.

Exemplos conceituais:

- criação de tenant;
- suspensão de tenant;
- alterações administrativas;
- impersonation;
- operações realizadas por super-admin;
- eventos relacionados à administração da plataforma.

Seu principal objetivo é responder:

> **"O que aconteceu no nível da plataforma?"**

---

## 4.3. Tenant Audit Logs

Tenant audit logs representam ações relevantes realizadas dentro do contexto de um tenant.

Exemplos:

- criação de registros;
- alterações;
- exclusões;
- alterações administrativas;
- ações relevantes sobre recursos do tenant.

Seu principal objetivo é responder:

> **"Quem fez o quê dentro deste tenant?"**

---

# 5. Observability Architecture

O fluxo conceitual pode ser representado por:

```text
                     HTTP Request
                           │
                           ▼
                  ┌─────────────────┐
                  │    Nginx        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Exactum API   │
                  └────────┬────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
             Logging    Events     Audit
                │          │          │
                └──────────┼──────────┘
                           │
                           ▼
                    Correlation ID
                           │
                           ▼
                     Investigation
```

O correlation ID funciona como elemento de ligação entre diferentes registros originados da mesma operação.

---

# 6. Observability Signals

A evolução da observabilidade do Exactum pode ser organizada em três sinais principais:

```text
Logs
  │
  ├── What happened?
  │
  ▼
Events
  │
  ├── What meaningful action happened?
  │
  ▼
Metrics
  │
  └── How is the system behaving over time?
```

Atualmente, logs e eventos possuem papel central.

Métricas e dashboards fazem parte da evolução planejada da plataforma.

---

# 7. Logs

Logs representam eventos técnicos gerados durante a execução da aplicação.

Um log estruturado deve preferencialmente possuir informações como:

```text
timestamp
level
message
request_id
user_uuid
tenant_uuid
method
path
status_code
duration
```

Os campos efetivamente registrados devem respeitar o contexto da operação.

---

# 8. Structured Logging

O Exactum utiliza logging estruturado para facilitar:

- filtragem;
- pesquisa;
- agregação;
- análise automatizada;
- correlação;
- troubleshooting.

Em vez de produzir apenas:

```text
User login failed
```

um evento estruturado pode carregar contexto:

```json
{
  "level": "warning",
  "event": "authentication_failed",
  "request_id": "...",
  "user_uuid": "...",
  "timestamp": "..."
}
```

O formato exato pode evoluir conforme a infraestrutura de observabilidade amadurece.

---

# 9. Contextual Logging

Um log isolado frequentemente possui pouco valor.

O contexto torna o evento investigável.

Por isso, quando disponível, os registros podem carregar:

```text
Request Context
├── request_id
├── method
├── path
├── status
└── duration

Identity Context
├── user_uuid
├── tenant_uuid
└── role

Operation Context
├── event
├── entity
└── result
```

O objetivo é transformar:

```text
Error occurred
```

em:

```text
Error occurred
in request X
for user Y
in tenant Z
while executing operation W
```

---

# 10. Correlation IDs

Correlation IDs são utilizados para relacionar diferentes eventos pertencentes à mesma operação.

Conceitualmente:

```text
Request
   │
   │ request_id = abc123
   │
   ├── Authentication Log
   │
   ├── Application Log
   │
   ├── Database-related Log
   │
   └── Audit Event
```

Isso permite reconstruir uma sequência de eventos.

O mecanismo é detalhado em:

`docs/observability/correlation.md`

---

# 11. Request Observability

Cada requisição HTTP representa uma unidade importante de observabilidade.

Informações relevantes incluem:

```text
HTTP Method
Path
Status Code
Duration
Request ID
User
Tenant
```

Um fluxo típico:

```text
Request
   │
   ▼
Generate / Propagate Correlation ID
   │
   ▼
Authentication
   │
   ▼
Application
   │
   ▼
Response
   │
   ▼
Structured Log
```

Isso permite analisar comportamento e desempenho da API.

---

# 12. Error Observability

Erros devem possuir dois tratamentos distintos:

```text
                    Error
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
        Client Response     Internal Log
```

A resposta ao cliente deve conter somente as informações necessárias para o contrato da API.

O log interno pode conter contexto adicional necessário para diagnóstico.

Essa separação reduz o risco de exposição de informações internas.

---

# 13. Exceptions and Observability

O tratamento centralizado de exceções permite manter comportamento consistente.

Conceitualmente:

```text
Application Error
       │
       ▼
Exception Handler
       │
       ├── Structured Log
       │
       └── HTTP Response
```

O objetivo é evitar que cada endpoint implemente seu próprio mecanismo de logging e tratamento de erros.

---

# 14. Authentication Observability

Eventos relacionados à autenticação possuem importância operacional e de segurança.

Exemplos:

- login bem-sucedido;
- login falho;
- logout;
- refresh;
- sessão revogada;
- usuário bloqueado.

Esses eventos podem auxiliar na identificação de:

- credential abuse;
- brute force;
- session abuse;
- comportamento anômalo.

A observabilidade não substitui o controle de autenticação.

Ela fornece visibilidade sobre seu funcionamento.

---

# 15. Authorization Observability

Alterações e falhas relacionadas à autorização também podem ser relevantes para observabilidade.

Exemplos:

- permission denied;
- alteração de role;
- alteração de permissions;
- operações administrativas;
- tentativa de acesso não autorizado.

Um evento pode carregar:

```text
user_uuid
tenant_uuid
operation
resource
result
request_id
timestamp
```

Isso permite investigar possíveis tentativas de privilege escalation.

---

# 16. Tenant-Aware Observability

Como o Exactum é multi-tenant, o contexto do tenant é importante para observabilidade.

Sempre que aplicável:

```text
tenant_uuid
```

deve acompanhar o contexto do evento.

Isso permite:

- filtrar eventos por tenant;
- investigar incidentes;
- analisar comportamento;
- diferenciar operações;
- auxiliar suporte;
- investigar cross-tenant anomalies.

Entretanto, tenant context em logs não deve ser confundido com autorização.

O contexto de observabilidade apenas registra o contexto efetivo da operação.

---

# 17. Platform Events

Platform events representam acontecimentos relevantes para a operação da plataforma.

Exemplos:

```text
Tenant Created
Tenant Suspended
Tenant Reactivated
User Administrative Action
Impersonation Started
Impersonation Stopped
```

Esses eventos são especialmente relevantes para operações de plataforma.

O documento específico é:

`docs/observability/platform-events.md`

---

# 18. Tenant Audit

Audit logging representa uma camada diferente dos logs técnicos.

Enquanto:

```text
Infrastructure Log
```

responde:

> Como o sistema se comportou?

o audit responde:

> Qual ação foi realizada e por quem?

O modelo conceitual de um audit record inclui:

```text
user_uuid
tenant_uuid
event
entity
payload
created_at
```

A implementação detalhada está descrita em:

`docs/observability/audit-logging.md`

---

# 19. Infrastructure Logs vs Audit Logs

Esses mecanismos não devem ser misturados.

| Infrastructure Logs        | Audit Logs               |
| -------------------------- | ------------------------ |
| Técnico                    | Negócio / administrativo |
| Troubleshooting            | Accountability           |
| Developers / Operators     | Tenant Administrators    |
| Request-centric            | Action-centric           |
| Pode possuir grande volume | Deve ser mais seletivo   |
| Diagnóstico                | Histórico de ações       |

Exemplo:

### Infrastructure Log

```text
POST /api/products
status=201
duration=82ms
request_id=abc
```

### Audit Log

```text
User X created Product Y
Tenant Z
```

Os dois podem representar a mesma operação, mas possuem objetivos diferentes.

---

# 20. Platform Events vs Tenant Audit

A distinção também existe entre platform events e tenant audit.

```text
Platform Event
      │
      ▼
Platform-level activity

Tenant Audit
      │
      ▼
Tenant-level activity
```

Exemplo:

```text
Super Admin impersonates User
        │
        ▼
Platform Event
```

Enquanto:

```text
User creates Product
        │
        ▼
Tenant Audit
```

Essa separação ajuda a preservar diferentes níveis de autoridade e consumo das informações.

---

# 21. Security and Observability

Observabilidade possui papel importante na segurança.

Ela não substitui:

- authentication;
- authorization;
- tenant isolation;
- session management.

Porém, permite detectar e investigar violações dessas propriedades.

O modelo é:

```text
Security Controls
       │
       ▼
Prevent / Block
       │
       ▼
Observability
       │
       ▼
Detect / Investigate
```

---

# 22. Observability and Tenant Isolation

Eventos de tenant devem manter o tenant correto.

Isso permite identificar situações como:

```text
User A
Tenant A
       │
       ▼
Attempted access
       │
       ▼
Tenant B Resource
```

O evento de segurança pode ser correlacionado com:

- request;
- user;
- tenant;
- resource;
- authorization result.

Isso aumenta a capacidade de investigação de potenciais falhas de isolamento.

---

# 23. Observability and Impersonation

Impersonation exige rastreabilidade adicional.

Um evento relacionado à impersonation deve permitir distinguir:

```text
Original Actor
       │
       ▼
Effective User
       │
       ▼
Effective Tenant
```

O objetivo é evitar perda de accountability.

Por exemplo:

```text
Super Admin
    │
    ├── Started impersonation
    │
    ▼
User A / Tenant A
    │
    ├── Performed operation
    │
    ▼
Super Admin
    │
    └── Stopped impersonation
```

A sequência deve permanecer investigável.

---

# 24. Observability and Sessions

O gerenciamento de sessões também produz eventos importantes.

Exemplos:

- login;
- refresh;
- logout;
- revocation;
- invalid session;
- blocked user;
- expired session.

Esses eventos podem ser usados para investigar comportamentos anômalos.

O modelo completo de sessão está documentado em:

`docs/security/session-management.md`

---

# 25. Data Sensitivity

Observabilidade deve respeitar o princípio:

> **Registrar contexto suficiente para investigar sem registrar segredos desnecessários.**

Nunca devem ser registrados indiscriminadamente:

```text
Passwords
Refresh Tokens
Access Tokens
Session Secrets
Database Credentials
API Keys
```

Dados sensíveis devem ser:

- omitidos;
- mascarados;
- sanitizados;
- ou armazenados somente quando houver necessidade legítima.

---

# 26. Payload Logging

Payloads de requisições podem conter dados sensíveis.

Por isso, registrar automaticamente todos os request bodies não é uma estratégia adequada por padrão.

Por exemplo:

```json
{
  "password": "...",
  "token": "..."
}
```

não deve aparecer em logs de produção.

Quando payloads forem necessários para diagnóstico, campos sensíveis devem ser filtrados.

---

# 27. Log Levels

Os logs devem possuir níveis apropriados.

Conceitualmente:

```text
DEBUG
INFO
WARNING
ERROR
CRITICAL
```

Cada nível possui finalidade diferente.

### DEBUG

Informações detalhadas úteis durante desenvolvimento ou troubleshooting específico.

### INFO

Eventos operacionais normais.

### WARNING

Situações anormais que não interrompem necessariamente a operação.

### ERROR

Falhas de operações ou componentes.

### CRITICAL

Falhas potencialmente graves que exigem atenção imediata.

A configuração de produção deve evitar volume excessivo de logs desnecessários.

---

# 28. Logging Volume

Nem todo evento precisa ser registrado com o mesmo nível de detalhe.

Excessive logging pode causar:

- custo;
- ruído;
- dificuldade de investigação;
- armazenamento desnecessário;
- exposição de informações.

O objetivo é encontrar equilíbrio entre:

```text
Visibility
   +
Signal Quality
   +
Security
   +
Operational Cost
```

---

# 29. Observability Storage

A estratégia de armazenamento pode evoluir conforme a infraestrutura amadurece.

No estágio atual, o foco está em structured logging e registros persistidos necessários para eventos e auditoria.

Uma arquitetura futura pode incorporar ferramentas especializadas para:

```text
Logs
  │
  ▼
Log Aggregation

Metrics
  │
  ▼
Prometheus

Dashboards
  │
  ▼
Grafana
```

Essas ferramentas fazem parte da evolução planejada da observabilidade.

---

# 30. Metrics

Métricas representam uma dimensão futura importante.

Exemplos:

```text
HTTP request rate
HTTP error rate
Request latency
Database latency
Redis latency
Authentication failures
Authorization failures
Active sessions
```

Métricas também podem ser segmentadas por dimensões relevantes, desde que isso não introduza cardinalidade excessiva ou exposição indevida de dados.

---

# 31. Metrics vs Logs

Logs respondem:

> O que aconteceu?

Métricas respondem:

> Com que frequência e intensidade isso está acontecendo?

Exemplo:

```text
Log:
User X received 403.

Metric:
403 responses increased 300%.
```

Os dois sinais se complementam.

---

# 32. Metrics and Alerting

Quando métricas forem introduzidas, poderão alimentar mecanismos de alerta.

Exemplo conceitual:

```text
Authentication Failures
          │
          ▼
       Metric
          │
          ▼
       Threshold
          │
          ▼
        Alert
```

O objetivo é reduzir o tempo entre:

```text
Problem occurs
```

e:

```text
Problem is detected
```

---

# 33. Observability and Performance

Observabilidade também deve ajudar na análise de desempenho.

Informações importantes incluem:

- request duration;
- database duration;
- Redis latency;
- external service latency;
- error rates;
- throughput.

Conceitualmente:

```text
Request
   │
   ├── Authentication
   ├── Application
   ├── Database
   └── External Service
            │
            ▼
         Duration
```

Isso ajuda a localizar gargalos.

---

# 34. Database Observability

PostgreSQL representa uma dependência crítica.

Observabilidade deve permitir investigar:

- falhas de conexão;
- queries lentas;
- erros de transação;
- migrations;
- indisponibilidade;
- consumo de recursos.

No futuro, métricas específicas podem complementar os logs.

---

# 35. Redis Observability

Redis também é componente importante devido ao gerenciamento de sessões.

Aspectos relevantes incluem:

- disponibilidade;
- latência;
- connection errors;
- operações de sessão;
- falhas de acesso;
- consumo de memória.

O objetivo é identificar rapidamente problemas que afetem autenticação e sessão.

---

# 36. Nginx Observability

Nginx representa a principal camada HTTP de entrada.

Informações relevantes incluem:

- request count;
- status codes;
- upstream errors;
- latency;
- connection issues.

A correlação com os logs da API permite investigar problemas de ponta a ponta.

---

# 37. End-to-End Investigation

O objetivo final da arquitetura é permitir uma investigação de ponta a ponta.

Exemplo:

```text
Client
  │
  ▼
Nginx
  │
  │ request_id
  ▼
Exactum API
  │
  │ request_id
  ├──────────────► Application Log
  │
  ├──────────────► Platform Event
  │
  └──────────────► Audit Log
                         │
                         ▼
                    Investigation
```

Uma única operação deve poder ser reconstruída a partir dos sinais disponíveis.

---

# 38. Operational Questions

Uma arquitetura de observabilidade adequada deve ajudar a responder:

### Availability

```text
A aplicação está funcionando?
```

### Performance

```text
A aplicação está lenta?
```

### Errors

```text
Onde os erros estão acontecendo?
```

### Security

```text
Existem comportamentos suspeitos?
```

### Accountability

```text
Quem realizou determinada operação?
```

### Tenant Isolation

```text
Existe alguma tentativa de acesso cross-tenant?
```

### Infrastructure

```text
Qual componente está causando a falha?
```

---

# 39. Observability Workflow

O fluxo de investigação pode ser representado como:

```text
Problem
  │
  ▼
Detection
  │
  ▼
Correlation ID
  │
  ▼
Infrastructure Logs
  │
  ▼
Application Context
  │
  ├── Platform Events
  │
  └── Tenant Audit
  │
  ▼
Root Cause Analysis
  │
  ▼
Remediation
```

---

# 40. Observability Principles

## 40.1. Context Over Messages

Logs devem priorizar contexto estruturado em vez de mensagens vagas.

---

## 40.2. Correlation First

Eventos relacionados devem poder ser correlacionados.

---

## 40.3. Security-Aware Logging

Logs nunca devem comprometer os próprios mecanismos de segurança.

---

## 40.4. Separate Operational and Audit Concerns

Logs técnicos e registros de auditoria possuem finalidades diferentes.

---

## 40.5. Tenant Awareness

Operações tenant-scoped devem preservar contexto de tenant quando apropriado.

---

## 40.6. Minimize Sensitive Data

Registrar somente o necessário.

---

## 40.7. Prefer Structured Data

Dados estruturados são mais fáceis de consultar e agregar.

---

## 40.8. Design for Investigation

Os registros devem ser úteis durante incident response e troubleshooting.

---

## 40.9. Observability Must Evolve

A observabilidade deve acompanhar o crescimento da arquitetura.

---

# 41. Failure Scenarios

A observabilidade deve permitir investigar cenários como:

### API Failure

```text
Request
   │
   ▼
500
   │
   ▼
Application Log
   │
   ▼
Root Cause
```

### Database Failure

```text
Request
   │
   ▼
Repository
   │
   ▼
PostgreSQL Error
   │
   ▼
Structured Log
```

### Redis Failure

```text
Authentication
      │
      ▼
Redis
      │
      ▼
Connection Error
      │
      ▼
Operational Alert
```

### Suspicious Authorization

```text
User
 │
 ▼
403
 │
 ▼
Authorization Event
 │
 ▼
Correlation
 │
 ▼
Investigation
```

---

# 42. Observability and Reliability

Observabilidade não garante disponibilidade, mas reduz o tempo necessário para detectar e corrigir problemas.

Isso impacta diretamente:

```text
MTTD
Mean Time To Detect

MTTR
Mean Time To Recover
```

Uma boa observabilidade busca reduzir ambos.

---

# 43. Current State

No estado atual, o Exactum possui como principais mecanismos:

- structured logging;
- request context;
- correlation IDs;
- user context;
- tenant context;
- centralized exception handling;
- platform events;
- tenant audit logs;
- logs relacionados à operação da API.

Esses mecanismos formam a base da observabilidade atual.

---

# 44. Current Limitations

A observabilidade atual ainda possui limitações.

Entre elas:

- ausência de uma stack completa de métricas;
- dashboards operacionais ainda em evolução;
- ausência de processamento assíncrono;
- infraestrutura sem alta disponibilidade;
- possíveis limitações de retenção e agregação de logs;
- ausência de uma plataforma dedicada de log aggregation em escala.

Essas limitações são compatíveis com o estágio atual do projeto e fazem parte do roadmap de evolução.

---

# 45. Planned Evolution

A evolução planejada pode ser representada por:

```text
Current
   │
   ├── Structured Logs
   ├── Correlation
   ├── Platform Events
   └── Audit
   │
   ▼
Next
   │
   ├── Metrics
   ├── Prometheus
   ├── Grafana
   └── Better Alerting
   │
   ▼
Future
   │
   ├── Async Processing
   ├── Queue Observability
   ├── Distributed Tracing
   └── Centralized Telemetry
```

A adoção dessas tecnologias deve ocorrer conforme a complexidade do sistema justificar.

---

# 46. Distributed Tracing

Distributed tracing não é requisito da arquitetura atual.

Entretanto, pode tornar-se relevante quando o Exactum incorporar:

- workers;
- filas;
- serviços adicionais;
- integrações externas;
- processamento assíncrono;
- múltiplos componentes distribuídos.

Nesse cenário:

```text
Request
  │
  ▼
API
  │
  ▼
Queue
  │
  ▼
Worker
  │
  ▼
External Service
```

um trace distribuído poderá complementar os correlation IDs.

---

# 47. Observability During Architectural Evolution

A evolução para uma arquitetura mais orientada a domínios deve preservar observabilidade.

Novas fronteiras arquiteturais não devem resultar em perda de contexto.

Por exemplo:

```text
HTTP
 │
 ▼
Application
 │
 ▼
Domain
 │
 ▼
Infrastructure
```

Cada camada deve continuar permitindo rastrear:

```text
Request
User
Tenant
Operation
Result
```

---

# 48. Observability and DDD Evolution

À medida que os domínios forem separados de maneira mais explícita, eventos de domínio poderão futuramente complementar os platform events existentes.

A distinção conceitual seria:

```text
Domain Event
      │
      ▼
Business Domain Change

Platform Event
      │
      ▼
Platform-level Operational Event
```

Essa evolução deve ocorrer somente quando houver necessidade arquitetural real.

O modelo atual não deve ser artificialmente transformado em event-driven architecture antes que isso seja necessário.

---

# 49. Testing Observability

Observabilidade também deve ser testada.

Testes podem verificar:

- geração de correlation ID;
- propagação de contexto;
- logs em operações relevantes;
- platform events;
- audit records;
- comportamento em exceções;
- ausência de secrets em logs;
- associação correta entre user e tenant;
- eventos de impersonation.

Exemplo conceitual:

```text
Operation
   │
   ▼
Expected Event
   │
   ├── user_uuid
   ├── tenant_uuid
   ├── request_id
   └── entity
```

---

# 50. Observability Security Tests

Testes específicos devem verificar que informações sensíveis não sejam registradas.

Por exemplo:

```text
Password
    │
    ▼
Request
    │
    ▼
Log
    │
    └── Must NOT contain password
```

O mesmo princípio se aplica a:

- access tokens;
- refresh tokens;
- API keys;
- secrets;
- credentials.

---

# 51. Retention

A política de retenção deve considerar:

- volume;
- custo;
- necessidade operacional;
- requisitos de auditoria;
- sensibilidade dos dados.

Logs técnicos podem possuir uma política diferente de audit logs.

A retenção deve ser definida de maneira consciente conforme o ambiente e os requisitos do sistema.

---

# 52. Access Control

Observability data também precisa de controle de acesso.

Nem todo usuário deve possuir acesso a:

- infrastructure logs;
- platform events;
- audit logs;
- informações internas de produção.

Conceitualmente:

```text
Infrastructure Logs
        │
        └── Operations / Developers

Platform Events
        │
        └── Platform Administration

Tenant Audit
        │
        └── Tenant Administration
```

A observabilidade não deve criar uma nova forma de vazamento de dados.

---

# 53. Privacy Considerations

Logs e auditoria podem conter informações relacionadas a usuários e tenants.

Por isso:

- coletar somente dados necessários;
- evitar secrets;
- limitar acesso;
- definir retenção adequada;
- evitar payloads completos sem necessidade;
- considerar minimização de dados.

Observabilidade deve equilibrar:

```text
Operational Visibility
        +
Security
        +
Privacy
```

---

# 54. Observability Maturity

A maturidade da observabilidade pode evoluir progressivamente.

```text
Level 1
Basic Logs
    │
    ▼
Level 2
Structured + Correlated Logs
    │
    ▼
Level 3
Events + Audit
    │
    ▼
Level 4
Metrics + Dashboards
    │
    ▼
Level 5
Distributed Telemetry
```

O Exactum está evoluindo entre os níveis intermediários, com structured logging, correlation, events e audit já fazendo parte da arquitetura.

---

# 55. Design Goals for Future Telemetry

Quando novas ferramentas forem introduzidas, devem preservar:

- tenant awareness;
- correlation;
- security;
- low operational coupling;
- structured data;
- observability of critical paths;
- manageable cardinality;
- controlled retention.

A adoção de uma ferramenta não deve substituir os princípios arquiteturais.

---

# 56. Summary

A arquitetura de observabilidade do Exactum é baseada na separação entre:

```text
Infrastructure Logs
        +
Platform Events
        +
Tenant Audit Logs
        +
Correlation
```

Esses mecanismos possuem responsabilidades diferentes, mas complementares.

```text
Infrastructure Logs
        │
        └── Technical visibility

Platform Events
        │
        └── Platform accountability

Tenant Audit
        │
        └── Tenant accountability

Correlation
        │
        └── End-to-end investigation
```

O objetivo não é simplesmente armazenar informações, mas construir uma visão operacional capaz de explicar o comportamento do sistema.

---

# 57. Core Principle

O princípio central da observabilidade do Exactum é:

> **Se uma operação é importante o suficiente para ser executada, ela deve gerar contexto suficiente para ser compreendida posteriormente.**

Isso não significa registrar absolutamente tudo.

Significa registrar **as informações certas, no lugar certo, com o contexto certo e sem expor dados desnecessários**.

---

# 58. Related Documentation

### Architecture

- `docs/architecture/overview.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`

### Security

- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/session-management.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`

### Observability

- `docs/observability/infrastructure-logging.md`
- `docs/observability/platform-events.md`
- `docs/observability/audit-logging.md`
- `docs/observability/correlation.md`

---

# 59. Status

**Status:** Active
**Current Focus:** Structured Logging, Events, Audit and Correlation
**Architecture:** Layered / evolving toward domain-oriented architecture
**Metrics:** Planned
**Prometheus:** Planned
**Grafana:** Planned
**Distributed Tracing:** Future consideration
