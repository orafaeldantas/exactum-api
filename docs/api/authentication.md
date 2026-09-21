# API Authentication

## 1. Objetivo

Este documento descreve como a API do Exactum realiza autenticação, como as credenciais são transportadas entre cliente e servidor e como o ciclo de vida dos tokens e sessões se relaciona com a API.

O objetivo é documentar:

- fluxo de login;
- autenticação baseada em cookies;
- access token;
- refresh token;
- renovação de sessão;
- logout;
- revogação;
- contexto autenticado;
- comportamento de endpoints protegidos;
- integração com Redis;
- relação entre Authentication e Authorization;
- segurança do transporte das credenciais;
- comportamento esperado do frontend;
- observabilidade relacionada à autenticação.

Este documento descreve principalmente a perspectiva da **API**.

As decisões de segurança e os mecanismos internos de sessão são detalhados também em:

- `docs/security/authentication.md`
- `docs/security/session-management.md`

---

# 2. Authentication Boundary

A API é responsável por determinar se uma requisição possui uma identidade autenticada válida.

O frontend não é considerado uma security boundary.

Conceitualmente:

```text
Client
  │
  │ HTTP Request
  ▼
API
  │
  ├── Authentication
  │
  ├── Authorization
  │
  └── Application
```

Isso significa que qualquer informação controlada pelo frontend deve ser tratada como não confiável.

A API deve validar as credenciais e reconstruir o contexto autenticado antes de permitir o acesso a recursos protegidos.

---

# 3. Authentication Model

O Exactum utiliza **JWT-based authentication** com tokens armazenados em cookies protegidos pelo navegador.

O modelo utiliza dois tokens:

```text
Access Token
Refresh Token
```

Cada um possui uma finalidade diferente.

### Access Token

Representa a autorização temporária necessária para acessar recursos protegidos da API.

### Refresh Token

Permite renovar a autenticação sem exigir que o usuário realize login novamente.

Essa separação reduz a necessidade de utilizar um token de longa duração para todas as requisições.

---

# 4. HttpOnly Cookies

Os tokens não são armazenados pelo frontend em `localStorage` ou `sessionStorage`.

Em vez disso, o backend configura cookies utilizando atributos apropriados de segurança.

Conceitualmente:

```text
Login
  │
  ▼
API
  │
  ├── Set access cookie
  │
  └── Set refresh cookie
        │
        ▼
      Browser
```

O navegador passa a gerenciar o armazenamento e o envio dos cookies.

O JavaScript da aplicação não precisa acessar diretamente o conteúdo dos tokens.

Essa estratégia reduz a exposição direta dos tokens ao código JavaScript executado no navegador.

---

# 5. Cookie Authentication Flow

O fluxo básico de autenticação ocorre da seguinte maneira:

```text
Client
  │
  │ POST /auth/login
  ▼
API
  │
  ├── Validate credentials
  │
  ├── Create access token
  │
  ├── Create refresh token
  │
  ├── Create/update session state
  │
  └── Set authentication cookies
  │
  ▼
Client authenticated
```

Após o login, as requisições subsequentes para endpoints protegidos utilizam os cookies automaticamente.

---

# 6. Login

O endpoint de login recebe as credenciais necessárias para autenticar o usuário.

Exemplo conceitual:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

Quando as credenciais são válidas, a API:

1. autentica o usuário;
2. verifica se a conta pode iniciar uma sessão;
3. determina o contexto de tenant aplicável;
4. cria os tokens;
5. registra o estado da sessão;
6. configura os cookies;
7. retorna uma resposta apropriada ao cliente.

O conteúdo exato da resposta deve permanecer separado dos tokens.

Os tokens são transportados pelos cookies.

---

# 7. Successful Authentication

Após um login bem-sucedido, o backend configura os cookies de autenticação.

Conceitualmente:

```http
Set-Cookie: access_token=...
Set-Cookie: refresh_token=...
```

Os atributos reais dos cookies devem ser configurados de acordo com o ambiente e os requisitos de segurança da aplicação.

O cliente não deve depender da leitura desses cookies via JavaScript.

---

# 8. Authentication State

A aplicação frontend não deve determinar o estado de autenticação decodificando JWTs localmente.

A fonte de verdade é o backend.

Isso é especialmente importante porque:

- tokens são HttpOnly;
- o frontend não deve conhecer os secrets utilizados para validá-los;
- expiração deve ser validada pelo servidor;
- revogação pode ocorrer no backend;
- sessões podem ser invalidadas independentemente da expiração natural do token.

Conceitualmente:

```text
Frontend
   │
   │ "Estou autenticado?"
   ▼
API
   │
   ├── validate cookie
   ├── validate token
   ├── validate session
   └── build auth context
   │
   ▼
Authenticated / Unauthenticated
```

---

# 9. Protected Endpoints

Endpoints que exigem autenticação devem rejeitar requisições sem credenciais válidas.

Fluxo:

```text
Request
  │
  ▼
Authentication Middleware / JWT Validation
  │
  ├── invalid → authentication error
  │
  └── valid
       │
       ▼
   Authorization
       │
       ▼
   Application
```

A autenticação ocorre antes da execução da operação protegida.

---

# 10. Authentication Context

Após a validação do token, a aplicação constrói um contexto associado à requisição.

Esse contexto pode conter informações como:

```text
user_uuid
tenant_uuid
role
email
```

Além de outras claims necessárias para o processamento da requisição.

Conceitualmente:

```text
Request Context
├── user
├── tenant
├── role
└── authentication metadata
```

Esse contexto pode ser utilizado posteriormente pela camada de autorização e pelas Application Services.

---

# 11. Authentication vs Authorization

Authentication e Authorization são responsabilidades diferentes.

### Authentication

Determina:

> Quem é o usuário ou ator associado à requisição?

### Authorization

Determina:

> Esse usuário possui permissão para executar esta operação?

Fluxo:

```text
Request
   │
   ▼
Authentication
   │
   ▼
Identity
   │
   ▼
Authorization
   │
   ▼
Application Operation
```

Um usuário autenticado pode não possuir autorização para determinada operação.

Nesse caso, a requisição pode ser autenticada, mas deve ser rejeitada pela camada de autorização.

---

# 12. Access Token

O access token possui vida útil relativamente curta e é utilizado para autenticar requisições protegidas.

Conceitualmente:

```text
Access Token
├── identity
├── tenant context
├── authorization context
└── expiration
```

O token deve conter apenas as informações necessárias para construir o contexto de autenticação.

Informações excessivas ou dados sensíveis não devem ser armazenados desnecessariamente nas claims.

---

# 13. Refresh Token

O refresh token possui uma finalidade diferente do access token.

Ele permite solicitar uma nova autenticação temporária sem exigir que o usuário forneça novamente suas credenciais.

Fluxo:

```text
Access Token
      │
      │ expires
      ▼
Refresh Request
      │
      ▼
Refresh Token Validation
      │
      ▼
New Access Token
```

No Exactum, o refresh token também participa do controle de sessão e rotação de credenciais.

---

# 14. Refresh Endpoint

O endpoint de refresh é responsável por renovar a autenticação.

Conceitualmente:

```http
POST /auth/refresh
```

O navegador envia o refresh cookie automaticamente.

A API então:

1. valida o refresh token;
2. verifica seu estado;
3. verifica a sessão correspondente;
4. aplica as regras de revogação;
5. gera novos tokens;
6. atualiza os cookies;
7. atualiza o estado necessário da sessão.

---

# 15. Refresh Token Rotation

O Exactum utiliza **refresh token rotation**.

Isso significa que um refresh token utilizado com sucesso pode ser substituído por um novo refresh token.

Conceitualmente:

```text
Refresh Token A
       │
       │ refresh
       ▼
Refresh Token B
       │
       │ refresh
       ▼
Refresh Token C
```

O token anterior deixa de ser o token válido para a continuação normal da sessão.

Essa estratégia reduz o impacto de um refresh token reutilizado indevidamente.

---

# 16. Refresh Token JTI

Os refresh tokens possuem um identificador único associado à sua identidade.

Esse identificador pode ser utilizado para relacionar o token com o estado da sessão no Redis.

Conceitualmente:

```text
Refresh Token
      │
      ▼
     JTI
      │
      ▼
Redis Session State
```

Essa associação permite controlar a sessão além da simples validação criptográfica do JWT.

---

# 17. Redis Session State

O Redis participa do gerenciamento das sessões de autenticação.

A sessão pode ser associada a informações como:

```text
JTI
user
tenant
session state
expiration
revocation state
```

O objetivo é permitir que o sistema invalide ou controle sessões sem depender exclusivamente da expiração natural do JWT.

Essa abordagem também permite que o backend possua uma visão operacional das sessões ativas.

---

# 18. Token Validation vs Session Validation

Uma diferença importante é:

```text
JWT validation
```

não é necessariamente equivalente a:

```text
session validation
```

Um JWT pode estar criptograficamente válido e ainda assim a sessão correspondente ter sido revogada.

Conceitualmente:

```text
Request
  │
  ▼
JWT Validation
  │
  ▼
Session Validation
  │
  ▼
Authorization
```

Essa separação permite que o sistema invalide sessões antes da expiração natural dos tokens.

---

# 19. Logout

O logout encerra a sessão do usuário no contexto da aplicação.

Conceitualmente:

```http
POST /auth/logout
```

A API deve:

1. identificar a sessão atual;
2. invalidar ou revogar o estado correspondente;
3. limpar os cookies de autenticação;
4. impedir a continuidade normal da sessão.

Fluxo:

```text
Client
  │
  │ POST /auth/logout
  ▼
API
  │
  ├── revoke session
  ├── clear authentication cookies
  └── response
```

---

# 20. Cookie Clearing

O logout deve remover os cookies utilizando configurações compatíveis com aquelas utilizadas quando os cookies foram criados.

Isso inclui considerar corretamente:

- cookie name;
- path;
- domain, quando aplicável;
- security attributes.

Uma configuração inconsistente pode resultar em cookies que permanecem no navegador mesmo após uma tentativa de logout.

---

# 21. Revocation

Uma sessão pode ser revogada por diferentes motivos.

Exemplos:

- logout;
- usuário bloqueado;
- tenant suspenso;
- sessão invalidada administrativamente;
- comprometimento de credenciais;
- invalidação de sessão específica.

A revogação deve impedir que a sessão continue sendo utilizada normalmente.

---

# 22. User Blocking

O estado da conta do usuário deve ser considerado durante a autenticação.

Um usuário que não pode utilizar a aplicação não deve conseguir estabelecer ou continuar uma sessão válida apenas porque possui um token anteriormente emitido.

Conceitualmente:

```text
Valid Token
    │
    ▼
User State
    │
    ├── active → continue
    │
    └── blocked → reject
```

O comportamento exato depende da operação e das regras de segurança implementadas.

---

# 23. Tenant Suspension

O contexto de tenant também pode afetar a validade operacional da sessão.

Um usuário pode possuir credenciais válidas, mas pertencer a um tenant que não pode utilizar a aplicação naquele momento.

Conceitualmente:

```text
Authentication
      │
      ▼
Tenant State
      │
      ├── active → continue
      │
      └── suspended → reject
```

Isso impede que a validade criptográfica de um token seja tratada como autorização absoluta para operar sobre um tenant.

---

# 24. Authentication Errors

Erros de autenticação devem possuir comportamento consistente.

Exemplos de situações:

- cookie ausente;
- token ausente;
- token inválido;
- token expirado;
- refresh token inválido;
- sessão revogada;
- usuário bloqueado;
- tenant indisponível.

A API deve retornar uma resposta apropriada sem expor informações sensíveis ou detalhes internos.

A estrutura geral de erros é definida em:

`docs/api/errors.md`

---

# 25. Authentication Cookies and Browser

Como a autenticação utiliza cookies, o comportamento do navegador deve ser considerado parte do sistema.

A configuração deve levar em conta:

- `HttpOnly`;
- `Secure`;
- `SameSite`;
- `Path`;
- `Domain`, quando necessário;
- ambiente de desenvolvimento;
- ambiente de produção;
- proxy reverso;
- HTTPS.

O frontend deve utilizar requisições compatíveis com autenticação baseada em cookies.

No caso de aplicações frontend separadas da API, o envio de credenciais deve ser explicitamente configurado quando necessário.

---

# 26. CSRF Considerations

Como a autenticação da API utiliza cookies, **Cross-Site Request Forgery (CSRF)** é uma preocupação de segurança relevante para a arquitetura do Exactum.

Os cookies de autenticação são enviados automaticamente pelo navegador de acordo com suas regras de escopo e atributos. Portanto, o fato de um cookie ser `HttpOnly` não constitui, por si só, uma proteção contra CSRF.

São mecanismos com objetivos diferentes:

```text
HttpOnly
  → impede o acesso ao conteúdo do cookie por JavaScript

CSRF Protection
  → protege contra requisições forjadas que utilizem
    automaticamente as credenciais do navegador
```

## Estado atual

Atualmente, o Exactum utiliza autenticação baseada em cookies HttpOnly, porém **não possui um mecanismo dedicado de proteção CSRF implementado**.

Portanto, esta documentação não deve ser interpretada como indicação de que CSRF já está mitigado pela aplicação.

A configuração atual deve ser considerada uma parte da estratégia de segurança em evolução.

## Evolução planejada

A aplicação deverá avaliar e, quando apropriado, implementar um mecanismo explícito de proteção contra CSRF compatível com a arquitetura de autenticação baseada em cookies.

Possíveis estratégias incluem:

- CSRF token;
- Double Submit Cookie;
- mecanismos equivalentes adequados ao modelo de autenticação utilizado;
- combinação apropriada com `SameSite`, `Secure` e demais atributos dos cookies.

A escolha do mecanismo deverá considerar:

- arquitetura do frontend;
- topologia entre frontend e API;
- configuração de CORS;
- ambientes de desenvolvimento e produção;
- comportamento dos cookies;
- modelo de ameaça;
- requisitos de integração futura.

Enquanto essa proteção não estiver implementada, ela deve ser considerada uma **lacuna de segurança conhecida** e permanecer registrada na evolução da arquitetura.

A proteção CSRF não deve ser confundida com:

- `HttpOnly`;
- `Secure`;
- `SameSite`;
- CORS;
- autenticação;
- autorização.

Cada mecanismo possui uma responsabilidade diferente dentro da security architecture.

---

# 27. Authentication and CORS

Quando frontend e backend possuem origens diferentes, a política de CORS deve considerar o envio de credenciais.

A configuração deve evitar permitir origens arbitrárias em conjunto com credenciais.

Conceitualmente:

```text
Frontend Origin
      │
      ▼
CORS Policy
      │
      ├── allowed → request may proceed
      │
      └── denied → browser blocks request
```

CORS não substitui autenticação ou autorização.

Ele é uma política aplicada pelo navegador e não deve ser tratado como mecanismo principal de segurança da API.

---

# 28. Authentication and Multi-Tenancy

A identidade autenticada está relacionada ao contexto de tenant.

Conceitualmente:

```text
Authenticated User
       │
       ├── user_uuid
       │
       ├── tenant_uuid
       │
       └── role / permissions
```

A autenticação fornece a identidade e o contexto necessários para que a autorização determine o que pode ser feito.

O isolamento efetivo dos dados continua sendo responsabilidade do backend e das camadas de persistência.

Authentication não substitui Tenant Isolation.

---

# 29. Authentication and Impersonation

O Exactum possui suporte a impersonation para operações administrativas de plataforma.

Nesse cenário, existe uma distinção entre:

```text
Original Actor
Effective User
```

O usuário efetivo pode operar temporariamente no contexto de outro usuário.

Conceitualmente:

```text
Super Admin
    │
    │ impersonation
    ▼
Target User
    │
    ▼
Protected API
```

O access token pode representar o usuário efetivo da operação, enquanto o refresh context preserva a identidade original necessária para controlar o ciclo da impersonation.

A operação também deve ser rastreável por observabilidade e Platform Events.

---

# 30. Impersonation Authentication Context

Durante uma impersonation, a API precisa preservar a distinção entre:

- quem iniciou a impersonation;
- qual usuário está sendo representado;
- qual tenant está sendo utilizado;
- qual sessão originou a operação.

Conceitualmente:

```text
Authentication Context
├── original actor
├── effective user
├── tenant
├── impersonation state
└── request context
```

Isso impede que a identidade administrativa original seja perdida durante o fluxo.

---

# 31. Authentication and Observability

Eventos relevantes de autenticação devem ser observáveis.

Exemplos:

```text
login success
login failure
refresh success
refresh failure
logout
session revoked
user blocked
authentication failure
impersonation started
impersonation stopped
```

Esses eventos podem possuir diferentes níveis de observabilidade:

- Infrastructure Logs;
- Platform Events;
- Audit Logs.

Nem todo evento precisa necessariamente ser registrado nas três categorias.

A classificação depende do significado operacional e de segurança da operação.

---

# 32. Correlation

Requisições de autenticação devem utilizar o mecanismo de correlação da aplicação quando aplicável.

Uma operação pode ser associada a:

```text
request_id
user_uuid
tenant_uuid
session / token context
```

Isso permite investigar problemas de autenticação de ponta a ponta.

Exemplo:

```text
Login Request
     │
     ├── request_id
     │
     ├── authentication log
     │
     ├── session state
     │
     └── platform event
```

Mais detalhes em:

`docs/observability/correlation.md`

---

# 33. Sensitive Data

Informações sensíveis nunca devem ser registradas desnecessariamente.

Isso inclui:

- passwords;
- access tokens;
- refresh tokens;
- cookies;
- authorization headers;
- secrets;
- API keys;
- credenciais;
- dados equivalentes.

Logs de autenticação devem registrar informações suficientes para investigação sem reproduzir as credenciais utilizadas.

---

# 34. Password Handling

Passwords não devem ser armazenadas em texto puro.

O backend deve utilizar mecanismos apropriados de password hashing e nunca armazenar a senha original.

Durante o login:

```text
Submitted Password
       │
       ▼
Password Verification
       │
       ├── valid → authentication
       │
       └── invalid → authentication failure
```

A senha fornecida pelo cliente não deve ser persistida nem registrada em logs.

---

# 35. Authentication Rate Limiting

Endpoints relacionados à autenticação são candidatos importantes para Rate Limiting.

Isso pode incluir:

- login;
- refresh;
- operações sensíveis de sessão;
- recuperação de credenciais, quando disponível.

O objetivo é reduzir abuso automatizado e tentativas excessivas de autenticação.

Rate Limiting não substitui outras medidas de segurança.

---

# 36. Session Lifecycle

O ciclo de vida simplificado de uma sessão pode ser representado como:

```text
              ┌──────────────┐
              │   No Session │
              └──────┬───────┘
                     │
                   Login
                     │
                     ▼
              ┌──────────────┐
              │    Active    │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
       Refresh    Logout     Revoke
          │          │          │
          │          ▼          │
          │       Revoked ◄─────┘
          │
          ▼
       Active
```

O refresh renova a autenticação enquanto a sessão permanece válida.

Logout ou revogação encerram a sessão.

---

# 37. Authentication Failure Handling

Falhas de autenticação devem ser tratadas de maneira previsível.

A API deve evitar diferenciar excessivamente mensagens que permitam inferir informações sensíveis.

Por exemplo, dependendo do contexto, respostas de login inválido podem utilizar uma mensagem genérica em vez de indicar exatamente se:

```text
email existe
```

ou:

```text
password está incorreta
```

A decisão exata depende do modelo de ameaça e da política de segurança da aplicação.

---

# 38. Authentication and API Clients

O modelo de autenticação baseado em cookies é especialmente adequado ao frontend web do Exactum.

Clientes externos ou integrações futuras podem exigir mecanismos diferentes.

Caso a API passe a suportar:

- mobile applications;
- third-party integrations;
- service-to-service communication;
- API clients;

o modelo de autenticação poderá ser estendido sem necessariamente alterar o modelo interno de identidade.

A estratégia específica deverá ser documentada quando esses consumidores forem introduzidos.

---

# 39. Authentication and Service-to-Service Communication

Atualmente, a autenticação principal da API é orientada ao contexto de usuários.

Futuras integrações internas podem exigir mecanismos específicos para comunicação entre serviços.

Possíveis mecanismos incluem:

- service credentials;
- signed requests;
- API keys;
- workload identities;
- OAuth2;
- mTLS.

Nenhum desses mecanismos deve ser introduzido apenas por complexidade arquitetural.

A escolha deve ser orientada pelo modelo de ameaça e pelo tipo de integração necessária.

---

# 40. Testing Authentication

A autenticação deve possuir cobertura de testes para cenários positivos e negativos.

Exemplos:

### Login

- credenciais válidas;
- credenciais inválidas;
- usuário bloqueado;
- tenant indisponível;
- cookies configurados corretamente.

### Protected Endpoints

- cookie ausente;
- token inválido;
- token expirado;
- sessão revogada;
- usuário não autorizado.

### Refresh

- refresh válido;
- refresh inválido;
- refresh expirado;
- refresh revogado;
- refresh rotation;
- sessão inexistente.

### Logout

- sessão válida;
- sessão já revogada;
- limpeza dos cookies;
- invalidação da sessão.

### Security

- ausência de tokens em respostas JSON;
- ausência de credenciais em logs;
- comportamento de CORS;
- comportamento de CSRF;
- rate limiting.

---

# 41. OpenAPI and Authentication

O contrato OpenAPI deve representar corretamente como a autenticação funciona.

A documentação deve deixar claro que a autenticação utiliza cookies HttpOnly e não depende de:

```text
Authorization: Bearer <token>
```

quando esse não for o mecanismo efetivamente utilizado pelo endpoint.

O Swagger deve permitir que o desenvolvedor compreenda:

- quais endpoints são protegidos;
- quais endpoints são públicos;
- como realizar login;
- como a sessão é mantida;
- como realizar logout;
- como realizar refresh.

---

# 42. Frontend Integration

O frontend deve tratar autenticação como um estado controlado pelo servidor.

O fluxo conceitual é:

```text
Frontend
   │
   ├── Login
   │
   ▼
API
   │
   └── Set-Cookie
        │
        ▼
Frontend authenticated
        │
        ├── API requests
        │
        ├── refresh
        │
        └── logout
```

O frontend não precisa conhecer o conteúdo do access token.

Isso também reduz a necessidade de lógica de parsing de JWT no cliente.

---

# 43. Authentication and Error Recovery

Quando uma requisição protegida falhar porque a autenticação expirou, o frontend pode tentar renovar a sessão utilizando o refresh endpoint, quando apropriado.

Fluxo conceitual:

```text
Protected Request
       │
       ▼
Authentication Failure
       │
       ▼
Refresh
       │
   ┌───┴────┐
   │        │
success   failure
   │        │
   ▼        ▼
Retry     Logout
Request
```

O frontend não deve entrar em loops infinitos de refresh.

Uma falha definitiva de refresh deve resultar no encerramento do estado autenticado no cliente.

---

# 44. Authentication Security Principles

As principais diretrizes são:

1. **Tokens devem permanecer protegidos pelo navegador.**
2. **O frontend não é uma security boundary.**
3. **O backend é responsável pela validação da identidade.**
4. **Authentication e Authorization são responsabilidades diferentes.**
5. **JWT validity não substitui session validity.**
6. **Refresh tokens devem possuir controle de ciclo de vida.**
7. **Sessões podem ser revogadas antes da expiração natural.**
8. **Credenciais nunca devem aparecer em logs.**
9. **Tenant context deve ser validado pelo backend.**
10. **Impersonation deve preservar a identidade original.**
11. **Falhas de autenticação devem possuir respostas consistentes.**
12. **Mudanças futuras devem preservar o princípio de least privilege.**

---

# 45. Current State

Atualmente, o Exactum utiliza:

- JWT authentication;
- access token;
- refresh token;
- HttpOnly cookies;
- refresh token rotation;
- Redis-backed session state;
- session revocation;
- logout;
- protected endpoints;
- authentication context;
- tenant context;
- RBAC;
- permissions;
- impersonation;
- authentication observability;
- request correlation.

O frontend não mantém os tokens em `sessionStorage` ou `localStorage`.

A autenticação ocorre por meio dos cookies configurados pelo backend.

A API permanece responsável pela validação das credenciais e pela construção do contexto autenticado.

---

# 46. Future Evolution

A estratégia de autenticação poderá evoluir conforme o Exactum incorpore novos consumidores e requisitos.

Possíveis evoluções:

- gerenciamento avançado de sessões;
- session listing;
- session termination individual;
- device/session metadata;
- MFA;
- password recovery;
- account recovery;
- stronger CSRF mechanisms;
- OAuth2/OIDC para integrações específicas;
- autenticação de service-to-service;
- OpenTelemetry;
- detecção de comportamentos anômalos;
- políticas de segurança adaptativas.

Esses mecanismos somente devem ser incorporados quando houver necessidade real e modelo de ameaça correspondente.

---

# 47. Related Documentation

- `docs/api/overview.md`
- `docs/api/conventions.md`
- `docs/api/errors.md`
- `docs/api/versioning.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/session-management.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/platform-events.md`
- `docs/observability/audit-logging.md`
- `docs/observability/correlation.md`

---

## Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo:

```text
actor       → conceito de quem origina uma operação
user_uuid   → representação atual da identidade do usuário

tenant      → conceito de organização/contexto
tenant_uuid → representação atual desse contexto

effective user
            → usuário atualmente representado durante uma impersonation

original actor
            → identidade que iniciou a impersonation
```

Essa separação permite que a documentação represente o significado arquitetural dos conceitos sem limitar sua evolução aos detalhes atuais da implementação.

Da mesma forma, algumas capacidades descritas como evolução futura podem ainda não estar implementadas em sua forma definitiva.

Este documento deve, portanto, ser interpretado como uma representação do **modelo atual de autenticação da API e de sua direção de evolução**, e não como uma descrição imutável da implementação futura.
