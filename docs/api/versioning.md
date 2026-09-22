# API Versioning

## 1. Objetivo

Este documento define as diretrizes para **versionamento da API**, evolução do contrato HTTP, compatibilidade entre versões e tratamento de mudanças potencialmente incompatíveis no Exactum.

O objetivo do versionamento não é apenas permitir múltiplas versões da API, mas estabelecer uma estratégia previsível para que mudanças no backend possam ocorrer sem quebrar consumidores existentes de forma inesperada.

No contexto do Exactum, a API representa uma fronteira entre a aplicação e seus consumidores, principalmente o frontend web. Portanto, mudanças em endpoints, payloads, regras de validação, códigos de erro ou comportamento dos recursos precisam ser tratadas como mudanças de contrato.

A estratégia apresentada neste documento busca equilibrar:

- evolução do sistema;
- estabilidade do contrato;
- compatibilidade retroativa;
- simplicidade operacional;
- segurança;
- manutenção do frontend;
- possibilidade de futuros consumidores externos;
- evolução arquitetural dos domínios.

---

## 2. Escopo

Este documento trata especificamente de:

- versionamento da API;
- compatibilidade retroativa;
- breaking changes;
- mudanças compatíveis;
- evolução de endpoints;
- evolução de request e response;
- evolução de error responses;
- evolução de recursos;
- descontinuação de endpoints;
- coexistência de versões;
- migração entre versões;
- documentação OpenAPI;
- testes de compatibilidade;
- estratégia futura de múltiplos consumidores.

Não faz parte do escopo deste documento definir:

- versionamento de banco de dados;
- migrations;
- versionamento do código-fonte;
- versionamento de containers;
- versionamento de eventos;
- versionamento de Domain Events;
- versionamento de Platform Events.

Esses temas possuem documentação própria ou poderão receber documentação específica conforme a arquitetura evoluir.

---

# 3. Princípios

O versionamento da API do Exactum segue alguns princípios fundamentais.

### 3.1. O contrato da API deve ser previsível

Um consumidor deve conseguir entender:

- quais endpoints existem;
- quais parâmetros são aceitos;
- quais responses são retornados;
- quais erros podem ocorrer;
- quais mudanças são compatíveis;
- quando uma mudança exige migração.

---

### 3.2. Nem toda mudança exige uma nova versão

Alterações internas que não modificam o contrato público da API não devem gerar uma nova versão.

Por exemplo:

```text
Controller
    ↓
Application Service
    ↓
Repository
```

Uma mudança na implementação interna do `Application Service`, desde que preserve o contrato HTTP, não representa necessariamente uma nova versão da API.

Da mesma forma, refatorações internas, otimizações de queries ou mudanças de infraestrutura não devem ser expostas como mudanças de versão quando o comportamento contratual permanece compatível.

---

### 3.3. Breaking changes devem ser tratadas explicitamente

Mudanças incompatíveis não devem ocorrer de forma silenciosa.

Quando uma alteração quebra o contrato existente, deve existir uma estratégia explícita para:

- identificar o impacto;
- documentar a alteração;
- comunicar a mudança;
- permitir migração;
- manter versões anteriores durante um período adequado, quando necessário.

---

### 3.4. Compatibilidade deve ser analisada do ponto de vista do consumidor

Uma mudança deve ser analisada considerando como um consumidor existente utiliza a API.

Por exemplo, adicionar um campo opcional a uma response normalmente é compatível:

```json
{
  "uuid": "...",
  "name": "Produto"
}
```

pode evoluir para:

```json
{
  "uuid": "...",
  "name": "Produto",
  "minimum_stock": 10
}
```

desde que o consumidor não dependa de uma estrutura rigidamente fechada.

Por outro lado, remover ou renomear `name` pode quebrar consumidores existentes.

---

# 4. Estado atual

Atualmente, o Exactum possui uma API REST-oriented utilizada principalmente pelo frontend da aplicação.

A API possui:

- endpoints organizados por recursos;
- autenticação baseada em JWT;
- access token e refresh token;
- autenticação via HttpOnly cookies;
- autorização baseada em roles e permissions;
- isolamento multi-tenant;
- UUIDs como identificadores públicos;
- responses JSON;
- tratamento centralizado de erros;
- documentação OpenAPI/Swagger;
- códigos de erro estruturados;
- separação entre HTTP layer e Application Services.

A API encontra-se em evolução ativa, acompanhando a evolução arquitetural do Exactum.

O sistema atualmente está em estágio **alpha**, portanto o contrato ainda pode sofrer alterações relevantes durante a evolução do projeto.

Isso significa que a estratégia de versionamento precisa considerar tanto a necessidade de estabilidade futura quanto a realidade de um produto ainda em desenvolvimento.

---

# 5. O que significa "versão da API"

Uma versão representa uma evolução contratual da API que pode exigir comportamento diferente por parte de seus consumidores.

A versão não representa:

- versão do Python;
- versão do Flask;
- versão do PostgreSQL;
- versão do Docker;
- versão do frontend;
- versão do banco de dados;
- versão interna de um módulo.

Ela representa a versão do **contrato público da API**.

Por exemplo:

```text
API v1
API v2
```

representam contratos públicos diferentes.

Enquanto:

```text
Exactum v0.3.0
```

representa uma versão do produto ou código da aplicação.

Esses dois conceitos devem permanecer separados.

---

# 6. Versionamento do produto vs versionamento da API

O Exactum possui diferentes níveis de versionamento.

Uma representação simplificada é:

```text
Produto
    │
    ├── Exactum v0.3.x
    │
    └── API
          │
          └── v1
```

Uma nova versão do produto não implica necessariamente uma nova versão da API.

Por exemplo:

```text
Exactum 0.3.0
    API v1

Exactum 0.3.1
    API v1

Exactum 0.4.0
    API v1
```

Uma alteração interna pode gerar uma nova versão do produto sem alterar o contrato da API.

Da mesma forma, uma mudança contratual significativa poderá exigir uma nova versão da API independentemente de como o restante da aplicação esteja versionado.

---

# 7. Estratégia de versionamento

A estratégia adotada para a API deve priorizar **versionamento explícito por major version**.

Uma representação possível é:

```text
/api/v1/...
```

Por exemplo:

```text
/api/v1/products
/api/v1/products/{uuid}
/api/v1/sales
/api/v1/users
```

A ideia é que mudanças incompatíveis possam ser representadas por uma nova major version:

```text
/api/v1/...
/api/v2/...
```

Essa abordagem permite que contratos diferentes coexistam quando necessário.

---

# 8. Por que versionar por major version

Nem toda alteração merece criar uma nova versão.

Se cada pequena alteração gerar:

```text
v1
v1.1
v1.2
v1.3
v1.4
...
```

a complexidade operacional aumenta rapidamente.

Por isso, o versionamento da API deve se concentrar principalmente em mudanças que alteram o contrato de forma incompatível.

A distinção principal é:

```text
Non-breaking change
        ↓
continua na mesma versão

Breaking change
        ↓
pode exigir nova major version
```

---

# 9. Breaking Changes

Uma **breaking change** é uma alteração que pode impedir que um consumidor existente continue funcionando corretamente sem modificações.

Exemplos incluem:

- remover endpoint;
- renomear endpoint;
- alterar método HTTP;
- remover campo obrigatório;
- alterar o tipo de um campo;
- alterar estrutura fundamental da response;
- alterar significado de um campo existente;
- remover valores válidos de um enum;
- alterar comportamento esperado de uma operação;
- tornar obrigatório um campo anteriormente opcional;
- alterar autenticação de forma incompatível;
- alterar códigos de erro utilizados pelo consumidor;
- alterar parâmetros obrigatórios de forma incompatível.

Exemplo:

Antes:

```json
{
  "uuid": "product-uuid",
  "name": "Notebook"
}
```

Depois:

```json
{
  "uuid": "product-uuid",
  "product_name": "Notebook"
}
```

A remoção de `name` e sua substituição por `product_name` pode quebrar consumidores que dependem de `name`.

Uma alternativa compatível seria introduzir o novo campo antes de remover o antigo:

```json
{
  "uuid": "product-uuid",
  "name": "Notebook",
  "product_name": "Notebook"
}
```

seguida de um processo de depreciação e migração.

---

# 10. Non-breaking Changes

Uma **non-breaking change** é uma alteração que mantém o contrato existente funcional para consumidores atuais.

Exemplos comuns:

- adicionar endpoint;
- adicionar campo opcional;
- adicionar novo recurso;
- adicionar novos filtros opcionais;
- melhorar mensagens internas sem alterar contratos estruturados;
- otimizar implementação;
- alterar queries internas;
- alterar arquitetura interna;
- adicionar métricas;
- adicionar logs;
- adicionar observabilidade;
- adicionar índices no banco;
- refatorar Application Services;
- alterar implementação de Repository.

Por exemplo:

```http
GET /api/v1/products
```

pode continuar existindo enquanto novos filtros são adicionados:

```http
GET /api/v1/products?category=electronics
```

desde que consumidores que não utilizam o filtro continuem funcionando normalmente.

---

# 11. Evolução de Responses

Responses devem ser projetadas considerando evolução futura.

Uma response pode começar como:

```json
{
  "uuid": "7b2...",
  "name": "Notebook"
}
```

e posteriormente receber novos campos:

```json
{
  "uuid": "7b2...",
  "name": "Notebook",
  "minimum_stock": 5,
  "current_stock": 18
}
```

Adicionar informações normalmente é menos disruptivo do que alterar informações existentes.

Por isso, consumidores devem evitar assumir que uma response possui exatamente um conjunto fixo de campos.

---

# 12. Evolução de Requests

Requests exigem atenção maior.

Adicionar um campo opcional normalmente é compatível:

```json
{
  "name": "Notebook",
  "minimum_stock": 5
}
```

quando `minimum_stock` é opcional.

Porém, transformar posteriormente esse campo em obrigatório pode ser uma breaking change.

Exemplo:

```text
Antes:

name → obrigatório
minimum_stock → opcional

Depois:

name → obrigatório
minimum_stock → obrigatório
```

Essa alteração pode exigir uma nova versão ou uma estratégia de migração.

---

# 13. Remoção de campos

Campos públicos não devem ser removidos imediatamente sem considerar consumidores existentes.

Uma estratégia possível é:

```text
1. Introduzir novo campo
        ↓
2. Manter campo antigo
        ↓
3. Marcar campo antigo como deprecated
        ↓
4. Comunicar migração
        ↓
5. Aguardar janela de migração
        ↓
6. Remover em nova versão
```

Exemplo:

```json
{
  "name": "Notebook",
  "display_name": "Notebook"
}
```

Durante o período de transição, `name` poderia permanecer disponível enquanto `display_name` passa a ser o campo recomendado.

---

# 14. Deprecation

**Deprecation** significa que determinado recurso continua disponível, mas não deve mais ser utilizado para novos desenvolvimentos.

Um recurso deprecated não deve ser removido imediatamente.

Por exemplo:

```text
GET /api/v1/products/legacy-search
```

poderia ser marcado como deprecated enquanto um novo endpoint é disponibilizado.

A documentação deve indicar:

- que o recurso está deprecated;
- qual recurso deve ser utilizado;
- motivo da mudança, quando relevante;
- prazo ou janela estimada de remoção, quando aplicável;
- versão em que a remoção ocorrerá, quando definida.

---

# 15. Compatibilidade retroativa

Compatibilidade retroativa significa que consumidores desenvolvidos para uma versão anterior continuam funcionando com uma versão mais nova dentro das regras estabelecidas.

A compatibilidade deve ser considerada em:

- endpoints;
- métodos HTTP;
- request bodies;
- query parameters;
- response bodies;
- status codes;
- error codes;
- autenticação;
- autorização;
- semântica dos recursos.

Não basta manter a URL.

O comportamento do contrato também precisa permanecer compatível.

---

# 16. Compatibilidade semântica

Uma API pode manter exatamente o mesmo JSON e ainda assim quebrar consumidores se o significado do dado mudar.

Por exemplo:

```json
{
  "stock": 10
}
```

Se `stock` significava:

```text
estoque disponível
```

e posteriormente passar a significar:

```text
estoque reservado
```

a estrutura permanece igual, mas o contrato semântico mudou.

Portanto, mudanças no significado de campos existentes devem ser tratadas com o mesmo cuidado de alterações estruturais.

---

# 17. Status Codes como parte do contrato

Status codes fazem parte do contrato da API.

Por exemplo:

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

Um consumidor pode depender desses códigos para decidir seu comportamento.

Portanto, alterar:

```text
404 → 200
```

ou:

```text
409 → 400
```

sem considerar compatibilidade pode representar uma mudança contratual.

---

# 18. Error Codes como parte do contrato

Os `error.code` também fazem parte do contrato público.

Exemplo:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock."
  }
}
```

O frontend deve preferencialmente utilizar:

```text
error.code
```

em vez de depender de:

```text
error.message
```

para lógica de aplicação.

Isso permite alterar a mensagem sem necessariamente quebrar o consumidor.

Por exemplo:

```text
INSUFFICIENT_STOCK
```

pode continuar estável enquanto a mensagem pode ser adaptada ou localizada.

---

# 19. UUIDs e compatibilidade

Os identificadores públicos dos recursos utilizam UUIDs.

Exemplo:

```http
GET /api/v1/products/550e8400-e29b-41d4-a716-446655440000
```

A utilização de identificadores públicos estáveis reduz o acoplamento entre consumidores e detalhes internos de persistência.

O consumidor não deve depender de:

- IDs internos sequenciais;
- estrutura de tabelas;
- foreign keys internas;
- detalhes do PostgreSQL.

O identificador público representa o recurso dentro do contrato da API.

---

# 20. Versionamento e multi-tenancy

A versão da API não altera o princípio de isolamento entre tenants.

Por exemplo:

```text
/api/v1/products
```

e:

```text
/api/v2/products
```

devem continuar respeitando:

```text
Authentication
        ↓
Tenant Context
        ↓
Authorization
        ↓
Application Service
        ↓
Persistence Isolation
```

Uma nova versão da API não deve criar uma nova fronteira de segurança.

O isolamento de tenant continua sendo responsabilidade do backend.

---

# 21. Versionamento e autenticação

Alterações na autenticação possuem potencial elevado de impacto.

A API atual utiliza:

- JWT;
- access token;
- refresh token;
- HttpOnly cookies;
- Redis-backed session state;
- refresh token rotation;
- session revocation.

Uma mudança incompatível nesse fluxo pode exigir tratamento específico.

Por exemplo:

```text
v1
JWT via HttpOnly cookies
```

e futuramente:

```text
v2
outro mecanismo de autenticação
```

não devem ser tratados simplesmente como uma alteração cosmética.

Mudanças de autenticação devem considerar:

- frontend;
- browsers;
- cookies;
- CORS;
- sessão;
- revogação;
- refresh;
- logout;
- segurança;
- clientes externos.

---

# 22. Versionamento e autorização

Mudanças de autorização também podem afetar consumidores.

Por exemplo, um endpoint que anteriormente permitia determinada operação pode passar a exigir uma permission específica.

Isso pode representar uma mudança comportamental mesmo que:

```text
URL
HTTP method
request
response
```

permaneçam iguais.

Por isso, mudanças relevantes em authorization behavior devem ser avaliadas como mudanças contratuais.

---

# 23. Versionamento e OpenAPI

Cada versão pública da API deve possuir documentação OpenAPI correspondente.

Por exemplo:

```text
API v1
    OpenAPI v1
```

e futuramente:

```text
API v2
    OpenAPI v2
```

A documentação deve permitir identificar claramente:

- versão;
- endpoints disponíveis;
- schemas;
- authentication;
- responses;
- errors;
- deprecated resources;
- parâmetros;
- exemplos.

O OpenAPI funciona como uma representação formal do contrato público.

---

# 24. Versionamento e testes

Os testes devem proteger o contrato da API.

Além de testar comportamento interno, testes de API devem verificar:

- endpoints;
- HTTP methods;
- status codes;
- response structure;
- required fields;
- error codes;
- authentication;
- authorization;
- tenant isolation;
- validation behavior.

Uma alteração aparentemente pequena pode ser detectada como breaking change por testes de contrato.

Exemplo:

```python
response = client.get("/api/v1/products")

assert response.status_code == 200

data = response.json()

assert "items" in data
```

Esses testes ajudam a impedir mudanças acidentais no contrato.

---

# 25. Contract Testing

Conforme o Exactum evoluir para múltiplos consumidores, **Contract Testing** poderá ser utilizado para validar explicitamente a compatibilidade entre consumidores e API.

Uma possibilidade futura é verificar automaticamente:

```text
API Provider
      │
      │ Contract
      ▼
Consumer
```

Isso se torna especialmente relevante quando existirem:

- frontend independente;
- mobile app;
- integrações externas;
- parceiros;
- APIs públicas;
- múltiplos clientes.

Atualmente, o frontend web é o principal consumidor da API, portanto a complexidade desse mecanismo ainda é limitada.

---

# 26. Coexistência de versões

Quando uma nova major version for necessária, versões diferentes poderão coexistir temporariamente.

Exemplo:

```text
/api/v1/products
/api/v2/products
```

Durante a migração:

```text
Consumer A ──→ v1
Consumer B ──→ v2
```

Depois:

```text
Consumer A
    │
    └── migration ──→ v2
```

Finalmente:

```text
v1
 ↓
deprecated
 ↓
removed
```

A coexistência deve ser utilizada quando realmente houver necessidade de permitir migração gradual.

Manter versões indefinidamente aumenta:

- complexidade;
- custo de manutenção;
- superfície de testes;
- duplicação de regras;
- risco de divergência comportamental.

---

# 27. Estratégia de migração

Uma migração de versão deve ser planejada.

Uma sequência possível:

```text
1. Identificar breaking change
        ↓
2. Avaliar consumidores afetados
        ↓
3. Definir novo contrato
        ↓
4. Implementar nova versão
        ↓
5. Atualizar OpenAPI
        ↓
6. Criar testes
        ↓
7. Documentar migration path
        ↓
8. Disponibilizar nova versão
        ↓
9. Deprecar versão anterior
        ↓
10. Migrar consumidores
        ↓
11. Remover versão antiga
```

O processo exato pode variar conforme o impacto da alteração.

---

# 28. Migration Guide

Quando uma nova versão introduzir mudanças relevantes, deve existir um **Migration Guide**.

Exemplo:

```text
v1 → v2
```

O guia deve apresentar:

- o que mudou;
- o que foi removido;
- o que foi renomeado;
- novos endpoints;
- novos campos;
- mudanças de comportamento;
- alterações de autenticação;
- alterações de errors;
- exemplos antes/depois;
- passos necessários para migração.

Exemplo conceitual:

```text
v1:

GET /api/v1/products

v2:

GET /api/v2/products
```

O migration guide deve explicar exatamente como o consumidor deve adaptar sua integração.

---

# 29. Breaking Change Review

Antes de introduzir uma mudança potencialmente incompatível, deve ser feita uma análise explícita.

Perguntas importantes:

- O endpoint público mudou?
- O método HTTP mudou?
- Algum campo foi removido?
- Algum campo mudou de tipo?
- Algum campo passou a ser obrigatório?
- Algum status code mudou?
- Algum error code mudou?
- O significado de algum campo mudou?
- A autenticação mudou?
- A autorização mudou?
- O comportamento multi-tenant mudou?
- O frontend atual continuará funcionando?
- Existe consumidor externo?
- A documentação OpenAPI precisa mudar?
- É necessário um período de deprecation?

Essa análise evita que breaking changes sejam introduzidas acidentalmente.

---

# 30. API Versioning e arquitetura interna

O versionamento público da API não deve forçar duplicação desnecessária de toda a aplicação.

Uma arquitetura possível é:

```text
HTTP v1
   │
   ▼
Application Services
   │
   ▼
Domain
   │
   ▼
Repositories
```

e futuramente:

```text
HTTP v1 ──┐
          ├──→ Application / Domain
HTTP v2 ──┘
```

As versões podem compartilhar partes da aplicação quando o comportamento interno for compatível.

Isso evita:

```text
v1 entire application
v2 entire application
```

como duas aplicações completamente independentes.

---

# 31. Adapter Layer

Em alguns casos, versões diferentes podem precisar representar o mesmo comportamento interno de maneiras diferentes.

Nesse cenário, uma camada de adaptação pode ser utilizada.

Exemplo:

```text
API v1
   │
   ▼
Adapter
   │
   ▼
Application Service
```

e:

```text
API v2
   │
   ▼
Adapter
   │
   ▼
Application Service
```

Isso permite que diferenças de representação HTTP permaneçam próximas da camada de interface.

O objetivo é evitar espalhar condicionais como:

```python
if api_version == "v1":
    ...
elif api_version == "v2":
    ...
```

por toda a aplicação.

---

# 32. Evitando versionamento no domínio

A lógica de domínio não deve depender diretamente da versão HTTP.

Evitar:

```python
if api_version == "v1":
    calculate_old_behavior()
else:
    calculate_new_behavior()
```

dentro de entidades ou regras centrais.

A versão da API é uma preocupação da interface.

O domínio deve representar regras de negócio independentemente da forma como o consumidor acessa a aplicação.

Isso reforça a separação entre:

```text
HTTP/API
Application
Domain
Infrastructure
```

---

# 33. Versionamento e Domain Evolution

O domínio também pode evoluir independentemente da API.

Por exemplo, uma futura reorganização poderá separar responsabilidades atualmente agrupadas em determinados contextos.

Isso não significa automaticamente:

```text
Domain refactor
    =
API v2
```

Se o contrato externo continuar compatível, a API pode permanecer na mesma versão.

Esse princípio permite que a arquitetura interna evolua sem expor continuamente sua estrutura aos consumidores.

---

# 34. Versionamento e Database Migrations

API versioning e database migration são mecanismos diferentes.

Uma migration:

```text
PostgreSQL
    v1 → v2
```

não significa necessariamente:

```text
API
    v1 → v2
```

É possível alterar o banco mantendo o mesmo contrato da API.

Da mesma forma, uma nova API pode utilizar o mesmo banco durante uma fase de transição.

A compatibilidade entre banco e API deve ser planejada separadamente.

---

# 35. Expand and Contract

Quando uma mudança exige alteração estrutural significativa, uma estratégia possível é utilizar o padrão **Expand and Contract**.

Exemplo:

```text
Estado atual
    ↓
Expand
    ↓
Adicionar nova estrutura
    ↓
Migrar consumidores/dados
    ↓
Remover dependência antiga
    ↓
Contract
```

Por exemplo:

```text
Campo antigo
    ↓
Novo campo
    ↓
Dual write / migração
    ↓
Consumidores migrados
    ↓
Remoção do campo antigo
```

Esse padrão reduz a necessidade de mudanças abruptas.

---

# 36. API Versioning e CI/CD

O pipeline de CI/CD deve validar alterações no contrato da API.

Idealmente, futuras melhorias poderão incluir verificações automáticas para:

- schemas OpenAPI;
- endpoints;
- status codes;
- response contracts;
- breaking changes;
- testes de integração;
- compatibilidade entre versões.

Uma mudança de API não deve depender exclusivamente de revisão manual.

---

# 37. API Versioning e Observability

Mudanças de versão também devem ser observáveis.

Logs e métricas podem futuramente registrar informações como:

```text
api_version
endpoint
method
status_code
request_id
user_uuid
tenant_uuid
duration_ms
```

Isso permite identificar:

- quais versões estão sendo utilizadas;
- quais endpoints ainda possuem tráfego;
- quais versões apresentam erros;
- quais consumidores ainda precisam migrar.

O `request_id` continua sendo utilizado para correlação entre os registros relacionados à operação.

---

# 38. API Versioning e Deprecation Observability

Quando uma versão for deprecated, o uso dela deve ser monitorado.

Exemplo:

```text
v1 requests
────────────
██████████████

v2 requests
────────────
████████
```

O objetivo não é simplesmente marcar `v1` como deprecated, mas verificar se ainda existem consumidores ativos.

Isso ajuda a determinar quando a remoção é operacionalmente segura.

---

# 39. Remoção de versões antigas

Uma versão antiga deve ser removida somente depois de uma análise adequada.

Antes da remoção, deve-se considerar:

- tráfego restante;
- consumidores conhecidos;
- prazo de deprecation;
- dependências externas;
- documentação;
- testes;
- migration guide;
- impacto operacional.

Uma estratégia possível:

```text
Active
  ↓
Deprecated
  ↓
Sunset announced
  ↓
Removed
```

A nomenclatura exata dos estados poderá evoluir conforme o projeto amadurecer.

---

# 40. Sunset

**Sunset** representa o encerramento planejado de uma versão ou endpoint.

Quando aplicável, consumidores devem receber informação suficiente para realizar a migração.

Um processo de sunset pode incluir:

```text
Deprecation
    ↓
Migration Guide
    ↓
Usage Monitoring
    ↓
Migration Window
    ↓
Sunset
    ↓
Removal
```

Para o estágio atual do Exactum, esse processo ainda é principalmente uma diretriz arquitetural para evolução futura.

---

# 41. Versionamento e clientes externos

Atualmente, o principal consumidor da API é o frontend do Exactum.

No futuro, entretanto, a API poderá ser consumida por:

- mobile app;
- integrações externas;
- parceiros;
- ferramentas internas;
- automações;
- outros serviços.

Quanto maior o número de consumidores, maior a importância de um contrato estável.

Isso reforça a necessidade de tratar a API como uma interface pública bem definida mesmo quando inicialmente o consumidor seja controlado pela própria equipe.

---

# 42. Não versionar por mudanças internas

As seguintes alterações normalmente não justificam nova versão da API:

- refatoração de Controller;
- refatoração de Application Service;
- mudança de Repository;
- otimização de SQL;
- adição de índice;
- migração de infraestrutura;
- mudança de Docker;
- mudança de VPS;
- mudança de Redis;
- alteração de observabilidade;
- adição de logs;
- adição de métricas;
- reorganização de módulos internos;
- adoção de novos patterns internos.

O princípio é:

> **Versionar o contrato, não a implementação.**

---

# 43. Versionamento e SemVer

O versionamento do produto e o versionamento da API possuem responsabilidades diferentes.

O produto pode utilizar Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

Enquanto a API pode expor somente sua major version:

```text
v1
v2
```

Isso evita confundir:

```text
Exactum 0.3.2
```

com:

```text
API v1
```

A versão do produto descreve a evolução da aplicação.

A versão da API descreve a evolução do contrato público.

---

# 44. API v0 durante desenvolvimento

Projetos em estágio inicial podem optar por uma API ainda instável.

No caso do Exactum, o projeto encontra-se em estágio alpha e sua arquitetura e contrato continuam em evolução.

Durante esse período, breaking changes podem ocorrer com maior frequência do que em uma API considerada estável.

Mesmo assim, documentar uma estratégia de versionamento antecipadamente é importante porque:

- estabelece uma direção arquitetural;
- reduz mudanças acidentais;
- facilita evolução futura;
- prepara o projeto para múltiplos consumidores;
- melhora a qualidade do contrato.

---

# 45. API Versioning e Segurança

Versionamento não deve ser utilizado para esconder problemas de segurança.

Por exemplo:

```text
v1 → endpoint inseguro
v2 → endpoint seguro
```

não deve significar que a versão antiga permanecerá deliberadamente vulnerável.

Falhas críticas devem ser tratadas de acordo com sua gravidade, mesmo que isso exija alterações incompatíveis ou remoção antecipada de comportamento inseguro.

A segurança possui prioridade sobre compatibilidade indefinida.

---

# 46. API Versioning e Authorization Changes

Alterações de authorization behavior precisam de atenção especial.

Por exemplo:

```text
Antes:
POST /products
→ role user permitida

Depois:
POST /products
→ permission products:create necessária
```

A estrutura do endpoint pode permanecer igual, mas o conjunto de operações permitidas mudou.

Essa alteração deve ser documentada e testada.

Dependendo do contexto, pode ser tratada como:

- evolução de permission model;
- mudança de comportamento;
- deprecation;
- breaking change;
- ou mudança necessária de segurança.

A classificação depende do impacto real nos consumidores.

---

# 47. API Versioning e Rate Limiting

Rate Limiting também pode fazer parte do comportamento observado pelos consumidores.

Por exemplo:

```text
429 Too Many Requests
```

faz parte do contrato operacional.

Alterações significativas nos limites podem afetar integrações que dependem de determinado volume de requests.

No futuro, a documentação poderá expor de forma mais formal:

- limites;
- headers relacionados;
- retry behavior;
- políticas por endpoint;
- políticas por tenant.

---

# 48. Idempotency e evolução

A futura adoção de **Idempotency Keys** também deve considerar compatibilidade.

Por exemplo:

```http
Idempotency-Key: <unique-key>
```

poderá ser introduzido como mecanismo opcional antes de se tornar obrigatório.

Uma estratégia compatível seria:

```text
Fase 1
Idempotency-Key opcional

Fase 2
Recomendado para determinadas operações

Fase 3
Obrigatório em endpoints específicos
```

Mudanças desse tipo devem ser documentadas na API contract.

---

# 49. Pagination e evolução

Paginação é outro exemplo de contrato que deve ser projetado para evolução.

Uma API pode inicialmente retornar:

```json
{
  "items": []
}
```

e futuramente evoluir para:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

Adicionar informações de paginação pode ser compatível, desde que a estrutura existente continue válida para consumidores atuais.

Alterar completamente o formato de uma collection pode exigir uma nova versão.

---

# 50. Filtering e Sorting

Novos filtros e parâmetros opcionais normalmente podem ser adicionados sem criar uma nova versão.

Por exemplo:

```http
GET /api/v1/products
```

pode evoluir para:

```http
GET /api/v1/products?minimum_stock=true
```

ou:

```http
GET /api/v1/products?sort=name
```

Entretanto, alterar o significado de filtros existentes ou modificar a semântica da ordenação pode representar uma mudança incompatível.

---

# 51. Backward Compatibility como decisão arquitetural

Compatibilidade não deve ser tratada como obrigação absoluta.

Existe um custo para manter versões antigas:

```text
Mais versões
    ↓
Mais código
    ↓
Mais testes
    ↓
Mais documentação
    ↓
Mais cenários de manutenção
```

Portanto, cada breaking change deve ser analisada considerando:

```text
Benefício da mudança
        vs
Custo da compatibilidade
```

O objetivo é encontrar um equilíbrio entre estabilidade e evolução.

---

# 52. Anti-patterns

Alguns padrões devem ser evitados.

### 52.1. Criar nova versão para qualquer alteração

```text
Adicionar campo
→ v2
```

Isso gera versionamento excessivo.

---

### 52.2. Nunca versionar

Manter mudanças incompatíveis continuamente em:

```text
v1
```

sem estratégia de compatibilidade gera contratos imprevisíveis.

---

### 52.3. Versionar lógica de domínio

Evitar:

```python
if api_version == "v1":
    ...
```

espalhado pelo domínio.

---

### 52.4. Manter versões indefinidamente

Versões antigas devem possuir estratégia de deprecation e eventual remoção.

---

### 52.5. Depender apenas da documentação

Documentação não substitui testes.

O contrato também deve ser protegido automaticamente sempre que possível.

---

### 52.6. Quebrar consumidores silenciosamente

Breaking changes devem ser explícitas e acompanhadas de estratégia de migração.

---

# 53. Test Strategy

Os testes de API devem validar tanto comportamento quanto contrato.

Exemplos:

```text
Endpoint tests
Integration tests
Authentication tests
Authorization tests
Tenant isolation tests
Validation tests
Error contract tests
Response schema tests
```

Para versões coexistentes:

```text
v1 tests
v2 tests
```

devem ser mantidos enquanto ambas estiverem ativas.

Quando uma versão for removida, seus testes correspondentes também poderão ser removidos.

---

# 54. Documentação e Changelog

Mudanças públicas na API devem ser refletidas em:

- OpenAPI;
- documentação da API;
- migration guides;
- changelog;
- documentação de deprecation;
- testes de contrato.

Uma mudança não deve depender exclusivamente de uma alteração no código.

---

# 55. Current State

Atualmente, o Exactum possui uma API REST-oriented em evolução, utilizada principalmente pelo frontend web.

O estado atual inclui:

- API HTTP baseada em recursos;
- responses JSON;
- UUIDs como public identifiers;
- autenticação JWT;
- access e refresh tokens;
- HttpOnly cookies;
- Redis-backed sessions;
- authorization baseada em roles e permissions;
- multi-tenancy;
- centralized error handling;
- structured error codes;
- OpenAPI/Swagger;
- separação entre HTTP layer e Application Services;
- documentação das convenções da API.

O projeto ainda está em estágio alpha, portanto mudanças incompatíveis podem ocorrer durante a evolução do contrato.

A estratégia formal de coexistência de múltiplas versões e deprecation será mais relevante conforme o Exactum passe a possuir múltiplos consumidores ou uma API mais estável.

---

# 56. Future Evolution

Conforme o Exactum amadurecer, a estratégia de API versioning poderá evoluir para incluir:

- API v1 formalmente estável;
- API v2 quando necessário;
- versionamento explícito de endpoints;
- deprecation headers;
- sunset policy;
- migration guides;
- Contract Testing;
- OpenAPI diff;
- automated breaking-change detection;
- API compatibility checks no CI;
- métricas por API version;
- tracing por API version;
- suporte a mobile clients;
- suporte a consumidores externos;
- políticas formais de backward compatibility;
- documentação de SLA e lifecycle da API.

Uma evolução possível seria:

```text
Current
   │
   ├── API em evolução
   ├── OpenAPI
   └── frontend como principal consumer
   │
   ▼
Future
   │
   ├── API v1
   ├── Contract Testing
   ├── Deprecation
   ├── Migration Guides
   ├── API v2 quando necessário
   └── múltiplos consumidores
```

---

# 57. Design Principles

A estratégia de versionamento da API do Exactum pode ser resumida nos seguintes princípios:

1. **Versionar o contrato, não a implementação.**
2. **Não criar uma nova versão para toda alteração.**
3. **Tratar breaking changes explicitamente.**
4. **Preservar backward compatibility quando economicamente e tecnicamente viável.**
5. **Utilizar deprecation antes de remoções planejadas.**
6. **Manter documentação OpenAPI alinhada ao contrato.**
7. **Proteger contratos importantes por testes.**
8. **Evitar acoplamento da lógica de domínio à versão HTTP.**
9. **Manter authentication e authorization como responsabilidades do backend.**
10. **Preservar tenant isolation independentemente da versão.**
11. **Evitar manutenção indefinida de versões antigas.**
12. **Permitir que a arquitetura interna evolua sem necessariamente alterar a API pública.**
13. **Tratar segurança como prioridade sobre compatibilidade indefinida.**
14. **Preparar a API para futuros consumidores sem adicionar complexidade prematuramente.**

---

# 58. Related Documentation

Documentos relacionados:

- [`docs/api/overview.md`](./overview.md)
- [`docs/api/conventions.md`](./conventions.md)
- [`docs/api/authentication.md`](./authentication.md)
- [`docs/api/errors.md`](./errors.md)
- [`docs/architecture/application-architecture.md`](../architecture/application-architecture.md)
- [`docs/architecture/domain-boundaries.md`](../architecture/domain-boundaries.md)
- [`docs/security/authentication.md`](../security/authentication.md)
- [`docs/security/authorization.md`](../security/authorization.md)
- [`docs/security/tenant-isolation.md`](../security/tenant-isolation.md)
- [`docs/observability/correlation.md`](../observability/correlation.md)

---

# 59. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API.

Por exemplo, um conceito como `consumer`, `resource` ou `tenant` representa uma responsabilidade arquitetural, enquanto sua implementação pode utilizar nomes específicos como `user_uuid`, `product_uuid`, `sale_uuid` ou `tenant_uuid`.

Essa distinção permite documentar o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.

A estratégia de versionamento também poderá evoluir conforme o sistema avance. Durante o estágio alpha, algumas decisões apresentadas neste documento representam diretrizes arquiteturais para a evolução futura, e não necessariamente mecanismos já implementados em sua totalidade.

Portanto, este documento deve ser interpretado como uma representação do **modelo atual de versionamento da API e de sua direção de evolução**, e não como uma descrição imutável de todos os mecanismos futuros do Exactum.
