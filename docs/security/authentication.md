# Authentication

## Objetivo

Este documento descreve a arquitetura de autenticação do Exactum, incluindo o fluxo de login, emissão de tokens, utilização de cookies HttpOnly, renovação de sessão, revogação e logout.

A autenticação do Exactum utiliza JWT em conjunto com um modelo consciente de sessão. Embora os tokens sejam auto-contidos e assinados, o ciclo de vida das sessões é controlado pelo backend através do Redis.

A arquitetura atual foi resultado da evolução de uma implementação anterior baseada em JWT armazenado no `sessionStorage` do navegador para um modelo baseado em cookies `HttpOnly` e gestão explícita de sessão.

---

## Princípios

A arquitetura de autenticação segue alguns princípios fundamentais:

- Tokens não são expostos diretamente ao JavaScript da aplicação;
- O backend é responsável pela emissão e validação das credenciais;
- Access tokens e refresh tokens possuem responsabilidades diferentes;
- Refresh tokens possuem ciclo de vida controlado pelo servidor;
- Refresh tokens podem ser revogados antes de sua expiração;
- A sessão é rastreada através do Redis;
- A renovação de sessão utiliza rotação de refresh token;
- Logout invalida a sessão atual;
- Autenticação e autorização são responsabilidades distintas;
- A existência de um token válido não implica autorização para determinada operação.

---

# Arquitetura Atual

O modelo atual pode ser representado da seguinte forma:

```text
                         Browser
                            │
                            │ HTTPS
                            ▼
                         Nginx
                            │
                            ▼
                       Flask API
                            │
                            ▼
                    Authentication
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
        Access Token              Refresh Token
               │                         │
               ▼                         ▼
       HttpOnly Cookie           HttpOnly Cookie
                                         │
                                         ▼
                                       Redis
                                  Session State
```

O browser mantém os tokens através de cookies gerenciados pelo backend.

O JavaScript da aplicação não precisa acessar diretamente os valores dos tokens.

O Redis mantém o estado necessário para controlar o ciclo de vida das sessões e dos refresh tokens.

---

# Modelo de Tokens

O Exactum utiliza dois tipos de token:

| Token         | Função                             | Uso principal            | Controle              |
| ------------- | ---------------------------------- | ------------------------ | --------------------- |
| Access Token  | Autorizar requisições autenticadas | Acesso à API             | Curta duração         |
| Refresh Token | Renovar a sessão                   | Obtenção de novos tokens | Controlado pelo Redis |

A separação permite reduzir a exposição temporal do token utilizado nas requisições normais.

O access token é utilizado para autenticar as requisições à API.

O refresh token possui uma função diferente: permitir que uma sessão válida continue existindo sem exigir que o usuário forneça novamente suas credenciais.

---

# Cookies HttpOnly

Os tokens são armazenados em cookies configurados pelo backend.

A principal propriedade de segurança utilizada é `HttpOnly`.

Um cookie `HttpOnly` não pode ser lido diretamente através de JavaScript executado no navegador.

Isso significa que o frontend não precisa fazer operações como:

```javascript
localStorage.getItem("token");
```

ou:

```javascript
sessionStorage.getItem("token");
```

para recuperar o token de autenticação.

O navegador envia automaticamente os cookies nas requisições compatíveis.

```text
Browser
   │
   │ Cookie
   ▼
HTTP Request
   │
   ▼
Flask API
```

Essa abordagem reduz a exposição direta dos tokens ao código JavaScript da aplicação.

---

# Evolução da Autenticação

A arquitetura atual não foi a primeira implementação de autenticação do Exactum.

A versão anterior utilizava JWT armazenado no `sessionStorage`.

O fluxo era aproximadamente:

```text
Login
  │
  ▼
JWT
  │
  ▼
sessionStorage
  │
  ▼
Frontend
  │
  ▼
Authorization Header
```

Essa abordagem funcionava, mas fazia com que o token estivesse diretamente acessível ao JavaScript da aplicação.

A arquitetura atual substituiu esse modelo por cookies HttpOnly:

```text
Login
  │
  ▼
Access + Refresh Tokens
  │
  ▼
HttpOnly Cookies
  │
  ▼
Browser
  │
  ▼
Flask API
```

A mudança foi motivada principalmente pela redução da exposição dos tokens ao ambiente JavaScript do navegador e pela necessidade de introduzir um modelo de sessão mais controlável.

---

# Fluxo de Login

O processo de autenticação começa quando o usuário fornece suas credenciais.

O fluxo geral é:

```text
                    Login Request
                          │
                          ▼
                Validate Credentials
                          │
                          ▼
                    User Valid?
                     /       \
                   No         Yes
                   │           │
                   ▼           ▼
                 Reject    Create Session
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
              Access Token         Refresh Token
                    │                     │
                    ▼                     ▼
             HttpOnly Cookie       HttpOnly Cookie
                                          │
                                          ▼
                                        Redis
```

O backend valida as credenciais fornecidas.

Caso sejam válidas, uma nova sessão é criada.

O backend então emite:

- Um access token;
- Um refresh token.

Os tokens são enviados através dos cookies apropriados.

O refresh token também é associado à sessão armazenada no Redis.

---

# Criação da Sessão

A criação da sessão representa a transição entre uma autenticação válida e uma sessão ativa.

De forma simplificada:

```text
Credentials
     │
     ▼
Authentication
     │
     ▼
User Identity
     │
     ▼
Create Tokens
     │
     ▼
Store Refresh Session
     │
     ▼
Set Cookies
```

O Redis passa a representar o estado necessário para reconhecer o refresh token como pertencente a uma sessão válida.

A existência do refresh token no navegador, portanto, não é suficiente para renovar uma sessão.

O backend também verifica o estado correspondente no Redis.

---

# Access Token

O access token representa a credencial utilizada para acessar recursos protegidos da API.

Ele contém as informações necessárias para identificar a identidade autenticada e o contexto necessário para o processamento da requisição.

Entre as informações associadas ao contexto de autenticação podem existir:

- Identidade do usuário;
- Identificador do tenant;
- Papel ou contexto de autorização;
- Identificadores relacionados à sessão;
- Informações necessárias para operações administrativas.

O access token possui vida útil limitada.

Quando expira, ele não é simplesmente aceito novamente.

A aplicação precisa obter um novo access token através do fluxo de refresh.

---

# Refresh Token

O refresh token possui uma função diferente do access token.

Ele não é utilizado para executar diretamente as operações normais da aplicação.

Sua função é permitir que uma sessão autenticada obtenha novos tokens.

O fluxo é:

```text
Refresh Token
      │
      ▼
Validate JWT
      │
      ▼
Identify Session
      │
      ▼
Check Redis
      │
      ▼
Session Valid?
   /         \
 No           Yes
 │             │
 ▼             ▼
Reject      Rotate Tokens
                │
                ▼
          Revoke Old Token
                │
                ▼
          Store New Token
                │
                ▼
          Set New Cookies
```

A validação do refresh token, portanto, possui duas dimensões:

1. Validação criptográfica do JWT;
2. Validação do estado da sessão no Redis.

---

# Gestão de Refresh Tokens com Redis

O Redis funciona como uma camada de controle sobre o ciclo de vida dos refresh tokens.

O sistema associa o refresh token a informações da sessão através de um identificador de sessão/token.

Conceitualmente:

```text
Refresh Token JTI
       +
User Identity
       │
       ▼
Redis Session Entry
```

Durante o refresh, o backend verifica se a sessão correspondente ainda existe.

Caso a entrada não exista, o refresh token é considerado revogado ou inválido para renovação.

Isso permite invalidar sessões sem depender exclusivamente da expiração natural do JWT.

---

# Rotação de Refresh Token

O Exactum utiliza rotação de refresh token.

A cada operação de renovação válida:

1. O refresh token atual é validado;
2. A sessão é localizada;
3. O estado da sessão é verificado no Redis;
4. Um novo access token é criado;
5. Um novo refresh token é criado;
6. O refresh token anterior é revogado;
7. O novo refresh token é armazenado;
8. Os cookies são atualizados.

```text
             Old Refresh Token
                     │
                     ▼
                  Validate
                     │
                     ▼
                Check Redis
                     │
                     ▼
                Revoke Old
                     │
                     ▼
             Generate New Token
                     │
                     ▼
              Store in Redis
                     │
                     ▼
              Set New Cookie
```

Esse mecanismo reduz a possibilidade de reutilização indefinida de um refresh token antigo.

---

# Refresh Token Reuse

Como os refresh tokens são rotacionados, um token anterior deixa de representar a sessão atual após uma renovação bem-sucedida.

Conceitualmente:

```text
Session
  │
  ├── Refresh Token A
  │
  │ refresh
  ▼
Refresh Token B
  │
  └── Token A revoked
```

Uma tentativa posterior de utilizar o token A deve falhar porque seu estado não corresponde mais a uma sessão válida no Redis.

Esse comportamento permite que o servidor mantenha controle sobre quais credenciais de renovação permanecem válidas.

---

# Logout

O logout encerra a sessão atualmente autenticada.

O fluxo é:

```text
Logout Request
      │
      ▼
Authenticate Refresh Context
      │
      ▼
Identify Session
      │
      ▼
Revoke Refresh Token
      │
      ▼
Clear Authentication Cookies
```

O backend revoga o refresh token associado à sessão.

Os cookies de autenticação também são removidos do navegador.

Depois disso, o refresh token não pode mais ser utilizado para renovar a sessão.

---

# Revogação de Sessão

Uma das diferenças importantes entre o modelo atual e uma implementação puramente stateless de JWT é a possibilidade de revogar sessões.

A sessão pode ser invalidada por diferentes motivos, incluindo:

- Logout;
- Bloqueio de usuário;
- Suspensão de tenant;
- Operação administrativa;
- Invalidação de sessão;
- Expiração do estado correspondente no Redis.

O conceito pode ser representado como:

```text
                Active Session
                     │
          ┌──────────┼──────────┐
          │          │          │
        Logout     Block     Suspend
          │          │          │
          └──────────┼──────────┘
                     ▼
              Session Revoked
```

A revogação impede que o refresh token continue renovando a sessão.

---

# Bloqueio de Usuário

A autenticação também participa do ciclo de segurança relacionado ao bloqueio de contas.

Quando um usuário é bloqueado, sessões associadas ao usuário podem ser invalidadas de acordo com as regras da aplicação.

Isso impede que uma sessão previamente criada permaneça indefinidamente válida após uma mudança administrativa de estado.

A decisão de autorização decorrente do bloqueio pertence à camada de autorização e às regras de aplicação.

A autenticação fornece os mecanismos necessários para invalidar o estado de sessão correspondente.

---

# Suspensão de Tenant

A mesma lógica é aplicada ao ciclo de vida do tenant.

Um tenant suspenso não deve continuar permitindo operações normais através de sessões anteriormente estabelecidas.

O estado do tenant participa das verificações de segurança realizadas durante o processamento das requisições.

A separação entre:

```text
User State
Tenant State
Session State
```

permite que a plataforma invalide acesso em diferentes níveis.

---

# Autenticação e Autorização

Autenticação e autorização são conceitos distintos.

A autenticação responde:

> Quem está realizando a requisição?

A autorização responde:

> Essa identidade pode executar esta operação?

```text
Authentication
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

Um access token válido comprova uma identidade autenticada.

Ele não concede automaticamente acesso a todos os recursos da plataforma.

As regras de RBAC e permissões são documentadas separadamente em:

→ [`authorization.md`](./authorization.md)

---

# Contexto de Tenant

Quando uma identidade autenticada pertence a um tenant, o contexto correspondente precisa acompanhar o processamento da requisição.

Conceitualmente:

```text
Authenticated User
       │
       ▼
Tenant Context
       │
       ▼
Authorization
       │
       ▼
Application Operation
```

O contexto de tenant não deve ser considerado um dado fornecido livremente pelo cliente.

Ele é derivado do contexto autenticado e das regras da aplicação.

Os detalhes do isolamento de tenant estão documentados em:

→ [`tenant-isolation.md`](./tenant-isolation.md)

---

# Super-Admin

O Exactum possui um contexto administrativo de plataforma separado do contexto normal de tenant.

Super-administradores podem executar operações que atravessam fronteiras de tenant, de acordo com suas permissões.

Isso inclui operações como:

- Administração de tenants;
- Suspensão de tenants;
- Diagnóstico;
- Administração de usuários;
- Impersonate administrativo.

O contexto administrativo precisa ser tratado explicitamente para evitar que privilégios de plataforma sejam confundidos com privilégios normais de tenant.

---

# Impersonate

O impersonate permite que um super-admin opere temporariamente no contexto de outro usuário.

Esse fluxo possui características especiais porque existem duas identidades relevantes:

```text
Administrator
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

O sistema mantém informações suficientes para distinguir:

- Administrador original;
- Usuário impersonado;
- Tenant do usuário;
- Contexto administrativo.

A operação também é registrada através dos mecanismos de eventos de plataforma e auditoria aplicáveis.

O impersonate não deve ser interpretado como uma simples troca de identidade no frontend.

É uma operação privilegiada controlada pelo backend.

---

# Tratamento de Tokens Inválidos

Tokens podem ser considerados inválidos por diferentes motivos:

- Assinatura inválida;
- Estrutura inválida;
- Token expirado;
- Token ausente;
- Refresh token revogado;
- Sessão inexistente;
- Usuário não encontrado;
- Tenant inválido ou suspenso;
- Contexto de autenticação inconsistente.

O backend traduz essas condições em respostas HTTP apropriadas.

A aplicação também remove cookies de autenticação quando necessário para impedir que o cliente continue enviando credenciais inválidas.

---

# Separação entre Access e Refresh

A separação entre os dois tokens permite estabelecer responsabilidades diferentes.

```text
Access Token
    │
    └── API Authorization

Refresh Token
    │
    └── Session Renewal
             │
             ▼
           Redis
```

O access token é utilizado frequentemente.

O refresh token possui uma responsabilidade mais sensível e, por isso, está associado ao controle de sessão no Redis.

Essa separação também permite que a aplicação mantenha access tokens de vida relativamente curta sem exigir login frequente do usuário.

---

# Segurança dos Cookies

Os cookies de autenticação são configurados pelo backend de acordo com o ambiente e os requisitos de segurança.

As principais propriedades consideradas são:

| Propriedade | Objetivo                                       |
| ----------- | ---------------------------------------------- |
| `HttpOnly`  | Impedir acesso direto pelo JavaScript          |
| `Secure`    | Restringir envio a conexões HTTPS              |
| `SameSite`  | Controlar envio cross-site                     |
| `Path`      | Restringir o escopo do cookie quando aplicável |

A configuração exata pode variar entre desenvolvimento e produção.

Em produção, o tráfego deve ser protegido por HTTPS.

---

# CSRF

A utilização de cookies para autenticação introduz uma consideração importante relacionada a Cross-Site Request Forgery (CSRF).

O modelo atual deve considerar explicitamente a política de CSRF associada aos cookies de autenticação e às configurações do backend.

A proteção não deve depender apenas da propriedade `HttpOnly`, pois `HttpOnly` protege contra leitura do cookie por JavaScript, mas não é, por si só, uma defesa contra CSRF.

Qualquer evolução futura da arquitetura de autenticação deve avaliar:

- Política `SameSite`;
- Origem das requisições;
- Tokens anti-CSRF quando necessários;
- CORS;
- Cookies cross-site;
- Separação entre operações de leitura e escrita.

> A configuração atual de CSRF faz parte da implementação existente e deve ser revisada conforme a arquitetura de frontend, domínio e implantação evoluir.

---

# Expiração

Tokens possuem tempo de vida limitado.

O access token deve expirar antes do refresh token.

Conceitualmente:

```text
Login
 │
 ├──────────── Access Token ────────────┐
 │                                     │
 │                                  Expire
 │                                     │
 └──────────────── Refresh Token ──────┼───────┐
                                       │       │
                                    Refresh   Expire
                                       │       │
                                       ▼       ▼
                                  New Session  Login
```

A expiração do access token não significa necessariamente que a sessão terminou.

Enquanto o refresh token e a sessão correspondente permanecerem válidos, o cliente pode obter novos tokens.

---

# Fluxo Completo

O ciclo completo de autenticação pode ser resumido da seguinte forma:

```text
                         ┌──────────┐
                         │  Login   │
                         └────┬─────┘
                              │
                              ▼
                    Validate Credentials
                              │
                              ▼
                       Create Session
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
         Access Token                Refresh Token
                │                           │
                ▼                           ▼
         HttpOnly Cookie             HttpOnly Cookie
                                            │
                                            ▼
                                          Redis
                                            │
                                            │
                ┌───────────────────────────┘
                │
                ▼
          Authenticated API
                │
                ▼
         Access Token Expires
                │
                ▼
             Refresh
                │
                ▼
          Validate Session
                │
                ▼
          Rotate Tokens
                │
                ▼
        New Access + Refresh
                │
                ▼
          Continue Session
                │
                ▼
             Logout
                │
                ▼
        Revoke Refresh Token
                │
                ▼
        Clear Authentication
```

---

# Responsabilidades

A arquitetura distribui responsabilidades entre componentes.

| Componente             | Responsabilidade                              |
| ---------------------- | --------------------------------------------- |
| Browser                | Armazenar cookies e enviá-los automaticamente |
| Frontend               | Iniciar operações de login, refresh e logout  |
| Nginx                  | Encaminhamento HTTP/HTTPS                     |
| Flask API              | Fronteira de autenticação                     |
| Authentication Service | Orquestração do fluxo de autenticação         |
| Token Service          | Criação e gerenciamento dos tokens            |
| Redis                  | Estado e ciclo de vida das sessões            |
| PostgreSQL             | Dados persistentes de usuários e tenants      |
| Authorization          | Decisão de acesso                             |
| Audit / Events         | Rastreamento de operações relevantes          |

---

# Considerações Arquiteturais

A arquitetura atual representa um compromisso entre dois modelos.

Um modelo puramente stateless poderia depender exclusivamente da validade criptográfica dos JWTs.

Por outro lado, uma arquitetura completamente stateful poderia armazenar toda a sessão no servidor.

O Exactum combina os dois:

```text
JWT
 +
Server-side Session State
 =
Session-aware Authentication
```

O JWT fornece uma credencial assinada e transportável.

O Redis fornece controle sobre o ciclo de vida da sessão.

Essa combinação permite:

- Renovação sem novo login;
- Revogação antecipada;
- Controle de sessões;
- Rotação de refresh tokens;
- Invalidação administrativa;
- Separação entre acesso e renovação.

---

# Limitações e Evolução

A arquitetura de autenticação continua evoluindo junto com o Exactum.

Possíveis áreas futuras incluem:

- Refinamento das políticas de CSRF;
- Melhorias no gerenciamento de sessões;
- Métricas específicas de autenticação;
- Detecção de comportamento anômalo;
- Controles adicionais contra abuso;
- Maior isolamento entre componentes de infraestrutura;
- Testes adicionais de cenários de expiração e revogação;
- Documentação e automação adicional dos fluxos de segurança.

A evolução arquitetural prevista para a v0.3.x não deve alterar os princípios fundamentais de autenticação:

- O backend continua sendo a autoridade;
- Tokens permanecem protegidos contra acesso direto pelo frontend;
- Sessões continuam possuindo ciclo de vida explícito;
- Refresh tokens continuam sujeitos a controle de servidor;
- Autenticação permanece separada de autorização.

---

# Documentos Relacionados

### Segurança

→ [`overview.md`](./overview.md)

Visão geral da arquitetura de segurança do Exactum.

### Autorização

→ [`authorization.md`](./authorization.md)

Detalha RBAC, permissões e decisões de autorização.

### Gestão de Sessão

→ [`session-management.md`](./session-management.md)

Detalha o ciclo de vida das sessões e a utilização do Redis.

### Isolamento de Tenant

→ [`tenant-isolation.md`](./tenant-isolation.md)

Detalha as fronteiras utilizadas para impedir acesso cruzado entre tenants.

### Threat Model

→ [`threat-model.md`](./threat-model.md)

Documenta ameaças, ativos, trust boundaries, riscos e respectivas mitigações.

### Auditoria

→ [`audit-logging.md`](../observability/audit-logging.md)

Documenta o mecanismo de rastreamento de operações relevantes.

---

# Resumo

A autenticação do Exactum evoluiu de uma implementação simples baseada em JWT armazenado no `sessionStorage` para um modelo de autenticação consciente de sessão.

A arquitetura atual combina:

```text
HttpOnly Cookies
       +
Access / Refresh Tokens
       +
Refresh Token Rotation
       +
Redis Session State
       +
Explicit Revocation
       =
Session-aware Authentication
```

O objetivo é fornecer uma autenticação adequada a uma plataforma SaaS multi-tenant, mantendo controle sobre o ciclo de vida das sessões sem expor diretamente as credenciais ao JavaScript do frontend.

A autenticação estabelece a identidade e o estado da sessão. As decisões sobre o que essa identidade pode fazer são responsabilidade da camada de autorização.
