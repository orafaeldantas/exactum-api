# ADR-008 — Estratégia de Observabilidade

- **Status:** Accepted
- **Date:** 2026-09-28
- **Decision Type:** Architecture / Operations
- **Related Areas:** Observability, Architecture, Security, Operations, Monitoring
- **Supersedes:** None
- **Superseded By:** None

---

# 1. Contexto

À medida que o Exactum evoluiu de uma aplicação predominantemente local para uma aplicação SaaS multi-tenant executada em ambiente de produção, tornou-se necessário estabelecer uma estratégia explícita de **Observability**.

Em uma aplicação simples, mensagens de log pontuais podem ser suficientes para identificar problemas.

Em uma aplicação como o Exactum, entretanto, uma única operação pode atravessar diferentes componentes:

```text
Client
  │
  ▼
Nginx
  │
  ▼
Flask / API
  │
  ├── Authentication
  ├── Authorization
  ├── Tenant Context
  │
  ▼
Application Service
  │
  ▼
Repository
  │
  ▼
PostgreSQL
  │
  └── Redis quando aplicável
```

Além disso, determinadas operações possuem significado operacional ou de segurança que não pode ser adequadamente representado apenas por logs técnicos.

Exemplos incluem:

- login;
- logout;
- refresh de sessão;
- revogação de sessão;
- alteração de permissões;
- bloqueio de usuário;
- suspensão de tenant;
- início de impersonation;
- término de impersonation;
- alterações administrativas;
- operações relevantes sobre dados.

Foi necessário, portanto, estabelecer uma estratégia que permita responder perguntas como:

- O que aconteceu?
- Quando aconteceu?
- Em qual requisição aconteceu?
- Qual usuário estava envolvido?
- Qual tenant estava envolvido?
- Qual operação foi executada?
- Qual componente apresentou falha?
- Qual foi o resultado da operação?
- Essa atividade possui relevância de segurança ou auditoria?
- É possível correlacionar diferentes eventos pertencentes à mesma operação?

A decisão adotada é utilizar uma estratégia de **Observability** baseada em diferentes mecanismos complementares, em vez de tratar todos os eventos do sistema simplesmente como logs.

---

# 2. Decisão

O Exactum adotará uma estratégia de **Observability em múltiplas camadas**, composta principalmente por:

- **Structured Logging**;
- **Correlation ID**;
- **Platform Events**;
- **Audit Logging**;
- métricas e monitoramento como evolução futura;
- integração progressiva com ferramentas de observabilidade.

Esses mecanismos possuem finalidades diferentes e não devem ser tratados como equivalentes.

A arquitetura conceitual é:

```text
                         Observability
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
 Structured Logging     Platform Events      Audit Logging
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                       Correlation ID
                              │
                              ▼
                    Request / Operation Context
```

A estratégia futura poderá incorporar:

```text
Observability
     │
     ├── Logs
     ├── Events
     ├── Audit
     ├── Metrics
     └── Tracing
```

A adoção desses mecanismos será incremental e baseada nas necessidades reais do sistema.

---

# 3. Objetivos

A estratégia de Observability possui os seguintes objetivos:

### 3.1 Diagnóstico

Permitir identificar e investigar falhas da aplicação.

### 3.2 Rastreamento

Permitir acompanhar uma operação através dos diferentes componentes envolvidos.

### 3.3 Segurança

Permitir identificar atividades relevantes para segurança e administração da plataforma.

### 3.4 Auditoria

Permitir registrar operações que possuem importância administrativa, de segurança ou de responsabilização.

### 3.5 Operação

Fornecer informações suficientes para operar o sistema em produção.

### 3.6 Evolução

Criar uma base arquitetural que permita adicionar métricas, tracing e ferramentas de monitoramento posteriormente.

---

# 4. Princípio Fundamental

A estratégia adota a seguinte separação:

> **Nem todo evento é um log, nem todo log é uma auditoria.**

Cada mecanismo possui uma finalidade própria.

| Mecanismo          | Finalidade principal                                    |
| ------------------ | ------------------------------------------------------- |
| Structured Logging | Diagnóstico técnico e operacional                       |
| Correlation ID     | Correlação de uma operação                              |
| Platform Events    | Registro de acontecimentos relevantes da plataforma     |
| Audit Logging      | Responsabilização e rastreabilidade de ações relevantes |
| Metrics            | Medição quantitativa do comportamento do sistema        |
| Tracing            | Rastreamento detalhado de operações distribuídas        |

Essa separação evita transformar um único mecanismo em responsável por todas as necessidades de observabilidade.

---

# 5. Logging Estruturado

O Exactum utiliza **Structured Logging** como mecanismo principal para informações técnicas e operacionais.

Em vez de produzir apenas mensagens livres:

```text
User login failed
```

os logs devem, sempre que possível, possuir informações estruturadas:

```text
{
  "level": "WARNING",
  "event": "authentication_failed",
  "correlation_id": "...",
  "user_uuid": "...",
  "tenant_uuid": "...",
  "method": "POST",
  "path": "/api/auth/login"
}
```

A estrutura exata dos campos pode variar de acordo com o evento.

O princípio é que informações importantes para diagnóstico devem ser representadas como dados estruturados sempre que possível.

---

# 6. Objetivos dos Logs

Os logs possuem como principais objetivos:

- identificar falhas;
- diagnosticar comportamento inesperado;
- acompanhar o Request Lifecycle;
- registrar informações operacionais;
- facilitar busca e filtragem;
- permitir agregação futura;
- fornecer contexto para investigação de incidentes.

Logs não devem ser utilizados como substitutos de Audit Logging.

---

# 7. Informações de Contexto

Quando aplicável, logs podem conter informações de contexto como:

- timestamp;
- log level;
- event name;
- Correlation ID;
- request method;
- request path;
- HTTP status;
- user UUID;
- tenant UUID;
- operação;
- duração;
- origem técnica;
- erro ou exceção;
- ambiente.

O conjunto de campos deve ser determinado de acordo com a necessidade do evento.

Não existe obrigação de incluir todos os campos em todos os logs.

---

# 8. Informações Sensíveis

Observability não deve se transformar em um mecanismo de vazamento de informações sensíveis.

Não devem ser registrados indiscriminadamente:

- senhas;
- tokens de autenticação;
- refresh tokens;
- access tokens;
- cookies de autenticação;
- credenciais;
- segredos;
- dados pessoais desnecessários;
- informações sensíveis que não contribuam para o diagnóstico.

Em particular, JWTs não devem ser registrados integralmente nos logs.

O mesmo princípio se aplica a tokens armazenados em cookies HttpOnly.

---

# 9. Correlation ID

O **Correlation ID** é utilizado para associar diferentes registros pertencentes à mesma operação ou requisição.

Conceitualmente:

```text
Request A
   │
   ├── Correlation ID: abc123
   │
   ├── Nginx
   │
   ├── Flask
   │
   ├── Authentication
   │
   ├── Application Service
   │
   ├── Repository
   │
   └── PostgreSQL
```

Todos os registros relevantes podem utilizar o mesmo identificador de correlação.

Isso permite realizar consultas como:

```text
correlation_id = "abc123"
```

e reconstruir a sequência de acontecimentos relacionados àquela operação.

---

# 10. Propagação do Correlation ID

O Correlation ID deve acompanhar o Request Lifecycle sempre que tecnicamente aplicável.

Conceitualmente:

```text
Incoming Request
      │
      ▼
Generate / Validate Correlation ID
      │
      ▼
Request Context
      │
      ├── Logging
      ├── Error Handling
      ├── Platform Events
      └── Audit Events
```

Quando uma requisição já possui um identificador de correlação válido, o sistema poderá reutilizá-lo conforme as regras estabelecidas pela aplicação.

Quando não existir, um novo identificador poderá ser criado.

O comportamento exato deve preservar a segurança e evitar que identificadores fornecidos externamente sejam tratados como identidade confiável.

---

# 11. Correlation ID e Segurança

O Correlation ID não representa:

- identidade do usuário;
- identidade do tenant;
- sessão;
- autorização;
- autenticação.

Ele é apenas um identificador técnico de correlação.

Portanto:

```text
Correlation ID ≠ User Identity
Correlation ID ≠ Session
Correlation ID ≠ Authorization
```

Sua função é permitir rastreabilidade técnica.

---

# 12. Eventos de Plataforma

O Exactum utiliza o conceito de **Platform Events** para representar acontecimentos relevantes da própria plataforma.

Um Platform Event representa um fato que aconteceu no sistema e que pode possuir relevância para:

- operação;
- segurança;
- administração;
- observabilidade;
- auditoria;
- integrações futuras.

Exemplos incluem:

```text
USER_LOGGED_IN
USER_LOGGED_OUT
SESSION_REVOKED
REFRESH_TOKEN_ROTATED
REFRESH_TOKEN_REUSE_DETECTED
USER_BLOCKED
TENANT_SUSPENDED
IMPERSONATION_STARTED
IMPERSONATION_STOPPED
```

A nomenclatura exata dos eventos pode evoluir conforme o domínio e a plataforma amadurecem.

---

# 13. Eventos de Plataforma não são Eventos de Domínio

É importante diferenciar **Platform Events** de **Domain Events**.

### Evento de Plataforma

Representa um acontecimento relevante para a plataforma ou infraestrutura da aplicação.

Exemplos:

```text
USER_LOGGED_IN
SESSION_REVOKED
IMPERSONATION_STARTED
```

### Evento de Domínio

Representa um acontecimento significativo dentro de um domínio de negócio.

Exemplos futuros poderiam incluir:

```text
SALE_COMPLETED
STOCK_REPLENISHED
PRODUCT_PRICE_CHANGED
```

Esses conceitos podem utilizar mecanismos de infraestrutura semelhantes, mas possuem significados arquiteturais diferentes.

O Exactum não deve tratar automaticamente qualquer evento como Domain Event.

---

# 14. Logs de Auditoria

**Audit Logging** possui finalidade diferente de Structured Logging.

Seu objetivo é responder perguntas relacionadas à responsabilização:

- Quem realizou a ação?
- O que foi alterado?
- Em qual tenant?
- Quando aconteceu?
- Qual recurso foi afetado?
- Qual era o contexto da operação?
- Qual identidade estava atuando?
- Havia uma identidade administrativa original?

Exemplos de ações relevantes:

- alteração de permissões;
- bloqueio de usuário;
- alteração administrativa;
- suspensão de tenant;
- início de impersonation;
- término de impersonation;
- operações administrativas relevantes.

---

# 15. Actor e Impersonation

Audit Logging possui relação direta com o modelo de **Impersonation**.

Em uma operação normal:

```text
Actor
  │
  ▼
Operation
  │
  ▼
Resource
```

Em uma operação de impersonation:

```text
Original Administrator
        │
        ▼
Impersonated User
        │
        ▼
Operation
        │
        ▼
Resource
```

O sistema deve preservar a distinção entre:

- identidade original;
- identidade operacional;
- tenant original;
- tenant operacional quando aplicável;
- recurso afetado;
- operação executada.

Isso permite manter accountability.

Essa decisão é diretamente relacionada à **ADR-006 — Impersonation Model**.

---

# 16. Logs de Auditoria e Logging Estruturado

Structured Logging e Audit Logging não devem ser tratados como a mesma coisa.

### Logging Estruturado

Tem como objetivo principal:

> entender o que aconteceu tecnicamente.

### Logs de Auditoria

Tem como objetivo principal:

> registrar quem realizou uma ação relevante e permitir responsabilização posterior.

Uma ação pode gerar ambos:

```text
Request
 │
 ├── Structured Log
 │      └── diagnóstico técnico
 │
 └── Audit Log
        └── responsabilização
```

Um Audit Event não deve depender exclusivamente da interpretação posterior de logs técnicos.

Quando uma operação exige auditoria, o registro deve ser tratado explicitamente como uma operação de auditoria.

---

# 17. Ciclo de Vida da Requisição

A estratégia de Observability acompanha o Request Lifecycle.

Um fluxo simplificado é:

```text
HTTP Request
     │
     ▼
Correlation ID
     │
     ▼
Authentication
     │
     ▼
Authorization
     │
     ▼
Tenant Context
     │
     ▼
Controller
     │
     ▼
Application Service
     │
     ▼
Repository
     │
     ▼
Database
     │
     ▼
HTTP Response
```

Durante esse ciclo, informações relevantes podem ser registradas nos mecanismos apropriados.

Por exemplo:

```text
Request
 │
 ├── Correlation ID
 │
 ├── Structured Logs
 │
 ├── Platform Events
 │
 └── Audit Events
```

Isso cria uma visão operacional da execução sem exigir que cada mecanismo armazene todas as informações disponíveis.

---

# 18. Observabilidade de Erros

Falhas da aplicação devem ser observáveis sem expor informações desnecessárias ao cliente.

Um erro pode produzir:

```text
Application Exception
       │
       ├── Structured Log
       │      ├── error type
       │      ├── correlation_id
       │      └── request context
       │
       └── HTTP Error Response
              ├── status
              ├── public error code
              └── correlation reference
```

Isso permite que o cliente receba uma resposta controlada enquanto a equipe responsável possui informações suficientes para investigação.

O Correlation ID pode ser utilizado como referência para localizar os registros correspondentes.

---

# 19. Observabilidade e Multi-Tenancy

Como o Exactum é multi-tenant, informações de tenant são importantes para diagnóstico e investigação.

Quando aplicável, registros podem incluir:

```text
tenant_uuid
user_uuid
correlation_id
```

Isso permite investigar problemas específicos de um tenant sem misturar informações de diferentes contextos.

Entretanto, Tenant Context não deve ser utilizado como substituto de Authorization ou Tenant Isolation.

A informação registrada para observabilidade não concede acesso ao tenant.

---

# 20. Observabilidade e Autenticação

Eventos relacionados à autenticação possuem relevância operacional e de segurança.

Exemplos:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
LOGOUT
REFRESH_TOKEN_ROTATED
REFRESH_TOKEN_REUSE_DETECTED
SESSION_REVOKED
```

Esses eventos podem contribuir para:

- investigação de problemas de login;
- identificação de falhas;
- diagnóstico de sessão;
- investigação de possível replay;
- análise operacional.

Tokens e credenciais completas não devem ser registrados.

---

# 21. Observabilidade e Autorização

Operações relacionadas a Authorization podem possuir relevância especial.

Exemplos:

- alteração de role;
- alteração de permission;
- concessão de acesso;
- remoção de acesso;
- tentativa de acesso não autorizado.

Uma tentativa de autorização negada pode gerar Structured Logging para diagnóstico.

Uma alteração administrativa de permissões pode, além disso, gerar Audit Logging.

A classificação depende da natureza da operação.

---

# 22. Observabilidade e Impersonation

Impersonation possui tratamento especial devido ao impacto de segurança e accountability.

Eventos relevantes incluem:

```text
IMPERSONATION_STARTED
IMPERSONATION_STOPPED
```

Esses eventos devem permitir identificar:

- administrador original;
- usuário impersonado;
- tenant original;
- tenant operacional;
- momento de início;
- momento de término;
- Correlation ID;
- contexto da requisição quando aplicável.

O objetivo é garantir que a operação não apague a identidade responsável pela sua origem.

Isso segue o princípio estabelecido na ADR-006:

> **Impersonation deve preservar accountability.**

---

# 23. Logs vs Eventos vs Auditoria

A separação conceitual pode ser resumida da seguinte maneira:

```text
                ┌──────────────────────┐
                │    O que aconteceu?  │
                └──────────┬───────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
           Logs          Events         Audit
             │             │             │
             ▼             ▼             ▼
        Diagnóstico     Fato da       Responsabilidade
        técnico         plataforma    administrativa
```

Exemplo:

### Login

```text
Structured Log
    ↓
request received / authentication result

Platform Event
    ↓
USER_LOGGED_IN

Audit
    ↓
quando a ação possuir relevância de auditoria
```

Nem todos os eventos precisam gerar todos os mecanismos.

---

# 24. Métricas

Métricas são reconhecidas como parte importante da estratégia de Observability, mas sua adoção completa é considerada uma etapa de evolução.

Métricas podem representar informações quantitativas como:

- quantidade de requests;
- latência;
- taxa de erro;
- quantidade de logins;
- sessões ativas;
- operações por tenant;
- utilização de recursos;
- quantidade de falhas;
- throughput.

Conceitualmente:

```text
Logs
  → eventos detalhados

Metrics
  → comportamento quantitativo

Events
  → acontecimentos relevantes

Audit
  → responsabilização
```

A integração futura com **Prometheus/Grafana** está prevista como evolução da plataforma de observabilidade.

---

# 25. Tracing

Distributed Tracing não é atualmente tratado como requisito central da arquitetura.

O sistema atual é predominantemente monolítico, embora possua infraestrutura externa como:

- PostgreSQL;
- Redis;
- Nginx;
- infraestrutura de hospedagem.

Por esse motivo, Correlation ID fornece atualmente uma relação custo-benefício adequada para rastrear operações.

No futuro, caso o sistema evolua para múltiplos serviços, processamento assíncrono ou integrações mais complexas, Distributed Tracing poderá se tornar mais relevante.

Nesse cenário, o Correlation ID existente poderá contribuir para a integração entre os mecanismos de rastreamento.

---

# 26. Performance

Observability possui impacto de performance.

Logs excessivos podem:

- aumentar I/O;
- aumentar armazenamento;
- aumentar custo de processamento;
- dificultar análise;
- gerar ruído.

Da mesma forma, registrar informações excessivas em Audit Logging pode aumentar custos e volume sem necessariamente gerar valor.

A estratégia deve buscar:

> **informação suficiente para diagnóstico, sem registrar indiscriminadamente tudo.**

Eventos de alta frequência devem ser avaliados com atenção antes de receberem mecanismos de observabilidade mais pesados.

---

# 27. Retenção

Os diferentes tipos de informação podem possuir necessidades diferentes de retenção.

Conceitualmente:

```text
Structured Logs
    ↓
retenção operacional

Platform Events
    ↓
retenção operacional / histórica

Audit Logs
    ↓
retenção orientada à auditoria e segurança

Metrics
    ↓
retenção orientada à análise temporal
```

A política concreta de retenção poderá evoluir conforme:

- volume;
- requisitos operacionais;
- requisitos legais;
- custos;
- infraestrutura disponível;
- necessidade de investigação.

Não é necessário utilizar a mesma política de retenção para todos os tipos de dados de observabilidade.

---

# 28. Falha da Infraestrutura de Observabilidade

A infraestrutura de observabilidade não deve impedir indiscriminadamente a execução da aplicação.

Por exemplo, uma falha de mecanismo secundário de logging não deve necessariamente transformar uma operação de negócio válida em uma falha HTTP.

A estratégia deve distinguir entre:

- mecanismos críticos para segurança;
- mecanismos operacionais;
- mecanismos auxiliares.

Em particular, eventos de segurança ou auditoria podem exigir garantias maiores de persistência conforme sua importância.

Essas necessidades poderão motivar futuramente mecanismos como:

- filas;
- Outbox Pattern;
- processamento assíncrono;
- armazenamento dedicado.

---

# 29. Segurança da Observabilidade

Observability também deve ser considerada parte da superfície de segurança.

Logs e eventos podem conter informações que permitem reconstruir:

- identidades;
- operações;
- tenants;
- comportamento administrativo;
- falhas;
- informações operacionais.

Por isso, o acesso aos dados de observabilidade deve ser controlado.

Princípios importantes:

- não registrar secrets;
- não registrar tokens completos;
- limitar dados pessoais;
- controlar acesso aos logs;
- evitar exposição pública;
- utilizar canais seguros;
- manter separação entre dados técnicos e dados sensíveis;
- preservar integridade dos registros de auditoria.

---

# 30. Testes

Os mecanismos de Observability devem possuir testes adequados.

Exemplos:

### Logging Estruturado

Verificar se eventos importantes produzem os campos esperados.

### Correlation ID

Verificar:

- geração;
- propagação;
- associação aos logs;
- comportamento em requisições inválidas.

### Eventos de Plataforma

Verificar se eventos são produzidos nos momentos esperados.

### Logs de Auditoria

Verificar:

- identidade do actor;
- recurso afetado;
- tenant;
- operação;
- contexto de impersonation quando aplicável.

Observability não deve depender apenas de testes manuais.

---

# 31. Alternativas Consideradas

## 31.1 Apenas Logs

Uma abordagem simples seria utilizar exclusivamente logs:

```text
Application
    ↓
Logs
```

### Vantagens

- simples;
- baixa complexidade inicial;
- fácil implementação.

### Desvantagens

- mistura diagnóstico e auditoria;
- eventos importantes podem ficar difíceis de identificar;
- não existe distinção clara entre fatos da plataforma e mensagens técnicas;
- dificulta evolução para métricas e tracing.

Essa abordagem foi considerada insuficiente.

---

# 32. Apenas Logs de Auditoria

Outra alternativa seria registrar todas as operações relevantes como auditoria.

Isso também não é suficiente.

Audit Logging não substitui:

- logs técnicos;
- diagnóstico de exceções;
- métricas;
- informações de performance;
- Request Lifecycle.

Audit e diagnóstico possuem objetivos diferentes.

---

# 33. Observabilidade Completa desde o Início

Outra alternativa seria implantar imediatamente:

- Structured Logging;
- Metrics;
- Distributed Tracing;
- Event Streaming;
- Prometheus;
- Grafana;
- OpenTelemetry;
- armazenamento especializado.

Embora tecnicamente possível, isso aumentaria significativamente a complexidade operacional do sistema.

O Exactum está evoluindo progressivamente, portanto a decisão é implementar primeiro os mecanismos com maior valor imediato e adicionar componentes mais sofisticados conforme a necessidade surgir.

---

# 34. Justificativa da Decisão

A estratégia escolhida equilibra:

- simplicidade;
- segurança;
- capacidade de diagnóstico;
- rastreabilidade;
- evolução futura.

Structured Logging fornece a base operacional.

Correlation ID permite relacionar registros.

Platform Events representam acontecimentos relevantes da plataforma.

Audit Logging preserva accountability.

Metrics e Tracing permanecem como extensões naturais da arquitetura.

Essa separação evita tanto uma observabilidade insuficiente quanto uma infraestrutura excessivamente complexa para o estágio atual do Exactum.

---

# 35. Consequências

## 35.1 Consequências Positivas

### Melhor diagnóstico

Falhas podem ser investigadas com maior contexto.

### Maior rastreabilidade

Uma operação pode ser acompanhada através do Request Lifecycle.

### Melhor segurança

Eventos relevantes de Authentication, Authorization e Impersonation podem ser investigados.

### Responsabilização

Operações administrativas podem preservar a identidade responsável.

### Evolução

A arquitetura permite incorporar Metrics e Tracing posteriormente.

### Separação conceitual

Logs, Platform Events e Audit Logging possuem responsabilidades distintas.

---

# 36. Trade-offs

## 36.1 Maior complexidade

Existem mais conceitos para manter:

- logs;
- events;
- audit;
- correlation;
- metrics;
- tracing futuro.

## 36.2 Custo de armazenamento

Aumento de volume de logs e eventos pode gerar custos adicionais.

## 36.3 Risco de excesso de informação

Logs excessivos podem dificultar investigação em vez de ajudar.

## 36.4 Necessidade de disciplina

Os desenvolvedores precisam classificar adequadamente cada informação.

## 36.5 Infraestrutura adicional

Conforme a observabilidade evolui, ferramentas especializadas poderão ser necessárias.

---

# 37. Estado Atual

A estratégia atual do Exactum pode ser resumida como:

```text
                    Exactum
                       │
                Observability
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
Structured         Platform        Audit
 Logging           Events          Logging
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                Correlation ID
```

O sistema já possui mecanismos relacionados a:

- Structured Logging;
- Correlation;
- Platform Events;
- Audit Logging.

A estratégia de métricas e monitoramento mais avançada permanece como evolução planejada.

---

# 38. Evolução Futura

A arquitetura poderá evoluir progressivamente para:

```text
                    Observability
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
     Logs              Metrics            Events
      │                  │                  │
      │                  ▼                  │
      │              Prometheus             │
      │                  │                  │
      │                  ▼                  │
      │               Grafana               │
      │                                     │
      └──────────────────┬──────────────────┘
                         │
                         ▼
                       Audit
```

Possíveis evoluções incluem:

- Prometheus;
- Grafana;
- OpenTelemetry;
- Distributed Tracing;
- métricas de aplicação;
- métricas de infraestrutura;
- dashboards operacionais;
- alertas;
- centralização de logs;
- retenção especializada;
- processamento assíncrono;
- Outbox Pattern.

Essas tecnologias não são consideradas obrigatórias neste momento.

Cada adoção futura deverá ser justificada por uma necessidade concreta.

---

# 39. Relação com Segurança

A estratégia de Observability está diretamente relacionada às decisões de segurança do Exactum.

Especialmente:

- Authentication;
- Authorization;
- Session Management;
- Tenant Isolation;
- Impersonation.

Um mecanismo de segurança sem observabilidade adequada pode dificultar a investigação de incidentes.

Por outro lado, observabilidade sem controles de segurança pode criar uma nova superfície de exposição.

Portanto:

> **Observability deve aumentar a capacidade de investigação sem comprometer a confidencialidade das informações registradas.**

---

# 40. Relação com Arquitetura

A estratégia de Observability também está relacionada à **ADR-007 — Layered Application Architecture**.

A arquitetura em camadas fornece pontos naturais para observabilidade:

```text
HTTP
 │
 ├── Request Logging
 │
 ▼
Controller
 │
 ├── Application Context
 │
 ▼
Application Service
 │
 ├── Platform Events
 │
 ▼
Repository
 │
 ├── Persistence Diagnostics
 │
 ▼
Database
```

Essa integração permite observar o sistema sem transformar cada camada em responsável pela infraestrutura completa de observabilidade.

---

# 41. Princípio Arquitetural

O princípio central estabelecido por esta ADR é:

> **Observability must provide enough context to understand what happened, without conflating diagnostics, platform events and accountability.**

Em termos práticos:

```text
Logs
   → O que aconteceu tecnicamente?

Events
   → Que acontecimento relevante ocorreu?

Audit
   → Quem realizou a ação?

Correlation
   → Como relacionar os acontecimentos?

Metrics
   → Com que frequência / intensidade aconteceu?

Tracing
   → Por onde a operação passou?
```

Cada mecanismo deve responder à pergunta para a qual foi projetado.

---

# 42. Resumo da Decisão

| Concern               | Decisão                                               |
| --------------------- | ----------------------------------------------------- |
| Estratégia principal  | Observability em múltiplas camadas                    |
| Logs                  | Structured Logging                                    |
| Correlação            | Correlation ID                                        |
| Eventos de plataforma | Platform Events                                       |
| Auditoria             | Audit Logging                                         |
| Métricas              | Evolução futura                                       |
| Tracing               | Evolução futura                                       |
| Monitoramento         | Evolução futura                                       |
| Segurança             | Não registrar secrets/tokens completos                |
| Multi-tenancy         | Contexto de tenant quando aplicável                   |
| Impersonation         | Preservar identidade original e operacional           |
| Falhas                | Diagnóstico sem exposição desnecessária               |
| Retenção              | Diferenciada por tipo de informação                   |
| Infraestrutura futura | Prometheus/Grafana/OpenTelemetry conforme necessidade |

---

# 43. Decisão Final

O Exactum adotará uma estratégia de **Observability composta por mecanismos complementares**, com **Structured Logging**, **Correlation ID**, **Platform Events** e **Audit Logging** como elementos fundamentais.

Esses mecanismos não serão tratados como substitutos uns dos outros.

Structured Logging será utilizado principalmente para diagnóstico técnico e operacional.

Platform Events representarão acontecimentos relevantes da plataforma.

Audit Logging será utilizado para preservar accountability de operações relevantes.

Correlation ID permitirá relacionar diferentes registros pertencentes à mesma operação.

Metrics, Distributed Tracing e ferramentas especializadas de monitoramento poderão ser incorporados progressivamente conforme a complexidade operacional do Exactum aumente.

A estratégia deverá permanecer proporcional ao estágio da plataforma, evitando tanto observabilidade insuficiente quanto complexidade operacional prematura.

## Princípio Arquitetural

> **Observability must provide enough context to understand what happened, without conflating diagnostics, platform events and accountability.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de observabilidade e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Da mesma forma, conceitos como Platform Events, Audit Logging e Domain Events representam responsabilidades arquiteturais distintas, ainda que possam compartilhar mecanismos de infraestrutura no futuro.

A estratégia descrita também poderá evoluir conforme o sistema avance. Novos mecanismos, como Metrics, Distributed Tracing, OpenTelemetry, Prometheus, Grafana, processamento assíncrono ou Outbox Pattern, poderão ser incorporados quando houver justificativa operacional ou arquitetural. Portanto, este documento deve ser interpretado como uma representação da **estratégia atual de Observability e de sua direção de evolução**, e não como uma especificação imutável da infraestrutura futura do Exactum.
