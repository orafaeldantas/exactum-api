# ADR-003 — HttpOnly Cookie Authentication

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Security / Architecture
- **Related Areas:** Authentication, Security, API, Frontend, Session Management
- **Supersedes:** Bearer Token Authentication via Client-Side Storage
- **Superseded By:** None

---

# 1. Context

O Exactum utiliza autenticação baseada em **JSON Web Tokens (JWT)** para autenticar usuários e autorizar o acesso aos recursos protegidos da API.

Em uma implementação anterior, o frontend armazenava o `access_token` no `sessionStorage` e enviava explicitamente o token através do header HTTP:

```http
Authorization: Bearer <access_token>
```

Embora esse modelo seja amplamente utilizado em aplicações web, ele faz com que o token de autenticação fique diretamente acessível ao código JavaScript executado no navegador.

Isso cria uma preocupação importante de segurança: qualquer vulnerabilidade que permita execução de JavaScript não confiável dentro da origem da aplicação pode potencialmente permitir o acesso ao token armazenado pelo frontend.

Além disso, a implementação baseada em armazenamento client-side exigia que o frontend tivesse conhecimento explícito sobre o token:

- armazenamento do JWT;
- leitura do JWT;
- inclusão manual do header `Authorization`;
- gerenciamento da expiração;
- lógica de refresh;
- remoção do token no logout;
- tratamento de estados relacionados à autenticação.

Essa responsabilidade não representa uma necessidade funcional do frontend. O frontend precisa saber **se o usuário está autenticado e quais recursos pode utilizar**, mas não precisa manipular diretamente as credenciais que representam essa autenticação.

Diante disso, foi decidido adotar um modelo baseado em **cookies HttpOnly**, mantendo JWT como mecanismo de autenticação, mas transferindo o armazenamento e o envio dos tokens para o navegador.

---

# 2. Decision

O Exactum utilizará **JWT armazenado em cookies HttpOnly** para autenticação da aplicação web.

A autenticação será composta por dois tokens:

- **Access Token:** utilizado para autenticar as requisições à API;
- **Refresh Token:** utilizado para obter uma nova sessão de acesso quando o access token expirar.

Ambos serão enviados ao navegador pelo backend através de cookies protegidos.

O frontend não terá acesso direto ao conteúdo dos tokens através de JavaScript.

Após uma autenticação bem-sucedida, o backend será responsável por definir os cookies de autenticação.

Conceitualmente:

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │                      │
                    │  HttpOnly Cookies    │
                    │  ├─ access token     │
                    │  └─ refresh token    │
                    └──────────┬───────────┘
                               │
                               │ credentials
                               ▼
                    ┌──────────────────────┐
                    │    Exactum API       │
                    │                      │
                    │ Authentication       │
                    │ Authorization        │
                    └──────────────────────┘
```

O navegador passa a ser responsável pelo envio dos cookies, enquanto o backend continua sendo responsável por validar os tokens e determinar a identidade e as permissões do usuário.

---

# 3. Authentication Flow

## 3.1 Login

No login, o frontend envia as credenciais do usuário para a API.

Exemplo conceitual:

```http
POST /api/auth/login
Content-Type: application/json
```

O backend valida as credenciais.

Em caso de sucesso:

1. autentica o usuário;
2. gera o access token;
3. gera o refresh token;
4. configura os cookies correspondentes;
5. retorna a resposta de autenticação.

O frontend não precisa receber os JWTs no corpo da resposta.

O fluxo passa a ser:

```text
Frontend
   │
   │ credentials
   ▼
POST /auth/login
   │
   ▼
Backend
   │
   ├── Validate credentials
   ├── Generate access token
   ├── Generate refresh token
   └── Set HttpOnly cookies
           │
           ▼
       Browser
```

---

# 4. HttpOnly Cookies

Os tokens de autenticação serão armazenados em cookies marcados como `HttpOnly`.

Essa propriedade impede que o conteúdo do cookie seja acessado diretamente através de JavaScript executado no navegador.

Por exemplo, o frontend não deve realizar:

```javascript
document.cookie;
```

para obter o JWT.

O navegador mantém os tokens protegidos e os envia automaticamente conforme as regras de cookie aplicáveis à requisição.

Isso estabelece uma separação importante:

```text
Frontend JavaScript
        │
        │ não possui acesso direto
        ▼
Authentication Cookies
        │
        │ enviados pelo browser
        ▼
      Backend
```

---

# 5. Access Token and Refresh Token

A autenticação utiliza dois tokens com responsabilidades diferentes.

## 5.1 Access Token

O access token representa a autorização de acesso de curta duração.

Ele é utilizado nas requisições protegidas realizadas contra a API.

Sua função principal é permitir que o backend identifique o contexto autenticado da requisição.

O access token contém informações relacionadas à identidade e ao contexto da autenticação, incluindo informações utilizadas pelo backend para determinar:

- usuário autenticado;
- tenant;
- role;
- demais claims necessárias ao fluxo de autorização.

O frontend não deve depender da leitura dessas claims.

---

## 5.2 Refresh Token

O refresh token possui uma finalidade diferente.

Ele permite que o cliente obtenha uma nova sessão de acesso quando o access token expirar.

O refresh token possui ciclo de vida próprio e é tratado de forma mais restritiva pelo backend.

O endpoint:

```http
POST /api/auth/refresh
```

é responsável por realizar o processo de renovação.

No fluxo atual, a renovação também envolve **refresh token rotation**, cuja decisão arquitetural é registrada separadamente na ADR correspondente de gerenciamento/rotação de sessão.

---

# 6. Token Rotation

O refresh token não deve ser tratado como uma credencial permanente.

Durante o processo de refresh, o backend pode invalidar o token anterior e emitir novos tokens.

Conceitualmente:

```text
Refresh Token A
      │
      │ refresh
      ▼
Backend
      │
      ├── invalidate A
      └── issue B
             │
             ▼
      New Authentication Cookies
```

Essa estratégia reduz a janela de utilização de um refresh token que eventualmente tenha sido comprometido.

Os detalhes relacionados à persistência de sessão, JTI, revogação e estado no Redis são tratados pela arquitetura de **Session Management**.

---

# 7. Logout

O logout também é responsabilidade do backend.

O frontend solicita:

```http
POST /api/auth/logout
```

O backend então executa as operações necessárias para encerrar a sessão, incluindo a invalidação do estado de sessão quando aplicável e a remoção dos cookies de autenticação.

O frontend não precisa manipular diretamente os JWTs.

O fluxo é:

```text
Frontend
   │
   │ POST /auth/logout
   ▼
Backend
   │
   ├── invalidate session
   ├── revoke relevant state
   └── clear authentication cookies
           │
           ▼
      Unauthenticated
```

---

# 8. Refresh Cookie Path

O refresh token utiliza um cookie com escopo de caminho compatível com os endpoints de autenticação.

No ambiente atual, o refresh cookie utiliza:

```text
/api/auth
```

como caminho relevante para o backend.

Essa configuração evita que o refresh token seja enviado desnecessariamente para endpoints que não precisam dele.

Além de representar uma preocupação de segurança, restringir o escopo do cookie reduz a exposição desnecessária da credencial dentro da própria aplicação.

---

# 9. Frontend Responsibility

A adoção de cookies HttpOnly reduz significativamente a responsabilidade do frontend sobre o gerenciamento dos tokens.

O frontend não deve:

- armazenar JWT em `localStorage`;
- armazenar JWT em `sessionStorage`;
- decodificar JWT para determinar o estado de autenticação;
- construir manualmente `Authorization: Bearer ...`;
- controlar diretamente a renovação através da leitura do refresh token;
- remover diretamente o conteúdo dos tokens.

Em vez disso, o frontend deve:

- enviar requisições utilizando credenciais/cookies;
- reagir às respostas da API;
- representar o estado de autenticação da interface;
- lidar com estados como `401 Unauthorized`;
- redirecionar o usuário para login quando apropriado;
- utilizar endpoints fornecidos pelo backend para operações relacionadas à sessão.

O frontend é, portanto, um **cliente da autenticação**, e não a autoridade responsável por implementá-la.

---

# 10. Request Credentials

Como os tokens estão armazenados em cookies, as requisições realizadas pelo frontend precisam permitir o envio das credenciais apropriadas.

No cliente HTTP, isso significa utilizar a configuração equivalente a:

```javascript
credentials: "include";
```

quando aplicável ao mecanismo de comunicação utilizado.

O backend também deve estar configurado para aceitar requisições autenticadas por cookies dentro das origens permitidas pela aplicação.

A configuração de CORS, quando aplicável, deve ser tratada em conjunto com essa arquitetura.

---

# 11. Authentication vs Authorization

A adoção de HttpOnly cookies não altera a separação conceitual entre **Authentication** e **Authorization**.

### Authentication

Responde:

> Quem está realizando esta requisição?

O backend utiliza os tokens de autenticação para determinar a identidade e o contexto autenticado.

### Authorization

Responde:

> O usuário autenticado pode realizar esta operação?

A autorização continua sendo responsabilidade exclusiva do backend.

Claims como:

```text
user
tenant
role
permissions
```

não devem ser consideradas suficientes isoladamente para conceder acesso sem que o backend aplique as regras de autorização correspondentes.

Portanto:

```text
HttpOnly Cookie
      │
      ▼
Authentication
      │
      ▼
Authenticated User
      │
      ▼
Authorization
      │
      ▼
Allowed / Denied
```

---

# 12. HttpOnly Does Not Mean CSRF Protection

A utilização de cookies HttpOnly não significa que a aplicação esteja automaticamente protegida contra **Cross-Site Request Forgery (CSRF)**.

HttpOnly protege principalmente contra o acesso do conteúdo do cookie através de JavaScript.

Isso é diferente de impedir que uma requisição autenticada seja induzida por uma origem externa.

Portanto:

```text
HttpOnly
   ≠
CSRF Protection
```

A implementação atual do Exactum **não deve ser documentada como possuindo proteção CSRF completa apenas pelo fato de utilizar cookies HttpOnly**.

A proteção contra CSRF permanece uma preocupação de segurança independente e deverá ser tratada através de uma decisão arquitetural específica quando implementada.

Essa distinção é deliberada para evitar uma falsa sensação de segurança.

---

# 13. Cookie Security Attributes

Os cookies de autenticação devem utilizar atributos de segurança apropriados ao ambiente.

Entre os principais atributos relevantes estão:

- `HttpOnly`;
- `Secure` em ambientes HTTPS;
- `SameSite`, conforme a arquitetura de origem/domínio da aplicação;
- `Path`, quando aplicável;
- tempo de expiração adequado.

Em produção, o Exactum é executado sobre HTTPS, portanto os cookies de autenticação devem ser transmitidos de maneira segura.

Os valores exatos de atributos que dependem do ambiente de execução não são considerados parte desta decisão arquitetural quando não constituem uma regra universal do sistema.

---

# 14. Security Boundary

A mudança para HttpOnly cookies estabelece uma fronteira mais clara entre frontend e backend.

O frontend não possui a autoridade para:

- autenticar um usuário;
- alterar suas próprias permissões;
- definir seu tenant;
- declarar que uma sessão é válida;
- determinar que uma operação está autorizada.

Essas decisões permanecem no backend.

O princípio arquitetural é:

> **O frontend representa o estado de autenticação; o backend controla a autenticação.**

---

# 15. Multi-Tenancy Relation

A autenticação por cookies não elimina a necessidade de isolamento entre tenants.

Depois que o backend identifica o usuário autenticado, o contexto de tenant continua sendo estabelecido e aplicado pelas camadas responsáveis.

Portanto:

```text
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
Tenant-Isolated Resource Access
```

Um cookie válido nunca deve ser interpretado como autorização automática para acessar qualquer tenant.

A identidade autenticada e o contexto de tenant continuam sujeitos às regras definidas pela arquitetura de multi-tenancy.

Essa decisão se relaciona diretamente com:

- ADR-001 — Shared Database Multi-Tenancy;
- ADR-002 — Public UUID Identifiers;
- ADR-004 — Session Management.

---

# 16. Impersonation Relation

A arquitetura de cookies também suporta o mecanismo de **impersonation** utilizado pelo Exactum.

Durante uma operação de impersonation:

- o access token representa o usuário que está sendo impersonado;
- o refresh token mantém o contexto necessário para identificar a identidade original do super-admin;
- o backend mantém o controle sobre o relacionamento entre a sessão original e a sessão impersonada.

Como os JWTs são HttpOnly, o frontend não deve tentar descobrir o estado de impersonation através da leitura ou decodificação dos tokens.

O backend deve fornecer explicitamente ao frontend as informações necessárias para representar esse estado na interface.

Isso mantém a mesma fronteira de segurança estabelecida pela decisão de HttpOnly cookies.

---

# 17. Observability and Logging

Os tokens de autenticação não devem ser registrados em logs.

Isso inclui:

- access tokens;
- refresh tokens;
- valores completos de cookies de autenticação;
- credenciais de login.

Logs e eventos podem registrar informações operacionais relacionadas à autenticação, como:

- usuário;
- tenant;
- request ID;
- correlation ID;
- resultado da autenticação;
- evento de login;
- evento de logout;
- renovação de sessão;
- falha de autenticação;
- início ou término de impersonation.

Porém, informações secretas utilizadas para autenticação não devem ser persistidas em observabilidade.

---

# 18. API Documentation

A API deve deixar explícito que a autenticação utiliza cookies HttpOnly.

A documentação OpenAPI/Swagger segue o princípio:

> **Authentication is performed via HttpOnly cookies. Successful login sets access and refresh token cookies automatically.**

Isso é importante porque o mecanismo de autenticação deixa de ser representado como um simples header:

```http
Authorization: Bearer <token>
```

O consumidor da API precisa compreender que a autenticação depende do estado de cookies mantido pelo navegador/cliente HTTP.

---

# 19. Alternatives Considered

## 19.1 sessionStorage + Authorization Bearer

### Descrição

Armazenar o access token no `sessionStorage` e enviá-lo manualmente:

```http
Authorization: Bearer <access_token>
```

### Vantagens

- implementação simples;
- padrão conhecido para APIs;
- fácil utilização por diferentes clientes;
- controle explícito do header pelo frontend.

### Desvantagens

- token diretamente acessível pelo JavaScript;
- maior responsabilidade de segurança no frontend;
- maior acoplamento entre frontend e mecanismo de autenticação;
- necessidade de implementar gerenciamento de token no cliente.

### Decisão

**Não adotado como modelo atual do frontend.**

Foi utilizado anteriormente pelo Exactum.

---

# 20. localStorage + Authorization Bearer

### Descrição

Armazenar o JWT no `localStorage` e reutilizá-lo nas requisições.

### Vantagens

- persistência entre sessões do navegador;
- implementação simples.

### Desvantagens

- token acessível ao JavaScript;
- maior exposição em caso de XSS;
- responsabilidade adicional para gerenciamento do token;
- maior acoplamento do frontend à autenticação.

### Decisão

**Rejeitado.**

---

# 21. Server-Side Session with Opaque Cookie

### Descrição

Utilizar um cookie contendo apenas um identificador de sessão opaco, mantendo todo o estado de autenticação no servidor.

Exemplo:

```text
Browser
   │
   │ session_id
   ▼
Backend
   │
   ▼
Session Store
```

### Vantagens

- tokens não ficam disponíveis ao frontend;
- revogação de sessão pode ser direta;
- modelo tradicional de sessão web.

### Desvantagens

- maior dependência de estado server-side;
- mudança maior em relação à arquitetura JWT já existente;
- necessidade de gerenciar o estado completo da sessão no servidor;
- não aproveita diretamente o modelo JWT já utilizado pelo Exactum.

### Decisão

**Não adotado neste momento.**

O Exactum mantém JWT como mecanismo de autenticação, enquanto utiliza Redis para complementar o gerenciamento de sessão.

---

# 22. HttpOnly Cookie Authentication

### Descrição

Armazenar access e refresh tokens em cookies HttpOnly.

### Vantagens

- reduz o acesso direto do JavaScript aos tokens;
- remove a necessidade de armazenamento manual de JWT no frontend;
- reduz o acoplamento entre frontend e credenciais;
- permite que o navegador gerencie o envio dos cookies;
- mantém JWT como mecanismo de autenticação;
- integra-se ao gerenciamento de sessão existente.

### Desvantagens

- exige configuração correta de CORS e credentials;
- exige atenção especial a CSRF;
- autenticação deixa de ser explicitamente representada por `Authorization: Bearer`;
- debugging pode ser menos direto;
- clientes não-browser podem exigir tratamento específico de cookies.

### Decisão

**Adotado.**

---

# 23. Consequences

## 23.1 Positive Consequences

A decisão proporciona:

- menor exposição dos tokens ao JavaScript;
- separação mais clara entre frontend e autenticação;
- redução da responsabilidade do frontend sobre credenciais;
- gerenciamento centralizado da autenticação no backend;
- integração natural com refresh token rotation;
- integração com gerenciamento de sessão baseado em Redis;
- melhor alinhamento com uma aplicação web tradicional baseada em cookies.

---

## 23.2 Negative Consequences

A decisão também introduz responsabilidades adicionais:

- configuração correta de cookies;
- configuração correta de CORS;
- uso de `credentials`;
- atenção a CSRF;
- testes de autenticação baseados em cookies;
- tratamento adequado de ambientes HTTP/HTTPS;
- maior complexidade para consumidores externos que não possuem gerenciamento automático de cookies.

---

# 24. Testing Implications

A mudança exige que os testes da aplicação considerem o comportamento real dos cookies.

Os testes devem validar, entre outros:

- login bem-sucedido;
- criação dos cookies;
- acesso a endpoints protegidos;
- ausência de autenticação;
- access token expirado;
- refresh token válido;
- refresh token inválido;
- refresh token revogado;
- rotação de refresh token;
- logout;
- remoção/invalidação dos cookies;
- usuário bloqueado;
- tenant suspenso;
- impersonation;
- acesso não autorizado.

A infraestrutura de testes não deve depender de montar manualmente um header `Authorization` quando o fluxo real da aplicação utiliza cookies HttpOnly.

Isso mantém os testes mais próximos do comportamento efetivo do sistema.

---

# 25. Operational Implications

Em produção, a autenticação depende de uma configuração consistente entre:

```text
Browser
   │
   ├── HTTPS
   ├── Cookies
   └── Credentials
          │
          ▼
      Cloudflare
          │
          ▼
       Nginx
          │
          ▼
      Exactum API
          │
          └── Redis
```

Mudanças em domínio, subdomínio, proxy reverso, CORS, HTTPS ou caminhos da API podem afetar o comportamento dos cookies.

Consequentemente, alterações na infraestrutura devem considerar o impacto sobre a autenticação baseada em cookies.

---

# 26. Performance Considerations

Cookies adicionam informações às requisições HTTP, portanto possuem impacto potencial no tamanho dos requests.

Entretanto, os tokens utilizados pelo Exactum possuem tamanho compatível com o uso normal de cookies e o benefício arquitetural da abordagem justifica essa característica.

O refresh token também possui escopo mais restrito para evitar seu envio desnecessário a endpoints que não precisam dele.

---

# 27. Migration from Previous Architecture

A migração substituiu o fluxo anterior:

```text
sessionStorage
      │
      ▼
access_token
      │
      ▼
Authorization: Bearer
```

pelo fluxo atual:

```text
HttpOnly Cookie
      │
      ├── access token
      └── refresh token
             │
             ▼
        Browser-managed
             │
             ▼
          Exactum API
```

Essa mudança também removeu do frontend a necessidade de decodificar JWTs para controlar o estado de autenticação.

O estado necessário para a interface passou a ser obtido através das respostas e endpoints da API.

---

# 28. Current State

A arquitetura está atualmente implementada utilizando:

- JWT;
- access token;
- refresh token;
- HttpOnly cookies;
- Secure cookies em ambiente de produção;
- autenticação via credentials;
- refresh endpoint;
- logout endpoint;
- refresh token rotation;
- Redis para gerenciamento de sessão;
- backend como autoridade de Authentication e Authorization.

O frontend não armazena mais os JWTs em `sessionStorage` e não depende de `Authorization: Bearer <token>` para o fluxo normal de autenticação web.

A documentação Swagger/OpenAPI também representa a autenticação como baseada em cookies HttpOnly.

---

# 29. Known Security Limitation

A adoção de HttpOnly cookies resolve uma classe específica de exposição relacionada ao acesso de tokens pelo JavaScript, mas não representa uma solução completa para todas as ameaças relacionadas à autenticação web.

Em particular:

> **CSRF protection is not currently implemented as a complete security mechanism in the Exactum.**

Essa limitação deve permanecer explícita na documentação de segurança até que uma estratégia formal de proteção contra CSRF seja implementada e registrada em uma decisão própria.

Da mesma forma, HttpOnly não deve ser utilizado como justificativa para considerar a aplicação imune a XSS, CSRF ou outras categorias de ataque.

---

# 30. Future Evolution

A arquitetura poderá evoluir futuramente em áreas como:

- proteção CSRF;
- políticas mais refinadas de `SameSite`;
- rotação e revogação avançada de sessões;
- detecção de reuse de refresh token;
- gerenciamento de múltiplas sessões por usuário;
- limites de sessões simultâneas;
- device/session metadata;
- autenticação de clientes externos;
- OAuth 2.0 / OpenID Connect, caso requisitos futuros justifiquem;
- MFA;
- políticas adaptativas de autenticação.

Essas evoluções deverão ser registradas através de novas ADRs quando representarem decisões arquiteturais relevantes.

---

# 31. Related Decisions

- **ADR-001 — Shared Database Multi-Tenancy**

  - Define o modelo de isolamento entre tenants.

- **ADR-002 — Public UUID Identifiers**

  - Define a separação entre identidade pública de recursos e identidade interna de persistência.

- **ADR-004 — Session Management**

  - Define o gerenciamento server-side das sessões, Redis, JTI, revogação e ciclo de vida da sessão.

- **ADR-005 — Refresh Token Rotation**

  - Define a estratégia de rotação dos refresh tokens.

- **ADR-006 — Impersonation Model**

  - Define o modelo de impersonation de usuários por super-admin.

---

# 32. Related Documentation

Esta decisão está relacionada principalmente aos seguintes documentos:

```text
docs/security/authentication.md
docs/security/authorization.md
docs/security/session-management.md
docs/security/threat-model.md
docs/security/tenant-isolation.md

docs/api/authentication.md
docs/api/conventions.md

docs/architecture/overview.md
docs/architecture/application-architecture.md
```

---

# 33. Architectural Principle

A decisão pode ser resumida pelo seguinte princípio:

> **Authentication credentials should be protected from direct client-side access whenever the browser can manage them securely on behalf of the application.**

No contexto do Exactum:

> **O navegador gerencia as credenciais de autenticação; o backend permanece como autoridade sobre identidade, sessão e autorização.**

---

# 34. Decision Summary

| Aspecto                  | Decisão                              |
| ------------------------ | ------------------------------------ |
| Authentication mechanism | JWT                                  |
| Access token             | HttpOnly cookie                      |
| Refresh token            | HttpOnly cookie                      |
| Frontend token storage   | Não utilizado                        |
| `sessionStorage`         | Não utilizado para JWT               |
| `localStorage`           | Não utilizado para JWT               |
| Authorization header     | Não utilizado no fluxo web atual     |
| Browser credentials      | Utilizadas                           |
| Refresh endpoint         | `/api/auth/refresh`                  |
| Logout endpoint          | `/api/auth/logout`                   |
| Session state            | Redis                                |
| Refresh rotation         | Sim                                  |
| Backend authority        | Authentication + Authorization       |
| Frontend authority       | Nenhuma                              |
| CSRF protection          | Não implementada atualmente          |
| Production transport     | HTTPS                                |
| Token logging            | Proibido                             |
| Impersonation            | Suportado                            |
| Multi-tenancy            | Mantido independente da autenticação |

---

# 35. Final Decision

O Exactum adotará **JWT armazenado em cookies HttpOnly** como mecanismo de autenticação para sua aplicação web.

O access token e o refresh token serão gerenciados pelo navegador através de cookies protegidos, evitando que o frontend tenha acesso direto às credenciais.

O backend permanecerá responsável por:

- autenticar usuários;
- validar tokens;
- controlar sessões;
- renovar credenciais;
- invalidar sessões;
- estabelecer identidade;
- aplicar autorização;
- aplicar tenant isolation;
- controlar impersonation.

O frontend será responsável apenas por consumir a API e representar o estado de autenticação fornecido pelo backend.

A utilização de HttpOnly cookies **não será considerada proteção contra CSRF**, e qualquer mecanismo adicional necessário para essa finalidade deverá ser tratado separadamente.

**Decisão final:**

> **Adotar HttpOnly cookies para armazenamento dos access e refresh tokens, mantendo o backend como autoridade central de Authentication, Session Management e Authorization, e removendo do frontend a responsabilidade de armazenar ou manipular diretamente os JWTs.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de responsabilidade e os conceitos apresentados nesta ADR representam o estado atual e a direção arquitetural do Exactum. Algumas nomenclaturas utilizadas são conceituais e podem não corresponder exatamente aos nomes utilizados na implementação. Da mesma forma, mecanismos de autenticação, sessão, autorização e segurança poderão evoluir conforme novos requisitos forem incorporados. Esta ADR deve, portanto, ser interpretada como o registro da decisão arquitetural adotada no momento de sua aceitação, e não como uma descrição imutável de todas as implementações futuras.
