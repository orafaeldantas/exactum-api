# Domain Boundaries

> Definição das fronteiras de domínio do Exactum, suas responsabilidades,
> dependências e regras de interação entre contextos.

---

## 1. Objetivo

Este documento define as fronteiras de domínio utilizadas pelo Exactum e
estabelece as responsabilidades de cada área funcional da aplicação.

O objetivo principal é reduzir o acoplamento entre diferentes partes do
sistema e fornecer uma estrutura arquitetural para a evolução do projeto
em direção a uma organização orientada a domínios.

As fronteiras descritas neste documento não representam necessariamente
Bounded Contexts completos no sentido estrito de Domain-Driven Design.
Elas representam fronteiras arquiteturais e funcionais que serão
refinadas progressivamente ao longo da evolução do sistema.

A definição dessas fronteiras busca responder principalmente:

- qual responsabilidade pertence a cada domínio;
- quais dados são de responsabilidade de cada domínio;
- quais operações cada domínio pode executar;
- como os domínios podem se comunicar;
- quais dependências devem ser evitadas;
- quais partes da aplicação são regras de negócio e quais são
  preocupações de infraestrutura.

---

## 2. Contexto Arquitetural

O Exactum é uma plataforma SaaS multi-tenant de ERP para pequenas e
médias empresas do varejo.

O sistema possui diferentes áreas funcionais que inicialmente evoluíram
dentro de uma arquitetura predominantemente orientada a camadas.

A organização atual pode ser representada de forma simplificada como:

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

A partir da v0.3.x, o projeto passa a evoluir progressivamente para uma
organização orientada a domínios.

A intenção não é substituir imediatamente a arquitetura existente, mas
introduzir fronteiras mais explícitas entre as diferentes áreas do
sistema.

```text
                 ┌───────────────────────────┐
                 │          Exactum          │
                 │                           │
                 │   Domain-oriented core    │
                 │                           │
                 │ ┌───────┐ ┌────────────┐  │
                 │ │ Auth  │ │  Tenants   │  │
                 │ └───────┘ └────────────┘  │
                 │                           │
                 │ ┌───────┐ ┌────────────┐  │
                 │ │Users  │ │ Products   │  │
                 │ └───────┘ └────────────┘  │
                 │                           │
                 │ ┌───────┐ ┌────────────┐  │
                 │ │ Sales │ │ Inventory  │  │
                 │ └───────┘ └────────────┘  │
                 └───────────────────────────┘
```

Essas fronteiras representam responsabilidades diferentes e não
necessariamente serviços ou processos independentes.

O Exactum continua sendo uma aplicação monolítica modular.

---

## 3. Princípios de Fronteira

As fronteiras de domínio seguem alguns princípios.

### 3.1 Responsabilidade única por domínio

Cada domínio deve possuir uma responsabilidade funcional clara.

Um domínio não deve assumir regras pertencentes a outro domínio apenas
porque possui acesso aos mesmos dados.

Por exemplo:

```text
Sales
    └── responsável pelas regras relacionadas à venda

Inventory
    └── responsável pelas regras relacionadas ao estoque
```

Uma venda pode provocar uma alteração de estoque, mas isso não significa
que o domínio de vendas deve assumir a responsabilidade pelas regras
internas de estoque.

---

## 3.2 Domínios não devem depender de detalhes de infraestrutura

As regras de negócio devem evitar dependência direta de:

- Flask;
- HTTP;
- Redis;
- PostgreSQL;
- SQLAlchemy;
- bibliotecas de logging;
- mecanismos específicos de autenticação;
- detalhes de infraestrutura.

A infraestrutura deve implementar mecanismos utilizados pelo domínio e
pela camada de aplicação, e não definir as regras de negócio.

---

### 3.3 Dependências devem apontar para abstrações

Quando um domínio precisar interagir com outra capacidade, a interação
deve ocorrer preferencialmente através de uma abstração ou contrato.

Exemplo conceitual:

```text
Sales
  │
  │ requires
  ▼
InventoryPort
  │
  ▼
Inventory implementation
```

O objetivo é evitar que o domínio de vendas conheça diretamente detalhes
da implementação do estoque.

---

### 3.4 Compartilhamento de dados não significa compartilhamento de

responsabilidade

Dois domínios podem utilizar informações relacionadas à mesma entidade
sem que ambos sejam responsáveis por sua manutenção.

A propriedade conceitual dos dados deve permanecer clara.

Por exemplo:

```text
Product
   │
   ├── Products
   │      owns product definition
   │
   └── Inventory
          owns stock state
```

O domínio de produtos define o produto.

O domínio de estoque define o estado de estoque associado ao produto.

---

## 4. Mapa de Domínios

As principais fronteiras funcionais identificadas atualmente são:

```text
                         Exactum
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
      Auth               Tenants              Users
        │                   │                    │
        └──────────────┬────┴────────────┬───────┘
                       │                 │
                       ▼                 ▼
                    Products          Authorization
                       │
                       ▼
                   Inventory
                       │
                       ▼
                     Sales
                       │
                       ▼
                  Reporting
```

A estrutura acima representa principalmente as relações conceituais.
Ela não significa que exista uma dependência direta entre todos os
domínios.

As fronteiras principais são:

```text
| Domínio                   | Responsabilidade                                 |
| ------------------------- | ------------------------------------------------ |
| Auth                      | Autenticação e identidade de sessão              |
| Tenants                   | Ciclo de vida e contexto da organização          |
| Users                     | Usuários e seus estados                          |
| Authorization             | Roles, permissions e autorização                 |
| Products                  | Cadastro e informações de produtos               |
| Inventory                 | Estado e movimentação de estoque                 |
| Sales                     | Vendas e operações do PDV                        |
| Reporting                 | Indicadores e informações derivadas              |
| Platform / Administration | Operações administrativas em nível de plataforma |
```

Algumas dessas áreas podem futuramente ser consolidadas ou subdivididas
conforme a modelagem do domínio evolua.

---

## 5. Auth

### Responsabilidade

O domínio de autenticação é responsável por estabelecer e validar a
identidade utilizada para acessar a plataforma.

Suas responsabilidades incluem:

- autenticação;
- credenciais;
- login;
- logout;
- renovação de sessão;
- recuperação de identidade;
- ciclo de vida relacionado à autenticação;
- integração com mecanismos de sessão.

O domínio de Auth não deve ser responsável pelas regras de negócio de
usuários, produtos, vendas ou estoque.

---

## Principais conceitos

Conceitualmente:

```text
Auth
 │
 ├── Credentials
 ├── Authentication
 ├── Session
 ├── Access Token
 └── Refresh Token
```

A implementação atual utiliza cookies HttpOnly e Redis como parte da
infraestrutura de sessão.

Esses mecanismos são detalhes de infraestrutura e não devem determinar
as regras de negócio do domínio.

---

### Limites

Auth pode consultar informações necessárias para autenticação de um
usuário.

Auth não deve:

- criar produtos;
- alterar estoque;
- registrar vendas;
- administrar diretamente regras de negócio de tenants;
- implementar autorização de cada operação de negócio.

---

## 6. Tenants

### Responsabilidade

O domínio de Tenants representa as organizações que utilizam o Exactum.

Suas responsabilidades incluem:

- criação de tenants;
- identificação de tenants;
- estado do tenant;
- ativação;
- suspensão;
- reativação;
- ciclo de vida da organização.

```text
Tenant
 │
 ├── Identity
 ├── Status
 └── Lifecycle
```

O tenant representa uma fronteira fundamental de isolamento de dados.

---

### Limites

Tenants não deve assumir responsabilidade por:

- autenticação;
- regras de estoque;
- regras de venda;
- definição de produtos;
- implementação de infraestrutura.

A suspensão de um tenant pode afetar outros domínios, especialmente
sessões e autorização, mas essas consequências devem ser coordenadas
através de contratos apropriados.

---

## 7. Users

### Responsabilidade

O domínio de Users representa os usuários da plataforma.

Responsabilidades:

- criação de usuários;
- atualização de dados de usuário;
- estado da conta;
- bloqueio;
- ativação;
- desativação;
- informações de perfil.

```text
User
 │
 ├── Identity
 ├── Profile
 └── Account Status
```

Users não deve assumir a responsabilidade por autenticação ou
autorização.

---

## 8. Authorization

### Responsabilidade

Authorization é responsável pelas regras que determinam quais operações
um usuário pode executar.

Suas principais responsabilidades são:

- roles;
- permissions;
- associação entre usuários e roles;
- avaliação de permissões;
- escopo de autorização;
- regras de acesso por tenant.

```text
User
  │
  ▼
Role
  │
  ▼
Permission
  │
  ▼
Authorization Decision
```

---

### Separação entre Users e Authorization

Um usuário possuir uma identidade não significa que ele possua
automaticamente autorização para executar determinada operação.

Portanto:

```text
Users
└── Quem é o usuário?

Authorization
└── O que o usuário pode fazer?
```

Essa separação deve permanecer explícita.

---

## 9. Products

### Responsabilidade

Products é responsável pela definição e manutenção do catálogo de
produtos.

Responsabilidades:

- criação de produtos;
- atualização de produtos;
- identificação de produtos;
- informações descritivas;
- preço;
- status;
- informações utilizadas pelo catálogo.

```text
Product
 │
 ├── Identity
 ├── Description
 ├── Pricing
 └── Status
```

Products define o que um produto é.

Ele não é responsável por determinar quanto estoque existe.

---

## 10. Inventory

> **Status:** Contexto arquitetural planejado, atualmente distribuído
> principalmente entre `Products` e `Sales`.

### Responsabilidade

O contexto de Inventory será responsável pelas regras relacionadas à
disponibilidade, movimentação e consistência do estoque.

Responsabilidades:

- quantidade disponível;
- entradas;
- saídas;
- ajustes;
- limites mínimos;
- movimentações;
- consistência do estoque;
- atualização decorrente de operações de negócio.

```text
Inventory
 │
 ├── Stock State
 ├── Stock Movement
 ├── Minimum Level
 └── Availability
```

Relação com Products

Inventory referencia produtos, mas não deve assumir a responsabilidade
pelo catálogo.

```text
Products
│
│ product identity
▼
Inventory
│
└── stock state
```

O estoque responde:

> Quanto existe deste produto?

O catálogo responde:

> O que é este produto?

Essa distinção deve permanecer clara.

---

## 11. Sales

### Responsabilidade

Sales é responsável pelas operações relacionadas às vendas.

Responsabilidades:

- criação de vendas;
- itens de venda;
- cálculo da operação;
- registro da transação;
- estado da venda;
- integração com operações de estoque;
- informações necessárias ao histórico de vendas.

```text
Sale
 │
 ├── Sale Identity
 ├── Items
 ├── Totals
 ├── Status
 └── Transaction Context
```

### Relação com Inventory

Uma venda pode provocar uma alteração no estoque.

Entretanto:

```text
Sales
   │
   │ requests stock operation
   ▼
Inventory
```

Sales não deve manipular diretamente o estado interno do estoque.

Por exemplo, uma implementação inadequada seria:

```python
sale.product.stock -= quantity
```

O domínio de Sales não deveria conhecer os detalhes internos da
persistência ou do estado de estoque.

A operação deve ser expressa através de uma capacidade do domínio de
Inventory.

Conceitualmente:

```text
Sales
  │
  │ reserve / consume stock
  ▼
Inventory
```

A forma exata desse contrato poderá evoluir durante a v0.3.x.

---

## 12. Reporting

> **Status:** Contexto arquitetural planejado — atualmente distribuído
> entre `Products`, `Sales` e componentes de dashboard.

### Responsabilidade

O contexto de Reporting será responsável pela construção de informações
derivadas e indicadores de negócio.

Exemplos:

- receita;
- volume de vendas;
- ticket médio;
- indicadores de estoque;
- métricas de produtos;
- dashboards.

Reporting não deve se tornar proprietário das regras transacionais de
Sales ou Inventory.

Seu papel é consumir informações e produzir representações derivadas.

```text
Sales ───────┐
             │
Inventory ───┼──► Reporting
             │
Products ────┘
```

### Dados derivados

Indicadores como:

```text
Revenue
Average Ticket
Sales Volume
Low Stock Indicators
```

são derivados de dados de outros domínios.

Por isso, Reporting deve evitar duplicar regras de negócio transacionais.

---

## 13. Platform / Administration

Algumas operações pertencem ao nível da plataforma e não ao contexto
de um tenant específico.

Exemplos:

- administração de tenants;
- suspensão de tenants;
- reativação de tenants;
- operações de super-admin;
- impersonate;
- operações administrativas globais;
- eventos de plataforma.

```text
Platform
 │
 ├── Tenant Administration
 ├── Super Admin
 ├── Impersonation
 └── Platform Events
```

Essas operações possuem privilégios superiores às operações normais de
um tenant.

---

## 14. Impersonate

O impersonate administrativo merece tratamento especial porque atravessa
diferentes fronteiras.

O fluxo conceitual é:

```text
 Admin
     │
     ▼
Platform Administration
     │
     ▼
Impersonation
     │
     ▼
Target User
     │
     ▼
Target Tenant
```

O impersonate não deve ser tratado simplesmente como uma alteração do
usuário atual.

Ele representa uma mudança controlada de contexto, mantendo informações
sobre o administrador original.

Por isso, operações de impersonate devem ser:

- autorizadas;
- rastreadas;
- auditáveis;
- limitadas;
- associadas ao administrador original;
- associadas ao usuário alvo;
- associadas ao tenant alvo.

---

## 15. Relações entre Domínios

Uma visão simplificada das principais relações é:

```text

                    ┌─────────────┐
                    │    Auth     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Users    │
                    └──────┬──────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Authorization   │
                  └────────┬─────────┘
                           │
                           ▼
                    Tenant Context
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Products         Inventory          Sales
                                           │
                                           │
                                           ▼
                                      Reporting
```

Essa representação é conceitual.

Ela não significa que todos os domínios devem possuir dependências
diretas entre si.

---

## 16. Dependências Permitidas

As dependências entre domínios devem ser explícitas.

Uma regra geral é:

```text
Domain A
   │
   ▼
Domain B
```

deve representar uma necessidade real de negócio, e não apenas uma
conveniência de implementação.

Exemplo:

```text
Sales → Inventory
```

é uma dependência conceitualmente válida porque uma venda pode consumir
estoque.

Já:

```text
Inventory → Sales
```

não deve existir simplesmente porque o estoque precisa consultar
informações internas de vendas.

Quando uma relação bidirecional surgir, deve-se avaliar se existe um
problema de modelagem ou se a interação deveria ser representada por
eventos ou contratos.

---

## 17. Dependências Proibidas

As seguintes formas de acoplamento devem ser evitadas:

**Domínio → Flask**

```text
Domain
  └── Flask request / g / current_app
```

Regras de negócio não devem depender diretamente do framework HTTP.

**Domínio → SQLAlchemy**

```text
Domain
  └── SQLAlchemy Model
```

A lógica de domínio não deve depender diretamente de detalhes de
persistência quando isso puder ser evitado.

**Domínio → Redis**

```text
Domain
  └── Redis client
```

Redis deve permanecer como detalhe de infraestrutura.

**Domínio → HTTP**

```text
Domain
  └── request / response
```

O domínio não deve conhecer requests ou responses HTTP.

**Domínio → outro domínio através do banco**

Uma fronteira de domínio não deve ser contornada simplesmente acessando
diretamente tabelas internas pertencentes a outro domínio.

```text
Sales
│
└── SELECT diretamente em tabelas internas de Inventory
```

Quando houver necessidade de interação, deve existir um contrato
apropriado.

---

## 18. Shared Kernel

Alguns conceitos podem legitimamente ser compartilhados entre diferentes
domínios.

Exemplos potenciais:

- UUID;
- tipos básicos;
- conceitos de tenant context;
- erros de aplicação;
- abstrações comuns;
- tipos de identificação.

Entretanto, o compartilhamento deve ser controlado.

Um shared ou common package não deve se transformar em um depósito
genérico para qualquer código utilizado por mais de um domínio.

Uma dependência compartilhada deve possuir estabilidade suficiente para
justificar sua existência.

---

## 19. Contexto de Tenant

O tenant é uma preocupação transversal do Exactum.

Diversos domínios operam dentro de um tenant:

```text
Tenant
   │
   ├── Users
   ├── Roles
   ├── Products
   ├── Inventory
   └── Sales
```

O contexto do tenant é estabelecido durante o processamento da
requisição.

Os domínios tenant-scoped devem receber esse contexto através de
mecanismos explícitos, evitando dependência direta de objetos globais do
framework.

---

## 20. Isolamento de Dados entre Domínios

Além do isolamento entre tenants, o sistema deve preservar a separação
conceitual entre dados pertencentes a diferentes domínios.

Por exemplo:

```text
Products
    └── Product definition

Inventory
    └── Stock state

Sales
    └── Sale transaction
```

Uma tabela ou entidade não deve acumular responsabilidades pertencentes
a diferentes domínios apenas para reduzir o número de tabelas ou joins.

A modelagem física do banco pode compartilhar mecanismos de persistência,
mas a propriedade conceitual dos dados deve permanecer explícita.

---

## 21. Transações entre Domínios

Algumas operações atravessam mais de um domínio.

Um exemplo importante é a venda:

```text
Sales
   │
   ├── Create Sale
   │
   └── Consume Inventory
```

Quando uma operação exigir consistência transacional entre diferentes
capacidades, a coordenação deve ocorrer preferencialmente na camada de
aplicação.

Conceitualmente:

```text
Application Service
        │
        ├──── Sales
        │
        └──── Inventory
```

Isso evita que um domínio passe a controlar diretamente a implementação
interna de outro.

A estratégia exata de transação poderá evoluir conforme o sistema passe
a adotar operações assíncronas e arquitetura orientada a eventos.

---

## 22. Eventos de Domínio e Plataforma

O Exactum ainda não depende de uma arquitetura totalmente orientada a
eventos.

Entretanto, eventos representam uma possível estratégia para reduzir
acoplamento entre domínios no futuro.

Exemplo:

```text
SaleCompleted
      │
      ├──────────────► Inventory
      │
      ├──────────────► Reporting
      │
      └──────────────► Audit
```

Nesse modelo, o domínio que produz o evento não precisa conhecer todos os
consumidores.

A adoção de eventos deve ocorrer somente quando houver necessidade
arquitetural real e não apenas como aplicação indiscriminada do padrão.

---

## 23. Domínios e Infraestrutura

A infraestrutura fornece mecanismos utilizados pelos domínios e pela
camada de aplicação.

```text
                  Application
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Domains      Infrastructure    Platform
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
          Redis    PostgreSQL    Logging
```

Exemplos de infraestrutura:

- PostgreSQL;
- SQLAlchemy;
- Redis;
- logging;
- HTTP;
- Flask;
- Docker;
- serviços externos.

Esses componentes não devem definir as regras centrais do domínio.

---

## 24. Domínios e Application Services

Application Services coordenam casos de uso.

Eles podem:

- receber comandos;
- validar pré-condições de aplicação;
- carregar entidades;
- chamar capacidades de domínio;
- coordenar múltiplos domínios;
- controlar transações;
- produzir respostas para a camada de apresentação.

Exemplo:

```text
HTTP
 │
 ▼
Controller
 │
 ▼
Application Service
 │
 ├──── Sales
 │
 └──── Inventory
 │
 ▼
Repository / Infrastructure
```

O Application Service não deve se transformar em um substituto para o
domínio.

Regras de negócio pertencem às abstrações de domínio apropriadas.

---

## 25. Domínios e Repositories

Repositories representam mecanismos de acesso a dados necessários pelos
domínios.

Conceitualmente:

```text
Domain
  │
  ▼
Repository Interface
  │
  ▼
Infrastructure Implementation
  │
  ▼
PostgreSQL
```

O domínio não deve precisar conhecer como os dados são armazenados.

Por exemplo, uma abstração pode representar:

```text
ProductRepository
InventoryRepository
SaleRepository
UserRepository
```

enquanto suas implementações concretas pertencem à infraestrutura.

---

## 26. Fronteiras Atuais vs. Fronteiras Futuras

As fronteiras descritas neste documento devem ser consideradas
evolutivas.

Na versão atual, algumas responsabilidades ainda podem estar agrupadas
na mesma camada ou compartilhar serviços e modelos.

A v0.3.x terá como objetivo fortalecer essas separações.

**Estado atual**

```text
Layered Architecture

Controllers
     │
     ▼
Services
     │
     ▼
Repositories
     │
     ▼
Database
```

**Direção arquitetural**

```text
                Application Layer
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     Sales          Inventory        Products
       │               │                │
       └───────────────┼────────────────┘
                       │
                       ▼
                Infrastructure
```

A transição ocorrerá de maneira incremental.

---

## 27. Critérios para Criar uma Nova Fronteira

Uma nova fronteira de domínio deve ser considerada quando houver:

- responsabilidade funcional claramente distinta;
- regras de negócio próprias;
- modelo conceitual próprio;
- ciclo de vida independente;
- necessidade de reduzir acoplamento;
- linguagem específica;
- requisitos de segurança diferentes;
- necessidade de evolução independente.

Não é recomendável criar um novo domínio apenas porque existe uma nova
tabela ou uma nova entidade.

---

## 28. Critérios para Dividir um Domínio

Um domínio existente pode ser dividido quando:

- suas responsabilidades se tornarem excessivamente amplas;
- diferentes partes possuírem regras de negócio independentes;
- houver dependências internas difíceis de controlar;
- diferentes partes evoluírem em ritmos diferentes;
- o modelo conceitual possuir múltiplos contextos claramente distintos.

A divisão deve ser guiada pelo domínio e não pela estrutura física dos
arquivos.

---

## 29. Critérios para Evitar Fragmentação

Domain-driven design não significa transformar cada conceito em um
domínio independente.

O Exactum deve evitar:

```text
Product
ProductPrice
ProductStock
ProductCategory
ProductImage
```

como domínios independentes apenas porque são entidades diferentes.

A pergunta correta é:

> Existe uma fronteira de negócio real?

Se a resposta for não, os conceitos provavelmente pertencem ao mesmo
domínio.

---

## 30. Direção para a v0.3.x

A evolução arquitetural da v0.3.x deve priorizar:

- fortalecimento das fronteiras de domínio;
- redução de dependências diretas do Flask;
- redução de dependências diretas de infraestrutura;
- separação entre domínio e persistência;
- refinamento de Application Services;
- definição mais clara de contratos entre domínios;
- melhoria da modelagem de domínio;
- aumento da cobertura de testes;
- documentação das decisões arquiteturais.

A refatoração deve ser incremental.

Não é objetivo da v0.3.x introduzir complexidade arquitetural sem
necessidade.

---

## 31. Testabilidade

Fronteiras de domínio mais claras também devem melhorar a testabilidade.

A direção arquitetural desejada é permitir testar regras de negócio sem
precisar iniciar toda a infraestrutura da aplicação.

Idealmente:

```text
Domain Test
    │
    ├── No HTTP
    ├── No Flask
    ├── No PostgreSQL
    └── No Redis
```

Enquanto testes de integração continuam responsáveis por validar as
integrações reais:

```text
Integration Test
    │
    ├── PostgreSQL
    ├── Redis
    └── Application
```

A separação entre testes unitários e testes de integração deverá evoluir
junto com as fronteiras arquiteturais.

---

## 32. Relação com Segurança

As fronteiras de domínio também possuem impacto sobre segurança.

Authorization, Tenant Context e Authentication são preocupações
relacionadas, mas possuem responsabilidades distintas:

```text
Authentication
    │
    └── Quem é?

Tenant Context
    │
    └── Em qual organização está operando?

Authorization
    │
    └── O que pode fazer?
```

Essa separação deve ser preservada.

Nenhum domínio de negócio deve assumir que uma operação é segura apenas
porque recebeu uma requisição autenticada.

A autorização deve permanecer uma responsabilidade explícita da camada
apropriada.

---

## 33. Relação com Auditoria

A auditoria também atravessa múltiplos domínios.

Exemplo:

```text
User Created
Product Updated
Sale Completed
Tenant Suspended
Impersonation Started
```

Esses eventos podem ter origem em diferentes domínios.

A auditoria não deve transformar cada domínio em responsável por
implementar seu próprio mecanismo de persistência de auditoria.

O domínio deve fornecer o contexto necessário e uma camada apropriada
de aplicação/infraestrutura deve coordenar o registro.

---

## 34. Regra de Ouro

Uma fronteira deve existir para proteger uma responsabilidade.

Não para criar mais diretórios.

Não para seguir um padrão arquitetural por obrigação.

Não para transformar o Exactum artificialmente em um sistema
distribuído.

A arquitetura deve existir para tornar o sistema mais compreensível,
testável, seguro e evolutivo.

---

## 35. Resumo

As fronteiras atuais do Exactum podem ser resumidas como:

```text
┌─────────────────────────────────────────────────────────┐
│                        Exactum                          │
│                                                         │
│  Platform                                               │
│     │                                                   │
│     ├── Auth                                            │
│     ├── Tenants                                         │
│     ├── Users                                           │
│     ├── Authorization                                   │
│     │                                                   │
│     ├── Products                                        │
│     ├── Inventory                                       │
│     ├── Sales                                           │
│     │                                                   │
│     └── Reporting                                       │
│                                                         │
│  Cross-cutting concerns                                 │
│     ├── Observability                                   │
│     ├── Audit                                           │
│     └── Security Infrastructure                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Essas fronteiras representam o estado arquitetural atual e a direção
pretendida para a evolução do Exactum.

A partir da v0.3.x, elas devem ser utilizadas como referência para
refatorações, decisões de design, organização do código e definição de
novos contratos entre componentes.

---

## Nota sobre a Evolução dos Domínios

As fronteiras de domínio descritas neste documento representam a direção
arquitetural pretendida para a evolução do Exactum e não necessariamente
correspondem integralmente à organização atual do código.

Na versão `v0.2.x`, algumas responsabilidades que conceitualmente pertencem
a contextos distintos ainda permanecem agrupadas em módulos existentes. Em
particular:

- responsabilidades de **Inventory** ainda estão distribuídas principalmente
  entre `Products` e `Sales`;
- responsabilidades de **Reporting** ainda são derivadas e implementadas
  principalmente dentro dos contextos de `Products` e `Sales`;
- algumas fronteiras apresentadas neste documento ainda não possuem módulos
  ou pacotes independentes na implementação atual.

Essa organização é uma consequência da evolução incremental do projeto. O
objetivo não é introduzir uma separação artificial antes que exista uma
necessidade real de negócio ou arquitetural para ela.

Durante a evolução para a `v0.3.x` e versões posteriores, essas
responsabilidades serão progressivamente extraídas para fronteiras de
domínio mais explícitas, conforme suas regras de negócio, modelos e
dependências se tornem suficientemente independentes.

Portanto, este documento deve ser interpretado em dois níveis:

1. **Estado atual** — descreve onde as responsabilidades estão efetivamente
   implementadas hoje.
2. **Direção arquitetural** — descreve as fronteiras para as quais o sistema
   está evoluindo.

A separação entre esses dois níveis é intencional e permite que a documentação
acompanhe a evolução arquitetural sem exigir que cada refatoração intermediária
seja imediatamente refletida em toda a documentação de domínio.
