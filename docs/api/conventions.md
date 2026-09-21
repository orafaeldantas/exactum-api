# API Conventions

## 1. Objetivo

Este documento define as principais convenções utilizadas pela API do Exactum.

O objetivo é estabelecer padrões consistentes para:

- estrutura das requisições;
- estrutura das respostas;
- identificação de recursos;
- nomenclatura de endpoints;
- métodos HTTP;
- status codes;
- validação de entrada;
- paginação;
- filtros e ordenação;
- autenticação e contexto;
- tratamento de erros;
- operações de escrita;
- compatibilidade entre versões.

Essas convenções reduzem inconsistências entre endpoints e tornam a API mais previsível para seus consumidores.

A documentação representa o modelo arquitetural atual do Exactum e sua direção de evolução. Alguns padrões descritos podem ser consolidados ou refinados conforme novos recursos e domínios sejam implementados.

---

## 2. Princípios

A API segue alguns princípios gerais:

- utilização de HTTP como protocolo de comunicação;
- orientação a recursos;
- uso semântico dos métodos HTTP;
- respostas JSON;
- identificadores públicos baseados em UUID;
- validação explícita das entradas;
- autenticação baseada em cookies HttpOnly;
- autorização realizada no backend;
- isolamento por tenant;
- respostas de erro estruturadas;
- contratos explícitos entre frontend e backend;
- consistência de nomenclatura;
- separação entre camada HTTP e lógica de aplicação.

A API deve evitar comportamentos implícitos que dificultem a compreensão do contrato ou tornem diferentes endpoints inconsistentes entre si.

---

# 3. Estrutura dos Endpoints

Os endpoints devem representar recursos ou operações claramente relacionadas a recursos.

Exemplos conceituais:

```text
GET    /products
GET    /products/{uuid}
POST   /products
PATCH  /products/{uuid}
DELETE /products/{uuid}
```

Para recursos relacionados:

```text
GET /products/{uuid}/stock
GET /sales/{uuid}/items
```

A nomenclatura deve preferencialmente utilizar substantivos para representar recursos.

Evita-se utilizar verbos diretamente na URL quando o comportamento puder ser representado semanticamente pelo método HTTP.

Por exemplo:

```text
POST /products
```

é preferível a:

```text
POST /create-product
```

Da mesma forma:

```text
DELETE /products/{uuid}
```

é preferível a:

```text
POST /delete-product
```

Quando uma operação não puder ser representada adequadamente como CRUD de um recurso, uma operação explícita pode ser utilizada.

Exemplo conceitual:

```text
POST /users/{uuid}/impersonate
```

Nesse caso, a URL representa uma operação específica sobre o contexto do recurso.

---

# 4. Métodos HTTP

A API utiliza os métodos HTTP de acordo com a intenção da operação.

| Método   | Finalidade                                            |
| -------- | ----------------------------------------------------- |
| `GET`    | Recuperar recursos                                    |
| `POST`   | Criar recursos ou executar operações                  |
| `PUT`    | Substituição completa de um recurso, quando aplicável |
| `PATCH`  | Atualização parcial                                   |
| `DELETE` | Remoção ou solicitação de remoção                     |

## 4.1 GET

Utilizado para leitura de recursos.

Exemplo:

```http
GET /products
```

ou:

```http
GET /products/{uuid}
```

Operações `GET` não devem produzir efeitos colaterais relevantes no estado da aplicação.

---

## 4.2 POST

Utilizado principalmente para:

- criação de recursos;
- operações que produzem efeitos no sistema;
- ações que não possuem uma representação CRUD adequada.

Exemplo:

```http
POST /products
```

ou:

```http
POST /auth/login
```

---

## 4.3 PATCH

Utilizado para atualizações parciais.

Exemplo:

```http
PATCH /products/{uuid}
```

Uma requisição pode alterar somente os campos fornecidos.

Exemplo conceitual:

```json
{
  "minimum_stock": 10
}
```

---

## 4.4 PUT

`PUT` representa uma substituição completa do recurso quando esse comportamento fizer sentido para o domínio.

O uso de `PUT` deve ser evitado quando uma atualização parcial for semanticamente mais adequada.

---

## 4.5 DELETE

`DELETE` representa a remoção de um recurso.

No Exactum, entretanto, alguns recursos podem utilizar **Soft Delete**.

Nesse caso, a operação representa a remoção lógica do recurso, sem necessariamente excluir fisicamente seus dados do banco de dados.

A implementação dessa estratégia é detalhada em:

`docs/database/soft-delete.md`

---

# 5. Identificadores Públicos

Os recursos expostos pela API utilizam identificadores públicos baseados em UUID.

Exemplo:

```http
GET /products/0198c9e0-7f2a-7xxx-xxxx-xxxxxxxxxxxx
```

O identificador público não precisa necessariamente corresponder ao identificador utilizado internamente pelo banco de dados.

Essa separação permite que a implementação interna evolua sem expor diretamente detalhes da persistência.

Conceitualmente:

```text
API
  │
  │ public UUID
  ▼
Application
  │
  │ internal identifier
  ▼
Persistence
```

A documentação utiliza termos conceituais como `resource`, `tenant` e `actor` quando isso facilita a representação arquitetural.

Esses conceitos podem possuir uma representação diferente na implementação.

Por exemplo:

- `resource` → `product_uuid`, `sale_uuid`, etc.;
- `tenant` → `tenant_uuid`;
- `actor` → atualmente representado por `user_uuid`.

Essa distinção permite que a documentação represente responsabilidades arquiteturais sem ficar excessivamente acoplada aos nomes internos da implementação.

---

# 6. Request Body

Operações que recebem dados devem utilizar JSON quando apropriado.

Exemplo:

```http
POST /products
Content-Type: application/json
```

```json
{
  "name": "Produto exemplo",
  "price": 29.9,
  "minimum_stock": 10
}
```

O backend deve validar:

- presença de campos obrigatórios;
- tipos;
- formatos;
- limites;
- valores permitidos;
- regras específicas de entrada.

A validação estrutural não substitui a validação de negócio.

Por exemplo, verificar se:

```json
{
  "price": 29.9
}
```

possui um número válido é uma preocupação de validação de entrada.

Verificar se uma determinada operação pode alterar o preço de um produto é uma preocupação de autorização ou regra de negócio.

---

# 7. Query Parameters

Query parameters devem ser utilizados para modificar a forma como uma coleção é consultada sem alterar o recurso em si.

Exemplos:

```http
GET /products?page=1
```

```http
GET /products?search=mouse
```

```http
GET /products?sort=created_at
```

```http
GET /products?status=active
```

Os parâmetros devem possuir nomes claros e comportamento consistente entre endpoints equivalentes.

---

# 8. Paginação

Coleções potencialmente grandes devem suportar paginação.

Exemplo:

```http
GET /products?page=1&per_page=20
```

Uma resposta paginada pode possuir uma estrutura semelhante a:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  }
}
```

A estrutura exata deve permanecer consistente entre endpoints que utilizem o mesmo padrão.

A paginação também deve considerar:

- limite máximo de itens por página;
- ordenação determinística;
- comportamento quando a página solicitada não existe;
- custo da consulta;
- impacto no banco de dados.

O padrão pode ser refinado conforme a API evoluir.

---

# 9. Filtering

Filtros devem ser expressos por query parameters.

Exemplo:

```http
GET /products?status=active
```

Ou:

```http
GET /products?minimum_stock=true
```

Filtros devem possuir semântica clara e não devem produzir comportamentos inesperados.

Quando múltiplos filtros são utilizados:

```http
GET /products?status=active&category=electronics
```

a API deve definir claramente como esses filtros são combinados.

Em geral, filtros representam uma operação lógica conjunta.

---

# 10. Sorting

A ordenação deve ser explicitamente indicada quando suportada pelo endpoint.

Exemplo:

```http
GET /products?sort=name
```

Uma convenção pode permitir a indicação da direção:

```http
GET /products?sort=-created_at
```

onde:

```text
created_at  → ascending
-created_at → descending
```

O conjunto de campos permitidos para ordenação deve ser controlado pelo backend.

A API não deve aceitar arbitrariamente nomes de colunas fornecidos pelo cliente para construir consultas.

Isso evita comportamento inesperado e reduz riscos relacionados à construção dinâmica de queries.

---

# 11. Response Body

As respostas devem utilizar JSON para representar os dados retornados pela API.

Exemplo:

```json
{
  "uuid": "0198c9e0-7f2a-7xxx-xxxx-xxxxxxxxxxxx",
  "name": "Produto exemplo",
  "price": 29.9,
  "minimum_stock": 10
}
```

Os nomes dos campos devem seguir uma convenção consistente.

O contrato público deve evitar expor diretamente estruturas internas do banco de dados ou objetos de persistência.

A resposta deve representar aquilo que o consumidor da API precisa conhecer, e não necessariamente a estrutura interna utilizada pelo backend.

---

# 12. Resource Representation

Um recurso pode possuir diferentes representações dependendo do endpoint.

Por exemplo, uma listagem pode retornar uma representação resumida:

```json
{
  "uuid": "...",
  "name": "Produto",
  "price": 29.9
}
```

Enquanto uma consulta individual pode retornar informações adicionais:

```json
{
  "uuid": "...",
  "name": "Produto",
  "price": 29.9,
  "minimum_stock": 10,
  "stock": 42,
  "created_at": "2026-09-01T12:00:00Z"
}
```

Essa diferenciação evita retornar dados desnecessários em operações de listagem.

---

# 13. Status Codes

A API utiliza HTTP status codes para representar o resultado da operação.

Alguns códigos esperados:

| Status                      | Significado                                      |
| --------------------------- | ------------------------------------------------ |
| `200 OK`                    | Operação realizada com sucesso                   |
| `201 Created`               | Recurso criado                                   |
| `204 No Content`            | Operação realizada sem conteúdo de resposta      |
| `400 Bad Request`           | Requisição inválida                              |
| `401 Unauthorized`          | Autenticação ausente ou inválida                 |
| `403 Forbidden`             | Usuário autenticado sem autorização              |
| `404 Not Found`             | Recurso não encontrado                           |
| `409 Conflict`              | Conflito com o estado atual                      |
| `422 Unprocessable Entity`  | Dados semanticamente inválidos, quando aplicável |
| `429 Too Many Requests`     | Rate limit excedido                              |
| `500 Internal Server Error` | Erro interno inesperado                          |

O status code deve representar o resultado da operação sem depender exclusivamente do conteúdo da mensagem de erro.

---

# 14. Authentication

A API utiliza autenticação baseada em JWT armazenado em cookies HttpOnly.

O cliente não precisa armazenar o token diretamente em `localStorage` ou `sessionStorage`.

O navegador envia os cookies automaticamente conforme as regras de segurança e escopo configuradas.

Fluxo conceitual:

```text
Client
  │
  │ Login
  ▼
API
  │
  │ Set-Cookie
  ▼
Browser
  │
  │ HttpOnly Cookie
  ▼
Protected API
```

A autenticação é diferente da autorização.

Authentication responde:

> Quem está fazendo a requisição?

Authorization responde:

> Esse ator pode realizar essa operação?

Os detalhes encontram-se em:

- `docs/security/authentication.md`
- `docs/security/authorization.md`

---

# 15. Tenant Context

O Exactum possui arquitetura multi-tenant.

Uma requisição autenticada possui um contexto de tenant quando a operação ocorre dentro de uma organização.

Conceitualmente:

```text
Request
 ├── user
 ├── tenant
 └── role / permissions
```

O contexto é estabelecido no início do request lifecycle e utilizado pelas camadas responsáveis pela execução da operação.

As operações de persistência devem manter o isolamento entre tenants.

A API não deve confiar em identificadores enviados pelo cliente para determinar arbitrariamente o tenant que pode ser acessado.

O tenant autorizado é derivado do contexto de autenticação e das regras de autorização.

Mais detalhes em:

`docs/architecture/multi-tenancy.md`

`docs/security/tenant-isolation.md`

---

# 16. Authorization

A autorização ocorre no backend.

O frontend pode esconder funcionalidades que o usuário não possui permissão para executar, mas isso possui finalidade principalmente de UX.

A decisão definitiva deve ocorrer no servidor.

Conceitualmente:

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
   ├── denied → 403
   │
   ▼
Application Service
```

A autorização pode considerar:

- usuário;
- tenant;
- role;
- permissions;
- recurso;
- operação;
- contexto da requisição.

---

# 17. Validation

A API possui diferentes níveis de validação.

## 17.1 Structural Validation

Verifica se a entrada possui formato válido.

Exemplos:

- tipo;
- formato;
- campos obrigatórios;
- tamanho;
- enumeração;
- estrutura JSON.

---

## 17.2 Business Validation

Verifica regras específicas do domínio.

Exemplos conceituais:

```text
estoque não pode assumir determinado estado inválido
```

ou:

```text
uma operação de venda deve respeitar as regras do domínio
```

Essas regras pertencem à camada de aplicação/domínio apropriada, e não exclusivamente ao schema HTTP.

---

## 17.3 Authorization Validation

Verifica se o ator possui permissão para executar determinada operação.

Esses níveis não devem ser confundidos.

```text
Input Validation
      │
      ▼
Business Rules
      │
      ▼
Authorization
```

Na prática, a ordem exata pode variar conforme o endpoint e a arquitetura da operação.

---

# 18. Error Responses

Erros devem possuir uma representação estruturada.

Exemplo conceitual:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

Quando necessário, erros de validação podem incluir detalhes adicionais:

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

O contrato de erros deve permitir que o frontend trate erros de forma programática sem depender exclusivamente de mensagens textuais.

A API deve evitar expor:

- stack traces;
- SQL;
- informações internas de infraestrutura;
- credenciais;
- tokens;
- detalhes desnecessários de implementação.

Mais detalhes em:

`docs/api/errors.md`

---

# 19. Idempotency

Operações que podem ser repetidas devem considerar sua semântica de idempotência.

Uma operação idempotente produz o mesmo estado final quando executada múltiplas vezes sob as mesmas condições.

Por exemplo, operações `GET` devem ser idempotentes.

Operações de criação via `POST` normalmente não são idempotentes por natureza.

Para operações críticas, a API poderá evoluir para suportar **Idempotency Keys**.

Exemplo conceitual:

```http
POST /sales
Idempotency-Key: 01K...
```

O uso desse mecanismo é especialmente relevante para operações financeiras ou de venda em que uma repetição causada por retry de rede não deve produzir duplicação.

Esse mecanismo pode ser incorporado conforme a maturidade da API aumentar.

---

# 20. Concurrency

Operações concorrentes podem modificar o mesmo recurso simultaneamente.

A API deve considerar:

- transações;
- atomicidade;
- integridade referencial;
- concorrência no banco;
- operações de estoque;
- retries;
- possíveis race conditions.

Isso é especialmente importante em operações relacionadas a estoque e vendas.

Uma operação de alteração de estoque não deve depender apenas da leitura anterior realizada pelo cliente.

A regra de negócio deve ser protegida no backend e na persistência.

---

# 21. Date and Time

Datas e timestamps devem utilizar uma representação consistente.

Quando timestamps forem expostos pela API, deve-se preferir uma representação compatível com ISO 8601.

Exemplo:

```text
2026-09-21T18:30:00Z
```

A API deve manter clareza sobre:

- timezone;
- instante absoluto;
- datas sem horário;
- timestamps gerados pelo servidor.

O backend deve evitar depender implicitamente do timezone local do servidor para representar eventos temporais importantes.

---

# 22. Boolean Values

Valores booleanos devem ser representados como JSON boolean:

```json
{
  "active": true
}
```

e não como strings:

```json
{
  "active": "true"
}
```

Isso mantém o contrato semanticamente correto e reduz ambiguidades no consumo da API.

---

# 23. Nullability

Quando um campo puder não possuir valor, a API deve definir explicitamente se:

```json
{
  "deleted_at": null
}
```

é diferente de:

```text
campo ausente
```

A distinção entre campo ausente e `null` pode possuir significado no contexto de atualizações parciais.

Por exemplo, em um `PATCH`:

```json
{
  "description": null
}
```

pode significar:

> remover o valor atual.

Enquanto:

```json
{}
```

pode significar:

> não alterar o campo.

Essa semântica deve ser definida de forma consistente pelo endpoint.

---

# 24. Naming Conventions

A API deve utilizar nomenclatura previsível.

Os nomes dos campos devem seguir uma convenção consistente em todo o contrato.

Exemplo:

```json
{
  "created_at": "...",
  "updated_at": "...",
  "tenant_uuid": "..."
}
```

O mesmo conceito não deve possuir nomes diferentes em endpoints diferentes sem uma justificativa arquitetural.

Por exemplo, evitar:

```text
created_at
creation_date
created
date_created
```

para representar o mesmo conceito.

A consistência da nomenclatura é especialmente importante em APIs consumidas por aplicações frontend.

---

# 25. Timestamps

Recursos que possuem ciclo de vida podem possuir timestamps como:

```text
created_at
updated_at
deleted_at
```

Quando aplicável.

A presença de `deleted_at` está relacionada à estratégia de Soft Delete.

Nem todo recurso necessariamente precisa possuir todos esses campos.

A necessidade deve ser determinada pelo domínio e pelo ciclo de vida do recurso.

---

# 26. Resource State

Recursos podem possuir estados explícitos quando o domínio exigir.

Exemplo conceitual:

```json
{
  "status": "active"
}
```

Estados devem utilizar valores controlados pelo backend.

O cliente não deve conseguir criar estados arbitrários.

Quando houver uma máquina de estados relevante para o domínio, suas transições devem ser controladas pela camada de aplicação.

---

# 27. API and Application Services

Controllers e routes são responsáveis por preocupações relacionadas ao HTTP.

Application Services são responsáveis por orquestrar operações da aplicação.

Conceitualmente:

```text
HTTP Request
     │
     ▼
Route
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
```

O controller não deve concentrar regras de negócio complexas.

Isso permite que a lógica de aplicação permaneça menos acoplada ao framework HTTP.

---

# 28. API and Repositories

A API não deve acessar diretamente a camada de persistência quando isso resultar em acoplamento inadequado.

O fluxo esperado é:

```text
API
 │
 ▼
Application
 │
 ▼
Repository
 │
 ▼
Persistence
```

Repositories encapsulam preocupações relacionadas ao acesso e manipulação dos dados persistidos.

A separação também facilita testes e futuras mudanças na arquitetura.

---

# 29. API and Observability

As requisições da API fazem parte do Request Lifecycle observado pelo sistema.

Quando apropriado, uma requisição pode ser associada a:

- `request_id`;
- `user_uuid`;
- `tenant_uuid`;
- método HTTP;
- path;
- status code;
- duração;
- eventos;
- logs;
- audit logs.

Isso permite investigar uma operação de ponta a ponta.

Exemplo conceitual:

```text
HTTP Request
     │
     ├── request_id
     │
     ├── Infrastructure Log
     │
     ├── Application Operation
     │
     ├── Audit Log
     │
     └── Platform Event
```

Mais detalhes em:

`docs/observability/correlation.md`

---

# 30. Security Considerations

A API deve considerar segurança desde o desenho do endpoint.

Entre os princípios:

- nunca confiar no frontend como boundary de segurança;
- validar entradas;
- aplicar autenticação;
- aplicar autorização;
- manter tenant isolation;
- não expor secrets;
- evitar vazamento de informações internas;
- utilizar cookies com atributos de segurança apropriados;
- aplicar rate limiting quando necessário;
- registrar eventos relevantes;
- evitar informações sensíveis em logs;
- proteger operações de escrita contra concorrência inadequada.

Segurança é uma preocupação transversal da arquitetura, e não uma responsabilidade exclusiva da camada HTTP.

---

# 31. API Contract

A API deve possuir um contrato explícito entre backend e consumidores.

Esse contrato inclui:

- endpoints;
- métodos HTTP;
- parâmetros;
- request bodies;
- response bodies;
- status codes;
- erros;
- autenticação;
- autorização;
- identificadores;
- regras relevantes de paginação e filtros.

O OpenAPI/Swagger é utilizado para documentar o contrato público da API.

A documentação automática não substitui a documentação arquitetural.

Enquanto o OpenAPI descreve principalmente:

> como consumir a API,

a documentação arquitetural descreve:

> por que a API funciona dessa maneira.

---

# 32. Backward Compatibility

Mudanças no contrato público devem considerar compatibilidade com consumidores existentes.

Alterações potencialmente incompatíveis incluem:

- remoção de campos;
- alteração de tipos;
- mudança de significado;
- alteração de status codes;
- mudança de autenticação;
- remoção de endpoints;
- alteração incompatível na estrutura de erros.

Quando uma mudança incompatível for necessária, ela deve ser tratada como evolução de contrato e, quando apropriado, acompanhada por versionamento.

---

# 33. Anti-Patterns

A API deve evitar padrões como:

### 33.1 Business Logic in Controllers

```text
Controller
 ├── validação complexa
 ├── regras de negócio
 ├── queries
 ├── transações
 └── resposta HTTP
```

Isso aumenta o acoplamento e dificulta manutenção e testes.

---

### 33.2 Trusting the Frontend

Não se deve considerar que uma funcionalidade está protegida porque o frontend não exibe o botão.

A API deve verificar autorização independentemente do cliente.

---

### 33.3 Client-Controlled Tenant

Não se deve permitir que o cliente determine livremente o tenant da operação.

O contexto autorizado deve ser estabelecido pelo backend.

---

### 33.4 Exposing Internal Errors

Não se deve retornar stack traces, SQL ou detalhes internos ao consumidor.

O cliente deve receber uma resposta segura e estruturada.

---

### 33.5 Inconsistent Naming

Endpoints diferentes não devem utilizar nomes diferentes para o mesmo conceito sem justificativa.

---

### 33.6 Unbounded Queries

Endpoints de listagem não devem permitir consultas sem limites que possam gerar consumo excessivo de recursos.

Paginação e limites devem ser aplicados quando apropriado.

---

### 33.7 Arbitrary Sorting or Filtering

Campos de ordenação e filtros devem ser explicitamente controlados pelo backend.

Não se deve permitir que o cliente transforme parâmetros diretamente em partes arbitrárias de uma query.

---

# 34. Testing API Conventions

As convenções da API devem ser protegidas por testes automatizados.

Testes podem verificar:

- status codes;
- formato das respostas;
- validação;
- autenticação;
- autorização;
- tenant isolation;
- estrutura de erros;
- paginação;
- filtros;
- comportamento de Soft Delete;
- operações concorrentes relevantes;
- cookies de autenticação;
- headers;
- OpenAPI contract.

Testes de integração são especialmente importantes para garantir que diferentes camadas respeitem o contrato definido.

---

# 35. Current State

Atualmente, o Exactum possui uma API REST-oriented construída em Flask, utilizando schemas para validação e serialização, controllers/routes para a camada HTTP e Application Services para orquestração das operações.

A API utiliza:

- JSON;
- UUIDs como identificadores públicos;
- autenticação JWT via HttpOnly cookies;
- refresh tokens;
- RBAC e permissions;
- multi-tenancy;
- structured error handling;
- OpenAPI/Swagger;
- request correlation;
- rate limiting;
- observabilidade integrada ao request lifecycle.

A implementação continua em evolução e algumas convenções descritas neste documento representam padrões arquiteturais desejados que serão consolidados ou refinados durante a evolução do projeto.

---

# 36. Future Evolution

Conforme o Exactum evoluir, a API poderá incorporar ou aprofundar:

- API versioning;
- Idempotency Keys;
- paginação mais avançada;
- filtros compostos;
- sorting padronizado;
- caching;
- ETags;
- optimistic concurrency;
- background processing;
- Celery;
- RabbitMQ;
- métricas com Prometheus;
- distributed tracing;
- OpenTelemetry;
- Domain Events;
- Transactional Outbox;
- APIs adicionais para novos contextos de domínio.

Essas evoluções devem preservar os princípios de baixo acoplamento, segurança, consistência e clareza do contrato público.

---

# 37. Design Principles

As principais diretrizes para evolução da API são:

1. **Clareza**
   O comportamento de um endpoint deve ser previsível.

2. **Consistência**
   Conceitos semelhantes devem possuir contratos semelhantes.

3. **Segurança**
   O backend deve ser a autoridade final sobre autenticação, autorização e tenant isolation.

4. **Baixo acoplamento**
   A camada HTTP não deve dominar a lógica da aplicação.

5. **Validação explícita**
   Dados inválidos devem ser rejeitados de forma previsível.

6. **Observabilidade**
   Operações relevantes devem ser rastreáveis.

7. **Compatibilidade**
   Mudanças no contrato devem considerar seus consumidores.

8. **Evolutividade**
   A API deve permitir evolução arquitetural sem exigir reescrita completa.

---

# 38. Related Documentation

- `docs/api/overview.md`
- `docs/api/authentication.md`
- `docs/api/errors.md`
- `docs/api/versioning.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/multi-tenancy.md`
- `docs/observability/correlation.md`
- `docs/database/soft-delete.md`

---

## Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API.

Por exemplo:

```text
actor      → atualmente representado por user_uuid
tenant     → atualmente representado por tenant_uuid
resource   → atualmente representado por identificadores específicos
```

Essa distinção permite documentar responsabilidades e significados arquiteturais sem limitar conceitos à implementação atual.

Da mesma forma, algumas convenções descritas neste documento representam uma direção de evolução e podem ainda não estar completamente implementadas em todos os endpoints.

Portanto, este documento deve ser interpretado como uma representação do **modelo atual da API e de seus princípios de evolução**, e não como uma descrição imutável da implementação futura.
