# Migrations do Banco de Dados

## 1. Objetivo

As migrations são o mecanismo utilizado pelo Exactum para versionar e aplicar mudanças estruturais no banco de dados de forma controlada, reproduzível e compatível com o ciclo de desenvolvimento e deployment da aplicação.

Este documento descreve:

- o papel das database migrations;
- a relação entre código e schema do banco;
- o uso de Alembic e Flask-Migrate;
- a criação e revisão de migrations;
- aplicação de migrations em ambientes de desenvolvimento e produção;
- rollback e downgrade;
- compatibilidade entre versões da aplicação e do banco;
- alterações de tabelas, colunas, constraints e índices;
- cuidados com dados existentes;
- migrations destrutivas;
- transações;
- concorrência e lock;
- integração com CI/CD;
- recuperação em caso de falha;
- evolução do schema ao longo da arquitetura do Exactum.

A estratégia apresentada representa o modelo atual do projeto e sua direção de evolução.

---

## 2. Schema do Banco e Versionamento

O schema do PostgreSQL representa o estado estrutural persistente do Exactum.

Esse estado inclui elementos como:

- tables;
- columns;
- primary keys;
- foreign keys;
- unique constraints;
- indexes;
- check constraints;
- relationships;
- defaults;
- data types;
- estruturas necessárias para suportar as regras de persistência.

As migrations representam a sequência de transformações necessárias para levar o banco de uma versão conhecida para outra.

Portanto, o schema representa o **estado**, enquanto as migrations representam a **evolução desse estado**.

```text
Migration N
     │
     ▼
Database Schema N
     │
     │ migration
     ▼
Database Schema N+1
```

Essa distinção é importante porque o banco de produção não deve depender de alterações manuais realizadas diretamente no PostgreSQL.

---

## 3. Migration como Histórico do Schema

Cada migration representa uma alteração específica ou um conjunto logicamente relacionado de alterações.

Exemplo conceitual:

```text
001_initial_schema
        │
        ▼
002_add_user_uuid
        │
        ▼
003_add_product_indexes
        │
        ▼
004_add_audit_log
        │
        ▼
005_add_permission_tables
```

O conjunto dessas migrations forma o histórico evolutivo do banco.

Esse histórico permite reconstruir a sequência pela qual o schema chegou ao estado atual.

---

## 4. Alembic

O Exactum utiliza **Alembic** como ferramenta de database migration.

Alembic fornece mecanismos para:

- versionar alterações estruturais;
- aplicar migrations;
- executar downgrades;
- identificar a versão atual do schema;
- encadear revisions;
- executar alterações de forma reproduzível;
- integrar migrations ao processo de deployment.

As migrations são representadas por arquivos versionados no repositório da aplicação.

---

## 5. Flask-Migrate

O projeto utiliza **Flask-Migrate** como integração entre Flask e Alembic.

Flask-Migrate facilita operações relacionadas às migrations dentro do ambiente Flask, incluindo:

- criação de revisions;
- geração de alterações a partir do estado dos models;
- aplicação de migrations;
- downgrade;
- consulta do histórico.

Apesar da integração proporcionada pelo Flask-Migrate, o resultado final continua sendo uma migration do Alembic.

A migration versionada no repositório é a fonte de verdade para a evolução do schema.

---

## 6. Models não são a Migration

Alterar um SQLAlchemy model não altera automaticamente o banco de dados.

Por exemplo:

```python
class Product(db.Model):
    name = db.Column(db.String(120), nullable=False)
```

Adicionar posteriormente:

```python
description = db.Column(db.Text)
```

altera o modelo da aplicação, mas não altera automaticamente uma tabela já existente no PostgreSQL.

É necessário criar uma migration correspondente.

```text
SQLAlchemy Model
       │
       │ change
       ▼
Migration
       │
       │ apply
       ▼
PostgreSQL Schema
```

Esse processo mantém explícita a relação entre alteração de código e alteração persistente.

---

## 7. Geração Automática (autogenerate)

O Alembic pode comparar o estado conhecido pelos models com o schema atual e gerar uma migration candidata por meio do mecanismo de `autogenerate`.

Conceitualmente:

```text
Models
  │
  │ compare
  ▼
Current DB Schema
  │
  ▼
Generated Migration
```

A migration gerada automaticamente não deve ser considerada automaticamente correta.

Ela deve ser revisada antes de ser commitada.

---

## 8. Revisão Obrigatória de Migrations

Toda migration gerada ou escrita manualmente deve ser revisada.

A revisão deve verificar:

- tabelas alteradas;
- colunas adicionadas;
- colunas removidas;
- tipos;
- nullability;
- defaults;
- foreign keys;
- unique constraints;
- indexes;
- nomes;
- operações destrutivas;
- impacto em dados existentes;
- impacto em performance;
- compatibilidade com a versão atual da aplicação.

Uma migration tecnicamente válida pode ainda ser inadequada para produção.

---

## 9. Estrutura das Migrations

Uma migration do Alembic normalmente possui uma estrutura semelhante a:

```python
revision = "..."
down_revision = "..."

def upgrade():
    ...


def downgrade():
    ...
```

A migration possui:

- `revision`: identificador da própria revision;
- `down_revision`: revision anterior;
- `upgrade()`: avanço do schema;
- `downgrade()`: reversão da alteração, quando suportada.

Isso forma uma cadeia de revisions.

```text
A → B → C → D
```

---

## 10. Grafo de Revisões

As migrations formam um grafo de dependências baseado em `revision` e `down_revision`.

O fluxo esperado normalmente é linear:

```text
A
│
▼
B
│
▼
C
│
▼
D
```

Branches de migration podem existir durante desenvolvimento paralelo, mas devem ser tratadas com cuidado para evitar múltiplas heads não intencionais.

Antes do merge, o histórico deve ser reconciliado quando necessário.

---

## 11. Head Único de Migrations

O ambiente de produção deve possuir uma sequência de migrations claramente resolvida.

Uma situação como:

```text
        B
       / \
      C   D
       \ /
        E
```

pode ser válida quando explicitamente resolvida por uma migration de merge.

Já múltiplas heads não intencionais indicam que o histórico precisa ser corrigido antes do deployment.

---

## 12. Nomenclatura de Migrations

Os nomes das migrations devem comunicar a intenção da alteração.

Exemplos conceituais:

```text
add_product_uuid
add_audit_log_table
add_user_permissions
create_session_indexes
add_tenant_status
```

O nome não precisa descrever cada operação interna.

Ele deve permitir identificar rapidamente o propósito da migration.

---

## 13. Migrations Pequenas e Focadas

Migrations devem preferencialmente ser pequenas e focadas.

Uma migration deve representar uma mudança lógica bem definida.

Exemplo:

```text
add_product_uuid
```

é preferível a uma migration genérica como:

```text
update_database
```

Isso melhora:

- revisão;
- troubleshooting;
- histórico;
- rollback;
- entendimento arquitetural;
- auditoria do schema.

---

## 14. Mudanças de Schema

Mudanças estruturais podem incluir:

```text
CREATE TABLE
ALTER TABLE
ADD COLUMN
DROP COLUMN
ALTER COLUMN
CREATE INDEX
DROP INDEX
ADD CONSTRAINT
DROP CONSTRAINT
```

Cada operação possui diferentes níveis de risco.

Alterações simples de metadata podem ter impacto pequeno, enquanto alterações de tipos, índices grandes ou remoções podem exigir planejamento específico.

---

## 15. Adição de Colunas

Adicionar uma coluna geralmente é uma operação simples, mas alguns casos exigem cuidado.

Por exemplo:

```sql
ALTER TABLE product
ADD COLUMN description TEXT;
```

Adicionar uma coluna nullable tende a ser compatível com versões anteriores da aplicação que ainda não conhecem a coluna.

Isso permite uma estratégia de evolução gradual.

---

## 16. Adição de Colunas Não Nulas

Adicionar diretamente uma coluna `NOT NULL` em uma tabela que já possui dados pode exigir preenchimento dos registros existentes.

Uma estratégia segura pode ser:

```text
1. Add nullable column
2. Deploy compatible application
3. Backfill existing data
4. Validate data
5. Add NOT NULL constraint
```

Em vez de:

```text
ADD COLUMN ... NOT NULL
```

imediatamente em uma tabela populada.

Essa estratégia reduz o risco de incompatibilidade durante deployment.

---

## 17. Valores Padrão

Defaults devem ser utilizados conscientemente.

Um default pode representar:

- valor padrão de domínio;
- compatibilidade com dados antigos;
- comportamento necessário para novos registros.

Entretanto, um default no banco não deve ser utilizado para esconder uma regra de negócio que deveria estar explicitamente representada na camada de aplicação ou domínio.

---

## 18. Backfill

Algumas mudanças exigem transformação dos dados existentes.

Exemplo:

```text
Existing data
     │
     ▼
New column
     │
     ▼
Backfill
     │
     ▼
Validation
     │
     ▼
Constraint
```

Backfill significa preencher ou transformar dados históricos para adequá-los ao novo schema.

Backfills devem ser planejados considerando:

- quantidade de registros;
- duração;
- locks;
- consumo de recursos;
- impacto na aplicação;
- possibilidade de execução em batches.

---

## 19. Migração de Schema vs Migração de Dados

Nem toda migration é puramente estrutural.

É útil distinguir:

### Migração de Schema

Altera a estrutura:

```text
table
column
index
constraint
foreign key
```

### Migração de Dados

Altera os dados existentes:

```text
UPDATE
INSERT
DELETE
transformations
backfill
```

Uma migration pode conter ambos, mas mudanças de dados devem ser avaliadas cuidadosamente.

---

## 20. Transformação de Dados

Transformações de dados devem ser determinísticas sempre que possível.

Exemplo conceitual:

```text
old_status
   │
   ├── pending → PENDING
   ├── paid    → PAID
   └── canceled → CANCELED
```

A migration deve conseguir produzir o mesmo resultado quando executada no mesmo estado de origem.

---

## 21. Migrations Destrutivas

Operações destrutivas incluem:

- `DROP TABLE`;
- `DROP COLUMN`;
- remoção de constraints;
- perda de dados;
- transformação irreversível;
- redução incompatível de tipos.

Essas operações exigem atenção especial.

Uma migration destrutiva não deve ser tratada como uma alteração comum.

---

## 22. Expandir e Contrair (Expand and Contract)

Para alterações que afetam aplicações em execução, uma estratégia útil é o padrão **Expand and Contract**.

### Expansão (Expand)

Adicionar a nova estrutura sem remover a antiga.

```text
Old Application
      │
      ▼
Old + New Schema
```

### Migrate

Atualizar a aplicação e/ou migrar dados.

```text
Old + New Schema
      │
      ▼
New Application
```

### Contrato

Remover estruturas antigas somente quando não forem mais utilizadas.

```text
New Application
      │
      ▼
New Schema
```

Esse padrão reduz problemas de incompatibilidade entre versões.

---

## 23. Compatibilidade Retroativa

Durante um deployment, pode existir um período em que:

```text
Application N
```

e

```text
Application N+1
```

interagem com o mesmo banco.

Por isso, alterações estruturais devem considerar compatibilidade entre versões.

Exemplo:

```text
N      → expects old_column
N+1    → uses new_column
```

A migration não deve remover `old_column` antes que a versão antiga deixe de utilizá-la, quando existe possibilidade de coexistência.

---

## 24. Rename de Colunas

Renomear diretamente uma coluna pode quebrar versões anteriores da aplicação.

Uma estratégia gradual pode ser:

```text
old_column
     │
     ├── add new_column
     │
     ├── write both
     │
     ├── migrate existing data
     │
     ├── read new_column
     │
     └── remove old_column
```

Essa estratégia é especialmente relevante em deployments onde versões podem coexistir temporariamente.

---

## 25. Alteração de Tipos de Dados

Alterações de tipo devem considerar:

- dados existentes;
- conversibilidade;
- índices;
- constraints;
- performance;
- compatibilidade com SQLAlchemy;
- compatibilidade com a API.

Exemplo:

```text
INTEGER
   ↓
BIGINT
```

pode ser diferente de:

```text
TEXT
   ↓
INTEGER
```

A segunda alteração exige validação explícita dos dados existentes.

---

## 26. Foreign Keys

Foreign keys devem ser introduzidas considerando os dados existentes.

Antes de adicionar uma foreign key:

```text
child.parent_id
       │
       ▼
parent.id
```

os registros existentes devem obedecer à relação.

Caso contrário, a migration poderá falhar.

---

## 27. Constraints

Constraints são parte importante da integridade do banco.

Podem incluir:

- `PRIMARY KEY`;
- `FOREIGN KEY`;
- `UNIQUE`;
- `NOT NULL`;
- `CHECK`.

Quando uma regra é estruturalmente importante para a integridade dos dados, ela deve ser considerada para enforcement no banco, além das validações realizadas pela aplicação quando apropriado.

---

## 28. Índices

Indexes também fazem parte da evolução do schema.

Exemplos de necessidade:

```text
tenant_uuid
user_uuid
product_uuid
created_at
status
```

A criação de um index deve considerar:

- frequência das queries;
- cardinalidade;
- tamanho da tabela;
- custo de escrita;
- espaço em disco;
- planos de execução.

Indexes não devem ser adicionados simplesmente porque uma coluna existe.

---

## 29. Indexes em Produção

A criação de índices em tabelas grandes pode gerar impacto operacional.

Antes de uma alteração desse tipo, deve-se avaliar:

- duração esperada;
- locks;
- tráfego;
- janela de deployment;
- impacto em queries;
- necessidade de estratégias específicas do PostgreSQL.

Para alterações de grande porte, a operação deve ser tratada como uma mudança operacional, não apenas como uma alteração de código.

---

## 30. Migrations Conscientes de Tenant

Como o Exactum é multi-tenant, migrations devem ser tratadas no nível do schema compartilhado.

O modelo atual utiliza um banco compartilhado entre tenants.

Portanto, uma alteração como:

```text
ALTER TABLE product ...
```

afeta estruturalmente todos os tenants.

Isso é diferente de uma operação de negócio, que deve respeitar o `tenant_uuid`.

Migration estrutural não deve tentar reproduzir lógica de isolamento de tenant como se fosse uma request normal da API.

---

## 31. Dados do Tenant Durante Backfills

Embora a estrutura seja compartilhada, backfills podem operar sobre dados pertencentes a diferentes tenants.

Quando a transformação depende de dados específicos do tenant, o processamento deve manter o contexto necessário.

Conceitualmente:

```text
Shared Table
   │
   ├── Tenant A
   ├── Tenant B
   └── Tenant C
```

O backfill deve evitar pressupostos que misturem dados de tenants diferentes.

---

## 32. Migrations e Soft Delete

Soft Delete altera o modelo de persistência sem necessariamente remover fisicamente os registros.

Uma migration pode introduzir campos como:

```text
deleted_at
```

ou estruturas relacionadas ao estado de exclusão.

A migration deve considerar:

- dados existentes;
- índices;
- queries;
- uniqueness;
- comportamento da aplicação;
- compatibilidade com registros históricos.

Soft Delete possui documento próprio em:

```text
docs/database/soft-delete.md
```

---

## 33. Migrations e UUIDs

A evolução do Exactum inclui o uso de identificadores públicos baseados em UUID.

Alterações relacionadas a UUIDs podem exigir:

- novas colunas;
- backfill;
- indexes;
- foreign keys;
- atualização da API;
- compatibilidade entre identificadores antigos e novos.

Uma migração desse tipo deve ser feita de forma incremental quando houver dados existentes.

---

## 34. Migrations e RBAC

A evolução do modelo de autorização pode exigir alterações em estruturas como:

```text
roles
permissions
role_permissions
user_permissions
```

Mudanças de autorização devem considerar tanto o schema quanto os dados.

Por exemplo, adicionar uma nova permission pode exigir:

```text
1. create permission
2. associate with appropriate roles
3. deploy application support
4. validate authorization behavior
```

---

## 35. Migrations e Sessions

Session state relacionado a refresh tokens e JTIs possui responsabilidades diferentes do schema persistente principal.

O PostgreSQL pode armazenar informações persistentes relacionadas ao domínio, enquanto o Redis mantém estado operacional de sessão.

Uma migration PostgreSQL não deve ser confundida com uma alteração de Redis state.

```text
PostgreSQL
    │
    └── Persistent relational state

Redis
    │
    └── Operational/session/cache state
```

---

## 36. Redis e Schema Evolution

Alterações que envolvem Redis podem exigir estratégia própria de compatibilidade.

Como Redis não é versionado por Alembic, mudanças em estruturas de chaves devem ser tratadas pela aplicação.

Exemplo:

```text
session:v1:<jti>
```

e posteriormente:

```text
session:v2:<jti>
```

Quando necessário, a aplicação pode suportar temporariamente ambas as representações durante uma transição.

---

## 37. Comportamento Transacional

Migrations podem utilizar transações dependendo da operação e das capacidades do PostgreSQL.

A atomicidade é importante porque reduz a possibilidade de deixar o schema parcialmente alterado.

Conceitualmente:

```text
BEGIN
   │
   ├── operation 1
   ├── operation 2
   └── operation 3
   │
   ▼
COMMIT
```

Em caso de falha:

```text
ROLLBACK
```

Entretanto, operações específicas do PostgreSQL possuem comportamentos e restrições próprias quanto à execução transacional.

---

## 38. Migrations de Longa Duração

Migrations longas representam risco operacional.

Possíveis causas:

- grandes backfills;
- criação de índices;
- alteração de tipos;
- atualização massiva;
- tabelas muito grandes.

Quando a operação pode levar tempo significativo, deve-se avaliar separar:

```text
Schema Change
```

de:

```text
Data Backfill
```

Isso permite maior controle sobre o deployment.

---

## 39. Locks

Alterações de schema podem adquirir locks.

Isso pode afetar:

- reads;
- writes;
- transactions;
- availability.

Antes de executar uma migration potencialmente pesada, é importante entender o comportamento do PostgreSQL para a operação específica.

O risco deve ser avaliado em relação ao tamanho das tabelas e ao tráfego do ambiente.

---

## 40. Migrations em Produção

Migrations de produção devem ser executadas de maneira controlada.

Fluxo conceitual:

```text
Code
 │
 ▼
Tests
 │
 ▼
Migration Review
 │
 ▼
CI
 │
 ▼
Deployment
 │
 ▼
Migration
 │
 ▼
Application
```

A ordem exata pode variar conforme a estratégia de compatibilidade.

O importante é que schema e aplicação sejam tratados como partes de uma mesma mudança.

---

## 41. Migration no Deployment do Exactum

O processo de deployment do Exactum utiliza Docker e GitHub Actions.

As migrations são tratadas separadamente do processo principal de subida dos containers quando necessário.

Conceitualmente:

```text
GitHub Actions
      │
      ▼
Deploy Application
      │
      ▼
Migration Step
      │
      ▼
Database Updated
```

Essa separação permite controlar explicitamente quando o schema é atualizado.

---

## 42. Falha de Migration

Se uma migration falhar, o deployment não deve simplesmente assumir que o banco está atualizado.

O estado deve ser investigado.

Possíveis causas:

- dados incompatíveis;
- constraint violation;
- lock;
- conexão;
- SQL inválido;
- migration incorreta;
- timeout;
- dependência ausente.

O primeiro passo é identificar a migration e o estado real do banco.

---

## 43. Versão do Banco de Dados

O Alembic mantém a identificação da revision aplicada ao banco.

Isso permite verificar:

```text
Current database revision
```

e comparar com:

```text
Repository migration head
```

Conceitualmente:

```text
Database
   │
   └── revision: C

Repository
   │
   └── head: D
```

Nesse caso, o banco está uma migration atrás.

---

## 44. Upgrade

O fluxo de upgrade move o banco em direção ao estado mais recente conhecido.

Conceitualmente:

```text
A → B → C → D
```

Executar upgrade a partir de `B` leva o banco para:

```text
B → C → D
```

As migrations intermediárias são aplicadas na ordem correta.

---

## 45. Downgrade

Downgrade representa a reversão de uma ou mais revisions.

Exemplo:

```text
A → B → C
```

pode retornar:

```text
A → B
```

quando a migration `C` possui downgrade apropriado.

Entretanto, downgrade não deve ser tratado como garantia de recuperação de dados.

---

## 46. Downgrade e Perda de Dados

Uma migration pode ser estruturalmente reversível, mas seus dados podem não ser.

Exemplo:

```text
DROP COLUMN description
```

Mesmo que seja possível recriar a coluna posteriormente, os dados anteriormente armazenados podem ter sido perdidos.

Portanto:

```text
schema rollback
```

não significa necessariamente:

```text
data recovery
```

Backups continuam sendo necessários.

---

## 47. Backup Antes de Mudanças de Alto Risco

Alterações de alto risco em produção devem considerar backup apropriado antes da execução.

Especialmente:

- migrations destrutivas;
- grandes data transformations;
- alterações de tipos;
- alterações em tabelas críticas;
- operações potencialmente irreversíveis.

Backup e rollback são mecanismos diferentes e complementares.

---

## 48. Testes de Migrations

Migrations devem ser testadas.

Uma estratégia pode incluir:

```text
Fresh Database
      │
      ▼
Run all migrations
      │
      ▼
Current Schema
```

e:

```text
Previous Database State
      │
      ▼
Run new migration
      │
      ▼
Expected Schema
```

Quando relevante, também:

```text
Upgrade
  │
  ▼
Downgrade
  │
  ▼
Expected Previous State
```

---

## 49. Teste com Banco Limpo

Um teste importante consiste em criar um banco vazio e aplicar todas as migrations desde o início.

Isso verifica se o histórico é suficiente para reproduzir o schema atual.

```text
Empty DB
   │
   ▼
Migration 1
   │
   ▼
Migration 2
   │
   ▼
...
   │
   ▼
HEAD
```

Esse processo reduz o risco de depender de alterações manuais que nunca foram versionadas.

---

## 50. Teste com Banco Existente

Também é importante testar migrations sobre um banco que representa uma versão anterior.

Isso verifica a transição:

```text
Schema N
   │
   │ migration
   ▼
Schema N+1
```

Uma migration pode funcionar em um banco vazio e ainda falhar em um banco real com dados.

---

## 51. Migrations no CI

O CI deve validar migrations quando possível.

Uma estratégia pode incluir:

```text
Install dependencies
       │
       ▼
Start PostgreSQL
       │
       ▼
Run migrations
       │
       ▼
Run tests
       │
       ▼
Result
```

Isso permite detectar migrations inválidas antes de chegar ao ambiente de produção.

---

## 52. Migrations e Testes

Testes de aplicação não substituem testes de migration.

São preocupações relacionadas, mas diferentes:

```text
Application Tests
    └── behavior

Migration Tests
    └── schema evolution
```

Ambos devem fazer parte do ciclo de qualidade.

---

## 53. Checklist de Revisão de Migrations

Antes de mergear uma migration:

```text
[ ] Revision está correta
[ ] down_revision está correto
[ ] Não existem heads inesperadas
[ ] upgrade() foi revisado
[ ] downgrade() foi revisado quando aplicável
[ ] Alterações destrutivas foram identificadas
[ ] Dados existentes foram considerados
[ ] Constraints foram revisadas
[ ] Indexes foram revisados
[ ] Foreign keys foram revisadas
[ ] Backfill foi analisado
[ ] Compatibilidade da aplicação foi considerada
[ ] Performance foi considerada
[ ] Testes foram executados
```

---

## 54. Migrations Manuais

Nem toda migration precisa ser completamente gerada por autogenerate.

Existem situações em que uma migration manual é mais apropriada.

Exemplos:

- operações específicas do PostgreSQL;
- backfills;
- alterações complexas;
- criação de estruturas especiais;
- estratégias de compatibilidade;
- operações que exigem ordem específica.

Nesse caso, a migration deve continuar sendo versionada pelo Alembic.

---

## 55. Raw SQL em Migrations

Raw SQL pode ser utilizado quando necessário.

Exemplo conceitual:

```python
op.execute(
    """
    UPDATE product
    SET ...
    """
)
```

Entretanto, SQL executado em migrations deve ser:

- explícito;
- revisado;
- compatível com PostgreSQL;
- determinístico;
- seguro para os dados existentes.

A migration não deve depender de lógica externa que não esteja versionada.

---

## 56. Idempotência de Migrations

Uma migration normal do Alembic não precisa ser idempotente no sentido de poder ser executada infinitas vezes.

O controle de revisions garante que uma migration já aplicada não seja reaplicada normalmente.

Entretanto, operações internas devem evitar comportamentos inesperados quando isso for relevante para recuperação ou execução controlada.

---

## 57. Divergência de Schema (Schema Drift)

**Schema drift** ocorre quando o banco se afasta do schema esperado pelo repositório.

Exemplo:

```text
Repository
   │
   └── expects schema B

Production DB
   │
   └── manually changed schema X
```

Esse estado é perigoso porque o código e o histórico de migrations deixam de representar a realidade.

Por isso, alterações estruturais devem passar pelo sistema de migrations.

---

## 58. Mudanças Manuais no Banco de Dados

Alterações manuais diretamente em produção devem ser evitadas.

Exceções podem existir em situações operacionais específicas, mas qualquer alteração estrutural necessária deve posteriormente ser refletida no mecanismo oficial de versionamento quando aplicável.

O objetivo é evitar:

```text
Production DB
    ≠
Migration History
```

---

## 59. Migration History as Documentation

O histórico de migrations também funciona como documentação evolutiva do banco.

Ele permite responder perguntas como:

- quando uma tabela foi criada?
- quando determinado campo surgiu?
- quando um index foi adicionado?
- quando uma relação mudou?
- quando uma constraint foi introduzida?

Assim, migrations possuem valor além da execução técnica.

---

## 60. Relação com a Evolução do Domínio

Mudanças arquiteturais podem resultar em mudanças no schema.

Por exemplo:

```text
Current Domain
    │
    ▼
New Domain Boundary
    │
    ▼
Schema Evolution
```

Entretanto, alteração arquitetural não implica necessariamente alteração imediata no banco.

Uma separação conceitual pode ser realizada primeiro na aplicação e somente depois refletida na persistência.

---

## 61. Evolução Futura de Estoque

Atualmente, responsabilidades relacionadas a estoque ainda estão distribuídas principalmente entre os domínios de Product e Sales.

Uma evolução futura pode introduzir estruturas específicas para:

```text
Inventory
StockMovement
StockBalance
```

Essa evolução poderá exigir migrations próprias.

Exemplo conceitual:

```text
Product / Sales
       │
       ▼
Inventory Boundary
       │
       ├── stock balance
       └── stock movement
```

Essa mudança deve ser feita de forma incremental e compatível com os dados existentes.

---

## 62. Evolução Futura de Relatórios

Reporting também poderá evoluir para uma estrutura própria.

Possibilidades futuras incluem:

```text
Reporting
   │
   ├── Read Models
   ├── Aggregations
   ├── Materialized Views
   └── Analytical Queries
```

Essas estruturas podem exigir migrations específicas ou mecanismos adicionais de atualização de dados.

O estado atual não pressupõe um Reporting context independente.

---

## 63. Modelos de Leitura

Caso o Exactum adote read models no futuro, as migrations poderão criar estruturas específicas para leitura.

Por exemplo:

```text
Transactional Tables
        │
        ▼
Read Model
        │
        ▼
Reporting Query
```

Essas estruturas devem ser tratadas como projeções derivadas quando essa estratégia for adotada.

---

## 64. Views Materializadas

O PostgreSQL permite materialized views para cenários específicos de leitura.

Uma eventual adoção poderia ser versionada por migrations.

Entretanto, materialized views não devem ser introduzidas apenas como otimização prematura.

Sua utilização deve estar relacionada a necessidades reais de:

- performance;
- agregação;
- reporting;
- carga de leitura.

---

## 65. Transactional Outbox

Uma evolução futura do Exactum poderá utilizar um padrão de **Transactional Outbox**.

Nesse cenário, a migration poderia introduzir uma tabela como:

```text
outbox_event
```

A escrita poderia ocorrer na mesma transaction da alteração de domínio:

```text
BEGIN
   │
   ├── Domain Change
   │
   ├── Outbox Event
   │
   ▼
COMMIT
```

Posteriormente, um worker poderia publicar/processar o evento.

Essa estrutura não faz parte necessariamente do schema atual, mas representa uma possível evolução da arquitetura.

---

## 66. Processamento Assíncrono

A futura adoção de:

- Celery;
- RabbitMQ;
- background workers;

poderá criar novas necessidades de persistência.

Migrations devem continuar representando somente o estado persistente necessário para essas funcionalidades.

Estado transitório de filas e workers não deve ser confundido com schema relacional.

---

## 67. Compatibilidade do Deployment

Migrations devem ser compatíveis com o processo de deployment utilizado pelo Exactum.

O objetivo é evitar uma situação como:

```text
Application deployed
       │
       ▼
Schema incompatible
       │
       ▼
Runtime failure
```

Quando uma mudança exige mais de uma etapa, o deployment deve seguir uma sequência explicitamente planejada.

---

## 68. Deployment com Falha

Em caso de falha durante deployment:

```text
Application
    │
    ├── deployed
    │
    ▼
Migration
    │
    └── failed
```

não se deve assumir automaticamente que o banco pode simplesmente ser revertido.

É necessário verificar:

1. qual migration falhou;
2. se houve alteração parcial;
3. qual revision está registrada;
4. se a transaction foi revertida;
5. se dados foram alterados;
6. qual versão da aplicação está ativa.

---

## 69. Estratégia de Recuperação

A recuperação depende da natureza da falha.

Possibilidades:

```text
Fix migration
     │
     ▼
Retry
```

ou:

```text
Restore backup
     │
     ▼
Recover database
```

ou:

```text
Rollback application
     │
     ▼
Keep compatible schema
```

Não existe uma estratégia universal de rollback.

O procedimento deve considerar o tipo de alteração e o estado real do sistema.

---

## 70. Segurança em Produção

Antes de executar uma migration relevante em produção, deve-se considerar:

- backup;
- tamanho das tabelas;
- locks;
- duração;
- compatibilidade;
- disponibilidade;
- plano de rollback;
- observabilidade;
- possibilidade de retry;
- impacto sobre requests;
- impacto sobre jobs.

Database migrations fazem parte do processo operacional da aplicação.

---

## 71. Observabilidade Durante Migrations

Migrations de produção devem ser observadas.

Quando aplicável, deve-se acompanhar:

- duração;
- erros;
- conexão com PostgreSQL;
- locks;
- uso de CPU;
- memória;
- I/O;
- disponibilidade da aplicação;
- comportamento das requests após a migration.

Logs de deployment devem permitir identificar qual revision foi aplicada.

---

## 72. Versão da Migration e Versão do Deployment

É útil conseguir correlacionar:

```text
Application Version
```

com:

```text
Database Migration Version
```

Exemplo conceitual:

```text
Exactum v0.3.0
       │
       └── DB revision abc123
```

Essa relação facilita troubleshooting e investigação de incidentes.

---

## 73. Reprodutibilidade

O schema de um ambiente deve ser reproduzível a partir do código versionado.

Idealmente:

```text
Repository
    │
    ├── Models
    └── Migrations
           │
           ▼
      PostgreSQL
```

Isso reduz dependência de conhecimento manual sobre o estado do banco.

---

## 74. Fluxo de Desenvolvimento

Fluxo recomendado para alterações de schema:

```text
1. Alterar model/domain requirement
2. Gerar ou escrever migration
3. Revisar migration
4. Aplicar localmente
5. Executar testes
6. Validar schema
7. Commitar código + migration
8. CI
9. Deploy
10. Aplicar migration em ambiente alvo
```

A migration deve fazer parte do mesmo change set da alteração de código que depende dela.

---

## 75. Commit de Migrations

Uma alteração de schema deve, sempre que possível, ser commitada junto com a alteração da aplicação que depende dela.

Exemplo:

```text
Commit
├── model change
├── service/controller changes
├── tests
└── migration
```

Isso mantém código e schema evoluindo juntos.

---

## 76. Migrations e Git

As migrations são artefatos versionados pelo Git.

Portanto, alterações em migrations devem passar pelo mesmo processo de:

- code review;
- branch;
- CI;
- merge;
- histórico;
- release.

Não existe uma separação entre “código” e “migration” do ponto de vista do versionamento do projeto.

---

## 77. Migrations e Mudanças Semânticas

Nem toda mudança de domínio exige uma migration.

Por exemplo:

```text
Rename conceptual service
```

pode não exigir alteração de banco.

Por outro lado:

```text
Add persisted field
```

normalmente exige.

A necessidade de migration deve ser determinada pela alteração real no estado persistente.

---

## 78. O Banco de Dados como Fonte da Integridade da Persistência

A aplicação implementa regras de negócio, mas o PostgreSQL também deve proteger a integridade estrutural dos dados quando apropriado.

Migrations são o mecanismo pelo qual essas garantias são evoluídas.

Exemplo:

```text
Application
    │
    ├── business validation
    │
    ▼
PostgreSQL
    │
    └── structural integrity
```

As duas camadas possuem responsabilidades complementares.

---

## 79. Evitando Regras de Negócio em Migrations

Migrations não devem se transformar em uma segunda aplicação.

Devem evitar:

- chamadas para APIs externas;
- dependência de serviços da aplicação;
- regras de negócio complexas;
- lógica que dependa de estado externo;
- operações não determinísticas.

A responsabilidade principal da migration é evoluir o estado persistente.

---

## 80. Dependências Externas

Uma migration não deve depender de:

```text
External API
Redis
RabbitMQ
Celery
Frontend
```

para conseguir completar uma alteração estrutural normal.

Quanto menos dependências externas, mais reproduzível e previsível é o processo.

---

## 81. Migrations e Segurança

Alterações de schema também possuem impacto de segurança.

Exemplos:

- criação de tabelas de permissions;
- alteração de tenant isolation;
- novas foreign keys;
- novas constraints;
- campos relacionados a autenticação;
- audit logs.

Uma migration de segurança deve ser tratada como mudança sensível e validada com atenção.

---

## 82. Migrations e Isolamento de Tenant

Mudanças estruturais nunca devem introduzir acidentalmente um caminho que permita acesso cross-tenant.

Por exemplo, uma nova tabela tenant-scoped deve possuir uma modelagem que permita aplicar corretamente:

```text
tenant_uuid
```

e os relacionamentos necessários.

Schema design e tenant isolation estão diretamente relacionados.

---

## 83. Migrations e Auditabilidade

Alterações importantes no schema devem ser rastreáveis pelo Git e pelo histórico de migrations.

Em produção, operações administrativas relacionadas ao deployment podem também ser observadas por logs operacionais.

Isso cria diferentes camadas de rastreabilidade:

```text
Git
 │
 ├── code history
 └── migration history

Operations
 │
 └── deployment logs
```

---

## 84. Estado Atual

Atualmente, o Exactum utiliza PostgreSQL como database relacional principal e Alembic/Flask-Migrate para versionamento do schema.

O processo atual busca manter:

- schema versionado;
- migrations no Git;
- alterações reproduzíveis;
- integração com CI/CD;
- aplicação controlada em deployment;
- separação entre schema persistente e Redis operational state.

O modelo permanece baseado em PostgreSQL compartilhado entre tenants.

---

## 85. Pontos de Evolução Conhecidos

Alguns pontos podem evoluir conforme o sistema amadureça:

- migrations mais complexas;
- backfills maiores;
- índices em tabelas de maior volume;
- UUIDs e public identifiers;
- Inventory boundary;
- Reporting boundary;
- Read Models;
- Materialized Views;
- Transactional Outbox;
- background workers;
- Celery;
- RabbitMQ;
- observability mais avançada;
- estratégias específicas para zero-downtime deployment.

Esses pontos representam possibilidades de evolução, não necessariamente funcionalidades já implementadas.

---

## 86. Princípios de Design

A estratégia de migrations do Exactum segue alguns princípios:

### 1. Versionamento

Toda alteração estrutural relevante deve ser versionada.

### 2. Reprodutibilidade

Um ambiente deve poder chegar ao schema esperado por meio das migrations versionadas.

### 3. Revisibilidade

Migrations devem ser compreensíveis e revisadas antes de serem aplicadas.

### 4. Compatibilidade

Alterações devem considerar a coexistência entre versões quando necessário.

### 5. Segurança

Operações destrutivas e alterações críticas devem ser tratadas com cautela.

### 6. Integridade

O PostgreSQL deve continuar protegendo a integridade estrutural dos dados.

### 7. Observabilidade

Alterações em produção devem ser rastreáveis e observáveis.

### 8. Evolução incremental

Mudanças arquiteturais e de schema devem ser introduzidas gradualmente quando o sistema exigir.

---

## 87. Documentos Relacionados

Este documento se relaciona diretamente com:

- `docs/database/schema.md`
- `docs/database/soft-delete.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`
- `docs/security/tenant-isolation.md`
- `docs/security/session-management.md`
- `docs/observability/overview.md`
- `docs/observability/correlation.md`
- `docs/operations/deployment.md`
- `docs/operations/docker.md`
- `docs/testing/strategy.md`
- `docs/testing/ci.md`

---

## 88. Nomenclatura e Evolução Arquitetural

A documentação utiliza alguns conceitos arquiteturais que podem não possuir correspondência literal com nomes existentes no código.

Por exemplo:

- `tenant` pode ser representado por `tenant_uuid`;
- `actor` pode ser representado atualmente por `user_uuid`;
- `resource` pode ser representado por identificadores específicos como `product_uuid` ou `sale_uuid`;
- `database revision` corresponde à revision controlada pelo Alembic;
- `schema` representa o modelo estrutural persistente, enquanto os models SQLAlchemy representam sua camada de mapeamento na aplicação.

Essa distinção permite documentar o significado arquitetural dos elementos sem limitar a documentação aos nomes atuais da implementação.

### Observação sobre evolução

A organização, os limites de domínio e os mecanismos descritos neste documento representam o **estado atual e a direção arquitetural do Exactum**.

Conforme o sistema evolua, algumas responsabilidades atualmente agrupadas poderão ser extraídas ou reorganizadas. Isso pode resultar em novas tabelas, migrations, índices, read models ou boundaries de domínio.

Portanto, este documento não deve ser interpretado como uma especificação imutável do schema futuro, mas como a descrição de como o Exactum **versiona, controla e evolui seu estado persistente atualmente**, mantendo espaço para evolução arquitetural posterior.
