# ADR-004 — Redis-Based Session Management

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Security / Architecture
- **Related Areas:** Session Management, Authentication, Security, Redis, Authorization, Observability
- **Supersedes:** Stateless JWT-Only Session Management
- **Superseded By:** None

---

# 1. Context

O Exactum utiliza JWT como mecanismo de autenticação.

Conforme definido na **ADR-003 — HttpOnly Cookie Authentication**, o access token e o refresh token são armazenados em cookies HttpOnly e gerenciados pelo navegador.

Entretanto, uma arquitetura baseada exclusivamente na validade criptográfica dos JWTs apresenta uma limitação importante:

> Depois que um JWT é emitido, sua validade não depende necessariamente de um estado centralizado no servidor.

Enquanto o token estiver criptograficamente válido e dentro de seu período de expiração, o backend pode considerá-lo válido sem consultar um estado externo.

Esse comportamento é adequado para determinados cenários, mas não atende completamente aos requisitos do Exactum.

O sistema precisa ser capaz de controlar sessões de forma mais dinâmica, incluindo situações como:

- logout;
- revogação de sessão;
- invalidação de refresh token;
- bloqueio de usuário;
- suspensão de tenant;
- controle de sessões;
- refresh token rotation;
- encerramento de sessões comprometidas;
- impersonation;
- rastreamento de sessões;
- futura limitação de sessões simultâneas;
- futura detecção de reutilização de refresh token.

Além disso, a arquitetura multi-tenant do Exactum exige que o estado de sessão possa ser associado não apenas ao usuário, mas também ao tenant e ao contexto de autenticação correspondente.

Dessa forma, foi decidido complementar a autenticação baseada em JWT com **gerenciamento de sessão server-side utilizando Redis**.

---

# 2. Decision

O Exactum utilizará **Redis como armazenamento de estado de sessão associado à autenticação**.

O JWT continuará sendo utilizado para transportar informações de autenticação, mas sua validade não será tratada como a única fonte de verdade para o ciclo de vida da sessão.

O Redis será utilizado para armazenar e consultar informações relacionadas ao estado das sessões.

Conceitualmente:

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │                      │
                    │ HttpOnly Cookies     │
                    │ ├─ Access Token      │
                    │ └─ Refresh Token     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Exactum API      │
                    │                      │
                    │ JWT Validation       │
                    │ Session Validation   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │        Redis         │
                    │                      │
                    │ Session State        │
                    │ JTI                  │
                    │ Revocation           │
                    │ Impersonation State  │
                    └──────────────────────┘
```

A responsabilidade de cada componente é separada:

- **JWT:** representa a identidade/contexto da autenticação;
- **Browser:** armazena e envia os tokens através de cookies;
- **Redis:** mantém estado necessário para controlar o ciclo de vida das sessões;
- **Backend:** decide se uma requisição autenticada pode continuar.

---

# 3. Why Redis

Redis foi escolhido por ser adequado para armazenar informações de sessão que precisam ser acessadas com baixa latência e que possuem ciclo de vida controlado.

As características relevantes para o Exactum incluem:

- acesso rápido por chave;
- suporte a expiração automática;
- estruturas simples para armazenamento de estado;
- baixa latência;
- possibilidade de armazenar TTL;
- facilidade de integração com a aplicação Flask;
- capacidade de suportar crescimento da quantidade de sessões.

O gerenciamento de sessão não exige que esse estado seja persistido no PostgreSQL como parte do modelo transacional principal da aplicação.

Redis é, portanto, utilizado como uma camada de **ephemeral security state**.

---

# 4. Session State vs Authentication Token

É importante distinguir duas coisas:

### JWT

Representa informações sobre a autenticação.

Exemplo conceitual:

```text
JWT
 ├── subject
 ├── tenant
 ├── role
 ├── JTI
 └── expiration
```

### Session State

Representa o estado atual que o servidor mantém sobre aquela autenticação.

Exemplo:

```text
Session
 ├── JTI
 ├── user
 ├── tenant
 ├── created_at
 ├── expires_at
 ├── revoked
 └── additional state
```

Essa separação permite que o Exactum mantenha as vantagens dos JWTs sem depender exclusivamente de um modelo completamente stateless.

---

# 5. Session Identifier

As sessões utilizam o **JWT ID (JTI)** como identificador relevante para o gerenciamento do estado associado ao token.

O JTI permite distinguir diferentes tokens e diferentes ciclos de sessão.

Conceitualmente:

```text
User
 │
 ├── Session A
 │     └── JTI A
 │
 ├── Session B
 │     └── JTI B
 │
 └── Session C
       └── JTI C
```

Isso permite que uma sessão específica seja identificada e invalidada sem necessariamente invalidar todas as demais sessões do usuário.

---

# 6. Redis Key Strategy

O estado de sessão deve ser organizado através de chaves previsíveis e específicas.

Um formato conceitual é:

```text
session:<refresh_jti>
```

ou outra convenção equivalente definida pela implementação.

O princípio importante é que a chave deve identificar inequivocamente o estado associado à sessão.

O formato exato da chave é considerado detalhe de implementação e pode evoluir sem alterar a decisão arquitetural.

---

# 7. Session Lifecycle

Uma sessão possui um ciclo de vida controlado.

Conceitualmente:

```text
              ┌─────────────┐
              │   Created   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   Active    │
              └──────┬──────┘
                     │
          ┌──────────┼───────────┐
          │          │           │
          ▼          ▼           ▼
       Refresh     Logout     Revoke
          │          │           │
          │          │           │
          ▼          │           │
       Rotated       │           │
          │          │           │
          └────┬─────┘           │
               │                 │
               ▼                 ▼
          ┌────────────────────────┐
          │        Invalid         │
          └────────────────────────┘
```

Uma sessão pode deixar de ser válida por diferentes motivos:

- logout;
- revogação administrativa;
- expiração;
- rotação;
- bloqueio do usuário;
- suspensão do tenant;
- detecção de condição de segurança;
- encerramento explícito da sessão.

---

# 8. Login

Durante o login:

1. o usuário fornece suas credenciais;
2. o backend autentica o usuário;
3. o backend cria os tokens;
4. o backend registra o estado necessário da sessão;
5. o backend envia os cookies ao navegador.

Conceitualmente:

```text
Credentials
     │
     ▼
Authentication
     │
     ▼
Create JWTs
     │
     ▼
Create Session State
     │
     ▼
Store in Redis
     │
     ▼
Set Cookies
```

A sessão passa a ser reconhecida pelo backend enquanto o estado correspondente permanecer válido.

---

# 9. Refresh

O refresh representa uma operação de continuidade da sessão.

Quando o access token não é mais utilizável, o cliente solicita renovação através do endpoint de refresh.

O backend:

1. recebe o refresh token;
2. valida sua integridade;
3. identifica o JTI;
4. consulta o estado correspondente da sessão;
5. verifica se a sessão continua válida;
6. realiza a rotação quando aplicável;
7. invalida o estado anterior;
8. cria os novos tokens;
9. atualiza o estado da sessão;
10. envia os novos cookies.

Conceitualmente:

```text
Refresh Request
      │
      ▼
Validate Refresh Token
      │
      ▼
Extract JTI
      │
      ▼
Lookup Session in Redis
      │
      ├── Invalid ──► Reject
      │
      ▼
Validate Session
      │
      ▼
Rotate Session
      │
      ▼
Issue New Tokens
```

Essa integração entre JWT e Redis é fundamental para permitir revogação efetiva do refresh token.

---

# 10. Refresh Token Revocation

Uma das principais razões para utilizar estado server-side é permitir que o backend invalide uma sessão antes da expiração natural do JWT.

Por exemplo:

```text
Refresh Token
     │
     ▼
Redis Session
     │
     ├── Active → continue
     │
     └── Revoked → reject
```

Dessa forma, a existência de um JWT criptograficamente válido não significa automaticamente que a sessão ainda esteja autorizada a continuar.

---

# 11. Logout

O logout deve invalidar a sessão correspondente.

O fluxo conceitual é:

```text
POST /auth/logout
       │
       ▼
Identify Session
       │
       ▼
Revoke Session in Redis
       │
       ▼
Clear Authentication Cookies
```

O objetivo é impedir que a sessão continue sendo utilizada após o encerramento explícito.

A remoção dos cookies no navegador é importante para impedir novas requisições autenticadas pelo cliente.

A invalidação no Redis é importante para impedir a utilização continuada de credenciais que eventualmente ainda existam em algum contexto.

---

# 12. Revocation

A arquitetura permite que o backend revogue uma sessão independentemente da ação direta do usuário.

Casos possíveis incluem:

- administrador encerra a sessão;
- usuário é bloqueado;
- tenant é suspenso;
- atividade suspeita é detectada;
- credencial é comprometida;
- refresh token é reutilizado;
- política de segurança determina encerramento da sessão.

O princípio é:

> **Session validity is an application-controlled state, not merely a JWT expiration property.**

---

# 13. User Blocking

O bloqueio de um usuário deve impedir que suas sessões continuem sendo utilizadas de maneira indevida.

Dependendo do fluxo e do tipo de token, o backend pode utilizar diferentes mecanismos:

```text
User Blocked
     │
     ├── Existing Session
     │       │
     │       ▼
     │     Reject
     │
     └── New Login
             │
             ▼
           Reject
```

O estado de bloqueio do usuário permanece uma regra de domínio/autorização e não deve depender exclusivamente da existência ou ausência de uma chave no Redis.

Redis complementa esse mecanismo fornecendo controle de sessão.

---

# 14. Tenant Suspension

O mesmo princípio se aplica à suspensão de um tenant.

Uma sessão válida não deve permitir que um usuário continue acessando recursos de um tenant que deixou de estar autorizado a operar.

O fluxo conceitual é:

```text
Authenticated Session
        │
        ▼
Tenant Context
        │
        ▼
Tenant Status
        │
        ├── Active ──► Continue
        │
        └── Suspended ──► Reject
```

Isso mantém a separação entre:

- Authentication;
- Session Management;
- Tenant Isolation;
- Authorization.

Redis não substitui essas regras.

---

# 15. Multiple Sessions

Um usuário pode possuir mais de uma sessão simultaneamente.

Exemplo:

```text
User Rafael
   │
   ├── Desktop Session
   │      └── JTI A
   │
   ├── Notebook Session
   │      └── JTI B
   │
   └── Mobile Session
          └── JTI C
```

A arquitetura não exige que todas as sessões sejam tratadas como uma única unidade.

Isso permite futuras funcionalidades como:

- listar sessões;
- encerrar uma sessão específica;
- encerrar todas as sessões;
- identificar sessões antigas;
- limitar quantidade de sessões;
- detectar comportamentos anômalos.

---

# 16. Session Revocation Granularity

A revogação deve ocorrer preferencialmente no nível da sessão quando a situação permitir.

Por exemplo:

```text
JTI A → revoked
JTI B → active
JTI C → active
```

Isso é diferente de invalidar todas as sessões do usuário.

A possibilidade de revogação granular reduz impactos desnecessários sobre sessões legítimas.

Quando um incidente exige encerramento global, o backend poderá invalidar todas as sessões relacionadas ao usuário.

---

# 17. Redis TTL

O estado armazenado no Redis deve possuir tempo de expiração compatível com o ciclo de vida da sessão.

O TTL evita que sessões expiradas permaneçam indefinidamente no armazenamento.

Conceitualmente:

```text
Session Created
      │
      ▼
TTL = Session Lifetime
      │
      ▼
Expiration
      │
      ▼
Redis removes state
```

O TTL deve ser alinhado com as políticas de expiração definidas para os tokens e para a sessão.

O valor exato do TTL é uma decisão operacional/configurável e não constitui, por si só, uma regra permanente desta ADR.

---

# 18. Redis Is Not the Primary Domain Database

Redis não substitui o PostgreSQL como banco de dados principal do Exactum.

O PostgreSQL permanece responsável pelos dados persistentes da aplicação, como:

- usuários;
- tenants;
- produtos;
- vendas;
- permissões;
- configurações;
- demais entidades do domínio.

Redis é utilizado para dados de natureza operacional e temporária relacionados à sessão.

A distinção é:

```text
PostgreSQL
    │
    └── Persistent Business State

Redis
    │
    └── Ephemeral Security / Session State
```

---

# 19. Failure Considerations

A dependência do Redis introduz uma consideração operacional importante.

Se o backend precisar consultar Redis para validar determinado estado de sessão e Redis estiver indisponível, a aplicação deverá adotar uma política segura.

Para operações que dependem de estado de sessão, o sistema não deve simplesmente assumir:

```text
Redis unavailable
      ↓
Session valid
```

Isso poderia transformar uma falha de infraestrutura em uma falha de segurança.

A política deve favorecer **fail closed** para operações cuja segurança depende do estado armazenado no Redis.

Conceitualmente:

```text
Session Check
     │
     ▼
Redis Available?
   │       │
  Yes      No
   │       │
   ▼       ▼
Validate  Reject /
Session   Unavailable
```

Essa decisão deve ser equilibrada com requisitos de disponibilidade e poderá ser refinada em futuras decisões operacionais.

---

# 20. Security Boundary

Redis não deve ser considerado uma autoridade independente sobre identidade.

O fluxo correto é:

```text
JWT
 │
 ├── Identity
 ├── Claims
 └── JTI
        │
        ▼
Redis
 │
 └── Session State
        │
        ▼
Backend
 │
 ├── Authentication
 ├── Authorization
 ├── Tenant Isolation
 └── Session Validation
```

O backend combina as informações necessárias para determinar se a requisição pode prosseguir.

Nenhum cliente externo deve ter acesso direto ao Redis.

---

# 21. Redis Access

O Redis deve permanecer em uma rede protegida da infraestrutura da aplicação.

A comunicação deve ocorrer entre serviços autorizados.

O navegador, frontend público e clientes externos não devem acessar Redis diretamente.

Conceitualmente:

```text
Internet
   │
   ▼
Cloudflare / Nginx
   │
   ▼
Exactum API
   │
   ▼
Redis
```

Não:

```text
Browser
   │
   ▼
Redis
```

---

# 22. Session Data Minimization

O estado armazenado no Redis deve conter apenas as informações necessárias para gerenciar a sessão.

Não devem ser armazenadas informações desnecessárias ou segredos que não sejam necessários para o controle da sessão.

Especialmente, logs e dados operacionais não devem registrar:

- access tokens completos;
- refresh tokens completos;
- cookies de autenticação;
- credenciais do usuário.

A arquitetura deve seguir o princípio de **data minimization** para informações de autenticação.

---

# 23. Observability

Eventos relacionados a sessão podem ser observados sem expor credenciais.

Exemplos:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
SESSION_CREATED
SESSION_REFRESHED
SESSION_REVOKED
LOGOUT
SESSION_EXPIRED
```

Esses eventos podem carregar informações contextuais como:

- user UUID;
- tenant UUID;
- JTI, quando apropriado e seguro;
- request ID;
- correlation ID;
- timestamp;
- origem operacional;
- resultado da operação.

Tokens e segredos não devem ser registrados.

A observabilidade deve permitir responder perguntas como:

> Quando uma sessão foi criada?

> Quando foi encerrada?

> Qual usuário estava associado?

> Qual tenant estava associado?

> Qual requisição realizou a operação?

Sem transformar os logs em um repositório de credenciais.

---

# 24. Impersonation

O gerenciamento de sessão também é utilizado pelo mecanismo de **impersonation** do Exactum.

Durante uma sessão de impersonation, o backend precisa manter informações suficientes para recuperar a identidade original do super-admin.

No modelo atual, existe estado associado ao refresh JTI da sessão, incluindo informações como:

```text
impersonation:<refresh_jti>
    │
    ├── original_user_id
    ├── original_tenant_id
    └── started_at
```

Esse estado permite que o backend diferencie:

```text
Original Administrator
        │
        ▼
Impersonated User
```

A implementação detalhada do modelo de impersonation será registrada na ADR correspondente.

A ADR-004 estabelece apenas a infraestrutura conceitual necessária para manter estado server-side associado à sessão.

---

# 25. Relationship with HttpOnly Cookies

A decisão desta ADR complementa diretamente a **ADR-003**.

A ADR-003 responde:

> Onde as credenciais são armazenadas no navegador?

Resposta:

> HttpOnly cookies.

A ADR-004 responde:

> Como o servidor controla o estado da sessão?

Resposta:

> Redis.

Portanto:

```text
             ADR-003
                │
                ▼
       HttpOnly Authentication
                │
                ▼
             JWTs
                │
                ▼
             JTI
                │
                ▼
             ADR-004
                │
                ▼
       Redis Session State
```

As duas decisões são complementares, não concorrentes.

---

# 26. Alternatives Considered

## 26.1 Stateless JWT Only

### Descrição

Utilizar somente JWT e considerar o token válido enquanto:

- assinatura válida;
- token não expirado;
- claims válidas.

### Vantagens

- arquitetura simples;
- nenhuma consulta externa por sessão;
- menor dependência de infraestrutura;
- alta escalabilidade horizontal.

### Desvantagens

- revogação imediata mais difícil;
- logout não necessariamente invalida um token já emitido;
- menor controle sobre sessões individuais;
- dificuldade maior para gerenciamento de múltiplas sessões;
- maior dificuldade para responder a eventos de segurança.

### Decisão

**Não adotado como modelo completo de sessão do Exactum.**

JWT continua sendo utilizado, mas complementado por estado server-side.

---

# 27. PostgreSQL as Session Store

### Descrição

Armazenar todas as sessões diretamente no PostgreSQL.

### Vantagens

- persistência centralizada;
- ferramenta já utilizada pelo sistema;
- consultas relacionais;
- possibilidade de auditoria histórica.

### Desvantagens

- maior carga sobre o banco transacional;
- operações de alta frequência de sessão competiriam com workloads do domínio;
- TTL e expiração seriam menos naturais;
- latência e throughput menos adequados para estado altamente volátil;
- sessões não representam dados centrais do domínio.

### Decisão

**Não adotado como armazenamento primário de sessão.**

PostgreSQL continua sendo o banco principal das entidades persistentes do Exactum.

---

# 28. In-Memory Application State

### Descrição

Manter sessões diretamente na memória do processo Flask.

### Vantagens

- extremamente simples;
- acesso rápido.

### Desvantagens

- não funciona adequadamente com múltiplas instâncias;
- perda de sessão em restart;
- não compartilha estado entre processos;
- dificulta scaling horizontal;
- não é apropriado para ambiente distribuído.

### Decisão

**Rejeitado.**

---

# 29. Redis-Based Session Management

### Descrição

Manter estado de sessão compartilhado e temporário no Redis.

### Vantagens

- baixa latência;
- TTL nativo;
- compartilhamento entre instâncias;
- revogação centralizada;
- adequado para estado temporário;
- integração natural com refresh token rotation;
- suporta evolução para múltiplas sessões.

### Desvantagens

- adiciona dependência operacional;
- exige monitoramento;
- exige estratégia para indisponibilidade;
- aumenta a complexidade da infraestrutura.

### Decisão

**Adotado.**

---

# 30. Consequences

## 30.1 Positive Consequences

A decisão permite:

- revogação de sessões;
- logout efetivo;
- controle server-side do ciclo de vida;
- refresh token rotation;
- múltiplas sessões;
- encerramento granular;
- suporte a impersonation;
- futura limitação de sessões;
- futura detecção de reuse;
- integração com eventos de segurança;
- compartilhamento de estado entre instâncias da API.

---

## 30.2 Negative Consequences

A decisão introduz:

- dependência adicional de Redis;
- necessidade de monitoramento;
- necessidade de política para falhas do Redis;
- consultas adicionais durante operações relacionadas à sessão;
- maior complexidade arquitetural;
- necessidade de sincronizar TTLs e expiração;
- necessidade de testes específicos de sessão.

---

# 31. Performance Considerations

O gerenciamento de sessão adiciona operações de leitura e/ou escrita no Redis.

Essas operações precisam ser consideradas no desenho de endpoints de autenticação e refresh.

Entretanto, Redis foi escolhido justamente por possuir características adequadas para workloads de baixa latência e alto volume de operações simples.

A arquitetura também permite separar:

```text
PostgreSQL
→ persistent business data

Redis
→ high-frequency session state
```

reduzindo a necessidade de utilizar o banco transacional principal para operações de sessão.

---

# 32. Horizontal Scaling

A utilização de Redis permite que múltiplas instâncias da API compartilhem o mesmo estado de sessão.

Exemplo:

```text
                 ┌──────────────┐
                 │    Nginx     │
                 └──────┬───────┘
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
          API #1      API #2      API #3
             │          │          │
             └──────────┼──────────┘
                        │
                        ▼
                     Redis
```

Uma sessão criada através da API #1 pode ser reconhecida pela API #2 ou API #3.

Isso evita dependência do estado local de um único processo.

---

# 33. Testing Implications

A implementação deve possuir testes para os principais estados da sessão.

Entre eles:

### Creation

- sessão criada após login;
- JTI registrado;
- TTL configurado.

### Validation

- sessão ativa aceita;
- sessão inexistente rejeitada;
- sessão revogada rejeitada;
- sessão expirada rejeitada.

### Refresh

- refresh válido;
- refresh inválido;
- refresh revogado;
- rotação de refresh;
- tentativa de reutilização de token anterior.

### Logout

- sessão invalidada;
- cookies removidos;
- nova utilização rejeitada.

### Security Events

- usuário bloqueado;
- tenant suspenso;
- sessão encerrada administrativamente.

### Impersonation

- criação do estado de impersonation;
- identificação do usuário original;
- encerramento da impersonation;
- invalidação correta do estado associado.

---

# 34. Operational Implications

Redis passa a ser um componente importante da infraestrutura de autenticação.

Consequentemente, a operação do Exactum deve considerar:

- disponibilidade do Redis;
- conectividade entre API e Redis;
- autenticação do Redis;
- persistência/configuração apropriada conforme o ambiente;
- memória disponível;
- eviction policy;
- monitoramento;
- métricas;
- alertas;
- backup quando necessário para o tipo de dado armazenado.

Como o estado de sessão é temporário, a estratégia operacional de Redis pode ser diferente da estratégia utilizada para o PostgreSQL.

A perda de estado de sessão pode exigir que usuários realizem login novamente, mas não deve resultar em perda dos dados de negócio persistentes do Exactum.

---

# 35. Failure and Recovery

Caso o Redis seja reiniciado ou seu estado seja perdido, as sessões armazenadas podem deixar de existir.

Isso pode resultar em:

```text
Redis State Lost
       │
       ▼
Existing Session State Missing
       │
       ▼
Authentication Session Invalid
       │
       ▼
User Re-authentication
```

Essa consequência é aceitável dentro do modelo atual porque o Redis não contém o estado persistente do negócio.

A aplicação deve priorizar segurança sobre a manutenção artificial de sessões quando o estado necessário para validá-las não estiver disponível.

---

# 36. Data Retention

O estado de sessão deve possuir retenção limitada.

Sessões expiradas não devem permanecer indefinidamente no Redis.

O TTL fornece um mecanismo natural para essa limpeza.

Dados de observabilidade relacionados à sessão possuem política própria e não devem ser confundidos com o estado operacional armazenado no Redis.

Portanto:

```text
Redis Session State
→ short-lived operational state

Audit / Platform Events
→ historical operational/security record
```

---

# 37. Future Evolution

A arquitetura foi projetada para permitir futuras evoluções, incluindo:

- gerenciamento de múltiplas sessões por usuário;
- tela de sessões ativas;
- logout remoto;
- encerramento de todas as sessões;
- limite de sessões simultâneas;
- identificação de dispositivo;
- last activity;
- detecção de refresh token reuse;
- session fingerprinting;
- políticas de segurança adaptativas;
- métricas de autenticação;
- alertas de comportamento anômalo;
- integração com Prometheus/Grafana;
- eventos assíncronos de segurança;
- armazenamento complementar de informações históricas de sessão.

Essas funcionalidades devem ser adicionadas através de novas decisões quando alterarem significativamente o modelo arquitetural.

---

# 38. Related Decisions

- **ADR-001 — Shared Database Multi-Tenancy**

  - Define o modelo de isolamento entre tenants.

- **ADR-002 — Public UUID Identifiers**

  - Define a identidade pública dos recursos.

- **ADR-003 — HttpOnly Cookie Authentication**

  - Define como as credenciais de autenticação são armazenadas e transportadas pelo navegador.

- **ADR-005 — Refresh Token Rotation**

  - Define a política de rotação dos refresh tokens.

- **ADR-006 — Impersonation Model**

  - Define o modelo de impersonation.

- **ADR-008 — Observability Strategy**

  - Define a estratégia geral de observabilidade da plataforma.

---

# 39. Related Documentation

Esta decisão está relacionada principalmente aos seguintes documentos:

```text
docs/security/authentication.md
docs/security/session-management.md
docs/security/authorization.md
docs/security/threat-model.md
docs/security/tenant-isolation.md

docs/api/authentication.md

docs/architecture/overview.md
docs/architecture/application-architecture.md

docs/observability/overview.md
docs/observability/platform-events.md
docs/observability/audit-logging.md
docs/observability/correlation.md
```

---

# 40. Architectural Principle

A decisão pode ser resumida pelo seguinte princípio:

> **JWTs provide authentication context; server-side session state provides control over the authentication lifecycle.**

No contexto do Exactum:

> **A validade criptográfica do JWT não deve ser a única fonte de verdade para o ciclo de vida de uma sessão.**

O backend deve possuir mecanismos para controlar, revogar e invalidar sessões independentemente da expiração natural dos tokens quando requisitos de segurança ou operação exigirem.

---

# 41. Decision Summary

| Aspecto                      | Decisão                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| Authentication mechanism     | JWT                                                               |
| Browser storage              | HttpOnly cookies                                                  |
| Session state                | Redis                                                             |
| Session identifier           | JTI                                                               |
| Persistent business database | PostgreSQL                                                        |
| Session storage              | Redis                                                             |
| Session TTL                  | Sim                                                               |
| Logout revocation            | Sim                                                               |
| Server-side revocation       | Sim                                                               |
| Refresh validation           | JWT + session state                                               |
| Refresh rotation             | Sim                                                               |
| Multiple sessions            | Suportadas conceitualmente                                        |
| Granular revocation          | Suportada                                                         |
| User blocking                | Backend                                                           |
| Tenant suspension            | Backend                                                           |
| Impersonation state          | Redis/session state                                               |
| Client access to Redis       | Não                                                               |
| Token logging                | Proibido                                                          |
| Horizontal scaling           | Suportado                                                         |
| Redis failure policy         | Segurança priorizada / fail closed quando o estado for necessário |
| PostgreSQL replacement       | Não                                                               |
| Stateless JWT-only           | Não adotado                                                       |
| Historical audit state       | Separado do Redis                                                 |

---

# 42. Final Decision

O Exactum adotará **Redis como camada de gerenciamento server-side do estado das sessões de autenticação**.

JWT continuará sendo utilizado para representar o contexto de autenticação, enquanto Redis fornecerá o estado necessário para controlar o ciclo de vida dessas sessões.

O backend será responsável por combinar:

- validade criptográfica do JWT;
- expiração;
- JTI;
- estado da sessão;
- identidade do usuário;
- tenant;
- autorização;
- políticas de segurança.

Essa arquitetura permite que o Exactum mantenha os benefícios de JWT sem depender de um modelo completamente stateless.

**Decisão final:**

> **Adotar Redis como armazenamento de estado temporário de sessões, utilizando o JTI como identificador relevante, permitindo revogação, controle de ciclo de vida, refresh, logout, múltiplas sessões e futuras capacidades de segurança, enquanto o PostgreSQL permanece como fonte persistente dos dados de negócio.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de responsabilidade e os conceitos apresentados nesta ADR representam o estado atual e a direção arquitetural do Exactum. Algumas nomenclaturas são conceituais e podem não corresponder exatamente aos nomes utilizados na implementação. O formato das chaves Redis, os campos armazenados, os TTLs e outros detalhes internos podem evoluir sem necessariamente alterar esta decisão arquitetural. Da mesma forma, mecanismos adicionais de segurança e gerenciamento de sessões poderão ser introduzidos através de novas ADRs conforme o sistema evoluir.
