# Testing Strategy

## 1. Objetivo

Este documento define a estratégia de testes utilizada no **Exactum** para garantir confiabilidade, segurança, previsibilidade e capacidade de evolução do sistema.

A estratégia de testing não tem como objetivo simplesmente maximizar o percentual de coverage.

O objetivo principal é fornecer evidências de que o sistema:

- executa corretamente suas regras;
- mantém seus contratos;
- protege dados entre tenants;
- aplica corretamente Authentication e Authorization;
- mantém comportamentos críticos durante refactors;
- trata erros de forma consistente;
- preserva integridade dos dados;
- continua funcionando após mudanças de infraestrutura ou dependências.

A estratégia deve acompanhar a evolução arquitetural do Exactum.

À medida que o sistema evolui para uma arquitetura com limites de domínio mais fortes, novos componentes e maior desacoplamento, os testes também devem evoluir.

---

# 2. Princípios

A estratégia de testes do Exactum segue alguns princípios fundamentais.

## 2.1 Testar comportamento, não implementação

Sempre que possível, os testes devem validar o comportamento observável do sistema em vez de depender excessivamente de detalhes internos.

Por exemplo, é mais importante testar:

```text
User sem permission
      ↓
403 Forbidden
```

do que testar simplesmente se determinado método interno foi chamado uma vez.

Isso reduz o acoplamento dos testes à implementação.

---

## 2.2 Testes devem proteger mudanças

Um teste útil não existe apenas para provar que uma funcionalidade funciona hoje.

Ele também deve impedir que uma alteração futura quebre um comportamento importante sem que isso seja percebido.

Portanto, testes devem ser considerados parte da estratégia de evolução arquitetural.

---

## 2.3 Testes devem ser determinísticos

Um teste deve produzir o mesmo resultado quando executado repetidamente nas mesmas condições.

Evitar:

- dependência de horário real;
- dependência de serviços externos;
- estado compartilhado entre testes;
- ordem implícita de execução;
- dados persistentes não controlados;
- chamadas de rede desnecessárias;
- randomness sem controle.

---

## 2.4 Testes devem ser isolados

Um teste não deve depender do resultado de outro teste.

A execução:

```text
test A → test B → test C
```

deve produzir o mesmo resultado que:

```text
test C
```

executado isoladamente.

---

## 2.5 Testes devem ser legíveis

Um teste deve deixar claro:

```text
Given
When
Then
```

ou:

```text
Arrange
Act
Assert
```

Exemplo conceitual:

```python
def test_user_without_permission_cannot_delete_product():
    # Arrange
    ...

    # Act
    response = ...

    # Assert
    assert response.status_code == 403
```

A legibilidade é especialmente importante em um projeto que continuará crescendo.

---

# 3. O que a Estratégia Procura Garantir

Os testes do Exactum devem fornecer confiança principalmente nos seguintes aspectos:

```text
Authentication
Authorization
Tenant Isolation
Business Rules
Persistence
API Contracts
Error Handling
Session Management
Impersonation
Soft Delete
Observability
Infrastructure Integration
```

Essas áreas representam pontos onde regressões podem causar impacto significativo.

---

# 4. Test Pyramid

A estratégia segue uma ideia semelhante à **Test Pyramid**.

```text
                 /\
                /  \
               / E2E\
              /------\
             /  API   \
            /----------\
           / Integration\
          /--------------\
         /      Unit      \
        /------------------\
```

A base deve ser composta por testes rápidos e relativamente baratos.

Conforme subimos na pirâmide:

- aumenta o custo;
- aumenta a quantidade de dependências;
- aumenta o tempo de execução;
- aumenta a complexidade de diagnóstico.

Por isso, não é desejável transformar todo comportamento em testes end-to-end.

---

# 5. Camadas de Testes

A estratégia do Exactum considera principalmente:

```text
Unit Tests
Integration Tests
API Tests
Contract Tests
End-to-End Tests
```

Nem toda parte do sistema precisa possuir o mesmo nível de teste.

A quantidade e o tipo de teste devem depender do risco e da responsabilidade do componente.

---

# 6. Unit Tests

Unit Tests verificam unidades relativamente isoladas do sistema.

Podem incluir:

- funções;
- regras de negócio;
- validações;
- transformações;
- helpers;
- componentes de domínio;
- Application Services desacoplados;
- políticas de autorização;
- cálculos.

Exemplo conceitual:

```python
def test_product_cannot_have_negative_stock():
    ...
```

O objetivo é testar uma regra específica sem envolver toda a infraestrutura.

---

# 7. O que Deve Ser Unit-Tested

Algumas áreas são particularmente adequadas para Unit Tests.

## Business Rules

Exemplos:

```text
stock cannot become negative
invalid state transition
permission evaluation
validation rules
```

## Domain Logic

Quando a lógica estiver suficientemente desacoplada do framework, ela deve preferencialmente ser testada sem Flask, HTTP ou banco.

## Utility Functions

Funções determinísticas também devem possuir testes diretos.

---

# 8. Application Services

Application Services podem exigir diferentes níveis de teste dependendo de suas responsabilidades.

Quando um Service contém apenas lógica de orquestração, um Integration/API Test pode ser mais representativo.

Quando contém uma regra de negócio isolável, Unit Tests podem ser apropriados.

A estratégia não deve obrigar cada método a possuir um Unit Test apenas para aumentar coverage.

---

# 9. Integration Tests

Integration Tests verificam a interação entre componentes reais.

Exemplos:

```text
Application Service
        ↓
Repository
        ↓
PostgreSQL
```

ou:

```text
Authentication
        ↓
JWT
        ↓
Redis session
```

Esses testes são importantes porque muitos problemas reais não aparecem em testes unitários.

Por exemplo:

- query incorreta;
- migration incompatível;
- constraint;
- transaction;
- serialization;
- Redis state;
- tenant filter.

---

# 10. PostgreSQL nos Testes

Testes que dependem de comportamento real do PostgreSQL devem, quando necessário, utilizar uma instância de PostgreSQL de teste.

Isso é importante porque bancos reais possuem comportamentos que não devem ser completamente simulados.

Exemplos:

- constraints;
- foreign keys;
- unique indexes;
- transactions;
- query behavior;
- NULL semantics;
- locking;
- indexes;
- migrations.

Um mock de repository não consegue provar que a query SQL realmente funciona.

---

# 11. Repository Tests

Repositories devem ser testados principalmente através de Integration Tests quando o comportamento depende do banco.

Exemplos:

```text
create
get
list
update
delete
restore
tenant filtering
soft delete filtering
```

Um Repository pode parecer correto em Unit Tests, mas falhar quando executado contra PostgreSQL.

---

# 12. Tenant-Aware Repository Tests

Como o Exactum é multi-tenant, testes de Repository devem verificar explicitamente o isolamento.

Exemplo:

```text
Tenant A
 ├── Product A1
 └── Product A2

Tenant B
 └── Product B1
```

Uma consulta realizada no contexto do Tenant A não pode retornar:

```text
Product B1
```

Esse comportamento deve ser testado diretamente.

---

# 13. Tenant Isolation Tests

Tenant isolation merece uma categoria própria de testes.

Devem existir casos que verifiquem:

```text
tenant A cannot read tenant B
tenant A cannot update tenant B
tenant A cannot delete tenant B
tenant A cannot restore tenant B
tenant A cannot reference tenant B resources
```

O objetivo não é testar apenas o caminho feliz.

O sistema deve provar que acessos indevidos são rejeitados.

---

# 14. Authorization Tests

Authentication e Authorization devem ser testadas separadamente.

Um usuário autenticado não significa necessariamente que ele pode executar determinada operação.

Testes devem verificar combinações como:

```text
Authenticated + Authorized → success
Authenticated + Unauthorized → 403
Unauthenticated → 401
```

Também devem existir testes para:

- role;
- permission;
- tenant;
- resource;
- impersonation.

---

# 15. Authentication Tests

A estratégia de Authentication deve cobrir o ciclo completo.

```text
Login
 ↓
Access Token
 ↓
Refresh Token
 ↓
Session
 ↓
Rotation
 ↓
Logout
 ↓
Revocation
```

Casos importantes incluem:

- login válido;
- login inválido;
- usuário inexistente;
- usuário bloqueado;
- tenant suspenso;
- access token expirado;
- refresh token válido;
- refresh token expirado;
- refresh token revogado;
- refresh rotation;
- logout.

---

# 16. HttpOnly Cookie Tests

Como a autenticação do Exactum utiliza HttpOnly cookies, os testes devem verificar não apenas o JWT, mas também o comportamento dos cookies HTTP.

Validar:

- cookie de access;
- cookie de refresh;
- atributos;
- Path;
- expiração;
- remoção no logout.

O objetivo é evitar regressões em que o backend gera tokens corretamente, mas o browser não consegue utilizá-los.

---

# 17. Refresh Session Tests

O Redis participa do gerenciamento de refresh sessions.

Portanto, devem existir testes para:

```text
session creation
session lookup
session rotation
session revocation
session expiration
logout invalidation
```

Também devem existir testes para situações como:

```text
valid JWT + missing Redis session
```

e:

```text
valid JWT + revoked Redis session
```

---

# 18. Impersonation Tests

Impersonation é uma funcionalidade de alto impacto e deve possuir testes específicos.

Testar:

```text
super-admin can start impersonation
unauthorized actor cannot impersonate
target user must exist
target tenant must exist
impersonation state is created
access identity changes
refresh identity remains associated with original actor
stop impersonation restores original context
```

Também deve ser testado o comportamento quando o estado do Redis é perdido ou invalidado.

---

# 19. API Tests

API Tests verificam o comportamento HTTP observável.

Eles devem validar:

- endpoint;
- method;
- status code;
- request;
- response;
- headers;
- cookies;
- validation;
- authentication;
- authorization;
- error format.

Exemplo:

```python
def test_create_product_returns_201(client, authenticated_user):
    response = client.post(
        "/api/products",
        json={
            "name": "Keyboard",
            "price": 100,
        },
    )

    assert response.status_code == 201
```

---

# 20. API Contract

A API deve possuir comportamento previsível.

Testes devem verificar contratos como:

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Além do status code, o formato da resposta também deve ser validado quando relevante.

Por exemplo:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

# 21. Validation Tests

Schemas e validações devem possuir testes para:

- required fields;
- invalid types;
- invalid formats;
- invalid values;
- nullability;
- malformed payloads;
- unexpected payloads.

Devem existir testes positivos e negativos.

---

# 22. Error Handling Tests

O tratamento centralizado de exceptions deve ser testado.

Exemplos:

```text
known application exception
validation exception
authentication exception
authorization exception
database conflict
unexpected exception
```

O sistema deve:

1. retornar status apropriado;
2. retornar formato consistente;
3. não expor informações sensíveis;
4. registrar o erro adequadamente.

---

# 23. Error Contract Stability

O `error.code` deve ser tratado como parte importante do contrato da API.

Por isso, mudanças aparentemente pequenas em mensagens não devem necessariamente quebrar consumidores.

Testes devem priorizar:

```text
HTTP status
+
error.code
+
response structure
```

em vez de depender excessivamente do texto completo da mensagem.

---

# 24. Soft Delete Tests

Entidades que utilizam Soft Delete devem possuir testes para:

```text
delete
list active
get active
restore
list deleted
authorization
tenant isolation
```

Um registro deletado logicamente não deve aparecer em consultas normais quando essa for a regra do domínio.

---

# 25. Soft Delete e Uniqueness

Quando Soft Delete interagir com regras de unicidade, os testes devem verificar explicitamente o comportamento esperado.

Exemplo conceitual:

```text
Product A
deleted_at != null

Product A recreated
```

O comportamento depende da regra definida no banco e no domínio.

Não deve ser assumido automaticamente que o registro deletado pode ou não pode ser recriado.

---

# 26. Database Migration Tests

Migrations devem ser testadas principalmente como parte da integração do banco.

A pipeline deve verificar que:

```text
fresh database
       ↓
all migrations
       ↓
current schema
```

funciona corretamente.

Quando necessário, também deve ser verificada a compatibilidade de versões anteriores.

---

# 27. Testes de Integridade

O banco deve ser utilizado para verificar:

- foreign keys;
- unique constraints;
- tenant-aware constraints;
- nullability;
- status;
- timestamps;
- soft delete;
- relationships.

Isso evita que a aplicação seja a única camada responsável pela integridade.

---

# 28. Transaction Tests

Operações que possuem múltiplas alterações devem testar comportamento transacional.

Exemplo:

```text
Create Sale
 ↓
Create Sale Items
 ↓
Update Stock
```

Se uma etapa falhar, o comportamento esperado pode ser:

```text
rollback
```

O teste deve verificar o estado final do banco, e não apenas o exception levantado.

---

# 29. Concurrency

Operações sensíveis à concorrência devem receber atenção especial.

Exemplos:

- estoque;
- vendas;
- sessões;
- refresh rotation;
- alterações simultâneas.

Testes de concorrência podem ser mais complexos e não precisam existir para toda operação.

Entretanto, funcionalidades com risco real de race condition devem possuir cobertura apropriada.

---

# 30. Testes de Estoque

O estoque é uma das áreas mais sensíveis do ERP.

Os testes devem considerar:

```text
increase
decrease
insufficient stock
sale
rollback
concurrent operation
tenant isolation
```

O objetivo é garantir que operações críticas não produzam estados impossíveis.

---

# 31. Testes de Vendas

As operações de venda devem verificar:

- criação;
- itens;
- valores;
- estado;
- estoque;
- tenant;
- autorização;
- transação;
- rollback;
- histórico.

Uma venda não deve ser considerada apenas uma inserção em uma tabela.

Ela representa uma operação de negócio que pode afetar outras entidades.

---

# 32. Testes de Observability

Observability também pode ser testada.

Exemplos:

```text
request generates request_id
error is logged
platform event is generated
audit event is generated
tenant context is preserved
```

O objetivo não é testar o texto inteiro de cada log.

Deve-se testar principalmente a presença e integridade dos campos relevantes.

---

# 33. Logging Tests

Quando logs estruturados forem críticos, testes podem verificar campos como:

```text
request_id
user_id
tenant_id
event
status_code
```

Evite testes excessivamente frágeis que dependam da ordem exata de campos ou mensagens não contratuais.

---

# 34. Audit Logging Tests

Operações relevantes devem gerar Audit Logs conforme definido pela arquitetura.

Testar, quando aplicável:

```text
actor
tenant
action
resource
target
outcome
request_id
```

Também deve ser validado que dados sensíveis não sejam armazenados indevidamente.

---

# 35. Platform Event Tests

Platform Events devem possuir testes para:

- event type;
- actor;
- tenant;
- target;
- request_id;
- metadata;
- event ID;
- geração no fluxo correto.

Quando eventos forem introduzidos em processamento assíncrono, testes adicionais de idempotency deverão ser considerados.

---

# 36. Correlation Tests

O `request_id` deve permanecer consistente dentro de uma requisição.

Exemplo conceitual:

```text
HTTP request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Audit/Event
```

Os registros associados à operação devem poder ser correlacionados.

---

# 37. Rate Limiting Tests

Rate limiting deve possuir testes para:

```text
below limit
at limit
above limit
reset
different identities
```

Dependendo da implementação, também pode ser necessário verificar:

- IP;
- user;
- tenant;
- endpoint.

O objetivo é evitar tanto ausência de proteção quanto bloqueios indevidos.

---

# 38. Mocking

Mocks devem ser utilizados com moderação.

Eles são úteis quando:

- dependência externa é cara;
- comportamento é difícil de reproduzir;
- componente precisa ser isolado;
- teste unitário precisa controlar uma dependência.

Entretanto, mocks não devem substituir sistematicamente:

- PostgreSQL;
- Redis;
- repositories;
- application behavior.

Um excesso de mocking pode produzir testes que passam enquanto a integração real está quebrada.

---

# 39. Fake vs Mock vs Real Dependency

Uma escolha de teste deve considerar o objetivo.

```text
Unit Test
   ↓
Fake/Mock
```

pode ser apropriado.

Enquanto:

```text
Integration Test
   ↓
Real PostgreSQL
```

é mais apropriado para verificar comportamento real do banco.

A pergunta principal deve ser:

> **O que este teste precisa provar?**

---

# 40. Fixtures

Fixtures devem fornecer dados previsíveis e reutilizáveis.

Exemplos:

```text
tenant
user
admin
super-admin
product
sale
session
authenticated client
```

Fixtures devem evitar excesso de dados implícitos.

Uma fixture deve ser relativamente fácil de entender quando utilizada em um teste.

---

# 41. Test Data

Dados de teste devem ser:

- determinísticos;
- mínimos;
- legíveis;
- relevantes;
- independentes entre testes.

Evite criar objetos gigantes quando o teste necessita apenas de:

```text
User
```

e:

```text
Tenant
```

---

# 42. Database Isolation

Testes de integração devem possuir isolamento adequado.

Estratégias possíveis incluem:

- transaction rollback;
- database reset;
- isolated schema;
- dedicated test database.

A estratégia escolhida deve considerar:

```text
speed
+
correctness
+
parallel execution
```

O mecanismo utilizado não deve permitir que um teste contamine outro.

---

# 43. Redis Isolation

Da mesma forma, testes que utilizam Redis precisam evitar estado compartilhado.

Isso pode envolver:

- database lógico dedicado;
- prefixos;
- cleanup;
- container específico;
- flush controlado.

A estratégia deve evitar que uma sessão criada em um teste influencie outro.

---

# 44. Test Naming

Nomes de testes devem descrever comportamento.

Preferir:

```python
def test_user_without_permission_cannot_delete_product():
    ...
```

em vez de:

```python
def test_delete_product_2():
    ...
```

O nome deve ajudar a entender a falha sem abrir imediatamente o código.

---

# 45. Arrange / Act / Assert

Quando apropriado:

```python
def test_example():
    # Arrange
    ...

    # Act
    ...

    # Assert
    ...
```

Isso torna a intenção do teste clara.

Testes muito pequenos podem não precisar de comentários explícitos.

---

# 46. Parametrization

Quando vários casos possuem a mesma estrutura, parametrização pode reduzir duplicação.

Exemplo conceitual:

```python
@pytest.mark.parametrize(
    "status_code",
    [401, 403],
)
def test_access_is_rejected(status_code):
    ...
```

Entretanto, parametrização não deve tornar o teste difícil de ler.

---

# 47. Coverage

Coverage é uma métrica útil, mas não deve ser tratada como objetivo absoluto.

Por exemplo:

```text
90% coverage
```

não significa automaticamente:

```text
90% confidence
```

Um teste pode executar uma linha sem verificar corretamente seu comportamento.

Coverage deve ser utilizada para identificar áreas sem testes, não para substituir análise de risco.

---

# 48. Coverage Atual

O Exactum já utiliza coverage como parte da estratégia de qualidade e historicamente mantém uma cobertura próxima de **89–90%**.

Esse número deve ser interpretado como uma métrica de suporte à qualidade, e não como a definição da qualidade do sistema.

A prioridade deve permanecer sobre funcionalidades críticas.

---

# 49. High-Risk Areas

Áreas de maior risco devem possuir cobertura mais forte, independentemente do percentual global.

No Exactum, isso inclui principalmente:

```text
Authentication
Authorization
Tenant Isolation
Session Management
Impersonation
Stock
Sales
Database Transactions
Soft Delete
Error Handling
```

Essas áreas podem justificar múltiplas camadas de testes.

---

# 50. Regression Tests

Todo bug relevante identificado deve gerar, quando apropriado, um Regression Test.

Fluxo:

```text
Bug
 ↓
Reproduce
 ↓
Write failing test
 ↓
Fix
 ↓
Test passes
```

Isso transforma uma falha passada em uma proteção futura.

---

# 51. Testes Antes de Refactors

Refactors estruturais devem ser precedidos por testes suficientes para proteger o comportamento atual.

Isso é especialmente importante para o processo de evolução do Exactum.

Exemplo:

```text
Current layered architecture
        ↓
Tests
        ↓
Refactor
        ↓
DDD-inspired boundaries
        ↓
Tests remain green
```

O objetivo é permitir mudança estrutural sem alterar comportamento involuntariamente.

---

# 52. Testes Durante Evolução Arquitetural

À medida que o Exactum evolui:

```text
Current domains
      ↓
Stronger boundaries
      ↓
Future contexts
```

os testes devem acompanhar os limites arquiteturais.

Quando uma responsabilidade for extraída para outro contexto, seus testes devem acompanhar a responsabilidade.

Isso evita que a suíte continue refletindo uma arquitetura antiga depois de uma grande refatoração.

---

# 53. API Tests vs Service Tests

Nem toda regra precisa ser testada através da API.

Quando uma regra puder ser testada diretamente:

```text
Service/Domain Test
```

pode ser mais rápido e preciso.

Já o comportamento HTTP deve ser validado por:

```text
API Test
```

Uma mesma funcionalidade pode possuir ambos quando cada teste estiver validando uma preocupação diferente.

---

# 54. Testes de Segurança

Security Tests devem verificar principalmente:

```text
authentication bypass
authorization bypass
tenant isolation
IDOR-like access
privilege escalation
session invalidation
impersonation boundaries
sensitive data exposure
```

O objetivo é provar que controles de segurança não existem apenas nominalmente.

---

# 55. IDOR / Object-Level Authorization

Como os recursos utilizam identificadores públicos, testes devem verificar que conhecer um UUID não concede acesso automaticamente.

Exemplo:

```text
User A
Tenant A
Product A
```

tentando acessar:

```text
Product B
Tenant B
```

deve resultar no comportamento de segurança esperado.

Isso é particularmente importante em APIs REST.

---

# 56. Authentication ≠ Authorization

Testes devem manter explicitamente a diferença:

```text
Authentication
→ Who are you?

Authorization
→ What are you allowed to do?
```

Um teste de login não prova autorização.

Um teste de permission não prova que a sessão está correta.

Cada responsabilidade deve possuir cobertura própria.

---

# 57. Negative Testing

A suíte deve possuir testes negativos.

Não basta testar:

```text
valid request → success
```

Também deve testar:

```text
invalid request → expected failure
```

Exemplos:

- credentials inválidas;
- permission ausente;
- tenant incorreto;
- resource inexistente;
- payload inválido;
- estado inválido;
- estoque insuficiente;
- sessão revogada.

---

# 58. Boundary Testing

Valores de fronteira são importantes.

Exemplos:

```text
0
1
minimum
maximum
empty
null
expired
already deleted
already revoked
```

Esses valores frequentemente revelam bugs que casos comuns não detectam.

---

# 59. Testes de Estado

Entidades com estados devem possuir testes para transições válidas e inválidas.

Exemplo conceitual:

```text
State A
  ↓
valid transition
  ↓
State B
```

e:

```text
State A
  ↓
invalid transition
  ↓
rejected
```

Isso evita que operações pulem etapas importantes do domínio.

---

# 60. Testes de API e Cookies

Como cookies fazem parte da autenticação, API Tests devem validar:

```text
Set-Cookie
Cookie Path
HttpOnly
Secure
SameSite
expiration
```

quando esses atributos fizerem parte do comportamento esperado.

Isso protege contra regressões como:

```text
login succeeds
but browser cannot refresh
```

---

# 61. Testes de CORS

Quando CORS for relevante, testar:

- allowed origin;
- rejected origin;
- credentials;
- preflight;
- methods;
- headers.

O teste deve refletir a configuração real do ambiente.

---

# 62. Testes de Configuration

Configurações críticas podem ser validadas durante startup ou CI.

Exemplos:

```text
required environment variables
database configuration
Redis configuration
JWT configuration
CORS configuration
production safety settings
```

O objetivo é falhar cedo quando uma configuração obrigatória estiver ausente ou inválida.

---

# 63. Testes de Health Check

O health endpoint deve possuir testes que diferenciem:

```text
application healthy
```

de:

```text
dependency unavailable
```

quando essa distinção fizer parte do contrato.

Isso é importante para deployment e operações.

---

# 64. Testes de Docker

Docker não precisa ser testado como cada instrução de Dockerfile individualmente.

O foco deve estar em comportamento:

```text
image builds
container starts
environment loads
application becomes healthy
dependencies are reachable
```

Esses testes podem ser executados principalmente no CI.

---

# 65. Testes de CI

A pipeline deve executar pelo menos:

```text
Lint
 ↓
Unit Tests
 ↓
Integration/API Tests
 ↓
Coverage
```

Dependendo da arquitetura, podem existir etapas adicionais.

O objetivo é impedir que mudanças incompatíveis cheguem ao ambiente de produção.

---

# 66. Testes Locais

Antes de abrir Pull Request ou realizar deployment, o desenvolvedor deve conseguir executar localmente:

```bash
pytest
```

e:

```bash
ruff check .
```

Quando aplicável:

```bash
ruff format --check .
```

A execução local deve ser consistente com o CI.

---

# 67. CI vs Local

Idealmente:

```text
Local
   ≈
CI
```

Diferenças inevitáveis devem ser documentadas.

Se um teste passa localmente mas falha no CI, a investigação deve considerar:

- environment;
- database;
- Redis;
- timezone;
- dependencies;
- filesystem;
- concurrency;
- Docker;
- Python version.

---

# 68. Flaky Tests

Um **flaky test** é um teste que alterna entre passar e falhar sem alteração relevante no código.

Exemplo:

```text
run 1 → PASS
run 2 → FAIL
run 3 → PASS
```

Flaky tests são perigosos porque reduzem a confiança na suíte.

Eles devem ser investigados e corrigidos, não simplesmente ignorados.

---

# 69. Principais Causas de Flakiness

Possíveis causas:

- timing;
- race condition;
- estado compartilhado;
- dependência externa;
- timezone;
- random data;
- ordem de execução;
- concorrência;
- recursos insuficientes.

---

# 70. Testes Paralelos

Quando testes forem executados em paralelo, garantir que:

- banco esteja isolado;
- Redis esteja isolado;
- fixtures sejam independentes;
- arquivos temporários sejam únicos;
- portas não entrem em conflito.

Parallelism pode reduzir tempo de CI, mas aumenta as exigências de isolamento.

---

# 71. External Services

Chamadas para serviços externos devem ser isoladas quando apropriado.

Não é desejável que a suíte principal dependa da disponibilidade da Internet.

Para esses casos, podem ser utilizados:

- mocks;
- fakes;
- stubs;
- contract tests;
- ambientes de teste.

Quando a integração real for importante, deve existir uma estratégia separada para validá-la.

---

# 72. Testes de Contrato

Contract Tests verificam se uma integração continua respeitando um contrato esperado.

Isso se torna mais importante à medida que o Exactum possuir:

- frontend separado;
- APIs externas;
- background workers;
- serviços adicionais.

O contrato pode incluir:

```text
request
response
status
schema
authentication
error format
```

---

# 73. Testes End-to-End

End-to-End Tests verificam fluxos completos.

Exemplo:

```text
Login
 ↓
Create Product
 ↓
Create Sale
 ↓
Stock Updated
 ↓
Logout
```

Eles são úteis para verificar integração sistêmica.

Porém, não devem substituir Unit e Integration Tests.

---

# 74. E2E com Moderação

E2E Tests são normalmente:

- mais lentos;
- mais frágeis;
- mais caros de manter;
- mais difíceis de diagnosticar.

Por isso, devem ser reservados para fluxos críticos.

Exemplos:

```text
authentication
critical sales flow
critical stock flow
```

---

# 75. Testes de Regressão de Autenticação

Como Authentication possui alto impacto sistêmico, mudanças nesse módulo devem executar uma suíte de regressão cobrindo:

```text
login
refresh
logout
revocation
cookies
session
blocked user
suspended tenant
impersonation
```

Isso reduz o risco de alterações aparentemente pequenas quebrarem a sessão inteira da aplicação.

---

# 76. Testes de Regressão de Multi-Tenancy

Mudanças em:

- repositories;
- middleware;
- services;
- models;
- queries;
- authorization;

devem considerar regressão de tenant isolation.

Um teste que funciona para um tenant isoladamente não prova que a aplicação continua segura com múltiplos tenants.

---

# 77. Testes de Regressão de Database

Mudanças em schema devem executar testes relacionados a:

```text
migration
constraints
repositories
services
API
```

O objetivo é detectar inconsistências entre:

```text
Database
+
Application
+
API contract
```

---

# 78. Testes de Performance

Performance Tests não precisam fazer parte de cada Pull Request.

Podem ser executados em ciclos específicos.

Áreas candidatas:

- list endpoints;
- search;
- reports;
- stock operations;
- large datasets;
- authentication;
- high request volume.

O objetivo é detectar regressões significativas.

---

# 79. Testes com Dados Grandes

Uma aplicação pode funcionar corretamente com:

```text
10 products
```

e apresentar problemas com:

```text
100,000 products
```

Quando uma funcionalidade depende de volume de dados, testes de escala devem ser considerados.

Exemplos:

- pagination;
- sorting;
- filtering;
- reporting;
- inventory;
- sales history.

---

# 80. Security Regression

Correções de segurança devem gerar testes permanentes sempre que possível.

Exemplo:

```text
Security bug
 ↓
Regression test
 ↓
Fix
 ↓
Permanent protection
```

Isso evita que a mesma vulnerabilidade reapareça durante refactors.

---

# 81. Testes como Documentação

Uma boa suíte também funciona como documentação executável.

Por exemplo:

```python
def test_user_without_permission_cannot_delete_product():
    ...
```

comunica uma regra arquitetural:

> usuários sem determinada permission não podem deletar produtos.

Isso é particularmente valioso em projetos que passam por refactors.

---

# 82. O que Não Testar Excessivamente

Nem tudo precisa de testes extremamente detalhados.

Evite excesso de testes para:

- implementação trivial;
- getters/setters sem comportamento;
- framework internals;
- código de terceiros;
- detalhes que não fazem parte do contrato.

O objetivo é investir esforço onde existe risco real.

---

# 83. Testes e Refactoring

Uma suíte saudável deve permitir que o código interno mude enquanto o comportamento externo permanece estável.

Exemplo:

```text
Repository structure
      ↓
refactor
      ↓
Domain structure
      ↓
same API behavior
```

Se os testes dependem excessivamente da estrutura interna, grandes refactors se tornam desnecessariamente difíceis.

---

# 84. Definition of Done para Código

Uma alteração pode ser considerada pronta quando, conforme aplicável:

```text
[ ] Behavior implemented
[ ] Unit tests updated
[ ] Integration tests updated
[ ] API tests updated
[ ] Regression test added
[ ] Security implications checked
[ ] Tenant isolation checked
[ ] Coverage acceptable
[ ] Ruff passes
[ ] CI passes
[ ] Documentation updated
```

Nem todos os itens são obrigatórios para todas as alterações.

A lista deve ser aplicada de acordo com o risco.

---

# 85. Definition of Done para Bugs

Para bugs relevantes:

```text
[ ] Bug reproduced
[ ] Root cause identified
[ ] Regression test created
[ ] Fix implemented
[ ] Existing tests pass
[ ] Security impact evaluated
[ ] Documentation updated if necessary
```

---

# 86. Testes e Pull Requests

Pull Requests devem considerar:

- comportamento alterado;
- novos testes;
- testes modificados;
- impacto em segurança;
- impacto em banco;
- impacto em tenant isolation;
- impacto em autenticação;
- impacto em performance.

Uma alteração significativa sem testes deve possuir justificativa técnica.

---

# 87. Testes e Coverage Threshold

Um threshold de coverage pode ser utilizado no CI como mecanismo de proteção.

Porém, ele deve ser tratado como **guardrail**, não como objetivo principal.

Um desenvolvedor não deve adicionar testes artificiais apenas para ultrapassar um número.

O foco continua sendo:

```text
Risk
+
Behavior
+
Regression Protection
```

---

# 88. Evolução da Estratégia

A estratégia atual deve evoluir junto com o Exactum.

Possíveis evoluções:

```text
Current
  ↓
More domain isolation
  ↓
More Unit Tests
  ↓
DDD-inspired architecture
  ↓
Domain Events
  ↓
Async processing
  ↓
Contract Tests
  ↓
E2E critical flows
  ↓
Performance/Load Tests
```

A estratégia de testes deve acompanhar a arquitetura, e não permanecer congelada.

---

# 89. Futuro com Celery e RabbitMQ

Quando background processing for introduzido, novas categorias serão necessárias:

- task tests;
- retry tests;
- idempotency tests;
- queue failure tests;
- duplicate message tests;
- worker failure tests;
- eventual consistency tests.

Por exemplo:

```text
Task
 ↓
Failure
 ↓
Retry
 ↓
Success
```

deve possuir comportamento determinístico.

---

# 90. Futuro com Observability

Com a introdução de:

- Prometheus;
- Grafana;
- OpenTelemetry;
- tracing;

testes poderão verificar não apenas o comportamento funcional, mas também se informações operacionais críticas continuam disponíveis.

---

# 91. Futuro com Mais Contextos de Domínio

À medida que responsabilidades sejam extraídas de domínios atuais para contextos mais específicos, os testes deverão acompanhar essa evolução.

Por exemplo, caso responsabilidades atualmente associadas a Products/Sales sejam futuramente extraídas para contextos como:

```text
Inventory
Reporting
```

a suíte deve refletir os novos limites.

Isso não significa criar contextos apenas para satisfazer testes.

A arquitetura deve continuar sendo guiada pelas responsabilidades do sistema, enquanto os testes acompanham essas fronteiras.

---

# 92. Test Strategy e DDD

Uma arquitetura mais orientada a domínio pode permitir testes mais próximos das regras de negócio.

Exemplo:

```text
Domain Rule
    ↓
Unit Test
```

enquanto:

```text
Infrastructure
    ↓
Integration Test
```

e:

```text
API
    ↓
API Test
```

Essa separação reduz o custo de testar regras fundamentais.

---

# 93. Test Isolation como Arquitetural Signal

Dificuldade excessiva para testar determinada parte do sistema pode revelar acoplamento arquitetural.

Por exemplo, se testar uma regra simples exige:

```text
Flask
+
HTTP
+
PostgreSQL
+
Redis
+
JWT
```

isso pode indicar que a regra está excessivamente acoplada à infraestrutura.

Nesse sentido, testes também podem funcionar como instrumento de avaliação arquitetural.

---

# 94. Testes e Qualidade de Código

Testing não substitui:

- code review;
- static analysis;
- linting;
- type checking quando aplicável;
- documentation;
- observability;
- threat modeling.

A qualidade do sistema é resultado da combinação dessas práticas.

---

# 95. Quality Gates

O CI deve funcionar como uma barreira de qualidade.

Exemplo:

```text
Commit
  ↓
Lint
  ↓
Tests
  ↓
Coverage
  ↓
Build
  ↓
Deploy
```

Uma etapa crítica falhando deve impedir a progressão para ambientes posteriores quando isso fizer parte da política do projeto.

---

# 96. Failure Diagnosis

Uma boa suíte deve tornar falhas diagnosticáveis.

Quando um teste falhar, deve ser relativamente fácil descobrir:

```text
What failed?
Where?
Why?
Which behavior changed?
```

Mensagens, fixtures, nomes e organização dos testes contribuem diretamente para isso.

---

# 97. Test Organization

A organização dos testes deve refletir, quando possível, a organização funcional do sistema.

Exemplo conceitual:

```text
tests/
├── unit/
├── integration/
├── api/
├── security/
└── e2e/
```

A estrutura concreta pode variar conforme o projeto, mas a separação de responsabilidades deve permanecer clara.

---

# 98. Current Testing Philosophy

A estratégia atual do Exactum pode ser resumida como:

```text
Fast feedback
+
Realistic integration
+
Strong security coverage
+
Regression protection
+
Deterministic execution
```

O projeto não busca simplesmente possuir muitos testes.

Busca possuir **testes que reduzam risco técnico real**.

---

# 99. Estado Atual

O Exactum já possui uma suíte de testes significativa baseada em **Pytest**, incluindo testes relacionados a:

- API;
- Authentication;
- Authorization;
- banco;
- regras da aplicação;
- segurança;
- integração;
- regressões.

A cobertura histórica do projeto permanece próxima de **89–90%**, servindo como uma métrica de acompanhamento da qualidade.

O CI também utiliza os testes como parte da validação antes de alterações chegarem aos ambientes posteriores.

A estratégia atual ainda pode evoluir conforme o projeto adote:

- boundaries de domínio mais fortes;
- maior desacoplamento;
- Redis em mais fluxos;
- background processing;
- Prometheus/Grafana;
- Celery;
- RabbitMQ;
- novas integrações.

---

# 100. Princípios Finais

A estratégia de Testing do Exactum pode ser resumida em:

1. **Test behavior, not implementation.**
2. **Prefer fast tests when isolation is possible.**
3. **Use real infrastructure when integration behavior matters.**
4. **Treat security as a first-class testing concern.**
5. **Test tenant isolation explicitly.**
6. **Protect authentication and session flows.**
7. **Use regression tests for important bugs.**
8. **Do not optimize solely for coverage percentage.**
9. **Keep tests deterministic and isolated.**
10. **Use tests to enable refactoring.**
11. **Keep API contracts stable and explicit.**
12. **Increase testing depth as architectural complexity increases.**

---

# 101. Observação sobre Nomenclatura e Evolução Arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo:

```text
actor
```

é utilizado como conceito arquitetural para representar quem originou ou executou uma ação, enquanto a implementação atual pode representá-lo por:

```text
user_uuid
```

Da mesma forma:

```text
tenant
```

pode ser representado atualmente por:

```text
tenant_uuid
```

e:

```text
resource
```

pode corresponder a identificadores concretos como:

```text
product_uuid
sale_uuid
user_uuid
```

Essa distinção permite que a documentação descreva responsabilidades e conceitos arquiteturais sem limitar sua definição aos detalhes atuais da implementação.

A estratégia de testes também deverá evoluir conforme a arquitetura do Exactum evoluir. Novos limites de domínio, contextos, processos assíncronos, integrações e mecanismos de infraestrutura poderão exigir novas categorias de testes.

Portanto, este documento representa a **estratégia de Testing atual e sua direção de evolução**, e não uma especificação imutável da suíte futura.

---

# 102. Conclusão

Testing no Exactum não é tratado apenas como uma etapa posterior ao desenvolvimento.

Ele faz parte da própria estratégia de engenharia.

Uma suíte de testes bem estruturada permite:

```text
desenvolver
   ↓
alterar
   ↓
refatorar
   ↓
evoluir arquitetura
   ↓
validar
```

com menor risco.

O principal objetivo não é alcançar um número específico de coverage.

É construir confiança suficiente para que mudanças importantes possam ser realizadas sem transformar cada refactor em uma operação de alto risco.

Nesse sentido, a estratégia do Exactum combina:

```text
Unit Tests
+
Integration Tests
+
API Tests
+
Security Tests
+
Regression Tests
+
CI Quality Gates
```

formando uma camada de proteção que acompanha a evolução do sistema.

À medida que o Exactum avançar para boundaries de domínio mais fortes, processamento assíncrono, observabilidade mais madura e novas integrações, essa estratégia deverá crescer junto com a arquitetura.

O princípio permanece o mesmo:

> **cada mudança importante deve possuir uma forma proporcional de demonstrar que o sistema continua correto, seguro e previsível.**
