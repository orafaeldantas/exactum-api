# ADR-001 — Multi-Tenancy com Banco Compartilhado

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Architecture
- **Related Areas:** Architecture, Database, Security, API
- **Supersedes:** None
- **Superseded By:** None

---

# 1. Contexto

O Exactum é um ERP desenvolvido como uma aplicação **multi-tenant**.

O sistema deve permitir que diferentes empresas utilizem a mesma aplicação sem que os dados de uma empresa sejam acessíveis por outra.

Conceitualmente:

```text
                    Exactum
                       │
             ┌─────────┼─────────┐
             ↓         ↓         ↓
          Tenant A  Tenant B  Tenant C
             │         │         │
             ↓         ↓         ↓
          Users     Users     Users
          Products  Products  Products
          Sales     Sales     Sales
```

A aplicação possui recursos pertencentes a diferentes tenants, como:

- usuários;
- produtos;
- vendas;
- permissões;
- configurações;
- dados operacionais.

Portanto, o tenant ao qual uma requisição pertence precisa fazer parte do contexto de segurança da aplicação.

A arquitetura precisava definir como esses dados seriam persistidos.

As principais alternativas consideradas foram:

1. database separado por tenant;
2. schema separado por tenant;
3. database compartilhado com schema compartilhado e isolamento lógico através de `tenant_uuid`.

---

# 2. Decisão

O Exactum utilizará uma arquitetura de **Shared Database Multi-Tenancy**, mantendo os tenants no mesmo banco de dados e no mesmo schema lógico.

O isolamento será realizado através da associação dos recursos ao tenant correspondente.

Conceitualmente:

```text
                    PostgreSQL
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ↓              ↓              ↓
       Tenant A       Tenant B       Tenant C
          │              │              │
          ↓              ↓              ↓
       Products       Products       Products
       Users          Users          Users
       Sales          Sales          Sales
```

Os recursos tenant-scoped possuem uma relação com o tenant, normalmente representada através de `tenant_uuid`.

Exemplo conceitual:

```text
Product
 ├── uuid
 ├── tenant_uuid
 ├── name
 ├── price
 └── ...
```

A aplicação estabelece o contexto do tenant durante o processamento da requisição e as operações de persistência devem aplicar explicitamente o filtro correspondente.

Portanto, o isolamento não depende apenas do contexto HTTP.

Existe uma estratégia de **defense in depth**:

```text
Request
   ↓
Authentication
   ↓
Tenant Context
   ↓
Application Service
   ↓
Repository
   ↓
Explicit Tenant Filtering
   ↓
PostgreSQL
```

O objetivo é evitar que uma falha isolada em uma camada resulte diretamente em acesso cross-tenant.

---

# 3. Justificativa

A decisão foi tomada considerando o estágio atual do Exactum, sua escala esperada, a complexidade operacional e a necessidade de manter uma arquitetura que permita evolução futura sem introduzir infraestrutura desnecessariamente complexa.

O modelo de database compartilhado permite que a aplicação utilize uma infraestrutura PostgreSQL centralizada.

Isso simplifica:

- provisioning;
- migrations;
- backups;
- manutenção;
- monitoramento;
- deployment;
- desenvolvimento local;
- CI;
- administração do banco.

Em vez de administrar múltiplos bancos:

```text
Tenant A → Database A
Tenant B → Database B
Tenant C → Database C
```

a aplicação mantém:

```text
Exactum
   ↓
PostgreSQL
   ├── Tenant A
   ├── Tenant B
   └── Tenant C
```

Essa abordagem também mantém o modelo de dados relativamente uniforme entre tenants.

Uma migration pode ser aplicada ao schema compartilhado em vez de precisar ser executada individualmente em cada database.

---

# 4. Alternativas Consideradas

## 4.1 Banco de Dados por Tenant

Nesta abordagem cada tenant possuiria seu próprio database.

```text
PostgreSQL
   ├── exactum_tenant_a
   ├── exactum_tenant_b
   └── exactum_tenant_c
```

### Vantagens

- isolamento físico mais forte;
- possibilidade de backup/restauração individual;
- possibilidade de configuração específica por tenant;
- menor risco de consulta acidental atravessar tenants.

### Desvantagens

- maior complexidade operacional;
- migrations precisam considerar múltiplos databases;
- maior complexidade de provisioning;
- maior complexidade de monitoramento;
- maior consumo de recursos;
- administração mais complexa conforme o número de tenants cresce.

### Decisão

Não adotado para o estágio atual do Exactum.

---

## 4.2 Schema por Tenant

Nesta abordagem cada tenant possuiria um schema separado dentro do PostgreSQL.

```text
PostgreSQL
   │
   ├── tenant_a
   ├── tenant_b
   └── tenant_c
```

### Vantagens

- separação lógica maior que um schema compartilhado;
- possibilidade de estruturas específicas por tenant;
- menor risco de mistura acidental de dados.

### Desvantagens

- aumento da complexidade de migrations;
- aumento do número de objetos no database;
- maior complexidade operacional;
- dificuldade crescente conforme o número de tenants aumenta;
- necessidade de administrar dinamicamente schemas.

### Decisão

Não adotado para o estágio atual do Exactum.

---

## 4.3 Banco Compartilhado / Schema Compartilhado

Nesta abordagem todos os tenants utilizam as mesmas tabelas e o isolamento é realizado através de uma chave de tenant.

```text
products

uuid | tenant_uuid | name
-----|-------------|------
  1  | tenant-A   | Product A
  2  | tenant-B   | Product B
  3  | tenant-A   | Product C
```

### Vantagens

- infraestrutura simples;
- migrations centralizadas;
- menor custo operacional;
- fácil desenvolvimento local;
- fácil integração com CI;
- boa adequação ao estágio atual do produto;
- facilidade para consultas e operações administrativas controladas.

### Desvantagens

- maior responsabilidade sobre Tenant Isolation;
- qualquer consulta incorreta pode potencialmente acessar dados de outro tenant;
- necessidade de disciplina arquitetural;
- necessidade de testes específicos de isolamento;
- queries precisam considerar o tenant corretamente.

### Decisão

**Adotado.**

---

# 5. Contexto do Tenant

O tenant deve fazer parte do contexto da requisição autenticada.

Conceitualmente:

```text
Authenticated Request
        ↓
JWT Claims
        ↓
Tenant Context
        ↓
Application Logic
```

O contexto pode conter informações como:

```text
tenant_uuid
user_uuid
role
email
```

Essas informações são utilizadas pelas camadas responsáveis por Authentication, Authorization e Tenant Isolation.

O contexto de tenant não deve ser interpretado como uma autorização suficiente por si só.

Ele representa o **contexto de execução**, enquanto as regras de Authorization determinam se a operação pode ser realizada.

---

# 6. Isolamento na Camada de Repository

Os repositories possuem responsabilidade importante na aplicação da estratégia de isolamento.

Uma operação conceitualmente semelhante a:

```python
product = repository.get(product_uuid)
```

deve ser interpretada dentro do contexto do tenant.

Conceitualmente:

```python
product = repository.get(
    product_uuid=product_uuid,
    tenant_uuid=tenant_uuid,
)
```

ou através de um mecanismo equivalente de filtragem.

O objetivo é evitar consultas como:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid;
```

quando o recurso é tenant-scoped.

Em vez disso, a consulta deve considerar também o tenant:

```sql
SELECT *
FROM products
WHERE uuid = :product_uuid
  AND tenant_uuid = :tenant_uuid;
```

A implementação concreta pode variar conforme a evolução da arquitetura, mas o princípio arquitetural permanece:

> Recursos tenant-scoped devem ser recuperados dentro do contexto do tenant ao qual pertencem.

---

# 7. Por que o Frontend Não é Confiável

O frontend não é considerado uma fronteira de segurança.

Mesmo que a interface:

- esconda recursos;
- filtre dados;
- envie o tenant esperado;
- restrinja opções de UI;

essas medidas não são suficientes para garantir isolamento.

Um cliente malicioso pode enviar diretamente uma requisição para a API.

Portanto:

```text
Frontend
   ↓
UX / Convenience
   X
Security Boundary
```

A API e suas camadas internas devem validar o contexto e as permissões independentemente do comportamento do frontend.

---

# 8. Isolamento de Tenant e Autorização

Tenant Isolation e Authorization são conceitos relacionados, mas distintos.

### Isolamento de Tenant

Responde:

> Este recurso pertence ao contexto do tenant da requisição?

### Autorização

Responde:

> Este usuário possui permissão para realizar esta operação?

Portanto:

```text
Request
   │
   ├── Authentication
   │
   ├── Tenant Isolation
   │
   └── Authorization
          ↓
       Operation
```

Uma requisição pode ser:

```text
Authenticated
      +
Correct Tenant
      +
Insufficient Permission
```

e, nesse caso, deve ser rejeitada por Authorization.

Da mesma forma:

```text
Authenticated
      +
Sufficient Permission
      +
Wrong Tenant
```

deve ser rejeitada por Tenant Isolation.

---

# 9. Constraints do Banco de Dados

O modelo shared-schema exige que relacionamentos e constraints sejam projetados levando em consideração o tenant quando necessário.

Por exemplo, uma regra de unicidade que faça sentido apenas dentro de um tenant deve considerar:

```text
tenant_uuid + business_identifier
```

em vez de apenas:

```text
business_identifier
```

Conceitualmente:

```sql
UNIQUE (tenant_uuid, sku)
```

pode representar:

> o SKU deve ser único dentro daquele tenant.

e não:

> o SKU deve ser globalmente único em todo o Exactum.

As constraints devem refletir as regras de negócio e o escopo real dos recursos.

---

# 10. Relacionamentos Cross-Tenant

Relacionamentos entre entidades tenant-scoped devem ser tratados com cuidado.

Por exemplo:

```text
Sale
 └── Product
```

não deve permitir que uma Sale de:

```text
Tenant A
```

referencie um Product de:

```text
Tenant B
```

Portanto, a validação deve considerar não apenas a existência do recurso, mas também seu pertencimento ao tenant correto.

Conceitualmente:

```text
Sale.tenant_uuid
       =
Product.tenant_uuid
```

quando a relação representar recursos pertencentes ao mesmo tenant.

Essa regra reduz o risco de inconsistências e de cross-tenant references.

---

# 11. Implicações de Segurança

A principal consequência de segurança dessa decisão é que **Tenant Isolation se torna uma responsabilidade crítica da aplicação**.

Um erro como:

```python
Product.query.filter_by(uuid=product_uuid).first()
```

pode ser insuficiente se não houver garantia de que a consulta está limitada ao tenant correto.

Por isso, a arquitetura deve favorecer padrões que tornem o isolamento explícito.

A segurança não deve depender exclusivamente de:

- comportamento do frontend;
- parâmetros enviados pelo cliente;
- convenções informais;
- disciplina manual do desenvolvedor.

Devem existir mecanismos complementares:

```text
Authentication
      ↓
Tenant Context
      ↓
Authorization
      ↓
Repository Filtering
      ↓
Database Constraints
      ↓
Automated Tests
```

---

# 12. Implicações nos Testes

A escolha de Shared Database / Shared Schema torna os testes de Tenant Isolation especialmente importantes.

Devem existir testes que verifiquem cenários como:

```text
Tenant A
   │
   ├── Product A
   │
   └── User A

Tenant B
   │
   ├── Product B
   │
   └── User B
```

E:

```text
User A
   ↓
request Product B
   ↓
must be rejected
```

Também devem existir testes para operações de:

- leitura;
- criação;
- atualização;
- exclusão;
- busca;
- filtros;
- paginação;
- relacionamentos;
- operações administrativas.

O objetivo é garantir que uma alteração futura em um Repository, Application Service ou Controller não introduza regressões de isolamento.

Tenant Isolation deve ser tratado como uma **security invariant** do sistema.

---

# 13. Implicações Operacionais

O modelo compartilhado simplifica algumas operações.

## Migrations

Uma migration pode ser aplicada ao schema compartilhado.

```text
Migration
   ↓
PostgreSQL
   ↓
All Tenants
```

Isso reduz a necessidade de executar migrations individualmente por tenant.

## Backup

O backup pode ser realizado sobre o database compartilhado.

Entretanto, isso significa que mecanismos de restauração individual por tenant exigiriam estratégias adicionais caso essa necessidade surja no futuro.

## Monitoramento

O monitoramento pode acompanhar o database como uma infraestrutura compartilhada.

Métricas e logs podem posteriormente ser segmentados por:

```text
tenant
endpoint
operation
resource
```

quando necessário.

---

# 14. Implicações de Performance

Shared Database / Shared Schema permite que múltiplos tenants utilizem a mesma infraestrutura de banco.

Isso também significa que tenants compartilham recursos como:

- CPU;
- memória;
- connections;
- I/O;
- indexes;
- storage.

Portanto, o crescimento de determinados tenants pode afetar o ambiente compartilhado.

A arquitetura deverá considerar futuramente mecanismos como:

- query optimization;
- indexes;
- pagination;
- caching;
- rate limiting;
- connection management;
- workload monitoring.

Em escala maior, a arquitetura poderá precisar avaliar estratégias diferentes.

---

# 15. Regras de Acesso a Dados

Como regra arquitetural:

> Toda operação sobre um recurso tenant-scoped deve possuir uma estratégia explícita de resolução e validação do tenant.

Isso não significa necessariamente que cada função precise receber manualmente `tenant_uuid`.

A implementação pode utilizar abstrações apropriadas.

O requisito é que o isolamento seja:

- explícito;
- verificável;
- testável;
- consistente.

---

# 16. Considerações sobre o Super-Admin

O Exactum possui operações de plataforma executadas por super-admin.

Essas operações possuem características diferentes das operações tenant-scoped normais.

Um super-admin pode possuir permissões de plataforma que permitem administrar tenants.

Isso não significa que o conceito de Tenant Isolation deixe de existir.

Ao contrário, operações administrativas devem possuir contexto e autorização explícitos.

No caso de **Impersonation**, por exemplo:

```text
Super Admin
     ↓
Impersonate
     ↓
Target User
     ↓
Target Tenant Context
```

A operação deve ser registrada e observável.

O modelo de impersonation é documentado separadamente em:

```text
docs/architecture/decisions/ADR-006-impersonation-model.md
```

---

# 17. Consequências

A decisão produz os seguintes efeitos.

## 17.1 Consequências Positivas

### Infraestrutura mais simples

Existe uma infraestrutura PostgreSQL centralizada.

### Migrations centralizadas

Alterações de schema são aplicadas ao banco compartilhado.

### Menor complexidade operacional

Não é necessário provisionar um database ou schema separado para cada tenant.

### Desenvolvimento simplificado

O ambiente local pode reproduzir a estrutura de produção com menor complexidade.

### CI simplificado

Os testes podem utilizar uma infraestrutura PostgreSQL única para validar múltiplos tenants.

### Modelo de dados uniforme

Todos os tenants utilizam o mesmo schema lógico.

---

## 17.2 Consequências Negativas

### Maior responsabilidade da aplicação

O isolamento precisa ser corretamente implementado.

### Maior risco de regressão

Uma alteração incorreta em queries pode potencialmente afetar a segurança entre tenants.

### Testes mais importantes

Tenant Isolation precisa possuir cobertura significativa.

### Recursos Compartilhados

Todos os tenants compartilham recursos de infraestrutura.

### Recuperação de um Tenant Específico

A restauração isolada de um tenant pode exigir mecanismos adicionais.

---

# 18. Trade-offs

A decisão pode ser resumida como:

```text
Operational Simplicity
        ↑
        │
        │
Shared Database
        │
        │
        ↓
Application-Level Isolation
```

O Exactum aceita maior responsabilidade na camada de aplicação em troca de menor complexidade operacional e maior simplicidade estrutural.

Esse trade-off é considerado adequado ao estágio atual do produto.

---

# 19. Evolução Futura

A decisão não impede uma futura mudança de estratégia de tenancy.

Caso a escala, requisitos de compliance, isolamento, performance ou necessidades comerciais mudem, alternativas como:

```text
Database per Tenant
```

ou:

```text
Schema per Tenant
```

podem ser reavaliadas.

Uma eventual mudança deverá ser registrada através de um novo ADR que substitua ou complemente esta decisão.

Exemplo:

```text
ADR-001
Shared Database Multi-Tenancy
        ↓
Future requirement
        ↓
New Architecture Decision
        ↓
ADR-XXX
```

A decisão atual não deve ser interpretada como uma restrição permanente à arquitetura do Exactum.

---

# 20. Estado Atual

Atualmente o Exactum utiliza uma arquitetura de database compartilhado para seus tenants.

O isolamento é realizado através do contexto de tenant e da filtragem explícita das operações de persistência.

O modelo atual pode ser representado como:

```text
                    Exactum
                       │
                       ↓
                  PostgreSQL
                       │
              Shared Schema
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Tenant A       Tenant B       Tenant C
        │              │              │
     Products       Products       Products
     Users          Users          Users
     Sales          Sales          Sales
```

Esse modelo faz parte da arquitetura atual e está documentado também em:

```text
docs/architecture/multi-tenancy.md
docs/security/tenant-isolation.md
docs/database/schema.md
```

---

# 21. Decisões Relacionadas

Esta decisão possui relação direta com outras decisões arquiteturais.

### Autenticação

O tenant context é associado à identidade autenticada.

```text
ADR-003 — HttpOnly Cookie Authentication
```

### Gerenciamento de Sessões

Sessões carregam informações necessárias para identificar o contexto da autenticação.

```text
ADR-004 — Redis Session Management
```

### Impersonation

Super-admin pode assumir temporariamente o contexto de outro usuário/tenant.

```text
ADR-006 — Impersonation Model
```

### Arquitetura da Aplicação

A aplicação precisa distribuir corretamente as responsabilidades de Tenant Isolation entre suas camadas.

```text
ADR-007 — Layered Application Architecture
```

---

# 22. Documentos Relacionados

- `docs/architecture/overview.md`
- `docs/architecture/system-context.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`
- `docs/security/overview.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`
- `docs/api/overview.md`
- `docs/database/overview.md`
- `docs/database/schema.md`
- `docs/testing/strategy.md`
- `docs/testing/ci.md`

---

# 23. Resumo da Decisão

| Aspect              | Decision                        |
| ------------------- | ------------------------------- |
| Tenancy model       | Shared Database                 |
| Schema model        | Shared Schema                   |
| Tenant identifier   | `tenant_uuid`                   |
| Isolation           | Application + Persistence       |
| Frontend trust      | Not trusted                     |
| Authorization       | Separate concern                |
| Cross-tenant access | Forbidden by default            |
| Database per tenant | Not adopted                     |
| Schema per tenant   | Not adopted                     |
| Future migration    | Possible if requirements change |

---

# 24. Decisão Final

The Exactum adopts **Shared Database / Shared Schema Multi-Tenancy**.

The decision prioritizes operational simplicity, centralized schema management and architectural practicality for the current stage of the system.

This decision places a strong responsibility on the application to guarantee Tenant Isolation through authentication context, authorization, persistence filtering, database constraints and automated testing.

The architecture therefore treats Tenant Isolation as a **security invariant**, rather than merely a database organization strategy.

---

## Princípio Arquitetural

> **Tenants share infrastructure, but never share authorization context.**
