# Database Overview

## 1. Objetivo

Este documento apresenta a visão geral da arquitetura de persistência do Exactum, descrevendo como o banco de dados se relaciona com a aplicação, os principais princípios de modelagem, isolamento entre tenants, integridade dos dados, transações, migrations e evolução futura da camada de persistência.

O objetivo não é documentar cada tabela ou coluna individualmente, mas estabelecer uma visão arquitetural do papel do banco de dados dentro do sistema.

A documentação detalhada da estrutura de tabelas e relacionamentos é apresentada em:

```text
docs/database/schema.md
```

Enquanto este documento trata principalmente das decisões e princípios que orientam a persistência.

---

# 2. Papel do Banco de Dados

O banco de dados é uma das principais infraestruturas do Exactum.

Ele é responsável pela persistência durável de informações necessárias ao funcionamento do sistema, incluindo dados relacionados a:

- tenants;
- usuários;
- produtos;
- estoque;
- vendas;
- permissões;
- configurações;
- registros administrativos;
- informações necessárias para auditoria;
- outros dados persistentes da aplicação.

O banco de dados representa a fonte persistente de informação da aplicação para os dados que precisam sobreviver ao ciclo de vida de uma requisição ou instância da aplicação.

De forma simplificada:

```text
Frontend
    │
    ▼
HTTP / API
    │
    ▼
Application Services
    │
    ▼
Repositories
    │
    ▼
PostgreSQL
```

A aplicação não deve permitir que a camada HTTP acesse diretamente o banco de dados.

---

# 3. PostgreSQL

O Exactum utiliza **PostgreSQL** como seu principal banco de dados relacional.

O PostgreSQL fornece mecanismos importantes para a aplicação, incluindo:

- transactions;
- foreign keys;
- constraints;
- indexes;
- unique constraints;
- joins;
- isolation levels;
- locking;
- ACID properties;
- suporte a tipos relacionais e estruturados;
- mecanismos de recuperação e durabilidade.

A escolha de um banco relacional está alinhada com a natureza dos dados do Exactum, que possui relações importantes entre:

```text
Tenant
   │
   ├── Users
   ├── Products
   ├── Sales
   ├── Permissions
   └── Configuration
```

Essas relações precisam ser preservadas de forma consistente.

---

# 4. Banco Compartilhado entre Tenants

O Exactum utiliza uma estratégia de **shared database / shared schema** para multi-tenancy.

Isso significa que diferentes tenants compartilham a mesma instância lógica de banco de dados e, nas entidades aplicáveis, os registros são associados ao respectivo tenant.

Conceitualmente:

```text
PostgreSQL
│
├── Tenant A
│   ├── Users
│   ├── Products
│   └── Sales
│
├── Tenant B
│   ├── Users
│   ├── Products
│   └── Sales
│
└── Tenant C
    ├── Users
    ├── Products
    └── Sales
```

O isolamento é lógico e deve ser garantido pela aplicação e pelas regras de persistência.

---

# 5. Tenant Context

Durante uma requisição autenticada, o backend estabelece um contexto de tenant.

Esse contexto é utilizado para determinar a organização à qual a operação pertence.

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
   ▼
Application Service
   │
   ▼
Repository
   │
   ▼
PostgreSQL
```

A camada de persistência deve utilizar esse contexto para garantir que consultas e operações sejam realizadas dentro do tenant correto.

---

# 6. Tenant Isolation na Persistência

O isolamento de tenant não deve depender exclusivamente da camada HTTP.

Uma operação de leitura deve considerar o tenant:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid
  AND tenant_uuid = :tenant_uuid;
```

Em vez de depender apenas de:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid;
```

A segunda abordagem pode permitir acesso indevido caso um identificador de outro tenant seja fornecido.

Por isso, a persistência deve possuir mecanismos explícitos de tenant filtering.

---

# 7. Defesa em Profundidade

O isolamento do Exactum utiliza o princípio de **defense in depth**.

A segurança não deve depender de uma única camada.

Conceitualmente:

```text
Authentication
      │
      ▼
Tenant Context
      │
      ▼
Authorization
      │
      ▼
Application Rules
      │
      ▼
Repository Tenant Filtering
      │
      ▼
Database Constraints
```

Cada camada contribui para reduzir o risco de acesso indevido.

Isso é especialmente importante porque um erro em uma camada superior não deve automaticamente resultar em acesso irrestrito a dados de outro tenant.

---

# 8. Repositories

Os **Repositories** são responsáveis por encapsular operações de persistência utilizadas pela aplicação.

Exemplos conceituais:

```text
ProductRepository
SaleRepository
UserRepository
TenantRepository
```

A aplicação deve interagir com a persistência através de abstrações apropriadas, evitando espalhar queries e detalhes de banco pelas diferentes partes do sistema.

O Repository pode ser responsável por:

- buscar entidades;
- criar registros;
- atualizar registros;
- remover ou soft-delete registros;
- verificar existência;
- aplicar filtros;
- executar queries específicas;
- respeitar tenant isolation.

---

# 9. Application Services e Persistência

O Application Service coordena o caso de uso, enquanto o Repository lida com persistência.

Uma operação pode seguir:

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Application Service
     │
     ├── valida contexto
     ├── executa regras do caso de uso
     │
     ▼
Repository
     │
     ▼
PostgreSQL
```

Essa separação reduz o acoplamento entre regras de aplicação e detalhes específicos do banco.

---

# 10. Models e Persistence Mapping

As entidades persistentes da aplicação possuem representação no banco de dados.

O ORM utilizado atualmente é baseado em **SQLAlchemy**.

O ORM facilita operações como:

- mapping entre objetos e registros;
- relationships;
- queries;
- transactions;
- integration com PostgreSQL.

Entretanto, o ORM não deve ser confundido com o próprio domínio da aplicação.

O modelo de persistência existe para representar como os dados são armazenados.

A arquitetura pode evoluir posteriormente para separar ainda mais:

```text
Domain Model
     │
     ▼
Persistence Model
```

quando essa separação trouxer benefício real.

---

# 11. Integridade Referencial

Relacionamentos importantes devem possuir integridade referencial.

Por exemplo:

```text
Tenant
   │
   └── User
```

ou:

```text
Tenant
   │
   └── Product
```

Foreign keys podem garantir que referências não apontem para registros inexistentes.

Esse tipo de regra é importante porque a integridade dos dados não deve depender exclusivamente do código da aplicação.

---

# 12. Database Constraints

O banco deve utilizar constraints quando uma regra puder ser garantida de maneira confiável pela própria camada de persistência.

Exemplos:

- `NOT NULL`;
- `UNIQUE`;
- `PRIMARY KEY`;
- `FOREIGN KEY`;
- `CHECK`;
- constraints relacionadas a integridade.

Por exemplo, se determinado identificador precisa ser único, uma constraint de banco é preferível a depender somente de uma verificação feita anteriormente pela aplicação.

A aplicação pode validar antecipadamente para melhorar a experiência e retornar erros mais claros, mas o banco continua sendo uma última linha de defesa para invariantes estruturais.

---

# 13. Primary Keys

As entidades persistentes possuem identificadores internos utilizados pelo banco.

Historicamente, o projeto utiliza IDs internos relacionais, enquanto identificadores públicos podem utilizar UUIDs.

Essa separação permite diferenciar:

```text
Internal Database Identity
        vs
Public API Identity
```

O identificador interno pode ser otimizado para persistência e relacionamentos, enquanto o identificador público reduz exposição de detalhes internos da estrutura do banco.

---

# 14. Public UUIDs

A API utiliza UUIDs como identificadores públicos dos recursos.

Por exemplo:

```http
GET /api/products/{product_uuid}
```

O consumidor não precisa conhecer o ID interno utilizado pelo PostgreSQL.

Conceitualmente:

```text
API
 │
 └── product_uuid
          │
          ▼
      Application
          │
          ▼
   Persistence Mapping
          │
          ▼
      internal id
```

Essa separação também facilita futuras mudanças na estratégia de persistência sem alterar necessariamente o contrato público.

---

# 15. UUID e Evolução

A estratégia de UUID como identificador público também prepara o sistema para uma possível evolução futura dos identificadores internos.

O sistema pode eventualmente adotar UUIDs também na persistência, caso isso traga benefícios suficientes.

Entretanto, essa decisão não deve ser confundida com uma exigência arquitetural atual.

O princípio mais importante é manter a API desacoplada da identidade interna do banco.

---

# 16. Índices

Índices são utilizados para melhorar o desempenho de consultas frequentes.

Em um sistema multi-tenant, índices precisam considerar também os padrões de consulta relacionados ao tenant.

Por exemplo, uma consulta frequente pode possuir:

```sql
WHERE tenant_uuid = :tenant_uuid
  AND uuid = :resource_uuid
```

Dependendo do volume e do padrão de acesso, índices adequados podem ser necessários para evitar scans desnecessários.

Índices devem ser adicionados com base em:

- padrões de consulta;
- cardinalidade;
- volume de dados;
- execution plans;
- métricas;
- comportamento real da aplicação.

Não é desejável criar índices indiscriminadamente.

---

# 17. Composite Indexes

Consultas multi-tenant podem se beneficiar de **composite indexes**.

Por exemplo:

```text
(tenant_uuid, uuid)
```

ou outros conjuntos de campos de acordo com as consultas reais.

A escolha da ordem das colunas deve considerar como os filtros são aplicados.

Por isso, a definição dos índices deve acompanhar a evolução das queries e do volume de dados.

---

# 18. Unique Constraints e Multi-tenancy

Regras de unicidade devem considerar o contexto de tenant quando necessário.

Por exemplo, se dois tenants podem possuir produtos com o mesmo nome:

```text
Tenant A
Produto: Arroz

Tenant B
Produto: Arroz
```

uma constraint global:

```text
UNIQUE(name)
```

poderia ser inadequada.

Nesse cenário, uma regra conceitual poderia ser:

```text
UNIQUE(tenant_uuid, name)
```

quando essa for realmente a regra de negócio.

Isso demonstra uma característica importante do modelo multi-tenant:

> Unicidade é uma regra de negócio e deve ser analisada dentro do contexto correto.

---

# 19. Transactions

Operações que modificam múltiplos registros relacionados devem utilizar transactions quando precisam ser atomicamente consistentes.

Exemplo conceitual de uma venda:

```text
Begin Transaction
      │
      ├── Create Sale
      ├── Create Sale Items
      ├── Update Product Stock
      └── Create Audit Record
      │
      ▼
Commit
```

Se uma etapa falhar:

```text
Rollback
```

Isso evita estados parcialmente persistidos.

---

# 20. Atomicidade

A atomicidade é especialmente importante em operações de negócio.

Por exemplo:

```text
Venda criada
    +
Estoque decrementado
```

não deve resultar em:

```text
Venda criada
Estoque não decrementado
```

quando ambas as operações fazem parte da mesma transação lógica.

A transação deve representar a unidade de consistência necessária para aquele caso de uso.

---

# 21. Transaction Boundary

A definição do limite transacional deve estar alinhada ao caso de uso.

Conceitualmente:

```text
Application Service
        │
        ├── operation A
        ├── operation B
        ├── operation C
        │
        ▼
    Transaction
```

O objetivo é evitar:

- transactions excessivamente pequenas;
- transactions excessivamente longas;
- commits espalhados pela aplicação;
- estados intermediários inconsistentes.

A implementação concreta pode evoluir conforme a arquitetura de Application Services e Domain Model amadurecer.

---

# 22. Concurrency

Operações relacionadas a estoque e vendas possuem potenciais problemas de concorrência.

Imagine:

```text
Estoque atual = 10
```

Duas requisições simultâneas podem tentar vender:

```text
Request A → -7
Request B → -6
```

Sem controle adequado, ambas poderiam observar o mesmo estado anterior e gerar estoque inconsistente.

Por isso, operações críticas devem considerar:

- transactions;
- row locking;
- atomic updates;
- isolation levels;
- optimistic concurrency;
- constraints;
- estratégias de retry.

A estratégia concreta depende do caso de uso e da evolução do domínio.

---

# 23. PostgreSQL como fonte de consistência

O banco deve ser tratado como uma camada importante de garantia de consistência.

A aplicação pode possuir regras como:

```text
if stock < quantity:
    raise InsufficientStock
```

Mas operações concorrentes podem tornar uma simples verificação insuficiente.

Por isso, a regra precisa ser combinada com mecanismos transacionais apropriados.

O objetivo é que a consistência seja preservada mesmo sob concorrência.

---

# 24. Isolation Levels

PostgreSQL oferece diferentes níveis de isolamento transacional.

A aplicação pode utilizar o isolamento padrão quando suficiente e adotar mecanismos mais fortes em operações específicas quando necessário.

A escolha deve considerar:

- consistência necessária;
- concorrência;
- performance;
- possibilidade de deadlocks;
- duração das transactions.

Não é desejável utilizar o nível de isolamento mais restritivo indiscriminadamente.

---

# 25. Deadlocks

Operações concorrentes podem produzir deadlocks quando transactions adquirem locks em ordens incompatíveis.

Por isso, operações que modificam múltiplos recursos devem buscar manter uma ordem consistente de acesso quando possível.

Por exemplo:

```text
Transaction A:
Product 1
Product 2

Transaction B:
Product 1
Product 2
```

é geralmente mais previsível do que:

```text
Transaction A:
Product 1
Product 2

Transaction B:
Product 2
Product 1
```

A aplicação também deve estar preparada para tratar falhas transacionais quando apropriado.

---

# 26. Soft Delete

Algumas entidades podem utilizar **Soft Delete** em vez de remoção física.

Conceitualmente:

```text
deleted_at = NULL
```

representa um registro ativo.

Enquanto:

```text
deleted_at = timestamp
```

representa um registro logicamente removido.

A estratégia detalhada está documentada em:

```text
docs/database/soft-delete.md
```

Soft Delete é especialmente útil quando:

- histórico precisa ser preservado;
- auditoria depende do registro;
- restauração é desejável;
- exclusão física teria impacto em relacionamentos.

---

# 27. Soft Delete e Queries

Quando Soft Delete é utilizado, consultas normais devem excluir registros logicamente removidos.

Conceitualmente:

```sql
SELECT *
FROM products
WHERE tenant_uuid = :tenant_uuid
  AND deleted_at IS NULL;
```

Essa regra deve ser aplicada de forma consistente para evitar que recursos removidos apareçam acidentalmente.

---

# 28. Soft Delete e Integridade

Soft Delete não significa que todas as referências deixam de existir.

Um registro removido logicamente pode continuar sendo necessário para:

- histórico;
- auditoria;
- relatórios;
- relacionamento histórico;
- investigação operacional.

Por isso, Soft Delete deve ser tratado como uma mudança de estado e não simplesmente como uma alternativa sintática ao `DELETE`.

---

# 29. Migrations

Mudanças estruturais no banco devem ser realizadas através de **database migrations**.

O Exactum utiliza ferramentas associadas ao SQLAlchemy/Alembic para controlar a evolução do schema.

Exemplo conceitual:

```text
Schema v1
   │
   ▼
Migration
   │
   ▼
Schema v2
```

As migrations devem ser versionadas junto ao código da aplicação.

---

# 30. Migrations e CI/CD

O processo de deployment deve tratar migrations como parte explícita da evolução da aplicação.

Uma sequência conceitual é:

```text
Deploy
   │
   ├── Update application
   │
   ├── Apply migrations
   │
   └── Start / validate application
```

O processo concreto pode variar conforme o ambiente.

Migrations não devem ser executadas de maneira manual e descontrolada em produção.

---

# 31. Backward-Compatible Migrations

Sempre que possível, mudanças de schema devem ser feitas de maneira compatível com versões intermediárias da aplicação.

Por exemplo:

```text
1. Add new column
2. Deploy application capable of using it
3. Migrate data
4. Remove old dependency
```

Essa abordagem reduz riscos durante deployments.

Ela também é especialmente útil quando diferentes versões da aplicação podem coexistir temporariamente.

---

# 32. Expand and Contract no Banco

A estratégia **Expand and Contract** também pode ser utilizada para migrations.

Exemplo:

```text
Estado atual
    │
    ▼
EXPAND
Adicionar nova coluna
    │
    ▼
Application passa a escrever novo formato
    │
    ▼
Migrar dados existentes
    │
    ▼
CONTRACT
Remover estrutura antiga
```

Esse processo evita alterações destrutivas abruptas.

---

# 33. Data Integrity

Integridade de dados é responsabilidade compartilhada entre:

```text
Application
+
Database
```

A aplicação conhece regras de negócio.

O banco garante invariantes estruturais e integridade referencial.

Por exemplo:

```text
Application:
"Uma venda não pode exceder o estoque disponível."

Database:
"Uma foreign key deve apontar para um registro existente."
```

As duas camadas possuem responsabilidades diferentes e complementares.

---

# 34. Validation vs Database Constraints

A validação da API e as constraints do banco não possuem exatamente o mesmo objetivo.

A API pode validar:

```text
name não pode ser vazio
quantity deve ser positiva
```

O banco pode garantir:

```text
NOT NULL
CHECK
UNIQUE
FOREIGN KEY
```

A aplicação fornece feedback rápido e contextual.

O banco protege a integridade estrutural.

Nenhuma das duas camadas deve ser considerada substituta completa da outra.

---

# 35. Nullability

Campos devem possuir nullability definida de acordo com o domínio.

Exemplo conceitual:

```text
Product.name
→ obrigatório

Product.description
→ opcional
```

Essa decisão deve ser refletida de forma consistente em:

- domínio;
- schema de API;
- ORM model;
- database schema;
- testes.

Inconsistências entre essas camadas podem gerar erros difíceis de diagnosticar.

---

# 36. Timestamps

Entidades que precisam de histórico temporal podem possuir timestamps como:

```text
created_at
updated_at
deleted_at
```

Esses campos possuem responsabilidades distintas.

### `created_at`

Momento em que o registro foi criado.

### `updated_at`

Momento da última atualização relevante.

### `deleted_at`

Momento em que o registro foi logicamente removido, quando Soft Delete é utilizado.

Datas e horários devem ser tratados de forma consistente em toda a aplicação.

---

# 37. Time Zones

Informações temporais devem ser armazenadas e transportadas de maneira consistente.

A aplicação deve evitar depender implicitamente do timezone da máquina que executa o processo.

Para APIs, timestamps devem utilizar representação compatível com ISO 8601.

Exemplo:

```text
2026-09-22T15:30:00Z
```

A estratégia definitiva de timezone deve permanecer consistente entre:

```text
Frontend
API
Application
Database
Logs
Audit
Platform Events
```

---

# 38. Data Types

Os tipos utilizados no PostgreSQL devem refletir adequadamente a natureza dos dados.

Exemplos:

```text
integer
bigint
boolean
numeric
timestamp
text
uuid
```

Valores monetários não devem depender de floating point quando precisão financeira for necessária.

Operações financeiras devem utilizar tipos apropriados para preservar precisão decimal.

---

# 39. Money

Valores monetários representam uma área especialmente sensível.

Uma representação inadequada como:

```text
float
```

pode produzir problemas de precisão.

Para valores financeiros, o sistema deve utilizar uma representação decimal apropriada tanto na aplicação quanto na persistência.

Por exemplo:

```text
PostgreSQL NUMERIC
```

pode ser utilizado para representar valores monetários com precisão definida.

---

# 40. Stock Quantities

Quantidades de estoque também precisam possuir representação coerente.

Dependendo das regras do domínio, uma quantidade pode ser:

```text
integer
```

quando apenas unidades inteiras são permitidas.

Ou:

```text
numeric
```

quando produtos podem ser vendidos por peso, volume ou frações.

Essa decisão pertence ao domínio do Exactum e deve permanecer consistente entre API, aplicação e banco.

---

# 41. Data Access Performance

A performance do banco deve ser acompanhada de maneira incremental.

Problemas potenciais incluem:

- N+1 queries;
- full table scans;
- índices ausentes;
- índices excessivos;
- queries complexas;
- joins desnecessários;
- transactions longas;
- lock contention;
- grandes result sets.

O objetivo não é otimizar prematuramente, mas observar o comportamento real do sistema.

---

# 42. Query Optimization

Queries críticas devem ser analisadas com ferramentas do PostgreSQL quando necessário.

Exemplo:

```sql
EXPLAIN ANALYZE
SELECT ...
```

Essa análise permite identificar:

- execution plan;
- index usage;
- sequential scans;
- custo estimado;
- tempo de execução;
- quantidade de linhas processadas.

A otimização deve ser baseada em evidência.

---

# 43. N+1 Queries

ORMs podem facilitar operações, mas também podem esconder padrões ineficientes.

Um exemplo:

```text
1 query para produtos
+
1 query para cada produto
```

pode gerar:

```text
1 + N queries
```

Esse comportamento deve ser identificado e corrigido quando impactar performance.

Possíveis estratégias incluem:

- eager loading;
- joins;
- batch queries;
- query específica;
- projection.

A escolha depende do caso de uso.

---

# 44. Connection Pool

A aplicação utiliza conexões com PostgreSQL através da camada de acesso ao banco.

Connection pooling permite reutilizar conexões em vez de abrir uma nova conexão para cada operação.

O pool deve ser configurado considerando:

- quantidade de workers;
- concorrência;
- capacidade do PostgreSQL;
- ambiente de execução;
- tempo de vida das conexões.

Configurações inadequadas podem resultar em:

```text
too many connections
```

ou em subutilização do banco.

---

# 45. Redis e PostgreSQL

O Exactum utiliza Redis além do PostgreSQL.

Os dois possuem responsabilidades diferentes.

### PostgreSQL

Fonte persistente para dados relacionais e duráveis.

### Redis

Utilizado para mecanismos que se beneficiam de armazenamento rápido e temporário, incluindo aspectos relacionados a:

- sessões;
- refresh tokens;
- estado de autenticação;
- cache futuro;
- mecanismos de rate limiting.

Redis não substitui o PostgreSQL como fonte principal dos dados persistentes de negócio.

---

# 46. Cache e Database

Quando caching for introduzido para dados de negócio, será necessário definir claramente:

```text
Source of Truth
```

Em geral:

```text
PostgreSQL
     │
     ├── persistent state
     │
     ▼
Redis
     │
     └── cached representation
```

O cache não deve ser tratado automaticamente como fonte definitiva.

Também será necessário considerar:

- cache invalidation;
- TTL;
- stale data;
- cache stampede;
- consistency.

---

# 47. Database Transactions e Redis

Uma transaction PostgreSQL e uma operação Redis não possuem automaticamente a mesma atomicidade.

Por exemplo:

```text
PostgreSQL COMMIT
+
Redis update
```

não representa uma transaction distribuída única.

Esse ponto é importante para futuras funcionalidades que combinem persistência e cache.

Uma estratégia segura pode ser:

```text
Database commit
      ↓
Cache invalidation
```

em vez de tentar tratar ambos como uma única transaction.

A estratégia concreta dependerá do caso de uso.

---

# 48. Audit e Database

Audit Logs podem estar relacionados à mesma transaction da operação de negócio.

Por exemplo:

```text
Transaction
    │
    ├── Update Product
    └── Create Audit Log
    │
    ▼
Commit
```

Isso pode garantir que o registro de auditoria acompanhe a operação persistida.

Porém, a estratégia poderá evoluir para mecanismos assíncronos ou Transactional Outbox conforme a arquitetura amadurecer.

---

# 49. Transactional Outbox

O padrão **Transactional Outbox** é uma possível evolução futura.

Conceitualmente:

```text
Application
    │
    ▼
PostgreSQL Transaction
    │
    ├── Business Data
    └── Outbox Event
            │
            ▼
         Commit
            │
            ▼
      Async Consumer
```

Isso pode ser útil quando eventos precisam ser publicados de forma confiável sem perder consistência entre banco e mensageria.

Atualmente, essa é uma direção arquitetural futura e não deve ser interpretada como mecanismo já implementado em toda a aplicação.

---

# 50. Database e Domain Events

Domain Events podem representar mudanças relevantes no domínio.

Por exemplo:

```text
SaleCompleted
ProductStockChanged
UserCreated
```

Esses eventos não são equivalentes a registros de banco.

Uma futura arquitetura poderá persistir eventos ou outbox records associados a determinadas transactions.

Entretanto:

```text
Database record
≠
Domain Event
```

São conceitos diferentes.

---

# 51. Database Backup

Como o PostgreSQL contém dados persistentes importantes, backups são uma responsabilidade operacional crítica.

Uma estratégia de produção deve considerar:

- frequência;
- retenção;
- armazenamento separado;
- criptografia;
- restauração;
- testes de restore;
- monitoramento.

Backup não deve ser considerado concluído apenas porque um arquivo foi gerado.

É necessário verificar se o backup pode realmente ser restaurado.

---

# 52. Disaster Recovery

Além do backup, a operação deve considerar recuperação após falhas.

Conceitos importantes incluem:

### RPO

**Recovery Point Objective**

Quanto de dados pode ser perdido em um cenário de falha.

### RTO

**Recovery Time Objective**

Quanto tempo pode ser necessário para restaurar o serviço.

Esses valores ainda podem ser formalizados conforme a infraestrutura do Exactum amadurecer.

---

# 53. Database Security

O acesso ao PostgreSQL deve seguir o princípio de menor privilégio.

Credenciais de banco:

- não devem ser expostas no frontend;
- não devem ser armazenadas no código;
- não devem aparecer em logs;
- devem ser fornecidas através de configuração segura;
- devem possuir permissões adequadas.

A aplicação deve utilizar uma conta de banco com permissões compatíveis com suas necessidades.

---

# 54. Secrets

Database credentials devem ser tratadas como secrets.

Exemplos:

```text
POSTGRES_PASSWORD
DATABASE_URL
```

não devem ser:

- commitados no Git;
- colocados em código;
- expostos em logs;
- enviados para o frontend.

O gerenciamento desses valores deve ser realizado pela infraestrutura apropriada de cada ambiente.

---

# 55. Database Access em Development

O ambiente de desenvolvimento deve possuir configuração separada do ambiente de produção.

Conceitualmente:

```text
Development
    ↓
Development PostgreSQL

Production
    ↓
Production PostgreSQL
```

Credenciais, volumes e configurações devem permanecer isolados.

Dados reais de produção não devem ser utilizados indiscriminadamente em desenvolvimento.

---

# 56. Database Access em Tests

Testes automatizados devem possuir ambiente controlado.

A estratégia pode envolver:

- database de teste;
- transactions;
- fixtures;
- factories;
- setup/teardown;
- isolamento entre testes.

O objetivo é evitar que testes dependam de dados existentes ou produzam efeitos persistentes inesperados.

---

# 57. Test Data

Dados utilizados em testes devem ser determinísticos sempre que possível.

Por exemplo:

```text
Tenant fixture
User fixture
Product fixture
Sale fixture
```

Isso permite reproduzir cenários de forma consistente.

Factories podem ser utilizadas para gerar dados de teste sem duplicar estruturas manualmente.

---

# 58. Database Testing

A camada de persistência deve ser testada de maneira apropriada.

Os testes podem verificar:

- queries;
- relationships;
- constraints;
- migrations;
- tenant isolation;
- soft delete;
- transactions;
- uniqueness;
- foreign keys;
- concurrency-sensitive operations.

Testes unitários isolados não substituem testes de integração com PostgreSQL para comportamentos que dependem do banco real.

---

# 59. Migrations Testing

Migrations também devem ser tratadas como código.

Uma migration deve ser avaliada quanto a:

- aplicação em schema existente;
- ordem correta;
- compatibilidade;
- reversibilidade quando aplicável;
- impacto em dados;
- índices;
- constraints.

Idealmente, o pipeline deve detectar migrations quebradas antes do deployment de produção.

---

# 60. Schema Evolution

O schema do banco não é estático.

À medida que o Exactum evoluir:

```text
Product
Sales
Inventory
Users
Tenants
Permissions
```

poderão ganhar novos atributos e responsabilidades.

A evolução deve ser controlada por migrations e acompanhada de alterações correspondentes em:

- Models;
- Repositories;
- Application Services;
- schemas;
- API;
- testes;
- documentação.

---

# 61. Database e Domain Boundaries

A organização do banco deve acompanhar, mas não necessariamente reproduzir literalmente, os limites de domínio.

Por exemplo, a arquitetura pode evoluir de:

```text
Products
Sales
```

para contextos mais especializados, como:

```text
Product
Inventory
Sales
Reporting
```

sem que isso exija necessariamente uma separação física imediata dos bancos.

No estágio atual do Exactum, algumas responsabilidades ainda estão agrupadas em determinados domínios.

A separação física ou lógica mais forte pode ocorrer conforme houver necessidade arquitetural real.

---

# 62. Database e DDD

A evolução para uma arquitetura inspirada em DDD não significa que cada entidade precise automaticamente possuir sua própria tabela ou banco.

DDD trata principalmente de:

- linguagem;
- responsabilidades;
- boundaries;
- invariants;
- domain behavior;
- bounded contexts.

A estrutura física do PostgreSQL é uma decisão de infraestrutura.

Portanto:

```text
Bounded Context
≠
Database
```

Um contexto pode compartilhar o mesmo banco enquanto os limites de software são claramente definidos.

---

# 63. Future Database Architecture

Conforme o Exactum amadurecer, a camada de persistência poderá evoluir com:

- repositories mais especializados;
- queries otimizadas;
- caching com Redis;
- read models;
- background processing;
- Celery;
- RabbitMQ;
- Transactional Outbox;
- métricas de banco;
- tracing;
- observabilidade de queries;
- estratégias de concurrency control;
- melhorias no tenant isolation;
- evolução dos identificadores;
- maior separação entre domain e persistence models.

Essas evoluções devem ocorrer conforme problemas reais surgirem, evitando complexidade prematura.

---

# 64. Observability

A camada de banco deve participar da estratégia de observabilidade.

Informações relevantes podem incluir:

- query duration;
- connection pool usage;
- transaction duration;
- errors;
- deadlocks;
- lock contention;
- slow queries;
- connection failures;
- database availability.

Essas informações podem futuramente alimentar:

```text
Prometheus
    +
Grafana
```

ou outras ferramentas de observabilidade.

---

# 65. Performance Monitoring

Performance do banco deve ser acompanhada junto com performance da aplicação.

Uma requisição lenta pode ter origem em:

```text
Frontend
   ↓
API
   ↓
Application Service
   ↓
Repository
   ↓
PostgreSQL
```

O `request_id` e os mecanismos de correlação documentados em:

```text
docs/observability/correlation.md
```

podem ajudar a relacionar uma requisição HTTP a operações internas e problemas de persistência.

---

# 66. Error Handling

Erros de banco não devem ser expostos diretamente ao consumidor da API.

Por exemplo, uma exception interna do PostgreSQL não deve resultar em:

```text
500
"duplicate key value violates unique constraint..."
```

sem tratamento adequado.

A aplicação deve:

1. registrar o erro internamente;
2. preservar contexto de observabilidade;
3. mapear o erro para uma resposta segura;
4. evitar exposição de detalhes internos.

Esse comportamento está relacionado ao padrão documentado em:

```text
docs/api/errors.md
```

---

# 67. Database Errors e Multi-tenancy

Erros de persistência também precisam respeitar o contexto de tenant.

Logs internos podem registrar informações suficientes para investigação, mas não devem expor dados sensíveis desnecessários.

Respostas para o cliente devem continuar obedecendo:

- authorization;
- tenant isolation;
- safe error exposure.

---

# 68. Data Retention

Nem todos os dados possuem a mesma necessidade de retenção.

Alguns dados podem possuir:

```text
Short retention
```

enquanto outros precisam permanecer por períodos mais longos devido a:

- histórico;
- auditoria;
- obrigações operacionais;
- rastreabilidade;
- relatórios.

As políticas de retenção ainda podem ser formalizadas conforme o produto amadurecer.

---

# 69. Data Deletion

Exclusão de dados deve ser analisada de acordo com o tipo de informação.

Possíveis estratégias:

```text
Hard Delete
Soft Delete
Archive
Retention Policy
```

A escolha depende de:

- necessidade histórica;
- relacionamento;
- auditoria;
- segurança;
- requisitos operacionais;
- recuperação.

Não existe uma estratégia universal para todas as entidades.

---

# 70. Hard Delete

Hard Delete remove fisicamente o registro.

Exemplo:

```sql
DELETE FROM products
WHERE uuid = :uuid;
```

Pode ser apropriado quando:

- o registro não possui valor histórico;
- não existem dependências;
- não há necessidade de restauração;
- requisitos de retenção permitem remoção.

Entretanto, remoções físicas devem ser realizadas com cautela.

---

# 71. Database Documentation

A documentação do banco deve evoluir junto com o schema.

Mudanças importantes devem ser refletidas em:

```text
docs/database/
```

especialmente:

```text
overview.md
schema.md
migrations.md
soft-delete.md
```

O objetivo é evitar que o código seja a única fonte de conhecimento sobre a persistência.

---

# 72. Current State

Atualmente, o Exactum utiliza:

- PostgreSQL como database relacional principal;
- SQLAlchemy como ORM/data access layer;
- Alembic/Flask-Migrate para migrations;
- shared database/shared schema para multi-tenancy;
- tenant-aware persistence;
- repositories para acesso aos dados;
- UUIDs como public identifiers;
- IDs internos para persistência;
- foreign keys e constraints;
- transactions;
- Soft Delete em entidades aplicáveis;
- Redis para responsabilidades complementares;
- testes de integração relacionados à persistência;
- Docker para execução dos serviços;
- PostgreSQL em ambiente de desenvolvimento e produção.

A camada de persistência ainda está em evolução junto com a arquitetura do Exactum.

---

# 73. Limitations and Known Evolution Points

Algumas capacidades ainda podem evoluir.

Entre elas:

- maior formalização de query optimization;
- métricas específicas do PostgreSQL;
- observabilidade de connection pool;
- controle mais sofisticado de concorrência;
- caching de dados de negócio;
- Transactional Outbox;
- processamento assíncrono;
- read models;
- maior separação entre domain e persistence models;
- evolução dos identificadores internos;
- políticas formais de backup e disaster recovery;
- políticas de retenção;
- maior especialização dos Repositories.

Esses pontos representam possibilidades de evolução e não devem ser interpretados como funcionalidades completamente implementadas no estado atual.

---

# 74. Future Evolution

A evolução da persistência deverá seguir uma abordagem incremental.

Uma possível trajetória:

```text
Current
   │
   ├── PostgreSQL
   ├── SQLAlchemy
   ├── Repositories
   ├── Migrations
   └── Multi-tenant persistence
   │
   ▼
Next
   │
   ├── Query optimization
   ├── Redis cache
   ├── Better concurrency controls
   └── Database observability
   │
   ▼
Future
   │
   ├── Transactional Outbox
   ├── Celery
   ├── RabbitMQ
   ├── Read Models
   ├── Stronger domain/persistence separation
   └── More specialized persistence boundaries
```

A evolução não deve ser guiada apenas por padrões arquiteturais, mas pelos problemas reais encontrados no crescimento do sistema.

---

# 75. Design Principles

A arquitetura de banco de dados do Exactum pode ser resumida nos seguintes princípios:

1. **PostgreSQL é a principal fonte persistente dos dados relacionais de negócio.**
2. **Multi-tenancy deve ser respeitado também na camada de persistência.**
3. **Tenant isolation deve utilizar defense in depth.**
4. **Repositories devem encapsular detalhes de acesso ao banco.**
5. **Application Services coordenam casos de uso sem depender diretamente de queries espalhadas.**
6. **Database constraints devem proteger invariantes estruturais.**
7. **Transactions devem representar unidades coerentes de consistência.**
8. **Operações concorrentes devem considerar race conditions e locking.**
9. **Migrations devem controlar a evolução do schema.**
10. **Soft Delete deve ser tratado como mudança de estado, não simplesmente como DELETE alternativo.**
11. **Public identifiers devem permanecer desacoplados da identidade interna do banco.**
12. **Performance deve ser otimizada com base em evidências.**
13. **Redis possui responsabilidades complementares e não substitui o PostgreSQL como fonte persistente principal.**
14. **Erros internos do banco não devem ser expostos diretamente pela API.**
15. **Backups devem ser acompanhados de testes de restauração.**
16. **A estrutura física do banco não precisa reproduzir literalmente os bounded contexts.**
17. **A persistência deve evoluir junto com os limites de domínio, mas sem introduzir complexidade prematuramente.**

---

# 76. Related Documentation

Documentos relacionados:

- [`docs/database/schema.md`](./schema.md)
- [`docs/database/migrations.md`](./migrations.md)
- [`docs/database/soft-delete.md`](./soft-delete.md)
- [`docs/architecture/application-architecture.md`](../architecture/application-architecture.md)
- [`docs/architecture/domain-boundaries.md`](../architecture/domain-boundaries.md)
- [`docs/architecture/multi-tenancy.md`](../architecture/multi-tenancy.md)
- [`docs/security/tenant-isolation.md`](../security/tenant-isolation.md)
- [`docs/api/errors.md`](../api/errors.md)
- [`docs/observability/correlation.md`](../observability/correlation.md)
- [`docs/operations/deployment.md`](../operations/deployment.md)

---

# 77. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo, conceitos como `tenant`, `resource`, `repository`, `transaction` ou `persistence model` representam responsabilidades arquiteturais, enquanto a implementação pode utilizar nomes específicos como `tenant_uuid`, `product_uuid`, `sale_uuid` ou nomes concretos de classes e tabelas.

Essa distinção permite documentar o significado arquitetural de cada elemento sem limitar o conceito à implementação atual.

A arquitetura de persistência também poderá evoluir conforme o sistema avance. Responsabilidades atualmente agrupadas em determinados domínios poderão posteriormente ser separadas, e modelos de persistência poderão receber limites mais especializados conforme a evolução para uma arquitetura mais fortemente orientada a domínios.

Portanto, este documento deve ser interpretado como uma representação do **modelo atual de persistência do Exactum e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura do banco de dados.
