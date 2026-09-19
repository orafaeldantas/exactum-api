# Correlation

## 1. Objetivo

**Correlation** é a estratégia utilizada pelo Exactum para conectar diferentes registros e componentes envolvidos na execução de uma mesma operação.

Em uma aplicação com múltiplas camadas, uma única ação pode passar por:

```text
Client
    ↓
Nginx
    ↓
Flask
    ↓
Middleware
    ↓
Controller
    ↓
Application Service
    ↓
Repository
    ↓
PostgreSQL / Redis
```

Além disso, a mesma operação pode gerar diferentes tipos de registros:

```text
Infrastructure Log
Platform Event
Audit Log
Exception Log
```

Sem um identificador comum, investigar uma operação específica pode exigir procurar manualmente por timestamp, endpoint, usuário ou outros atributos.

A estratégia de Correlation resolve esse problema utilizando identificadores e contexto compartilhados entre as diferentes partes da aplicação.

---

## 2. Correlation ID

O principal mecanismo de correlação utilizado pelo sistema é o **Correlation ID**, representado atualmente pelo `request_id`.

Esse identificador representa uma requisição ou unidade de execução observável.

Exemplo:

```text
request_id = 7f8c2a...
```

O mesmo identificador pode aparecer em diferentes registros relacionados àquela execução:

```text
HTTP Request
    request_id: 7f8c2a...

Infrastructure Log
    request_id: 7f8c2a...

Audit Log
    request_id: 7f8c2a...
```

Isso permite conectar eventos que, individualmente, possuem informações diferentes.

---

## 3. Objetivo da Correlation

A finalidade principal não é apenas identificar uma requisição.

O objetivo é permitir **end-to-end investigation**.

Dado um identificador:

```text
request_id = 7f8c2a...
```

deve ser possível procurar registros relacionados e reconstruir, dentro dos limites dos dados disponíveis:

```text
Quem iniciou?
Qual endpoint foi chamado?
Qual tenant estava envolvido?
Qual operação foi executada?
Qual recurso foi afetado?
Qual foi o resultado?
Houve erro?
Quais componentes participaram?
```

Isso reduz significativamente o tempo necessário para diagnóstico.

---

## 4. Request Context

O `request_id` deve fazer parte do contexto da requisição enquanto ela estiver sendo processada.

Conceitualmente:

```text
Request
    ↓
Generate / Receive Request ID
    ↓
Request Context
    ↓
Application Layers
    ↓
Logs / Events / Audit
```

O contexto da requisição também pode conter informações adicionais, como:

```text
request_id
user_uuid
tenant_uuid
role
HTTP method
path
```

Esses valores permitem que os registros sejam contextualizados sem que cada camada precise descobrir novamente essas informações.

---

## 5. Request ID vs. User ID vs. Tenant ID

Esses identificadores possuem responsabilidades diferentes.

### Request ID

Identifica uma execução específica.

```text
request_id
    → "Qual requisição gerou isso?"
```

### User ID

Identifica o usuário associado ao contexto de execução.

Na implementação atual, pode ser representado por:

```text
user_uuid
```

```text
user_uuid
    → "Quem estava associado à operação?"
```

### Tenant ID

Identifica o contexto de tenant.

Na implementação atual, pode ser representado por:

```text
tenant_uuid
```

```text
tenant_uuid
    → "Em qual tenant isso aconteceu?"
```

Esses identificadores não devem ser tratados como substitutos uns dos outros.

Uma representação conceitual é:

```text
Request
├── request_id
├── actor / user
└── tenant
```

---

## 6. Correlation and Infrastructure Logs

Infrastructure Logs devem incluir o `request_id` quando o registro estiver associado a uma requisição.

Exemplo:

```text
{
    "event": "request_completed",
    "request_id": "7f8c2a...",
    "method": "PATCH",
    "path": "/api/products/...",
    "status_code": 200
}
```

Um erro ocorrido durante a mesma requisição pode registrar:

```text
{
    "event": "database_error",
    "request_id": "7f8c2a...",
    "exception_type": "..."
}
```

A busca pelo mesmo `request_id` permite relacionar os registros.

---

## 7. Correlation and Audit Logs

Quando uma ação de negócio gera um Audit Log durante uma requisição HTTP, o registro deve preservar o `request_id` correspondente sempre que possível.

Exemplo:

```text
Infrastructure Log
    request_id: 7f8c2a...
    PATCH /products/{uuid}

Audit Log
    request_id: 7f8c2a...
    product_updated
```

Assim, o histórico de negócio pode ser conectado ao contexto técnico da operação.

O Audit Log responde:

> O que foi feito?

O Infrastructure Log ajuda a responder:

> Como essa operação foi executada?

O `request_id` conecta as duas perspectivas.

---

## 8. Correlation and Platform Events

Platform Events também podem carregar informações de correlação quando são originados durante uma requisição.

Exemplo:

```text
Platform Event
├── event_id
├── event_type
├── request_id
├── actor
├── tenant
└── timestamp
```

Isso permite relacionar um acontecimento da plataforma à operação HTTP que o originou.

Por exemplo:

```text
Request
    ↓
POST /run-impersonate
    ↓
Platform Event
    impersonation_started
```

Ambos podem compartilhar o mesmo contexto de correlação.

---

## 9. Correlation vs. Event ID

`request_id` e `event_id` possuem responsabilidades diferentes.

### Request ID

Agrupa registros pertencentes à mesma execução ou requisição.

```text
request_id
    ↓
Log A
Log B
Audit Log
Platform Event
```

### Event ID

Identifica individualmente um evento.

```text
event_id
    ↓
Platform Event A
```

Uma operação pode produzir:

```text
request_id:
    7f8c2a...

event_id:
    e91d4c...
```

O `event_id` identifica o evento.

O `request_id` permite relacioná-lo à execução que o originou.

---

## 10. Correlation vs. Trace ID

Correlation e distributed tracing são conceitos relacionados, mas não idênticos.

Um sistema de tracing normalmente trabalha com conceitos como:

```text
Trace
Span
Parent Span
Trace ID
Span ID
```

Enquanto a estratégia atual do Exactum está centrada principalmente em:

```text
request_id
```

Isso é suficiente para correlacionar os principais registros da aplicação enquanto a arquitetura permanece predominantemente concentrada em uma aplicação backend.

Caso o sistema evolua para uma arquitetura mais distribuída, uma estratégia de tracing poderá ser introduzida.

Nesse cenário, o `request_id` pode continuar existindo como identificador de aplicação enquanto um `trace_id` fornece uma visão distribuída mais ampla.

---

## 11. Correlation Across Layers

O identificador de correlação deve permanecer disponível durante o fluxo da aplicação.

Exemplo:

```text
HTTP Request
    ↓
Middleware
    ↓
Controller
    ↓
Application Service
    ↓
Repository
```

As camadas internas não precisam necessariamente receber o `request_id` como argumento em todos os métodos de domínio.

Quando possível, o contexto de observabilidade deve permanecer separado da lógica de negócio.

Isso evita transformar conceitos de infraestrutura em dependências obrigatórias de entidades e regras de domínio.

---

## 12. Avoiding Framework Coupling

Uma preocupação importante é evitar que Correlation introduza forte acoplamento com Flask.

Por exemplo, uma regra de negócio não deveria precisar conhecer diretamente:

```text
flask.request
flask.g
```

apenas para executar sua lógica.

A responsabilidade pode ser separada conceitualmente:

```text
HTTP Layer
    ↓
Request Context
    ↓
Application Layer
    ↓
Domain Logic
```

O domínio deve continuar independente dos mecanismos específicos utilizados para transportar o contexto HTTP.

Essa separação é particularmente importante para a evolução arquitetural planejada do Exactum.

---

## 13. Correlation and Authentication

Authentication fornece o contexto de identidade da requisição.

Depois que a requisição é autenticada, informações como:

```text
user_uuid
tenant_uuid
role
```

podem ser associadas ao contexto de observabilidade.

Assim:

```text
Request
├── request_id
├── authenticated user
├── tenant
└── authorization context
```

Isso permite investigar uma operação tanto pelo identificador da requisição quanto pelo contexto de identidade.

Entretanto, informações de autenticação devem ser tratadas com cuidado e não devem incluir tokens ou credentials nos logs.

---

## 14. Correlation and Authorization

Authorization determina se determinada ação pode ser executada.

Quando uma operação é rejeitada, o contexto de correlação permite identificar:

```text
request_id
user
tenant
endpoint
required permission
result
```

Por exemplo:

```text
Authorization denied
    request_id: 7f8c2a...
    user_uuid: ...
    tenant_uuid: ...
    resource: product
    action: delete
```

O sistema deve evitar registrar informações desnecessárias sobre permissions ou recursos sensíveis.

O objetivo é permitir investigação suficiente sem aumentar exposição de dados.

---

## 15. Correlation and Impersonation

Impersonation exige atenção especial porque uma única operação pode envolver mais de uma identidade conceitual.

Por exemplo:

```text
Original Actor:
    Super Admin

Effective User:
    Tenant User

Tenant:
    Tenant A

Request:
    7f8c2a...
```

O `request_id` permite conectar os registros técnicos e de auditoria relacionados à operação.

Conceitualmente:

```text
Super Admin
    ↓
Impersonation Context
    ↓
Request
    ↓
Business Operation
    ↓
Audit Log
```

A correlação deve preservar informações suficientes para distinguir o originador da ação do usuário efetivo da operação.

---

## 16. Correlation and Tenant Isolation

Correlation IDs não substituem Tenant Isolation.

Um `request_id` identifica uma execução, mas não determina autorização de acesso aos dados.

Por exemplo:

```text
request_id = A
tenant = X
```

não significa que possuir o `request_id` conceda acesso aos registros do tenant X.

A correlação é um mecanismo de observabilidade.

A autorização e o isolamento continuam sendo responsabilidades do backend.

Essa distinção é importante para evitar transformar identificadores de observabilidade em mecanismos de segurança.

---

## 17. Request Lifecycle

Um fluxo típico de correlação pode ser representado como:

```text
1. Request received
        ↓
2. Request ID established
        ↓
3. Authentication
        ↓
4. Tenant context established
        ↓
5. Authorization
        ↓
6. Application operation
        ↓
7. Database / Redis operations
        ↓
8. Audit / Platform Event
        ↓
9. Response
        ↓
10. Request completed
```

Os registros produzidos durante esse fluxo devem preservar o contexto de correlação quando aplicável.

---

## 18. Request ID Generation

O sistema deve possuir uma estratégia consistente para estabelecer o `request_id`.

Quando não existir um identificador confiável fornecido pelo ambiente externo, a aplicação pode gerar um novo identificador.

Quando um identificador for recebido de uma camada anterior, como um reverse proxy, sua aceitação deve considerar:

- confiança na origem;
- possibilidade de spoofing;
- formato válido;
- sanitização;
- política de segurança.

Um identificador fornecido por um cliente não deve ser automaticamente considerado confiável apenas porque possui o nome `request_id`.

---

## 19. Response Correlation

Quando apropriado, o `request_id` também pode ser disponibilizado na resposta HTTP.

Exemplo:

```text
HTTP Response

X-Request-ID: 7f8c2a...
```

Isso permite que o cliente ou operador informe o identificador ao investigar um problema.

O uso de headers de correlação deve seguir uma convenção consistente em toda a aplicação.

O identificador exposto ao cliente não deve revelar informações sensíveis.

---

## 20. Error Investigation

Correlation é especialmente importante durante erros.

Considere:

```text
User reports:
    "Falha ao atualizar produto."
```

Sem correlação, a investigação pode depender de:

```text
timestamp
user
endpoint
IP
```

Com um `request_id`:

```text
request_id = 7f8c2a...
```

o operador pode procurar diretamente:

```text
7f8c2a...
```

e encontrar:

```text
Request
    ↓
Authorization
    ↓
Application Error
    ↓
Database Error
    ↓
Response
```

Esse fluxo reduz ambiguidades durante troubleshooting.

---

## 21. Correlation and Exception Handling

O tratamento centralizado de exceções deve preservar o contexto de correlação.

Exemplo conceitual:

```text
Exception Handler
    ↓
Log exception
    request_id = 7f8c2a...
    ↓
Return client-safe response
```

O cliente não precisa receber detalhes internos da exceção.

Pode receber apenas uma resposta genérica acompanhada de um identificador de referência:

```text
Request ID:
    7f8c2a...
```

Isso permite que o usuário forneça o identificador ao suporte ou operador sem expor stack traces ou informações internas.

---

## 22. Sensitive Data

Correlation deve ser implementada sem transformar o sistema de observabilidade em uma fonte de vazamento de informações.

Não devem ser incluídos no contexto de logs:

```text
Passwords
Access Tokens
Refresh Tokens
Cookies
Authorization Headers
API Keys
Secrets
```

Também deve existir cautela com:

```text
Request Body
Query Parameters
Personal Data
Financial Data
```

Um `request_id` deve ser um identificador técnico, não um recipiente para informações contextuais excessivas.

---

## 23. Cardinality and Performance

Correlation IDs normalmente possuem alta cardinalidade.

Isso é esperado em logs, mas pode ser problemático em sistemas de Metrics quando cada `request_id` é utilizado como label.

Por exemplo, não é recomendado criar uma métrica com:

```text
request_id
```

como label.

Isso poderia gerar uma quantidade excessiva de séries.

Uma separação adequada é:

```text
Logs
    → request_id

Metrics
    → endpoint
    → status
    → method
    → service
```

Essa distinção será importante para a futura integração com Prometheus.

---

## 24. Background Jobs

Quando o sistema evoluir para processamento assíncrono com ferramentas como Celery e RabbitMQ, o conceito de correlation deverá ser estendido.

Uma requisição pode produzir um job:

```text
HTTP Request
    request_id: A
        ↓
Queue
        ↓
Background Job
```

O job pode carregar informações de correlação, por exemplo:

```text
correlation_id
parent_request_id
job_id
```

Isso permite conectar:

```text
Request
    ↓
Published Message
    ↓
Background Job
    ↓
Database Operation
    ↓
Audit Log
```

A implementação concreta deve ser definida quando o processamento assíncrono fizer parte da arquitetura efetiva.

---

## 25. Correlation Across Services

Se o Exactum futuramente possuir múltiplos serviços, a estratégia poderá evoluir para uma combinação de:

```text
Trace ID
Span ID
Correlation ID
Request ID
```

Por exemplo:

```text
Frontend
    ↓
API
    trace_id: T

Service A
    span_id: A

Service B
    span_id: B

Worker
    span_id: C
```

A necessidade dessa complexidade deve surgir da arquitetura real.

Não é necessário introduzir distributed tracing antes que exista uma necessidade operacional correspondente.

---

## 26. Correlation and Observability Stack

Correlation funciona como uma camada transversal da estratégia de Observability.

Conceitualmente:

```text
                    Correlation
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
Infrastructure      Platform          Audit
   Logs              Events           Logs
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                    Investigation
```

O identificador de correlação não substitui os diferentes mecanismos.

Ele permite que sejam utilizados em conjunto.

---

## 27. Operational Investigation

Um processo de investigação pode começar por diferentes pontos.

### Starting from Request ID

```text
request_id
    ↓
Infrastructure Logs
    ↓
Audit / Platform Events
    ↓
Database / Redis context
```

### Starting from Audit Log

```text
Audit Log
    ↓
request_id
    ↓
Infrastructure Logs
    ↓
Application execution
```

### Starting from Error

```text
Error
    ↓
request_id
    ↓
Request
    ↓
Application flow
```

### Starting from User

```text
user_uuid
    ↓
Relevant operations
    ↓
request_id
    ↓
Detailed investigation
```

Cada identificador responde a uma pergunta diferente.

---

## 28. Searchability

Os registros devem ser estruturados de maneira que `request_id` possa ser pesquisado facilmente.

Logs estruturados são preferíveis a mensagens puramente textuais como:

```text
"Something went wrong during request..."
```

Uma representação estruturada permite:

```text
request_id = "7f8c2a..."
```

e filtros por:

```text
tenant_uuid
user_uuid
event
status_code
timestamp
```

Isso é especialmente útil quando o volume de logs crescer.

---

## 29. Ordering

Correlation não garante, por si só, a ordenação perfeita dos registros.

Registros podem ser produzidos por diferentes componentes e, em cenários assíncronos, podem ser persistidos em momentos diferentes.

Por isso, investigações devem considerar:

```text
timestamp
sequence
event_id
request_id
```

quando esses campos estiverem disponíveis.

Em processamento assíncrono, a ordem de persistência pode não representar exatamente a ordem lógica em que as ações foram iniciadas.

---

## 30. Distributed and Asynchronous Limitations

Em uma arquitetura síncrona simples, `request_id` pode representar adequadamente uma execução HTTP.

Em arquiteturas distribuídas, uma operação pode gerar múltiplas execuções:

```text
Request A
    ↓
Job B
    ↓
Worker C
```

Nesse cenário, utilizar apenas um `request_id` pode não ser suficiente.

A evolução natural é distinguir:

```text
Root Correlation
    ↓
Request
    ↓
Job
    ↓
Worker
```

A implementação deve ser introduzida somente quando o sistema efetivamente possuir esses fluxos.

---

## 31. Testing Correlation

A estratégia de Correlation deve ser coberta por testes.

Os testes devem validar, quando aplicável:

- geração ou propagação correta do `request_id`;
- presença do identificador no request context;
- inclusão do identificador nos Infrastructure Logs;
- associação com Audit Logs;
- associação com Platform Events;
- preservação do identificador durante tratamento de exceções;
- exposição segura do identificador na resposta;
- isolamento correto entre diferentes requisições;
- comportamento quando um identificador externo é inválido;
- ausência de informações sensíveis no contexto;
- comportamento em operações assíncronas futuras.

Também deve ser garantido que uma requisição não reutilize acidentalmente o contexto de outra execução.

---

## 32. Anti-Patterns

Algumas práticas devem ser evitadas.

### Usar user ID como correlation ID

```text
request_id = user_uuid
```

Isso elimina a capacidade de diferenciar requisições diferentes do mesmo usuário.

### Usar tenant ID como correlation ID

```text
request_id = tenant_uuid
```

O mesmo problema ocorre porque milhares de operações pertencem ao mesmo tenant.

### Gerar um novo ID em cada camada

```text
Controller → ID A
Service → ID B
Repository → ID C
```

Isso quebra a capacidade de correlacionar o fluxo completo.

### Colocar request ID em Metrics

Isso pode produzir cardinalidade excessiva.

### Confiar cegamente em IDs externos

Um identificador recebido do cliente não deve ser considerado automaticamente confiável.

### Acoplar o domínio ao HTTP

O domínio não deve depender diretamente de objetos ou APIs específicas do framework apenas para transportar informações de observabilidade.

---

## 33. Current State

A estratégia atual do Exactum utiliza principalmente `request_id` como mecanismo de correlação entre operações relacionadas.

O objetivo é conectar:

```text
HTTP Request
Infrastructure Logs
Audit Logs
Platform Events
Exception Handling
```

quando esses registros fazem parte da mesma execução.

O nível de correlação poderá evoluir conforme novos componentes e fluxos forem adicionados.

---

## 34. Future Evolution

Conforme a arquitetura do Exactum evoluir, a estratégia poderá incorporar:

- distributed tracing;
- OpenTelemetry;
- trace IDs;
- span IDs;
- correlation entre background jobs;
- propagação de contexto em mensagens;
- correlation entre serviços;
- observabilidade de Celery;
- observabilidade de RabbitMQ;
- integração com Prometheus e Grafana;
- armazenamento centralizado de logs.

Essas evoluções devem preservar o princípio fundamental:

> **Uma operação deve permanecer investigável através de todo o fluxo que ela desencadeou.**

---

## 35. Design Principles

A estratégia de Correlation do Exactum deve seguir os seguintes princípios:

1. **Cada execução deve possuir um identificador rastreável.**
2. **O mesmo correlation context deve ser preservado ao longo do fluxo.**
3. **Request ID não substitui User ID ou Tenant ID.**
4. **Correlation não substitui Authorization ou Tenant Isolation.**
5. **Logs, Audit Logs e Platform Events devem permanecer conceitualmente separados.**
6. **Correlation deve permitir investigação end-to-end.**
7. **Contexto de observabilidade não deve introduzir acoplamento desnecessário ao domínio.**
8. **Identificadores externos devem ser tratados com cautela.**
9. **Sensitive Data nunca deve ser incluída apenas para facilitar correlação.**
10. **Metrics devem evitar labels de alta cardinalidade como `request_id`.**
11. **A estratégia deve ser extensível para processamento assíncrono.**
12. **Distributed tracing deve ser introduzido conforme a necessidade arquitetural.**

---

## 36. Related Documentation

- [`Observability Overview`](./overview.md)
- [`Infrastructure Logging`](./infrastructure-logging.md)
- [`Platform Events`](./platform-events.md)
- [`Audit Logging`](./audit-logging.md)
- [`Authentication`](../security/authentication.md)
- [`Authorization`](../security/authorization.md)
- [`Session Management`](../security/session-management.md)
- [`Tenant Isolation`](../security/tenant-isolation.md)
- [`Domain Boundaries`](../architecture/domain-boundaries.md)
- [`Multi-Tenancy`](../architecture/multi-tenancy.md)

---

> **Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Da mesma forma, `request_id` é utilizado aqui como conceito de correlação, independentemente da forma específica como esse contexto é transportado ou armazenado na implementação.
>
> Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.
>
> A organização descrita também poderá evoluir conforme o sistema avance. Alguns conceitos ou responsabilidades atualmente agrupados em determinados domínios poderão posteriormente ser extraídos para contextos próprios, como parte da evolução arquitetural planejada. Portanto, este documento deve ser interpretado como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.
