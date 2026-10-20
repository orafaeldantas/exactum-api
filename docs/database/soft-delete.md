# Soft Delete

## 1. Objetivo

O Exactum utiliza o conceito de **Soft Delete** para representar a remoção lógica de determinados registros sem necessariamente eliminá-los fisicamente do banco de dados.

Em vez de executar:

```sql
DELETE FROM product WHERE id = ...;
```

a aplicação pode marcar o registro como removido logicamente:

```text
deleted_at = timestamp
```

O registro permanece armazenado, mas deixa de ser considerado ativo pelas operações normais da aplicação.

Este documento descreve:

- conceito de Soft Delete;
- motivação;
- modelo de dados;
- comportamento das queries;
- impacto na API;
- relacionamentos;
- uniqueness;
- indexes;
- tenant isolation;
- authorization;
- audit logging;
- restauração;
- hard delete;
- histórico;
- reporting;
- migrations;
- performance;
- testes;
- riscos e limitações;
- evolução futura.

---

## 1.1 Implementação Atual

O soft delete é implementado pelo `SoftDeleteMixin` (`app/core/mixins/soft_delete.py`):

```python
class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None]   # TIMESTAMPTZ, NULL = registro ativo

    @hybrid_property
    def is_deleted(self) -> bool: ...

    def soft_delete(self): ...            # deleted_at = datetime.now(UTC)
```

Entidades que utilizam soft delete atualmente:

| Model     | Tabela     |
| --------- | ---------- |
| `User`    | `users`    |
| `Product` | `products` |

As demais tabelas (`sales`, `items_sales`, `goals`, `roles`, etc.) utilizam hard delete ou não possuem operação de exclusão.

Características da implementação atual:

- **o filtro não é automático**: cada repository aplica explicitamente `Model.deleted_at.is_(None)` (ex.: `ProductRepository.get_product`, `UserRepository.get_user_by_email`). O `tenant_filter` não aplica critério de soft delete;
- **as constraints de unicidade não consideram `deleted_at`**: `products.sku`, `users.email` e `users.username` permanecem reservados após o soft delete, impedindo a reutilização do valor por um novo registro (ver seções 22–26).

---

## 2. Soft Delete vs Hard Delete

Existem duas formas principais de remoção de dados.

### Hard Delete

O registro é fisicamente removido:

```text
Database
    │
    └── Record
          │
          ▼
       DELETE
          │
          ▼
       Removed
```

### Soft Delete

O registro permanece no banco:

```text
Database
    │
    └── Record
          │
          ▼
      deleted_at
          │
          ▼
       Inactive
```

A diferença fundamental é:

```text
Hard Delete
→ remove o registro

Soft Delete
→ remove o registro do estado operacional ativo
```

---

## 3. Motivação

Soft Delete pode ser utilizado quando a remoção física imediata não é desejável.

Entre os motivos estão:

- preservação de histórico;
- possibilidade de restauração;
- auditoria;
- rastreabilidade;
- relacionamento com registros históricos;
- prevenção de perda acidental;
- suporte a investigações operacionais;
- preservação de informações necessárias para reporting.

No Exactum, essa estratégia é especialmente relevante para entidades que possuem histórico ou relacionamentos importantes.

---

## 4. Representação

Uma representação comum é:

```text
deleted_at
```

com:

```text
NULL
```

significando:

```text
registro ativo
```

e:

```text
timestamp
```

significando:

```text
registro removido logicamente
```

Conceitualmente:

```text
deleted_at = NULL
      │
      ▼
   Active

deleted_at != NULL
      │
      ▼
   Deleted
```

---

## 5. Estado do Registro

Soft Delete introduz uma dimensão adicional no estado persistente da entidade.

Um registro pode estar:

```text
ACTIVE
```

ou:

```text
DELETED
```

Esse estado não necessariamente deve ser representado por uma coluna `status`.

Em muitos casos, `deleted_at` é suficiente para representar o estado de exclusão lógica.

---

## 6. `deleted_at`

O campo `deleted_at` representa o momento em que a exclusão lógica ocorreu.

Exemplo:

```text
deleted_at = NULL
```

registro ativo.

```text
deleted_at = 2026-09-23T18:30:00
```

registro removido logicamente.

O timestamp também permite determinar quando a exclusão ocorreu.

---

## 7. Fuso Horário

Timestamps relacionados a Soft Delete devem seguir a mesma estratégia temporal adotada pelo restante do banco.

Idealmente, o sistema deve trabalhar de maneira consistente com timestamps timezone-aware e uma referência temporal uniforme.

Isso evita problemas em:

- auditoria;
- reporting;
- restauração;
- troubleshooting;
- comparação entre ambientes.

---

## 8. Soft Delete Não é DELETE

Uma operação de Soft Delete não deve ser tratada como uma operação SQL `DELETE`.

Conceitualmente:

```text
DELETE
```

e:

```text
UPDATE deleted_at
```

possuem semânticas diferentes.

No primeiro caso, o registro deixa de existir fisicamente.

No segundo, ele permanece disponível para operações administrativas ou históricas autorizadas.

---

## 9. Query Padrão

A regra operacional principal é:

> registros com `deleted_at IS NOT NULL` não devem aparecer nas queries normais.

Conceitualmente:

```sql
WHERE deleted_at IS NULL
```

Isso deve ser aplicado de maneira consistente.

---

## 10. Registros Ativos

A aplicação deve considerar como registros ativos aqueles que possuem:

```text
deleted_at IS NULL
```

Exemplo conceitual:

```text
Product
├── Product A → active
├── Product B → active
└── Product C → deleted
```

Uma listagem normal deve retornar:

```text
Product A
Product B
```

e não:

```text
Product C
```

---

## 11. Registros Excluídos

Registros removidos logicamente continuam armazenados.

Eles podem ser utilizados por operações específicas, como:

- auditoria;
- investigação;
- restauração;
- análise histórica;
- operações administrativas autorizadas.

Essas operações devem utilizar queries explícitas para acessar registros deletados.

---

## 12. Acesso Explícito

O acesso a registros deletados não deve acontecer acidentalmente.

Uma abordagem conceitual é separar:

```text
Normal Query
→ active records

Administrative Query
→ active + deleted

Deleted Query
→ deleted only
```

Isso evita que uma query administrativa seja reutilizada inadvertidamente em uma operação normal.

---

## 13. Responsabilidade do Repository

O Repository é um ponto importante para centralizar o comportamento de Soft Delete.

Por exemplo, operações como:

```text
find()
list()
get_by_uuid()
```

podem assumir por padrão:

```text
deleted_at IS NULL
```

Enquanto operações específicas podem possuir intenção explícita:

```text
find_deleted()
find_with_deleted()
restore()
```

Isso reduz a possibilidade de esquecer o filtro em cada chamada.

---

## 14. Responsabilidade do Application Service

O Application Service deve representar a intenção da operação.

Exemplo conceitual:

```text
Delete Product
     │
     ▼
Application Service
     │
     ▼
Repository
     │
     ▼
Soft Delete
```

O service pode coordenar:

- autorização;
- validação;
- regra de negócio;
- alteração de estado;
- auditoria;
- eventos.

O Repository executa a persistência.

---

## 15. Responsabilidade do Controller

O Controller não deve implementar diretamente a lógica de Soft Delete.

Seu papel é:

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Application Service
```

O Controller interpreta a requisição e delega a operação.

Isso mantém a regra de persistência fora da camada HTTP.

---

## 16. Semântica da API

Do ponto de vista da API, uma operação de exclusão pode continuar utilizando:

```http
DELETE /products/{uuid}
```

mesmo que internamente seja implementado como Soft Delete.

Isso ocorre porque o método HTTP representa a intenção do cliente:

```text
"remover este recurso do estado operacional"
```

e não necessariamente:

```text
"executar SQL DELETE"
```

---

## 17. HTTP DELETE e Soft Delete

A semântica pode ser:

```text
DELETE /products/{uuid}
```

→ recurso deixa de estar disponível como recurso ativo.

Internamente:

```text
deleted_at = now()
```

O cliente não precisa conhecer necessariamente a implementação interna.

---

## 18. Idempotência

Soft Delete pode ser tratado como uma operação idempotente.

Se o recurso já estiver deletado:

```text
deleted_at != NULL
```

uma segunda tentativa não deve produzir uma segunda exclusão lógica diferente.

A API deve definir explicitamente o comportamento esperado.

Possibilidades incluem:

```text
404 Not Found
```

ou uma resposta indicando que o recurso já está removido.

A decisão depende do contrato específico da API.

---

## 19. Autorização

Soft Delete é uma operação protegida por Authorization.

O fato de o registro continuar armazenado não significa que qualquer usuário possa:

- deletá-lo;
- visualizar registros deletados;
- restaurá-lo;
- executar hard delete.

A autorização deve continuar baseada nas permissions e roles aplicáveis.

---

## 20. Isolamento de Tenant

Em um sistema multi-tenant, Soft Delete não elimina a necessidade de isolamento por tenant.

Uma query administrativa deve continuar respeitando:

```text
tenant_uuid
```

quando a entidade for tenant-scoped.

Por exemplo:

```text
WHERE tenant_uuid = current_tenant
  AND deleted_at IS NULL
```

O filtro de exclusão lógica nunca deve substituir o filtro de tenant.

---

## 21. Isolamento Defensivo

A aplicação deve manter a estratégia de isolamento defensivo:

```text
Request Context
      │
      ▼
Tenant Context
      │
      ▼
Application Service
      │
      ▼
Repository
      │
      ├── tenant filter
      └── soft-delete filter
      │
      ▼
PostgreSQL
```

Soft Delete é uma dimensão adicional de filtragem, não uma substituição para Tenant Isolation.

---

## 22. Constraints de Unicidade

Soft Delete possui uma consequência importante para `UNIQUE`.

Considere:

```text
Product
name = "Notebook"
deleted_at = timestamp
```

Depois:

```text
New Product
name = "Notebook"
deleted_at = NULL
```

Dependendo da regra de negócio, o sistema pode querer permitir esse novo registro.

Um `UNIQUE(name)` tradicional impediria isso enquanto o registro antigo permanecer no banco.

Portanto, Soft Delete e uniqueness devem ser projetados em conjunto.

---

## 23. Unicidade entre Registros Ativos

Em alguns cenários, a regra desejada é:

> somente registros ativos devem precisar ser únicos.

Nesse caso, PostgreSQL pode utilizar estruturas específicas, como um **partial unique index**.

Conceitualmente:

```sql
CREATE UNIQUE INDEX ...
ON product(name)
WHERE deleted_at IS NULL;
```

Isso permite:

```text
Active "Notebook"
Deleted "Notebook"
```

mas impede dois registros ativos com o mesmo valor.

---

## 24. Índices Parciais

Partial indexes são particularmente úteis em modelos com Soft Delete.

Exemplo conceitual:

```text
Index
  │
  └── WHERE deleted_at IS NULL
```

Isso pode trazer duas vantagens:

- representar melhor a regra de negócio;
- reduzir o conjunto de registros indexados.

A utilização deve ser baseada nas queries reais e no modelo de dados.

---

## 25. Constraints de Unicidade Existentes

Nem toda constraint `UNIQUE` deve ser transformada automaticamente em partial unique index.

É necessário identificar se a unicidade deve valer:

```text
for all historical records
```

ou somente:

```text
for active records
```

Essa decisão pertence ao domínio da entidade.

---

## 26. Unicidade Histórica

Alguns dados devem permanecer únicos mesmo depois do Soft Delete.

Por exemplo, um identificador externo que precisa permanecer associado historicamente ao mesmo registro.

Nesse caso:

```text
UNIQUE
```

pode continuar sendo global.

Portanto:

> Soft Delete não implica automaticamente que todas as constraints de unicidade devem ignorar registros deletados.

---

## 27. Foreign Keys

Soft Delete não remove automaticamente os relacionamentos existentes.

Considere:

```text
Sale
 │
 └── Product
```

Se um Product for soft-deleted, registros históricos de Sale podem continuar referenciando esse Product.

Isso é uma das razões pelas quais Soft Delete pode ser útil em sistemas que preservam histórico.

---

## 28. Relacionamentos Históricos

Uma venda histórica pode precisar continuar exibindo informações relacionadas ao produto que existia no momento da venda.

Portanto:

```text
Product
   │
   ├── active
   └── deleted
        ▲
        │
       Sale
```

O Product deletado não deve necessariamente ser fisicamente removido.

---

## 29. Integridade Referencial

Soft Delete preserva a integridade referencial física.

Uma foreign key continua apontando para o registro existente.

Isso é diferente de Hard Delete, que pode exigir:

- cascade;
- restrições;
- remoção de dependências;
- alteração de histórico.

---

## 30. Soft Delete e Cascatas

Soft Delete não possui o mesmo comportamento de:

```text
ON DELETE CASCADE
```

Uma foreign key cascade atua quando o registro é fisicamente removido.

Soft Delete exige uma estratégia explícita.

Exemplo:

```text
Tenant
  │
  └── User
```

Soft deleting Tenant não significa automaticamente que:

```text
User.deleted_at
```

será atualizado.

Esse comportamento precisa ser definido pelo domínio.

---

## 31. Soft Delete em Cascata

Caso exista necessidade de cascading logical deletion, ela deve ser implementada explicitamente.

Exemplo:

```text
Parent
  │
  ▼
Soft Delete Parent
  │
  ├── Child A → Soft Delete
  ├── Child B → Soft Delete
  └── Child C → Soft Delete
```

Isso exige cuidado para evitar:

- operações inesperadas;
- grandes updates;
- inconsistências;
- dificuldade de restore.

---

## 32. Restore

Uma vantagem importante do Soft Delete é a possibilidade de restauração.

Conceitualmente:

```text
deleted_at = timestamp
```

pode retornar para:

```text
deleted_at = NULL
```

Fluxo:

```text
Deleted
   │
   ▼
Restore
   │
   ▼
Active
```

---

## 33. Autorização para Restauração

Restore deve ser tratado como uma operação protegida.

Nem todo usuário que pode deletar necessariamente precisa poder restaurar.

Uma permission específica pode ser utilizada quando o domínio exigir.

Exemplo conceitual:

```text
product.delete
product.restore
```

---

## 34. Validação da Restauração

Restaurar um registro pode gerar conflitos.

Por exemplo:

```text
Deleted Product
name = "Notebook"
```

e:

```text
Active Product
name = "Notebook"
```

Se a regra exigir uniqueness entre ativos, o restore pode falhar.

Portanto, restore deve revalidar as constraints e regras aplicáveis.

---

## 35. Restauração e Dependências

Um registro deletado pode possuir dependências que também foram removidas logicamente.

Exemplo:

```text
Parent → deleted
Child  → deleted
```

Restaurar somente o Parent pode ou não restaurar os Child records.

Não existe comportamento universal.

Essa regra deve ser definida de acordo com o domínio.

---

## 36. Logs de Auditoria

Soft Delete é uma ação relevante para Audit Logging.

O sistema pode registrar:

```text
actor
action
resource
resource_uuid
tenant_uuid
timestamp
request_id
outcome
metadata
```

Por exemplo:

```text
action = product.deleted
```

ou:

```text
action = product.restored
```

A nomenclatura deve seguir o padrão adotado pelo sistema.

---

## 37. Eventos de Plataforma

Dependendo da natureza da entidade e da evolução arquitetural, uma exclusão lógica também pode gerar Platform Event ou Domain Event.

Exemplo conceitual:

```text
Product Deleted
```

Esse evento pode posteriormente ser utilizado por:

- observabilidade;
- integrações;
- reporting;
- workflows;
- background jobs.

A existência de um evento deve ser determinada pela necessidade arquitetural, não automaticamente por toda operação de Soft Delete.

---

## 38. Correlação

Uma operação de Soft Delete deve manter a mesma estratégia de correlation utilizada pelas demais operações.

Conceitualmente:

```text
HTTP Request
    │
    ├── request_id
    │
    ├── application service
    │
    ├── audit log
    │
    └── platform event
```

Isso permite reconstruir a operação posteriormente.

---

## 39. Soft Delete e Logging

O log operacional pode registrar a execução da operação.

Exemplo conceitual:

```text
event=product_soft_deleted
product_uuid=...
tenant_uuid=...
request_id=...
```

Logs não substituem Audit Logs.

A diferença continua sendo:

```text
Infrastructure Log
→ observabilidade operacional

Audit Log
→ histórico de ação relevante
```

---

## 40. Dados Sensíveis

Soft Delete não significa que os dados devem permanecer disponíveis indiscriminadamente.

Mesmo registros deletados devem continuar sujeitos a:

- Authorization;
- Tenant Isolation;
- privacy controls;
- minimização de dados;
- retenção;
- acesso administrativo controlado.

Um registro estar no banco não significa que ele deve estar disponível na API.

---

## 41. Retenção

Soft Delete pode prolongar a retenção de dados.

Por isso, deve existir uma política clara sobre:

```text
Active
   │
   ▼
Soft Deleted
   │
   ▼
Retention Period
   │
   ▼
Hard Delete
```

Quando aplicável, essa política deve considerar:

- necessidade operacional;
- histórico;
- requisitos legais;
- privacidade;
- custo de armazenamento.

---

## 42. Hard Delete após Retention

Uma estratégia possível é utilizar Soft Delete como primeira etapa e Hard Delete posteriormente.

Exemplo:

```text
Day 0
  │
  ▼
Soft Delete

Retention Period
  │
  ▼
Eligible for Purge

Authorized Purge
  │
  ▼
Hard Delete
```

Essa estratégia exige um processo explícito de purge.

---

## 43. Expurgo

Purge é a remoção física de registros que já passaram pelas condições necessárias de retenção.

Pode ser executado por:

- job;
- worker;
- tarefa administrativa;
- processo operacional controlado.

O mecanismo futuro pode utilizar Celery ou outro sistema de background processing.

---

## 44. Segurança do Expurgo

Um purge deve ser especialmente conservador.

Antes de remover fisicamente dados, deve validar:

```text
[ ] registro está soft-deleted
[ ] período de retenção expirou
[ ] não existem dependências necessárias
[ ] não existe necessidade de histórico
[ ] tenant/contexto correto
[ ] autorização operacional
[ ] critérios de purge corretos
```

Hard Delete deve ser uma operação explicitamente controlada.

---

## 45. Relatórios

Reporting precisa definir como tratar registros deletados.

Uma query operacional normalmente utiliza:

```text
deleted_at IS NULL
```

Já um relatório histórico pode precisar incluir registros deletados.

Exemplo:

```text
Operational Report
→ active records

Historical Report
→ active + deleted
```

Portanto, o significado de “registro existente” depende do contexto da consulta.

---

## 46. Analytics

Analytics também pode possuir regras diferentes.

Uma análise de vendas históricas pode precisar considerar produtos que atualmente estão deletados.

Assim:

```text
Current Product List
→ exclude deleted

Historical Sales
→ preserve referenced products
```

Essa diferença deve ser explicitamente considerada nas queries analíticas.

---

## 47. Busca

Sistemas de busca normalmente devem excluir registros soft-deleted por padrão.

Exemplo:

```text
Search Product
    │
    ├── tenant filter
    ├── deleted_at IS NULL
    └── search criteria
```

Uma busca administrativa pode possuir comportamento diferente.

---

## 48. Paginação

Soft Delete deve ser aplicado antes da paginação lógica.

Conceitualmente:

```text
All Records
    │
    ▼
Tenant Filter
    │
    ▼
Soft Delete Filter
    │
    ▼
Search / Filters
    │
    ▼
Sorting
    │
    ▼
Pagination
```

Caso registros deletados sejam filtrados depois da paginação, o resultado pode apresentar páginas inconsistentes.

---

## 49. Ordenação

O campo `deleted_at` normalmente não deve fazer parte do sorting operacional, pois registros deletados já foram excluídos da consulta.

Queries administrativas podem utilizar `deleted_at` para:

- ordenar por data de exclusão;
- localizar registros antigos;
- analisar padrões de remoção.

---

## 50. Performance

Soft Delete aumenta a quantidade de registros físicos armazenados.

Com o tempo:

```text
Active Records
+
Deleted Records
=
Total Physical Rows
```

Isso pode impactar:

- storage;
- indexes;
- vacuum;
- queries;
- backups;
- performance.

Portanto, Soft Delete não elimina a necessidade de gerenciamento de dados antigos.

---

## 51. Crescimento das Tabelas

Uma tabela pode crescer mesmo que o número de registros ativos permaneça estável.

Exemplo:

```text
Active
██████████

Deleted
████████████████████
```

O banco continua armazenando ambos.

Isso torna políticas de retenção e purge potencialmente importantes em tabelas de grande volume.

---

## 52. Estratégia de Índices

Indexes devem considerar o padrão de Soft Delete.

Dependendo da entidade e das queries, pode fazer sentido utilizar:

```text
Index
WHERE deleted_at IS NULL
```

especialmente quando a maior parte das consultas trabalha somente com registros ativos.

A decisão deve ser baseada em:

- query patterns;
- cardinalidade;
- tamanho da tabela;
- frequência de leitura;
- custo de escrita.

---

## 53. Índices de Foreign Keys

Foreign keys utilizadas em queries de entidades ativas podem precisar de indexes que considerem o padrão de acesso.

Exemplo:

```text
tenant_uuid
deleted_at
```

pode ser relevante em determinadas consultas tenant-scoped.

Entretanto, indexes devem ser derivados das queries reais e não apenas adicionados por convenção.

---

## 54. Comportamento do ORM

O SQLAlchemy não deve ser considerado automaticamente responsável por excluir registros soft-deleted.

Soft Delete é uma regra da aplicação e do modelo de persistência.

A implementação pode utilizar:

- repository filters;
- query helpers;
- mixins;
- explicit predicates;
- custom query abstractions.

A estratégia escolhida deve permanecer compreensível.

---

## 55. Evitando Comportamento Oculto

Um risco de abstrações excessivas é esconder o comportamento de Soft Delete.

Por exemplo:

```python
query(Product)
```

pode implicitamente aplicar filtros sem que o desenvolvedor perceba.

Abstrações podem ser úteis, mas devem preservar clareza.

O comportamento deve ser previsível para quem trabalha no código.

---

## 56. Repository API

Uma API conceitual de Repository pode separar explicitamente as operações:

```text
get_active()
get_deleted()
get_with_deleted()
delete()
restore()
```

Isso torna a intenção clara.

Os nomes concretos devem seguir as convenções adotadas pelo projeto.

---

## 57. Service API

Application Services podem expor operações semanticamente claras:

```text
delete_product()
restore_product()
```

em vez de permitir que qualquer camada altere:

```text
deleted_at
```

diretamente.

Isso centraliza regras e reduz inconsistências.

---

## 58. Alteração Direta

A aplicação deve evitar que múltiplas partes do sistema executem diretamente:

```python
entity.deleted_at = datetime.now()
```

sem passar pela regra apropriada.

Alterações de estado importantes devem ser controladas pela camada responsável.

---

## 59. Transição de Estado

Soft Delete pode ser entendido como uma transição de estado:

```text
ACTIVE
  │
  │ delete
  ▼
DELETED
```

Restore:

```text
DELETED
  │
  │ restore
  ▼
ACTIVE
```

Cada transição pode possuir regras próprias.

---

## 60. Concorrência

Duas requests podem tentar deletar o mesmo registro simultaneamente.

Exemplo:

```text
Request A ──┐
            ├── Product
Request B ──┘
```

A aplicação deve considerar concorrência e garantir comportamento consistente.

Isso pode envolver:

- transaction boundaries;
- row locking;
- optimistic concurrency;
- verificação do estado;
- constraints.

A estratégia depende da importância da entidade e da operação.

---

## 61. Exclusão Durante uma Atualização

Também pode existir concorrência entre:

```text
Update Product
```

e:

```text
Delete Product
```

A aplicação deve evitar estados inconsistentes.

Por exemplo, uma request não deveria atualizar um registro que foi logicamente removido durante a mesma janela sem que isso esteja de acordo com a regra de negócio.

---

## 62. Exclusão Durante uma Venda

No contexto do Exactum, produtos podem possuir relação com vendas.

Uma venda histórica não deve necessariamente deixar de funcionar porque o produto foi soft-deleted.

Portanto:

```text
Product
   │
   ├── current availability
   │
   └── historical relationship
```

devem ser conceitos distintos.

---

## 63. Exemplo com Product

Um exemplo conceitual:

```text
Product
--------------------------------
uuid: P123
name: Notebook
price: 3500
deleted_at: NULL
```

Após Soft Delete:

```text
Product
--------------------------------
uuid: P123
name: Notebook
price: 3500
deleted_at: 2026-09-23 18:30
```

A venda histórica que referencia `P123` continua podendo existir.

O produto, porém, deixa de aparecer na listagem operacional de produtos ativos.

---

## 64. Exemplo com Sale

Considere:

```text
Sale S100
   │
   └── Product P123
```

Se `P123` for soft-deleted:

```text
Sale S100
   │
   └── Product P123
             │
             └── deleted
```

A venda não deve necessariamente ser alterada.

O histórico continua apontando para o registro original.

---

## 65. Exemplo com User

Usuários também podem possuir estados relacionados à desativação.

Entretanto, Soft Delete não deve ser confundido com:

```text
blocked
suspended
inactive
```

Esses estados possuem semânticas diferentes.

Por exemplo:

```text
deleted_at
```

representa remoção lógica.

Enquanto:

```text
is_active = false
```

pode representar uma conta temporariamente desativada.

---

## 66. Soft Delete vs Inativo

É importante distinguir:

```text
Deleted
```

de:

```text
Inactive
```

Um registro inativo pode continuar sendo um recurso operacional existente.

Um registro soft-deleted normalmente deixa de participar das operações normais.

Essa diferença deve permanecer explícita no domínio.

---

## 67. Contexto de Autenticação

Session records e authentication state possuem necessidades específicas.

Nem todo estado relacionado a autenticação deve utilizar Soft Delete.

Por exemplo, revogação de sessão pode ser melhor representada por:

```text
revoked_at
```

ou estado equivalente.

Isso representa revogação, não necessariamente exclusão lógica.

---

## 68. Logs de Auditoria

Audit Logs normalmente não devem ser soft-deleted como parte das operações comuns do sistema.

Seu propósito é preservar rastreabilidade.

Alterar ou remover logs históricos exige uma política própria.

Portanto:

```text
Business Entity
→ may use Soft Delete

Audit Log
→ normally requires stronger retention/integrity controls
```

---

## 69. Eventos de Plataforma

Platform Events possuem função semelhante de histórico operacional.

A exclusão desses registros deve ser tratada separadamente da exclusão das entidades de negócio.

Não se deve presumir que:

```text
Delete User
```

significa:

```text
Delete User's Platform Events
```

ou:

```text
Delete Audit Logs
```

---

## 70. Considerações de Privacidade

Preservar dados por Soft Delete não significa que todos os dados podem ser mantidos indefinidamente.

O sistema deve considerar:

- minimização;
- retenção;
- necessidade;
- anonimização quando aplicável;
- requisitos legais;
- controles de acesso.

Soft Delete é uma técnica de persistência, não uma política de retenção por si só.

---

## 71. Anonimização

Em cenários futuros, pode existir necessidade de anonimizar determinados dados sem eliminar completamente o registro histórico.

Conceitualmente:

```text
Original Record
      │
      ▼
Soft Delete
      │
      ▼
Anonymization
      │
      ▼
Historical Record
```

Essa estratégia depende das necessidades do domínio e dos requisitos aplicáveis.

---

## 72. Migration

A introdução de Soft Delete em uma tabela existente normalmente exige migration.

Exemplo:

```text
ALTER TABLE product
ADD COLUMN deleted_at TIMESTAMPTZ NULL;
```

Como a coluna pode inicialmente aceitar `NULL`, registros existentes permanecem ativos.

Depois:

```text
Existing rows
deleted_at = NULL
```

representam os registros atuais.

---

## 73. Adição de Soft Delete a Dados Existentes

Uma migration desse tipo geralmente possui baixo risco estrutural quando a nova coluna é nullable.

O risco maior está na aplicação:

```text
Before
→ all rows visible

After
→ only deleted_at IS NULL visible
```

Por isso, a mudança de comportamento deve ser testada junto com a alteração do schema.

---

## 74. Migrations e Índices

Se Soft Delete for introduzido em uma tabela existente, indexes e constraints podem precisar ser ajustados.

Exemplo:

```text
UNIQUE(name)
```

pode posteriormente evoluir para:

```text
UNIQUE(name)
WHERE deleted_at IS NULL
```

quando essa for a regra correta.

Essa alteração deve ser feita por migration e validada com dados existentes.

---

## 75. Testando o Soft Delete

Testes devem verificar pelo menos:

```text
[ ] delete marks deleted_at
[ ] deleted record is hidden from normal queries
[ ] deleted record remains persisted
[ ] authorized query can retrieve deleted record
[ ] unauthorized user cannot access deleted record
[ ] restore clears deleted_at
[ ] restore respects uniqueness
[ ] tenant isolation remains enforced
[ ] historical relationships remain valid
```

---

## 76. Testando a Restauração

Restore merece testes próprios.

Exemplo:

```text
Create
  │
  ▼
Delete
  │
  ▼
Restore
  │
  ▼
Active
```

O teste deve verificar se o estado final corresponde às regras do domínio.

---

## 77. Testando o Isolamento de Tenant

Testes de Soft Delete também devem considerar múltiplos tenants.

Exemplo:

```text
Tenant A
 └── Product A → deleted

Tenant B
 └── Product B → active
```

Uma request de Tenant B não deve conseguir acessar o registro deletado de Tenant A.

Soft Delete não pode criar um bypass de tenant isolation.

---

## 78. Testando a Paginação

Quando Soft Delete participa das queries de listagem, testes de paginação devem confirmar que:

- registros deletados não ocupam posições;
- total de resultados está correto;
- páginas permanecem consistentes;
- filtros continuam funcionando.

---

## 79. Testando a Unicidade

Devem existir testes para cenários como:

```text
Create A
Delete A
Create B with same unique value
```

e:

```text
Create A
Delete A
Restore A
```

principalmente quando forem utilizados partial unique indexes.

---

## 80. Testando Dados Históricos

Também devem existir testes para confirmar que:

```text
Historical Sale
```

continua podendo referenciar:

```text
Soft Deleted Product
```

quando essa for a regra do domínio.

---

## 81. Monitoramento Operacional

O crescimento de registros soft-deleted deve ser monitorado quando o volume justificar.

Métricas futuras podem incluir:

```text
active_records
deleted_records
purge_candidates
table_size
index_size
```

Isso pode futuramente integrar a estratégia de Prometheus/Grafana do Exactum.

---

## 82. Estado Atual

No estado atual do Exactum, Soft Delete deve ser entendido como uma estratégia de persistência destinada às entidades em que preservação histórica e restauração sejam relevantes.

A aplicação deve tratar:

```text
deleted_at IS NULL
```

como o estado operacional ativo quando a entidade adota Soft Delete.

O comportamento deve permanecer concentrado nas abstrações responsáveis pela persistência e pelas regras de negócio, sem transformar Controllers em responsáveis pela lógica de exclusão.

---

## 83. Pontos de Evolução Conhecidos

A estratégia pode evoluir conforme o sistema cresça.

Possíveis evoluções:

- Repository abstractions mais fortes;
- query helpers;
- partial indexes;
- purge jobs;
- Celery;
- políticas de retenção;
- métricas de Soft Delete;
- anonymization;
- background cleanup;
- estratégias específicas por domínio;
- otimizações para tabelas de grande volume.

Esses mecanismos devem ser introduzidos conforme exista necessidade real.

---

## 84. Princípios de Design

A estratégia de Soft Delete do Exactum segue os seguintes princípios:

### 1. Preservação

Soft Delete preserva o registro físico quando o histórico é relevante.

### 2. Segurança

Registros deletados continuam protegidos por Authorization e Tenant Isolation.

### 3. Clareza

Queries normais devem trabalhar explicitamente com registros ativos.

### 4. Integridade

Soft Delete não deve quebrar foreign keys ou relacionamentos históricos.

### 5. Auditabilidade

Operações de delete e restore devem ser observáveis e auditáveis quando relevantes.

### 6. Consistência

Repositories e Application Services devem manter comportamento consistente.

### 7. Retenção controlada

Soft Delete não significa retenção infinita.

### 8. Evolução incremental

Purge, anonymization e outras estratégias devem ser introduzidas somente quando necessárias.

---

## 85. Documentos Relacionados

Este documento se relaciona diretamente com:

- `docs/database/schema.md`
- `docs/database/migrations.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/observability/audit-logging.md`
- `docs/observability/platform-events.md`
- `docs/observability/correlation.md`
- `docs/api/conventions.md`
- `docs/api/errors.md`
- `docs/testing/strategy.md`

---

## 86. Nomenclatura e Evolução Arquitetural

Alguns conceitos utilizados neste documento são arquiteturais e podem não corresponder literalmente aos nomes utilizados atualmente no código.

Por exemplo:

- `tenant` pode ser representado por `tenant_uuid`;
- `actor` pode ser representado atualmente por `user_uuid`;
- `resource` pode ser representado por identificadores específicos como `product_uuid` ou `sale_uuid`;
- `active` e `deleted` representam estados conceituais do ciclo de vida da entidade;
- `Soft Delete` representa uma estratégia de persistência, não necessariamente uma abstração específica existente no código.

Essa separação permite que a documentação descreva o comportamento arquitetural sem ficar rigidamente acoplada à implementação atual.

### Observação sobre evolução

A estratégia descrita neste documento representa o **estado atual e a direção arquitetural do Exactum**.

Conforme o sistema evolua, diferentes domínios poderão adotar estratégias de lifecycle próprias. Algumas entidades podem utilizar Soft Delete, outras podem utilizar estados de negócio, revogação, arquivamento ou retenção específica.

Da mesma forma, mecanismos atualmente simples poderão futuramente evoluir para políticas de retenção, purge assíncrono, anonymization, métricas ou processos administrativos dedicados.

Portanto, este documento deve ser interpretado como a definição da estratégia de Soft Delete aplicável ao modelo atual do Exactum, e não como uma regra obrigatória de que todas as entidades futuras deverão utilizar Soft Delete.
