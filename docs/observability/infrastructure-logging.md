# Infrastructure Logging

> **Status:** Active
> **Scope:** Application and infrastructure logging
> **Primary consumers:** Developers, operators and maintainers
> **Related:** [Observability Overview](./overview.md), [Correlation](./correlation.md), [Platform Events](./platform-events.md), [Audit Logging](./audit-logging.md)

---

## 1. Purpose

Este documento define como o Exactum utiliza **infrastructure logging** para registrar informações técnicas relacionadas à execução da aplicação e de sua infraestrutura.

O objetivo principal dos logs é fornecer informações suficientes para:

- diagnosticar falhas;
- investigar comportamento inesperado;
- acompanhar o ciclo de vida de uma requisição;
- identificar problemas de performance;
- analisar falhas de dependências externas;
- correlacionar eventos técnicos;
- auxiliar operações e troubleshooting em produção;
- fornecer contexto para investigação de incidentes.

Infrastructure logs são voltados principalmente para **desenvolvedores e operadores da plataforma**.

Eles não substituem:

- **Platform Events**, responsáveis por registrar acontecimentos relevantes no nível da plataforma;
- **Tenant Audit Logs**, responsáveis por registrar ações realizadas dentro do contexto de um tenant;
- **Metrics**, responsáveis por representar medições agregadas do comportamento do sistema;
- **Distributed Tracing**, previsto como evolução futura da observabilidade.

A separação dessas responsabilidades evita transformar o sistema de logging em um mecanismo genérico para qualquer tipo de evento.

---

# 2. Logging Philosophy

O logging do Exactum segue alguns princípios fundamentais.

## 2.1 Structured Logging

Os logs devem ser estruturados sempre que possível, evitando depender exclusivamente de mensagens textuais não estruturadas.

Em vez de produzir apenas:

```text
User login failed
```

o sistema deve fornecer contexto suficiente para investigação:

```json
{
  "level": "WARNING",
  "event": "authentication_failed",
  "request_id": "01J...",
  "user_id": null,
  "tenant_id": "01J...",
  "method": "POST",
  "path": "/api/auth/login",
  "status_code": 401
}
```

O formato estruturado permite que os logs sejam posteriormente consumidos por ferramentas de agregação, busca e análise sem depender de parsing frágil de strings.

---

## 2.2 Contextual Logging

Um log isolado frequentemente possui pouco valor.

O contexto associado ao log é tão importante quanto a mensagem em si.

Quando disponível, informações como:

- `request_id`;
- `user_id`;
- `tenant_id`;
- HTTP method;
- request path;
- status code;
- duration;
- exception type;
- service/component;
- operation;

devem acompanhar o registro.

Isso permite reconstruir o contexto operacional de um problema sem exigir que o operador conheça previamente todos os detalhes internos da execução.

---

## 2.3 Logs devem responder perguntas

Um bom log deve ajudar a responder perguntas como:

- O que aconteceu?
- Onde aconteceu?
- Quando aconteceu?
- Em qual requisição?
- Em qual tenant?
- Qual usuário estava envolvido?
- Qual operação estava sendo executada?
- Qual componente falhou?
- Qual foi o impacto técnico?
- Existe uma exceção associada?
- O problema ocorreu em uma dependência externa?

Logs que não contribuem para responder perguntas operacionais devem ser evitados.

---

# 3. Responsibility Boundary

O infrastructure logging possui uma responsabilidade diferente dos demais mecanismos de observabilidade.

### Infrastructure Logs

Registram informações relacionadas à execução técnica.

Exemplos:

- HTTP requests;
- HTTP responses;
- exceptions;
- database failures;
- Redis failures;
- authentication failures;
- authorization failures;
- rate limiting;
- integração com serviços externos;
- problemas de infraestrutura;
- operações técnicas relevantes.

### Platform Events

Representam acontecimentos relevantes para a plataforma.

Exemplos:

- impersonation started;
- impersonation stopped;
- tenant suspended;
- tenant activated;
- administrative operations;
- platform-level security events.

### Tenant Audit Logs

Representam ações realizadas dentro do contexto de negócio de um tenant.

Exemplos:

- criação de produto;
- alteração de preço;
- exclusão de registro;
- alteração de estoque;
- operações administrativas dentro do tenant.

A distinção é importante porque **nem todo log técnico é um evento de negócio e nem todo evento de negócio deve ser tratado como um log técnico**.

---

# 4. Log Structure

Os logs devem utilizar uma estrutura consistente.

Uma entrada pode conter campos semelhantes a:

```json
{
  "timestamp": "2026-09-08T21:30:15.123Z",
  "level": "INFO",
  "event": "http_request_completed",
  "request_id": "01K...",
  "method": "GET",
  "path": "/api/products",
  "status_code": 200,
  "duration_ms": 42.17,
  "user_id": "01K...",
  "tenant_id": "01K..."
}
```

Os campos não precisam estar presentes em todos os logs.

Por exemplo, um erro ocorrido durante o startup da aplicação pode não possuir `request_id`, `user_id` ou `tenant_id`.

O princípio é:

> **Adicionar o máximo de contexto útil disponível sem inventar ou duplicar informações.**

---

# 5. Standard Fields

Os seguintes campos representam informações comuns que podem ser utilizadas pelos logs da aplicação.

| Field            | Description                                      |
| ---------------- | ------------------------------------------------ |
| `timestamp`      | Momento em que o evento ocorreu                  |
| `level`          | Severidade do log                                |
| `event`          | Nome estruturado do evento                       |
| `message`        | Descrição humana complementar, quando necessária |
| `request_id`     | Identificador da requisição                      |
| `method`         | HTTP method                                      |
| `path`           | Request path                                     |
| `status_code`    | HTTP status code                                 |
| `duration_ms`    | Duração da operação                              |
| `user_id`        | Identificador do usuário relacionado à operação  |
| `tenant_id`      | Identificador do tenant relacionado              |
| `role`           | Role relevante para a operação, quando aplicável |
| `component`      | Componente responsável pelo log                  |
| `exception_type` | Tipo da exceção, quando aplicável                |
| `error_code`     | Código interno de erro, quando aplicável         |

Nem todos os campos devem ser preenchidos obrigatoriamente.

A presença dos campos depende do contexto do evento.

---

# 6. Event Naming

Eventos estruturados devem utilizar nomes previsíveis e consistentes.

Exemplos:

```text
http_request_started
http_request_completed
authentication_failed
authorization_denied
refresh_token_revoked
database_error
redis_error
rate_limit_exceeded
external_service_error
unhandled_exception
```

O nome do evento deve representar **o que aconteceu**, e não apenas o componente que produziu o log.

Por exemplo:

```text
database
```

é pouco informativo.

Já:

```text
database_connection_failed
```

descreve claramente o acontecimento.

---

# 7. HTTP Request Logging

As requisições HTTP representam uma das principais fontes de infraestrutura observável do Exactum.

Quando apropriado, o ciclo de uma requisição pode ser representado por informações como:

```text
request started
        ↓
request processed
        ↓
response generated
        ↓
request completed
```

O log de uma requisição concluída deve permitir identificar, quando disponível:

- HTTP method;
- path;
- status code;
- duration;
- request ID;
- user;
- tenant;
- resultado da operação.

Exemplo:

```json
{
  "level": "INFO",
  "event": "http_request_completed",
  "request_id": "01K...",
  "method": "GET",
  "path": "/api/products",
  "status_code": 200,
  "duration_ms": 31.42,
  "user_id": "01K...",
  "tenant_id": "01K..."
}
```

Isso permite responder rapidamente perguntas como:

> Quais requisições estão demorando mais?

> Qual usuário executou a requisição?

> Em qual tenant ocorreu o problema?

> Qual endpoint está retornando erros?

---

# 8. Request Duration

A duração da requisição deve ser registrada quando possível.

O campo:

```text
duration_ms
```

permite identificar problemas de performance sem depender exclusivamente de métricas futuras.

Exemplo:

```json
{
  "event": "http_request_completed",
  "duration_ms": 842.51,
  "status_code": 200
}
```

Uma duração elevada pode indicar problemas em:

- queries;
- acesso ao PostgreSQL;
- Redis;
- processamento da aplicação;
- integrações externas;
- serialização;
- regras de negócio;
- infraestrutura.

Infrastructure logs não substituem métricas de performance, mas fornecem contexto importante para investigação.

---

# 9. Correlation ID

Cada requisição deve possuir um identificador capaz de correlacionar os diferentes logs associados àquela execução.

No Exactum, esse identificador é tratado como **request ID / correlation ID**.

Exemplo:

```text
request_id = 01K...
```

O mesmo identificador deve acompanhar os logs relacionados àquela requisição sempre que tecnicamente possível.

Exemplo:

```text
http_request_started
        │
        ├── authentication
        │
        ├── authorization
        │
        ├── application service
        │
        ├── repository
        │
        ├── database
        │
        └── http_request_completed
```

Todos esses registros podem compartilhar o mesmo `request_id`.

A estratégia detalhada de geração, propagação e utilização desse identificador está documentada em [Correlation](./correlation.md).

---

# 10. Authentication Logging

Operações relacionadas à autenticação possuem relevância operacional e de segurança.

Eventos como:

- login bem-sucedido;
- login inválido;
- refresh token inválido;
- refresh token revogado;
- logout;
- sessão inválida;
- usuário bloqueado;
- tenant suspenso;

podem gerar logs técnicos apropriados.

Entretanto, os logs **não devem registrar credenciais ou tokens**.

Por exemplo, um log de falha de autenticação pode registrar:

```json
{
  "level": "WARNING",
  "event": "authentication_failed",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/auth/login",
  "status_code": 401
}
```

Mas não deve registrar:

```json
{
  "password": "...",
  "access_token": "...",
  "refresh_token": "..."
}
```

---

# 11. Authorization Logging

Falhas de autorização também podem ser relevantes para troubleshooting e segurança.

Exemplo:

```json
{
  "level": "WARNING",
  "event": "authorization_denied",
  "request_id": "01K...",
  "user_id": "01K...",
  "tenant_id": "01K...",
  "status_code": 403
}
```

Quando aplicável, informações como role ou permission podem ser registradas.

Entretanto, deve-se evitar registrar dados excessivos ou informações internas que possam facilitar a exposição da estrutura de segurança da aplicação.

---

# 12. Database Logging

Problemas relacionados ao PostgreSQL devem ser registrados quando impedirem ou comprometerem uma operação.

Exemplos:

- connection failure;
- timeout;
- constraint violation;
- transaction failure;
- migration failure;
- unexpected database exception.

Exemplo:

```json
{
  "level": "ERROR",
  "event": "database_error",
  "request_id": "01K...",
  "tenant_id": "01K...",
  "exception_type": "OperationalError"
}
```

O log pode conter informações técnicas suficientes para investigação, mas não deve expor:

- database passwords;
- connection strings completas;
- secrets;
- dados sensíveis armazenados em registros;
- credenciais de infraestrutura.

---

# 13. Redis Logging

O Redis é utilizado pelo sistema para operações relacionadas à sessão e gerenciamento de tokens.

Falhas relevantes podem incluir:

- connection failure;
- timeout;
- unavailable Redis instance;
- unexpected command failure;
- session lookup failure.

Exemplo:

```json
{
  "level": "ERROR",
  "event": "redis_error",
  "request_id": "01K...",
  "exception_type": "ConnectionError"
}
```

Da mesma forma que no PostgreSQL, informações confidenciais nunca devem ser incluídas diretamente nos logs.

---

# 14. Exception Logging

Exceções representam uma das principais fontes de informação para troubleshooting.

Quando uma exceção inesperada ocorrer, o sistema deve registrar informações suficientes para permitir sua investigação.

Um erro pode conter:

```json
{
  "level": "ERROR",
  "event": "unhandled_exception",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/products",
  "status_code": 500,
  "exception_type": "UnexpectedError"
}
```

Quando apropriado, o stack trace deve ser preservado no log interno.

O cliente, entretanto, não deve necessariamente receber o mesmo conteúdo.

---

# 15. Internal Error vs Client Response

Um princípio importante é separar:

1. **informação técnica interna**;
2. **resposta pública da API**.

Por exemplo, internamente pode existir:

```text
OperationalError
connection refused
database host unavailable
```

Enquanto a API pode responder:

```json
{
  "message": "An internal error occurred."
}
```

O log interno existe para permitir investigação.

A resposta HTTP existe para fornecer ao cliente uma mensagem segura e apropriada.

Isso evita expor:

- stack traces;
- SQL;
- infrastructure details;
- paths internos;
- credentials;
- secrets;
- informações sobre componentes internos.

---

# 16. Duplicate Error Logging

A mesma exceção não deve ser registrada repetidamente em todas as camadas sem necessidade.

Um fluxo como:

```text
Repository
    ↓ log error
Service
    ↓ log error
Controller
    ↓ log error
Global handler
    ↓ log error
```

pode produzir quatro registros para uma única falha.

Isso dificulta a investigação e aumenta o volume de logs.

Sempre que possível, o erro deve ser registrado no nível que possui **contexto suficiente e responsabilidade adequada** para representar aquela falha.

Camadas inferiores podem adicionar contexto ou propagar a exceção sem necessariamente gerar outro log.

---

# 17. Log Levels

O sistema utiliza níveis de severidade para diferenciar eventos.

## DEBUG

Informações detalhadas utilizadas principalmente durante desenvolvimento ou troubleshooting específico.

Exemplos:

- detalhes internos de uma operação;
- informações temporárias de diagnóstico;
- fluxo detalhado de determinada operação.

Logs `DEBUG` devem ser utilizados com cautela em produção devido ao volume potencialmente elevado.

---

## INFO

Eventos normais e relevantes para acompanhamento operacional.

Exemplos:

- request completed;
- startup;
- shutdown;
- operações técnicas relevantes;
- configuração carregada com sucesso.

---

## WARNING

Eventos inesperados ou anômalos que não necessariamente representam uma falha da aplicação.

Exemplos:

- authentication failure;
- authorization denied;
- rate limit exceeded;
- comportamento degradado;
- fallback acionado.

Um `WARNING` não significa necessariamente que o sistema está quebrado.

---

## ERROR

Falhas que impediram uma operação ou representam um problema técnico significativo.

Exemplos:

- database error;
- Redis unavailable;
- external service failure;
- unexpected application exception.

---

## CRITICAL

Falhas graves que podem comprometer a disponibilidade ou integridade geral do sistema.

Exemplos:

- aplicação incapaz de inicializar;
- infraestrutura essencial indisponível;
- falha que comprometa operações críticas da plataforma.

O nível `CRITICAL` deve ser reservado para situações realmente severas.

---

# 18. Sensitive Data Sanitization

Logging nunca deve ser tratado como um local seguro para armazenar dados arbitrários.

Os logs devem seguir o princípio de **data minimization**.

Nunca registrar diretamente:

- passwords;
- access tokens;
- refresh tokens;
- session cookies;
- API keys;
- secrets;
- database credentials;
- authentication headers;
- valores completos de credenciais;
- informações sensíveis desnecessárias;
- request bodies contendo dados confidenciais.

Particularmente, headers como:

```text
Authorization
Cookie
Set-Cookie
```

devem ser tratados como dados sensíveis.

---

# 19. Request Body Logging

O request body não deve ser registrado indiscriminadamente.

Embora o conteúdo do body possa ser útil para debugging, seu uso indiscriminado pode resultar na exposição de:

- passwords;
- tokens;
- dados pessoais;
- dados comerciais;
- informações financeiras;
- outros dados sensíveis.

Portanto, request bodies devem ser registrados somente quando existir uma necessidade técnica clara e após sanitização apropriada.

Em produção, o comportamento padrão deve favorecer a minimização de dados.

---

# 20. Query Parameters

Query parameters também podem conter informações sensíveis.

Por isso, registrar automaticamente a URL completa pode ser inadequado.

Em vez de assumir que:

```text
/api/resource?parameter=value
```

é sempre seguro, o sistema deve considerar o contexto do endpoint.

Quando parâmetros puderem conter dados sensíveis, eles devem ser:

- omitidos;
- sanitizados;
- redacted;
- ou registrados apenas de maneira parcial.

---

# 21. Multi-Tenant Context

O Exactum é uma aplicação multi-tenant.

Consequentemente, `tenant_id` é um dos contextos mais importantes para troubleshooting.

Quando uma requisição ocorre dentro de um tenant, os logs técnicos relevantes devem carregar esse contexto sempre que possível.

Exemplo:

```json
{
  "event": "database_error",
  "request_id": "01K...",
  "user_id": "01K...",
  "tenant_id": "01K..."
}
```

Isso permite investigar problemas específicos sem depender exclusivamente da análise do conteúdo da requisição.

Ao mesmo tempo, o `tenant_id` não deve ser utilizado como substituto dos mecanismos reais de isolamento.

Logging fornece **observability**, não **authorization**.

---

# 22. Impersonation

Operações realizadas durante **impersonation** exigem atenção adicional.

Quando um super-admin atua temporariamente como outro usuário, os logs técnicos relacionados à operação devem preservar o contexto disponível para permitir distinguir:

- quem executou originalmente a operação;
- qual usuário estava sendo impersonated;
- qual tenant estava envolvido;
- qual requisição realizou a operação.

Por exemplo, uma operação pode possuir:

```text
request_id
tenant_id
user_id
impersonated_user_id
```

quando esses campos estiverem disponíveis no contexto.

A trilha formal de início e encerramento da impersonation pertence aos **Platform Events**, e não exclusivamente aos infrastructure logs.

---

# 23. Rate Limiting

Eventos relacionados a rate limiting podem ser relevantes para observabilidade.

Exemplo:

```json
{
  "level": "WARNING",
  "event": "rate_limit_exceeded",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/auth/login",
  "status_code": 429
}
```

Esse tipo de evento pode ajudar a identificar:

- abuso de endpoints;
- comportamento anômalo;
- problemas de configuração;
- limites excessivamente restritivos;
- possíveis tentativas automatizadas.

Entretanto, o log deve evitar armazenar dados sensíveis utilizados durante a requisição.

---

# 24. External Dependencies

Quando o Exactum depender de serviços externos, falhas nessas dependências devem possuir contexto suficiente para investigação.

Exemplo:

```json
{
  "level": "ERROR",
  "event": "external_service_error",
  "request_id": "01K...",
  "component": "external_service",
  "exception_type": "TimeoutError"
}
```

Sempre que possível, devem ser registrados:

- serviço envolvido;
- operação;
- timeout;
- status;
- duração;
- request ID;
- tipo da falha.

Credenciais e secrets nunca devem ser incluídos.

---

# 25. Application Layers

Infrastructure logging deve respeitar a separação entre as camadas da aplicação.

Uma arquitetura simplificada:

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

Cada camada possui um contexto diferente.

### Routes / Controllers

Possuem contexto HTTP.

Podem registrar:

- method;
- path;
- status;
- request ID;
- duration.

### Application Services

Podem possuir contexto da operação executada.

Devem evitar transformar cada chamada interna em um log indiscriminado.

### Repositories

Podem registrar falhas técnicas relacionadas à persistência quando necessário.

### Persistence / Infrastructure

Pode registrar problemas de integração com PostgreSQL, Redis ou outros recursos.

A aplicação deve evitar espalhar responsabilidades de logging de infraestrutura pelo domínio.

---

# 26. Domain Independence

O domínio da aplicação não deve depender diretamente de mecanismos específicos do Flask ou de infraestrutura de logging.

Por exemplo, regras de negócio não devem depender diretamente de:

```python
from flask import current_app
```

para realizar logging.

Essa separação é especialmente importante considerando a evolução arquitetural do Exactum em direção a uma organização mais próxima de **DDD**.

O objetivo é permitir que:

- domínio;
- application layer;
- infrastructure;

tenham responsabilidades claramente separadas.

Infrastructure logging pertence principalmente à camada de infraestrutura e aos pontos de integração apropriados da aplicação.

---

# 27. Development vs Production

O comportamento dos logs pode variar conforme o ambiente.

## Development

Pode ser útil possuir informações mais detalhadas para facilitar:

- debugging;
- desenvolvimento;
- testes manuais;
- investigação local.

Logs `DEBUG` podem ser habilitados quando necessário.

---

## Production

Produção deve priorizar:

- structured logs;
- baixo ruído;
- informações operacionais relevantes;
- sanitização;
- correlação;
- estabilidade;
- volume controlado.

Logs excessivamente verbosos em produção podem dificultar a identificação de problemas importantes.

---

# 28. Logging Failures

O mecanismo de logging não deve se tornar um ponto único de falha da aplicação.

Se o sistema de logging apresentar algum problema, isso não deve causar uma falha adicional na operação principal sempre que tecnicamente possível.

Em outras palavras:

```text
Application failure
        ↓
Logging attempt
        ↓
Logging failure
```

não deve se transformar em:

```text
Application failure
        ↓
Logging failure
        ↓
Application crashes again
```

A observabilidade deve ajudar a operação, não comprometer a disponibilidade do sistema.

---

# 29. Performance Considerations

Logging possui custo.

Cada log pode representar:

- CPU;
- memória;
- I/O;
- armazenamento;
- processamento posterior;
- tráfego de rede;
- custo de retenção.

Por isso, logs devem ser produzidos de forma intencional.

Evitar:

```text
log everything
```

A estratégia deve ser:

```text
log what is operationally useful
```

Particularmente, operações executadas em loops ou caminhos de alta frequência devem ser avaliadas para evitar volume excessivo.

---

# 30. High-Volume Endpoints

Endpoints de alta frequência podem produzir grandes quantidades de logs.

O sistema deve considerar:

- nível apropriado;
- sampling quando necessário;
- agregação futura;
- redução de informações redundantes;
- métricas para dados que não precisam de logs individuais.

Por exemplo, se o objetivo for descobrir a taxa média de requisições por segundo, uma métrica é mais apropriada do que depender exclusivamente da contagem manual de logs.

---

# 31. Logs and Metrics

Logs e metrics possuem funções diferentes.

### Logs

Respondem:

> O que aconteceu nesta execução?

### Metrics

Respondem:

> Com que frequência isso acontece?

Por exemplo:

```text
Log:
request_id=01K...
status_code=500
path=/api/products
```

Enquanto uma métrica poderia representar:

```text
http_requests_total{path="/api/products",status="500"}
```

O Exactum pode evoluir para utilizar métricas com **Prometheus** e dashboards com **Grafana**.

Até essa evolução, os logs estruturados fornecem uma base importante para observabilidade operacional.

---

# 32. Logs and Tracing

Logs são úteis para reconstruir uma execução, mas possuem limitações quando o sistema evolui para múltiplos serviços ou processos assíncronos.

Com a introdução futura de componentes como:

- background workers;
- Celery;
- RabbitMQ;
- serviços externos;

a necessidade de **distributed tracing** pode aumentar.

Nesse cenário, o `request_id` e outros identificadores de correlação podem evoluir para uma estratégia de tracing mais completa.

O objetivo não é substituir logs por tracing, mas permitir que ambos trabalhem juntos.

---

# 33. Log Retention

Logs possuem valor operacional por um período limitado.

A estratégia de retenção deve considerar:

- necessidade de troubleshooting;
- segurança;
- privacidade;
- custo de armazenamento;
- volume produzido;
- ambiente;
- requisitos operacionais.

Logs antigos devem ser removidos ou arquivados conforme a política definida para o ambiente.

A retenção de logs técnicos também deve ser diferenciada da retenção de **audit logs**, que pode possuir requisitos distintos.

---

# 34. Access Control

Logs podem conter informações operacionais sensíveis.

Por isso, acesso aos logs deve ser limitado a pessoas e sistemas que realmente necessitem dessas informações.

Um operador com acesso aos logs pode potencialmente observar:

- usuários;
- tenants;
- endpoints;
- erros internos;
- estrutura da aplicação;
- comportamento operacional.

Portanto:

> **Logs são dados operacionais e devem ser protegidos como tal.**

---

# 35. Testing

A estratégia de testes deve considerar logging principalmente nos pontos em que ele possui comportamento observável relevante.

Exemplos:

- request ID é propagado;
- erros inesperados geram logs apropriados;
- informações sensíveis não aparecem;
- authorization failures possuem contexto;
- exceptions não geram registros duplicados desnecessariamente.

Testes de segurança podem verificar explicitamente que informações como:

```text
password
access_token
refresh_token
Cookie
Authorization
```

não aparecem nos registros produzidos por determinados fluxos.

---

# 36. Operational Investigation

Um fluxo típico de troubleshooting pode começar pelo log de uma requisição.

Exemplo:

```text
1. Encontrar o request_id
        ↓
2. Localizar os logs associados
        ↓
3. Identificar user_id / tenant_id
        ↓
4. Verificar endpoint e status
        ↓
5. Analisar duration
        ↓
6. Identificar exception ou dependency failure
        ↓
7. Correlacionar com Platform Events / Audit Logs
        ↓
8. Correlacionar com métricas, quando disponíveis
```

Essa abordagem permite investigar problemas sem depender exclusivamente de uma única fonte de informação.

---

# 37. Example: Successful Request

Um fluxo normal pode resultar em:

```json
{
  "timestamp": "2026-09-08T21:30:15.123Z",
  "level": "INFO",
  "event": "http_request_completed",
  "request_id": "01K...",
  "method": "GET",
  "path": "/api/products",
  "status_code": 200,
  "duration_ms": 24.31,
  "user_id": "01K...",
  "tenant_id": "01K..."
}
```

O registro fornece contexto suficiente para identificar a execução sem registrar dados desnecessários.

---

# 38. Example: Authorization Failure

```json
{
  "timestamp": "2026-09-08T21:32:04.012Z",
  "level": "WARNING",
  "event": "authorization_denied",
  "request_id": "01K...",
  "method": "DELETE",
  "path": "/api/products/01K...",
  "status_code": 403,
  "user_id": "01K...",
  "tenant_id": "01K..."
}
```

O evento pode posteriormente ser correlacionado com outros registros relacionados à mesma requisição.

---

# 39. Example: Database Failure

```json
{
  "timestamp": "2026-09-08T21:35:42.501Z",
  "level": "ERROR",
  "event": "database_error",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/products",
  "status_code": 500,
  "tenant_id": "01K...",
  "exception_type": "OperationalError"
}
```

O log identifica a natureza técnica do problema sem expor credenciais ou connection strings.

---

# 40. Example: Unexpected Exception

```json
{
  "timestamp": "2026-09-08T21:38:12.801Z",
  "level": "ERROR",
  "event": "unhandled_exception",
  "request_id": "01K...",
  "method": "POST",
  "path": "/api/sales",
  "status_code": 500,
  "user_id": "01K...",
  "tenant_id": "01K...",
  "exception_type": "UnexpectedError"
}
```

Quando disponível, o stack trace pode permanecer no registro interno para investigação.

---

# 41. Anti-Patterns

Os seguintes padrões devem ser evitados.

## Logging secrets

```python
logger.info("token=%s", token)
```

**Não permitido.**

---

## Logging passwords

```python
logger.info("login password=%s", password)
```

**Não permitido.**

---

## Logging entire request bodies

```python
logger.info("request=%s", request.json)
```

**Não recomendado**, especialmente em produção.

---

## Logging without context

```text
Database failed
```

É pouco útil.

Preferir informações estruturadas como:

```json
{
  "event": "database_error",
  "request_id": "01K...",
  "tenant_id": "01K...",
  "exception_type": "OperationalError"
}
```

---

## Excessive logging

Registrar cada pequena operação interna pode gerar:

- ruído;
- custo;
- dificuldade de investigação;
- maior armazenamento;
- dificuldade para encontrar eventos importantes.

---

# 42. Observability Evolution

A estratégia atual de infrastructure logging representa uma base para uma arquitetura de observabilidade mais completa.

A evolução planejada inclui:

```text
Structured Logs
      │
      ├── Correlation
      │
      ├── Platform Events
      │
      ├── Audit Logs
      │
      ├── Metrics
      │
      ├── Dashboards
      │
      └── Distributed Tracing
```

Com a evolução da arquitetura do Exactum, novos componentes poderão gerar seus próprios contextos técnicos sem perder a correlação com a requisição original.

---

# 43. Future Architecture

Conforme o Exactum evolui em direção a uma arquitetura mais próxima de **DDD**, o logging deverá continuar separado das regras de negócio.

Uma possível evolução é utilizar:

```text
Domain
   │
   └── Domain Events
             │
             ▼
Application
             │
             ▼
Infrastructure
   ├── Logs
   ├── Metrics
   └── Tracing
```

Isso permite que eventos de negócio sejam tratados de maneira diferente de informações puramente técnicas.

Essa evolução é especialmente relevante para futuras funcionalidades assíncronas e para a introdução de componentes como workers e message brokers.

---

# 44. Current State

Atualmente, o Exactum utiliza uma abordagem baseada em **structured application logging**, com foco em:

- HTTP request logging;
- request/correlation IDs;
- user context;
- tenant context;
- authentication and authorization failures;
- exception logging;
- infrastructure errors;
- integração com a estratégia geral de observability.

O sistema ainda está em evolução e nem todos os mecanismos de observabilidade planejados estão implementados em sua forma final.

Em particular, métricas, dashboards e distributed tracing fazem parte de uma evolução futura.

---

# 45. Design Principles Summary

A estratégia de infrastructure logging do Exactum pode ser resumida nos seguintes princípios:

1. **Log with purpose** — todo log deve possuir utilidade operacional.
2. **Prefer structured logs** — informações devem ser facilmente processáveis.
3. **Preserve context** — request, user e tenant context devem ser mantidos quando disponíveis.
4. **Correlate events** — logs relacionados devem poder ser associados.
5. **Never log secrets** — credenciais e tokens nunca devem aparecer.
6. **Minimize sensitive data** — registrar somente o necessário.
7. **Separate responsibilities** — logs técnicos não substituem events ou audit logs.
8. **Avoid duplication** — uma falha não deve gerar registros redundantes em todas as camadas.
9. **Protect production** — logs não devem comprometer performance ou disponibilidade.
10. **Prepare for evolution** — a estratégia deve permitir integração futura com metrics e tracing.

---

# 46. Related Documentation

- [Observability Overview](./overview.md)
- [Correlation](./correlation.md)
- [Platform Events](./platform-events.md)
- [Audit Logging](./audit-logging.md)
- [Authentication](../security/authentication.md)
- [Authorization](../security/authorization.md)
- [Session Management](../security/session-management.md)
- [Tenant Isolation](../security/tenant-isolation.md)
- [Threat Model](../security/threat-model.md)

---

# 47. Status

**Status:** Active

Este documento representa a estratégia atual de **infrastructure logging** do Exactum e deve evoluir juntamente com a arquitetura de observabilidade, infraestrutura e domínio da aplicação.
