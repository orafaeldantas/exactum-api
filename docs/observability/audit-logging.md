# Audit Logging

## 1. Objetivo

O **Audit Logging** é o mecanismo responsável por registrar ações relevantes executadas dentro do contexto de um tenant, fornecendo rastreabilidade, accountability e histórico operacional.

Enquanto os Infrastructure Logs descrevem principalmente **como o sistema foi executado**, os Audit Logs registram **o que foi realizado sobre os dados e recursos do negócio**.

O objetivo não é registrar absolutamente tudo que acontece na aplicação, mas preservar um histórico confiável das ações que possuem relevância operacional, administrativa ou de segurança.

Os Audit Logs devem permitir responder perguntas como:

- Quem realizou determinada ação?
- Qual ação foi executada?
- Sobre qual recurso?
- Quando a ação ocorreu?
- Em qual tenant?
- A operação foi concluída com sucesso?
- Qual foi o resultado da alteração?
- Qual request originou a operação?
- Quais dados relevantes foram alterados?

---

## 2. Escopo

O Audit Logging está relacionado principalmente a ações realizadas dentro do contexto de negócio de um tenant.

Exemplos de ações que podem ser relevantes:

- criação de recursos;
- atualização de recursos;
- exclusão lógica;
- restauração de recursos;
- alteração de status;
- alterações administrativas;
- alterações de usuários;
- alterações de roles e permissions;
- operações relevantes relacionadas a vendas;
- alterações relevantes relacionadas a produtos e estoque;
- ações realizadas durante impersonation;
- outras operações que representem mudanças significativas no estado do sistema.

Nem toda chamada HTTP precisa necessariamente gerar um Audit Log.

Uma requisição de leitura simples, por exemplo, pode ser relevante para Infrastructure Logging ou Metrics, mas não necessariamente representa uma ação de negócio que precise permanecer no histórico de auditoria.

---

## 3. Audit Logs vs. Infrastructure Logs

Os dois mecanismos possuem objetivos diferentes.

### Infrastructure Logs

Infrastructure Logs descrevem a execução técnica da aplicação.

Exemplos:

```text
HTTP request received
Database connection failed
Redis timeout
Unhandled exception
Authentication failed
Request completed
```

Seu principal público é composto por developers, operators e responsáveis pela infraestrutura.

### Audit Logs

Audit Logs descrevem ações relevantes realizadas sobre recursos do negócio.

Exemplos:

```text
Product created
Product updated
Product deleted
User permissions changed
Sale cancelled
Product restored
```

Seu objetivo principal é fornecer **accountability e histórico operacional**.

Uma forma simples de diferenciar os dois conceitos é:

```text
Infrastructure Logging
    → O que aconteceu tecnicamente?

Audit Logging
    → O que foi feito sobre o negócio?
```

Uma mesma operação pode gerar ambos.

Por exemplo, uma alteração de produto pode produzir:

```text
Infrastructure Log
    → PATCH /products/{uuid} completed with 200

Audit Log
    → Product updated by actor X
```

---

## 4. Audit Logs vs. Platform Events

Audit Logs também não devem ser confundidos com Platform Events.

### Platform Events

Platform Events representam acontecimentos relevantes para a própria plataforma.

Exemplos:

```text
tenant_created
user_blocked
impersonation_started
impersonation_finished
```

Esses eventos podem ser utilizados para observabilidade administrativa, operações de plataforma ou futuras integrações.

### Audit Logs

Audit Logs representam ações relevantes realizadas dentro do contexto de um tenant.

Exemplos:

```text
product_created
product_updated
product_deleted
user_permissions_updated
```

A distinção pode ser resumida como:

```text
Infrastructure Logs
    → execução técnica

Platform Events
    → acontecimentos relevantes da plataforma

Audit Logs
    → ações relevantes sobre recursos do tenant
```

Os três mecanismos podem utilizar informações de contexto semelhantes, como `request_id`, `tenant_uuid` e identificação do usuário, mas possuem responsabilidades diferentes.

---

## 5. Princípio de Accountability

Um dos principais objetivos do Audit Logging é garantir **accountability**.

Uma ação relevante deve poder ser associada a um contexto de execução.

Conceitualmente, esse contexto pode ser representado por:

```text
Actor
Tenant
Action
Resource
Timestamp
Outcome
Request
Metadata
```

Por exemplo:

```text
Actor:
    user A

Tenant:
    tenant X

Action:
    product_updated

Resource:
    product B

Outcome:
    success

Request:
    request C

Timestamp:
    2026-09-07T14:32:10Z
```

Isso permite reconstruir posteriormente o contexto da operação sem depender exclusivamente dos logs técnicos da aplicação.

---

## 6. Actor

O conceito de **actor** representa quem originou ou executou uma ação.

Na implementação atual da API, esse conceito pode ser representado por identificadores específicos, como `user_uuid`.

Portanto:

```text
Actor (conceitual)
        ↓
user_uuid (implementação atual)
```

A utilização do termo `actor` na documentação não significa necessariamente que exista uma entidade ou campo chamado literalmente `actor` na API.

Essa abstração é útil porque o conceito pode evoluir no futuro.

Além de usuários humanos, uma arquitetura mais distribuída pode possuir outros tipos de actors, como:

```text
User
System
Worker
Background Job
Integration
```

Por exemplo:

```text
Actor: user_uuid
Action: product_updated
```

ou futuramente:

```text
Actor: inventory-recalculation-worker
Action: stock_adjusted
```

A documentação utiliza o conceito arquitetural, enquanto a implementação utiliza a representação concreta disponível no sistema.

---

## 7. Actor vs. Target

Durante operações administrativas, especialmente impersonation, é importante distinguir o **actor** do usuário ou recurso afetado pela ação.

Por exemplo:

```text
Actor:
    Super Admin

Target:
    User being impersonated
```

O actor representa quem originou a ação.

O target representa quem ou o que foi afetado pela ação.

Essa distinção evita ambiguidades em situações nas quais um usuário possui capacidade de executar ações em nome de outro contexto.

Em uma operação normal:

```text
Actor → User A
Target → Product B
```

Durante impersonation:

```text
Actor → Super Admin
Effective User → User B
Target → Product C
```

Essa diferenciação é especialmente importante para operações administrativas e de segurança.

---

## 8. Tenant Context

Todo Audit Log relacionado a dados de negócio deve possuir contexto de tenant.

Conceitualmente:

```text
Audit Log
    ├── Tenant
    ├── Actor
    ├── Action
    ├── Resource
    └── Timestamp
```

Na implementação atual, o tenant pode ser representado por um identificador como:

```text
tenant_uuid
```

O tenant context deve ser obtido a partir do contexto autenticado da requisição e não deve depender de valores arbitrários fornecidos pelo cliente para determinar o escopo da auditoria.

O Audit Logging deve respeitar as mesmas regras de **Tenant Isolation** aplicadas ao restante da aplicação.

---

## 9. Audit Log Structure

Um Audit Log pode ser representado conceitualmente por uma estrutura semelhante a:

```text
AuditLog
├── id
├── tenant
├── actor
├── action
├── resource_type
├── resource_id
├── timestamp
├── outcome
├── request_id
├── metadata
└── changes
```

Os nomes exatos dos campos podem variar de acordo com a implementação.

### `id`

Identificador único do registro de auditoria.

### `tenant`

Identifica o tenant ao qual a ação pertence.

### `actor`

Identifica o originador da ação.

Na implementação atual, pode ser representado por `user_uuid`.

### `action`

Representa a operação realizada.

Exemplos:

```text
create
update
delete
restore
status_change
permission_change
```

### `resource_type`

Identifica o tipo de recurso afetado.

Exemplos:

```text
product
user
sale
```

### `resource_id`

Identifica o recurso específico afetado.

Na implementação atual, normalmente será representado pelo UUID público correspondente ao recurso.

### `timestamp`

Indica quando a ação ocorreu.

O timestamp deve representar o momento em que a operação foi efetivamente registrada.

### `outcome`

Representa o resultado da operação quando essa informação fizer parte do modelo de auditoria.

Exemplos:

```text
success
failure
```

A necessidade de registrar operações malsucedidas deve ser avaliada de acordo com o tipo de ação. Falhas técnicas e tentativas de acesso não autorizado continuam sendo principalmente responsabilidades de Infrastructure/Security Logging.

### `request_id`

Relaciona o Audit Log à requisição responsável pela operação.

Esse campo permite realizar investigação ponta a ponta:

```text
Request
    ↓
Infrastructure Log
    ↓
Application Operation
    ↓
Audit Log
```

### `metadata`

Permite armazenar informações adicionais relevantes para a operação.

A metadata deve ser utilizada de forma controlada e nunca como justificativa para armazenar dados indiscriminadamente.

### `changes`

Quando necessário, pode representar as alterações relevantes realizadas sobre um recurso.

Por exemplo:

```text
changes:
    minimum_stock:
        before: 10
        after: 20
```

---

## 10. Action Naming

As ações devem utilizar uma nomenclatura consistente.

Uma convenção possível é:

```text
<resource>_<action>
```

Exemplos:

```text
product_created
product_updated
product_deleted

user_created
user_updated
user_blocked

sale_created
sale_cancelled
```

Outra abordagem possível é separar `resource_type` e `action`:

```text
resource_type:
    product

action:
    update
```

O importante é manter uma convenção consistente em toda a aplicação.

A escolha da representação concreta deve considerar a implementação atual e a futura evolução dos domínios.

---

## 11. Meaningful Actions

O Audit Logging não deve se transformar em um espelho de todas as operações realizadas pela API.

Registrar indiscriminadamente cada leitura, query ou chamada HTTP pode gerar:

- grande volume de dados;
- dificuldade de análise;
- custos maiores de armazenamento;
- ruído operacional;
- menor utilidade do histórico.

Por isso, devem ser priorizadas ações com significado para o negócio, administração ou segurança.

Por exemplo:

```text
GET /products
```

normalmente não precisa gerar um Audit Log.

Já:

```text
DELETE /products/{uuid}
```

pode representar uma alteração significativa e deve ser considerada para auditoria.

A definição exata das ações auditáveis deve evoluir conforme os requisitos do sistema.

---

## 12. Create Operations

A criação de um recurso pode ser registrada com informações suficientes para identificar:

```text
Actor
Resource
Action
Timestamp
Tenant
Request
Outcome
```

Exemplo conceitual:

```text
Action:
    product_created

Actor:
    user_uuid

Resource:
    product_uuid

Tenant:
    tenant_uuid
```

Não é necessário armazenar uma cópia completa do recurso apenas para provar que ele foi criado.

O objetivo principal é preservar o contexto da ação.

---

## 13. Update Operations

Atualizações podem exigir informações adicionais porque o estado anterior e o novo estado podem ser relevantes para auditoria.

Quando necessário, pode ser armazenado um conjunto de alterações:

```text
Field:
    minimum_stock

Before:
    10

After:
    20
```

Esse modelo de **diff** normalmente é preferível a armazenar cópias completas do objeto quando apenas alguns campos foram alterados.

Isso reduz volume e exposição de dados.

---

## 14. Delete Operations

Operações de exclusão devem ser especialmente consideradas para auditoria.

No caso de **Soft Delete**, o Audit Log deve registrar a ação de exclusão lógica.

Exemplo:

```text
Action:
    product_deleted

Outcome:
    success
```

Se o recurso for posteriormente restaurado:

```text
Action:
    product_restored
```

Essas operações devem permanecer como registros históricos independentes.

O Audit Log não deve ser alterado para refletir o estado atual do recurso.

---

## 15. Immutability

Audit Logs possuem natureza histórica.

Depois que uma ação foi registrada, o registro não deve ser alterado apenas porque o estado atual do sistema mudou.

Por exemplo:

```text
2026-09-01
Product deleted

2026-09-03
Product restored
```

O registro de `product_deleted` continua válido.

O registro de `product_restored` representa uma nova ação.

Esse princípio preserva a integridade histórica do sistema.

---

## 16. Audit Logging and Soft Delete

Soft Delete e Audit Logging possuem responsabilidades complementares.

**Soft Delete** representa o estado atual do recurso:

```text
deleted_at != null
```

**Audit Logging** representa o histórico da ação:

```text
product_deleted
```

Um não substitui o outro.

O estado atual informa:

> O recurso está excluído?

O histórico informa:

> Quem o excluiu e quando?

Essa distinção é importante para manter uma separação clara entre **current state** e **historical record**.

---

## 17. Sensitive Data

Audit Logs podem conter informações importantes sobre operações do sistema e, por isso, também precisam seguir princípios de segurança e privacidade.

Não devem ser armazenados indiscriminadamente:

```text
Passwords
Access Tokens
Refresh Tokens
Cookies
Authorization Headers
API Keys
Secrets
Credentials
```

Também deve existir cautela ao registrar:

- dados pessoais;
- dados financeiros;
- informações completas de recursos;
- request bodies;
- informações desnecessárias para auditoria.

O objetivo é registrar **evidência suficiente da ação**, não duplicar o banco de dados dentro do sistema de auditoria.

---

## 18. Before and After Values

Quando alterações de estado forem relevantes, o sistema pode registrar valores anteriores e posteriores.

Exemplo:

```text
Product
    minimum_stock

Before:
    10

After:
    25
```

Esse mecanismo deve ser utilizado de maneira seletiva.

Nem todo campo precisa ser auditado individualmente.

Campos sensíveis devem ser excluídos, mascarados ou tratados de acordo com sua natureza.

Uma abordagem preferível é registrar apenas os campos relevantes para accountability:

```text
changes:
    role:
        before: user
        after: manager
```

em vez de armazenar o objeto completo.

---

## 19. Authorization Changes

Alterações de autorização são especialmente importantes para auditoria.

Exemplos:

```text
Role changed
Permission granted
Permission revoked
User blocked
User unblocked
```

Uma alteração de permission pode afetar diretamente o nível de acesso de um usuário e, portanto, deve possuir rastreabilidade adequada.

Exemplo conceitual:

```text
Actor:
    admin

Target:
    user_uuid

Action:
    permission_changed

Change:
    reports.read
        before: false
        after: true
```

Esses registros ajudam a investigar posteriormente como determinado usuário passou a possuir determinado nível de acesso.

---

## 20. Impersonation

Impersonation exige um nível adicional de rastreabilidade.

Durante uma sessão de impersonation, o sistema precisa ser capaz de diferenciar:

```text
Original Actor
Effective User
Target Resource
Tenant
```

Por exemplo:

```text
Original Actor:
    Super Admin

Effective User:
    Tenant User

Action:
    product_updated

Target:
    product_uuid
```

Isso evita que uma ação realizada durante impersonation seja atribuída de maneira ambígua apenas ao usuário impersonado.

O modelo exato de armazenamento pode evoluir junto com a implementação de impersonation e o modelo de Platform Events.

---

## 21. Request Correlation

Audit Logs devem manter uma relação com o contexto da requisição sempre que a ação for originada por uma requisição HTTP.

O `request_id` funciona como um identificador de correlação.

Exemplo:

```text
request_id = 7f8c...

Infrastructure Log
    ↓
PATCH /products/{uuid}

Application
    ↓
ProductService.update()

Audit Log
    ↓
product_updated
```

Isso permite que developers e operators partam de um Audit Log e encontrem os registros técnicos relacionados à mesma operação.

A estratégia detalhada de correlação é descrita em:

```text
docs/observability/correlation.md
```

---

## 22. Tenant Isolation

Audit Logs são dados potencialmente sensíveis do tenant.

Consequentemente, o acesso aos registros deve respeitar Tenant Isolation.

Um usuário de:

```text
tenant A
```

não deve conseguir consultar registros pertencentes a:

```text
tenant B
```

O tenant context deve ser aplicado tanto na criação quanto na consulta dos registros.

Apenas possuir um `tenant_uuid` no registro não é suficiente por si só. A camada responsável pelo acesso aos dados deve aplicar explicitamente o escopo correto.

Isso mantém o princípio de **defense in depth** utilizado pelo Exactum.

---

## 23. Access Control

Nem todo usuário deve necessariamente possuir acesso aos Audit Logs.

A visualização do histórico deve ser controlada por Authorization e Permissions.

Dependendo do nível de acesso, um usuário pode:

```text
View audit logs
View own actions
View administrative actions
Export audit history
```

A política exata depende das regras de negócio do tenant.

O frontend pode ocultar funcionalidades sem permissão para melhorar a UX, mas a autorização definitiva deve sempre ocorrer no backend.

---

## 24. Retention

Audit Logs podem crescer significativamente ao longo do tempo.

Por isso, a estratégia de retenção deve considerar:

- volume de operações;
- requisitos do negócio;
- necessidade de investigação histórica;
- custos de armazenamento;
- privacidade;
- requisitos legais aplicáveis.

A retenção deve ser definida explicitamente quando o volume do sistema justificar uma política formal.

Não se deve remover registros históricos simplesmente porque o recurso correspondente foi excluído.

---

## 25. Audit Logs Are Not Event Sourcing

Audit Logging não deve ser confundido com **Event Sourcing**.

No Audit Logging:

```text
Current State
    +
Audit History
```

O banco principal continua sendo responsável pelo estado atual do sistema.

O Audit Log fornece histórico das ações relevantes.

Em Event Sourcing, por outro lado, o estado pode ser reconstruído a partir de uma sequência de eventos persistidos.

O Exactum não utiliza Audit Logging como substituto para Event Sourcing.

Caso Event Sourcing seja considerado futuramente, ele deverá ser tratado como uma decisão arquitetural independente.

---

## 26. Transactional Consistency

Quando uma ação de negócio e seu Audit Log são persistidos, é importante considerar a consistência entre os dois.

Por exemplo:

```text
Update Product
    ↓
Save Product
    ↓
Save Audit Log
```

Se a alteração do produto for confirmada mas o Audit Log falhar, o sistema pode perder parte da rastreabilidade esperada.

Da mesma forma, registrar o Audit Log sem confirmar a operação de negócio pode produzir um histórico incorreto.

A estratégia transacional deve ser definida de acordo com a operação e com os requisitos de consistência.

Em cenários futuros de processamento assíncrono, uma abordagem como **Transactional Outbox** pode ser considerada para garantir a publicação confiável de eventos derivados de alterações persistidas.

Essa é uma possibilidade arquitetural futura, não uma dependência obrigatória da implementação atual.

---

## 27. Synchronous vs. Asynchronous Audit Processing

O registro de auditoria pode ocorrer de forma síncrona ou assíncrona.

### Synchronous

```text
Request
    ↓
Business Operation
    ↓
Audit Log
    ↓
Response
```

Vantagens:

- maior consistência imediata;
- fluxo simples;
- fácil entendimento.

Desvantagens:

- adiciona trabalho ao request;
- pode aumentar latência.

### Asynchronous

```text
Request
    ↓
Business Operation
    ↓
Event
    ↓
Queue
    ↓
Audit Consumer
    ↓
Audit Log
```

Vantagens:

- desacoplamento;
- melhor escalabilidade;
- menor impacto direto na requisição.

Desvantagens:

- maior complexidade;
- consistência eventualmente assíncrona;
- necessidade de retry e idempotency.

A evolução para processamento assíncrono poderá ser considerada juntamente com a adoção futura de mecanismos como Celery e RabbitMQ.

---

## 28. Idempotency

Caso o processamento de Audit Logs passe a ocorrer de forma assíncrona, o sistema deve considerar **idempotency**.

Um mesmo evento pode ser entregue mais de uma vez.

Sem proteção adequada:

```text
Event A
    ↓
Audit Log created

Event A
    ↓
Audit Log created again
```

Isso pode gerar registros duplicados.

Um identificador único de evento pode ser utilizado para garantir que o mesmo evento não seja processado mais de uma vez.

---

## 29. Relationship with Domain Events

Audit Logging pode receber informações provenientes de **Domain Events**, especialmente à medida que a arquitetura do Exactum evoluir.

Por exemplo:

```text
Domain Operation
    ↓
Domain Event
    ↓
Audit Logging
```

Porém, Domain Events e Audit Logs continuam sendo conceitos diferentes.

Um Domain Event representa algo relevante que aconteceu no domínio.

Um Audit Log representa a evidência histórica de uma ação que precisa ser rastreável.

Nem todo Domain Event precisa necessariamente gerar um Audit Log.

Da mesma forma, nem todo Audit Log precisa ser modelado como um Domain Event.

---

## 30. Domain Boundaries

Audit Logging é uma preocupação transversal da aplicação.

A lógica de negócio de um domínio não deve depender diretamente de detalhes de armazenamento do sistema de auditoria.

Uma separação conceitual adequada é:

```text
Domain / Application
        ↓
Meaningful Action
        ↓
Audit Event / Audit Record
        ↓
Audit Infrastructure
        ↓
Persistence
```

Isso permite que a implementação de armazenamento evolua sem introduzir forte acoplamento entre os domínios e a infraestrutura de observabilidade.

Essa abordagem também é compatível com a evolução arquitetural planejada para o Exactum em direção a limites de domínio mais fortes.

---

## 31. Avoiding Audit Noise

Um sistema de auditoria deve priorizar qualidade sobre quantidade.

Registrar milhares de operações sem significado reduz a capacidade de investigação.

Por isso, deve-se perguntar para cada operação:

```text
Essa ação possui relevância histórica?
Essa ação altera o estado do negócio?
Essa ação possui impacto administrativo?
Essa ação precisa de accountability?
```

Se a resposta for negativa, provavelmente um Infrastructure Log ou Metric será suficiente.

---

## 32. Investigation Example

Considere que um administrador perceba que o estoque mínimo de um produto foi alterado.

A investigação pode seguir:

```text
Audit Log
    ↓
product_updated
    ↓
Actor identified
    ↓
Timestamp identified
    ↓
Request ID identified
    ↓
Infrastructure Logs
    ↓
Request / Controller / Service
    ↓
Database operation
```

O Audit Log fornece o ponto de partida orientado ao negócio.

Os Infrastructure Logs fornecem o contexto técnico.

O Correlation ID conecta os dois.

---

## 33. Testing

Audit Logging deve possuir testes que validem principalmente:

- criação de registros para ações relevantes;
- associação correta ao tenant;
- associação correta ao actor;
- identificação correta do recurso;
- registro correto da ação;
- preservação do request ID;
- registro de alterações relevantes;
- comportamento em Soft Delete;
- comportamento em Restore;
- alterações de roles e permissions;
- operações realizadas durante impersonation;
- isolamento entre tenants;
- proteção contra exposição de dados sensíveis;
- comportamento transacional.

Também devem existir testes garantindo que uma operação realizada em um tenant não gere um registro associado incorretamente a outro tenant.

---

## 34. Current State

No estado atual do Exactum, Audit Logging faz parte da estratégia geral de Observability e deve ser tratado como uma camada específica para rastreabilidade de ações relevantes.

A implementação e o nível de detalhamento dos registros podem evoluir conforme novos requisitos de negócio e segurança forem incorporados.

A documentação, portanto, define principalmente os princípios e responsabilidades do mecanismo, enquanto os detalhes concretos de armazenamento e processamento podem evoluir junto com a arquitetura.

---

## 35. Future Evolution

A evolução planejada da arquitetura pode introduzir:

- Domain Events;
- Transactional Outbox;
- processamento assíncrono;
- Celery;
- RabbitMQ;
- maior separação entre domínios;
- políticas de retenção mais formais;
- mecanismos de consulta e exportação;
- métricas relacionadas a operações auditáveis;
- ferramentas centralizadas de observabilidade.

Essas evoluções devem preservar os princípios fundamentais:

```text
Accountability
Tenant Isolation
Data Minimization
Immutability
Traceability
Consistency
Security
```

---

## 36. Design Principles

O Audit Logging do Exactum deve seguir os seguintes princípios:

1. **Registrar ações relevantes**
2. **Preservar accountability**
3. **Manter contexto de tenant**
4. **Identificar o actor**
5. **Identificar o recurso afetado**
6. **Preservar o histórico**
7. **Evitar armazenamento desnecessário de dados**
8. **Não registrar secrets**
9. **Respeitar Authorization**
10. **Permitir correlação com Infrastructure Logs**
11. **Diferenciar actor, target e recurso**
12. **Não confundir auditoria com Event Sourcing**
13. **Evitar Audit Noise**
14. **Permitir evolução para processamento assíncrono**
15. **Manter baixo acoplamento com os domínios**

---

## 37. Related Documentation

- [`Observability Overview`](./overview.md)
- [`Infrastructure Logging`](./infrastructure-logging.md)
- [`Platform Events`](./platform-events.md)
- [`Correlation`](./correlation.md)
- [`Authentication`](../security/authentication.md)
- [`Authorization`](../security/authorization.md)
- [`Session Management`](../security/session-management.md)
- [`Tenant Isolation`](../security/tenant-isolation.md)
- [`Domain Boundaries`](../architecture/domain-boundaries.md)
- [`Multi-Tenancy`](../architecture/multi-tenancy.md)
- [`Soft Delete`](../database/soft-delete.md)

---

> **Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.
>
> A organização descrita também poderá evoluir conforme o sistema avance. Alguns conceitos ou responsabilidades atualmente agrupados em determinados domínios poderão posteriormente ser extraídos para contextos próprios, como parte da evolução arquitetural planejada. Portanto, este documento deve ser interpretado como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.
