# ADR-002 — Public UUID Identifiers

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Architecture
- **Related Areas:** API, Database, Security, Architecture
- **Supersedes:** None
- **Superseded By:** None

---

# 1. Context

O Exactum possui uma API utilizada pelo frontend e que expõe recursos como:

- users;
- tenants;
- products;
- sales;
- permissions;
- outros recursos da aplicação.

Esses recursos precisam possuir identificadores estáveis para serem referenciados pela API.

O banco de dados, por sua vez, pode utilizar identificadores internos voltados principalmente para persistência e relacionamento entre entidades.

Surgiu, portanto, a necessidade de definir se o identificador utilizado internamente no banco deveria ser necessariamente o mesmo identificador exposto publicamente pela API.

Uma alternativa seria utilizar diretamente um identificador numérico:

```text
Product
    id = 42
```

e expor esse valor:

```http
GET /products/42
```

Outra alternativa seria utilizar um UUID como identificador público:

```text
Product
    internal_id = 42
    uuid = "..."
```

e expor:

```http
GET /products/{uuid}
```

O Exactum precisa também considerar:

- segurança;
- multi-tenancy;
- exposição de recursos pela API;
- relações entre entidades;
- evolução do banco;
- possibilidade de alteração da estratégia interna de persistência;
- interoperabilidade entre serviços futuros;
- consistência dos contratos da API.

---

# 2. Decision

O Exactum adotará **UUID como identificador público dos recursos expostos pela API**.

O identificador público será utilizado para referenciar entidades através da API, enquanto a implementação interna poderá utilizar um identificador diferente para persistência.

Conceitualmente:

```text
             API
              │
              ↓
        Public UUID
              │
              ↓
       Application Layer
              │
              ↓
      Internal Identifier
              │
              ↓
         PostgreSQL
```

Por exemplo:

```text
Product
├── id        → internal persistence identifier
├── uuid      → public identifier
├── tenant_id
├── tenant_uuid
├── name
└── ...
```

A API deve preferencialmente trabalhar com o identificador público.

A resolução entre identificador público e identificador interno deve ocorrer dentro das camadas apropriadas da aplicação, sem exigir que o cliente conheça detalhes internos da persistência.

---

# 3. Rationale

A principal motivação para essa decisão é separar a **identidade pública de um recurso** de sua **representação interna de persistência**.

O identificador exposto pela API faz parte do contrato externo do sistema.

O identificador interno, por outro lado, é uma preocupação de implementação.

Essa separação permite que o banco evolua sem necessariamente exigir uma alteração no contrato público da API.

Conceitualmente:

```text
Public Contract
       │
       ↓
   UUID remains
       │
       ↓
Internal Database
       │
       ├── Integer PK
       ├── UUID PK
       └── Other strategy
```

A API, portanto, não precisa ficar acoplada à estratégia específica utilizada para identificação interna dos registros.

---

# 4. Public Identifier vs Internal Identifier

A arquitetura diferencia explicitamente dois conceitos.

## 4.1 Public Identifier

É o identificador utilizado para referenciar um recurso através da API.

Exemplo:

```http
GET /api/products/018f...
```

Esse identificador pode aparecer em:

- URLs;
- request bodies;
- responses;
- relações entre recursos;
- logs;
- eventos;
- referências externas.

---

## 4.2 Internal Identifier

É o identificador utilizado internamente pela persistência.

Sua função principal é facilitar:

- primary keys;
- foreign keys;
- joins;
- indexação;
- operações internas;
- relacionamento entre entidades.

O cliente da API não deve depender desse identificador.

---

# 5. API Contract

O UUID público faz parte do contrato da API.

Exemplo conceitual:

```json
{
  "uuid": "018f...",
  "name": "Product A",
  "price": 49.9
}
```

Em uma URL:

```http
GET /api/products/018f...
```

O cliente deve utilizar o UUID fornecido pela API para referenciar o recurso.

O frontend não deve precisar conhecer:

```text
internal database id
database sequence
table implementation
```

A API atua como uma abstração sobre a persistência.

---

# 6. Why Not Expose Sequential Integer IDs?

Uma alternativa seria expor diretamente IDs incrementais:

```text
1
2
3
4
5
...
```

Por exemplo:

```http
GET /products/41
GET /products/42
GET /products/43
```

Esse modelo possui algumas características indesejáveis para o contrato público do Exactum.

---

## 6.1 Resource Enumeration

IDs sequenciais facilitam perceber a existência de uma sequência de recursos.

Por exemplo:

```text
GET /products/100
GET /products/101
GET /products/102
```

Isso permite inferir facilmente que outros identificadores podem existir.

Isso **não constitui, por si só, uma vulnerabilidade de autorização**.

Mesmo utilizando UUID, a aplicação continua obrigada a verificar:

- Authentication;
- Authorization;
- Tenant Isolation.

Portanto:

```text
UUID
 ≠
Authorization
```

O UUID reduz exposição estrutural do identificador, mas não substitui os controles de segurança.

---

# 7. Security Considerations

A utilização de UUID público oferece uma camada adicional de separação entre o contrato público e a estrutura interna.

Entretanto, o Exactum não considera UUID uma medida suficiente de proteção.

Uma requisição como:

```http
GET /products/{uuid}
```

deve passar pelos controles normais:

```text
Request
   ↓
Authentication
   ↓
Tenant Context
   ↓
Authorization
   ↓
Resource Resolution
   ↓
Response
```

Mesmo que o atacante conheça um UUID válido, isso não deve permitir acesso ao recurso se ele não possuir autorização.

Portanto:

> UUID é uma estratégia de identificação, não um mecanismo de autorização.

---

# 8. UUID and Tenant Isolation

A decisão também se relaciona diretamente com Multi-Tenancy.

Um recurso pode possuir:

```text
uuid
tenant_uuid
```

O UUID identifica o recurso.

O `tenant_uuid` identifica o contexto ao qual o recurso pertence.

Esses conceitos não devem ser confundidos.

```text
Resource Identity
       ↓
      uuid

Tenant Context
       ↓
   tenant_uuid
```

A resolução de um recurso deve considerar ambos os conceitos quando o recurso for tenant-scoped.

Por exemplo, conceitualmente:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid
  AND tenant_uuid = :tenant_uuid;
```

A existência de um UUID válido não elimina a necessidade de Tenant Isolation.

---

# 9. Identifier Resolution

Quando a API recebe um UUID público, a aplicação deve resolver esse identificador para a entidade correspondente.

Conceitualmente:

```text
HTTP
 ↓
Public UUID
 ↓
Controller
 ↓
Application Service
 ↓
Repository
 ↓
Resolve Entity
 ↓
Internal Persistence Identifier
```

A resolução pode ocorrer em diferentes pontos da arquitetura conforme a implementação evolua.

O princípio importante é:

> O conhecimento sobre identificadores internos não deve vazar para o contrato público da API.

---

# 10. Separation of Concerns

A separação entre identificador público e interno reforça a divisão entre:

```text
External Contract
       │
       ↓
      API
       │
       ↓
Application
       │
       ↓
Persistence Model
       │
       ↓
   Database
```

A API não deve precisar saber se o banco utiliza:

```text
integer
bigint
UUID
UUIDv7
composite key
```

para seus identificadores internos.

Essa independência facilita mudanças futuras na persistência.

---

# 11. Alternatives Considered

## 11.1 Sequential Integer as Public Identifier

### Example

```http
GET /products/42
```

### Advantages

- simples;
- compacto;
- fácil de indexar;
- familiar;
- fácil de depurar.

### Disadvantages

- expõe sequência;
- aumenta a previsibilidade dos identificadores;
- acopla o contrato público à estratégia de persistência;
- facilita enumeration;
- pode dificultar evolução da estratégia de identificação.

### Decision

**Não adotado como identificador público.**

---

# 12. UUID as Database Primary Key and Public Identifier

Outra alternativa seria utilizar o mesmo UUID como:

```text
Database Primary Key
+
Public API Identifier
```

Exemplo:

```text
Product
└── uuid = 018f...
```

### Advantages

- modelo conceitualmente simples;
- um único identificador;
- menor necessidade de resolução entre IDs;
- UUID já possui semântica pública.

### Disadvantages

- acopla diretamente a persistência ao identificador público;
- pode tornar decisões futuras de persistência mais difíceis;
- aumenta o tamanho de PKs/FKs quando comparado a identificadores numéricos;
- mistura uma preocupação de API com uma preocupação de armazenamento.

### Decision

Não é o modelo arquitetural escolhido como princípio obrigatório.

O sistema pode utilizar UUID em ambos os contextos quando tecnicamente apropriado, mas a arquitetura **não exige que o identificador público seja necessariamente a primary key interna**.

---

# 13. UUID Versions

A arquitetura não deve depender de propriedades específicas de uma versão de UUID sem que isso seja uma decisão explícita.

UUIDs podem ser gerados através de diferentes estratégias.

Entre elas:

```text
UUIDv4
UUIDv7
```

UUIDv4 fornece identificadores aleatórios.

UUIDv7 possui propriedades temporais que podem ser úteis em sistemas onde ordenação aproximada por criação seja desejável.

A escolha específica da versão deve ser tratada como uma decisão de implementação ou através de um novo ADR caso produza impacto arquitetural relevante.

---

# 14. UUID Generation

A geração de UUID deve ocorrer de maneira consistente.

Os identificadores devem:

- possuir formato válido;
- ser únicos;
- não depender de entrada controlada pelo cliente;
- ser gerados de forma confiável;
- permanecer estáveis durante o ciclo de vida do recurso.

O cliente não deve poder escolher arbitrariamente o UUID de um recurso existente.

Em operações de criação, a aplicação deve controlar a geração ou validação do identificador conforme as regras do domínio.

---

# 15. Identifier Immutability

Depois que um recurso recebe seu UUID público, esse identificador deve ser considerado estável.

Por exemplo:

```text
Product
uuid = 018f...
```

Se o produto alterar:

```text
name
price
stock
status
```

seu UUID não deve mudar.

O identificador representa a identidade do recurso e não seus atributos mutáveis.

---

# 16. Resource References

Recursos relacionados devem utilizar os identificadores públicos quando a referência fizer parte do contrato externo.

Exemplo:

```json
{
  "uuid": "018f...",
  "product_uuid": "018f...",
  "tenant_uuid": "018f..."
}
```

A nomenclatura específica deve seguir as convenções da API.

A documentação diferencia:

```text
resource identity
```

de:

```text
resource relationship
```

O UUID continua sendo o identificador do recurso.

---

# 17. Logging and Observability

UUIDs públicos podem aparecer em mecanismos de observabilidade quando necessários para investigação.

Por exemplo:

```text
request_id
tenant_uuid
user_uuid
product_uuid
sale_uuid
```

Entretanto, identificadores não devem ser utilizados indiscriminadamente como substitutos de contexto.

A estratégia de observabilidade deve continuar priorizando:

- `request_id`;
- tenant context;
- actor;
- resource;
- event;
- operation.

UUID identifica um recurso.

`request_id` identifica uma execução/request.

Esses conceitos possuem responsabilidades diferentes.

---

# 18. Audit Logs and Platform Events

A estratégia de observabilidade também utiliza identificadores públicos para relacionar eventos e recursos quando necessário.

Exemplo conceitual:

```json
{
  "event": "product.updated",
  "actor": "user-uuid",
  "tenant": "tenant-uuid",
  "resource": "product-uuid",
  "request_id": "request-id"
}
```

Nesse contexto:

```text
actor
   ↓
who

tenant
   ↓
where

resource
   ↓
what

request_id
   ↓
which execution
```

O uso desses identificadores ajuda a manter os registros correlacionáveis sem expor detalhes internos de persistência.

---

# 19. Database Considerations

A separação entre identificador público e interno permite que o banco seja otimizado independentemente do contrato da API.

Por exemplo:

```text
API
 ↓
UUID
 ↓
Application
 ↓
Internal ID
 ↓
PostgreSQL
```

O banco pode utilizar um identificador interno otimizado para:

- indexes;
- joins;
- foreign keys;
- storage;
- locality;
- performance.

Isso não altera o contrato público.

Essa flexibilidade é especialmente relevante para uma aplicação que ainda está evoluindo sua arquitetura.

---

# 20. Migration Implications

Caso a estratégia interna de identificação seja alterada no futuro, a API não precisa necessariamente mudar.

Por exemplo:

```text
Current

Public UUID
     ↓
Integer PK
```

poderia evoluir para:

```text
Future

Public UUID
     ↓
UUIDv7 PK
```

ou outra estratégia.

Enquanto o contrato público continuar utilizando o mesmo identificador estável, consumidores externos não precisam conhecer a mudança interna.

Essa separação reduz o impacto de migrations estruturais.

---

# 21. Performance Considerations

UUIDs possuem características diferentes de identificadores numéricos.

Dependendo da versão e da estratégia de armazenamento, UUIDs podem:

- ocupar mais espaço;
- produzir indexes maiores;
- influenciar locality;
- afetar insert patterns;
- impactar cache behavior.

Por isso, a decisão de expor UUID publicamente não implica que UUID seja obrigatoriamente a melhor escolha para todas as primary keys internas.

A arquitetura preserva a possibilidade de utilizar identificadores internos adequados às necessidades da persistência.

---

# 22. Distributed Systems Considerations

UUIDs também possuem uma característica útil para uma futura evolução do Exactum.

Em um sistema distribuído, diferentes componentes podem gerar identificadores sem depender necessariamente de uma sequence centralizada.

Conceitualmente:

```text
Service A
   ↓
UUID A

Service B
   ↓
UUID B
```

Isso pode ser útil caso o Exactum evolua para:

- background workers;
- event-driven processing;
- integrações externas;
- múltiplos serviços;
- processamento assíncrono.

Essa possibilidade não é o motivo principal da decisão atual, mas representa uma propriedade arquitetural favorável.

---

# 23. External Integrations

Caso recursos do Exactum sejam futuramente expostos a integrações externas, o UUID público poderá funcionar como identificador estável do recurso.

Por exemplo:

```text
Exactum
   ↓
External Integration
   ↓
Product UUID
```

Isso reduz a necessidade de expor detalhes internos do banco para sistemas externos.

Ainda assim, integrações externas devem possuir mecanismos próprios de:

- Authentication;
- Authorization;
- validation;
- idempotency;
- access control.

O conhecimento do UUID não concede acesso automaticamente.

---

# 24. Security Misconceptions

Esta decisão não deve gerar a interpretação de que UUID torna a API segura contra acesso indevido.

As seguintes afirmações são incorretas:

```text
UUID é imprevisível
        ↓
logo
UUID é autorização
```

ou:

```text
UUID é difícil de adivinhar
        ↓
logo
não preciso verificar tenant
```

ou:

```text
UUID substitui RBAC
```

Nenhuma dessas conclusões faz parte da arquitetura.

A segurança continua baseada em:

```text
Authentication
+
Authorization
+
Tenant Isolation
+
Input Validation
+
Secure Session Management
```

---

# 25. Consequences

## 25.1 Positive Consequences

### Menor acoplamento entre API e banco

O contrato externo não depende da estratégia interna de PK.

### Menor exposição estrutural

A API não precisa revelar identificadores sequenciais internos.

### Identificadores estáveis

O UUID pode permanecer associado ao recurso durante todo seu ciclo de vida.

### Facilidade para integrações

Sistemas externos podem referenciar recursos através de identificadores públicos.

### Flexibilidade arquitetural

A persistência pode evoluir sem necessariamente alterar o contrato da API.

### Adequação a sistemas distribuídos

UUIDs podem ser gerados sem depender exclusivamente de uma sequence centralizada.

---

# 26. Negative Consequences

### Maior complexidade

Existe uma distinção entre:

```text
public UUID
```

e:

```text
internal identifier
```

quando ambos não são o mesmo valor.

### Resolução adicional

A aplicação pode precisar resolver:

```text
UUID → Internal ID
```

antes de executar determinadas operações.

### UUIDs são maiores

Quando utilizados diretamente na persistência, podem produzir estruturas maiores que identificadores numéricos.

### Debugging

UUIDs são menos amigáveis visualmente do que pequenos IDs sequenciais.

Por exemplo:

```text
42
```

é mais simples de ler do que:

```text
018f3b7e-...
```

Isso é um trade-off aceitável para identificadores públicos.

---

# 27. Trade-offs

A decisão prioriza:

```text
API Abstraction
       +
Security Boundary
       +
Identifier Stability
       +
Future Evolution
```

em troca de:

```text
Additional Complexity
       +
Larger Identifiers
       +
Potential Resolution Overhead
```

O trade-off é considerado adequado ao modelo de evolução do Exactum.

---

# 28. Current State

Atualmente, o Exactum utiliza identificadores públicos baseados em UUID para recursos expostos pela API.

A arquitetura diferencia conceitualmente:

```text
Public Identity
       ↓
UUID

Internal Persistence Identity
       ↓
Database Identifier
```

A implementação pode utilizar uma combinação de UUIDs e identificadores internos conforme o recurso e sua evolução.

Essa separação deve ser preservada mesmo quando detalhes da implementação mudarem.

---

# 29. Future Evolution

A estratégia de identificadores poderá evoluir conforme o sistema cresça.

Possíveis mudanças futuras incluem:

- adoção consistente de UUIDv7;
- otimização dos indexes;
- revisão da estratégia de primary keys;
- integração com sistemas externos;
- múltiplos serviços;
- event-driven architecture;
- background processing;
- novos recursos distribuídos.

Caso uma dessas mudanças altere significativamente a decisão arquitetural atual, um novo ADR deverá ser criado.

Por exemplo:

```text
ADR-002
Public UUID Identifiers
        ↓
Future Requirement
        ↓
ADR-XXX
UUIDv7 / Distributed Identifier Strategy
```

---

# 30. Related Decisions

### Multi-Tenancy

O identificador público de um recurso deve ser interpretado dentro do tenant context quando o recurso for tenant-scoped.

```text
ADR-001 — Shared Database Multi-Tenancy
```

### Authentication

UUIDs podem aparecer associados a identities autenticadas.

```text
ADR-003 — HttpOnly Cookie Authentication
```

### Session Management

Identificadores como user UUID e tenant UUID podem participar da associação de sessões.

```text
ADR-004 — Redis Session Management
```

### Observability

UUIDs são utilizados como referências de recursos em logs, events e audit.

```text
ADR-008 — Observability Strategy
```

---

# 31. Related Documentation

- `docs/architecture/overview.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/api/overview.md`
- `docs/api/conventions.md`
- `docs/api/authentication.md`
- `docs/database/overview.md`
- `docs/database/schema.md`
- `docs/database/migrations.md`
- `docs/observability/platform-events.md`
- `docs/observability/audit-logging.md`
- `docs/observability/correlation.md`

---

# 32. Decision Summary

| Aspect                          | Decision                           |
| ------------------------------- | ---------------------------------- |
| Public identifier               | UUID                               |
| API resource references         | Public UUID                        |
| Internal persistence ID         | Independent from public contract   |
| Sequential IDs exposed publicly | Not adopted                        |
| Authorization                   | Independent of identifier strategy |
| Tenant Isolation                | Independent of identifier strategy |
| Identifier mutability           | Stable                             |
| UUID version                    | Not mandated by this ADR           |
| Future UUIDv7 adoption          | Possible                           |
| External integrations           | Supported conceptually             |
| Distributed systems             | Compatible                         |

---

# 33. Final Decision

The Exactum will use **UUIDs as public identifiers for API resources**, maintaining a conceptual separation between public resource identity and internal persistence identity.

The public UUID is part of the API contract and should remain independent from implementation details of the database whenever practical.

This decision provides:

- a stable public resource identity;
- reduced coupling between API and persistence;
- reduced exposure of sequential internal identifiers;
- flexibility for future architectural evolution;
- compatibility with future integrations and distributed processing.

The UUID itself is **not considered a security mechanism** and does not replace Authentication, Authorization or Tenant Isolation.

---

## Architectural Principle

> **Public resource identity should remain independent from internal persistence identity.**
