# Session Management

## Objetivo

Este documento descreve o modelo de gerenciamento de sessões do Exactum, incluindo criação, manutenção, renovação, revogação e encerramento de sessões autenticadas.

O Exactum utiliza um modelo de autenticação consciente de sessão (_session-aware authentication_), no qual os JWTs fornecem credenciais assinadas enquanto o Redis mantém o estado necessário para controlar o ciclo de vida das sessões.

Esse modelo permite que sessões sejam invalidadas antes da expiração natural dos tokens, possibilitando operações como logout, bloqueio de usuários, suspensão de tenants e revogação administrativa.

A autenticação propriamente dita é detalhada em:

→ [`authentication.md`](./authentication.md)

---

# Princípios

O gerenciamento de sessões segue os seguintes princípios:

- Sessões possuem ciclo de vida explícito;
- O backend mantém controle sobre o estado das sessões;
- Refresh tokens são associados ao estado de sessão no Redis;
- Refresh tokens são rotacionados durante operações de renovação;
- Sessões podem ser revogadas antes da expiração;
- Logout invalida a sessão correspondente;
- Mudanças administrativas podem invalidar sessões;
- A ausência do estado esperado no Redis impede a renovação da sessão;
- O frontend não é responsável por controlar a validade da sessão;
- O estado de sessão não substitui as verificações de autorização.

---

# Modelo de Sessão

Uma sessão representa a associação entre uma identidade autenticada e um conjunto de credenciais temporárias utilizadas para manter o acesso à plataforma.

Conceitualmente:

```text
User
 │
 ▼
Session
 │
 ├── Access Token
 │
 └── Refresh Token
         │
         ▼
       Redis
```

O access token representa o acesso de curta duração à API.

O refresh token representa a capacidade de renovar a sessão.

O Redis fornece o estado necessário para determinar se essa capacidade de renovação continua válida.

---

# Session-Aware Authentication

O Exactum não depende exclusivamente da validade criptográfica dos JWTs.

Em um modelo puramente stateless:

```text
JWT válido
   │
   ▼
Access Granted
```

No modelo do Exactum:

```text
JWT válido
   │
   ▼
Session State
   │
   ├── Valid ───────► Continue
   │
   └── Invalid ─────► Reject
```

Isso é especialmente relevante para refresh tokens.

Um refresh token pode possuir uma assinatura válida e ainda assim não representar uma sessão válida.

A sessão precisa continuar reconhecida pelo servidor.

---

# Redis como Session Store

O Redis é utilizado como mecanismo de estado para as sessões de autenticação.

Sua utilização permite operações de baixa latência relacionadas ao ciclo de vida das sessões.

Entre as informações relacionadas à sessão estão:

- Identificador do refresh token;
- Identidade do usuário;
- Estado de validade da sessão;
- Expiração do estado;
- Informações necessárias para revogação.

O Redis não substitui o PostgreSQL como banco de dados principal da aplicação.

A separação conceitual é:

```text
PostgreSQL
     │
     └── Persistent Application Data

Redis
     │
     └── Ephemeral Session State
```

O PostgreSQL mantém os dados persistentes de usuários, tenants e demais entidades.

O Redis mantém o estado temporário necessário para o gerenciamento das sessões.

---

# Identificação da Sessão

O ciclo de vida da sessão utiliza identificadores associados ao JWT e à identidade do usuário.

O `jti` (_JWT ID_) é utilizado para identificar o token de forma individual.

Conceitualmente:

```text
Refresh Token
     │
     ├── JTI
     │
     └── User Identity
             │
             ▼
        Session Key
             │
             ▼
           Redis
```

A combinação entre identificador do token e identidade permite localizar o estado correspondente da sessão.

---

# Criação de Sessão

Uma sessão é criada após uma autenticação bem-sucedida.

O fluxo simplificado é:

```text
Login
  │
  ▼
Validate Credentials
  │
  ▼
Create Session
  │
  ├───────────────┐
  ▼               ▼
Access Token   Refresh Token
                    │
                    ▼
                  Redis
```

Durante a criação:

1. As credenciais do usuário são validadas;
2. A identidade do usuário é estabelecida;
3. Os tokens são gerados;
4. O refresh token é associado ao estado da sessão;
5. O estado é armazenado no Redis;
6. Os cookies de autenticação são configurados.

A sessão passa então a ser considerada ativa.

---

# Estado da Sessão

Uma sessão pode ser entendida através de estados conceituais.

```text
                 ┌──────────┐
                 │ Created  │
                 └────┬─────┘
                      │
                      ▼
                 ┌──────────┐
                 │  Active  │
                 └────┬─────┘
                      │
            ┌─────────┼─────────┐
            │         │         │
            ▼         ▼         ▼
         Refresh    Logout    Revoke
            │         │         │
            ▼         ▼         ▼
         Active    Revoked   Revoked
                      │
                      ▼
                  Terminated
```

Uma sessão ativa pode ser renovada enquanto o refresh token e o estado correspondente continuarem válidos.

Uma sessão revogada não pode ser utilizada para renovar o acesso.

---

# Access Token e Estado da Sessão

O access token possui uma vida útil limitada e é utilizado nas requisições normais à API.

O fato de uma sessão existir não significa que o access token permaneça válido indefinidamente.

```text
Session
  │
  ├── Access Token ──► Short-lived
  │
  └── Refresh Token ─► Session Renewal
```

Quando o access token expira, o cliente utiliza o mecanismo de refresh para obter uma nova credencial de acesso.

O estado da sessão é então consultado para determinar se a renovação continua permitida.

---

# Refresh Token como Credencial de Sessão

O refresh token é a principal credencial associada à continuidade da sessão.

Seu uso é controlado por duas condições:

```text
Refresh Token
     │
     ├── JWT Valid?
     │       │
     │       ▼
     │     Yes
     │
     └── Session Exists?
             │
             ▼
           Yes
             │
             ▼
        Refresh Allowed
```

Se qualquer uma das condições não for satisfeita, a operação deve ser rejeitada.

---

# Refresh Flow

O fluxo de renovação de sessão ocorre quando o access token não pode mais ser utilizado.

```text
Access Token Expired
        │
        ▼
Refresh Request
        │
        ▼
Validate Refresh JWT
        │
        ▼
Extract Session Identity
        │
        ▼
Lookup Redis
        │
        ▼
Session Exists?
      /       \
    No         Yes
    │           │
    ▼           ▼
 Reject       Rotate
                │
                ▼
          New Access Token
                │
                ▼
          New Refresh Token
                │
                ▼
          Revoke Previous
                │
                ▼
           Store New State
                │
                ▼
            New Cookies
```

A renovação é, portanto, uma operação de transição entre estados de sessão.

---

# Refresh Token Rotation

O Exactum utiliza rotação de refresh tokens.

Quando um refresh token é utilizado com sucesso, ele deixa de representar a credencial de renovação atual.

Um novo refresh token é criado.

```text
Refresh Token A
      │
      ▼
    Refresh
      │
      ├── Revoke A
      │
      └── Create B
             │
             ▼
          Active
```

Isso reduz a janela de reutilização de tokens de renovação antigos.

---

# Reutilização de Refresh Token

Depois que um refresh token é rotacionado, o token anterior não deve continuar sendo aceito para renovação.

Exemplo:

```text
Initial Session
      │
      ▼
Refresh Token A
      │
      ▼
    Refresh
      │
      ├── A → Revoked
      │
      └── B → Active
```

Uma tentativa posterior de utilizar `A` deve falhar porque o estado correspondente já não representa a sessão ativa.

Esse comportamento também fornece uma barreira adicional contra reutilização de credenciais antigas.

---

# Revogação

Revogação é o processo de tornar uma sessão inválida antes de sua expiração natural.

Conceitualmente:

```text
Active Session
      │
      ▼
Revoke
      │
      ▼
Remove / Invalidate Session State
      │
      ▼
Session No Longer Renewable
```

A revogação é particularmente importante porque JWTs possuem validade criptográfica própria.

Sem um mecanismo de estado externo, um JWT válido poderia permanecer utilizável até sua expiração.

O Redis permite reduzir essa dependência.

---

# Motivos para Revogação

Uma sessão pode ser revogada por diferentes motivos.

Entre eles:

- Logout voluntário;
- Bloqueio de usuário;
- Suspensão de tenant;
- Ação administrativa;
- Encerramento da sessão;
- Invalidação de credenciais;
- Expiração do estado no Redis.

O mecanismo de revogação é o mesmo conceitoualmente:

```text
Session
   │
   ▼
Invalidate Server-side State
   │
   ▼
Refresh No Longer Accepted
```

---

# Logout

O logout encerra a sessão atual.

O fluxo é:

```text
Logout
  │
  ▼
Identify Session
  │
  ▼
Revoke Refresh Token
  │
  ▼
Clear Cookies
  │
  ▼
Session Terminated
```

A revogação ocorre no servidor.

A remoção dos cookies ocorre no cliente.

As duas operações são importantes:

```text
Server
  └── Revoke Session

Browser
  └── Remove Credentials
```

Apenas remover o cookie não seria suficiente para invalidar uma sessão que ainda estivesse registrada no servidor.

---

# Bloqueio de Usuário

O bloqueio de um usuário representa uma mudança administrativa que pode exigir a invalidação de suas sessões.

Conceitualmente:

```text
User
 │
 ├── Account State → Blocked
 │
 └── Sessions
       │
       ├── Session A
       ├── Session B
       └── Session C
                │
                ▼
             Revoke
```

O objetivo é impedir que sessões previamente estabelecidas continuem fornecendo acesso após a alteração do estado da conta.

A decisão sobre quais sessões devem ser invalidadas pertence às regras de negócio e segurança da aplicação.

---

# Suspensão de Tenant

A suspensão de um tenant representa outra condição que pode afetar o estado das sessões associadas.

```text
Tenant
  │
  ▼
Suspended
  │
  ▼
Tenant Sessions
  │
  ▼
Access Restricted
```

A plataforma deve impedir que sessões vinculadas a um tenant suspenso continuem realizando operações normais.

Esse controle ocorre em conjunto com as verificações de identidade, autorização e contexto de tenant.

O isolamento entre tenants é documentado em:

→ [`tenant-isolation.md`](./tenant-isolation.md)

---

# Expiração

Sessões possuem múltiplos mecanismos de expiração.

Podemos separar conceitualmente:

```text
Access Token
    │
    └── Short Lifetime

Refresh Token
    │
    └── Longer Lifetime

Redis Session State
    │
    └── Controlled Lifetime
```

O access token pode expirar sem que a sessão termine.

Nesse caso, o refresh token pode ser utilizado para obter uma nova credencial.

A sessão termina quando o refresh também deixa de ser válido ou quando seu estado é revogado.

---

# Expiração do Estado no Redis

O Redis é um armazenamento apropriado para informações temporárias de sessão porque permite associar dados a uma política de expiração.

Conceitualmente:

```text
Session State
      │
      ▼
Redis
      │
      ├── Active
      │
      └── TTL
           │
           ▼
        Expired
           │
           ▼
      Refresh Rejected
```

A expiração automática evita que entradas de sessões antigas permaneçam indefinidamente no armazenamento.

O tempo exato de expiração deve permanecer alinhado ao ciclo de vida dos refresh tokens.

---

# Sessões Simultâneas

O gerenciamento de sessões também permite representar múltiplas sessões de um mesmo usuário.

Por exemplo:

```text
User
 │
 ├── Session A
 ├── Session B
 └── Session C
```

Cada sessão possui seu próprio estado de renovação.

Isso permite que uma sessão possa ser encerrada sem necessariamente invalidar todas as demais, quando a regra de negócio assim determinar.

O controle granular também cria espaço para futuras funcionalidades como:

- Listagem de sessões;
- Encerramento remoto;
- Identificação de sessões antigas;
- Limite de sessões simultâneas;
- Revogação seletiva.

Essas funcionalidades dependem das regras e capacidades implementadas em cada versão.

---

# Sessão e Dispositivo

O conceito de sessão pode futuramente ser associado a informações adicionais do contexto de acesso.

Exemplos:

- User agent;
- IP;
- Data de criação;
- Último uso;
- Dispositivo;
- Localização aproximada;
- Identificador da sessão.

No estágio atual, essas informações não devem ser tratadas como parte obrigatória do modelo de sessão caso não estejam persistidas como estado de sessão.

A documentação deve refletir apenas os metadados efetivamente mantidos pela implementação.

---

# Session Lifecycle

O ciclo de vida completo pode ser representado da seguinte forma:

```text
                       ┌───────────┐
                       │   Login   │
                       └─────┬─────┘
                             │
                             ▼
                       ┌───────────┐
                       │  Created  │
                       └─────┬─────┘
                             │
                             ▼
                       ┌───────────┐
                       │   Active  │
                       └─────┬─────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
             Refresh      Logout       Revoke
                │            │            │
                ▼            └─────┬──────┘
          Rotate Tokens            │
                │                  │
                ▼                  ▼
             Active            Terminated
                │
                ▼
             Expired
                │
                ▼
           Terminated
```

A sessão pode retornar ao estado ativo através da rotação de tokens enquanto o refresh token permanecer válido.

Depois da revogação ou expiração definitiva, a sessão deixa de ser renovável.

---

# Falhas de Sessão

A renovação pode falhar quando:

- O refresh token está expirado;
- A assinatura do JWT é inválida;
- O refresh token não está mais registrado no Redis;
- O usuário não existe;
- O usuário está bloqueado;
- O tenant está suspenso;
- O contexto da sessão é inválido;
- A sessão foi revogada.

O sistema deve tratar essas situações como falhas de autenticação ou sessão, sem confiar no estado fornecido pelo cliente.

---

# Responsabilidades dos Componentes

| Componente             | Responsabilidade                              |
| ---------------------- | --------------------------------------------- |
| Browser                | Armazenar e enviar cookies                    |
| Frontend               | Iniciar operações de refresh e logout         |
| Flask API              | Validar e controlar o ciclo de sessão         |
| Authentication Service | Orquestrar operações de autenticação e sessão |
| Token Service          | Criar tokens                                  |
| Redis                  | Armazenar estado temporário da sessão         |
| PostgreSQL             | Armazenar dados persistentes                  |
| Authorization          | Validar permissões                            |
| Tenant Context         | Estabelecer contexto de tenant                |
| Audit / Events         | Registrar operações relevantes                |

---

# Segurança

O gerenciamento de sessões possui impacto direto na segurança da plataforma.

Os principais mecanismos são:

### HttpOnly Cookies

Reduzem a exposição dos tokens ao JavaScript do navegador.

### Refresh Token Rotation

Evita que um único refresh token permaneça válido indefinidamente.

### Server-side Session State

Permite revogação antecipada.

### Redis TTL

Evita retenção indefinida de estado temporário.

### Backend Authority

O cliente não controla diretamente o estado da sessão.

### Separation of Concerns

Autenticação, autorização e isolamento de tenant possuem responsabilidades distintas.

---

# Relação com Autenticação

O gerenciamento de sessão é uma extensão da arquitetura de autenticação.

A relação pode ser representada:

```text
Authentication
      │
      ▼
Identity
      │
      ▼
Session
      │
      ├── Access Token
      │
      └── Refresh Token
               │
               ▼
             Redis
```

A autenticação estabelece a identidade.

O gerenciamento de sessão controla a continuidade dessa identidade ao longo do tempo.

---

# Relação com Autorização

A sessão não determina quais operações um usuário pode executar.

O fluxo completo é:

```text
Request
   │
   ▼
Authentication
   │
   ▼
Session Validation
   │
   ▼
Identity
   │
   ▼
Authorization
   │
   ▼
Permission Decision
```

Uma sessão válida é necessária para acessar recursos protegidos, mas não é suficiente para garantir autorização.

Os detalhes estão documentados em:

→ [`authorization.md`](./authorization.md)

---

# Relação com Multi-Tenancy

Sessões também participam da construção do contexto de tenant.

Conceitualmente:

```text
Session
   │
   ▼
Authenticated Identity
   │
   ▼
Tenant Context
   │
   ▼
Authorization
   │
   ▼
Tenant-scoped Operation
```

O gerenciamento de sessão não substitui o isolamento de tenant.

As regras de isolamento estão documentadas em:

→ [`tenant-isolation.md`](./tenant-isolation.md)

---

# Observabilidade

Operações relevantes de sessão podem gerar informações úteis para diagnóstico e segurança.

Exemplos:

- Login;
- Logout;
- Refresh;
- Revogação;
- Falha de autenticação;
- Bloqueio de usuário;
- Suspensão de tenant;
- Impersonate.

Esses eventos devem ser diferenciados entre:

```text
Operational Logs
        │
        ├── Request / Runtime Information
        │
        └── Diagnostic Context

Platform Events
        │
        └── Administrative Actions

Audit Logs
        │
        └── Tenant-visible Business Activity
```

A arquitetura completa de observabilidade está documentada em:

→ [`../observability/overview.md`](../observability/overview.md)

---

# Considerações de Consistência

Operações de sessão que alteram o estado no Redis precisam considerar a ordem das operações.

Durante uma rotação, por exemplo:

```text
Validate Old
     │
     ▼
Create New
     │
     ▼
Revoke Old
     │
     ▼
Persist New State
```

O fluxo deve evitar estados intermediários que permitam que credenciais inconsistentes sejam aceitas.

As operações de sessão devem ser projetadas considerando possíveis falhas entre:

- Geração de tokens;
- Atualização do Redis;
- Atualização dos cookies;
- Processamento da requisição.

---

# Confiabilidade

O Redis representa estado temporário importante para a continuidade das sessões.

Consequentemente, sua disponibilidade influencia diretamente a capacidade de renovar sessões.

A arquitetura atual aceita essa dependência porque o Redis faz parte do modelo de controle de sessão.

Entretanto:

```text
Redis unavailable
       │
       ▼
Session State Unavailable
       │
       ▼
Refresh Cannot Be Safely Validated
```

Nesse cenário, o sistema deve falhar de maneira segura, evitando assumir que uma sessão continua válida sem conseguir verificar seu estado.

---

# Limitações Atuais

O gerenciamento de sessões ainda pode evoluir.

Possíveis melhorias futuras incluem:

- Interface para gerenciamento de sessões ativas;
- Revogação seletiva de sessões;
- Encerramento de todas as sessões de um usuário;
- Informações de dispositivo;
- Rastreamento de último uso;
- Métricas específicas de sessões;
- Detecção de padrões anômalos;
- Políticas de limite de sessões;
- Melhorias de observabilidade;
- Estratégias adicionais de recuperação diante de indisponibilidade do Redis.

Essas capacidades dependem do roadmap e dos requisitos futuros da plataforma.

---

# Evolução Arquitetural

A evolução da arquitetura interna prevista para a v0.3.x também pode afetar a organização do código responsável pelo gerenciamento de sessões.

O objetivo é reduzir o acoplamento entre regras de aplicação e detalhes específicos do framework ou da infraestrutura.

Conceitualmente:

```text
Current
──────────────

Application Service
        │
        ├── Flask
        ├── JWT
        └── Redis


Future
──────────────

Application / Domain
        │
        ▼
Session Abstraction
        │
        ├── Token Provider
        └── Session Repository
                    │
                    ▼
                  Redis
```

Essa evolução não implica necessariamente substituir as tecnologias atuais.

O objetivo é melhorar as fronteiras entre:

- Regras de negócio;
- Serviços de aplicação;
- Autenticação;
- Persistência de sessão;
- Framework;
- Infraestrutura.

---

# Documentos Relacionados

### Autenticação

→ [`authentication.md`](./authentication.md)

Descreve login, tokens, cookies HttpOnly e o fluxo geral de autenticação.

### Autorização

→ [`authorization.md`](./authorization.md)

Descreve RBAC, permissões e decisões de autorização.

### Isolamento de Tenant

→ [`tenant-isolation.md`](./tenant-isolation.md)

Descreve as fronteiras utilizadas para garantir isolamento entre tenants.

### Threat Model

→ [`threat-model.md`](./threat-model.md)

Descreve ameaças, ativos, trust boundaries e mitigadores relacionados à segurança.

### Observabilidade

→ [`../observability/overview.md`](../observability/overview.md)

Descreve a arquitetura de logging, eventos e auditoria.

---

# Resumo

O gerenciamento de sessões do Exactum combina tokens JWT com estado de sessão mantido no Redis.

O modelo pode ser resumido como:

```text
                 Authentication
                       │
                       ▼
                    Session
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    Access Token              Refresh Token
          │                         │
          │                         ▼
          │                       Redis
          │                         │
          │                    Session State
          │                         │
          └────────────┬────────────┘
                       ▼
                Session Lifecycle
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
           Refresh   Revoke    Expire
             │         │         │
             └─────────┼─────────┘
                       ▼
                  Terminated
```

Essa abordagem permite que o Exactum mantenha uma arquitetura baseada em JWT sem abrir mão do controle server-side necessário para revogação e gerenciamento do ciclo de vida das sessões.

O Redis atua como o componente de estado temporário que conecta a natureza stateless dos tokens ao modelo controlável de sessão exigido pela plataforma.

O resultado é uma arquitetura de autenticação consciente de sessão, na qual a validade de uma sessão depende não apenas da validade criptográfica do token, mas também do estado mantido pelo servidor.
