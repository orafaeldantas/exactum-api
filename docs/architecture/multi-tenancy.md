# Multi-Tenancy

Este documento descreve a arquitetura de multi-tenancy do Exactum, incluindo o modelo de isolamento adotado, o estabelecimento do contexto de tenant, as fronteiras entre dados de plataforma e dados de tenant, os mecanismos defensivos utilizados para evitar acesso cruzado entre empresas e a relação entre tenancy, autenticação e autorização.

O objetivo é documentar não apenas **onde** o tenant é filtrado, mas principalmente **como a fronteira de tenancy atravessa a aplicação** e quais responsabilidades cada camada possui.

---

## 1. Visão Geral

O Exactum é uma plataforma SaaS multi-tenant na qual múltiplas empresas utilizam a mesma aplicação e a mesma infraestrutura, mantendo seus dados de negócio logicamente isolados.

O modelo adotado atualmente é baseado em **isolamento lógico de dados dentro de uma infraestrutura compartilhada**.

De forma simplificada:

```text
                         Exactum
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
        Tenant A         Tenant B        Tenant C
            │               │               │
            ▼               ▼               ▼
      Business Data   Business Data   Business Data
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                       PostgreSQL
```

Os tenants compartilham a infraestrutura da aplicação, mas as operações sobre dados de negócio são sempre executadas dentro de um contexto de tenant.

O isolamento não depende exclusivamente do frontend ou de uma única camada da aplicação. O Exactum utiliza uma abordagem defensiva na qual:

- a autenticação identifica o usuário;
- o contexto da requisição determina o tenant aplicável;
- a autorização verifica se a operação é permitida naquele contexto;
- a camada de aplicação opera dentro desse contexto;
- os repositórios aplicam o escopo de tenant às operações de persistência.

Essa combinação reduz o risco de acesso acidental a dados pertencentes a outro tenant.

---

## 2. Modelo de Multi-Tenancy

O Exactum utiliza atualmente um modelo de:

Shared Application + Shared Database + Logical Tenant Isolation

Ou seja:

- a aplicação é compartilhada entre tenants;
- a infraestrutura é compartilhada;
- o banco PostgreSQL é compartilhado;
- as tabelas são compartilhadas;
- os registros pertencentes a tenants são identificados por seu contexto de tenant;
- as operações sobre dados tenant-scoped são filtradas explicitamente.

O modelo pode ser representado da seguinte maneira:

```text

                     ┌─────────────────────┐
                     │     Exactum API     │
                     │       Flask         │
                     └──────────┬──────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
           Tenant A Context              Tenant B Context
                 │                             │
                 ▼                             ▼
           Repository                    Repository
                 │                             │
                 ▼                             ▼
        tenant_id = A                  tenant_id = B
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
                         PostgreSQL
```

A separação é lógica, e não física.

Isso significa que o banco não possui atualmente uma instância, schema ou banco de dados separado para cada tenant.

---

## 3. Objetivos

A arquitetura de multi-tenancy possui os seguintes objetivos:

- impedir acesso cruzado entre tenants;
- manter os dados de negócio associados ao tenant correto;
- garantir que operações autenticadas possuam um contexto de tenancy válido;
- separar responsabilidades de plataforma e de tenant;
- permitir administração global através de super-admin;
- permitir crescimento do número de tenants sem replicar a infraestrutura;
- reduzir a complexidade operacional de múltiplos bancos;
- tornar o isolamento uma preocupação arquitetural explícita;
- permitir evolução futura da estratégia de isolamento.

A arquitetura também busca reduzir a possibilidade de que uma alteração futura em uma camada da aplicação resulte automaticamente em exposição de dados de outro tenant.

---

## 4. Conceito de Tenant

No Exactum, um tenant representa uma empresa ou organização que utiliza a plataforma.

O tenant funciona como uma fronteira lógica de propriedade dos dados.

De forma simplificada:

```text
Tenant
│
├── Users
├── Roles
├── Permissions
├── Products
├── Sales
├── Inventory Data
├── Audit Logs
└── Other Business Data
```

Os dados de negócio associados a um tenant não devem ser acessíveis por usuários pertencentes a outro tenant.

Por exemplo:

```text
Tenant A
├── Product A1
├── Product A2
└── Sale A1

Tenant B
├── Product B1
├── Product B2
└── Sale B1
```

Uma operação autenticada no contexto do Tenant A não deve retornar:

```text
Product B1
Product B2
Sale B1

mesmo que o usuário consiga fornecer identificadores válidos dessas entidades.
```

---

## 5. Tenant Context

O conceito central da arquitetura é o Tenant Context.

Durante o processamento de uma requisição, a aplicação precisa determinar em qual contexto de tenant aquela operação está sendo executada.

O fluxo simplificado é:

```text
Request
   │
   ▼
Authentication
   │
   ▼
User Identity
   │
   ▼
Tenant Context
   │
   ▼
Authorization
   │
   ▼
Application Operation
   │
   ▼
Repository
   │
   ▼
Tenant-scoped Persistence
```

O contexto de tenant funciona como uma informação transversal que acompanha a operação através das diferentes camadas da aplicação.

No backend atual, esse contexto é estabelecido durante o processamento da requisição e disponibilizado para as camadas que precisam operar dentro da fronteira do tenant.

---

## 6. Estabelecimento do Contexto

O tenant associado à operação não deve ser escolhido arbitrariamente pela interface do usuário.

O contexto é determinado a partir da identidade autenticada e das regras de autorização da plataforma.

De forma conceitual:

```text
Authenticated User
        │
        ▼
   User Identity
        │
        ▼
Tenant Association
        │
        ▼
 Tenant Context
```

Uma requisição normal de um usuário pertencente a um tenant opera dentro do tenant associado à sua sessão.

Por exemplo:

```text
User
  │
  ├── user_uuid
  ├── role
  └── tenant_uuid
             │
             ▼
        Tenant Context
```

O frontend pode conhecer o tenant atual para fins de interface, mas essa informação não constitui uma fronteira de segurança.

A API continua responsável por determinar e validar o contexto efetivo da operação.

---

## 7. Tenant Context e Autenticação

Tenancy e autenticação são conceitos relacionados, mas distintos.

A autenticação responde:

> "Quem é o usuário?"

A tenancy responde:

> "Em qual contexto de organização essa operação está sendo executada?"

A autorização responde:

> "O usuário pode executar essa operação nesse contexto?"

```text
O fluxo completo pode ser representado como:

                 Request
                    │
                    ▼
              Authentication
                    │
                    ▼
              User Identity
                    │
                    ▼
              Tenant Context
                    │
                    ▼
              Authorization
                    │
                    ▼
             Application Logic
                    │
                    ▼
               Persistence
```

Essa separação é importante porque possuir uma identidade válida não significa automaticamente possuir acesso a todos os dados da plataforma.

---

## 8. Tenant Context e Autorização

A autorização do Exactum ocorre dentro de um contexto de tenancy.

Um usuário pode possuir determinada permissão, mas essa permissão não deve permitir acesso a dados pertencentes a outro tenant.

Por exemplo:

```text
User A
│
├── Tenant: A
└── Permission: products.read
```

Esse usuário pode executar:

```text
GET /products
```

mas a operação deve produzir dados equivalentes a:

```text
WHERE tenant_id = Tenant A
```

e não:

```text
SELECT * FROM products
```

sem qualquer escopo de tenancy.

Portanto:

```text
Permission
    +
Tenant Context
    +
Resource Ownership
    =
Authorized Operation
```

A autorização e o isolamento de tenant são preocupações complementares.

---

## 9. Tenant-Scoped e Platform-Scoped Data

Nem todos os dados do Exactum pertencem a um tenant.

A arquitetura diferencia dados pertencentes à plataforma de dados pertencentes a um tenant.

### 9.1 Tenant-Scoped Data

São dados cujo significado existe dentro de uma organização específica.

Exemplos:

- usuários do tenant;
- papéis;
- permissões atribuídas ao tenant;
- produtos;
- estoque;
- vendas;
- dados operacionais;
- logs de auditoria;
- configurações específicas do tenant.

Esses dados devem ser sempre operados dentro de um contexto de tenant.

---

### 9.2 Platform-Scoped Data

São dados relacionados à própria plataforma e à administração global do Exactum.

Exemplos conceituais:

- informações administrativas de tenants;
- eventos de plataforma;
- operações de super-admin;
- informações globais necessárias à administração da plataforma.

Essas operações não devem ser tratadas da mesma forma que operações comuns de usuários tenant-scoped.

---

## 10. Super-Admin e Tenancy

O Exactum possui um contexto administrativo de plataforma através do papel de super-admin.

O super-admin opera em um nível superior à fronteira normal de um tenant.

Isso permite operações como:

- criação de tenants;
- suspensão de tenants;
- reativação de tenants;
- administração global;
- diagnóstico;
- impersonate administrativo.

Essa capacidade não significa que os dados deixam de possuir ownership.

Em vez disso, o super-admin recebe uma capacidade administrativa especial para atravessar a fronteira de tenancy de maneira explícita e controlada.

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

Usuários normais não possuem essa capacidade.

---

## 11. Impersonate e Tenant Context

O recurso de impersonate administrativo permite que um super-admin opere temporariamente no contexto de outro usuário.

Esse fluxo é particularmente sensível porque altera o contexto operacional da requisição.

Conceitualmente:

```text
Super Admin
     │
     ▼
Start Impersonation
     │
     ▼
Target User
     │
     ▼
Target Tenant
     │
     ▼
Application Operation
```

Durante o impersonate, o sistema deve preservar a distinção entre:

```text
Original Administrator
        │
        ▼
Effective User
        │
        ▼
Effective Tenant
```

Isso permite que a aplicação saiba tanto:

- quem originalmente executou a ação;
- quanto qual usuário e tenant estão sendo efetivamente representados.

Essa distinção é especialmente importante para auditoria e segurança.

As operações de impersonate são registradas como eventos administrativos de plataforma.

---

## 12. Isolamento na Camada de Persistência

A camada de persistência constitui uma das principais barreiras defensivas do modelo de multi-tenancy.

Repositórios responsáveis por entidades tenant-scoped devem aplicar explicitamente o escopo de tenant às operações.

Conceitualmente:

```text
Repository
    │
    ▼
Tenant Context
    │
    ▼
Tenant-scoped Query
    │
    ▼
PostgreSQL
```

Uma consulta conceitual de produtos pertencentes a um tenant pode ser representada como:

```sql
SELECT *
FROM products
WHERE tenant_id = :tenant_id;
```

O princípio importante é que o repositório não deve tratar a tabela como um conjunto global de dados quando a entidade é tenant-scoped.

---

## 13. Dupla Camada de Isolamento

O Exactum adota uma abordagem defensiva de isolamento.

O isolamento é reforçado por duas preocupações principais:

```text
                 Request
                    │
                    ▼
        ┌────────────────────────┐
        │ Tenant Context / Auth   │
        └────────────┬───────────┘
                     │
                     ▼
              Application
                     │
                     ▼
        ┌────────────────────────┐
        │ Tenant-scoped Query    │
        └────────────┬───────────┘
                     │
                     ▼
                 Database
```

### 13.1 Primeira Barreira - Contexto

A aplicação estabelece o tenant efetivo da operação a partir do contexto autenticado e das regras da plataforma.

Essa camada impede que o usuário escolha arbitrariamente o tenant de uma operação normal.

---

### 13.2 Segunda Barreira - Persistência

A camada de persistência aplica explicitamente o tenant às operações tenant-scoped.

Assim, mesmo que uma camada superior possua um erro lógico, a persistência continua exigindo o contexto apropriado para localizar os dados.

---

### 13.3 Objetivo da Redundância

O objetivo dessa abordagem é reduzir o risco de que uma única falha de implementação resulte diretamente em exposição cruzada de dados.

Por exemplo:

```text
Authentication Error
        │
        ▼
Tenant Context
        │
        ▼
Repository Filter
        │
        ▼
      Block
```

ou:

```text
Application Logic Error
        │
        ▼
Tenant-scoped Repository
        │
        ▼
      Block
```

Essa estratégia não elimina completamente a possibilidade de bugs de isolamento, mas reduz a dependência de uma única barreira.

---

## 14. Resource Ownership

O tenant deve ser tratado como parte da propriedade lógica dos recursos tenant-scoped.

Por exemplo:

```text
Product
│
├── uuid
├── tenant_id
├── name
└── ...
```

O UUID identifica a entidade publicamente, mas não substitui a necessidade de validar seu pertencimento ao tenant.

Isso significa que conhecer o UUID de um recurso não deve ser suficiente para acessá-lo.

Por exemplo:

```text
Tenant A
    │
    └── GET /products/{uuid-of-product-B}
                         │
                         ▼
                  Tenant validation
                         │
                         ▼
                     Not Found
```

Dependendo das convenções específicas da API, recursos fora do contexto autorizado podem ser tratados como inexistentes para o usuário.

O princípio arquitetural é:

> Identidade do recurso não substitui validação de ownership.

---

## 15. UUID e Multi-Tenancy

O Exactum utiliza identificadores públicos baseados em UUID para entidades expostas pela API.

Isso possui benefícios relacionados à exposição de identificadores, mas UUID não constitui mecanismo de isolamento de tenant.

Por exemplo:

```text
UUID
  ≠
Authorization
  ≠
Tenant Isolation
```

Um atacante que descubra ou obtenha o UUID de um recurso pertencente a outro tenant ainda não deve conseguir acessá-lo.

O isolamento continua dependendo de:

- autenticação;
- autorização;
- tenant context;
- ownership;
- filtros de persistência.

Portanto, UUID deve ser entendido como uma estratégia de identificação pública, e não como uma barreira de segurança.

---

## 16. Database Model

O banco PostgreSQL é compartilhado entre os tenants.

Conceitualmente:

```text
PostgreSQL
│
├── users
├── roles
├── permissions
├── products
├── sales
├── ...
│
└── tenant-scoped records
```

As entidades tenant-scoped possuem uma relação lógica com o tenant ao qual pertencem.

Por exemplo:

```text
Tenant
  │
  ├── User
  ├── Product
  ├── Sale
  └── Audit Log
```

Essa relação permite que as operações de leitura e escrita sejam delimitadas pelo tenant.

---

## 17. Integridade de Dados

O isolamento lógico não deve ser tratado apenas como uma preocupação de autorização.

Ele também é uma preocupação de integridade de dados.

Uma operação de escrita deve garantir que:

```text
Resource Tenant
       =
Current Tenant Context
```

Por exemplo, uma operação de atualização não deve permitir que um usuário altere uma entidade pertencente a outro tenant apenas fornecendo seu identificador.

O mesmo princípio vale para:

- criação;
- leitura;
- atualização;
- exclusão;
- relacionamentos;
- operações compostas.

---

## 18. Operações de Leitura

Operações de leitura tenant-scoped devem respeitar o contexto atual.

Exemplo conceitual:

```text
Request
   │
   ▼
Tenant A
   │
   ▼
GET /products
   │
   ▼
Repository
   │
   ▼
WHERE tenant_id = A
```

O resultado deve conter apenas recursos pertencentes ao Tenant A.

```text
Tenant A
├── Product A1
├── Product A2
└── Product A3
```

Dados do Tenant B não devem aparecer na resposta.

---

## 19. Operações de Escrita

Operações de criação devem associar o novo recurso ao contexto correto.

Conceitualmente:

```text
POST /products
       │
       ▼
Tenant Context = A
       │
       ▼
Create Product
       │
       ▼
tenant_id = A
```

O tenant não deve depender exclusivamente de um valor arbitrário enviado pelo cliente.

O contexto da requisição deve determinar a propriedade do novo recurso.

---

## 20. Atualização e Exclusão

Operações de atualização e exclusão devem validar simultaneamente:

```text
Resource Exists
      +
Resource Belongs to Tenant
      +
User Has Permission
      =
Operation Allowed
```

Por exemplo:

```sql
UPDATE product
SET name = ...
WHERE uuid = :uuid
  AND tenant_id = :tenant_id;
```

O objetivo é impedir que uma entidade de outro tenant seja modificada simplesmente porque seu identificador é conhecido.

---

## 21. Relacionamentos entre Entidades

Relacionamentos entre entidades tenant-scoped também precisam respeitar a fronteira de tenancy.

Por exemplo:

```text
Tenant A
│
├── Product A
└── Sale A
       │
       └── Product A
```

Uma venda pertencente ao Tenant A não deve ser associada arbitrariamente a um produto pertencente ao Tenant B.

Portanto, operações compostas precisam considerar não apenas a existência das entidades, mas também seu pertencimento ao mesmo contexto de tenancy.

Conceitualmente:

```text
Sale Tenant
     =
Product Tenant
     =
Current Tenant
```

---

## 22. Auditoria e Tenant Isolation

Logs de auditoria são tenant-scoped quando representam atividade realizada dentro de um tenant.

Um registro de auditoria deve preservar o contexto necessário para identificar:

```text
Quem?
  → user_uuid

Qual tenant?
  → tenant_uuid

O que aconteceu?
  → event

Qual entidade?
  → entity

Qual contexto?
  → payload

Quando?
  → created_at
```

Isso permite reconstruir a atividade dentro da fronteira correta.

Eventos administrativos de plataforma, por outro lado, podem operar em um contexto superior ao tenant.

Essa distinção é importante para evitar misturar:

```text
Tenant Audit
```

com:

```text
Platform Event
```

---

## 23. Observabilidade e Tenant Context

O tenant também faz parte do contexto operacional das requisições.

Quando aplicável, os logs estruturados podem carregar informações como:

- request ID;
- user ID;
- tenant ID;
- super-admin context;
- método HTTP;
- path;
- status;
- duração;
- IP;
- user agent.

Conceitualmente:

```text
Request
│
├── request_id
├── user_id
├── tenant_id
├── method
├── path
├── status
└── duration
```

Isso permite correlacionar eventos operacionais com o contexto em que ocorreram.

Entretanto, dados de tenant presentes em logs devem ser tratados como informação potencialmente sensível e não devem ser utilizados indiscriminadamente
como substituto da auditoria.

---

## 24. Frontend e Multi-Tenancy

O frontend React possui conhecimento do contexto do usuário para fins de experiência de uso.

Ele pode utilizar informações de tenancy para:

- exibir dados da organização;
- controlar navegação;
- apresentar funcionalidades disponíveis;
- adaptar componentes;
- ocultar recursos não autorizados.

Entretanto:

> O frontend não é uma fronteira de segurança.

O frontend não deve ser considerado responsável por impedir acesso cruzado entre tenants.

Mesmo que uma interface esconda determinada funcionalidade, um cliente pode realizar requisições diretamente contra a API.

Por isso:

```text
Frontend
   │
   ▼
UX / Presentation
```

enquanto:

```text
Backend
   │
   ├── Authentication
   ├── Authorization
   ├── Tenant Context
   └── Tenant Isolation
```

constitui a verdadeira fronteira de segurança.

---

## 25. Fluxo Completo de uma Requisição Tenant-Scoped

```text
Uma requisição típica pode ser representada da seguinte maneira:

                         HTTP Request
                              │
                              ▼
                     Authentication
                              │
                              ▼
                       User Identity
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
                    Tenant-scoped Query
                              │
                              ▼
                         PostgreSQL
                              │
                              ▼
                         Response
```

Cada etapa possui uma responsabilidade específica.

---

## 26. Responsabilidades por Camada

### Authentication

Responsável por estabelecer a identidade autenticada da requisição.

Não é responsável, isoladamente, por garantir o isolamento dos dados.

---

### Tenant Context

Responsável por estabelecer o contexto organizacional em que a operação está ocorrendo.

---

### Authorization

Responsável por determinar se o usuário possui capacidade para executar determinada operação dentro daquele contexto.

---

### Application Layer

Responsável por coordenar o caso de uso sem permitir que a operação ignore as fronteiras estabelecidas.

---

### Repository

Responsável por executar operações de persistência dentro do escopo de tenancy aplicável.

---

### Database

Responsável pela persistência e integridade dos dados.

No modelo atual, o PostgreSQL não constitui sozinho a fronteira completa de isolamento entre tenants.

---

## 27. O que o Multi-Tenancy Não Significa

A arquitetura atual não deve ser interpretada como:

**Um banco por tenant**

Não existe atualmente um banco PostgreSQL independente para cada organização.

**Um schema por tenant**

Os tenants não possuem atualmente schemas PostgreSQL independentes.

**Isolamento físico**

A infraestrutura é compartilhada.

**Segurança através de UUID**

UUID não substitui autorização ou tenant isolation.

**Segurança através do frontend**

O frontend não é considerado uma fronteira de segurança.

**Isolamento através de um único middleware**

O contexto de tenant é uma parte importante da arquitetura, mas a persistência também aplica escopo explícito.

---

## 28. Vantagens do Modelo Atual

O modelo compartilhado possui algumas vantagens importantes para o estágio atual do Exactum.

**Simplicidade Operacional**

Uma única infraestrutura facilita:

- deploy;
- migrations;
- backups;
- monitoramento;
- manutenção;
- desenvolvimento.

**Eficiência de Recursos**

A infraestrutura pode ser compartilhada entre múltiplos tenants.

**Evolução Incremental**

O sistema pode crescer sem exigir imediatamente uma estratégia de provisionamento independente para cada cliente.

**Menor Complexidade Inicial**

Comparado a arquiteturas com banco ou infraestrutura dedicada por tenant, o modelo atual possui menor complexidade operacional.

---

## 29. Trade-offs

O modelo também possui limitações.

**Maior Responsabilidade da Aplicação**

Como os dados são compartilhados, a aplicação precisa manter rigorosamente os filtros de tenancy.

**Risco de Bugs de Isolamento**

Um erro em uma query ou relacionamento pode resultar em acesso indevido se as barreiras defensivas não forem corretamente aplicadas.

**Escalabilidade**

Um único banco compartilhado pode eventualmente se tornar um gargalo conforme o número de tenants e o volume de dados aumentam.

**Blast Radius**

Um problema grave no banco compartilhado pode afetar múltiplos tenants simultaneamente.

**Operações de Tenant Específico**

Operações como restauração ou exportação de dados de um único tenant podem exigir mecanismos específicos no futuro.

---

## 30. Segurança por Defesa em Profundidade

O modelo de multi-tenancy do Exactum segue o princípio de defense in depth.

A segurança não depende de uma única verificação.

Conceitualmente:

```text
                 Security Boundary
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
 Authentication   Authorization   Tenant Isolation
        │               │                │
        └───────────────┼────────────────┘
                        │
                        ▼
                    Repository
                        │
                        ▼
                     Database
```

Cada camada reduz a possibilidade de uma falha isolada resultar diretamente em exposição de dados.

---

## 31. Threat Model Simplificado

A arquitetura de tenancy considera principalmente os seguintes riscos:

### Acesso direto a recurso de outro tenant

Exemplo:

```text
GET /products/{uuid-of-other-tenant}
```

Mitigação:

- tenant context;
- authorization;
- resource ownership;
- tenant-scoped repository.

---

### Manipulação de identificadores

Um usuário pode tentar alterar UUIDs ou outros identificadores enviados à API.

Mitigação:

- identificadores não são considerados autorização;
- ownership é validado no backend;
- queries são tenant-scoped.

---

### Manipulação do frontend

Um usuário pode ignorar completamente as restrições da interface e enviar requests diretamente.

Mitigação:

- backend como autoridade de segurança;
- autorização server-side;
- tenant context server-side.

---

### Falha de aplicação

Uma regra de negócio pode eventualmente conter um bug.

Mitigação:

- escopo explícito no repositório;
- separação de responsabilidades;
- testes automatizados;
- revisão de queries;
- documentação arquitetural.

---

## 32. Testes de Isolamento

O isolamento de tenant deve ser tratado como comportamento testável.

Testes importantes incluem cenários como:

```text
Tenant A
    │
    ├── pode acessar seus próprios recursos
    │
    └── não pode acessar recursos do Tenant B
```

Por exemplo:

```text
Given:
    User A belongs to Tenant A

And:
    Product X belongs to Tenant B

When:
    User A requests Product X

Then:
    Access must be denied
```

Também devem ser considerados testes para:

- listagens;
- criação;
- atualização;
- exclusão;
- relacionamentos;
- operações compostas;
- auditoria;
- impersonate;
- usuários bloqueados;
- tenants suspensos.

O objetivo não é testar apenas a existência do filtro, mas o comportamento de isolamento como um todo.

---

## 33. Tenant Lifecycle

O tenant possui um ciclo de vida administrado pela plataforma.

Conceitualmente:

```text
                 Created
                    │
                    ▼
                  Active
                 /     \
                /       \
               ▼         ▼
          Suspended    Other State
               │
               ▼
            Reactivated
               │
               ▼
             Active
```

A suspensão de um tenant possui impacto sobre suas sessões e operações.

Um tenant suspenso não deve continuar operando normalmente na plataforma.

A gestão desse ciclo de vida é uma preocupação de plataforma, não apenas de autorização de usuário.

---

## 34. Sessões e Tenant Suspension

A gestão de sessão via Redis permite que eventos relacionados ao tenant tenham impacto sobre sessões associadas.

Por exemplo:

```text
Tenant Suspended
       │
       ▼
Invalidate / Block Sessions
       │
       ▼
Users Cannot Continue
```

Isso reduz a possibilidade de que uma sessão previamente autenticada continue sendo utilizada depois de uma alteração administrativa no estado do tenant.

---

## 35. Evolução Arquitetural

O modelo atual de multi-tenancy funciona sobre uma arquitetura predominantemente orientada a camadas.

A partir da evolução arquitetural prevista para a v0.3.x, o conceito de tenancy deverá continuar existindo como uma preocupação transversal, mas com fronteiras mais explícitas entre:

- domínio;
- aplicação;
- infraestrutura;
- autenticação;
- autorização;
- persistência.

A intenção não é transformar tenancy em uma regra pertencente a todos os domínios, mas fornecer mecanismos arquiteturais que permitam que cada caso de uso respeite explicitamente seu contexto.

Conceitualmente:

```text
                  Domain
                    │
                    ▼
              Application
                    │
             Tenant Context
                    │
                    ▼
             Infrastructure
                    │
                    ▼
                Database
```

---

## 36. Evolução para Domain-Oriented Architecture

À medida que o Exactum evoluir para fronteiras de domínio mais fortes, o conceito de tenant deverá continuar sendo tratado como uma preocupação arquitetural transversal.

Os domínios de negócio continuarão sendo responsáveis por suas próprias regras, enquanto mecanismos de contexto e autorização fornecerão as informações necessárias para que essas regras sejam executadas dentro do tenant correto.

A direção arquitetural é evitar que regras de tenancy sejam espalhadas indiscriminadamente pelo código de domínio.

Em vez disso:

```text
Domain Logic
     │
     ▼
Application Context
     │
     ├── Identity
     ├── Tenant
     └── Authorization
```

deve fornecer um contexto explícito para os casos de uso.

---

## 37. Futuras Estratégias de Isolamento

O modelo atual não impede uma futura evolução da estratégia de isolamento.

Dependendo do crescimento do Exactum, diferentes estratégias podem ser consideradas.

### Shared Database / Shared Schema

Modelo atual:

```text
Database
│
├── Tenant A
├── Tenant B
└── Tenant C
```

Vantagens:

- menor complexidade;
- menor custo;
- operação simplificada.

---

### Shared Database / Separate Schema

Possível evolução:

```text
Database
│
├── tenant_a
├── tenant_b
└── tenant_c
```

Pode oferecer maior separação lógica, mas aumenta a complexidade operacional.

---

### Database per Tenant

Outra possibilidade:

```text
Database A
Database B
Database C
```

Pode oferecer maior isolamento e facilitar determinados requisitos de compliance ou escala, mas possui custo operacional significativamente maior.

---

## 38. Critérios para uma Futura Migração

Uma mudança na estratégia de isolamento não deve ser realizada apenas por preferência arquitetural.

Possíveis gatilhos incluem:

- crescimento significativo do número de tenants;
- crescimento do volume de dados;
- requisitos de compliance;
- requisitos de residência de dados;
- clientes enterprise;
- necessidade de backups independentes;
- necessidade de restauração por tenant;
- requisitos de performance;
- isolamento operacional mais forte.

Enquanto esses requisitos não justificarem maior complexidade, o modelo compartilhado permanece adequado ao estágio atual do Exactum.

---

## 39. Princípios Arquiteturais

A arquitetura de multi-tenancy do Exactum segue alguns princípios fundamentais:

**1. Tenant é uma fronteira de dados**

Dados de negócio pertencem a um tenant específico.

**2. O cliente não define sua própria autoridade**

O frontend não pode determinar sozinho qual tenant uma operação deve acessar.

**3. Identificadores não são autorização**

Conhecer um UUID não concede acesso ao recurso.

**4. Isolamento é responsabilidade do backend**

A API é a autoridade de segurança.

**5. Persistência deve respeitar tenancy**

Queries tenant-scoped devem carregar explicitamente o contexto correto.

**6. Segurança deve ser defensiva**

Múltiplas camadas devem reduzir o impacto de falhas individuais.

**7. Platform e tenant são contextos diferentes**

Operações administrativas globais não devem ser confundidas com operações comuns de tenant.

**8. Tenancy deve permanecer evolutivo**

A estratégia atual não deve impedir uma futura evolução para modelos de isolamento mais fortes.

---

## 40. Resumo Arquitetural

O modelo atual de multi-tenancy do Exactum pode ser resumido da seguinte forma:

```text
                         Request
                            │
                            ▼
                    Authentication
                            │
                            ▼
                     User Identity
                            │
                            ▼
                     Tenant Context
                            │
                            ▼
                      Authorization
                            │
                            ▼
                   Application Layer
                            │
                            ▼
                       Repository
                            │
                            ▼
                 Tenant-scoped Query
                            │
                            ▼
                       PostgreSQL
```

O Exactum utiliza atualmente shared application + shared database + logical tenant isolation.

A segurança da fronteira de tenancy não depende de um único mecanismo. Ela é construída através da combinação de:

- identidade autenticada;
- contexto de tenant;
- autorização;
- ownership dos recursos;
- filtros explícitos na persistência;
- integridade dos relacionamentos;
- auditoria;
- testes automatizados.

Essa abordagem fornece uma base adequada para o estágio atual do produto, mantendo a possibilidade de evolução futura para estratégias de isolamento mais fortes caso requisitos de escala, segurança, compliance ou operação venham a justificá-las.

---

## Referências

- [Visão Geral da Arquitetura](./overview.md)
- [Contexto do Sistema](./system-context.md)
- [Arquitetura da Aplicação](./application-architecture.md)
- [Fronteiras de Domínio](./domain-boundaries.md)
- [Autenticação](../security/authentication.md)
- [Autorização & RBAC](../security/authorization.md)
- [Gestão de Sessão](../security/session-management.md)
- [Isolamento de Tenant](../security/tenant-isolation.md)
- [Threat Model](../security/threat-model.md)
- [Logs de Auditoria](../observability/audit-logging.md)
