# ADR-006 — Modelo de Impersonation

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Security / Architecture
- **Related Areas:** Authentication, Authorization, Session Management, Multi-Tenancy, Security, Audit Logging
- **Supersedes:** None
- **Superseded By:** None

---

# 1. Contexto

O Exactum possui uma arquitetura multi-tenant na qual usuários operam dentro de um determinado contexto de tenant.

Além das operações normais realizadas pelos usuários, existe um requisito administrativo específico:

> Um **Super Admin da plataforma** precisa poder acessar temporariamente o contexto de outro usuário para investigar problemas, prestar suporte, reproduzir comportamentos ou realizar operações administrativas.

Esse mecanismo é conhecido como **impersonation**.

O impersonation, entretanto, introduz uma questão importante de segurança e identidade.

Durante uma sessão normal:

```text
Authenticated User
        │
        ▼
User Identity
        │
        ▼
Tenant Context
```

Durante uma sessão de impersonation:

```text
Super Admin
     │
     ▼
Impersonated User
     │
     ▼
Target Tenant
```

O sistema precisa manter simultaneamente duas informações conceitualmente diferentes:

1. **quem iniciou a impersonation**;
2. **quem está sendo representado durante a operação**.

Não seria adequado simplesmente substituir a identidade original sem manter uma referência segura ao administrador que iniciou a operação.

Além disso, o mecanismo precisa funcionar em conjunto com:

- JWT;
- HttpOnly cookies;
- Redis session management;
- refresh token rotation;
- multi-tenancy;
- authorization;
- audit logging;
- platform events.

Dessa forma, foi necessária uma decisão arquitetural específica para definir como o Exactum representa e controla uma sessão de impersonation.

---

# 2. Decisão

O Exactum adotará um modelo de **impersonation temporário controlado pelo backend**, no qual:

- somente um **Super Admin** autorizado pode iniciar a impersonation;
- a identidade do usuário impersonado será utilizada pelo **access token**;
- a identidade/contexto original do Super Admin será preservada através do **refresh token e do estado server-side da sessão**;
- o Redis armazenará informações necessárias para relacionar a sessão impersonada ao administrador original;
- o frontend receberá explicitamente o estado de impersonation através do backend;
- todas as operações continuarão sujeitas às regras normais de Authorization e Tenant Isolation;
- o início e o término da impersonation serão registrados através dos mecanismos de observabilidade e auditoria.

O princípio central é:

> **Impersonation changes the operational identity of the session without losing the identity of the administrator who initiated it.**

---

# 3. Modelo de Identidade

O modelo possui duas identidades relevantes.

## 3.1 Identidade Original

É o usuário que iniciou a impersonation.

No modelo atual, essa identidade corresponde ao:

```text
Super Admin
```

Essa identidade mantém a autoridade para iniciar e encerrar a operação.

---

## 3.2 Identidade Representada

É o usuário cujo contexto está sendo temporariamente representado.

Essa identidade é utilizada para determinar o contexto operacional das requisições durante a impersonation.

Exemplo:

```text
Original Identity
    │
    │ Super Admin
    ▼
Impersonated Identity
    │
    │ User
    ▼
Target Tenant
```

---

# 4. Por que Duas Identidades São Necessárias

Uma implementação ingênua poderia simplesmente substituir o usuário autenticado:

```text
Super Admin
     │
     ▼
User B
```

Porém, após essa substituição, o sistema poderia perder a informação de que a sessão foi originalmente iniciada pelo Super Admin.

Isso dificultaria:

- retornar ao contexto original;
- identificar quem iniciou a impersonation;
- registrar corretamente eventos;
- auditar ações;
- impedir escalada indevida;
- controlar o encerramento da impersonation.

Portanto, a arquitetura preserva explicitamente as duas identidades.

---

# 5. Representação da Autenticação

A sessão utiliza dois tokens com responsabilidades diferentes.

Durante impersonation:

### Access Token

Representa o usuário impersonado.

Conceitualmente:

```text
Access Token
    │
    ├── impersonated user
    ├── target tenant
    └── authorization context
```

### Refresh Token

Preserva o contexto necessário para recuperar a identidade original.

Conceitualmente:

```text
Refresh Token
    │
    ├── original Super Admin
    └── session context
```

Essa separação permite que o backend saiba:

```text
Quem está sendo representado?
        +
Quem iniciou a representação?
```

---

# 6. Estado da Sessão

Como definido na ADR-004, o Redis mantém o estado server-side da sessão.

Durante uma impersonation, esse estado também mantém a relação entre a sessão atual e a identidade original.

No modelo atual, a estrutura conceitual é:

```text
impersonation:<refresh_jti>
    │
    ├── original_user_id
    ├── original_tenant_id
    └── started_at
```

O formato exato da chave e dos campos pode evoluir.

O princípio arquitetural é que a informação necessária para recuperar a identidade original não deve depender exclusivamente de informações manipuláveis pelo frontend.

---

# 7. Por que o Redis é Utilizado

A informação de impersonation representa estado temporário associado à sessão.

Ela não constitui uma entidade de negócio permanente.

Portanto, o Redis é adequado para manter esse estado operacional.

O PostgreSQL continua sendo responsável pelas entidades persistentes do domínio.

```text
PostgreSQL
    │
    └── Persistent Domain State

Redis
    │
    ├── Session State
    └── Impersonation State
```

---

# 8. Autorização para Iniciar Impersonation

Impersonation não é uma funcionalidade disponível para qualquer usuário.

O backend deve verificar explicitamente se o ator possui autoridade para iniciar a operação.

No modelo atual, essa autoridade pertence ao **Super Admin da plataforma**.

O frontend não pode simplesmente declarar:

```json
{
  "impersonate": true
}
```

e esperar que a operação seja aceita.

A autorização deve ser determinada pelo backend.

Conceitualmente:

```text
Authenticated Actor
       │
       ▼
Authorization Check
       │
       ├── Super Admin → Continue
       │
       └── Other Role → Reject
```

---

# 9. Início do Impersonation

O início da impersonation ocorre através de um endpoint específico da API.

O fluxo conceitual é:

```text
Super Admin
     │
     │ Start impersonation
     ▼
Backend
     │
     ├── Authenticate actor
     ├── Authorize Super Admin
     ├── Validate target user
     ├── Validate target tenant
     ├── Create impersonation state
     ├── Generate authentication context
     └── Set authentication cookies
             │
             ▼
       Impersonated Session
```

O backend é responsável por garantir que o usuário alvo exista e que o contexto de tenant seja válido.

---

# 10. Validação do Usuário-Alvo

Antes de iniciar a impersonation, o backend deve validar o usuário alvo.

Entre as verificações relevantes estão:

- usuário existe;
- usuário pertence ao contexto permitido;
- tenant existe;
- tenant está em estado compatível com a operação;
- usuário não está em uma condição que impeça a operação;
- Super Admin possui autoridade para acessar aquele contexto.

A existência do UUID do usuário não é suficiente para autorizar a operação.

---

# 11. Validação do Tenant

A impersonation também deve respeitar o modelo de multi-tenancy.

O Super Admin atua em nível de plataforma, mas o usuário impersonado continua pertencendo a um tenant específico.

O backend deve estabelecer corretamente:

```text
Super Admin
     │
     ▼
Target User
     │
     ▼
Target Tenant
```

Durante a impersonation, as requisições devem operar dentro do contexto do tenant do usuário impersonado.

A impersonation não deve ser utilizada como mecanismo para contornar Tenant Isolation.

---

# 12. Access Token Durante Impersonation

O access token representa a identidade operacional atual.

Portanto, durante impersonation:

```text
access_token
    │
    ├── user = impersonated user
    ├── tenant = target tenant
    └── authorization context
```

Isso permite que as camadas da aplicação processem a requisição como sendo realizada pelo usuário impersonado.

Consequentemente, as regras normais de Authorization continuam sendo aplicadas.

---

# 13. Refresh Token Durante Impersonation

O refresh token possui uma responsabilidade diferente.

Ele mantém o contexto necessário para preservar a relação com o Super Admin original.

Conceitualmente:

```text
refresh_token
    │
    ├── original user
    ├── session JTI
    └── refresh context
```

Durante o refresh, o backend utiliza esse contexto para reconstruir corretamente a sessão impersonada.

Isso impede que uma renovação de token perca a relação com o administrador original.

---

# 14. Refresh Durante Impersonation

O refresh de uma sessão impersonada deve manter o estado de impersonation.

Exemplo:

```text
Super Admin
     │
     ▼
Impersonate User B
     │
     ▼
Access B
Refresh Original
     │
     ▼
Refresh
     │
     ├── New Access B
     └── New Refresh Context
```

O novo access token continua representando o usuário impersonado.

O novo refresh token continua preservando o contexto necessário da sessão original.

---

# 15. Rotação de Refresh Token

A impersonation deve respeitar a política de **Refresh Token Rotation** definida na ADR-005.

Portanto:

```text
Refresh A
    │
    ▼
Refresh
    │
    ├── A revoked
    └── B issued
```

O estado de impersonation associado à sessão deve acompanhar a rotação.

A rotação não deve apagar ou substituir incorretamente a identidade original.

---

# 16. Estado do Impersonation Durante a Rotação

Considerando:

```text
Refresh A
   │
   └── original = Super Admin
```

Após rotação:

```text
Refresh B
   │
   └── original = Super Admin
```

O relacionamento permanece:

```text
Refresh A → revoked
Refresh B → active
                 │
                 └── original Super Admin
```

A sessão continua representando o usuário alvo no access token.

---

# 17. Representação no Frontend

Como os tokens são HttpOnly, o frontend não pode decodificar os JWTs para determinar se a aplicação está em modo de impersonation.

Isso é uma consequência deliberada da arquitetura definida na ADR-003.

Portanto, o backend deve fornecer explicitamente o estado necessário para a interface.

Exemplo conceitual:

```json
{
  "impersonating": true,
  "user": {
    "uuid": "..."
  },
  "tenant": {
    "uuid": "..."
  }
}
```

O formato exato da resposta pertence à API e pode evoluir.

O princípio é:

> **The frontend consumes impersonation state; it does not infer it by inspecting authentication credentials.**

---

# 18. Responsabilidade da UI

Quando uma sessão está em impersonation, o frontend deve tornar esse estado claramente perceptível.

Isso reduz o risco operacional de o administrador esquecer que está atuando como outro usuário.

A interface pode apresentar informações como:

- indicação de impersonation;
- usuário atual;
- tenant atual;
- ação para encerrar impersonation.

O frontend, entretanto, não decide se a impersonation existe.

Essa decisão pertence ao backend.

---

# 19. Encerramento do Impersonation

O término da impersonation também é controlado pelo backend.

O fluxo conceitual é:

```text
Impersonated Session
       │
       │ Stop impersonation
       ▼
Backend
       │
       ├── validate session
       ├── recover original identity
       ├── terminate impersonated context
       ├── restore original context
       └── issue authentication cookies
               │
               ▼
          Super Admin Session
```

Após o término, o administrador retorna ao seu contexto original.

---

# 20. Restauração da Identidade Original

O objetivo do stop impersonation é restaurar:

```text
Original User
       +
Original Tenant
```

em vez de simplesmente realizar logout completo.

Portanto:

```text
Super Admin
     │
     ▼
Impersonate User B
     │
     ▼
User B Context
     │
     ▼
Stop
     │
     ▼
Super Admin Context
```

O mecanismo deve preservar a continuidade da sessão original sempre que a política de segurança permitir.

---

# 21. Isolamento de Sessões

A sessão impersonada deve ser tratada como um contexto controlado.

O usuário impersonado não deve conseguir transformar sua própria identidade em Super Admin.

Por exemplo, se o usuário alvo possuir privilégios administrativos dentro do tenant:

```text
Super Admin
     │
     ▼
Impersonate Tenant Admin
     │
     ▼
Tenant Admin Context
```

isso não significa que o access token passa a possuir privilégios de Super Admin.

O contexto de plataforma permanece separado.

---

# 22. Fronteira de Privilégio

Impersonation não deve resultar em **privilege escalation**.

A autoridade original:

```text
Super Admin
```

não deve ser confundida com a autoridade operacional:

```text
Impersonated User
```

Durante as operações normais do contexto impersonado, o backend deve aplicar as permissões correspondentes ao usuário representado.

Isso significa que o sistema não deve simplesmente combinar:

```text
Super Admin permissions
+
Impersonated User permissions
```

para criar um novo conjunto de permissões.

A identidade operacional deve permanecer claramente definida.

---

# 23. Princípio de Segurança

Um princípio importante da arquitetura é:

> **Impersonation is delegation of operational context, not transfer of platform authority.**

Ou seja:

O Super Admin delega temporariamente o contexto operacional da sessão para representar outro usuário, mas essa operação não transforma o usuário alvo em Super Admin.

---

# 24. Logs de Auditoria

Impersonation é uma operação de segurança relevante e deve ser auditável.

O sistema deve registrar pelo menos:

### Início

- administrador original;
- usuário alvo;
- tenant alvo;
- timestamp;
- request ID/correlation ID quando aplicável;
- contexto da operação.

### Encerramento

- administrador original;
- usuário alvo;
- tenant;
- timestamp;
- contexto da operação.

Conceitualmente:

```text
IMPERSONATION_STARTED
        │
        └── original actor
        └── target user
        └── target tenant
        └── timestamp

IMPERSONATION_STOPPED
        │
        └── original actor
        └── target user
        └── target tenant
        └── timestamp
```

---

# 25. Eventos de Plataforma

Além do audit logging, eventos de plataforma podem representar o ciclo de vida da impersonation.

Exemplos:

```text
IMPERSONATION_STARTED
IMPERSONATION_STOPPED
```

Esses eventos podem alimentar:

- observabilidade;
- auditoria;
- métricas;
- investigação de segurança;
- relatórios administrativos.

---

# 26. Correlação de Requisições

As operações realizadas durante impersonation devem continuar utilizando os mecanismos normais de:

- Request ID;
- Correlation ID;
- Structured Logging.

Isso permite relacionar:

```text
Impersonation Started
       │
       ▼
Requests During Session
       │
       ▼
Impersonation Stopped
```

Sem registrar credenciais sensíveis.

---

# 27. Registro de Tokens

Tokens de autenticação não devem ser registrados.

Isso inclui:

- access token;
- refresh token;
- cookies;
- credenciais.

A auditoria deve registrar identidade e contexto, e não o segredo utilizado para autenticação.

---

# 28. Logout Durante Impersonation

Caso o usuário realize logout enquanto está em impersonation, o comportamento deve encerrar a sessão autenticada correspondente.

O sistema não deve assumir automaticamente que logout equivale a `stop impersonation`.

A diferença conceitual é:

```text
Stop Impersonation
    ↓
Return to Original Session

Logout
    ↓
Terminate Authentication Session
```

O comportamento exato deve seguir a política de sessão definida pelo backend.

---

# 29. Expiração Durante Impersonation

Uma sessão de impersonation deve obedecer às políticas normais de expiração.

Se o refresh token expirar:

```text
Impersonation Session
       │
       ▼
Refresh Expired
       │
       ▼
Session Invalid
```

O sistema deve exigir nova autenticação conforme a política de segurança.

Impersonation não deve criar uma sessão sem limite de duração.

---

# 30. Duração Máxima do Impersonation

A arquitetura permite que seja definida uma duração máxima para impersonation.

Exemplo conceitual:

```text
Start
 │
 ▼
Impersonation Active
 │
 ├── Stop → End
 │
 └── Maximum Duration → End
```

O valor exato não faz parte desta decisão enquanto não existir uma política específica implementada.

Essa capacidade poderá ser registrada em uma ADR futura caso seja adotada.

---

# 31. Impersonation Aninhado

O Exactum não deve permitir que uma impersonation seja utilizada para iniciar outra impersonation sem uma decisão explícita que defina esse comportamento.

O modelo atual deve ser interpretado como:

```text
Super Admin
     │
     ▼
User A
```

e não:

```text
Super Admin
     │
     ▼
User A
     │
     ▼
User B
```

Impersonation aninhada aumenta significativamente a complexidade de:

- identidade;
- auditoria;
- retorno ao contexto original;
- autorização;
- sessão;
- segurança.

Portanto, não faz parte do modelo atual.

---

# 32. Sessões de Impersonation Concorrentes

Um Super Admin pode, dependendo das políticas futuras, possuir mais de uma sessão de impersonation.

Cada sessão deve possuir estado próprio.

Exemplo:

```text
Super Admin
 │
 ├── Impersonation Session A
 │      └── User X
 │
 └── Impersonation Session B
        └── User Y
```

As sessões devem permanecer isoladas.

Uma sessão não deve alterar o estado de outra.

---

# 33. Múltiplos Administradores

O modelo também deve suportar diferentes Super Admins utilizando impersonation simultaneamente.

Exemplo:

```text
Super Admin A
      │
      ▼
User X

Super Admin B
      │
      ▼
User Y
```

O estado de sessão deve manter as associações corretamente isoladas.

O Redis deve identificar as sessões através de identificadores únicos, evitando colisões.

---

# 34. Isolamento de Tenant

Impersonation não modifica o princípio de isolamento entre tenants.

Mesmo que o Super Admin possua autoridade de plataforma:

```text
Platform Authority
        │
        ▼
Target Tenant
        │
        ▼
Target User
```

a sessão impersonada deve possuir um tenant context explícito.

As operações realizadas pelo usuário impersonado continuam passando pelas verificações de tenant.

A impersonation não deve ser usada como bypass das regras de Tenant Isolation.

---

# 35. Autorização Durante Impersonation

A autorização deve considerar a identidade operacional atual.

Exemplo:

```text
Access Token
     │
     ▼
Impersonated User
     │
     ▼
Role
     │
     ▼
Permissions
     │
     ▼
Authorization Decision
```

O Super Admin original não deve automaticamente conceder ao contexto impersonado todas as permissões administrativas de plataforma.

Isso evita confusão entre:

- **actor original**;
- **operational identity**.

---

# 36. Fronteira da API

Os endpoints de impersonation devem permanecer protegidos por Authorization.

Exemplo conceitual:

```text
POST /run-impersonate
POST /stop-impersonate
```

Esses endpoints não devem ser considerados operações comuns de usuários.

A API deve garantir que somente atores autorizados possam executá-los.

---

# 37. Tratamento de Erros

Falhas relacionadas à impersonation devem retornar erros apropriados sem expor informações sensíveis.

Exemplos:

- usuário alvo inexistente;
- usuário não autorizado para impersonation;
- tenant inválido;
- sessão inválida;
- impersonation inexistente;
- tentativa de nested impersonation;
- sessão expirada.

O backend não deve revelar detalhes internos do mecanismo de sessão ou Redis ao cliente.

---

# 38. Alternativas Consideradas

## 38.1 Substituir Completamente o Usuário Atual

### Descrição

Substituir a identidade do Super Admin pela identidade do usuário alvo sem preservar o contexto original.

```text
Super Admin
     │
     ▼
User
```

### Vantagens

- implementação simples;
- modelo aparentemente direto.

### Desvantagens

- perde identidade original;
- dificulta retorno;
- dificulta auditoria;
- aumenta risco de confusão de privilégios;
- dificulta refresh;
- dificulta investigação de segurança.

### Decisão

**Rejeitado.**

---

# 39. Impersonation no Cliente

### Descrição

Permitir que o frontend armazene ou manipule informações para representar outro usuário.

### Vantagens

- implementação aparentemente simples.

### Desvantagens

- frontend não é autoridade de segurança;
- possibilidade de manipulação;
- maior risco de privilege escalation;
- dificuldade de auditoria;
- incompatível com o modelo HttpOnly;
- mistura responsabilidades entre cliente e backend.

### Decisão

**Rejeitado.**

---

# 40. Sessão de Impersonation Separada

### Descrição

Criar uma sessão completamente independente para a impersonation.

### Vantagens

- isolamento claro;
- fácil distinguir sessão original e sessão impersonada.

### Desvantagens

- maior complexidade;
- necessidade de coordenar duas sessões;
- retorno ao contexto original mais complexo;
- maior número de credenciais e estados;
- integração mais complexa com refresh.

### Decisão

**Não adotado como modelo atual.**

O Exactum mantém a relação entre identidade original e identidade impersonada dentro do contexto da sessão controlada.

---

# 41. Preservação de Identidade Baseada em Token

### Descrição

Utilizar os tokens e o estado server-side para preservar a identidade original.

### Vantagens

- aproveita a arquitetura JWT existente;
- integra-se ao Redis;
- funciona com HttpOnly cookies;
- mantém o frontend fora da lógica de segurança;
- permite refresh;
- permite auditoria.

### Desvantagens

- exige distinção cuidadosa entre access e refresh context;
- aumenta complexidade do ciclo de vida dos tokens;
- exige estado server-side.

### Decisão

**Adotado.**

---

# 42. Consequências

## 42.1 Consequências Positivas

A decisão permite:

- suporte seguro a operações administrativas;
- manutenção da identidade original;
- retorno ao contexto original;
- auditoria da operação;
- integração com Redis;
- integração com refresh rotation;
- preservação de Tenant Isolation;
- separação entre autoridade de plataforma e identidade operacional;
- frontend sem acesso a tokens;
- suporte a investigação e suporte administrativo.

---

## 42.2 Consequências Negativas

A decisão introduz:

- maior complexidade de autenticação;
- maior complexidade de sessão;
- necessidade de estado Redis;
- necessidade de auditoria;
- maior complexidade no refresh;
- necessidade de distinguir identidade original e operacional;
- necessidade de testes específicos;
- possibilidade de maior complexidade operacional.

---

# 43. Implicações de Segurança

Impersonation representa uma capacidade de alto privilégio.

Portanto, sua implementação deve ser tratada como uma superfície de segurança crítica.

Devem ser protegidos especialmente:

- início da impersonation;
- encerramento;
- recuperação da identidade original;
- refresh;
- cookies;
- Redis state;
- audit logs;
- authorization.

Qualquer falha nesse mecanismo pode resultar em:

- privilege escalation;
- acesso indevido a tenant;
- perda de rastreabilidade;
- confusão de identidade;
- acesso persistente indevido.

---

# 44. Implicações nos Testes

Os testes devem validar o ciclo completo.

## Início

- Super Admin consegue iniciar;
- usuário comum não consegue;
- usuário alvo válido;
- usuário alvo inválido;
- tenant válido;
- tenant inválido;
- estado Redis criado.

## Acesso

- access token representa usuário alvo;
- tenant correto;
- permissões corretas;
- Super Admin não é exposto como identidade operacional.

## Refresh

- impersonation permanece ativa;
- refresh rotation funciona;
- identidade original permanece preservada;
- novo access token representa o usuário alvo.

## Encerramento

- identidade original recuperada;
- sessão impersonada encerrada;
- novo contexto autenticado criado corretamente.

## Segurança

- nested impersonation rejeitada;
- sessão expirada rejeitada;
- sessão revogada rejeitada;
- tenant suspenso tratado corretamente;
- usuário bloqueado tratado corretamente.

## Auditoria

- `IMPERSONATION_STARTED` registrado;
- `IMPERSONATION_STOPPED` registrado;
- ator original identificado;
- usuário alvo identificado;
- tenant identificado.

---

# 45. Observabilidade

A observabilidade deve permitir reconstruir o ciclo da impersonation.

Exemplo:

```text
IMPERSONATION_STARTED
        │
        ▼
Request A
        │
        ▼
Request B
        │
        ▼
Request C
        │
        ▼
IMPERSONATION_STOPPED
```

Através de:

- Request ID;
- Correlation ID;
- user UUID;
- tenant UUID;
- platform events;
- audit events.

Tokens não devem ser utilizados como mecanismo de auditoria.

---

# 46. Implicações Operacionais

A operação de impersonation deve ser tratada como evento administrativo relevante.

Operadores devem conseguir investigar:

- quem iniciou;
- quem foi impersonado;
- em qual tenant;
- quando começou;
- quando terminou;
- quais requests foram executadas durante o período.

Essa capacidade é especialmente importante para sistemas multi-tenant onde ações administrativas podem afetar dados de terceiros.

---

# 47. Evolução Futura

A arquitetura permite futuras evoluções como:

- duração máxima de impersonation;
- motivo obrigatório;
- ticket/support reference;
- aprovação de segunda pessoa;
- restrição por tenant;
- restrição por tipo de operação;
- banner obrigatório no frontend;
- confirmação antes de ações destrutivas;
- session recording metadata;
- alertas para impersonation;
- métricas de uso;
- notificações de início/término;
- regras de step-up authentication;
- MFA obrigatório para Super Admin;
- políticas de acesso administrativo mais granulares.

Essas funcionalidades devem ser registradas em ADRs próprias quando representarem decisões independentes.

---

# 48. Decisões Relacionadas

- **ADR-001 — Shared Database Multi-Tenancy**

  - Define o isolamento entre tenants.

- **ADR-002 — Public UUID Identifiers**

  - Define a identidade pública dos recursos.

- **ADR-003 — HttpOnly Cookie Authentication**

  - Define o armazenamento e transporte das credenciais.

- **ADR-004 — Redis-Based Session Management**

  - Define o gerenciamento server-side da sessão.

- **ADR-005 — Refresh Token Rotation**

  - Define a rotação dos refresh tokens.

- **ADR-007 — Layered Application Architecture**

  - Define a separação entre as camadas responsáveis pela implementação.

---

# 49. Documentos Relacionados

```text
docs/security/authentication.md
docs/security/authorization.md
docs/security/session-management.md
docs/security/tenant-isolation.md
docs/security/threat-model.md

docs/api/authentication.md

docs/architecture/overview.md
docs/architecture/application-architecture.md
docs/architecture/domain-boundaries.md

docs/observability/platform-events.md
docs/observability/audit-logging.md
docs/observability/correlation.md
```

---

# 50. Princípio Arquitetural

A decisão pode ser resumida pelo seguinte princípio:

> **Impersonation must preserve accountability: the system must always be able to distinguish the administrator who initiated the operation from the user being represented.**

No contexto do Exactum:

> **Impersonation altera temporariamente a identidade operacional da sessão, mas nunca deve apagar a identidade e a autoridade original que iniciaram a operação.**

---

# 51. Resumo da Decisão

| Aspecto                      | Decisão                        |
| ---------------------------- | ------------------------------ |
| Impersonation                | Suportada                      |
| Authorized actor             | Super Admin                    |
| Operational identity         | Impersonated User              |
| Original identity            | Preservada                     |
| Access token                 | Representa usuário impersonado |
| Refresh token                | Preserva contexto original     |
| Session state                | Redis                          |
| Impersonation state          | Redis                          |
| Tenant context               | Target Tenant                  |
| Frontend token access        | Não                            |
| Frontend impersonation state | Fornecido pelo backend         |
| Authorization                | Backend                        |
| Tenant Isolation             | Mantido                        |
| Refresh rotation             | Aplicada                       |
| Audit logging                | Obrigatório                    |
| Platform events              | Suportados                     |
| Nested impersonation         | Não suportada atualmente       |
| Client-side impersonation    | Não permitida                  |
| Token logging                | Proibido                       |
| Maximum duration             | Não definida atualmente        |
| Separate session model       | Não adotado                    |
| Original identity recovery   | Suportada                      |

---

# 52. Decisão Final

O Exactum adotará **backend-controlled impersonation** para permitir que Super Admins atuem temporariamente no contexto de outros usuários.

Durante a impersonation:

- o access token representa o usuário alvo;
- o refresh token preserva o contexto necessário da identidade original;
- o Redis mantém o estado da relação entre a sessão e o administrador original;
- o frontend recebe explicitamente o estado de impersonation;
- Authorization e Tenant Isolation continuam sendo aplicados pelo backend;
- refresh token rotation continua válida;
- início e término da operação são auditáveis.

O mecanismo não permitirá que o frontend determine ou manipule diretamente a identidade de impersonation.

**Decisão final:**

> **Adotar um modelo de impersonation controlado pelo backend, preservando explicitamente a identidade original do Super Admin enquanto a sessão opera temporariamente com a identidade do usuário alvo, utilizando JWT, Redis e os mecanismos existentes de Session Management, Authorization, Tenant Isolation e Audit Logging.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de responsabilidade e os conceitos apresentados nesta ADR representam o estado atual e a direção arquitetural do Exactum. Algumas nomenclaturas são conceituais e podem não corresponder exatamente aos nomes utilizados na implementação. O formato dos claims, as chaves Redis, os endpoints, as políticas de duração e os mecanismos de resposta a eventos de segurança poderão evoluir conforme o sistema amadureça. Esta ADR registra o modelo arquitetural atual de impersonation, enquanto políticas administrativas adicionais poderão ser formalizadas em decisões futuras.
