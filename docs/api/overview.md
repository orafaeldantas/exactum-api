# API Overview

## 1. Objetivo

A API do Exactum é a principal interface de comunicação entre o frontend, clientes externos e os componentes responsáveis pela execução das regras de negócio da aplicação.

Ela expõe uma API HTTP baseada em **REST**, responsável por disponibilizar operações relacionadas aos recursos do sistema, autenticação, autorização, gestão de tenants e demais funcionalidades da plataforma.

A API também funciona como uma fronteira de segurança.

Clientes externos não devem acessar diretamente:

- PostgreSQL;
- Redis;
- repositories;
- application services;
- componentes internos da aplicação;
- recursos administrativos não expostos pela API.

Todo acesso deve passar pelas interfaces e mecanismos de controle definidos pelo backend.

---

## 2. Responsabilidades

A API é responsável por:

- receber requisições HTTP;
- validar o contexto da requisição;
- autenticar o usuário;
- estabelecer o tenant context;
- aplicar Authorization;
- validar dados de entrada;
- executar operações da aplicação;
- retornar respostas HTTP consistentes;
- tratar erros de maneira controlada;
- fornecer informações necessárias para observabilidade;
- manter a separação entre interface HTTP e regras internas da aplicação.

Conceitualmente:

```text
Client
   ↓
HTTP API
   ↓
Application
   ↓
Domain / Business Logic
   ↓
Persistence
```

A API não deve concentrar toda a lógica de negócio.

---

## 3. API as an Application Boundary

A API representa uma fronteira entre o ambiente externo e a aplicação.

```text
┌───────────────────────────────┐
│           Clients             │
│                               │
│ React / Browser / Integrations│
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           HTTP API            │
│                               │
│ Authentication               │
│ Authorization                │
│ Validation                   │
│ Serialization                │
│ Error Handling               │
│ Request Context               │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Application Layer       │
│                               │
│ Services / Use Cases          │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Domain / Persistence     │
└───────────────────────────────┘
```

Essa fronteira permite que detalhes externos sejam mantidos separados da implementação interna.

---

## 4. REST API

A API segue princípios de **REST** sempre que eles forem adequados ao recurso e à operação.

Os recursos são representados através de endpoints HTTP.

Exemplo conceitual:

```text
GET    /products
GET    /products/{uuid}
POST   /products
PATCH  /products/{uuid}
DELETE /products/{uuid}
```

O objetivo é manter uma interface previsível e consistente.

A API não deve criar endpoints arbitrariamente para cada método interno da aplicação.

A interface HTTP deve representar recursos e operações de negócio de forma compreensível para seus consumidores.

---

## 5. Resources

Os principais recursos da API correspondem aos conceitos expostos pela aplicação.

Exemplos:

```text
Authentication
Users
Tenants
Products
Sales
```

A lista de recursos pode evoluir conforme novos módulos sejam adicionados.

Um recurso exposto pela API não precisa necessariamente corresponder diretamente a uma entidade do banco de dados.

Por exemplo, uma resposta pode representar uma composição de múltiplas entidades ou dados calculados pela aplicação.

Isso permite que a API seja modelada de acordo com as necessidades dos consumidores, sem expor obrigatoriamente a estrutura interna do banco.

---

## 6. HTTP Methods

A API utiliza os métodos HTTP de acordo com a natureza da operação.

### GET

Utilizado para leitura de recursos.

```text
GET /products
GET /products/{uuid}
```

### POST

Utilizado principalmente para criação ou execução de operações que não possuem uma semântica adequada para atualização direta de um recurso.

```text
POST /products
```

### PATCH

Utilizado para alterações parciais.

```text
PATCH /products/{uuid}
```

### DELETE

Utilizado para remoção lógica ou física conforme a natureza do recurso e as regras da aplicação.

```text
DELETE /products/{uuid}
```

A semântica específica de cada endpoint deve ser definida de maneira consistente.

---

## 7. Resource Identifiers

A API utiliza identificadores públicos apropriados para exposição externa.

Quando aplicável, esses identificadores são representados por UUIDs.

Isso permite separar o identificador público utilizado pela API de detalhes internos da persistência.

Conceitualmente:

```text
API
    ↓
resource_uuid
    ↓
Application
    ↓
Persistence
    ↓
internal database identifier
```

A nomenclatura concreta pode variar conforme a implementação do recurso.

A utilização de identificadores públicos também reduz a exposição desnecessária de detalhes internos do banco.

---

## 8. Multi-Tenant API

O Exactum é uma aplicação **multi-tenant**.

Isso significa que a API deve executar cada operação dentro de um contexto de tenant apropriado.

Conceitualmente:

```text
Authenticated User
        ↓
Tenant Context
        ↓
Authorization
        ↓
Resource Access
```

O tenant context é estabelecido pelo backend e utilizado para restringir o acesso aos dados correspondentes.

Um cliente não deve conseguir alterar arbitrariamente o tenant da operação apenas fornecendo outro identificador na requisição.

A API deve sempre considerar o contexto autenticado e as regras de autorização.

---

## 9. Authentication

A API utiliza autenticação baseada em sessão JWT armazenada em **HttpOnly Cookies**.

O cliente não precisa manipular diretamente os tokens de autenticação.

Conceitualmente:

```text
Client
    ↓
Login
    ↓
Authentication
    ↓
HttpOnly Cookies
    ↓
Authenticated Requests
```

Os cookies são utilizados para transportar o contexto de autenticação entre o cliente e a API.

O frontend não deve depender da leitura ou decodificação dos JWTs para determinar a segurança da aplicação.

A autenticação e a validação dos tokens são responsabilidades do backend.

Detalhes específicos encontram-se em:

```text
docs/api/authentication.md
```

e:

```text
docs/security/authentication.md
```

---

## 10. Authorization

Authentication responde:

> Quem está realizando a requisição?

Authorization responde:

> Essa identidade pode realizar essa operação?

A API aplica Authorization antes de permitir operações protegidas.

O modelo utiliza roles e permissions para determinar o acesso aos recursos.

Conceitualmente:

```text
Request
    ↓
Authentication
    ↓
Identity
    ↓
Role / Permissions
    ↓
Authorization
    ↓
Operation
```

O frontend pode utilizar permissions para controlar a interface, mas não é considerado uma fronteira de segurança.

A autorização definitiva ocorre no backend.

---

## 11. Validation

A API deve validar dados recebidos antes que eles alcancem as camadas responsáveis pelas operações de negócio.

A validação pode incluir:

- campos obrigatórios;
- tipos;
- formatos;
- limites;
- valores permitidos;
- relacionamentos;
- regras específicas da entrada.

É importante diferenciar **input validation** de **business validation**.

### Input Validation

Verifica se a entrada possui uma estrutura válida.

Exemplo:

```text
minimum_stock
    → integer
    → non-negative
```

### Business Validation

Verifica se a operação é válida segundo as regras do negócio.

Exemplo:

```text
A sale cannot be completed if the required business conditions are not satisfied.
```

A segunda categoria pertence à lógica da aplicação/domínio e não deve ser transformada simplesmente em validação de schema.

---

## 12. Serialization and Deserialization

A API precisa transformar dados entre representações externas e internas.

### Request

```text
JSON
   ↓
Deserialization
   ↓
Application Input
```

### Response

```text
Application Result
   ↓
Serialization
   ↓
JSON
```

Schemas são utilizados para definir contratos de entrada e saída quando aplicável.

Isso ajuda a manter respostas previsíveis e reduz o acoplamento entre o formato HTTP e os objetos internos da aplicação.

---

## 13. API Contract

A API deve possuir contratos claros para seus endpoints.

Um contrato normalmente define:

```text
Method
Path
Authentication
Authorization
Request
Response
Status Codes
Errors
```

Por exemplo:

```text
PATCH /products/{uuid}

Authentication:
    Required

Authorization:
    product.update

Request:
    JSON body

Response:
    Updated Product

Possible status:
    200
    400
    401
    403
    404
    409
    422
```

A documentação OpenAPI/Swagger deve refletir o contrato disponibilizado pela aplicação.

---

## 14. Status Codes

A API utiliza HTTP status codes para representar o resultado da operação.

Exemplos comuns:

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error
```

A utilização exata deve considerar a natureza da operação.

Status codes devem possuir semântica consistente entre endpoints.

---

## 15. Error Handling

Erros da API devem possuir uma estrutura consistente.

O cliente deve receber informações suficientes para compreender o problema sem receber detalhes internos desnecessários.

Conceitualmente:

```text
Internal Exception
       ↓
Exception Handling
       ↓
Safe API Error
```

Por exemplo:

```json
{
  "code": "product_not_found",
  "message": "Product not found."
}
```

Detalhes como stack traces, SQL queries, secrets ou informações internas de infraestrutura não devem ser expostos ao cliente.

A estratégia detalhada está documentada em:

```text
docs/api/errors.md
```

---

## 16. Separation of Client Errors and Internal Errors

Um erro interno pode possuir muito mais informações do que aquilo que deve ser retornado ao cliente.

Por exemplo:

```text
Internal:

Database connection timeout
    ↓
Exception details
    ↓
Stack trace
```

A resposta pública pode ser:

```json
{
  "code": "internal_error",
  "message": "An unexpected error occurred."
}
```

O contexto técnico deve permanecer nos mecanismos de Observability.

Isso mantém a separação entre:

```text
Client Response
        ≠
Internal Diagnostic Information
```

---

## 17. API and Observability

A API participa diretamente da estratégia de Observability.

Uma requisição pode produzir:

```text
Request
   ↓
request_id
   ↓
Infrastructure Logs
   ↓
Application Operation
   ↓
Audit Log / Platform Event
   ↓
Response
```

Informações como:

- HTTP method;
- path;
- status code;
- duration;
- request ID;
- user context;
- tenant context;

podem ser utilizadas para observabilidade, respeitando as regras de minimização de dados.

O detalhamento encontra-se em:

```text
docs/observability/
```

---

## 18. Request Lifecycle

Um fluxo HTTP típico pode ser representado por:

```text
Client
    ↓
Nginx / Reverse Proxy
    ↓
Flask Application
    ↓
Request Context
    ↓
Authentication
    ↓
Authorization
    ↓
Validation
    ↓
Controller
    ↓
Application Service
    ↓
Repository
    ↓
Database / Redis
    ↓
Response
```

Nem toda requisição passa por exatamente todas as etapas, mas essa representação descreve o fluxo arquitetural geral.

---

## 19. Controllers

Controllers são responsáveis principalmente pela interação entre HTTP e a camada de aplicação.

Responsabilidades típicas:

- receber dados HTTP;
- acessar o contexto autenticado;
- validar ou receber dados já validados;
- chamar Application Services;
- transformar resultados em respostas HTTP;
- definir status codes apropriados.

Controllers não devem concentrar regras complexas de negócio.

Um controller deve funcionar como uma camada de adaptação:

```text
HTTP
 ↓
Controller
 ↓
Application
```

---

## 20. Application Services

Application Services coordenam casos de uso da aplicação.

Conceitualmente:

```text
Controller
    ↓
Application Service
    ↓
Domain / Repository / Other Services
```

Eles podem coordenar:

- regras de fluxo;
- transações;
- acesso a repositories;
- chamadas a componentes externos;
- autorização contextual quando apropriado;
- publicação de eventos.

A lógica de negócio deve permanecer organizada de maneira que não dependa desnecessariamente do framework HTTP.

---

## 21. Repositories

Repositories são responsáveis pela abstração do acesso à persistência.

Conceitualmente:

```text
Application
    ↓
Repository
    ↓
PostgreSQL
```

O repository pode encapsular operações como:

```text
find
find_by_uuid
create
update
delete
list
```

Os repositories também devem respeitar o tenant context quando trabalham com recursos tenant-scoped.

A API não deve acessar diretamente o banco de dados a partir do controller.

---

## 22. Database and Redis

A API utiliza diferentes mecanismos de persistência e infraestrutura.

### PostgreSQL

Responsável principalmente pelos dados persistentes da aplicação.

### Redis

Utilizado para funcionalidades que exigem armazenamento rápido ou estado temporário, como mecanismos relacionados a:

- sessões;
- refresh token state;
- revocation;
- caching;
- rate limiting;
- outros mecanismos operacionais.

Os detalhes de infraestrutura estão documentados em:

```text
docs/database/
docs/operations/
```

---

## 23. Security Boundary

A API deve ser tratada como uma **security boundary**.

Isso significa que nenhuma decisão de segurança pode depender exclusivamente do frontend.

Por exemplo:

```text
Frontend
    ↓
"User can edit product"
```

não é suficiente.

O backend deve verificar:

```text
Authentication
    ↓
Tenant
    ↓
Role / Permission
    ↓
Resource Access
    ↓
Operation
```

Mesmo que um usuário manipule diretamente uma requisição HTTP, o backend deve impedir operações não autorizadas.

---

## 24. Idempotency

Algumas operações podem exigir comportamento idempotente.

Por exemplo, determinadas requisições de atualização podem ser repetidas sem produzir efeitos adicionais inesperados.

Idempotency é especialmente importante em cenários como:

- retries;
- integrações externas;
- processamento assíncrono;
- operações sensíveis;
- comunicação sujeita a falhas de rede.

A necessidade de mecanismos explícitos de idempotency deve ser avaliada por endpoint.

Não se deve presumir que todas as operações da API possuem o mesmo comportamento.

---

## 25. Pagination

Endpoints que retornam coleções potencialmente grandes devem considerar paginação.

Em vez de:

```text
GET /products
```

retornar uma quantidade ilimitada de registros, a API pode utilizar parâmetros como:

```text
GET /products?page=1&page_size=20
```

A convenção exata deve ser definida em:

```text
docs/api/conventions.md
```

A paginação também deve considerar:

- limites máximos;
- ordenação;
- filtros;
- performance;
- consistência dos resultados.

---

## 26. Filtering and Sorting

Endpoints de coleção podem oferecer mecanismos de:

```text
Filtering
Sorting
Pagination
```

Exemplo conceitual:

```text
GET /products?
    search=keyboard
    &status=active
    &sort=name
    &page=1
    &page_size=20
```

Esses mecanismos devem possuir convenções consistentes.

Filtros fornecidos pelo cliente não devem permitir acesso fora do tenant context.

---

## 27. API and Transactions

Operações que alteram múltiplos recursos ou exigem consistência entre diferentes mudanças devem utilizar transações de maneira apropriada.

Exemplo conceitual:

```text
Request
    ↓
Application Service
    ↓
Transaction
    ├── Operation A
    ├── Operation B
    └── Audit / Event
    ↓
Commit
```

O controller não deve ser responsável por coordenar diretamente detalhes de transação quando essa responsabilidade pertence à camada de aplicação.

---

## 28. API and Concurrency

A API pode receber múltiplas requisições simultâneas para o mesmo recurso.

Operações que alteram estado devem considerar condições de concorrência.

Exemplos:

```text
Two users update the same product
```

ou:

```text
Two sales attempt to modify the same stock
```

A estratégia adequada depende do recurso e pode envolver:

- transações;
- locks;
- constraints;
- atomic operations;
- optimistic concurrency;
- outras estratégias específicas.

Essas decisões devem ser documentadas quando fizerem parte do comportamento da API.

---

## 29. Rate Limiting

Endpoints sensíveis ou sujeitos a abuso podem estar sujeitos a **Rate Limiting**.

Exemplos:

```text
Authentication
Password-related operations
Sensitive administrative endpoints
Public endpoints
```

O Rate Limiting pode utilizar Redis como infraestrutura.

Quando um limite for excedido, a API pode responder:

```text
429 Too Many Requests
```

A política detalhada deve permanecer alinhada com a estratégia de Security e Operations.

---

## 30. API Versioning

A API deve possuir uma estratégia explícita para evolução de contratos.

Mudanças incompatíveis não devem ser introduzidas de maneira silenciosa.

A estratégia de versionamento pode considerar:

```text
URL versioning
Header versioning
Media type versioning
```

A escolha utilizada pelo Exactum deve ser documentada especificamente em:

```text
docs/api/versioning.md
```

A versão da API não deve ser confundida com a versão da aplicação.

Por exemplo:

```text
Application:
    v0.3.x

API:
    version defined by API contract
```

Esses conceitos possuem ciclos de evolução diferentes.

---

## 31. Backward Compatibility

Quando consumidores dependem da API, mudanças de contrato devem considerar compatibilidade.

Mudanças potencialmente breaking incluem:

- remover campos;
- renomear campos;
- alterar tipos;
- modificar status codes;
- alterar semântica de endpoints;
- alterar autenticação;
- modificar formato de erros.

Mudanças compatíveis devem ser preferidas quando não houver necessidade de breaking change.

Quando uma alteração incompatível for necessária, ela deve possuir estratégia de versionamento ou migração.

---

## 32. Documentation

A API deve possuir documentação suficiente para que seus consumidores compreendam:

```text
Available Endpoints
Authentication
Authorization
Request Format
Response Format
Status Codes
Errors
Versioning
```

A documentação OpenAPI/Swagger funciona como uma representação formal do contrato HTTP.

Entretanto, a documentação OpenAPI não substitui a documentação arquitetural.

São responsabilidades diferentes:

```text
OpenAPI
    → Como consumir a API

Architecture Documentation
    → Como e por que a aplicação está organizada
```

---

## 33. Swagger / OpenAPI

O Exactum utiliza documentação baseada em OpenAPI/Swagger.

Essa documentação deve acompanhar a implementação dos endpoints.

Informações relevantes incluem:

- paths;
- HTTP methods;
- parameters;
- request bodies;
- response schemas;
- status codes;
- authentication requirements;
- descriptions.

Como a autenticação utiliza HttpOnly Cookies, a documentação deve deixar claro que o cliente não precisa enviar manualmente um Bearer token no header.

---

## 34. Frontend Integration

O frontend React é um consumidor da API, mas não possui privilégios especiais de segurança.

Conceitualmente:

```text
React
   ↓
HTTP Request
   ↓
Exactum API
   ↓
Authentication
   ↓
Authorization
   ↓
Application
```

O frontend pode:

- armazenar estado de interface;
- exibir recursos;
- enviar operações;
- refletir permissions;
- tratar respostas HTTP.

O frontend não pode:

- conceder permissions;
- alterar tenant context arbitrariamente;
- validar sozinho autorização;
- confiar em dados manipulados pelo cliente.

---

## 35. External Consumers

Embora o frontend seja atualmente um consumidor importante, a API deve manter uma separação suficiente para permitir futuros consumidores.

Possíveis consumidores futuros:

```text
Web Frontend
Mobile Application
External Integration
Internal Tool
Automation
Background Worker
```

Isso reforça a necessidade de manter contratos HTTP claros e independentes da implementação específica do frontend.

---

## 36. API Security Principles

A API deve seguir princípios como:

1. **Never trust the client**
2. **Authenticate protected operations**
3. **Authorize every protected operation**
4. **Enforce Tenant Isolation**
5. **Validate input**
6. **Minimize sensitive data exposure**
7. **Do not expose internal exceptions**
8. **Use secure authentication mechanisms**
9. **Keep secrets outside responses and logs**
10. **Apply rate limiting where appropriate**
11. **Maintain consistent error responses**
12. **Preserve observability context**

---

## 37. Current Architectural Position

A API atualmente funciona como a camada HTTP da aplicação e está organizada em torno de:

```text
Routes
    ↓
Controllers
    ↓
Application Services
    ↓
Repositories
    ↓
Persistence
```

Essa estrutura fornece uma separação clara entre o transporte HTTP, a coordenação das operações e o acesso aos dados.

Ao mesmo tempo, a arquitetura está em evolução.

O objetivo do processo de refatoração é fortalecer os limites entre domínios e reduzir gradualmente o acoplamento entre regras de negócio, framework e infraestrutura.

---

## 38. Future Evolution

A evolução planejada da API pode incluir:

- fortalecimento dos domain boundaries;
- maior separação entre Application e Domain;
- redução de framework coupling;
- evolução de DTOs e schemas;
- maior padronização de errors;
- mecanismos mais formais de idempotency;
- caching;
- processamento assíncrono;
- Celery;
- RabbitMQ;
- observabilidade mais avançada;
- métricas com Prometheus;
- dashboards com Grafana;
- novos consumidores, incluindo mobile.

Essas evoluções devem preservar a API como uma fronteira estável entre consumidores externos e a implementação interna da aplicação.

---

## 39. Design Principles

A API do Exactum deve seguir os seguintes princípios:

1. **A API é uma Application Boundary.**
2. **O backend é a Security Boundary.**
3. **Authentication e Authorization são responsabilidades do backend.**
4. **Tenant Isolation deve ser aplicada em toda operação tenant-scoped.**
5. **Controllers devem permanecer focados em HTTP.**
6. **Application Services devem coordenar casos de uso.**
7. **Repositories devem encapsular persistência.**
8. **Business Rules não devem depender diretamente do framework HTTP.**
9. **Contratos HTTP devem ser previsíveis.**
10. **Erros internos não devem ser expostos ao cliente.**
11. **Observability deve acompanhar o Request Lifecycle.**
12. **Identificadores públicos devem ser tratados de maneira consistente.**
13. **Mudanças breaking devem possuir estratégia explícita.**
14. **O frontend não deve ser considerado uma fronteira de segurança.**
15. **A API deve evoluir sem expor desnecessariamente detalhes internos da aplicação.**

---

## 40. Related Documentation

### API

- [`API Conventions`](./conventions.md)
- [`API Authentication`](./authentication.md)
- [`API Errors`](./errors.md)
- [`API Versioning`](./versioning.md)

### Architecture

- [`Architecture Overview`](../architecture/overview.md)
- [`Application Architecture`](../architecture/application-architecture.md)
- [`Domain Boundaries`](../architecture/domain-boundaries.md)
- [`Multi-Tenancy`](../architecture/multi-tenancy.md)

### Security

- [`Authentication`](../security/authentication.md)
- [`Authorization`](../security/authorization.md)
- [`Session Management`](../security/session-management.md)
- [`Tenant Isolation`](../security/tenant-isolation.md)
- [`Threat Model`](../security/threat-model.md)

### Observability

- [`Observability Overview`](../observability/overview.md)
- [`Infrastructure Logging`](../observability/infrastructure-logging.md)
- [`Platform Events`](../observability/platform-events.md)
- [`Audit Logging`](../observability/audit-logging.md)
- [`Correlation`](../observability/correlation.md)

---

> **Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Da mesma forma, conceitos como `resource`, `application service` ou `request context` representam responsabilidades arquiteturais e podem possuir nomes ou estruturas diferentes no código.
>
> Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.
>
> A organização descrita também poderá evoluir conforme o sistema avance. Alguns conceitos ou responsabilidades atualmente agrupados em determinados domínios poderão posteriormente ser extraídos para contextos próprios, como parte da evolução arquitetural planejada. Portanto, este documento deve ser interpretado como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.
