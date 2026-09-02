# Authorization & RBAC

> Documento de arquitetura responsável por definir o modelo de autorização, controle de acesso e isolamento de contexto utilizado pelo Exactum.

---

## 1. Objetivo

O sistema de autorização do Exactum é responsável por determinar **quais operações um usuário autenticado pode executar**, considerando seu papel, suas permissões e o contexto no qual a operação está sendo realizada.

A autenticação responde:

> **"Quem é o usuário?"**

A autorização responde:

> **"O que esse usuário pode fazer?"**

No Exactum, autorização é uma responsabilidade exclusiva do backend. O frontend pode refletir permissões para melhorar a experiência de usuário, mas nunca é considerado uma fronteira de segurança.

O modelo de autorização foi projetado para suportar:

- múltiplos tenants;
- papéis configuráveis;
- permissões granulares;
- usuários com diferentes níveis de acesso;
- operações administrativas;
- contexto de super-admin;
- impersonate administrativo;
- evolução futura das fronteiras de domínio.

---

## 2. Princípios

O modelo de autorização segue alguns princípios fundamentais.

### 2.1 Backend como autoridade

O backend é a única autoridade sobre autorização.

Qualquer informação enviada pelo frontend relacionada a permissões deve ser tratada apenas como informação de contexto para UX.

Uma requisição que não possua autorização suficiente deve ser rejeitada pela API independentemente do comportamento do frontend.

```text
Frontend
   │
   │  "usuário pode executar X"
   ▼
Backend
   │
   ├── autenticação
   ├── contexto
   ├── autorização
   └── execução
```

O frontend não pode conceder privilégios.

---

### 2.2 Menor privilégio

Usuários devem possuir somente as permissões necessárias para executar suas responsabilidades.

O modelo baseado em permissões granulares permite evitar que o sistema dependa exclusivamente de papéis amplos e rígidos.

---

### 2.3 Autorização contextual

Uma permissão não deve ser analisada isoladamente.

O sistema também considera o contexto no qual a operação ocorre.

No caso de operações tenant-scoped:

```text
User
 │
 ├── Role
 │    └── Permissions
 │
 └── Tenant Context
          │
          ▼
     Authorization
```

Uma permissão válida dentro de um tenant não implica automaticamente autorização para acessar dados pertencentes a outro tenant.

---

### 2.4 Defesa em profundidade

A autorização não deve depender de uma única verificação.

O Exactum combina:

- autenticação;
- contexto de tenant;
- autorização;
- escopo de dados;
- controles de persistência.

Isso reduz o impacto de falhas individuais na aplicação.

---

## 3. Modelo de Controle de Acesso

O Exactum utiliza **Role-Based Access Control (RBAC)** como base do modelo de autorização.

O relacionamento principal é:

```text
User
  │
  ▼
Role
  │
  ▼
Permissions
```

Um usuário recebe um ou mais privilégios através de seu papel.

As permissões representam capacidades específicas do sistema, enquanto os papéis agrupam essas capacidades em conjuntos administráveis.

---

## 4. Conceitos

### 4.1 User

Representa a identidade autenticada que executa uma operação na plataforma.

O usuário possui informações relacionadas à sua identidade e ao contexto administrativo no qual opera.

A identidade do usuário é estabelecida durante a autenticação e utilizada posteriormente pelas camadas de autorização.

---

### 4.2 Role

Representa um conjunto de permissões associado a um usuário.

Um role funciona como uma abstração para evitar que permissões individuais precisem ser atribuídas diretamente a cada usuário.

Exemplo conceitual:

```text
Role: Manager
 │
 ├── product.read
 ├── product.create
 ├── product.update
 ├── inventory.read
 ├── sales.read
 └── sales.create
```

Os papéis podem ser administrados conforme as necessidades do tenant.

---

### 4.3 Permission

Representa uma capacidade específica do sistema.

Uma permissão deve possuir granularidade suficiente para permitir decisões de autorização precisas.

Exemplos conceituais:

```text
product.read
product.create
product.update

sales.read
sales.create

inventory.read
inventory.update

user.read
user.create
user.update
```

A nomenclatura exata das permissões pertence ao contrato da aplicação e pode evoluir conforme novos domínios forem introduzidos.

---

## 5. Relação entre Roles e Permissions

A relação entre papéis e permissões pode ser representada como:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     Role     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Permissions    │
                  ├──────────────────┤
                  │ product.read     │
                  │ product.update   │
                  │ sales.read       │
                  │ sales.create     │
                  │ inventory.read   │
                  └──────────────────┘
```

O papel funciona como mecanismo de agrupamento e administração das permissões.

Isso permite alterar o conjunto de capacidades de um papel sem precisar modificar individualmente todos os usuários associados a ele.

---

## 6. Fluxo de Autorização

Uma requisição protegida segue, conceitualmente, o fluxo:

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
Role Resolution
   │
   ▼
Permission Resolution
   │
   ▼
Authorization Check
   │
   ├── denied ──────► Error
   │
   ▼
Application Operation
   │
   ▼
Repository / Domain
   │
   ▼
Persistence
```

A autorização ocorre **antes da execução da operação protegida**.

Uma falha de autorização deve impedir que a operação de negócio seja executada.

---

## 7. Contexto de Tenant

O Exactum é uma plataforma multi-tenant.

Consequentemente, autorização e isolamento de dados são conceitos relacionados, mas distintos.

Uma autorização válida determina que um usuário pode executar determinada operação.

O isolamento de tenant determina **sobre quais dados essa operação pode atuar**.

```text
Authorization
     │
     ├── What?
     │     └── Permission
     │
     └── Where?
           └── Tenant Context
```

Por exemplo, possuir:

```text
product.read
```

não significa que o usuário possa consultar produtos de qualquer tenant.

A operação deve permanecer limitada ao tenant autorizado.

O modelo completo de isolamento é definido em:

→ `docs/architecture/multi-tenancy.md`

e complementado por:

→ `docs/security/tenant-isolation.md`

---

## 8. Tenant-Scoped Authorization

Para operações normais de negócio, o usuário opera dentro do contexto de um tenant.

O fluxo pode ser representado como:

```text
Authenticated User
        │
        ▼
Tenant Context
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
        ▼
Tenant-scoped Operation
```

Isso significa que uma autorização de negócio deve considerar simultaneamente:

1. identidade do usuário;
2. tenant atual;
3. permissões disponíveis;
4. operação solicitada.

---

## 9. Super-Admin

O Exactum possui um contexto administrativo de nível superior ao tenant.

O **super-admin** representa uma autoridade de plataforma, utilizada para operações administrativas que não pertencem ao escopo normal de um tenant.

Conceitualmente:

```text
                    Platform
                       │
                 ┌─────┴─────┐
                 │Super Admin│
                 └─────┬─────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Tenant A     Tenant B     Tenant C
```

O super-admin pode executar operações administrativas relacionadas à plataforma, como:

- gerenciamento de tenants;
- suspensão de tenants;
- reativação de tenants;
- operações administrativas de conta;
- diagnóstico;
- impersonate.

O contexto de super-admin não deve ser confundido com uma role comum pertencente a um tenant.

---

## 10. Separação entre Tenant Admin e Super-Admin

Existem dois níveis conceituais de administração.

### Tenant Administration

Responsável pela administração de recursos pertencentes ao próprio tenant.

Exemplos:

- usuários;
- roles;
- permissões;
- produtos;
- operações de negócio;
- configurações relacionadas ao tenant.

### Platform Administration

Responsável pela administração da própria plataforma.

Exemplos:

- tenants;
- suspensão de tenants;
- operações administrativas globais;
- diagnóstico;
- impersonate.

A separação desses contextos reduz o risco de que privilégios administrativos de um tenant sejam confundidos com privilégios administrativos da plataforma.

---

## 11. Impersonate Administrativo

O Exactum permite que um super-admin opere temporariamente no contexto de outro usuário.

O impersonate é uma capacidade administrativa excepcional e deve ser tratado como uma operação de segurança sensível.

Conceitualmente:

```text
Super Admin
     │
     │ start impersonation
     ▼
Target User
     │
     ▼
Target Tenant
     │
     ▼
Tenant-scoped Operation
```

Durante o impersonate, o sistema precisa manter a distinção entre:

- administrador original;
- usuário impersonado;
- tenant-alvo.

Isso permite preservar rastreabilidade e responsabilização.

---

## 12. Auditoria do Impersonate

Operações de impersonate devem ser registradas como eventos administrativos.

O sistema registra conceitualmente:

```text
Original Administrator
        │
        ▼
Impersonation Event
        │
        ├── Target User
        ├── Target Tenant
        ├── Action
        └── Request Context
```

Devem ser rastreados, quando aplicável:

- início do impersonate;
- término do impersonate;
- administrador original;
- usuário-alvo;
- tenant-alvo;
- contexto da requisição;
- timestamp.

O objetivo é impedir que uma operação realizada através de impersonate perca a identidade do administrador que iniciou o processo.

A estrutura detalhada dos eventos pertence à documentação de auditoria:

→ `docs/observability/audit-logging.md`

---

## 13. Frontend e Autorização

O frontend pode utilizar informações de autorização para adaptar a experiência do usuário.

Por exemplo:

```text
Permission
     │
     ▼
Frontend
     │
     ├── mostrar botão
     ├── ocultar menu
     └── desabilitar ação
```

Entretanto, essas verificações possuem finalidade exclusivamente de UX.

O frontend **não concede autorização**.

Uma interface pode esconder um botão para um usuário sem determinada permissão, mas isso não substitui a verificação realizada pela API.

O backend deve sempre repetir a decisão de autorização.

---

## 14. Authorization Boundary

A fronteira de autorização está localizada no backend.

```text
                    Trust Boundary
────────────────────────────────────────────

        Browser / Frontend
               │
               │ Untrusted
               ▼
        ┌───────────────┐
        │   Exactum API │
        └───────┬───────┘
                │
                ├── Authentication
                ├── Authorization
                ├── Tenant Context
                └── Business Operation
```

Tudo que vem do cliente deve ser considerado não confiável.

Isso inclui:

- role informada pelo frontend;
- permissões informadas pelo frontend;
- tenant selecionado pelo cliente;
- identificadores de usuário;
- flags de administração;
- qualquer tentativa de alterar contexto privilegiado.

O backend deve derivar e validar essas informações a partir do contexto autenticado e das regras internas da aplicação.

---

## 15. Falhas de Autorização

Quando um usuário autenticado não possui autorização suficiente para executar uma operação, a aplicação deve rejeitar a requisição.

Conceitualmente:

```text
Authenticated
     │
     ▼
Authorization Check
     │
     ├── Allowed ──────► Execute
     │
     └── Denied ───────► Reject
```

Falhas de autorização não devem resultar na execução parcial da operação protegida.

A forma específica de representação dos erros pertence ao contrato da API e é documentada em:

→ `docs/api/errors.md`

---

## 16. Autorização e Persistência

Autorização e persistência possuem responsabilidades diferentes.

A autorização determina:

> **O usuário pode executar esta operação?**

A camada de persistência determina:

> **Quais dados podem ser acessados durante esta operação?**

Essa separação é especialmente importante no contexto multi-tenant.

```text
Authorization
      │
      ▼
Allowed Operation
      │
      ▼
Tenant Scope
      │
      ▼
Repository
      │
      ▼
Tenant-scoped Data
```

Uma autorização bem-sucedida não deve permitir que uma query ignore o contexto do tenant.

---

## 17. Defense in Depth

O modelo de segurança do Exactum utiliza múltiplas barreiras.

```text
┌─────────────────────────────┐
│ Authentication              │
├─────────────────────────────┤
│ Tenant Context              │
├─────────────────────────────┤
│ Authorization               │
├─────────────────────────────┤
│ Tenant-scoped Persistence   │
├─────────────────────────────┤
│ Database Constraints        │
└─────────────────────────────┘
```

Cada camada possui uma responsabilidade distinta.

O objetivo não é assumir que uma única camada será suficiente para impedir todos os erros, mas reduzir a probabilidade e o impacto de falhas de implementação.

---

## 18. Relação com Autenticação

Autenticação e autorização são responsabilidades distintas.

```text
Authentication
      │
      │ "Quem?"
      ▼
Identity
      │
      ▼
Authorization
      │
      │ "Pode fazer o quê?"
      ▼
Permission
      │
      ▼
Operation
```

A autenticação estabelece a identidade.

A autorização utiliza essa identidade para determinar se uma operação pode ser executada.

A arquitetura detalhada de autenticação está documentada em:

→ `docs/security/authentication.md`

---

## 19. Relação com Multi-Tenancy

A autorização não substitui o isolamento de tenant.

O sistema precisa considerar:

```text
Identity
   +
Permission
   +
Tenant Context
   +
Data Scope
```

A autorização responde se determinada capacidade está disponível.

O mecanismo de multi-tenancy determina sobre quais dados essa capacidade pode operar.

A arquitetura detalhada está documentada em:

→ `docs/architecture/multi-tenancy.md`

---

## 20. Relação com Auditoria

Operações relevantes de autorização e administração devem possuir rastreabilidade suficiente para permitir investigação posterior.

Especialmente em operações privilegiadas, o sistema deve ser capaz de responder:

```text
Quem?
  │
  ▼
Executou qual ação?
  │
  ▼
Sobre qual recurso?
  │
  ▼
Em qual tenant?
  │
  ▼
Quando?
```

O mecanismo de auditoria é documentado separadamente em:

→ `docs/observability/audit-logging.md`

---

## 21. Modelo Conceitual Completo

O modelo de autorização pode ser resumido como:

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
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
       Tenant Context             Platform Context
             │                         │
             ▼                         ▼
      Tenant Operation          Super-Admin Operation
             │                         │
             └────────────┬────────────┘
                          ▼
                    Application
                          │
                          ▼
                     Repository
                          │
                          ▼
                  Scoped Persistence
```

---

## 22. Responsabilidades por Camada

| Camada         | Responsabilidade                         |
| -------------- | ---------------------------------------- |
| Authentication | Estabelecer identidade                   |
| Context        | Estabelecer contexto de usuário e tenant |
| Authorization  | Determinar se a operação é permitida     |
| Application    | Executar o caso de uso autorizado        |
| Domain         | Aplicar regras de negócio                |
| Repository     | Acessar dados dentro do escopo permitido |
| Persistence    | Garantir persistência consistente        |
| Audit          | Registrar operações relevantes           |

Essa divisão evita concentrar todas as regras em um único mecanismo de autorização.

---

## 23. Evolução Arquitetural

O modelo atual utiliza RBAC como mecanismo principal de autorização.

Conforme as fronteiras de domínio forem fortalecidas na evolução arquitetural do Exactum, espera-se uma separação mais clara entre:

- regras de autorização;
- políticas de aplicação;
- regras de domínio;
- contexto de tenant;
- infraestrutura de autenticação;
- mecanismos de persistência.

A autorização deve permanecer como uma capacidade transversal sem transformar os domínios de negócio em dependentes diretos do framework HTTP.

A evolução prevista para a `v0.3.x` busca reduzir gradualmente o acoplamento entre essas responsabilidades.

---

## 24. Limitações Atuais

O modelo atual possui algumas limitações conhecidas.

### RBAC como mecanismo principal

O sistema é predominantemente baseado em RBAC.

Modelos mais sofisticados, como:

- ABAC;
- políticas contextuais;
- autorização baseada em atributos;
- políticas específicas por recurso;

podem ser considerados futuramente caso a complexidade do produto justifique sua introdução.

### Acoplamento arquitetural

Algumas responsabilidades relacionadas à autorização ainda fazem parte da arquitetura atual orientada a camadas.

A evolução para fronteiras de domínio mais explícitas deverá permitir uma separação mais clara entre políticas de autorização e infraestrutura.

---

## 25. Decisões Arquiteturais Relacionadas

As decisões relacionadas ao sistema de autorização devem ser registradas em ADRs quando introduzirem mudanças arquiteturais significativas.

Exemplos:

- adoção de RBAC;
- granularidade das permissões;
- separação entre tenant admin e super-admin;
- arquitetura de impersonate;
- estratégia de autorização tenant-scoped;
- evolução para políticas de autorização mais sofisticadas.

Os ADRs relacionados ficam em:

→ `docs/architecture/decisions/`

---

## 26. Documentos Relacionados

### Arquitetura

- `docs/architecture/overview.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`

### Segurança

- `docs/security/overview.md`
- `docs/security/authentication.md`
- `docs/security/session-management.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`

### Observabilidade

- `docs/observability/audit-logging.md`
- `docs/observability/platform-events.md`

### API

- `docs/api/authentication.md`
- `docs/api/errors.md`

---

## 27. Resumo

O sistema de autorização do Exactum é baseado em RBAC, permissões granulares e contexto de tenant.

Seu modelo pode ser resumido como:

```text
Identity
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
   ▼
Tenant / Platform Context
   │
   ▼
Authorized Operation
```

A autorização é aplicada exclusivamente no backend e funciona em conjunto com autenticação, isolamento de tenant, persistência escopada e auditoria.

O modelo atual fornece uma base suficientemente granular para o estágio atual do Exactum, enquanto mantém espaço para uma evolução futura em direção a políticas de autorização mais expressivas e fronteiras arquiteturais mais fortes.

---

**Status do documento:** Draft / Architecture Documentation
**Escopo:** Authorization, RBAC, Tenant-scoped Authorization e Administrative Impersonation
**Última atualização:** 2026
