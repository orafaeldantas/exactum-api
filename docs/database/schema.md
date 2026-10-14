# Database Schema

## 1. Objetivo

Este documento descreve a estrutura lógica do **database schema** do Exactum, seus principais recursos persistentes, relacionamentos, identificadores, constraints e princípios utilizados na modelagem dos dados.

Enquanto `docs/database/overview.md` apresenta a arquitetura geral da persistência, este documento concentra-se na estrutura dos dados propriamente dita.

O objetivo é documentar:

- principais entidades persistentes;
- relacionamentos;
- identificadores;
- foreign keys;
- tenant scoping;
- regras de unicidade;
- timestamps;
- Soft Delete;
- integridade referencial;
- organização lógica do schema;
- evolução prevista do modelo.

Este documento representa a visão arquitetural do schema e não deve ser interpretado como substituto da definição real das migrations ou dos models do SQLAlchemy.

---

# 2. Database Schema e Domain Model

O database schema representa a persistência dos dados da aplicação.

Ele não deve ser confundido diretamente com o modelo de domínio.

Conceitualmente:

```text
Domain Model
     │
     ▼
Application
     │
     ▼
Persistence Model
     │
     ▼
Database Schema
```

O domínio representa comportamento e regras de negócio.

O database schema representa como os dados necessários são armazenados e relacionados.

Por isso, nem toda entidade conceitual do domínio precisa possuir correspondência direta de um-para-um com uma tabela.

---

# 3. Estratégia de Schema

O Exactum utiliza PostgreSQL com uma estratégia de **shared database / shared schema** para multi-tenancy.

Isso significa que diferentes tenants compartilham as mesmas estruturas de tabelas.

Conceitualmente:

```text
PostgreSQL
│
├── tenants
│
├── users
│
├── products
│
├── sales
│
└── outras estruturas
```

Os dados pertencentes a tenants são associados ao respectivo `tenant_uuid`.

A separação entre tenants ocorre logicamente através das relações e filtros de tenant.

---

# 4. Principais Entidades

As principais entidades persistentes do sistema incluem conceitos relacionados a:

```text
Tenant
User
Product
Sale
Permission
Role
Session
Audit Log
Platform Event
```

A existência e o grau de persistência de cada uma dessas entidades pode variar conforme a implementação atual e a evolução do sistema.

Algumas responsabilidades podem futuramente ser separadas ou reorganizadas em contextos mais especializados.

---

# 5. Tenant

`Tenant` representa a organização ou unidade isolada dentro da plataforma.

Conceitualmente:

```text
Tenant
│
├── Users
├── Products
├── Sales
├── Permissions
└── Configuration
```

O tenant funciona como uma das principais fronteiras de isolamento dos dados de negócio.

Um registro pertencente a um tenant não deve ser acessível por outro tenant através das operações normais da aplicação.

---

# 6. Tenant Identifier

O tenant possui um identificador público representado conceitualmente por:

```text
tenant_uuid
```

Esse identificador é utilizado para associar dados ao tenant correto.

Exemplo:

```text
Product
    │
    └── tenant_uuid
```

ou:

```text
Sale
    │
    └── tenant_uuid
```

O `tenant_uuid` também participa do contexto de execução estabelecido pela camada de autenticação e autorização.

---

# 7. Tenant-Scoped Entities

Nem todas as informações do banco precisam necessariamente possuir `tenant_uuid`.

Entretanto, entidades que representam dados pertencentes diretamente a uma organização devem possuir uma forma explícita de associação ao tenant.

Exemplos:

```text
Product
Sale
User
Tenant configuration
```

Essa distinção é importante para evitar adicionar `tenant_uuid` indiscriminadamente em entidades que possuem escopo global.

---

# 8. User

`User` representa uma identidade autenticável da plataforma.

Um usuário pode estar associado a um tenant e possuir informações relacionadas a:

- identificação;
- autenticação;
- role;
- permissions;
- status;
- timestamps;
- tenant context.

Conceitualmente:

```text
Tenant
   │
   └── User
```

Um usuário autenticado estabelece o contexto utilizado posteriormente pelas camadas de autorização e persistência.

---

# 9. User e Tenant

A relação entre usuário e tenant é fundamental para o modelo multi-tenant.

Conceitualmente:

```text
Tenant 1
 ├── User A
 ├── User B
 └── User C

Tenant 2
 ├── User D
 └── User E
```

Uma operação autenticada deve sempre determinar o contexto adequado antes de acessar dados tenant-scoped.

---

# 10. User Identifier

O usuário possui um identificador público representado conceitualmente por:

```text
user_uuid
```

Esse identificador pode ser utilizado pela API e por registros de observabilidade.

No contexto de logs, platform events e audit logs, `user_uuid` pode representar o usuário associado à operação.

---

# 11. Actor e User

O conceito de `actor` é utilizado na documentação de observabilidade para representar quem originou uma determinada ação.

Na implementação atual, esse conceito pode ser representado por:

```text
actor
   │
   └── user_uuid
```

A distinção é intencional.

`actor` é um conceito arquitetural.

`user_uuid` é uma representação concreta na implementação.

Essa separação permite que o modelo evolua futuramente para representar outros tipos de atores, como:

- system;
- background worker;
- service account;
- automation.

---

# 12. Product

`Product` representa um produto comercial gerenciado pelo tenant.

Conceitualmente:

```text
Tenant
   │
   └── Product
```

Um produto pode possuir informações relacionadas a:

- identificação;
- nome;
- descrição;
- preço;
- estoque;
- estoque mínimo;
- estado;
- timestamps;
- tenant.

A estrutura exata dos campos pertence ao schema atual da aplicação e às migrations correspondentes.

---

# 13. Product Identifier

O produto possui um identificador público representado conceitualmente por:

```text
product_uuid
```

Esse identificador é utilizado pela API para referenciar o recurso.

Exemplo:

```http
GET /api/v1/products/{product_uuid}
```

O consumidor da API não precisa conhecer o identificador interno utilizado pelo banco.

---

# 14. Product e Tenant

Produtos são tenant-scoped.

Portanto, a relação conceitual é:

```text
Tenant
   │
   ├── Product A
   ├── Product B
   └── Product C
```

Uma consulta de produto deve considerar tanto seu identificador quanto o tenant context.

Conceitualmente:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid
  AND tenant_uuid = :tenant_uuid;
```

---

# 15. Product e Stock

No modelo atual do Exactum, responsabilidades relacionadas ao estoque ainda estão associadas ao contexto de produtos.

Conceitualmente:

```text
Product
   │
   ├── current_stock
   └── minimum_stock
```

Isso permite representar o estado atual do estoque diretamente associado ao produto.

Essa organização não deve ser interpretada como um limite arquitetural definitivo.

---

# 16. Future Inventory Boundary

Conforme o sistema evoluir, responsabilidades relacionadas a estoque poderão ser extraídas para um contexto mais especializado.

Uma possível evolução:

```text
Current

Product
 └── Stock responsibilities


Future

Product
Inventory
Sales
```

Nesse cenário:

```text
Product
    │
    └── Product identity/catalog information

Inventory
    │
    └── Stock state and movements

Sales
    │
    └── Commercial transactions
```

Essa separação é uma direção arquitetural futura e não representa necessariamente a estrutura atual do banco.

---

# 17. Sale

`Sale` representa uma operação de venda realizada dentro de um tenant.

Conceitualmente:

```text
Tenant
   │
   └── Sale
```

Uma venda possui informações relacionadas à operação comercial e ao seu estado.

Exemplos conceituais:

- identificador;
- tenant;
- status;
- total;
- timestamps;
- itens da venda.

---

# 18. Sale Identifier

A venda possui um identificador público representado conceitualmente por:

```text
sale_uuid
```

Esse identificador pode ser utilizado pela API e por mecanismos de auditoria e observabilidade.

Exemplo:

```http
GET /api/v1/sales/{sale_uuid}
```

---

# 19. Sale Items

Uma venda normalmente possui múltiplos itens.

Conceitualmente:

```text
Sale
│
├── Sale Item
├── Sale Item
└── Sale Item
```

Cada item representa a participação de um produto na venda.

A relação pode ser representada como:

```text
Sale
  │
  └── SaleItem
         │
         └── Product
```

A modelagem física dessa relação deve garantir integridade referencial.

---

# 20. Sale e Product

A relação entre venda e produto é uma das relações centrais do sistema.

Conceitualmente:

```text
Product
   │
   └── SaleItem
          │
          └── Sale
```

Uma venda pode possuir diversos produtos.

Um produto pode aparecer em diversas vendas ao longo do tempo.

Isso representa uma relação conceitualmente:

```text
Product N ←→ N Sale
```

normalmente materializada por uma entidade intermediária, como `SaleItem`.

---

# 21. Sale e Stock

Uma venda pode produzir efeitos sobre o estoque.

Conceitualmente:

```text
Sale
   │
   ├── Sale Items
   │
   └── Stock effect
```

No modelo atual, a operação pode resultar na atualização do estado de estoque associado ao produto.

Esse tipo de operação deve respeitar transaction boundaries adequados.

---

# 22. Histórico e Estado Atual

É importante distinguir:

```text
Current State
```

de:

```text
Historical Record
```

Por exemplo:

```text
Product.current_stock
```

representa o estado atual.

Enquanto uma futura estrutura de:

```text
StockMovement
```

poderia representar alterações históricas.

No estado atual do Exactum, responsabilidades de estoque ainda não estão necessariamente separadas em uma entidade ou contexto próprio de movimentações.

---

# 23. Future Stock Movement

Uma possível evolução seria introduzir:

```text
StockMovement
```

com informações como:

```text
movement_uuid
product_uuid
tenant_uuid
type
quantity
reason
created_at
actor
```

Isso permitiria representar historicamente operações como:

```text
PURCHASE
SALE
ADJUSTMENT
RETURN
LOSS
TRANSFER
```

Essa estrutura é uma possibilidade arquitetural futura.

Não deve ser interpretada como uma tabela já existente caso não esteja presente na implementação atual.

---

# 24. Role

`Role` representa um agrupamento de permissões utilizado pelo mecanismo de autorização.

Exemplos conceituais:

```text
admin
manager
user
seller
stocker
```

Os nomes e relações concretas podem evoluir conforme o modelo de autorização seja refinado.

A role não deve ser confundida com permission.

---

# 25. Permission

`Permission` representa uma capacidade específica de execução de determinada operação.

Exemplos conceituais:

```text
products:create
products:read
products:update
products:delete
sales:create
sales:read
users:update
```

Uma permission possui granularidade maior do que uma role.

Conceitualmente:

```text
Role
 │
 ├── Permission
 ├── Permission
 └── Permission
```

---

# 26. Role e Permission

O relacionamento entre roles e permissions pode ser representado como:

```text
Role
  │
  ├── Permission A
  ├── Permission B
  └── Permission C
```

Dependendo da implementação, permissions também podem ser atribuídas ou ajustadas diretamente para usuários.

Essa estrutura permite combinar:

```text
Default Role Permissions
+
User-specific Permissions
```

quando suportado pelo modelo de autorização.

---

# 27. User Authorization Data

Informações utilizadas para autorização podem possuir relações com:

```text
User
Role
Permission
Tenant
```

Conceitualmente:

```text
Tenant
   │
   └── User
        │
        ├── Role
        │
        └── Permissions
```

A autorização continua sendo responsabilidade do backend.

A estrutura persistida apenas fornece os dados necessários para que essa decisão seja realizada.

---

# 28. Session

O Exactum utiliza Redis para parte do gerenciamento de sessões relacionadas à autenticação.

Portanto, nem todo estado de sessão precisa estar representado como uma tabela tradicional no PostgreSQL.

Conceitualmente:

```text
User
   │
   ▼
Authentication
   │
   ▼
Redis Session State
```

Informações como JTI, revocation state e refresh-session state podem estar associadas ao mecanismo de sessão no Redis.

Isso demonstra que o database schema do PostgreSQL não representa todo o estado operacional da aplicação.

---

# 29. PostgreSQL vs Redis State

A arquitetura distingue:

```text
PostgreSQL
    ↓
Durable application data
```

de:

```text
Redis
    ↓
Operational / ephemeral state
```

Isso evita transformar o schema PostgreSQL em um repositório de todo estado utilizado pela aplicação.

A separação exata de responsabilidades pode evoluir conforme novas funcionalidades sejam introduzidas.

---

# 30. Audit Log

Audit Logs representam ações relevantes executadas dentro do contexto de um tenant.

Conceitualmente:

```text
AuditLog
│
├── tenant_uuid
├── actor
├── action
├── resource_type
├── resource_uuid
├── outcome
├── request_id
└── metadata
```

Esses registros são voltados para accountability e histórico administrativo.

A estrutura detalhada está documentada em:

```text
docs/observability/audit-logging.md
```

---

# 31. Platform Event

Platform Events representam eventos relevantes para a operação da plataforma.

Conceitualmente:

```text
PlatformEvent
│
├── event_id
├── event_type
├── actor
├── tenant
├── target
├── request_id
└── metadata
```

Eles não devem ser confundidos com registros de domínio ou infraestrutura.

A arquitetura detalhada está documentada em:

```text
docs/observability/platform-events.md
```

---

# 32. Request ID

Operações relevantes podem ser associadas a um:

```text
request_id
```

Esse identificador é utilizado principalmente para correlação de observabilidade.

Conceitualmente:

```text
HTTP Request
    │
    ├── Infrastructure Log
    ├── Audit Log
    └── Platform Event
          │
          └── request_id
```

O `request_id` não representa uma identidade persistente do recurso.

Ele representa a operação ou request que originou determinado registro.

---

# 33. Event ID vs Request ID

Esses identificadores possuem responsabilidades diferentes.

### `request_id`

Representa a correlação de uma requisição ou operação.

### `event_id`

Representa a identidade de um evento específico.

Exemplo:

```text
request_id = abc123
```

pode estar relacionado a:

```text
event_id = event-001
event_id = event-002
```

Isso permite que uma única operação origine múltiplos registros observáveis.

---

# 34. Resource Identifiers

A documentação utiliza conceitos como:

```text
resource_uuid
```

para representar identificadores públicos de recursos.

Na implementação concreta, cada recurso possui seu nome específico:

```text
tenant_uuid
user_uuid
product_uuid
sale_uuid
```

Essa distinção permite manter uma linguagem arquitetural consistente sem esconder a implementação real.

---

# 35. Foreign Keys

Foreign keys representam relações entre entidades persistentes.

Exemplo:

```text
products.tenant_uuid
        │
        ▼
tenants.uuid
```

ou:

```text
sales.tenant_uuid
        │
        ▼
tenants.uuid
```

Foreign keys são importantes para preservar integridade referencial.

Quando uma relação é obrigatória, a constraint deve refletir essa necessidade.

---

# 36. Tenant-aware Foreign Keys

Em um sistema multi-tenant, a existência de uma foreign key simples não garante necessariamente que duas entidades pertençam ao mesmo tenant.

Por exemplo:

```text
Sale
 ├── tenant_uuid = A
 └── product_uuid = X
```

é necessário garantir que:

```text
Product X
 └── tenant_uuid = A
```

e não:

```text
Product X
 └── tenant_uuid = B
```

A aplicação deve garantir essa consistência e, quando apropriado, o schema pode utilizar constraints mais fortes para reforçar o relacionamento.

---

# 37. Composite Relationships

Uma estratégia possível para reforçar relações tenant-aware é utilizar chaves compostas ou constraints que incluam o tenant.

Conceitualmente:

```text
(tenant_uuid, product_uuid)
```

em vez de depender somente de:

```text
product_uuid
```

Essa abordagem pode aumentar a complexidade do schema.

Portanto, deve ser utilizada quando o benefício de integridade justificar a complexidade adicional.

---

# 38. Uniqueness

Regras de unicidade devem ser analisadas dentro do contexto do domínio.

Exemplo:

```text
Tenant A
Product code = 001

Tenant B
Product code = 001
```

pode ser válido.

Nesse caso, uma regra global:

```text
UNIQUE(product_code)
```

poderia estar incorreta.

Uma regra tenant-scoped poderia ser:

```text
UNIQUE(tenant_uuid, product_code)
```

A decisão depende do significado do campo.

---

# 39. Natural Keys vs Surrogate Keys

Alguns campos podem parecer identificadores naturais:

```text
email
SKU
product_code
document_number
```

Porém, esses valores podem possuir regras de alteração, escopo ou reutilização.

Por isso, o schema utiliza identificadores técnicos separados dos valores de negócio quando apropriado.

Conceitualmente:

```text
Technical Identity
        +
Business Attributes
```

Essa separação reduz acoplamento entre identidade e atributos mutáveis.

---

# 40. Primary Key vs Public Identifier

É importante distinguir:

```text
Primary Key
```

de:

```text
Public Identifier
```

A primary key é utilizada para identidade e relacionamento dentro da persistência.

O public identifier é utilizado como referência externa através da API.

Essa separação permite que detalhes internos permaneçam encapsulados.

---

# 41. Soft Delete Fields

Entidades que utilizam Soft Delete podem possuir:

```text
deleted_at
```

Conceitualmente:

```text
deleted_at = NULL
```

significa:

```text
Active
```

Enquanto:

```text
deleted_at != NULL
```

representa:

```text
Soft Deleted
```

A estratégia completa está documentada em:

```text
docs/database/soft-delete.md
```

---

# 42. Created At

Entidades persistentes relevantes podem possuir:

```text
created_at
```

Esse campo representa o momento em que o registro foi criado.

Ele pode ser utilizado para:

- ordenação;
- auditoria;
- relatórios;
- investigação;
- retenção;
- observabilidade.

---

# 43. Updated At

Quando uma entidade possui alterações relevantes, pode utilizar:

```text
updated_at
```

Esse campo permite identificar quando o estado persistido foi modificado pela última vez.

É especialmente útil para:

- sincronização;
- debugging;
- cache invalidation;
- observabilidade;
- auditoria operacional.

---

# 44. Status Fields

Entidades de negócio podem possuir campos de estado.

Por exemplo:

```text
Sale.status
```

pode representar estados como:

```text
PENDING
COMPLETED
CANCELLED
```

Os valores exatos dependem do domínio e da implementação atual.

Estados devem ser modelados de maneira consistente e, quando necessário, protegidos por constraints.

---

# 45. State Transitions

Um campo `status` não deve ser interpretado apenas como uma string.

Ele representa um conjunto de estados e possíveis transições.

Conceitualmente:

```text
PENDING
   │
   ▼
COMPLETED

PENDING
   │
   ▼
CANCELLED
```

Nem toda transição deve ser permitida.

Essas regras pertencem principalmente ao domínio/application layer, enquanto o banco pode proteger invariantes estruturais.

---

# 46. Database Constraints e State

Quando apropriado, constraints podem impedir estados estruturalmente inválidos.

Entretanto, regras complexas de transição normalmente pertencem à aplicação.

Exemplo:

```text
Database:
status NOT NULL
```

Enquanto:

```text
Application:
CANCELLED → COMPLETED
não permitido
```

Essa separação evita transformar regras de negócio complexas em constraints excessivamente difíceis de manter.

---

# 47. Cascading

Relacionamentos podem possuir comportamento específico para remoção.

Possíveis comportamentos:

```text
CASCADE
RESTRICT
SET NULL
```

A escolha depende da natureza do relacionamento.

Em entidades de negócio com histórico importante, `CASCADE` deve ser utilizado com cuidado, especialmente quando uma remoção poderia apagar informações relevantes.

Soft Delete também reduz a necessidade de remoções físicas em determinados casos.

---

# 48. Historical Data

Dados históricos possuem valor operacional.

Exemplos:

```text
Sales
Audit Logs
Platform Events
Stock history
```

Por isso, operações destrutivas devem considerar cuidadosamente:

- dependências;
- auditoria;
- relatórios;
- investigação;
- recuperação.

A existência de um relacionamento não significa necessariamente que o registro relacionado possa ser fisicamente apagado.

---

# 49. Reporting Data

Relatórios podem inicialmente utilizar diretamente as entidades operacionais.

Por exemplo:

```text
Sales
Products
```

podem ser consultados para gerar indicadores.

Conforme o volume crescer, o sistema poderá evoluir para:

```text
Operational Data
        │
        ▼
Read Models
        │
        ▼
Reporting
```

Essa separação pode melhorar performance e reduzir impacto sobre operações transacionais.

---

# 50. Future Reporting Boundary

No estado atual, responsabilidades relacionadas a reporting ainda não constituem necessariamente um bounded context ou estrutura física independente.

Uma possível evolução seria:

```text
Sales
Inventory
Products
    │
    ▼
Reporting
```

com modelos específicos para consultas analíticas.

Isso pode ser introduzido somente quando houver necessidade real de escala, complexidade ou performance.

---

# 51. Normalization

O schema relacional deve evitar duplicação desnecessária de dados.

A normalização ajuda a preservar consistência.

Porém, normalização excessiva também pode gerar:

- joins complexos;
- queries difíceis;
- custo de leitura;
- modelos excessivamente fragmentados.

A modelagem deve buscar equilíbrio entre:

```text
Consistency
+
Maintainability
+
Performance
```

---

# 52. Denormalization

Denormalization pode ser utilizada quando houver justificativa concreta.

Exemplos futuros:

- read models;
- reporting;
- materialized views;
- caches;
- projections.

A denormalização deve ser deliberada e acompanhada de estratégia de atualização.

Não deve ser utilizada simplesmente para evitar um join sem evidência de necessidade.

---

# 53. Materialized Views

Materialized Views são uma possível estratégia futura para consultas analíticas pesadas.

Conceitualmente:

```text
Transactional Tables
        │
        ▼
Materialized View
        │
        ▼
Reporting Query
```

Isso pode ser relevante quando dashboards e relatórios crescerem em complexidade.

Atualmente, essa é uma possibilidade futura.

---

# 54. Schema Evolution e Domain Evolution

A estrutura do banco deve acompanhar a evolução dos limites do sistema sem ficar excessivamente acoplada a decisões temporárias.

Por exemplo, responsabilidades hoje associadas a:

```text
Products
```

podem futuramente ser reorganizadas entre:

```text
Product
Inventory
Reporting
```

Isso não significa que a separação física precise acontecer simultaneamente.

A evolução pode ocorrer em etapas:

```text
Code Boundary
    ↓
Application Boundary
    ↓
Persistence Boundary
    ↓
Infrastructure Boundary
```

---

# 55. Current Schema Perspective

O schema atual deve ser entendido como uma representação da aplicação em seu estágio presente.

Ele ainda pode conter responsabilidades agrupadas que futuramente serão separadas.

Isso é esperado em um sistema que está evoluindo de uma arquitetura predominantemente layered para uma arquitetura com boundaries de domínio mais fortes.

O objetivo da documentação não é congelar essa estrutura, mas registrar:

```text
Current State
+
Architectural Direction
```

---

# 56. Database Schema e API

O schema interno não deve ser exposto diretamente através da API.

A API representa recursos e contratos públicos.

O banco representa persistência.

Por isso:

```text
Database Schema
        ≠
API Schema
```

Uma alteração interna em uma tabela não precisa necessariamente alterar o JSON retornado pela API.

Da mesma forma, uma evolução do contrato HTTP pode ser implementada sem alterar completamente a estrutura persistente.

---

# 57. Database Schema e Serialization

Schemas utilizados pela API são responsáveis por:

- validation;
- serialization;
- deserialization;
- contract enforcement.

O database schema é responsável por:

- persistence;
- integrity;
- relationships;
- constraints.

Essas responsabilidades devem permanecer separadas.

---

# 58. ORM Mapping

O SQLAlchemy funciona como uma camada de mapeamento entre objetos Python e estruturas persistentes.

Conceitualmente:

```text
Python Model
     │
     ▼
SQLAlchemy
     │
     ▼
PostgreSQL
```

O ORM simplifica o acesso aos dados, mas não elimina a necessidade de compreender:

- SQL;
- indexes;
- transactions;
- constraints;
- execution plans;
- locking;
- database design.

---

# 59. Raw SQL

Nem toda query precisa obrigatoriamente ser construída exclusivamente através da abstração de alto nível do ORM.

Queries específicas podem utilizar SQL quando houver justificativa.

Isso pode ocorrer para:

- queries complexas;
- performance;
- recursos específicos do PostgreSQL;
- relatórios;
- operações em massa.

Entretanto, SQL deve permanecer encapsulado em pontos apropriados da camada de persistência.

---

# 60. Bulk Operations

Operações em grande volume devem evitar loops de queries individuais quando isso gerar impacto significativo.

Em vez de:

```text
for item in items:
    INSERT
```

pode ser apropriado utilizar:

```text
Bulk Insert
```

ou outras operações específicas do PostgreSQL.

A escolha depende do caso de uso e das necessidades de:

- performance;
- transactionality;
- retorno de IDs;
- triggers;
- audit;
- validation.

---

# 61. Database Connection Lifecycle

A aplicação deve controlar adequadamente o ciclo de vida das conexões.

Conceitualmente:

```text
Request
  │
  ▼
Acquire Connection
  │
  ▼
Execute
  │
  ▼
Commit / Rollback
  │
  ▼
Release
```

Conexões não devem permanecer abertas indefinidamente.

Falhas durante operações devem resultar em rollback apropriado.

---

# 62. Rollback

Quando uma transaction falha:

```text
Transaction
    │
    ├── Operation A ✓
    ├── Operation B ✓
    ├── Operation C ✗
    │
    ▼
Rollback
```

As operações realizadas dentro daquela transaction devem ser revertidas conforme as propriedades transacionais do PostgreSQL.

Isso é essencial para evitar estados parcialmente persistidos.

---

# 63. Database Availability

A disponibilidade do PostgreSQL é uma dependência crítica do Exactum.

Quando o banco está indisponível:

```text
API
  │
  ▼
Repository
  │
  X
PostgreSQL
```

a aplicação deve:

- detectar a falha;
- registrar o erro;
- retornar resposta adequada;
- evitar expor detalhes internos;
- preservar informações de observabilidade.

Health checks podem verificar a conectividade com dependências críticas.

---

# 64. Health Checks

O Exactum possui mecanismos de health checking para verificar dependências relevantes da aplicação.

Um health check pode considerar:

```text
Application
    │
    ├── PostgreSQL
    └── Redis
```

Isso permite distinguir:

```text
Application process alive
```

de:

```text
Application dependencies healthy
```

Essas informações podem ser utilizadas posteriormente por infraestrutura e observabilidade.

---

# 65. Database Security Boundaries

O banco é uma camada de infraestrutura protegida.

A aplicação deve controlar:

- credenciais;
- conexão;
- permissões;
- acesso de rede;
- secrets;
- logs.

O frontend não deve possuir acesso direto ao PostgreSQL.

A arquitetura esperada é:

```text
Browser
   │
   ▼
API
   │
   ▼
Database
```

e não:

```text
Browser
   │
   └──→ PostgreSQL
```

---

# 66. Current State

No estado atual, o schema do Exactum é baseado principalmente em entidades relacionadas a:

```text
Tenant
User
Product
Sale
Authorization
Observability
```

A persistência utiliza:

- PostgreSQL;
- SQLAlchemy;
- migrations;
- foreign keys;
- constraints;
- transactions;
- tenant-aware queries;
- UUIDs públicos;
- IDs internos;
- Soft Delete quando aplicável.

Algumas responsabilidades ainda estão agrupadas em estruturas que poderão receber boundaries próprios no futuro.

---

# 67. Known Evolution Points

Os principais pontos de evolução do schema incluem:

- maior formalização de Inventory;
- estrutura histórica de Stock Movements;
- evolução de Reporting;
- read models;
- Transactional Outbox;
- melhorias em constraints tenant-aware;
- maior separação entre persistence models e domain models;
- otimização de índices;
- observabilidade de queries;
- políticas de retenção;
- evolução de identificadores.

Esses pontos representam possibilidades arquiteturais e devem ser implementados somente quando houver justificativa.

---

# 68. Future Schema Evolution

Uma possível trajetória arquitetural é:

```text
Current Schema
      │
      ├── Tenant
      ├── Users
      ├── Products
      ├── Sales
      └── Authorization
      │
      ▼
Evolution
      │
      ├── Inventory boundary
      ├── Stock movements
      ├── Reporting models
      ├── Outbox
      └── Read models
      │
      ▼
Mature Persistence
      │
      ├── Specialized queries
      ├── Stronger observability
      ├── Optimized indexes
      └── Specialized persistence boundaries
```

Essa evolução deve ser incremental.

---

# 69. Design Principles

O schema do Exactum segue os seguintes princípios:

1. **PostgreSQL representa a principal persistência relacional do sistema.**
2. **Tenant-scoped data deve possuir associação explícita ao tenant quando necessário.**
3. **Tenant isolation deve ser preservado na camada de persistência.**
4. **Public identifiers devem ser desacoplados da identidade interna do banco.**
5. **Foreign keys devem proteger integridade referencial.**
6. **Unique constraints devem refletir o escopo correto da regra.**
7. **Transactions devem proteger operações que precisam de atomicidade.**
8. **Soft Delete deve ser aplicado apenas quando fizer sentido para o domínio.**
9. **Database schema e API schema são contratos diferentes.**
10. **ORM mapping não substitui conhecimento de SQL e PostgreSQL.**
11. **Performance deve ser baseada em métricas e execution plans.**
12. **Histórico importante não deve ser destruído sem análise.**
13. **Redis e PostgreSQL possuem responsabilidades diferentes.**
14. **O schema deve acompanhar a evolução dos domain boundaries sem antecipar complexidade desnecessária.**
15. **A estrutura atual deve ser tratada como um estado evolutivo, não como arquitetura definitiva.**

---

# 70. Related Documentation

Documentos relacionados:

- [`docs/database/overview.md`](./overview.md)
- [`docs/database/migrations.md`](./migrations.md)
- [`docs/database/soft-delete.md`](./soft-delete.md)
- [`docs/architecture/domain-boundaries.md`](../architecture/domain-boundaries.md)
- [`docs/architecture/multi-tenancy.md`](../architecture/multi-tenancy.md)
- [`docs/architecture/application-architecture.md`](../architecture/application-architecture.md)
- [`docs/security/tenant-isolation.md`](../security/tenant-isolation.md)
- [`docs/security/authorization.md`](../security/authorization.md)
- [`docs/observability/audit-logging.md`](../observability/audit-logging.md)
- [`docs/observability/platform-events.md`](../observability/platform-events.md)
- [`docs/api/conventions.md`](../api/conventions.md)

---

# 71. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo, conceitos como `tenant`, `actor`, `resource`, `inventory`, `reporting` e `persistence model` representam responsabilidades arquiteturais, enquanto a implementação pode utilizar nomes concretos como `tenant_uuid`, `user_uuid`, `product_uuid`, `sale_uuid` ou estruturas específicas do SQLAlchemy e PostgreSQL.

Essa distinção permite documentar o significado arquitetural dos elementos sem limitar os conceitos à implementação atual.

Da mesma forma, algumas estruturas mencionadas como possibilidades futuras — como `StockMovement`, `Inventory`, `Reporting`, `Read Models` ou `Transactional Outbox` — representam direções arquiteturais e não devem ser interpretadas como componentes já implementados caso ainda não façam parte do schema atual.

Portanto, este documento deve ser interpretado como uma representação do **modelo lógico atual do database schema do Exactum e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da persistência.
