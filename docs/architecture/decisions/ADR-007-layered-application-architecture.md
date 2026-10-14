# ADR-007 — Layered Application Architecture

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Architecture
- **Related Areas:** Architecture, Application Design, API, Database, Testing
- **Supersedes:** None
- **Superseded By:** None

---

# 1. Contexto

O Exactum é uma aplicação web SaaS multi-tenant desenvolvida como um sistema monolítico modular, com responsabilidades distribuídas entre diferentes camadas da aplicação.

À medida que o sistema evoluiu, responsabilidades relacionadas a HTTP, autenticação, autorização, regras de aplicação, persistência, observabilidade e domínio começaram a aumentar em quantidade e complexidade.

Uma organização baseada predominantemente em endpoints ou controllers tende a concentrar responsabilidades excessivas em uma única camada. Por outro lado, uma adoção prematura de arquiteturas mais sofisticadas, como uma implementação completa de Domain-Driven Design, poderia introduzir abstrações e complexidade superiores às necessidades atuais do sistema.

Foi necessário, portanto, estabelecer uma arquitetura que:

- mantenha responsabilidades claramente separadas;
- facilite testes;
- reduza o acoplamento entre HTTP e regras de aplicação;
- encapsule o acesso à persistência;
- preserve os limites dos domínios;
- permita evolução incremental;
- seja compatível com o estágio atual do Exactum;
- permita a futura adoção de limites de domínio mais fortes.

A decisão adotada foi utilizar uma **Layered Application Architecture**, organizada em torno de responsabilidades explícitas e complementada por uma organização orientada a domínios.

Essa decisão também estabelece uma direção arquitetural para reduzir progressivamente o acoplamento entre o framework Flask e a lógica da aplicação, sem exigir uma reescrita imediata da aplicação.

---

# 2. Decisão

O Exactum adota uma **Layered Application Architecture**, organizada conceitualmente pelo seguinte fluxo:

```text
HTTP Request
     │
     ▼
Routes / Controllers
     │
     ▼
Application Services
     │
     ▼
Repositories
     │
     ▼
Persistence / Database
```

As principais responsabilidades são distribuídas da seguinte forma:

| Camada               | Responsabilidade principal                            |
| -------------------- | ----------------------------------------------------- |
| Routes / Controllers | Interface HTTP e coordenação da entrada da requisição |
| Application Services | Orquestração de casos de uso e regras de aplicação    |
| Repositories         | Abstração e execução do acesso à persistência         |
| Persistence / Models | Representação e interação com os dados persistidos    |
| Database             | Armazenamento persistente                             |

Além dessas camadas, existem componentes transversais responsáveis por preocupações que atravessam diferentes partes da aplicação, como:

- Authentication;
- Authorization;
- Tenant Context;
- Error Handling;
- Observability;
- Correlation;
- Configuration;
- Security Controls.

A organização física do código também utiliza uma abordagem **domain-oriented**, agrupando funcionalidades relacionadas a conceitos do negócio.

Essa organização, entretanto, não significa que o Exactum seja considerado atualmente uma implementação completa de **Domain-Driven Design**.

A arquitetura adotada pode ser descrita como:

> **Layered Application Architecture with domain-oriented organization and DDD-inspired evolution.**

---

# 3. Estrutura Arquitetural

A arquitetura pode ser representada da seguinte forma:

```text
┌──────────────────────────────────────────────────────────────┐
│                         HTTP / API                            │
│                                                              │
│  Routes / Controllers / Schemas / Request Validation         │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                              │
│  Application Services / Use Cases / Application Rules       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     Persistence Layer                        │
│                                                              │
│  Repositories / Queries / Persistence Access                │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         Database                              │
│                                                              │
│                     PostgreSQL                                │
└──────────────────────────────────────────────────────────────┘
```

As preocupações transversais atuam ao redor dessas camadas:

```text
                 ┌─────────────────────────┐
                 │     Authentication      │
                 │     Authorization       │
                 │     Tenant Context      │
                 │     Error Handling      │
                 │     Observability       │
                 │     Correlation         │
                 └────────────┬────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │              Application                │
        │                                         │
        │ HTTP → Services → Repositories → DB    │
        └─────────────────────────────────────────┘
```

Essas preocupações não representam necessariamente novas camadas horizontais. Elas são tratadas como responsabilidades que atravessam o ciclo de execução da aplicação.

---

# 4. Routes e Controllers

Routes e Controllers representam a fronteira HTTP da aplicação.

Suas responsabilidades incluem:

- receber requisições HTTP;
- extrair dados da requisição;
- executar ou acionar validações;
- utilizar Schemas para representar contratos de entrada e saída;
- obter o contexto de autenticação;
- encaminhar a operação para o Application Service apropriado;
- traduzir resultados da aplicação para respostas HTTP;
- determinar status codes adequados;
- tratar preocupações específicas da API.

Controllers não devem se tornar o principal local de implementação das regras de negócio.

Conceitualmente, um Controller deve realizar algo próximo de:

```text
HTTP Request
    ↓
Validate Input
    ↓
Extract Authentication Context
    ↓
Call Application Service
    ↓
Translate Result
    ↓
HTTP Response
```

Em contraste, deve-se evitar progressivamente uma estrutura em que o Controller concentre:

```text
Controller
 ├── HTTP
 ├── Business Rules
 ├── Database Queries
 ├── Authorization
 ├── Stock Calculations
 ├── Transactions
 ├── Domain Decisions
 └── Response Formatting
```

Esse modelo tende a produzir Controllers grandes, difíceis de testar e excessivamente acoplados à infraestrutura HTTP.

---

# 5. Application Services

Os **Application Services** representam a camada de orquestração dos casos de uso da aplicação.

São responsáveis por coordenar operações que podem envolver:

- regras de aplicação;
- validações relacionadas ao caso de uso;
- obtenção de entidades;
- chamadas a Repositories;
- coordenação de múltiplas operações;
- controle de fluxos transacionais;
- interação com componentes da aplicação;
- disparo de eventos quando aplicável;
- produção de resultados para a camada HTTP.

Um Application Service deve representar uma operação significativa da aplicação, e não simplesmente funcionar como uma coleção genérica de funções auxiliares.

Conceitualmente:

```text
Application Service
       │
       ├── Obtém dados necessários
       ├── Valida condições da operação
       ├── Executa o caso de uso
       ├── Coordena persistência
       └── Produz o resultado
```

A existência dessa camada cria uma fronteira explícita entre o transporte HTTP e a execução dos casos de uso.

Isso permite que uma mesma operação da aplicação não precise necessariamente ser implementada diretamente dentro de um Controller.

---

# 6. Acoplamento com o Framework

Um dos objetivos arquiteturais desta decisão é impedir que Flask se torne o princípio organizador de toda a aplicação.

Flask é o framework utilizado pelo Exactum para a camada web, mas a arquitetura não deve ser definida como:

```text
Flask
 └── Everything
```

O objetivo é que Flask forneça principalmente os mecanismos necessários à fronteira da aplicação:

```text
HTTP / Flask
      │
      ▼
Application
      │
      ▼
Persistence
```

e não que a lógica de aplicação dependa indiscriminadamente de:

```text
request
g
session
Flask globals
HTTP objects
framework-specific state
```

A implementação atual ainda possui pontos de acoplamento com o framework.

Portanto, esta ADR **não afirma que a aplicação já é completamente independente do Flask**.

Ela estabelece uma direção arquitetural:

> Responsabilidades específicas do framework devem permanecer preferencialmente nas bordas da aplicação, enquanto a lógica de aplicação deve depender progressivamente de interfaces, parâmetros e conceitos explícitos da própria aplicação.

Essa evolução será realizada de maneira incremental.

---

# 7. Repositories

Os **Repositories** encapsulam o acesso à persistência.

Seu objetivo é evitar que Application Services e Controllers precisem conhecer diretamente todos os detalhes de acesso ao banco de dados.

Repositories podem ser responsáveis por:

- recuperar entidades;
- persistir entidades;
- atualizar dados;
- verificar existência;
- executar queries;
- aplicar filtros;
- realizar operações de Soft Delete;
- aplicar Tenant Isolation na consulta;
- encapsular detalhes específicos da persistência.

Conceitualmente:

```text
Application Service
        │
        ▼
    Repository
        │
        ▼
    PostgreSQL
```

A camada de Repository também representa um ponto importante para a aplicação explícita de filtros relacionados ao tenant.

Por exemplo:

```text
ProductRepository
        │
        ├── tenant_uuid = current tenant
        │
        └── product_uuid = requested resource
```

Isso contribui para a estratégia de defesa em profundidade adotada pelo Exactum.

Entretanto, Repository não substitui Authorization.

Authentication, Authorization e Tenant Isolation continuam sendo responsabilidades distintas.

---

# 8. Persistence e Database

A camada de persistência representa a implementação orientada ao armazenamento dos dados da aplicação.

O Exactum utiliza PostgreSQL como seu principal banco de dados persistente.

Essa camada envolve conceitos como:

- SQLAlchemy Models;
- relacionamentos;
- queries;
- migrations;
- constraints;
- indexes;
- Soft Delete;
- transações.

O PostgreSQL permanece como fonte persistente de verdade para os dados de negócio.

Redis possui uma função diferente na arquitetura.

Redis é utilizado para responsabilidades como:

- Session Management;
- Refresh Token state;
- revogação;
- estado temporário da plataforma;
- futuras estratégias de cache;
- futura infraestrutura assíncrona.

Portanto:

```text
PostgreSQL
    ↓
Persistent Business Data

Redis
    ↓
Application / Operational State
```

Essa distinção evita tratar Redis como substituto do banco persistente principal.

---

# 9. Organização Orientada a Domínios

Além da separação em camadas, o código do Exactum é organizado de maneira orientada a domínios.

Conceitualmente:

```text
app/
├── core/
├── domains/
│   ├── auth/
│   ├── users/
│   ├── tenants/
│   ├── products/
│   ├── sales/
│   └── ...
└── infra/
    └── observability/
```

Essa organização reduz a tendência de concentrar todo o sistema em estruturas puramente técnicas como:

```text
controllers/
services/
repositories/
models/
```

contendo funcionalidades de todos os domínios do sistema.

Uma organização orientada a domínios permite manter próximas as responsabilidades relacionadas a um mesmo conceito de negócio.

Por exemplo:

```text
domains/
└── products/
    ├── routes
    ├── services
    ├── repositories
    ├── schemas
    └── models
```

Isso não significa que cada domínio seja atualmente um **Bounded Context** completamente isolado.

Os limites ainda estão em evolução.

---

# 10. Limites de Domínio Atuais

O Exactum possui atualmente domínios relacionados a conceitos como:

- Authentication;
- Users;
- Tenants;
- Products;
- Sales.

Entretanto, alguns conceitos ainda estão agrupados dentro desses domínios.

Por exemplo, responsabilidades relacionadas a Inventory ainda estão associadas principalmente às operações de Products e Sales.

Da mesma forma, Reporting e Analytics ainda não constituem um contexto completamente independente.

Isso representa o estado atual do sistema e não deve ser interpretado como uma definição da arquitetura futura.

Conforme a complexidade do sistema aumente, algumas responsabilidades poderão ser extraídas.

Conceitualmente:

```text
Products
Sales
   │
   ├──────────────► Inventory
   │
   └──────────────► Reporting
```

A extração deve ocorrer quando houver uma justificativa arquitetural real, como:

- aumento significativo de complexidade;
- regras próprias;
- necessidade de autonomia;
- diferentes ciclos de evolução;
- necessidade de isolamento;
- crescimento das responsabilidades.

A decisão, portanto, é evitar a criação prematura de abstrações apenas para seguir um padrão arquitetural.

---

# 11. Direção das Dependências

A direção arquitetural desejada é:

```text
HTTP
  ↓
Application
  ↓
Persistence
```

Controllers não devem depender diretamente de detalhes de persistência quando uma Application Service puder representar adequadamente o caso de uso.

Da mesma forma, a lógica de aplicação não deve depender desnecessariamente de objetos específicos do HTTP.

A relação conceitual é:

```text
Routes / Controllers
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

O objetivo é evitar dependências inversas desnecessárias, como componentes de persistência precisando conhecer detalhes específicos da camada HTTP.

Essa direção também facilita futuras mudanças de infraestrutura.

---

# 12. Application Logic e Domain Logic

A arquitetura diferencia progressivamente **Application Logic** de **Domain Logic**.

### Application Logic

Está relacionada à execução dos casos de uso:

- orquestração;
- workflows;
- coordenação de componentes;
- transações;
- interação entre domínios e infraestrutura.

### Domain Logic

Está relacionada ao comportamento e às regras próprias do domínio:

- invariantes;
- regras de negócio;
- decisões específicas do domínio;
- transições de estado;
- conceitos próprios do negócio.

Nem toda regra precisa ser imediatamente transformada em um objeto de domínio.

A arquitetura permite que essa separação se torne mais forte conforme a complexidade do domínio aumente.

Essa decisão evita tanto:

- colocar todas as regras nos Controllers;
- quanto criar abstrações de domínio sem necessidade real.

---

# 13. Authentication e Authorization

Authentication e Authorization são preocupações transversais da aplicação, mas não devem ser confundidas com as camadas de execução do caso de uso.

Authentication responde:

> Quem está realizando a requisição?

Authorization responde:

> O que essa identidade pode realizar?

Tenant Isolation responde:

> Em qual contexto de tenant essa operação pode ocorrer?

O fluxo conceitual é:

```text
Authentication
      ↓
Identity / Context
      ↓
Authorization
      ↓
Application Use Case
      ↓
Tenant-aware Persistence
```

O frontend pode refletir as permissões para melhorar a experiência de uso, mas não constitui uma fronteira de segurança.

A autoridade permanece no backend.

Essa decisão está diretamente relacionada aos ADRs de:

- Multi-Tenancy;
- Authentication;
- Session Management;
- Impersonation.

---

# 14. Tenant Context

O Tenant Context é estabelecido durante o ciclo de vida da requisição.

Conceitualmente:

```text
HTTP Request
     │
     ▼
Authentication
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
     ▼
Tenant-filtered Persistence
```

O cliente não deve determinar livremente o tenant utilizado para executar uma operação protegida.

O contexto de tenant é derivado de informações confiáveis de autenticação e sessão e posteriormente aplicado pelo backend.

Os Repositories também aplicam filtros explícitos de tenant como mecanismo adicional de defesa.

Isso segue o princípio:

> **Tenants compartilham infraestrutura, mas nunca compartilham contexto de autorização.**

---

# 15. Error Handling

Error Handling é tratado como uma preocupação transversal.

A aplicação possui mecanismos centralizados para transformar erros internos em respostas consistentes da API.

Conceitualmente:

```text
Application Error
       │
       ▼
Exception Handling
       │
       ▼
API Error Representation
       │
       ▼
HTTP Response
```

Isso reduz a necessidade de cada Controller implementar individualmente a mesma lógica de tratamento de erros.

Também permite separar:

- exceções internas;
- erros de domínio/aplicação;
- representação HTTP do erro.

Erros de segurança não devem expor informações internas desnecessárias sobre a implementação.

---

# 16. Observability

Observability também é tratada como uma preocupação transversal.

A arquitetura suporta mecanismos como:

- Structured Logging;
- Correlation ID;
- Platform Events;
- Audit Logging;
- Request Context;
- diagnóstico operacional.

O objetivo é permitir rastrear uma operação através das diferentes camadas sem transferir para cada componente toda a responsabilidade pela implementação da infraestrutura de observabilidade.

Conceitualmente:

```text
Request
  │
  ├── Correlation ID
  ├── Authentication Context
  ├── Tenant Context
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository
  │
  ▼
Database
```

Dessa maneira, informações de diferentes partes do Request Lifecycle podem ser correlacionadas.

---

# 17. Transaction Boundaries

Application Services representam um local apropriado para coordenar operações que envolvem múltiplas operações de persistência e que devem representar um único caso de uso.

Por exemplo:

```text
Create Sale
    │
    ├── validar venda
    ├── validar produtos
    ├── atualizar estoque
    ├── persistir venda
    └── registrar eventos relevantes
```

O mecanismo específico de transação continua sendo uma preocupação de implementação.

O princípio arquitetural é que os limites transacionais devem estar associados a operações significativas da aplicação, e não necessariamente a cada método individual de Repository.

À medida que o sistema evoluir, operações transacionais mais complexas poderão exigir decisões arquiteturais próprias.

---

# 18. Implicações para Testing

A arquitetura permite organizar os testes de acordo com as responsabilidades de cada camada.

Uma estratégia simplificada é:

```text
Unit Tests
    │
    ├── Application Services
    ├── Domain Logic
    └── Application Components

Integration Tests
    │
    ├── Repositories
    ├── PostgreSQL
    └── Redis quando aplicável

API Tests
    │
    ├── Routes
    ├── Authentication
    ├── Authorization
    └── API Contracts
```

Essa separação permite localizar melhor as falhas.

Por exemplo:

- uma regra de negócio pode ser testada sem iniciar toda a camada HTTP;
- um Repository pode ser testado diretamente contra PostgreSQL;
- Authentication pode ser validada por testes de API;
- um Request Lifecycle completo pode ser validado por testes de integração.

A arquitetura, portanto, favorece uma estratégia de testes em diferentes níveis.

---

# 19. Alternativas Consideradas

## 19.1 Controllers com Business Logic

Uma alternativa seria concentrar a maior parte da lógica diretamente nos Controllers:

```text
Controller
 ├── validation
 ├── business rules
 ├── database access
 ├── authorization
 └── response
```

### Vantagens

- menor complexidade inicial;
- menos abstrações;
- implementação rápida para aplicações pequenas.

### Desvantagens

- Controllers tendem a crescer excessivamente;
- regras de negócio ficam acopladas ao HTTP;
- testes ficam mais complexos;
- reutilização das operações torna-se mais difícil;
- persistência e API ficam misturadas.

Essa abordagem não foi adotada como arquitetura principal.

---

# 20. MVC Tradicional

Outra possibilidade seria utilizar um modelo tradicional de **Model-View-Controller**:

```text
Model
View
Controller
```

MVC continua sendo um conceito válido e alguns elementos do Exactum possuem responsabilidades semelhantes às de um MVC.

Entretanto, o Exactum possui uma arquitetura de API separada do frontend React.

Por isso, MVC tradicional não representa de maneira suficientemente precisa a separação entre:

- HTTP;
- Application Logic;
- Persistence;
- API Contract;
- Domain Organization.

A arquitetura adotada utiliza conceitos compatíveis com MVC quando apropriado, mas não utiliza MVC como seu modelo arquitetural principal.

---

# 21. Hexagonal Architecture

A **Hexagonal Architecture**, também conhecida como **Ports and Adapters**, fornece uma separação mais explícita entre o núcleo da aplicação e suas interfaces externas.

Conceitualmente:

```text
        HTTP Adapter
             │
             ▼
      ┌─────────────┐
      │ Application │
      │    Core     │
      └─────────────┘
             ▲
             │
       Database Adapter
```

### Vantagens

- maior Dependency Inversion;
- menor dependência do framework;
- fronteiras explícitas;
- alta testabilidade.

### Desvantagens

- maior quantidade de abstrações;
- maior complexidade inicial;
- exige disciplina na definição das interfaces;
- pode gerar abstrações desnecessárias quando aplicada mecanicamente.

O Exactum poderá incorporar princípios da Hexagonal Architecture conforme sua evolução, especialmente relacionados à redução de acoplamento e Dependency Inversion.

Entretanto, uma implementação completa dessa arquitetura não foi adotada como requisito atual.

---

# 22. Clean Architecture

A **Clean Architecture** estabelece uma separação forte entre:

- Entities;
- Use Cases;
- Interface Adapters;
- Frameworks e Infrastructure.

Ela oferece fronteiras claras e forte controle sobre a direção das dependências.

Entretanto, aplicar toda a estrutura da Clean Architecture ao Exactum neste momento poderia introduzir abstrações adicionais antes que sua necessidade fosse demonstrada pela complexidade do sistema.

A decisão foi, portanto, incorporar princípios úteis gradualmente, sem obrigar toda a aplicação a seguir uma implementação completa de Clean Architecture.

---

# 23. Domain-Driven Design Completo

Uma implementação completa de **Domain-Driven Design** poderia introduzir conceitos como:

- Entities;
- Value Objects;
- Aggregates;
- Domain Services;
- Domain Events;
- Repositories;
- Bounded Contexts;
- Ubiquitous Language.

Esses conceitos podem se tornar importantes à medida que o domínio do Exactum evolui.

Entretanto, adotá-los integralmente neste estágio poderia gerar complexidade acidental.

A decisão foi adotar uma evolução **DDD-inspired**, permitindo que os conceitos sejam introduzidos quando existir uma necessidade real.

O Exactum, portanto, não é documentado como um sistema de DDD completo.

---

# 24. Justificativa

A arquitetura escolhida representa um equilíbrio entre simplicidade e capacidade de evolução.

As principais razões são:

### 24.1 Separação de responsabilidades

HTTP, Application Logic e Persistence possuem responsabilidades distintas.

### 24.2 Testabilidade

Casos de uso podem ser testados progressivamente sem depender sempre da camada HTTP.

### 24.3 Manutenibilidade

Controllers e acesso ao banco não precisam concentrar todas as responsabilidades do sistema.

### 24.4 Evolução incremental

Novos domínios e limites mais fortes podem ser introduzidos sem exigir uma reescrita completa.

### 24.5 Complexidade apropriada

A arquitetura fornece estrutura suficiente para um SaaS em crescimento sem impor prematuramente uma implementação completa de DDD, Hexagonal Architecture ou Clean Architecture.

### 24.6 Redução progressiva do acoplamento

A arquitetura cria uma direção clara para reduzir o acoplamento entre Flask e a lógica da aplicação.

---

# 25. Consequências

## 25.1 Consequências Positivas

### Responsabilidades mais claras

Cada camada possui uma responsabilidade arquitetural definida.

### Melhor testabilidade

Diferentes responsabilidades podem ser testadas em níveis distintos.

### Controllers menos complexos

Controllers podem se concentrar em HTTP em vez de concentrar toda a lógica da aplicação.

### Persistência encapsulada

O acesso ao banco permanece concentrado nos Repositories e componentes de persistência.

### Evolução mais controlada

Novos domínios e limites podem ser introduzidos progressivamente.

### Melhor organização do código

A organização por domínio reduz o risco de transformar o projeto em uma grande coleção de componentes técnicos sem relação explícita com o negócio.

---

# 26. Trade-offs

A arquitetura também possui custos.

## 26.1 Maior quantidade de abstrações

Uma operação simples pode atravessar várias camadas:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Para operações extremamente simples, essa estrutura pode parecer mais extensa do que uma implementação direta.

## 26.2 Risco de camadas artificiais

Se as camadas forem criadas apenas por convenção, sem responsabilidades reais, a arquitetura pode se transformar em uma sequência de componentes que apenas repassam dados.

Por exemplo:

```text
Controller
    ↓
Service
    ↓
Repository
```

onde nenhum deles possui responsabilidade significativa.

A arquitetura deve, portanto, ser aplicada com base em responsabilidades reais e não por formalismo.

## 26.3 Crescimento excessivo de Application Services

Existe o risco de transformar Application Services em um local onde toda a lógica de negócio seja acumulada.

Esse risco reforça a importância da evolução gradual dos modelos de domínio.

## 26.4 Custo de evolução

Reduzir o acoplamento com Flask e fortalecer os limites dos domínios exige refatoração incremental.

Esse custo é aceito como parte da evolução arquitetural do Exactum.

---

# 27. Estado Atual

A implementação atual do Exactum segue a arquitetura em camadas descrita nesta ADR, mas seus limites ainda estão em evolução.

O estado atual pode ser representado por:

```text
HTTP / API
     │
     ▼
Routes / Controllers
     │
     ▼
Application Services
     │
     ▼
Repositories
     │
     ▼
SQLAlchemy / PostgreSQL
```

A aplicação também possui organização orientada a domínios.

Entretanto:

- alguns Application Services ainda possuem algum acoplamento com o framework;
- algumas responsabilidades ainda atravessam limites de domínio;
- nem todos os domínios possuem isolamento completo;
- nem todas as regras de negócio estão modeladas como abstrações de domínio;
- Inventory ainda não constitui um contexto independente;
- Reporting/Analytics ainda não constitui um contexto independente.

Essas características representam o estado atual da aplicação e não invalidam a decisão arquitetural.

---

# 28. Evolução Futura

A arquitetura foi deliberadamente construída para permitir evolução progressiva.

O estado atual pode ser representado como:

```text
HTTP
 │
 ▼
Controllers
 │
 ▼
Services
 │
 ▼
Repositories
 │
 ▼
PostgreSQL
```

A direção futura poderá evoluir para algo mais próximo de:

```text
HTTP
 │
 ▼
Interface / API Layer
 │
 ▼
Application Layer
 │
 ▼
Domain Boundaries
 │
 ├── Products
 ├── Sales
 ├── Inventory
 ├── Reporting
 └── ...
 │
 ▼
Infrastructure
 │
 ├── PostgreSQL
 ├── Redis
 ├── Messaging
 └── External Services
```

Possíveis evoluções incluem:

- maior Dependency Inversion;
- redução adicional do acoplamento com Flask;
- interfaces explícitas entre componentes;
- modelos de domínio mais ricos;
- utilização de Value Objects quando justificada;
- Domain Services quando apropriado;
- Domain Events;
- limites transacionais mais claros;
- extração de Inventory para um contexto próprio;
- extração de Reporting/Analytics;
- processamento assíncrono com Celery/RabbitMQ;
- fronteiras mais claras de Infrastructure;
- integração futura com Prometheus/Grafana.

Essas mudanças deverão ocorrer de acordo com a complexidade real do sistema.

O objetivo não é adicionar abstrações simplesmente para seguir uma escola arquitetural.

> **A arquitetura deve evoluir conforme o problema exigir, e não conforme a quantidade de padrões disponíveis.**

---

# 29. Princípio Arquitetural

O princípio central estabelecido por esta ADR é:

> **As preocupações de infraestrutura (framework) permanecem nas bordas; os casos de uso da aplicação mantêm-se organizados em torno de responsabilidades de negócio e limites explícitos.**

Em termos práticos:

```text
Framework
    │
    ▼
Application Boundary
    │
    ▼
Business Responsibilities
    │
    ▼
Persistence / Infrastructure
```

O framework não deve se tornar a definição da arquitetura do sistema.

Da mesma forma, a estrutura do banco de dados não deve determinar sozinha a organização da lógica de negócio.

A arquitetura deve refletir as responsabilidades da aplicação.

---

# 30. Relação com Outras Decisões

Esta ADR possui relação direta com:

- **ADR-001 — Shared Database Multi-Tenancy**
- **ADR-002 — Public UUID Identifiers**
- **ADR-003 — HttpOnly Cookie Authentication**
- **ADR-004 — Redis Session Management**
- **ADR-005 — Refresh Token Rotation**
- **ADR-006 — Impersonation Model**

Futuras decisões arquiteturais poderão complementar esta ADR ao introduzir:

- processamento assíncrono;
- messaging;
- Domain Events;
- Outbox Pattern;
- Inventory Context;
- Reporting Context;
- novas abstrações de Infrastructure;
- Dependency Inversion mais forte.

---

# 31. Documentação Relacionada

Documentos relacionados:

- `docs/architecture/overview.md`
- `docs/architecture/system-context.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/security/session-management.md`
- `docs/observability/overview.md`
- `docs/testing/strategy.md`
- `docs/api/overview.md`
- `docs/database/overview.md`

---

# 32. Resumo da Decisão

| Concern                   | Decisão                                         |
| ------------------------- | ----------------------------------------------- |
| Arquitetura principal     | Layered Application Architecture                |
| Fronteira HTTP            | Routes / Controllers                            |
| Orquestração              | Application Services                            |
| Acesso à persistência     | Repositories                                    |
| Banco principal           | PostgreSQL                                      |
| Organização do código     | Domain-oriented                                 |
| Modelagem de domínio      | Evolução incremental / DDD-inspired             |
| Acoplamento com framework | Redução progressiva                             |
| Tenant Isolation          | Defesa em profundidade                          |
| Authorization             | Backend como autoridade                         |
| Observability             | Cross-cutting concern                           |
| Testing                   | Estratégia em camadas                           |
| Evolução futura           | Limites de domínio e Infrastructure mais fortes |

---

# 33. Decisão Final

O Exactum utilizará uma **Layered Application Architecture** como sua base arquitetural atual.

A arquitetura separa responsabilidades relacionadas a HTTP, Application Logic e Persistence, enquanto organiza o código em torno dos principais domínios do sistema.

Não será adotada prematuramente uma implementação completa de Domain-Driven Design, Hexagonal Architecture ou Clean Architecture.

Princípios dessas abordagens poderão ser incorporados progressivamente quando a complexidade do sistema justificar sua utilização.

A arquitetura é, portanto, considerada uma estrutura evolutiva: suficientemente definida para estabelecer limites claros no presente, mas deliberadamente aberta para uma maior separação de domínios, Dependency Inversion e isolamento de Infrastructure no futuro.

## Princípio Arquitetural

> **As preocupações de infraestrutura (framework) permanecem nas bordas; os casos de uso da aplicação mantêm-se organizados em torno de responsabilidades de negócio e limites explícitos.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum. As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API. Por exemplo, um conceito como `actor` pode ser representado atualmente por `user_uuid`, enquanto `tenant` pode ser representado por `tenant_uuid`. Essa distinção permite documentar a responsabilidade e o significado arquitetural de cada elemento sem necessariamente limitar o conceito à sua implementação atual.

A organização descrita também poderá evoluir conforme o sistema avance. Alguns conceitos ou responsabilidades atualmente agrupados em determinados domínios poderão posteriormente ser extraídos para contextos próprios, como parte da evolução arquitetural planejada. Portanto, este documento deve ser interpretado como uma representação do **modelo arquitetural atual e de sua direção de evolução**, e não como uma descrição imutável da estrutura futura da aplicação.
