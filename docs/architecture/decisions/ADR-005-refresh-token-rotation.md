# ADR-005 — Refresh Token Rotation

- **Status:** Accepted
- **Date:** None
- **Decision Type:** Security / Architecture
- **Related Areas:** Authentication, Session Management, Security, Redis, API
- **Supersedes:** Static Refresh Token Lifecycle
- **Superseded By:** None

---

# 1. Context

O Exactum utiliza autenticação baseada em JWT, conforme definido na **ADR-003 — HttpOnly Cookie Authentication**.

O access token possui vida útil limitada e, após sua expiração, o cliente precisa obter um novo token de acesso sem exigir que o usuário informe novamente suas credenciais.

Para isso, o sistema utiliza um **refresh token**.

Uma implementação simples poderia manter o mesmo refresh token durante toda a duração da sessão:

```text
Login
  │
  ▼
Refresh Token A
  │
  ├── Refresh → Access Token B
  │
  ├── Refresh → Access Token C
  │
  ├── Refresh → Access Token D
  │
  └── ...
```

Nesse modelo, o mesmo refresh token permanece reutilizável enquanto não expirar ou for explicitamente revogado.

Esse comportamento cria uma janela de risco relevante.

Caso um refresh token seja comprometido, um atacante que obtenha essa credencial poderá potencialmente continuar utilizando-a enquanto ela permanecer válida.

O gerenciamento de sessão baseado em Redis, definido na **ADR-004 — Redis-Based Session Management**, fornece ao Exactum o estado server-side necessário para controlar individualmente os refresh tokens.

Dessa forma, torna-se possível adotar **Refresh Token Rotation**.

---

# 2. Decision

O Exactum adotará **Refresh Token Rotation**.

Cada utilização válida de um refresh token resultará na emissão de um novo refresh token.

O refresh token anterior será invalidado e não deverá ser reutilizado.

O fluxo será:

```text
Refresh Token A
      │
      │ refresh
      ▼
Backend
      │
      ├── validate A
      ├── invalidate A
      ├── create B
      └── issue B
             │
             ▼
       New Session State
```

Posteriormente:

```text
Refresh Token B
      │
      │ refresh
      ▼
Backend
      │
      ├── validate B
      ├── invalidate B
      ├── create C
      └── issue C
```

Assim, cada refresh representa uma transição do estado da sessão.

---

# 3. Core Principle

O princípio central desta decisão é:

> **A refresh token should be single-use within its rotation family.**

Em termos práticos:

```text
A → B → C → D → E
```

e não:

```text
A → B
A → C
A → D
A → E
```

O token anterior deixa de ser válido depois de uma rotação bem-sucedida.

---

# 4. Relationship with Session Management

A rotação depende diretamente do gerenciamento de sessão definido na ADR-004.

O Redis mantém o estado necessário para determinar se um refresh token ainda pode ser utilizado.

Conceitualmente:

```text
                    Refresh Token
                          │
                          ▼
                         JTI
                          │
                          ▼
                       Redis
                          │
                ┌─────────┴─────────┐
                │                   │
             Active              Revoked
                │                   │
                ▼                   ▼
             Rotate               Reject
```

Sem algum mecanismo de estado server-side, a rotação e a detecção confiável de reutilização tornam-se significativamente mais difíceis.

---

# 5. Refresh Token Identity

Cada refresh token possui um identificador único, representado pelo **JTI**.

O JTI permite que o backend diferencie diferentes gerações de refresh tokens.

Exemplo:

```text
Session
 │
 ├── Refresh Token A
 │      └── JTI A
 │
 ├── Refresh Token B
 │      └── JTI B
 │
 └── Refresh Token C
        └── JTI C
```

A rotação altera o identificador associado à credencial ativa.

---

# 6. Initial Session

Durante o login, o backend cria a primeira geração da sessão.

Exemplo:

```text
Credentials
    │
    ▼
Authentication
    │
    ▼
Create Access Token
    │
    ▼
Create Refresh Token A
    │
    ▼
Create Session State A
    │
    ▼
Set Cookies
```

O refresh token inicial passa a representar a primeira geração da sessão.

---

# 7. Normal Refresh Flow

Quando o access token expira, o frontend não precisa solicitar novamente as credenciais do usuário.

O navegador envia o refresh cookie para:

```http
POST /api/auth/refresh
```

O backend:

1. recebe o refresh token;
2. valida a assinatura;
3. verifica expiração;
4. identifica o JTI;
5. consulta o estado da sessão;
6. verifica se o refresh token ainda está ativo;
7. invalida o refresh token atual;
8. gera novo access token;
9. gera novo refresh token;
10. cria/atualiza o estado da nova sessão;
11. envia os novos cookies.

Fluxo:

```text
Refresh A
   │
   ▼
Validate JWT
   │
   ▼
Lookup JTI A
   │
   ▼
Active?
   │
   ├── No ──► Reject
   │
   ▼
Revoke A
   │
   ▼
Create B
   │
   ▼
Issue Access + Refresh B
```

---

# 8. Refresh Token Rotation Example

Considere uma sessão inicialmente criada com:

```text
Refresh Token A
JTI = A
```

Após o primeiro refresh:

```text
A → B
```

O estado passa a ser:

```text
A = revoked
B = active
```

Após novo refresh:

```text
B → C
```

Estado:

```text
A = revoked
B = revoked
C = active
```

E assim sucessivamente:

```text
A → B → C → D → E
```

Somente a geração atual deve permanecer utilizável.

---

# 9. Why Rotate

A rotação reduz o tempo durante o qual uma determinada credencial de refresh pode ser reutilizada.

Sem rotação:

```text
Compromised Refresh Token
          │
          ▼
   Repeated Reuse
          │
          ▼
Longer Attack Window
```

Com rotação:

```text
Refresh Token
     │
     ▼
Single Successful Use
     │
     ▼
Token Invalidated
     │
     ▼
New Refresh Token
```

A rotação não elimina a possibilidade de comprometimento de credenciais.

Ela reduz a utilidade de uma credencial antiga e permite que o backend identifique tentativas de reutilização quando o estado da sessão é mantido adequadamente.

---

# 10. Refresh Token Reuse

Uma consequência importante da rotação é a possibilidade de detectar o uso de um refresh token que já deveria estar invalidado.

Por exemplo:

```text
A → B
```

Depois que A foi utilizado:

```text
A = revoked
B = active
```

Se uma nova requisição tentar utilizar A:

```text
Refresh A
   │
   ▼
Redis
   │
   ▼
A = revoked
   │
   ▼
Reject
```

Essa situação pode indicar:

- replay;
- comprometimento do token;
- concorrência inesperada;
- comportamento incorreto do cliente;
- tentativa de reutilização maliciosa.

A aplicação deve tratar esse cenário como uma condição de segurança relevante.

---

# 11. Reuse Detection Strategy

A reutilização de um refresh token invalidado deve ser distinguida de um refresh token simplesmente inexistente.

Conceitualmente:

```text
Refresh Token
      │
      ▼
JWT Validation
      │
      ▼
JTI Lookup
      │
      ├── Active
      │      └── Rotate
      │
      ├── Revoked
      │      └── Reuse / Invalid State
      │
      └── Missing
             └── Invalid Session
```

A diferenciação permite que o sistema evolua posteriormente para respostas de segurança mais sofisticadas.

---

# 12. Session Family

Os refresh tokens de uma mesma sessão podem ser entendidos como pertencentes a uma **rotation family**.

Exemplo:

```text
Session Family X

A → B → C → D → E
```

Essa relação permite que o backend compreenda a evolução de uma sessão.

Caso uma geração antiga seja reutilizada, o backend pode determinar que aquela credencial pertence a uma família de sessão cujo estado atual já avançou.

Isso cria uma base para futuras estratégias de invalidação da família inteira.

---

# 13. Compromised Refresh Token

Considere o seguinte cenário:

```text
A → B
```

O cliente legítimo possui B.

Um atacante, porém, possui uma cópia de A.

O atacante tenta utilizar A novamente:

```text
Attacker
   │
   ▼
Refresh A
   │
   ▼
A = revoked
   │
   ▼
Reject
```

O atacante não consegue simplesmente gerar uma nova cadeia a partir de A.

A aplicação pode, dependendo da estratégia futura de segurança, invalidar a família de sessão ou exigir nova autenticação.

---

# 14. Race Conditions

A rotação introduz uma questão importante de concorrência.

Considere duas requisições simultâneas utilizando o mesmo refresh token:

```text
                 Refresh A
                 /       \
                /         \
               ▼           ▼
          Request 1     Request 2
               │           │
               └─────┬─────┘
                     ▼
                  Redis
```

Apenas uma delas deve conseguir realizar a rotação com sucesso.

Caso ambas consigam utilizar o mesmo refresh token, a propriedade de single-use seria violada.

Portanto, a operação de:

```text
check active
+
revoke current
+
issue next
```

deve possuir comportamento suficientemente atômico para impedir que duas requisições concorrentes validem o mesmo token simultaneamente.

---

# 15. Atomicity Requirement

A rotação deve ser tratada como uma operação lógica única.

Conceitualmente:

```text
if refresh_token_active:
    invalidate(refresh_token)
    create(new_refresh_token)
else:
    reject()
```

O sistema não deve permitir que duas requisições atravessem simultaneamente o estado:

```text
active = true
```

e ambas emitam novos tokens.

Redis oferece mecanismos que podem ser utilizados para implementar operações atômicas ou sincronização adequada.

O mecanismo específico utilizado é detalhe de implementação e pode evoluir.

---

# 16. Access Token Rotation

A rotação de refresh token normalmente acompanha a emissão de um novo access token.

Assim, durante um refresh bem-sucedido:

```text
Old Access Token
       │
       ▼
Refresh
       │
       ├── New Access Token
       │
       └── New Refresh Token
```

O novo access token representa o contexto autenticado da nova geração da sessão.

O access token anterior poderá permanecer válido até sua expiração natural, conforme a política de lifetime adotada.

A rotação do refresh token não implica necessariamente revogação imediata de todos os access tokens já emitidos.

---

# 17. Logout Interaction

O logout encerra a sessão ativa.

Se a sessão atual estiver associada ao refresh token C:

```text
A → B → C
         │
         ▼
       Logout
```

O estado correspondente deve ser invalidado.

O navegador também deve ter seus cookies de autenticação removidos.

Conceitualmente:

```text
Session C
   │
   ├── revoke
   │
   └── clear cookies
```

Tokens antigos ou refresh tokens anteriormente revogados não devem recuperar a sessão.

---

# 18. User Blocking Interaction

Quando um usuário é bloqueado, as sessões associadas ao usuário podem precisar ser invalidadas.

A rotação não substitui a regra de bloqueio.

Portanto:

```text
User Blocked
      │
      ▼
Existing Session
      │
      ▼
Session Validation
      │
      ▼
Reject
```

Dependendo da política adotada, o backend pode revogar as sessões existentes imediatamente ou impedir qualquer nova operação de refresh.

Essa decisão deve permanecer alinhada ao modelo de Session Management da ADR-004.

---

# 19. Tenant Suspension Interaction

O mesmo princípio se aplica ao tenant.

Se um tenant for suspenso:

```text
Tenant Suspended
      │
      ▼
Refresh Request
      │
      ▼
Tenant Validation
      │
      ▼
Reject
```

Um refresh token criptograficamente válido não deve permitir que uma sessão continue operando em um tenant que não esteja autorizado.

---

# 20. Impersonation Interaction

A rotação também precisa preservar corretamente o contexto de impersonation.

No modelo atual do Exactum:

- o access token representa o usuário impersonado;
- o refresh token preserva o contexto necessário do super-admin/origem;
- Redis mantém estado relacionado à sessão de impersonation.

Durante a rotação:

```text
Refresh
   │
   ▼
Validate Session
   │
   ▼
Validate Impersonation Context
   │
   ▼
Issue New Tokens
```

A rotação não deve permitir que uma sessão impersonada perca ou altere indevidamente a identidade original do administrador.

Os detalhes completos do modelo de impersonation são tratados pela ADR específica.

---

# 21. Cookies

Conforme definido na ADR-003, os refresh tokens são armazenados em cookies HttpOnly.

Após uma rotação bem-sucedida, o backend deve substituir o cookie antigo pelo novo.

Conceitualmente:

```text
Cookie A
   │
   ▼
Refresh
   │
   ▼
Clear/Replace A
   │
   ▼
Set Cookie B
```

O frontend não precisa conhecer o conteúdo de A ou B.

O navegador simplesmente mantém o cookie correspondente à sessão atual.

---

# 22. Security Properties

A rotação busca fornecer as seguintes propriedades:

### Single-use behavior

Uma geração de refresh token deve ser utilizada uma única vez.

### Revocability

Uma geração específica pode ser invalidada.

### Replay resistance

A reutilização de uma geração anterior pode ser detectada e rejeitada.

### Session continuity

O usuário pode continuar autenticado sem informar novamente suas credenciais.

### Server-side control

O backend pode controlar a validade da sessão independentemente da expiração criptográfica isolada do JWT.

---

# 23. What Rotation Does Not Solve

Refresh Token Rotation não resolve automaticamente:

- XSS;
- CSRF;
- roubo de sessão;
- comprometimento do dispositivo;
- comprometimento do servidor;
- vazamento de credenciais;
- vulnerabilidades de autorização;
- falhas de tenant isolation.

A rotação deve ser considerada uma camada específica de proteção do ciclo de vida do refresh token.

Ela não substitui outras medidas de segurança.

---

# 24. Relationship with CSRF

Como definido na ADR-003, o Exactum utiliza cookies HttpOnly.

Consequentemente, o navegador envia automaticamente os cookies de autenticação conforme as regras aplicáveis.

A rotação não constitui proteção contra CSRF.

Portanto:

```text
HttpOnly Cookies
       +
Refresh Rotation
       ≠
Complete CSRF Protection
```

A proteção contra CSRF deve ser tratada separadamente.

---

# 25. Redis State

O Redis mantém o estado necessário para identificar a geração atual e seu status.

Um modelo conceitual pode ser:

```text
session:<refresh_jti>
    │
    ├── user
    ├── tenant
    ├── status
    ├── created_at
    └── expires_at
```

Os nomes e campos exatos são detalhes de implementação.

O princípio arquitetural é que o backend deve conseguir determinar se o JTI recebido representa uma geração de refresh atualmente válida.

---

# 26. Expiration

Refresh tokens continuam possuindo expiração própria.

A rotação não significa que a sessão seja infinita.

Exemplo:

```text
Session Created
      │
      ▼
A → B → C → D
      │
      │
      └──────► Session Expiration
```

Cada geração possui validade própria e a sessão como um todo deve respeitar as políticas de lifetime estabelecidas pelo sistema.

A rotação não deve permitir renovação indefinida caso a política da sessão determine um limite absoluto.

---

# 27. Sliding Session vs Absolute Session Lifetime

Uma evolução importante é distinguir:

### Sliding Lifetime

Cada refresh prolonga a sessão.

```text
A → B → C → D → E
```

A sessão continua enquanto o usuário permanecer ativo.

### Absolute Lifetime

Existe um limite máximo para a sessão.

```text
Login
  │
  ├── A
  ├── B
  ├── C
  └── Maximum Lifetime
           │
           ▼
        Re-login
```

O Exactum pode evoluir para uma política que combine:

- refresh token lifetime;
- idle timeout;
- absolute session lifetime.

Esses parâmetros devem ser tratados como políticas de segurança específicas quando definidos.

---

# 28. Alternatives Considered

## 28.1 Static Refresh Token

### Descrição

Manter o mesmo refresh token durante toda a sessão.

```text
A → A → A → A
```

### Vantagens

- implementação simples;
- menor quantidade de operações de estado;
- menor complexidade.

### Desvantagens

- maior janela de exploração caso o token seja comprometido;
- não detecta reutilização da mesma forma;
- menor granularidade de controle.

### Decisão

**Rejeitado.**

---

# 29. Short-Lived Access Token Without Rotation

### Descrição

Utilizar access tokens de curta duração, mas manter refresh token estático.

### Vantagens

- access token possui janela de exposição menor;
- implementação relativamente simples.

### Desvantagens

- refresh token continua sendo uma credencial de longa duração;
- comprometimento do refresh token continua tendo impacto significativo;
- menor capacidade de detectar replay.

### Decisão

**Rejeitado como estratégia completa.**

---

# 30. Refresh Token Rotation

### Descrição

Substituir o refresh token a cada utilização.

### Vantagens

- reduz a reutilização de credenciais antigas;
- permite detecção de replay;
- melhora o controle de sessão;
- integra-se ao Redis;
- suporta evolução para session families;
- permite políticas de resposta a comprometimento.

### Desvantagens

- maior complexidade;
- exige estado server-side;
- exige cuidado com concorrência;
- exige tratamento correto de falhas de rede;
- aumenta operações no Redis.

### Decisão

**Adotado.**

---

# 31. Network Failure Considerations

Um ponto importante é o comportamento quando a rotação é concluída no backend, mas a resposta não chega corretamente ao cliente.

Exemplo:

```text
Client
  │
  │ Refresh A
  ▼
Backend
  │
  ├── revoke A
  ├── create B
  │
  X── response lost
```

O cliente pode continuar possuindo A enquanto o servidor já considera A inválido.

Na próxima tentativa:

```text
Client
  │
  │ Refresh A
  ▼
Backend
  │
  ▼
A = revoked
  │
  ▼
Reject
```

Esse cenário exige que o cliente possua comportamento apropriado para recuperar a sessão ou solicitar nova autenticação.

A implementação deve evitar que falhas normais de rede resultem em inconsistência permanente ou comportamento imprevisível.

---

# 32. Concurrency and Client Behavior

O frontend também deve evitar múltiplos refreshes simultâneos desnecessários.

Por exemplo, se várias requisições receberem `401` ao mesmo tempo:

```text
Request A ──┐
Request B ──┤
Request C ──┼──► Refresh
Request D ──┤
Request E ──┘
```

o cliente deve preferencialmente coordenar a renovação para evitar múltiplas operações concorrentes sobre o mesmo refresh token.

Uma estratégia comum é permitir que apenas uma operação de refresh seja executada enquanto as demais aguardam o resultado.

A implementação específica pertence ao frontend e não altera a decisão arquitetural registrada nesta ADR.

---

# 33. Observability

Eventos relacionados à rotação podem ser observados através de eventos de plataforma e logs estruturados.

Exemplos:

```text
SESSION_REFRESHED
REFRESH_TOKEN_ROTATED
REFRESH_TOKEN_REUSE_DETECTED
SESSION_REVOKED
```

Os eventos podem incluir:

- user UUID;
- tenant UUID;
- JTI;
- request ID;
- correlation ID;
- timestamp;
- resultado;
- motivo da rejeição.

Tokens completos não devem ser registrados.

---

# 34. Security Response to Reuse

A reutilização de um refresh token já invalidado deve ser tratada como evento de segurança relevante.

Uma estratégia futura poderá determinar:

```text
Reuse Detected
      │
      ▼
Invalidate Current Session
      │
      ▼
Invalidate Session Family
      │
      ▼
Require Re-authentication
```

O nível exato de resposta pode depender do contexto.

Esta ADR estabelece a capacidade de detectar a reutilização, mas não obriga uma política específica de resposta além da rejeição da credencial inválida.

Uma política mais sofisticada pode ser definida posteriormente.

---

# 35. Performance Considerations

Cada refresh exige operações adicionais:

- validação do JWT;
- consulta do estado;
- invalidação da geração anterior;
- criação da nova geração;
- atualização do estado;
- emissão dos cookies.

Essas operações ocorrem principalmente quando o access token precisa ser renovado, e não em todas as requisições normais.

Redis foi escolhido justamente para manter esse fluxo de baixa latência.

A rotação, portanto, adiciona complexidade e algumas operações de infraestrutura, mas mantém o custo concentrado em eventos de refresh.

---

# 36. Horizontal Scaling

A rotação é compatível com múltiplas instâncias da API.

Exemplo:

```text
                 Nginx
                   │
          ┌────────┼────────┐
          │        │        │
          ▼        ▼        ▼
        API #1   API #2   API #3
          │        │        │
          └────────┼────────┘
                   │
                   ▼
                 Redis
```

O estado compartilhado impede que uma instância considere um refresh token válido enquanto outra já o invalidou.

Isso é particularmente importante para a propriedade de single-use.

---

# 37. Testing Strategy

Os testes devem validar tanto o fluxo normal quanto condições adversas.

## 37.1 Normal Rotation

```text
A → B → C
```

Verificar:

- A aceita uma vez;
- B é emitido;
- A deixa de ser válido;
- B aceita uma vez;
- C é emitido.

---

## 37.2 Reuse

```text
A → B

A → reject
```

Verificar que A não pode ser reutilizado.

---

## 37.3 Concurrent Refresh

Duas requisições utilizando A simultaneamente.

Esperado:

```text
Request 1 → success
Request 2 → reject
```

ou outro comportamento equivalente que preserve a propriedade de single-use.

---

## 37.4 Expired Token

Refresh token expirado deve ser rejeitado independentemente de seu estado no Redis.

---

## 37.5 Revoked Session

Refresh token associado a uma sessão revogada deve ser rejeitado.

---

## 37.6 User Block

Refresh de usuário bloqueado deve ser rejeitado.

---

## 37.7 Tenant Suspension

Refresh de usuário pertencente a tenant suspenso deve ser rejeitado.

---

## 37.8 Logout

Depois de logout:

```text
Refresh Current → reject
```

---

## 37.9 Impersonation

Durante impersonation:

```text
Refresh
   │
   ▼
New Access Token
   │
   ▼
Still impersonated correctly
```

A identidade original deve permanecer corretamente associada à sessão.

---

# 38. Operational Implications

A rotação aumenta a importância operacional do Redis.

Devem ser monitorados:

- latência do Redis;
- quantidade de sessões;
- taxa de refresh;
- taxa de refresh rejeitado;
- taxa de token reuse;
- erros de Redis;
- falhas de rotação;
- sessões revogadas.

Um aumento anormal de:

```text
REFRESH_TOKEN_REUSE_DETECTED
```

pode indicar:

- problema de implementação;
- cliente com comportamento incorreto;
- concorrência;
- possível comprometimento de sessão.

---

# 39. Future Evolution

Esta decisão permite futuras evoluções como:

- refresh token family tracking;
- reuse detection mais sofisticada;
- revogação da session family inteira;
- absolute session lifetime;
- idle timeout;
- device/session metadata;
- step-up authentication;
- MFA;
- detecção de anomalias;
- bloqueio automático após reuse;
- integração com observabilidade;
- alertas de segurança.

Essas funcionalidades devem ser registradas em novas ADRs quando introduzirem decisões arquiteturais independentes.

---

# 40. Related Decisions

- **ADR-001 — Shared Database Multi-Tenancy**
- **ADR-002 — Public UUID Identifiers**
- **ADR-003 — HttpOnly Cookie Authentication**
- **ADR-004 — Redis-Based Session Management**
- **ADR-006 — Impersonation Model**
- **ADR-008 — Observability Strategy**

A ADR-003 define o transporte e armazenamento dos tokens no navegador.

A ADR-004 define o estado server-side das sessões.

Esta ADR define a política de evolução do refresh token dentro desse modelo.

---

# 41. Related Documentation

```text
docs/security/authentication.md
docs/security/session-management.md
docs/security/authorization.md
docs/security/threat-model.md

docs/api/authentication.md

docs/architecture/application-architecture.md

docs/observability/overview.md
docs/observability/platform-events.md
docs/observability/audit-logging.md
docs/observability/correlation.md
```

---

# 42. Architectural Principle

A decisão pode ser resumida pelo seguinte princípio:

> **Refresh credentials should rotate as they are consumed, allowing the server to invalidate previous generations and detect replay.**

No contexto do Exactum:

> **Cada utilização válida de um refresh token deve produzir uma nova geração de credencial e invalidar a geração anterior.**

---

# 43. Decision Summary

| Aspecto                | Decisão                       |
| ---------------------- | ----------------------------- |
| Refresh token rotation | Sim                           |
| Refresh token reuse    | Não permitido                 |
| Token identity         | JTI                           |
| Session state          | Redis                         |
| Single-use behavior    | Sim                           |
| Previous token         | Revogado após rotação         |
| New refresh token      | Emitido a cada refresh válido |
| New access token       | Emitido a cada refresh válido |
| Replay detection       | Suportada                     |
| Session family         | Conceito suportado            |
| Concurrent refresh     | Deve preservar single-use     |
| Logout                 | Revoga sessão                 |
| User blocking          | Pode invalidar sessão         |
| Tenant suspension      | Pode invalidar sessão         |
| Impersonation          | Mantida durante rotação       |
| CSRF protection        | Não fornecida pela rotação    |
| Token logging          | Proibido                      |
| Horizontal scaling     | Suportado                     |
| Redis dependency       | Sim                           |
| Stateless JWT-only     | Não                           |

---

# 44. Final Decision

O Exactum adotará **Refresh Token Rotation** como política padrão para renovação das sessões autenticadas.

Cada refresh token poderá ser utilizado para uma única operação de renovação. Após uma rotação bem-sucedida, o refresh token anterior será invalidado e uma nova geração será emitida.

O estado necessário para controlar esse ciclo será mantido no Redis, conforme definido na ADR-004.

A solução deverá preservar a propriedade de single-use mesmo diante de requisições concorrentes e deverá rejeitar tentativas de reutilização de refresh tokens já invalidados.

**Decisão final:**

> **Adotar Refresh Token Rotation com controle server-side baseado em JTI e Redis, invalidando cada refresh token após seu uso bem-sucedido e emitindo uma nova geração, de modo a reduzir a janela de exploração de credenciais comprometidas e permitir detecção de reutilização.**

---

**Observação sobre nomenclatura e evolução arquitetural:** a organização, os limites de responsabilidade e os conceitos apresentados nesta ADR representam o estado atual e a direção arquitetural do Exactum. Algumas nomenclaturas são conceituais e podem não corresponder exatamente aos nomes utilizados na implementação. O formato das chaves Redis, o mecanismo específico de atomicidade, a estrutura das session families e a política de resposta a reuse detection poderão evoluir conforme os requisitos de segurança amadureçam. Esta ADR registra a decisão de adotar rotação de refresh tokens, enquanto detalhes de implementação e políticas futuras poderão ser formalizados em decisões arquiteturais próprias.
