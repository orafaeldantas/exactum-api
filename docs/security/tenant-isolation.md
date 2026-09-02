# Tenant Isolation

## 1. Overview

O Exactum é uma plataforma SaaS multi-tenant na qual diferentes organizações utilizam a mesma aplicação e infraestrutura, mantendo seus dados logicamente isolados.

A isolamento de tenants é um requisito fundamental de segurança da plataforma. Um usuário autenticado em um tenant não deve conseguir acessar, modificar ou inferir dados pertencentes a outro tenant, independentemente de manipulação de requisições, parâmetros, identificadores ou comportamento do frontend.

Este documento descreve os princípios, mecanismos e responsabilidades envolvidos no isolamento de dados entre tenants no Exactum.

O modelo atual utiliza **isolamento lógico em uma infraestrutura compartilhada**, com PostgreSQL como banco de dados principal.

O isolamento é aplicado de forma defensiva em múltiplas camadas:

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
Application Services
   │
   ▼
Repositories
   │
   ▼
Tenant-scoped Query
   │
   ▼
PostgreSQL
```

Nenhuma camada isoladamente deve ser considerada suficiente para garantir o isolamento.

---

## 2. Objectives

O mecanismo de tenant isolation possui os seguintes objetivos:

- impedir acesso cross-tenant;
- impedir modificações cross-tenant;
- impedir exclusão cross-tenant;
- garantir que consultas sejam limitadas ao tenant correto;
- impedir que identificadores públicos sejam utilizados para atravessar fronteiras de tenant;
- manter autorização vinculada ao contexto correto;
- reduzir o impacto de possíveis falhas em uma camada individual;
- fornecer rastreabilidade para operações relacionadas a tenants;
- manter o modelo compatível com a evolução arquitetural futura.

O princípio central é:

> **Um usuário somente pode operar sobre recursos pertencentes ao tenant ao qual sua sessão e seu contexto de autorização estão vinculados.**

---

# 3. Multi-Tenancy Model

O Exactum utiliza um modelo de **multi-tenancy lógico**.

Nesse modelo, diferentes tenants compartilham:

- aplicação;
- containers;
- infraestrutura;
- banco de dados;
- schemas;
- tabelas.

A separação ocorre por meio da associação dos registros ao respectivo tenant.

Conceitualmente:

```text
                    Exactum
                       │
          ┌────────────┴────────────┐
          │                         │
       Tenant A                  Tenant B
          │                         │
    ┌─────┼─────┐             ┌─────┼─────┐
    │     │     │             │     │     │
 Users Products Sales        Users Products Sales
```

Os dados permanecem fisicamente dentro da mesma infraestrutura, mas cada operação deve respeitar a fronteira lógica estabelecida pelo tenant.

---

# 4. Isolation Boundary

O tenant representa uma das principais fronteiras de segurança do sistema.

Uma requisição tenant-scoped possui, conceitualmente:

```text
Authenticated User
        │
        ▼
    Tenant Context
        │
        ▼
Authorization Context
        │
        ▼
Application Operation
        │
        ▼
Tenant-scoped Persistence
```

O contexto do tenant não deve ser tratado como um simples parâmetro fornecido pelo cliente.

Por exemplo, uma requisição como:

```http
GET /api/products?tenant_id=tenant-b
```

não deve permitir que um usuário autenticado no `tenant-a` consulte dados de `tenant-b`.

O tenant autorizado deve ser determinado a partir do contexto confiável da sessão e das regras de autorização.

---

# 5. Source of Tenant Context

O contexto do tenant é estabelecido durante o processamento da requisição.

Conceitualmente:

```text
Request
   │
   ▼
Authentication
   │
   ▼
Authenticated Identity
   │
   ▼
Tenant Resolution
   │
   ▼
Tenant Context
```

O contexto pode ser representado internamente por informações como:

```text
tenant_id
user_id
role
```

Essas informações são disponibilizadas para as camadas responsáveis pelo processamento da requisição.

O cliente não deve ser considerado uma fonte confiável para determinar a identidade ou o tenant efetivamente autorizado.

---

# 6. Tenant Context

O contexto do tenant funciona como uma restrição de escopo para operações tenant-scoped.

Conceitualmente:

```python
request_context = {
    "tenant_id": "...",
    "user_id": "...",
    "role": "..."
}
```

Esse contexto é utilizado pelas camadas subsequentes para determinar:

- qual tenant está sendo acessado;
- qual usuário está executando a operação;
- qual nível de autorização está disponível;
- quais registros podem ser consultados ou modificados.

O contexto deve permanecer associado à requisição atual e não deve ser compartilhado entre requisições.

---

# 7. Tenant-Scoped Resources

Recursos pertencentes a um tenant devem possuir uma relação explícita com esse tenant.

Exemplos conceituais:

```text
Tenant
 ├── Users
 ├── Products
 ├── Sales
 ├── Inventory
 ├── Reports
 └── Audit Records
```

No modelo atual, alguns desses conceitos ainda estão agrupados dentro de contextos maiores e podem receber separação mais explícita durante a evolução arquitetural.

A regra de segurança permanece a mesma:

> Todo recurso tenant-scoped deve ser acessado dentro do contexto do tenant autorizado.

---

# 8. Persistence Isolation

A persistência constitui uma das principais linhas de defesa contra acesso cross-tenant.

Consultas que recuperam dados pertencentes a tenants devem aplicar explicitamente o tenant autorizado.

Conceitualmente:

```sql
SELECT *
FROM products
WHERE id = :product_id
  AND tenant_id = :tenant_id;
```

Em vez de:

```sql
SELECT *
FROM products
WHERE id = :product_id;
```

A diferença é fundamental.

O segundo modelo permite que um identificador válido de outro tenant potencialmente atravesse a fronteira de isolamento.

O primeiro vincula simultaneamente:

```text
Resource Identity
        +
Tenant Identity
```

---

# 9. Defensive Dual Isolation

O Exactum adota uma estratégia de **isolamento defensivo em duas camadas principais**:

```text
          Request Boundary
                │
                ▼
        Tenant Context
                │
                ▼
         Application Layer
                │
                ▼
       Persistence Boundary
                │
                ▼
       Tenant-scoped Query
```

A primeira camada estabelece o contexto correto.

A segunda garante que a persistência continue restringindo os dados ao tenant esperado.

Isso evita depender exclusivamente de middleware ou exclusivamente de repositories.

---

## 9.1. Request-Level Isolation

Durante o processamento da requisição, o sistema estabelece o tenant associado ao contexto autenticado.

Essa etapa garante que as operações subsequentes conheçam o escopo correto.

Conceitualmente:

```text
JWT / Session
     │
     ▼
Authenticated Identity
     │
     ▼
Tenant Context
```

O tenant não deve ser livremente definido pelo cliente.

---

## 9.2. Persistence-Level Isolation

Mesmo após o estabelecimento do contexto, as operações de persistência devem aplicar explicitamente a restrição de tenant.

Conceitualmente:

```text
Repository
    │
    ├── resource_id
    └── tenant_id
            │
            ▼
       Database Query
```

Isso cria uma segunda barreira caso alguma camada anterior seja utilizada incorretamente.

---

# 10. Authorization and Tenant Isolation

Tenant isolation e authorization são mecanismos diferentes, mas complementares.

Authorization responde:

```text
"O usuário pode executar esta operação?"
```

Tenant isolation responde:

```text
"Sobre qual tenant essa operação pode ocorrer?"
```

Portanto, uma operação válida deve satisfazer ambos:

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
Tenant-scoped Resource
      │
      ▼
Operation
```

Um usuário pode possuir permissão para:

```text
products.read
```

mas isso não significa que ele possa ler produtos de qualquer tenant.

A permissão deve ser aplicada dentro do tenant autorizado.

---

# 11. Resource Ownership

Para recursos tenant-scoped, a identidade do recurso não é suficiente para determinar se ele pode ser acessado.

A autorização deve considerar pelo menos:

```text
User
 +
Tenant
 +
Permission
 +
Resource
```

Por exemplo:

```text
User A
Tenant A
products.update
Product X
```

A operação é permitida somente se:

```text
Product X belongs to Tenant A
```

Caso:

```text
Product X belongs to Tenant B
```

a operação deve ser rejeitada.

---

# 12. Preventing Cross-Tenant Access

Uma tentativa de acesso cross-tenant pode ocorrer de várias maneiras.

Exemplos:

### Identificador de recurso

```http
GET /api/products/<uuid-of-other-tenant>
```

### Identificador de tenant

```http
GET /api/products?tenant_id=<other-tenant>
```

### Manipulação de payload

```json
{
  "tenant_id": "other-tenant"
}
```

### Manipulação de URL

```http
PUT /api/tenants/<other-tenant>/products/<id>
```

### Inferência através de endpoints

Mesmo quando um endpoint não retorna diretamente o recurso, respostas diferentes entre tenants podem revelar sua existência.

Por isso, tenant isolation deve ser tratada como uma propriedade de toda a operação, e não somente como uma validação de parâmetros.

---

# 13. Client-Supplied Tenant Identifiers

O frontend pode conhecer o tenant atual para fins de interface, mas essa informação não deve ser considerada autoridade de segurança.

Por exemplo, um payload como:

```json
{
  "tenant_id": "tenant-a",
  "name": "Product"
}
```

não deve permitir que o cliente escolha arbitrariamente o tenant ao qual o recurso será associado.

O backend deve determinar o tenant autorizado a partir do contexto confiável da requisição.

O frontend é responsável pela experiência de uso.

O backend é responsável pela segurança.

---

# 14. Repository Responsibility

Repositories representam uma fronteira importante para o isolamento.

Operações que trabalham com recursos tenant-scoped devem receber ou resolver o contexto de tenant de maneira controlada.

Conceitualmente:

```text
Application Service
        │
        ▼
Repository
        │
        ├── tenant_id
        └── resource criteria
                 │
                 ▼
             Database
```

Um repository não deve executar uma consulta tenant-scoped ignorando o tenant.

### Exemplo conceitual

```python
repository.get_by_id(
    resource_id=resource_id,
    tenant_id=tenant_id,
)
```

em vez de depender apenas de:

```python
repository.get_by_id(resource_id)
```

quando o recurso pertence a um tenant.

---

# 15. Application Service Responsibility

Application Services coordenam casos de uso e devem garantir que o contexto necessário esteja disponível para a operação.

Conceitualmente:

```text
Route
  │
  ▼
Application Service
  │
  ├── authenticated user
  ├── tenant context
  ├── authorization
  │
  ▼
Repository
```

O Application Service não deve assumir que o frontend já validou o tenant.

Também não deve considerar a existência de um recurso como prova de que ele pertence ao tenant atual.

---

# 16. Route and Controller Responsibility

Routes e controllers são responsáveis por receber e validar a entrada HTTP, além de iniciar o fluxo de autenticação e autorização.

Entretanto, eles não devem ser considerados a única barreira de tenant isolation.

Por exemplo, validar:

```python
tenant_id == current_tenant_id
```

na route é útil, mas insuficiente se posteriormente um repository executar:

```sql
SELECT *
FROM products
WHERE id = :id;
```

sem tenant scoping.

O isolamento deve sobreviver à passagem por todas as camadas.

---

# 17. Database Constraints

Sempre que aplicável, o banco deve ajudar a preservar invariantes relacionados ao tenant.

Por exemplo, relações entre entidades podem precisar considerar o tenant como parte da identidade lógica.

Conceitualmente:

```text
Tenant
  │
  ├── Product
  │
  └── Category
```

Uma associação válida deve respeitar:

```text
Product.tenant_id == Category.tenant_id
```

Isso evita situações em que registros pertencentes a tenants diferentes sejam associados acidentalmente.

As constraints específicas devem refletir o modelo de dados efetivamente implementado.

---

# 18. Public Identifiers

O Exactum utiliza identificadores públicos para exposição através da API.

A utilização de UUIDs reduz a previsibilidade de identificadores quando comparada a identificadores sequenciais expostos diretamente.

Entretanto:

> **UUID não é mecanismo de autorização nem de tenant isolation.**

Mesmo que um atacante obtenha um UUID válido pertencente a outro tenant, o acesso deve ser rejeitado se o recurso estiver fora do tenant autorizado.

Portanto:

```text
UUID
  ≠
Authorization
  ≠
Tenant Isolation
```

O identificador protege contra determinadas formas de enumeração, mas não substitui o controle de acesso.

---

# 19. Tenant Administration

Administradores de tenant possuem privilégios superiores dentro do próprio tenant, mas continuam limitados pela fronteira do tenant.

Conceitualmente:

```text
Tenant Admin
     │
     ├── Users
     ├── Roles
     ├── Permissions
     └── Business Data
           │
           ▼
        Same Tenant
```

Um administrador do `tenant-a` não deve adquirir acesso administrativo sobre:

```text
tenant-b
```

simplesmente por possuir uma role administrativa.

O escopo da role permanece vinculado ao tenant.

---

# 20. Super-Admin Context

O super-admin representa uma autoridade de plataforma diferente das roles convencionais de tenant.

Conceitualmente:

```text
                    Platform
                       │
                  Super Admin
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Tenant A     Tenant B     Tenant C
```

O super-admin pode possuir operações de nível de plataforma que não pertencem ao modelo normal de autorização tenant-scoped.

Essas operações devem ser tratadas explicitamente como **platform-level authorization**.

Não se deve implementar o conceito de super-admin simplesmente como:

```text
role == "admin"
```

O contexto de plataforma possui uma fronteira de confiança diferente.

---

# 21. Tenant Suspension

O tenant pode estar sujeito a estados de ciclo de vida que impeçam operações normais.

Por exemplo:

```text
Active
Suspended
```

Quando um tenant está suspenso, operações normalmente permitidas para seus usuários devem ser bloqueadas de acordo com as regras de segurança e negócio aplicáveis.

Conceitualmente:

```text
Authenticated
     │
     ▼
Tenant Active?
   /       \
 No         Yes
 │           │
Reject    Continue
```

A suspensão não deve depender de comportamento do frontend.

O backend deve aplicar a regra.

---

# 22. User Blocking

O bloqueio de um usuário possui efeito semelhante em relação à autorização.

Mesmo que o usuário possua:

```text
valid credentials
valid session
valid role
```

um estado de bloqueio deve impedir operações que não sejam explicitamente permitidas durante esse estado.

O fluxo conceitual é:

```text
Authentication
      │
      ▼
User Status
      │
      ├── Blocked ──► Reject
      │
      └── Active
             │
             ▼
        Tenant Status
             │
             ▼
        Authorization
```

Esse mecanismo evita que uma sessão previamente válida continue sendo utilizada após uma alteração administrativa de segurança.

---

# 23. Impersonation

O Exactum possui mecanismo de impersonation para operações administrativas de plataforma.

Impersonation cria um contexto especial porque existem duas identidades relevantes:

```text
Original Administrator
        │
        ▼
Impersonated User
        │
        ▼
Target Tenant
```

Durante a impersonation, as operações de negócio devem ser avaliadas dentro do contexto do usuário impersonado quando a intenção é reproduzir o comportamento daquele usuário.

Conceitualmente:

```text
Super Admin
     │
     │ impersonate
     ▼
Target User
     │
     ▼
Target Tenant
     │
     ▼
Business Authorization
```

Isso evita que o modo de impersonation transforme automaticamente toda operação de negócio em uma operação de super-admin.

A autoridade de plataforma e a identidade impersonada devem permanecer conceitualmente separadas.

---

# 24. Impersonation and Tenant Boundaries

A impersonation não elimina tenant isolation.

Se o administrador de plataforma impersona um usuário pertencente ao:

```text
Tenant A
```

as operações executadas no contexto desse usuário devem respeitar:

```text
Tenant A
```

e as permissões associadas ao usuário impersonado, salvo operações explicitamente definidas como platform-level.

O modelo pode ser representado como:

```text
Super Admin
     │
     ▼
Impersonation Context
     │
     ├── Original Platform Identity
     │
     └── Effective User Identity
               │
               ▼
         Effective Tenant
               │
               ▼
         Business Rules
```

Esse modelo reduz o risco de confundir:

```text
"posso administrar a plataforma"
```

com:

```text
"posso executar qualquer operação de negócio em qualquer contexto".
```

---

# 25. Background and Asynchronous Operations

Operações assíncronas futuras também devem preservar o contexto de tenant.

Caso o Exactum introduza processamento através de filas, como Celery + RabbitMQ, tarefas tenant-scoped deverão carregar explicitamente o contexto necessário.

Conceitualmente:

```text
HTTP Request
     │
     ▼
Application Service
     │
     ▼
Queue Message
     │
     ├── tenant_id
     ├── actor/user context
     └── operation data
             │
             ▼
        Worker
             │
             ▼
      Tenant-scoped
        Operation
```

Um worker não deve depender de estado global da requisição HTTP original.

O tenant necessário para executar a operação deve fazer parte do contexto persistido da tarefa, quando aplicável.

---

# 26. Caching Considerations

Caches também devem respeitar o tenant.

Uma chave de cache inadequada pode causar vazamento cross-tenant mesmo quando o banco de dados está corretamente isolado.

Evitar:

```text
product:{product_id}
```

quando o identificador não for suficiente para representar o contexto de segurança.

Quando necessário, o tenant deve fazer parte da chave:

```text
tenant:{tenant_id}:product:{product_id}
```

O mesmo princípio se aplica a:

- Redis;
- caches de aplicação;
- respostas armazenadas;
- dados temporários;
- sessões;
- tarefas assíncronas.

Tenant isolation deve ser preservada em todas as formas de armazenamento intermediário.

---

# 27. Logging and Observability

Eventos relacionados a tenant devem preservar o contexto necessário para diagnóstico e auditoria.

Logs estruturados podem conter informações como:

```text
tenant_uuid
user_uuid
request_id
event
resource
timestamp
```

O objetivo é permitir responder perguntas como:

```text
Qual tenant executou esta operação?
Qual usuário executou?
Qual recurso foi afetado?
Qual requisição originou a operação?
```

Ao mesmo tempo, logs devem evitar exposição desnecessária de dados sensíveis.

---

# 28. Auditability

Alterações relacionadas a fronteiras de segurança devem ser auditáveis.

Exemplos:

- alteração de usuários;
- alteração de roles;
- alteração de permissões;
- suspensão de tenant;
- reativação de tenant;
- impersonation;
- operações administrativas relevantes.

O modelo conceitual de auditoria inclui:

```text
Actor
  │
  ├── User
  ├── Tenant
  ├── Event
  ├── Entity
  └── Timestamp
```

Isso fornece rastreabilidade sem transformar o mecanismo de auditoria em uma dependência da autorização em tempo de execução.

---

# 29. Error Handling

Uma tentativa de acessar um recurso fora do escopo autorizado deve resultar em uma resposta de segurança apropriada.

De forma geral:

```text
Unauthenticated
      │
      ▼
     401
```

e:

```text
Authenticated
      │
      ▼
Not Authorized
      │
      ▼
     403
```

Para recursos tenant-scoped, a aplicação deve evitar respostas que revelem informações desnecessárias sobre recursos pertencentes a outros tenants.

Em determinadas operações, tratar um recurso fora do escopo como inexistente pode ser apropriado para reduzir exposição de informações.

A decisão deve ser consistente com o contrato da API.

---

# 30. Security Principles

O modelo de tenant isolation segue alguns princípios fundamentais.

## 30.1. Deny by Default

Na ausência de uma autorização explícita:

```text
Access = Denied
```

---

## 30.2. Least Privilege

Usuários devem possuir somente os privilégios necessários para executar suas atividades.

---

## 30.3. Explicit Tenant Scope

Operações tenant-scoped devem possuir escopo de tenant explícito.

---

## 30.4. Backend as Security Boundary

O frontend nunca deve ser considerado uma barreira de segurança.

---

## 30.5. Defense in Depth

O isolamento deve ser reforçado por múltiplas camadas.

```text
Authentication
      +
Tenant Context
      +
Authorization
      +
Repository Scoping
      +
Database Constraints
      =
Defense in Depth
```

---

## 30.6. Fail Closed

Quando o sistema não consegue determinar com segurança o tenant ou a autorização necessária, a operação deve ser rejeitada.

É preferível:

```text
Reject request
```

a:

```text
Guess tenant
```

---

# 31. Threats Addressed

Tenant isolation reduz o risco de ameaças como:

### Broken Access Control

Usuário consegue acessar um recurso sem possuir autorização.

### BOLA / IDOR

Usuário manipula identificadores para acessar recursos pertencentes a outro tenant.

### Privilege Escalation

Usuário obtém privilégios superiores aos autorizados.

### Tenant Escape

Operação ultrapassa a fronteira do tenant atual.

### Parameter Tampering

Cliente altera `tenant_id` ou outro parâmetro para tentar mudar o escopo da operação.

### Cross-Tenant Data Leakage

Informações de um tenant aparecem em:

- respostas da API;
- logs;
- caches;
- relatórios;
- tarefas assíncronas;
- métricas;
- mensagens.

---

# 32. Security Invariants

O sistema deve preservar invariantes fundamentais.

### Invariant 1 — Resource Ownership

```text
Tenant(resource) == EffectiveTenant
```

para operações tenant-scoped.

### Invariant 2 — Authorization

```text
Permission(user, operation) == allowed
```

antes da execução de operações protegidas.

### Invariant 3 — Tenant Context

```text
EffectiveTenant != null
```

para operações que exigem contexto tenant-scoped.

### Invariant 4 — No Cross-Tenant Mutation

Uma operação originada no tenant A não pode modificar recursos pertencentes ao tenant B.

### Invariant 5 — No Cross-Tenant Read

Uma operação originada no tenant A não pode consultar recursos pertencentes ao tenant B.

### Invariant 6 — Platform Separation

Operações de plataforma devem ser explicitamente diferenciadas das operações tenant-scoped.

---

# 33. Request Lifecycle

O fluxo completo de uma operação tenant-scoped pode ser representado por:

```text
┌─────────────────────┐
│       Request       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Authentication    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   User Validation   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tenant Resolution  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Tenant Status Check │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Authorization     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Application Service │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Repository     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Tenant-scoped Query │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘
```

Cada etapa possui uma responsabilidade diferente.

---

# 34. Responsibilities by Layer

| Layer                | Responsibility                                    |
| -------------------- | ------------------------------------------------- |
| Authentication       | Establish authenticated identity                  |
| Tenant Context       | Establish effective tenant                        |
| Authorization        | Validate permissions                              |
| Application Services | Coordinate tenant-scoped use cases                |
| Repositories         | Enforce tenant-scoped persistence                 |
| Database             | Preserve data integrity and relationships         |
| Observability        | Provide tenant-aware diagnostics and auditability |
| Frontend             | Reflect authorized context for UX                 |

Nenhuma dessas responsabilidades deve ser confundida com as demais.

---

# 35. Testing Strategy

Tenant isolation deve possuir testes positivos e negativos.

## 35.1. Same-Tenant Access

Usuário deve conseguir acessar recursos pertencentes ao próprio tenant quando possuir a permissão necessária.

```text
User A
Tenant A
Resource A

→ Allowed
```

---

## 35.2. Cross-Tenant Access

Usuário não deve acessar recurso de outro tenant.

```text
User A
Tenant A
Resource B
Tenant B

→ Denied
```

---

## 35.3. Cross-Tenant Mutation

Usuário não deve modificar recurso de outro tenant.

```text
PUT Resource B

→ Denied
```

---

## 35.4. Cross-Tenant Deletion

Usuário não deve excluir recurso de outro tenant.

```text
DELETE Resource B

→ Denied
```

---

## 35.5. Tenant Parameter Manipulation

Alterar `tenant_id` enviado pelo cliente não deve alterar o contexto efetivo da requisição.

---

## 35.6. Role Escalation

Um usuário de um tenant não deve obter permissões de outro tenant simplesmente manipulando IDs ou payloads.

---

## 35.7. Suspended Tenant

Usuários de tenants suspensos devem ter operações bloqueadas conforme as regras definidas para o estado de suspensão.

---

## 35.8. Blocked User

Usuários bloqueados não devem continuar executando operações protegidas através de sessões previamente válidas.

---

## 35.9. Impersonation

Testes devem verificar:

- identificação do usuário original;
- identificação do usuário efetivo;
- tenant efetivo;
- permissões do usuário impersonado;
- término correto da impersonation;
- ausência de escalada indevida de privilégios.

---

# 36. Common Failure Modes

Os seguintes padrões devem ser evitados.

### Trusting `tenant_id` from the Client

```text
Client → tenant_id → Database
```

O cliente não deve controlar diretamente o escopo de segurança.

---

### Querying by ID Only

```sql
WHERE id = :id
```

sem considerar o tenant quando necessário.

---

### Filtering Only in the Frontend

Esconder recursos de outro tenant na interface não constitui isolamento.

---

### Authorization Without Ownership Check

Ter permissão para editar produtos não significa poder editar produtos de qualquer tenant.

---

### Incomplete Cache Keys

Cache compartilhado entre tenants pode gerar vazamento de dados.

---

### Background Jobs Without Context

Workers executando operações sem conhecer o tenant podem operar sobre dados incorretos.

---

### Implicit Super-Admin Bypass

Permitir que uma role de plataforma atravesse qualquer regra sem uma política explícita dificulta auditoria e aumenta o risco de privilege escalation.

---

# 37. Architectural Evolution

O modelo atual foi projetado para funcionar com a arquitetura predominantemente em camadas do Exactum.

A evolução para uma arquitetura mais orientada a domínios deve preservar os mesmos invariantes de segurança.

Conceitualmente:

```text
Current

HTTP
 │
 ▼
Application Services
 │
 ▼
Repositories
 │
 ▼
Persistence
```

Evolução:

```text
HTTP
 │
 ▼
Application
 │
 ▼
Domain
 │
 ├── Policies
 ├── Entities
 ├── Value Objects
 └── Domain Rules
 │
 ▼
Infrastructure
 │
 ▼
Persistence
```

O refactor arquitetural não deve reduzir as garantias atuais de isolamento.

Pelo contrário, a separação de responsabilidades deve tornar as regras de tenant mais explícitas e testáveis.

---

# 38. Future Improvements

Possíveis evoluções incluem:

- políticas de autorização mais próximas dos domínios;
- abstração explícita de `TenantContext`;
- repositories com escopo tenant obrigatório;
- mecanismos para evitar consultas tenantless acidentais;
- maior cobertura de testes de isolamento;
- políticas específicas para recursos cross-tenant;
- propagação formal de tenant context para workers;
- tenant-aware caching;
- métricas de segurança por tenant;
- mecanismos adicionais de proteção no PostgreSQL, quando justificáveis;
- documentação de invariantes de segurança por bounded context.

Essas evoluções devem ser introduzidas de maneira incremental, sem substituir prematuramente mecanismos que já funcionam.

---

# 39. Relationship with Other Security Components

Tenant isolation não funciona isoladamente.

### Authentication

Determina a identidade autenticada.

```text
Who are you?
```

Documentação:

`docs/security/authentication.md`

### Session Management

Controla a validade e o ciclo de vida da sessão.

```text
Is your session still valid?
```

Documentação:

`docs/security/session-management.md`

### Authorization

Determina quais operações o usuário pode executar.

```text
What can you do?
```

Documentação:

`docs/security/authorization.md`

### Tenant Isolation

Determina sobre qual tenant essas operações podem ocorrer.

```text
Where can you operate?
```

### Threat Model

Define e avalia as ameaças que podem comprometer essas garantias.

```text
What can go wrong?
```

---

# 40. Security Model

O modelo de segurança pode ser resumido como:

```text
                 ┌──────────────────┐
                 │  Authentication  │
                 │    Who are you?  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Tenant Context   │
                 │  Where are you?  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Authorization   │
                 │ What can you do? │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Resource Scope   │
                 │ What can you     │
                 │ access here?     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   Persistence    │
                 │ Tenant-scoped    │
                 │     queries      │
                 └──────────────────┘
```

Uma operação somente deve prosseguir quando todas as condições necessárias forem satisfeitas.

---

# 41. Summary

O isolamento de tenants no Exactum é baseado em **isolamento lógico, contexto explícito e defesa em profundidade**.

Os principais princípios são:

1. cada requisição possui um contexto de tenant efetivo;
2. o cliente não controla diretamente esse contexto;
3. autorização ocorre dentro do tenant autorizado;
4. recursos tenant-scoped devem ser associados ao tenant correto;
5. repositories devem aplicar tenant scoping;
6. identificadores públicos não substituem autorização;
7. administradores de tenant permanecem limitados ao próprio tenant;
8. super-admin possui um contexto de plataforma explicitamente diferenciado;
9. impersonation não elimina as fronteiras de tenant;
10. caches e tarefas assíncronas também devem preservar o tenant context;
11. usuários bloqueados e tenants suspensos devem ter suas operações tratadas pelo backend;
12. logs e auditoria devem preservar contexto suficiente para rastreabilidade;
13. testes devem incluir cenários explícitos de cross-tenant access;
14. a evolução arquitetural deve preservar os invariantes de isolamento.

O princípio fundamental permanece:

> **Um identificador válido nunca é suficiente para conceder acesso. O recurso também precisa pertencer ao contexto autorizado da operação.**

---

# 42. Related Documentation

- `docs/security/overview.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/session-management.md`
- `docs/security/threat-model.md`
- `docs/architecture/multi-tenancy.md`
- `docs/architecture/domain-boundaries.md`
- `docs/observability/audit-logging.md`
- `docs/observability/platform-events.md`

---

# 43. Status

**Status:** Active
**Architecture:** Layered / evolving toward domain-oriented architecture
**Security Model:** Logical multi-tenancy with defense-in-depth
**Target Version:** v0.2.x / v0.3.x evolution
