# Arquitetura da Aplicação

> Documento técnico que descreve a organização interna da aplicação backend do Exactum, suas principais camadas, responsabilidades, fluxo de execução e direção arquitetural.

**Status:** Atual  
**Versão:** v0.2.0-alpha  
**Última atualização:** 2026-08-17

---

## 1. Objetivo

Este documento descreve a arquitetura interna da aplicação backend do Exactum.

Enquanto o documento de [Visão Geral da Arquitetura](./overview.md) apresenta os princípios e decisões arquiteturais em nível mais alto, este documento detalha como esses princípios são refletidos na organização do código e no fluxo de execução da aplicação.

Os principais objetivos são:

- definir as responsabilidades das principais camadas;
- documentar o fluxo de uma requisição HTTP;
- estabelecer limites entre HTTP, aplicação, domínio e infraestrutura;
- documentar o papel de services e repositories;
- definir como dependências devem atravessar as camadas;
- registrar o estado atual da arquitetura;
- documentar a direção da evolução arquitetural prevista para a v0.3.x.

A arquitetura atual deve ser entendida como um estágio de evolução. O Exactum não busca caracterizar sua implementação atual como uma arquitetura DDD completa, mas utiliza princípios de separação de responsabilidades e fronteiras de domínio como direção de evolução.

---

## 2. Estado Arquitetural Atual

A arquitetura atual do backend é predominantemente orientada a camadas.

Em alto nível:

```text
HTTP
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
Persistence
```

Essa organização fornece uma separação inicial entre:

- transporte HTTP;
- entrada e validação de dados;
- coordenação de casos de uso;
- persistência;
- infraestrutura.

A aplicação também possui componentes transversais responsáveis por preocupações como:

- autenticação;
- autorização;
- contexto de tenant;
- observabilidade;
- tratamento de exceções;
- gestão de sessão;
- auditoria.

A arquitetura atual pode ser representada de forma simplificada como:

```text
                         ┌─────────────────────┐
                         │       HTTP          │
                         │ Routes / Controllers│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Application Services│
                         │   Use Cases / Flow  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Repositories     │
                         │ Persistence Boundary│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         └─────────────────────┘

              ┌──────────────────────────────────────┐
              │          Cross-Cutting Concerns      │
              │                                      │
              │ Auth │ Authorization │ Tenant │ Logs │
              │ Audit │ Exceptions │ Sessions        │
              └──────────────────────────────────────┘
```

Essa estrutura ainda possui pontos de acoplamento com o framework e com infraestrutura que serão progressivamente reduzidos nas próximas versões.

---

## 3. Princípios Arquiteturais

A organização interna do Exactum segue alguns princípios fundamentais.

### 3.1 Separação de responsabilidades

Cada camada deve possuir uma responsabilidade clara.

Uma camada não deve assumir responsabilidades pertencentes a outra apenas por conveniência.

Por exemplo:

- controllers não devem implementar regras de negócio complexas;
- repositories não devem decidir regras de autorização;
- entidades de domínio não devem conhecer detalhes HTTP;
- código de infraestrutura não deve definir regras de negócio;
- frontend não deve ser responsável pela segurança da aplicação.

---

### 3.2 Backend como autoridade

O backend é a autoridade final para:

- autenticação;
- autorização;
- isolamento de tenant;
- validação de regras de negócio;
- integridade dos dados.

Qualquer comportamento implementado no frontend relacionado a permissões ou validação deve ser considerado apenas uma preocupação de UX.

```text
Frontend
   │
   │ UX / apresentação
   ▼
Backend
   │
   │ autoridade
   ▼
Business Rules
```

---

### 3.3 Regras de negócio não devem depender de HTTP

A lógica de negócio deve ser mantida o mais distante possível de detalhes específicos do protocolo HTTP.

O objetivo é evitar que regras de negócio dependam diretamente de:

- request;
- response;
- headers;
- cookies;
- status HTTP;
- objetos específicos do Flask.

Isso permite que os casos de uso possam evoluir independentemente da camada de transporte.

---

### 3.4 Persistência como fronteira

O acesso ao banco de dados deve ocorrer através de uma fronteira de persistência.

Repositories são responsáveis por encapsular operações de persistência e impedir que detalhes de acesso ao banco se espalhem pela aplicação.

```text
Application
     │
     ▼
Repository
     │
     ▼
SQLAlchemy
     │
     ▼
PostgreSQL
```

---

### 3.5 Evolução incremental

A arquitetura não é tratada como algo estático.

O Exactum começou com uma organização predominantemente orientada a camadas e está evoluindo progressivamente para uma estrutura com fronteiras de domínio mais explícitas.

Essa evolução será incremental para evitar uma reescrita desnecessária da aplicação.

---

## 4. Camadas da Aplicação

A aplicação pode ser entendida através das seguintes responsabilidades:

```text
┌─────────────────────────────────────┐
│          Presentation / HTTP        │
│ Routes / Controllers / Schemas      │
├─────────────────────────────────────┤
│          Application Layer          │
│ Services / Use Cases                │
├─────────────────────────────────────┤
│             Domain                  │
│ Business Rules / Domain Models      │
├─────────────────────────────────────┤
│          Infrastructure             │
│ DB / Redis / Logging / External     │
└─────────────────────────────────────┘
```

Nem todas essas fronteiras possuem o mesmo grau de isolamento na versão atual.

A camada de domínio, especialmente, ainda está em processo de consolidação e será fortalecida durante a evolução para a v0.3.x.

---

## 5. Presentation / HTTP Layer

A camada de apresentação é responsável por adaptar o protocolo HTTP à aplicação.

Ela inclui principalmente:

- routes;
- controllers;
- schemas;
- serialização;
- validação de entrada;
- tradução de resultados para respostas HTTP.

Seu objetivo é receber uma requisição e encaminhá-la para o caso de uso apropriado.

Um fluxo típico:

```text
HTTP Request
     │
     ▼
Route
     │
     ▼
Controller
     │
     ▼
Application Service
```

---

### 5.1 Routes

Routes são responsáveis pelo mapeamento entre endpoints HTTP e handlers da aplicação.

Exemplo conceitual:

```text
POST /api/products
        │
        ▼
Product Route
        │
        ▼
Product Controller
```

Routes não devem conter regras de negócio complexas.

Sua responsabilidade principal é definir:

- método HTTP;
- caminho;
- parâmetros;
- integração com autenticação/autorização;
- chamada do controller apropriado.

---

### 5.2 Controllers

Controllers atuam como adaptadores entre HTTP e a camada de aplicação.

Responsabilidades:

- receber dados já processados pela camada HTTP;
- obter contexto necessário;
- chamar o application service;
- interpretar o resultado;
- construir a resposta HTTP.

Um controller não deve ser responsável por implementar regras complexas de negócio.

Exemplo conceitual

```python
def create_product():
    data = validated_request_data()

    product = product_service.create_product(
        data=data,
        tenant_id=current_tenant_id()
    )

    return product_schema.dump(product), 201
```

A regra de criação do produto deve permanecer no application/domain layer, e não no controller.

---

## 6. Application Layer (Services)

A camada de aplicação coordena os casos de uso do sistema.

Ela representa operações que o sistema oferece, como:

- criar produto;
- atualizar produto;
- registrar venda;
- autenticar usuário;
- renovar sessão;
- criar usuário;
- suspender tenant;
- executar impersonate.

Application services coordenam essas operações sem assumir responsabilidades específicas do transporte HTTP.

---

### 6.1 Responsabilidades

Um application service pode:

- receber dados de entrada;
- coordenar entidades e serviços de domínio;
- consultar repositories;
- iniciar operações transacionais;
- verificar pré-condições;
- chamar componentes de infraestrutura através de abstrações;
- produzir resultados para a camada HTTP.

---

### 6.2 O que não pertence aos Application Services

Application services não devem se tornar um local genérico para qualquer código.

Devem ser evitados:

- código específico de HTTP;
- construção direta de respostas HTTP;
- manipulação direta de cookies;
- queries SQL espalhadas;
- regras puramente relacionadas à apresentação;
- lógica de infraestrutura não relacionada ao caso de uso.

O objetivo é que um application service represente um fluxo de aplicação, e não uma classe que simplesmente acumula qualquer lógica necessária para fazer uma funcionalidade funcionar.

---

## 7. Domain Layer

A camada de domínio representa as regras e conceitos centrais do negócio.

No estágio atual do Exactum, essa camada ainda está em evolução.

A partir da v0.3.x, o objetivo é fortalecer progressivamente essa fronteira.

Exemplos de conceitos de domínio incluem:

- Product;
- Sale;
- Stock;
- User;
- Role;
- Permission;
- Tenant.

A presença desses conceitos no domínio não significa necessariamente que cada um deva possuir uma implementação complexa.

O objetivo é identificar quais regras pertencem efetivamente ao negócio e removê-las progressivamente de controllers, repositories e componentes específicos do framework.

---

## 8. Infrastructure Layer

A infraestrutura contém componentes necessários para executar a aplicação, mas que não representam diretamente regras de negócio.

Exemplos:

- PostgreSQL;
- SQLAlchemy;
- Redis;
- logging;
- observabilidade;
- gerenciamento de sessão;
- integrações externas;
- mecanismos específicos do Flask;
- configuração de ambiente.

Uma representação simplificada:

```text
                    Application
                         │
                         ▼
                 Infrastructure
                  │          │
                  ▼          ▼
              PostgreSQL    Redis
```

A direção arquitetural é reduzir a dependência direta da aplicação em implementações concretas de infraestrutura.

---

## 9. Repositories

Repositories representam a fronteira entre a aplicação e a persistência.

Seu objetivo é encapsular operações relacionadas à recuperação e persistência de dados.

Exemplos conceituais:

```text
ProductRepository
UserRepository
TenantRepository
SaleRepository
RoleRepository
```

Um repository pode fornecer operações como:

```python
find_by_id()
find_by_uuid()
find_by_tenant()
create()
update()
delete()
```

---

### 9.1 Tenant Scoping

Repositories possuem papel importante na estratégia defensiva de isolamento de tenants.

Operações sobre entidades tenant-scoped devem considerar explicitamente o tenant correspondente.

Conceitualmente:

```text
Application
     │
     │ tenant_id
     ▼
Repository
     │
     │ explicit tenant filter
     ▼
PostgreSQL
```

O repository não deve assumir que o contexto de tenant recebido é implicitamente correto apenas porque foi estabelecido anteriormente no ciclo da requisição.

---

### 9.2 Repositories não são regras de negócio

Repositories devem responder perguntas relacionadas à persistência.

Por exemplo:

```text
"Existe um produto com esse UUID?"

"Quais produtos pertencem a este tenant?"

"Salvar esta entidade."
```

Já perguntas como:

```text
"Este produto pode ser vendido?"

"Uma venda pode ser concluída?"

"Este usuário pode executar esta operação?"
```

pertencem à aplicação, autorização ou domínio.

---

## 10. Cross-Cutting Concerns

Algumas preocupações atravessam múltiplas partes da aplicação.

No Exactum, as principais são:

- autenticação;
- autorização;
- tenant context;
- observabilidade;
- auditoria;
- tratamento de exceções;
- rate limiting;
- gestão de sessão.

Essas preocupações não devem ser tratadas simplesmente como responsabilidades de uma única camada.

---

### 10.1 Authentication

A autenticação determina quem está realizando a requisição.

O fluxo simplificado é:

```text
Request
   │
   ▼
Authentication
   │
   ├── Invalid → Reject
   │
   ▼
Authenticated Identity
```

A arquitetura atual utiliza:

- access token;
- refresh token;
- cookies HttpOnly;
- Redis para gestão de sessão.

Detalhes completos estão documentados em:

[Autenticação](../security/authentication.md)

---

## 11. Authorization

Autenticação responde:

> Quem é você?

Autorização responde:

> O que você pode fazer?

O fluxo conceitual:

```text
User
 │
 ▼
Role
 │
 ▼
Permissions
 │
 ▼
Authorization
 │
 ├── Allowed
 │
 └── Denied
```

A autorização ocorre no backend.

O frontend pode esconder ou exibir funcionalidades com base nas permissões conhecidas, mas isso não constitui uma fronteira de segurança.

Detalhes:

[Autorização & RBAC](../security/authorization.md)

---

## 12. Tenant Context

O tenant context identifica a organização dentro da qual uma operação está sendo executada.

O fluxo simplificado:

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
Application
```

O contexto de tenant é estabelecido durante o processamento da requisição.

Operações sobre dados tenant-scoped devem preservar esse contexto até a camada de persistência.

Detalhes:

[Multi-Tenancy](./multi-tenancy.md)

---

## 13. Observabilidade

A aplicação possui mecanismos de observabilidade que atravessam diferentes camadas.

Os principais elementos incluem:

- request ID;
- logging estruturado;
- contexto de usuário;
- contexto de tenant;
- contexto de super-admin;
- eventos de plataforma;
- logs de auditoria.

O objetivo é permitir reconstruir o contexto de uma operação.

Exemplo:

```text
Request
   │
   ├── request_id
   ├── user_id
   ├── tenant_id
   ├── method
   ├── path
   └── duration
          │
          ▼
     Structured Log
```

A observabilidade operacional é separada conceitualmente da auditoria de negócio.

Detalhes:

[Visão Geral de Observabilidade](../observability/overview.md)

---

## 14. Tratamento de Exceções

Exceções devem ser tratadas de forma centralizada sempre que possível.

A aplicação diferencia:

- erros de validação;
- erros de autenticação;
- erros de autorização;
- recursos inexistentes;
- conflitos de negócio;
- erros internos;
- erros de infraestrutura.

A camada HTTP é responsável por transformar exceções da aplicação em respostas HTTP apropriadas.

Conceitualmente:

```text
Domain / Application Error
          │
          ▼
Exception Handling
          │
          ▼
HTTP Error Response
```

Isso evita que cada controller implemente sua própria estratégia de tratamento de erros.

---

## 15. Fluxo de uma Requisição

Uma requisição típica pode ser representada como:

```text
                    HTTP Request
                         │
                         ▼
                    Nginx / Web
                         │
                         ▼
                    Flask / HTTP
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
                      Route
                         │
                         ▼
                    Controller
                         │
                         ▼
               Application Service
                         │
                         ▼
                  Domain Logic
                         │
                         ▼
                    Repository
                         │
                         ▼
                     SQLAlchemy
                         │
                         ▼
                    PostgreSQL
                         │
                         ▼
                     Response
```

Preocupações como logging, auditoria e tratamento de exceções podem acompanhar o fluxo em diferentes pontos.

---

## 16. Exemplo: Criação de Produto

Um fluxo simplificado de criação de produto:

```text
POST /api/products
        │
        ▼
      Route
        │
        ▼
   Controller
        │
        ▼
Product Service
        │
        ├── Validate business rules
        │
        ├── Check authorization
        │
        ▼
Product Repository
        │
        ▼
    PostgreSQL
        │
        ▼
     Product
        │
        ▼
   Audit Event
        │
        ▼
 HTTP Response
```

Cada componente possui uma responsabilidade específica.

O controller não deve executar diretamente uma query.

O repository não deve decidir se o usuário possui permissão.

A auditoria não deve substituir a lógica de negócio.

---

## 17. Exemplo: Registro de Venda

Uma venda possui requisitos adicionais de consistência.

O fluxo conceitual:

```text
POST /api/sales
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
Sales Controller
       │
       ▼
Sales Application Service
       │
       ├───────────────┐
       ▼               ▼
Product Repository   Stock Repository
       │               │
       └───────┬───────┘
               ▼
        Business Rules
               │
               ▼
          Transaction
               │
        ┌──────┴──────┐
        ▼             ▼
      Sale         Stock
        │             │
        └──────┬──────┘
               ▼
          Audit Event
               │
               ▼
          HTTP Response
```

Operações críticas devem preservar a consistência entre venda e estoque através de transações.

---

## 18. Transações

Operações que modificam múltiplos recursos relacionados devem ser tratadas de maneira transacional.

Um exemplo é a realização de uma venda.

A operação pode envolver:

1. validação da venda;
2. validação dos produtos;
3. atualização do estoque;
4. criação da venda;
5. criação dos itens da venda;
6. registro de auditoria.

Essas operações precisam manter consistência.

Conceitualmente:

```text
BEGIN TRANSACTION

Validate Sale
      │
      ▼
Validate Stock
      │
      ▼
Create Sale
      │
      ▼
Update Stock
      │
      ▼
Create Audit Record
      │
      ▼
COMMIT
```

Se uma etapa crítica falhar:

```text
ROLLBACK
```

O objetivo é evitar estados parcialmente persistidos.

---

## 19. Dependências entre Camadas

A direção desejada das dependências é:

```text
Presentation
      │
      ▼
Application
      │
      ▼
Domain
      │
      ▼
Infrastructure
```

Entretanto, na arquitetura atual, existem pontos onde essas dependências ainda são mais diretas do que o desejado.

Esses pontos fazem parte do trabalho planejado para a v0.3.x.

### 19.1 Dependências permitidas

Exemplos de dependências aceitáveis:

```text
Controller → Application Service
Application Service → Repository
Repository → Persistence
Infrastructure → External Systems
```

---

### 19.2 Dependências a serem reduzidas

A evolução arquitetural busca reduzir situações como:

```text
Domain → Flask
Domain → HTTP
Domain → Redis
Domain → SQLAlchemy
Domain → Request
```

O domínio não deve precisar conhecer detalhes do framework ou de mecanismos externos para representar suas regras.

---

## 20. Estado Atual vs. Arquitetura Alvo

A arquitetura atual e a arquitetura desejada não são exatamente iguais.

**Atual**

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

Com preocupações transversais acopladas em diferentes pontos.

**Alvo**

A direção arquitetural para a v0.3.x é:

```text
                    ┌───────────────────────┐
                    │     Presentation      │
                    │ HTTP / Controllers    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Application      │
                    │      Use Cases        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │        Domain         │
                    │ Entities / Rules      │
                    └───────────┬───────────┘
                                │
                     abstractions / ports
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Infrastructure     │
                    │ DB / Redis / External │
                    └───────────────────────┘
```

Essa arquitetura é inspirada em princípios de DDD e separação de responsabilidades, mas não pressupõe a adoção integral de um framework arquitetural específico.

---

## 21. Organização por Domínio

A estrutura do projeto está evoluindo para uma organização baseada em domínios.

Estrutura conceitual:

```text
app/
│
├── core/
│
├── domains/
│   ├── auth/
│   ├── users/
│   ├── tenants/
│   ├── products/
│   ├── sales/
│   └── ...
│
├── infra/
│   ├── observability/
│   └── ...
│
└── ...
```

A intenção é que cada domínio concentre os elementos relacionados àquele contexto.

Por exemplo:

```text
domains/
└── products/
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

A organização exata pode evoluir durante a v0.3.x.

O objetivo principal não é a estrutura de diretórios em si, mas a criação de fronteiras arquiteturais mais claras.

---

## 22. Domain Boundaries

Os domínios representam áreas de responsabilidade do sistema.

Exemplos atuais:

```text
Auth
Users
Tenants
Products
Sales
Stock
Roles
Permissions
```

Esses conceitos ainda podem possuir diferentes graus de independência.

A documentação específica das fronteiras de domínio está em:

[Fronteiras de Domínio](./domain-boundaries.md)

A identificação dos limites deve considerar:

- regras de negócio;
- dados compartilhados;
- dependências;
- invariantes;
- ciclo de vida;
- responsabilidade funcional.

---

## 23. Framework Isolation

O Exactum utiliza Flask como framework HTTP.

Entretanto, a direção arquitetural é evitar que Flask se torne uma dependência de toda a aplicação.

Idealmente:

```text
                    Flask
                      │
                      ▼
                 HTTP Adapter
                      │
                      ▼
                Application
                      │
                      ▼
                   Domain
```

Em vez de:

```text
Flask
 │
 ├── Controllers
 ├── Services
 ├── Domain
 ├── Repositories
 └── Business Rules
```

O objetivo da v0.3.x é reduzir progressivamente a presença de objetos e APIs específicas do Flask em camadas internas.

---

## 24. Persistence Isolation

A aplicação utiliza PostgreSQL e SQLAlchemy.

A persistência deve permanecer atrás de uma fronteira definida.

```text
Application
     │
     ▼
Repository Abstraction
     │
     ▼
SQLAlchemy
     │
     ▼
PostgreSQL
```

Isso reduz o acoplamento entre as regras da aplicação e detalhes específicos do mecanismo de persistência.

A arquitetura atual ainda possui pontos de acoplamento que serão refinados durante a evolução da aplicação.

---

## 25. Redis

Redis possui responsabilidades relacionadas principalmente à infraestrutura de sessão.

No estágio atual, é utilizado para:

- refresh tokens;
- sessões;
- revogação;
- invalidação;
- controle de estado relacionado à autenticação.

A aplicação deve evitar espalhar operações Redis diretamente em regras de negócio.

A direção futura é concentrar essas operações atrás de componentes de infraestrutura apropriados.

---

## 26. Testabilidade

A separação entre camadas também possui como objetivo melhorar a testabilidade.

Idealmente, regras de negócio devem poder ser testadas sem exigir:

- servidor HTTP;
- navegador;
- banco de dados real;
- Redis;
- infraestrutura externa.

A pirâmide conceitual:

```text
              E2E
             /   \
            /     \
       Integration
          /       \
         /         \
      Unit Tests
```

Testes unitários devem concentrar-se nas regras e casos de uso.

Testes de integração devem validar fronteiras como:

- banco;
- repositories;
- autenticação;
- APIs;
- infraestrutura.

A estratégia completa está documentada em:

[Estratégia de Testes](../testing/strategy.md)

---

## 27. Evolução para a v0.3.x

A v0.3.x representa o principal ciclo de evolução arquitetural do Exactum.

Os objetivos são:

- fortalecer fronteiras de domínio;
- reduzir acoplamento com Flask;
- separar melhor application e domain;
- refinar repositories;
- melhorar modelagem de domínio;
- reduzir dependências diretas de infraestrutura;
- ampliar testes;
- preparar a aplicação para processamento assíncrono;
- estabelecer uma base mais adequada para observabilidade avançada.

### 27.1 Refatoração Progressiva

A refatoração será incremental.

Não é objetivo realizar uma reescrita completa do backend.

O processo esperado é:

```text
Current Architecture
        │
        ▼
Identify Boundary
        │
        ▼
Extract Responsibility
        │
        ▼
Introduce Abstraction
        │
        ▼
Move Logic
        │
        ▼
Test
        │
        ▼
New Architecture
```

Cada mudança deve preservar o comportamento existente sempre que possível.

---

## 28. Critérios para Novas Implementações

Novas funcionalidades devem considerar as seguintes perguntas:

**1. Isso é regra de negócio?**

Se sim, deve ser mantido distante de HTTP e infraestrutura.

**2. Isso é uma operação de persistência?**

Se sim, deve pertencer à camada de persistência/repository.

**3. Isso é específico de HTTP?**

Se sim, deve permanecer na camada de apresentação.

**4. Isso é infraestrutura?**

Se sim, deve permanecer atrás de uma fronteira apropriada.

**5. Isso pertence claramente a um domínio?**

Se sim, deve ser implementado dentro da fronteira desse domínio.

**6. Isso atravessa vários componentes?**

Se sim, deve ser tratado como uma preocupação transversal claramente definida.

---

## 29. Regras de Dependência

Como regra geral:

```text
HTTP
 ↓
Application
 ↓
Domain
 ↓
Abstractions
 ↓
Infrastructure
```

Dependências devem apontar para dentro das responsabilidades mais estáveis sempre que possível.

Detalhes de infraestrutura não devem determinar a modelagem das regras de negócio.

---

## 30. O que esta arquitetura não pretende ser

A arquitetura atual não deve ser interpretada como:

- uma implementação completa de Domain-Driven Design;
- uma arquitetura de microserviços;
- uma arquitetura hexagonal completa;
- uma aplicação totalmente desacoplada do framework;
- uma arquitetura distribuída;
- uma plataforma de alta disponibilidade.

O Exactum é uma aplicação monolítica modular em evolução.

A prioridade atual é construir fronteiras internas fortes antes de introduzir complexidade distribuída desnecessária.

---

## 31. Monólito Modular

A arquitetura atual é baseada em um monólito.

Isso significa que:

- backend e domínios são executados no mesmo processo da aplicação;
- os módulos compartilham o mesmo banco;
- a comunicação interna ocorre através de chamadas de aplicação;
- não existem microserviços independentes para cada domínio.

A escolha é deliberada.

```text
                Exactum
        ┌─────────────────────┐
        │                     │
        │  Auth               │
        │  Users              │
        │  Tenants            │
        │  Products           │
        │  Sales              │
        │  Stock              │
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
              PostgreSQL
```

A modularidade interna é priorizada antes da distribuição física dos componentes.

---

## 32. Preparação para Processamento Assíncrono

A arquitetura também considera futuras necessidades de processamento assíncrono.

Entre os casos previstos estão:

- tarefas demoradas;
- geração de relatórios;
- processamento de dados;
- integrações externas;
- notificações;
- análises;
- processamento relacionado a IA.

A arquitetura futura poderá utilizar:

```text
Application
     │
     ▼
Message / Task
     │
     ▼
RabbitMQ
     │
     ▼
Celery Worker
```

Essa infraestrutura ainda não faz parte do fluxo principal atual.

Sua introdução deve ocorrer apenas quando houver necessidade real de processamento assíncrono.

---

## 33. Preparação para Observabilidade Avançada

A estrutura atual de logging foi desenhada para permitir evolução futura.

Atualmente:

```text
Application
     │
     ▼
Structured Logs
     │
     ▼
JSON
```

A direção futura:

```text
Application
     │
     ▼
Telemetry
     │
     ├── Logs
     ├── Metrics
     └── Traces
             │
             ▼
      Observability Stack
       Prometheus / Grafana
```

A introdução de métricas e tracing deve ser feita de forma incremental.

---

## 34. Considerações de Segurança Arquitetural

A arquitetura deve preservar algumas invariantes de segurança.

**Tenant Isolation**

Nenhuma operação tenant-scoped deve acessar dados de outro tenant.

**Authorization**

Nenhuma autorização deve depender exclusivamente do frontend.

**Authentication**

Tokens e sessões devem permanecer sob controle do backend.

**Auditability**

Operações administrativas e ações relevantes devem possuir contexto suficiente para rastreamento.

**Secrets**

Credenciais e segredos devem permanecer fora do código-fonte.

---

35. Relação com Outros Documentos

Este documento deve ser lido em conjunto com:

**Arquitetura**<br>

- [Visão Geral da Arquitetura](./overview.md)<br>
- [Contexto do Sistema](./system-context.md)<br>
- [Fronteiras de Domínio](./domain-boundaries.md)<br>
- [Multi-Tenancy](./multi-tenancy.md)<br>

**Segurança**<br>

- [Visão Geral de Segurança](../security/overview.md)<br>
- [Autenticação](../security/authentication.md)<br>
- [Autorização](../security/authorization.md)<br>
- [Gestão de Sessão](../security/session-management.md)<br>
- [Isolamento de Tenant](../security/tenant-isolation.md)<br>

**Observabilidade**<br>

- [Visão Geral de Observabilidade](../observability/overview.md)<br>
- [Logs de Infraestrutura](../observability/infrastructure-logging.md)<br>
- [Eventos de Plataforma](../observability/platform-events.md)<br>
- [Logs de Auditoria](../observability/audit-logging.md)<br>

**Banco de Dados**<br>

- [Arquitetura do Banco](../database/overview.md)<br>
- [Schema do Banco](../database/schema.md)<br>
- [Migrações](../database/migrations.md)<br>

**Testes**<br>

- [Estratégia de Testes](../testing/strategy.md)

---

## 36. Evolução Arquitetural

A arquitetura do Exactum deve ser considerada um artefato evolutivo.

As mudanças arquiteturais relevantes devem ser registradas através de ADRs quando envolverem decisões significativas.

Exemplos:

- mudança na estratégia de autenticação;
- adoção de Redis para sessões;
- estratégia de isolamento multi-tenant;
- reorganização de domínios;
- introdução de processamento assíncrono;
- mudança de estratégia de persistência;
- adoção de novas ferramentas de observabilidade.

[Architecture Decision Records](./decisions/)

---

## 37. Resumo

A arquitetura atual do Exactum é um monólito modular predominantemente orientado a camadas.

Sua estrutura pode ser resumida como:

```text
                 HTTP
                  │
                  ▼
          Routes / Controllers
                  │
                  ▼
        Application Services
                  │
                  ▼
              Domain
                  │
                  ▼
            Repositories
                  │
                  ▼
            Infrastructure
             │          │
             ▼          ▼
         PostgreSQL    Redis
```

Ao redor dessas camadas existem preocupações transversais relacionadas a:

```text
Authentication
Authorization
Tenant Context
Observability
Audit
Exception Handling
Rate Limiting
Session Management
```

A partir da v0.3.x, a arquitetura evolui progressivamente para fronteiras de domínio mais explícitas, buscando:

- reduzir acoplamento;
- fortalecer a separação entre domínio e framework;
- melhorar testabilidade;
- tornar as regras de negócio mais independentes;
- preparar a aplicação para futuras necessidades de processamento assíncrono e observabilidade.

A direção arquitetural pode ser resumida como:

```text
Layered Monolith
       │
       ▼
Modular Monolith
       │
       ▼
Stronger Domain Boundaries
       │
       ▼
More Explicit Application / Domain Separation
       │
       ▼
Infrastructure Decoupling
```

A arquitetura deve evoluir conforme o produto e seus requisitos evoluem, preservando simplicidade sempre que a complexidade adicional não produzir benefício concreto.
