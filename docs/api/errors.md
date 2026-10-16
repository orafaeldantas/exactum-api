# API Errors

## 1. Objetivo

Este documento define as convenções para tratamento de erros na API do Exactum.

O objetivo é estabelecer um comportamento consistente para:

- identificação de erros;
- HTTP status codes;
- estrutura das respostas;
- códigos de erro;
- erros de validação;
- erros de autenticação;
- erros de autorização;
- erros de negócio;
- erros de persistência;
- erros inesperados;
- tratamento de exceções;
- exposição de informações ao cliente;
- logging e observabilidade;
- integração com o frontend.

O tratamento de erros faz parte do contrato público da API.

O cliente deve conseguir identificar programaticamente o resultado de uma operação sem depender exclusivamente de mensagens textuais.

> **Estado atual vs. contrato planejado**
>
> A API **ainda não** retorna códigos de erro semânticos (`code`). O formato efetivamente retornado hoje está descrito na [seção 5.1](#51-formato-atual). Os exemplos com `{"error": {"code": ..., "message": ...}}` ao longo deste documento representam o **contrato planejado** e não devem ser utilizados pelo frontend até que sejam implementados.

---

# 2. Error Handling Principles

O tratamento de erros da API segue alguns princípios:

- erros devem possuir estrutura previsível;
- HTTP status codes devem representar corretamente o resultado;
- erros internos não devem ser expostos desnecessariamente;
- mensagens destinadas ao cliente devem ser seguras;
- códigos de erro devem ser estáveis quando utilizados pelo frontend;
- erros de validação devem fornecer informações úteis;
- exceções inesperadas devem ser registradas;
- respostas de erro não devem expor secrets;
- detalhes internos devem permanecer nos logs;
- o backend é responsável pela decisão final sobre o erro.

A API deve separar:

```text
Erro interno
    │
    ├── logging / observability
    │
    └── resposta segura ao cliente
```

O consumidor da API não precisa conhecer a implementação interna que produziu determinado erro.

---

# 3. Error Categories

Os erros podem ser classificados conceitualmente em diferentes categorias:

```text
API Errors
├── Request / Validation Errors
├── Authentication Errors
├── Authorization Errors
├── Resource Errors
├── Business Errors
├── Conflict Errors
├── Rate Limit Errors
└── Internal Errors
```

Essa classificação ajuda a manter comportamento consistente entre endpoints.

---

# 4. HTTP Status Codes

A API utiliza HTTP status codes como primeira camada de identificação do resultado.

| Status | Categoria             | Uso                                              |
| ------ | --------------------- | ------------------------------------------------ |
| `400`  | Bad Request           | Requisição inválida                              |
| `401`  | Unauthorized          | Autenticação ausente ou inválida                 |
| `403`  | Forbidden             | Usuário autenticado sem autorização              |
| `404`  | Not Found             | Recurso não encontrado                           |
| `409`  | Conflict              | Conflito com o estado atual                      |
| `422`  | Unprocessable Entity  | Dados semanticamente inválidos, quando aplicável |
| `429`  | Too Many Requests     | Rate limit excedido                              |
| `500`  | Internal Server Error | Erro interno inesperado                          |

Outros status codes podem ser utilizados quando houver uma necessidade específica do contrato.

---

# 5. Error Response Structure

## 5.1 Formato atual

Atualmente a API produz **três formatos** de resposta de erro, dependendo de onde o erro é tratado.

**a) Exceções da aplicação (`AppException`)** — erros de domínio, autenticação de negócio e autorização (`app/exceptions/handlers.py`):

```json
{
  "error": "Product not found"
}
```

O status HTTP vem do atributo `status_code` da exceção (ex.: `ProductNotFound` → `404`, `ForbiddenException` → `403`, `InvalidCredentials` → `401`). Exceções marcadas com `clear_auth_cookies` também removem os cookies de autenticação.

**b) Erros HTTP e de validação (flask-smorest / webargs)** — payload inválido, rota inexistente, método não permitido:

```json
{
  "code": 422,
  "status": "Unprocessable Entity",
  "errors": {
    "json": {
      "email": ["Missing data for required field."]
    }
  }
}
```

**c) Erros de JWT (`app/exceptions/jwt_handlers.py`):**

| Situação                | Status | Corpo                                  | Cookies removidos |
| ----------------------- | ------ | -------------------------------------- | ----------------- |
| Token ausente           | `401`  | `{"error": "missing_token"}`           | Não               |
| Access token expirado   | `401`  | `{"error": "access_token_expired"}`    | Não               |
| Refresh token expirado  | `401`  | `{"error": "refresh_token_expired"}`   | Sim               |
| Token inválido          | `422`  | `{"error": "invalid_token"}`           | Sim               |
| Token revogado          | `401`  | `{"error": "revoked"}`                 | Sim               |

O frontend (`frontend/src/services/api.js`) dispara o fluxo de refresh para qualquer resposta `401` fora das rotas de login, logout e refresh, independentemente do corpo.

**d) Erros inesperados** — qualquer exceção não tratada que não seja `HTTPException`:

```json
{
  "error": "Internal server error"
}
```

com status `500`. O traceback é registrado no log; nenhum detalhe interno é exposto ao cliente.

> As respostas de erro **não** incluem `request_id` atualmente. A correlação é feita pelos logs.

## 5.2 Contrato planejado

O objetivo é unificar os formatos acima em uma estrutura única:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

O objeto `error` representa o erro retornado pela API.

Os campos principais são:

```text
code
message
```

Quando necessário, podem existir campos adicionais.

Essa unificação é uma mudança de contrato e deve ser coordenada com o frontend (ver [`docs/api/versioning.md`](./versioning.md)).

---

# 6. Error Code

O campo `code` identifica semanticamente o erro.

Exemplo:

```text
PRODUCT_NOT_FOUND
```

O código deve ser preferencialmente estável e independente da linguagem humana utilizada na mensagem.

Isso permite que o frontend tome decisões baseadas no código.

Exemplo:

```text
if error.code == "PRODUCT_NOT_FOUND":
    ...
```

A aplicação cliente não deve depender de:

```text
if error.message == "Product not found.":
    ...
```

porque mensagens podem ser alteradas, traduzidas ou aprimoradas sem necessariamente alterar a semântica do erro.

---

# 7. Error Message

O campo `message` fornece uma descrição legível do erro.

Exemplo:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

A mensagem deve ser:

- clara;
- curta;
- segura;
- adequada ao consumidor;
- livre de informações internas desnecessárias.

Mensagens não devem conter:

- stack traces;
- SQL;
- caminhos internos do servidor;
- nomes de secrets;
- tokens;
- credenciais;
- detalhes de infraestrutura.

---

# 8. Validation Errors

Erros de validação ocorrem quando os dados fornecidos pelo cliente não respeitam o formato ou as restrições esperadas pela API.

Exemplo:

```http
POST /products
```

```json
{
  "name": "",
  "price": -10
}
```

A API pode retornar:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "name": ["Field is required."],
      "price": ["Must be greater than zero."]
    }
  }
}
```

A estrutura de `details` deve permitir ao frontend associar erros aos campos correspondentes.

---

# 9. Validation Error Details

Quando um erro possui múltiplos problemas, cada campo pode possuir sua própria lista de mensagens.

Exemplo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "name": ["Field is required."],
      "price": ["Must be greater than zero."],
      "minimum_stock": ["Must be an integer."]
    }
  }
}
```

A API deve evitar estruturas excessivamente específicas que dificultem a reutilização do tratamento de erros no frontend.

---

# 10. Authentication Errors

Erros de autenticação indicam que a API não conseguiu estabelecer uma identidade autenticada válida.

Exemplos:

- access token ausente;
- access token inválido;
- access token expirado;
- refresh token inválido;
- sessão revogada;
- usuário bloqueado.

Exemplo:

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required."
  }
}
```

Normalmente esses erros resultam em:

```http
401 Unauthorized
```

A API não deve expor informações desnecessárias sobre o motivo interno da falha.

---

# 11. Authorization Errors

Quando o usuário está autenticado, mas não possui autorização para realizar uma operação, a API deve utilizar:

```http
403 Forbidden
```

Exemplo:

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this action."
  }
}
```

Authentication e Authorization não devem ser confundidas.

```text
401
→ identidade não foi autenticada corretamente

403
→ identidade conhecida, mas operação não autorizada
```

A decisão de autorização pertence ao backend.

---

# 12. Resource Not Found

Quando um recurso solicitado não existe ou não pode ser retornado dentro do contexto autorizado, a API pode utilizar:

```http
404 Not Found
```

Exemplo:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

Em uma arquitetura multi-tenant, a resposta também deve evitar revelar informações sobre recursos pertencentes a outros tenants.

O comportamento deve preservar o tenant isolation.

---

# 13. Resource Conflicts

Conflitos ocorrem quando a operação é válida em termos estruturais, mas entra em conflito com o estado atual do sistema.

Exemplo:

```text
409 Conflict
```

Possíveis situações:

- criação de recurso que viola uma unicidade;
- alteração incompatível com o estado atual;
- operação concorrente incompatível;
- transição de estado inválida.

Exemplo:

```json
{
  "error": {
    "code": "PRODUCT_ALREADY_EXISTS",
    "message": "A product with these attributes already exists."
  }
}
```

---

# 14. Business Errors

Business Errors representam violações de regras do domínio ou da aplicação.

Exemplos conceituais:

```text
INSUFFICIENT_STOCK
SALE_ALREADY_COMPLETED
INVALID_SALE_STATE
INVALID_PRODUCT_STATE
```

Esses erros não representam necessariamente problemas técnicos.

A aplicação pode estar funcionando corretamente e ainda assim rejeitar uma operação porque ela não é permitida pelas regras do domínio.

---

# 15. Business Error vs Validation Error

Esses conceitos não devem ser confundidos.

### Validation Error

A entrada não possui o formato ou estrutura esperada.

Exemplo:

```json
{
  "price": "abc"
}
```

### Business Error

A entrada possui formato válido, mas a operação não é permitida pelas regras do sistema.

Exemplo:

```text
Tentativa de realizar uma venda sem estoque suficiente.
```

Conceitualmente:

```text
Request
   │
   ▼
Input Validation
   │
   ▼
Business Rules
```

Uma requisição pode passar pela validação estrutural e posteriormente ser rejeitada por uma regra de negócio.

---

# 16. Rate Limit Errors

Quando uma requisição excede o limite estabelecido pela API:

```http
429 Too Many Requests
```

A resposta pode conter informações que permitam ao cliente compreender a situação.

Exemplo:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests."
  }
}
```

Quando aplicável, headers HTTP podem fornecer informações adicionais sobre retry ou limites.

Rate limiting possui documentação operacional própria e integra-se à observabilidade da aplicação.

---

# 17. Internal Errors

Erros inesperados devem resultar em uma resposta genérica ao cliente.

Exemplo:

```http
500 Internal Server Error
```

Resposta:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

O cliente não deve receber detalhes internos da exceção.

Por exemplo, não retornar:

```text
Traceback...
SQLAlchemyError...
PostgreSQL connection failed...
/app/services/...
```

Essas informações pertencem aos logs internos.

---

# 18. Exception Handling

Exceções devem ser tratadas em uma camada centralizada sempre que possível.

Conceitualmente:

```text
Application
     │
     │ exception
     ▼
Exception Handling
     │
     ├── known application error
     │       │
     │       └── structured response
     │
     └── unexpected exception
             │
             ├── log
             └── generic response
```

Isso evita que cada endpoint implemente manualmente sua própria lógica de tratamento de exceções.

---

# 19. Known vs Unexpected Errors

Uma distinção importante é entre erros conhecidos e exceções inesperadas.

### Known Error

A aplicação sabe que aquela condição pode ocorrer e possui um comportamento definido.

Exemplo:

```text
PRODUCT_NOT_FOUND
PERMISSION_DENIED
INSUFFICIENT_STOCK
```

### Unexpected Error

A aplicação encontrou uma condição que não deveria ocorrer normalmente.

Exemplos:

- bug;
- falha inesperada de infraestrutura;
- exceção não tratada;
- estado inconsistente.

Known Errors podem possuir mensagens e códigos específicos.

Unexpected Errors devem ser tratados de maneira genérica para o cliente.

---

# 20. Application Exceptions

A aplicação pode utilizar exceções específicas para representar erros conhecidos.

Conceitualmente:

```python
raise ProductNotFoundError(...)
```

ou:

```python
raise PermissionDeniedError(...)
```

Essas exceções podem ser convertidas pela camada HTTP em respostas estruturadas.

O objetivo é evitar que Application Services precisem conhecer detalhes da resposta HTTP.

---

# 21. Framework Independence

Application Services e regras de negócio não devem depender diretamente de objetos de resposta HTTP.

Evita-se:

```python
return jsonify(...)
```

dentro da lógica de aplicação.

Preferencialmente:

```text
Application
   │
   └── raises domain/application error
                │
                ▼
           HTTP boundary
                │
                └── JSON response
```

Essa separação reduz o acoplamento entre domínio, aplicação e Flask.

---

# 22. Error Mapping

Erros internos devem possuir um mapeamento claro para HTTP.

Exemplo conceitual:

| Application Error        |  HTTP |
| ------------------------ | ----: |
| `AuthenticationRequired` | `401` |
| `PermissionDenied`       | `403` |
| `ResourceNotFound`       | `404` |
| `ResourceConflict`       | `409` |
| `ValidationError`        | `422` |
| `RateLimitExceeded`      | `429` |
| `UnexpectedException`    | `500` |

O mapeamento exato pode variar de acordo com o contexto da operação.

A regra principal é que a camada HTTP seja responsável por traduzir o erro de aplicação em uma representação HTTP apropriada.

---

# 23. Error Codes Naming

Os códigos de erro devem utilizar nomes descritivos e consistentes.

Uma convenção baseada em `UPPER_SNAKE_CASE` pode ser utilizada.

Exemplos:

```text
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
PERMISSION_DENIED
PRODUCT_NOT_FOUND
PRODUCT_ALREADY_EXISTS
VALIDATION_ERROR
RATE_LIMIT_EXCEEDED
INTERNAL_ERROR
```

Os códigos devem representar a condição sem incluir detalhes temporários ou específicos da implementação.

---

# 24. Error Code Stability

Uma vez utilizado como parte do contrato público, um error code deve ser tratado como uma interface.

Alterar:

```text
PRODUCT_NOT_FOUND
```

para:

```text
PRODUCT_DOES_NOT_EXIST
```

pode quebrar consumidores que dependam do código.

Por isso, mudanças de nomenclatura devem ser tratadas com cuidado.

A mensagem pode evoluir independentemente do código quando a semântica permanecer a mesma.

---

# 25. Sensitive Information

Respostas de erro nunca devem expor informações sensíveis.

Não devem ser retornados:

- passwords;
- JWTs;
- refresh tokens;
- cookies;
- API keys;
- secrets;
- stack traces;
- SQL statements;
- connection strings;
- filesystem paths internos;
- informações de outros tenants;
- credenciais de serviços externos.

O princípio deve ser:

> retornar ao cliente somente a informação necessária para compreender e tratar o erro.

---

# 26. Tenant Isolation and Errors

Em uma arquitetura multi-tenant, erros também precisam respeitar tenant isolation.

Por exemplo, uma requisição:

```http
GET /products/{uuid}
```

não deve permitir que um usuário descubra detalhes de um produto pertencente a outro tenant.

A resposta deve respeitar o contexto autorizado da requisição.

O tratamento de `404` e outros erros relacionados a recursos deve ser analisado em conjunto com:

- Authentication;
- Authorization;
- Tenant Isolation;
- Repository filtering.

---

# 27. Error Logging

Erros relevantes devem ser registrados de forma apropriada nos logs.

Para erros inesperados, o log pode incluir:

```text
timestamp
level
event
request_id
user_uuid
tenant_uuid
method
path
status_code
exception_type
error_code
```

Quando necessário, também podem ser registrados detalhes técnicos adicionais.

Entretanto, informações sensíveis devem ser removidas ou sanitizadas.

---

# 28. Client Error vs Internal Log

Uma mesma falha pode possuir duas representações diferentes.

Exemplo:

```text
Internal Exception
      │
      ├── Internal Log
      │      ├── stack trace
      │      ├── exception type
      │      ├── request_id
      │      └── technical context
      │
      └── HTTP Response
             ├── status
             ├── error code
             └── safe message
```

Isso permite que desenvolvedores investiguem o problema sem expor informações internas ao cliente.

---

# 29. Correlation ID

Erros devem ser correlacionáveis com o request que os originou.

O `request_id` permite conectar:

```text
HTTP Response
      │
      ├── Infrastructure Log
      │
      ├── Application Log
      │
      └── Audit / Platform Event
```

Isso é especialmente importante para erros `500`, problemas de autenticação, operações administrativas e falhas relacionadas a múltiplas camadas.

Mais detalhes em:

`docs/observability/correlation.md`

---

# 30. Error Responses and Frontend

O frontend deve tratar erros principalmente por:

1. HTTP status code;
2. error code;
3. detalhes estruturados, quando disponíveis.

A mensagem pode ser utilizada para apresentação ao usuário quando apropriado.

Exemplo conceitual:

```text
HTTP 409
     │
     ▼
PRODUCT_ALREADY_EXISTS
     │
     ▼
Frontend
     │
     └── display appropriate feedback
```

Isso evita que a lógica do frontend fique acoplada a mensagens textuais do backend.

---

# 31. Error Responses and Localization

As mensagens retornadas pela API podem futuramente precisar suportar diferentes idiomas.

Por isso, o `error.code` deve permanecer independente da linguagem.

Exemplo:

```text
PRODUCT_NOT_FOUND
```

pode ser representado como:

```text
Product not found.
```

ou:

```text
Produto não encontrado.
```

sem alterar a identidade semântica do erro.

A estratégia definitiva de localization pode ser definida posteriormente.

---

# 32. Error Handling and Transactions

Operações que envolvem múltiplas alterações devem considerar o comportamento transacional.

Exemplo conceitual:

```text
Create Sale
   │
   ├── create sale
   ├── update stock
   ├── create items
   │
   └── error
        │
        ▼
     rollback
```

Um erro durante uma operação transacional não deve deixar o banco em um estado parcialmente atualizado quando a operação exigir atomicidade.

A responsabilidade transacional pertence à camada apropriada da aplicação e persistência.

---

# 33. Concurrency Errors

Operações concorrentes podem gerar conflitos.

Exemplos:

- dois usuários tentando modificar o mesmo recurso;
- duas vendas tentando consumir o mesmo estoque;
- atualização baseada em estado desatualizado;
- tentativa de executar uma transição já realizada.

Esses casos podem ser representados por erros de conflito quando apropriado.

A API deve evitar simplesmente retornar `500` para uma condição de concorrência conhecida.

---

# 34. Error Handling and Retries

Nem todo erro deve ser automaticamente repetido pelo cliente.

Uma distinção importante:

```text
4xx
→ normalmente requer correção da requisição ou do estado

5xx
→ pode representar falha temporária ou inesperada
```

Mesmo assim, retries devem ser aplicados com cuidado.

Operações de escrita não idempotentes podem gerar efeitos duplicados quando repetidas automaticamente.

Por isso, mecanismos como **Idempotency Keys** podem ser relevantes para futuras operações críticas.

---

# 35. Error Handling and Observability

O tratamento de erros faz parte da estratégia geral de observabilidade.

Um erro pode produzir diferentes registros:

```text
Request
  │
  ├── Infrastructure Log
  │
  ├── Exception Log
  │
  ├── Platform Event
  │
  └── Audit Log
```

Entretanto, esses registros não devem ser gerados indiscriminadamente.

Cada tipo de observabilidade possui uma finalidade diferente.

A aplicação deve evitar duplicação excessiva de logs e eventos.

---

# 36. Avoiding Duplicate Logging

Um erro conhecido não deve necessariamente ser registrado como `ERROR` em todas as camadas.

Por exemplo:

```text
Repository
   │
   └── raises ResourceNotFound

Application
   │
   └── propagates

HTTP Boundary
   │
   └── returns 404
```

Não é necessário que cada camada registre a mesma exceção como erro.

Erros inesperados devem possuir um ponto apropriado de logging com contexto suficiente para investigação.

---

# 37. Error Handling and Security

O tratamento de erros também faz parte da security architecture.

Mensagens muito detalhadas podem permitir:

- enumeração de usuários;
- descoberta de recursos;
- exposição de infraestrutura;
- identificação de componentes internos;
- vazamento de informações de banco;
- descoberta de configuração.

Por isso, a API deve equilibrar:

```text
Useful Error Information
        +
Security
```

O objetivo não é esconder todos os erros, mas fornecer somente a informação necessária ao consumidor.

---

# 38. Testing Error Responses

As respostas de erro devem possuir testes automatizados.

Testes devem verificar:

### Validation

- campos obrigatórios;
- tipos inválidos;
- valores inválidos;
- múltiplos erros.

### Authentication

- token ausente;
- token inválido;
- sessão revogada.

### Authorization

- permission denied;
- role inadequada.

### Resources

- resource not found;
- duplicate resource.

### Business Rules

- invalid state;
- insufficient stock;
- invalid operation.

### Infrastructure

- unexpected exception;
- database failure;
- Redis failure.

### Contract

- status code;
- error code;
- response structure;
- absence of sensitive data.

---

# 39. OpenAPI and Errors

O contrato OpenAPI deve documentar respostas de erro relevantes.

Exemplo conceitual:

```text
POST /products

201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Quando aplicável, os schemas das respostas devem representar a estrutura definida neste documento.

Isso permite que consumidores compreendam o contrato antes de executar as operações.

---

# 40. Error Response Example

Um erro completo pode ser representado conceitualmente como:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {
      "price": ["Must be greater than zero."]
    }
  }
}
```

Enquanto um erro inesperado pode utilizar:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

A diferença é intencional:

- o primeiro fornece detalhes úteis para correção;
- o segundo protege informações internas.

---

# 41. Current State

Atualmente:

- exceções de domínio herdam de `AppException` e são convertidas em `{"error": "<mensagem>"}` com o status definido na exceção;
- erros de validação e erros HTTP seguem o formato padrão do flask-smorest (`code`, `status`, `errors`);
- erros de JWT possuem handlers próprios com identificadores textuais (`missing_token`, `access_token_expired`, etc.);
- exceções inesperadas retornam `500` com mensagem genérica e são registradas com traceback;
- ainda não existem códigos de erro semânticos estáveis (`PRODUCT_NOT_FOUND`, etc.);
- respostas de erro não incluem `request_id`;
- rate limiting (`429`) é aplicado apenas pelo Nginx em `/api/`, e a resposta é gerada pelo Nginx, não pela API.

A seção 5.1 descreve os formatos atuais em detalhe.

---

# 42. Future Evolution

A estratégia de erros poderá evoluir com:

- catálogo centralizado de error codes;
- schemas de erro mais padronizados;
- documentação OpenAPI mais completa;
- localization;
- suporte a `trace_id`;
- integração com distributed tracing;
- mecanismos avançados de retry;
- Idempotency Keys;
- optimistic concurrency;
- erros específicos para novos bounded contexts;
- melhoria das ferramentas de investigação operacional.

Essas evoluções devem preservar a compatibilidade e a previsibilidade do contrato público.

---

# 43. Design Principles

As principais diretrizes são:

1. **Consistência**
   Erros semelhantes devem possuir comportamento semelhante.

2. **Previsibilidade**
   Consumidores devem conseguir interpretar erros programaticamente.

3. **Segurança**
   Informações internas e sensíveis não devem ser expostas.

4. **Observabilidade**
   Erros relevantes devem ser investigáveis.

5. **Separação de responsabilidades**
   Application Services não devem depender da estrutura HTTP.

6. **Estabilidade**
   Error codes públicos devem ser tratados como parte do contrato.

7. **Clareza**
   Mensagens devem ser objetivas e compreensíveis.

8. **Evolutividade**
   O contrato deve permitir novas categorias de erro sem comprometer consumidores existentes.

---

# 44. Related Documentation

- `docs/api/overview.md`
- `docs/api/conventions.md`
- `docs/api/authentication.md`
- `docs/api/versioning.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/correlation.md`
- `docs/testing/strategy.md`

---

## Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo:

```text
resource
    → conceito arquitetural de um recurso exposto pela API

resource_uuid
    → representação concreta do identificador público

application error
    → conceito de uma condição conhecida da aplicação

exception class
    → representação concreta dessa condição na implementação
```

Essa distinção permite que a documentação represente responsabilidades arquiteturais sem limitar os conceitos à implementação atual.

Da mesma forma, algumas estratégias descritas como evolução futura podem ainda não estar implementadas em sua forma definitiva.

Este documento deve ser interpretado como uma representação do **modelo atual de tratamento de erros da API e de sua direção de evolução**, e não como uma descrição imutável da implementação futura.
