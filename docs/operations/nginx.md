# Nginx e Reverse Proxy

## Objetivo

O **Nginx** atua como uma das principais peças da camada de infraestrutura HTTP do Exactum.

No ambiente de produção, ele funciona como ponto de entrada para as requisições destinadas à aplicação, servindo os arquivos estáticos do frontend e encaminhando as requisições da API para o backend Flask.

Sua posição na arquitetura pode ser representada como:

```text id="5q5w8c"
Client
  │
  ▼
Internet
  │
  ▼
Cloudflare
  │
  ▼
Nginx
  │
  ├──────────────► Frontend
  │
  └──────────────► Exactum API
                         │
                         ├── PostgreSQL
                         └── Redis
```

O Nginx não é responsável pela lógica de negócio da aplicação.

Sua função principal está relacionada à camada HTTP e à infraestrutura de acesso.

Entre suas responsabilidades estão:

- servir o frontend;
- atuar como reverse proxy;
- encaminhar requisições para a API;
- participar da terminação HTTPS conforme a arquitetura de infraestrutura;
- controlar headers HTTP;
- controlar routing;
- contribuir para a segurança da camada HTTP;
- disponibilizar logs de acesso;
- integrar o tráfego externo com os serviços internos do Docker.

---

# 1. Papel do Nginx

O Nginx funciona como uma camada intermediária entre o cliente e os containers da aplicação.

Sem essa camada, o cliente poderia precisar acessar diretamente o processo do backend e o servidor utilizado para servir o frontend.

Com o Nginx:

```text id="6d1hzn"
                    Internet
                       │
                       ▼
                    Nginx
                  /       \
                 /         \
                ▼           ▼
           Frontend        API
                              │
                              ▼
                         Infrastructure
```

Isso permite esconder a topologia interna da aplicação.

O cliente não precisa conhecer:

- nome do container;
- porta interna da API;
- endereço interno do PostgreSQL;
- endereço interno do Redis;
- estrutura da Docker network.

Essas informações permanecem na infraestrutura interna.

---

# 2. Nginx como Reverse Proxy

Um **reverse proxy** recebe uma requisição destinada ao servidor e a encaminha para outro serviço interno.

No Exactum:

```text id="9h4j8m"
HTTP Request
     │
     ▼
   Nginx
     │
     ▼
Exactum API
     │
     ▼
Response
     │
     ▼
   Nginx
     │
     ▼
Client
```

O cliente conhece o domínio público.

A API pode permanecer em uma network privada do Docker.

Essa separação reduz o acoplamento entre o cliente e a infraestrutura interna.

---

# 3. Separação entre Frontend e API

O Nginx pode utilizar regras de routing para diferenciar requisições destinadas ao frontend e à API.

Conceitualmente:

```text id="g2qv4n"
Request
   │
   ├── /api/*
   │       │
   │       ▼
   │    Flask API
   │
   └── /*
           │
           ▼
       React Frontend
```

Assim, o mesmo domínio pode disponibilizar:

```text id="zq5g8k"
https://exactum.app.br/
```

para o frontend e:

```text id="r7h0e1"
https://exactum.app.br/api/...
```

para a API.

Essa organização simplifica a integração entre frontend e backend.

---

# 4. Frontend Static Files

O frontend React é compilado antes de ser disponibilizado em produção.

O processo conceitual é:

```text id="0kq7m4"
React source
     │
     ▼
Vite build
     │
     ▼
dist/
     │
     ▼
Nginx
     │
     ▼
Browser
```

O Nginx é adequado para servir esses arquivos porque o frontend compilado é essencialmente um conjunto de recursos estáticos:

- HTML;
- JavaScript;
- CSS;
- imagens;
- fontes;
- outros assets.

Não é necessário manter um processo Node executando para servir o frontend final.

---

# 5. SPA Routing

O frontend do Exactum utiliza uma arquitetura de aplicação web baseada em React.

Aplicações desse tipo podem possuir rotas que não correspondem diretamente a arquivos físicos no servidor.

Por exemplo:

```text id="q5s3k8"
/
 /produtos
 /usuarios
 /pdv
 /configuracoes
```

O navegador pode acessar diretamente uma dessas rotas.

O Nginx precisa ser configurado de maneira compatível com o comportamento de uma **Single Page Application (SPA)**.

Quando uma rota não corresponde a um arquivo estático real, a configuração deve permitir que o frontend React processe a rota.

Conceitualmente:

```text id="0xj8k3"
GET /produtos
      │
      ▼
    Nginx
      │
      ├── arquivo físico?
      │
      └── não
           │
           ▼
         index.html
           │
           ▼
       React Router
```

Isso evita erros `404` ao acessar diretamente uma rota válida do frontend.

---

# 6. API Routing

As requisições destinadas à API utilizam o prefixo:

```text id="0r9qca"
/api/
```

Conceitualmente:

```text id="0dbq6j"
Client
   │
   ▼
/api/...
   │
   ▼
Nginx
   │
   ▼
Exactum API
```

O Nginx encaminha essas requisições para o container correspondente ao backend.

O backend continua responsável por:

- routing da aplicação;
- autenticação;
- autorização;
- validação;
- regras de negócio;
- persistência;
- tratamento de erros.

O Nginx não deve duplicar regras de negócio da API.

---

# 7. Docker Network

No ambiente containerizado, Nginx e API podem se comunicar através da Docker network.

Conceitualmente:

```text id="4gqk6b"
Docker Network
│
├── nginx
│
├── exactum_api
│
├── postgres
│
└── redis
```

O Nginx pode utilizar o nome do serviço para encaminhar requisições ao backend.

Isso evita depender de IPs fixos dos containers.

A resolução de nomes é realizada pela infraestrutura de networking do Docker Compose.

---

# 8. Portas

O Nginx funciona como ponto de exposição HTTP/HTTPS.

Os serviços internos não precisam necessariamente expor suas portas diretamente para a Internet.

Uma arquitetura típica é:

```text id="6n9w2d"
Internet
   │
   ▼
Nginx
   │
   └── Docker Network
          │
          ├── API
          ├── PostgreSQL
          └── Redis
```

Isso é particularmente importante para PostgreSQL e Redis.

Esses serviços não devem ser disponibilizados publicamente apenas porque possuem portas de rede.

---

# 9. Minimização da Superfície de Ataque

Manter serviços internos atrás do Nginx reduz a superfície de exposição.

Em vez de:

```text id="u6qkz0"
Internet
 ├── Nginx
 ├── Flask
 ├── PostgreSQL
 └── Redis
```

o objetivo é aproximar a arquitetura de:

```text id="3m5xpa"
Internet
    │
    ▼
  Nginx
    │
    ▼
Internal Network
 ├── Flask
 ├── PostgreSQL
 └── Redis
```

Isso não substitui autenticação ou autorização.

É uma camada adicional de isolamento de infraestrutura.

---

# 10. HTTPS

A aplicação de produção deve ser disponibilizada através de HTTPS.

Conceitualmente:

```text id="0l1h6s"
Browser
   │
   │ HTTPS
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ▼
Application
```

O HTTPS protege o tráfego entre os participantes da comunicação conforme a configuração da infraestrutura.

A arquitetura atual utiliza Cloudflare em conjunto com o VPS.

A configuração exata da terminação TLS depende da configuração adotada entre Cloudflare e Nginx.

---

# 11. Cloudflare

O Cloudflare participa da camada externa de infraestrutura do Exactum.

Conceitualmente:

```text id="o0y2o5"
Client
   │
   ▼
Cloudflare
   │
   ▼
VPS
   │
   ▼
Nginx
```

Isso permite separar responsabilidades:

### Cloudflare

Pode atuar na camada externa de:

- DNS;
- proxy;
- TLS;
- proteção de borda;
- infraestrutura de rede.

### Nginx

Atua principalmente na camada HTTP do servidor:

- routing;
- reverse proxy;
- static files;
- headers;
- logs;
- integração com containers.

### Flask

Atua na lógica da aplicação:

- Authentication;
- Authorization;
- business rules;
- validation;
- persistence.

---

# 12. Trust Boundaries

A presença do Cloudflare não significa que o backend deve confiar cegamente em qualquer informação recebida através de headers.

Headers relacionados a:

- IP;
- protocolo;
- host;
- forwarding;

devem ser tratados de acordo com a topologia de infraestrutura conhecida.

O backend precisa possuir uma política clara para headers confiáveis.

Especialmente quando existe mais de uma camada de proxy:

```text id="q7gqj5"
Client
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ▼
Flask
```

A aplicação deve diferenciar headers controlados pela infraestrutura confiável de headers arbitrariamente enviados pelo cliente.

---

# 13. Request Headers

O Nginx pode encaminhar headers relevantes para o backend.

Entre os exemplos estão:

- `Host`;
- `X-Forwarded-For`;
- `X-Forwarded-Proto`;
- `X-Real-IP`.

A aplicação pode utilizar essas informações para compreender o contexto original da requisição.

Entretanto, a confiança nesses headers depende da arquitetura de proxies.

Eles não devem ser considerados automaticamente confiáveis apenas porque possuem um nome conhecido.

---

# 14. Host Header

O header `Host` representa o domínio utilizado pelo cliente.

Ele pode ser importante para:

- routing;
- geração de URLs;
- validações;
- configuração de cookies;
- CORS;
- segurança.

O Nginx deve possuir uma configuração explícita para os hosts válidos.

Requests destinadas a hosts inesperados podem ser rejeitadas ou tratadas de maneira controlada.

---

# 15. Forwarded Protocol

Quando existem múltiplas camadas de proxy, o backend pode receber a requisição através de HTTP interno mesmo que o cliente tenha utilizado HTTPS externamente.

Exemplo:

```text id="5ph5a7"
Browser
   │
   │ HTTPS
   ▼
Cloudflare
   │
   │ HTTP/HTTPS interno
   ▼
Nginx
   │
   ▼
Flask
```

Por isso, informações como `X-Forwarded-Proto` podem ser utilizadas para preservar o contexto original do protocolo.

Essa informação é particularmente importante para aplicações que precisam distinguir:

```text id="r8s6z1"
http
vs
https
```

---

# 16. HttpOnly Cookies

A autenticação do Exactum utiliza cookies HttpOnly para transportar os tokens de autenticação.

O Nginx participa da infraestrutura que transporta essas requisições, mas não é responsável por interpretar a autenticação da aplicação.

Conceitualmente:

```text id="l5b9ca"
Login
  │
  ▼
Flask
  │
  ▼
Set-Cookie
  │
  ▼
Nginx
  │
  ▼
Browser
```

Em requisições posteriores:

```text id="0v3e7u"
Browser
  │
  └── Cookie
       │
       ▼
     Nginx
       │
       ▼
     Flask
```

O backend continua sendo a autoridade para validar os tokens.

---

# 17. Cookie Path

A configuração dos cookies precisa ser compatível com a topologia da aplicação.

O Exactum utiliza o prefixo:

```text id="q4l8qv"
/api/
```

para os endpoints da API.

Por isso, configurações de `Path` dos cookies devem ser avaliadas conjuntamente com o routing do Nginx e da aplicação.

Uma configuração incorreta pode gerar situações em que:

- login funciona;
- cookie é criado;
- requests autenticadas funcionam parcialmente;
- refresh não recebe o cookie esperado;
- logout falha.

Portanto, cookie configuration deve ser considerada parte do contrato entre:

```text id="5cljpn"
Browser
   +
Nginx
   +
API
```

---

# 18. Authentication Flow

O fluxo simplificado de autenticação é:

```text id="k1z8x4"
Browser
   │
   │ POST /api/auth/login
   ▼
Nginx
   │
   ▼
Flask
   │
   ├── Validate credentials
   ├── Create tokens
   └── Set cookies
   │
   ▼
Nginx
   │
   ▼
Browser
```

Depois:

```text id="9n9xv4"
Browser
   │
   │ Cookie
   ▼
Nginx
   │
   ▼
Flask
   │
   ├── Validate JWT
   ├── Resolve session
   ├── Resolve tenant
   └── Authorize request
```

O Nginx permanece agnóstico em relação às regras de autorização.

---

# 19. CORS

Quando frontend e API estão disponíveis sob uma mesma origem pública, parte da complexidade de CORS pode ser reduzida.

Ainda assim, CORS deve ser configurado explicitamente conforme os ambientes utilizados.

Durante o desenvolvimento, por exemplo:

```text id="2o9l9r"
Vite
localhost
   │
   ▼
Flask
localhost
```

pode haver uma origem diferente entre frontend e backend.

No ambiente de produção:

```text id="m7f0jo"
exactum.app.br
    │
    ├── /
    └── /api/
```

a topologia pode ser diferente.

A configuração de CORS deve acompanhar essa realidade.

---

# 20. CSRF

HttpOnly cookies não eliminam automaticamente o risco de CSRF.

Como a autenticação do Exactum utiliza cookies, a proteção contra CSRF deve ser considerada separadamente.

O Nginx pode contribuir para controles relacionados a headers e origem, mas não deve ser considerado substituto de uma estratégia de CSRF da aplicação.

O estado atual do Exactum possui essa questão documentada como uma preocupação de segurança ainda não completamente implementada.

---

# 21. Security Headers

O Nginx pode ser utilizado para adicionar ou controlar determinados security headers.

Dependendo da arquitetura, podem ser considerados headers como:

- `Strict-Transport-Security`;
- `X-Content-Type-Options`;
- `X-Frame-Options`;
- `Referrer-Policy`;
- `Content-Security-Policy`.

A adoção deve ser compatível com o frontend e com os requisitos da aplicação.

Não é recomendável adicionar headers arbitrariamente sem validar seu impacto.

Por exemplo, uma Content Security Policy muito restritiva pode quebrar recursos legítimos do frontend.

---

# 22. Content Security Policy

Uma **Content Security Policy (CSP)** pode reduzir determinados tipos de risco relacionados à execução de conteúdo não autorizado.

Entretanto, a política deve ser construída de acordo com os recursos realmente utilizados pelo frontend.

Antes de ativar uma CSP restritiva, devem ser avaliados:

- scripts;
- styles;
- fonts;
- images;
- API requests;
- external resources;
- analytics;
- development tooling.

A política deve ser testada antes de ser aplicada de maneira rígida em produção.

---

# 23. Rate Limiting

O Nginx possui mecanismos próprios para rate limiting.

Porém, o Exactum também possui lógica de **Rate Limiting** relacionada à aplicação.

Essas duas camadas possuem responsabilidades diferentes.

### Nginx

Pode limitar tráfego HTTP em nível de infraestrutura.

### Application

Pode aplicar regras relacionadas ao significado da operação.

Por exemplo:

```text id="2u4vhy"
Infrastructure Rate Limit
        +
Application Rate Limit
```

Uma camada não necessariamente substitui a outra.

---

# 24. Authentication Rate Limiting

Endpoints como login podem ser particularmente sensíveis a abuso.

O rate limiting pode ser aplicado de maneira específica para proteger operações de autenticação.

Exemplo conceitual:

```text id="f91z3p"
Client
  │
  ▼
Nginx
  │
  ├── basic traffic control
  │
  ▼
Flask
  │
  └── authentication-specific controls
```

A estratégia exata deve considerar:

- IP;
- usuário;
- tenant;
- endpoint;
- frequência;
- comportamento.

---

# 25. Request Size

O Nginx pode controlar o tamanho máximo das requisições.

Isso é útil para evitar que payloads excessivamente grandes consumam recursos desnecessariamente.

A configuração deve considerar os endpoints que realmente aceitam payloads maiores.

Um limite muito baixo pode quebrar funcionalidades legítimas.

Um limite excessivamente alto pode aumentar a superfície para abuso.

---

# 26. Timeouts

Timeouts são importantes em uma arquitetura com reverse proxy.

Podem existir diferentes limites para:

- conexão;
- leitura;
- envio;
- proxy;
- upstream.

Conceitualmente:

```text id="r5q4q1"
Client
   │
   ▼
Nginx
   │
   │ timeout
   ▼
API
```

Os valores devem considerar o comportamento real da aplicação.

Timeouts muito baixos podem interromper operações legítimas.

Timeouts muito altos podem manter conexões e recursos ocupados por tempo excessivo.

---

# 27. Upstream

O backend pode ser tratado pelo Nginx como um **upstream**.

Conceitualmente:

```text id="k3q4a6"
Nginx
  │
  ▼
upstream exactum_api
  │
  ▼
exactum_api container
```

Essa abstração facilita uma evolução futura para múltiplas instâncias.

Por exemplo:

```text id="r6d4sz"
Nginx
  │
  ├── API instance 1
  ├── API instance 2
  └── API instance 3
```

O ambiente atual não precisa possuir múltiplas instâncias apenas para utilizar o conceito de upstream.

---

# 28. Single Instance

Atualmente, a infraestrutura do Exactum é relativamente simples.

A API é executada no ambiente Docker de produção e o Nginx encaminha o tráfego para ela.

Não se deve interpretar a existência do reverse proxy como evidência de uma arquitetura distribuída.

O modelo atual é mais próximo de:

```text id="7d0z2a"
Nginx
  │
  ▼
Single API instance
  │
  ├── PostgreSQL
  └── Redis
```

Essa simplicidade é adequada ao estágio atual do projeto.

---

# 29. Escalabilidade futura

Caso a necessidade de escala aumente, o Nginx pode se tornar uma camada de distribuição de tráfego.

Uma evolução possível:

```text id="0u8m2j"
                  Nginx
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       API #1    API #2    API #3
          │         │         │
          └─────────┼─────────┘
                    ▼
               PostgreSQL
                    │
                  Redis
```

Isso exigiria outras preocupações, como:

- stateless API;
- shared session state;
- connection pooling;
- load balancing;
- health checks;
- graceful shutdown;
- deployment strategy.

---

# 30. Stateless API

A utilização de Redis para session state contribui para reduzir a dependência de estado local da instância da API.

Isso é importante para uma futura arquitetura com múltiplas instâncias.

Conceitualmente:

```text id="5s2b7h"
API #1 ─┐
        │
API #2 ─┼──► Redis
        │
API #3 ─┘
```

Nesse modelo, uma sessão não precisa estar fisicamente armazenada em uma única instância da aplicação.

Ainda assim, a aplicação precisa manter consistência em outros aspectos, especialmente em relação ao banco de dados e caches.

---

# 31. Logging

O Nginx produz **access logs** que podem registrar informações como:

- timestamp;
- client address;
- request method;
- request path;
- HTTP status;
- response size;
- request time;
- upstream response time.

Esses logs são diferentes dos logs internos da aplicação Flask.

A distinção é importante:

```text id="2q5v2d"
Nginx access log
      │
      └── HTTP infrastructure

Flask application log
      │
      └── application behavior
```

Os dois podem ser correlacionados através de informações de request quando a configuração permitir.

---

# 32. Error Logs

Além dos access logs, o Nginx possui logs relacionados a erros operacionais.

Podem aparecer problemas como:

- upstream unavailable;
- connection refused;
- timeout;
- invalid configuration;
- permission errors;
- file not found;
- TLS issues.

Esses logs são particularmente úteis para distinguir:

```text id="1v7f8r"
Nginx problem
vs
Application problem
```

---

# 33. Correlation

O Exactum utiliza `request_id` como parte de sua estratégia de correlação.

Idealmente, o contexto de uma requisição pode ser acompanhado através de:

```text id="s0y5er"
Client
  │
  ▼
Nginx
  │
  ▼
Flask
  │
  ├── PostgreSQL
  ├── Redis
  └── Logs
```

O `request_id` ajuda a relacionar eventos pertencentes à mesma operação.

O Nginx pode participar dessa cadeia dependendo da configuração de logging e propagação utilizada.

A estratégia completa está documentada em:

`docs/observability/correlation.md`

---

# 34. Access Logs e Dados Sensíveis

Logs do Nginx devem evitar registrar informações sensíveis desnecessariamente.

Particularmente, deve-se ter cuidado com:

- cookies;
- Authorization headers;
- tokens;
- passwords;
- request bodies;
- dados pessoais.

O fato de uma informação estar disponível para o Nginx não significa que ela deva ser armazenada em logs.

A minimização de dados deve fazer parte da configuração.

---

# 35. Static Cache

O Nginx pode fornecer mecanismos de cache para recursos estáticos.

Isso pode melhorar:

- tempo de carregamento;
- consumo de rede;
- utilização do servidor.

Porém, cache deve ser compatível com o mecanismo de versionamento dos assets do frontend.

Arquivos com hash no nome, por exemplo:

```text id="xk0k9g"
assets/index-a83fd2.js
```

podem ser tratados de maneira diferente de:

```text id="m2x7s1"
index.html
```

O cache do frontend deve considerar a estratégia de atualização da aplicação.

---

# 36. Cache e Deploy

Um problema comum em aplicações frontend é o navegador continuar utilizando assets antigos depois de uma nova release.

Uma estratégia de cache adequada deve considerar:

```text id="m7r8j4"
HTML
 │
 └── shorter cache

Versioned assets
 │
 └── longer cache
```

A configuração exata depende da estratégia de build utilizada pelo frontend.

O objetivo é evitar que frontend antigo e API nova permaneçam incompatíveis por longos períodos.

---

# 37. API Caching

O Nginx não deve ser utilizado indiscriminadamente para cachear respostas da API.

A API do Exactum possui informações potencialmente:

- tenant-specific;
- user-specific;
- permission-sensitive;
- stateful;
- transactional.

Cache HTTP incorreto poderia resultar em exposição ou entrega de dados incorretos.

Qualquer estratégia de cache da API deve considerar explicitamente:

- tenant;
- usuário;
- autenticação;
- autorização;
- headers;
- invalidation.

---

# 38. Authentication e Cache

Responses relacionadas a usuários autenticados exigem atenção especial.

Por exemplo:

```text id="1k9k3v"
User A
   │
   ▼
Authenticated API response
```

não pode ser inadvertidamente reutilizada para:

```text id="0q8q1b"
User B
```

por um mecanismo de cache intermediário.

Por isso, caching de endpoints autenticados deve ser evitado ou projetado com extremo cuidado.

---

# 39. Compression

O Nginx pode fornecer compressão HTTP para determinados recursos.

Isso pode reduzir:

- tamanho das responses;
- bandwidth;
- tempo de transferência.

A configuração deve considerar os tipos de conteúdo e os custos de CPU.

Para assets já comprimidos, aplicar compressão adicional pode trazer pouco benefício.

---

# 40. Connection Handling

O Nginx mantém conexões HTTP entre clientes e upstreams.

Isso permite desacoplar:

```text id="j7y7bp"
Client connection
       │
       ▼
Nginx
       │
       ▼
Upstream connection
```

Essa camada de conexão é importante para:

- keep-alive;
- timeouts;
- buffering;
- throughput;
- estabilidade.

A configuração deve ser compatível com a capacidade do backend.

---

# 41. Buffering

O Nginx pode realizar buffering de requests e responses.

Isso pode proteger o upstream de determinadas características do tráfego externo.

Porém, buffering inadequado pode afetar:

- streaming;
- responses grandes;
- latência;
- uso de memória.

A configuração deve acompanhar as necessidades reais da API.

---

# 42. Uploads

Se o Exactum futuramente incorporar uploads de arquivos, o Nginx precisará considerar:

- tamanho máximo;
- timeout;
- buffering;
- armazenamento;
- segurança;
- MIME types;
- validação.

A validação de conteúdo deve permanecer na aplicação.

O Nginx pode controlar tamanho e transporte, mas não deve ser considerado suficiente para validar arquivos enviados pelo usuário.

---

# 43. WebSocket e Protocolos Futuros

Caso o Exactum utilize futuramente WebSockets ou outros protocolos de comunicação persistente, a configuração do Nginx deverá ser adaptada.

O reverse proxy precisará preservar os headers e comportamento necessários para o protocolo.

Isso pode se tornar relevante para futuras funcionalidades de:

- realtime updates;
- notifications;
- monitoring dashboards;
- collaborative workflows.

Não existe necessidade de configurar suporte a esses mecanismos antes de serem utilizados.

---

# 44. Security Boundary

O Nginx representa uma camada de infraestrutura, mas não deve ser tratado como a única security boundary.

A arquitetura possui múltiplas camadas:

```text id="7k0r4p"
Internet
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ▼
Flask
   │
   ├── Authentication
   ├── Authorization
   ├── Tenant Isolation
   └── Business Rules
   │
   ▼
PostgreSQL / Redis
```

Cada camada possui responsabilidades diferentes.

---

# 45. Nginx não faz Authorization

O Nginx pode controlar acesso em determinados cenários, mas não deve substituir o Authorization model da aplicação.

Por exemplo:

```text id="k1v4w7"
GET /api/products/123
```

O Nginx pode encaminhar a requisição.

Quem deve determinar:

- qual usuário está autenticado;
- qual tenant está ativo;
- quais permissions possui;
- se pode acessar o produto;

é o backend.

Isso mantém as regras de negócio centralizadas na aplicação.

---

# 46. Nginx não faz Tenant Isolation

Da mesma forma, o Nginx não é responsável por determinar se:

```text id="q7s5s8"
Product A
```

pertence ao tenant atual.

Essa decisão ocorre no backend e na camada de persistência.

A isolation deve continuar sendo aplicada através das regras de aplicação e consultas tenant-aware.

---

# 47. Nginx e API Errors

O Nginx pode gerar erros próprios, como:

```text id="2o8y4e"
502 Bad Gateway
504 Gateway Timeout
404 Not Found
```

Esses erros são diferentes dos erros estruturados produzidos pela API.

A API utiliza seu próprio formato de erro:

```json id="a2v8m0"
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Portanto, é importante distinguir:

```text id="c6v3av"
Nginx error
    ≠
Application error
```

Essa distinção facilita troubleshooting.

---

# 48. 502 Bad Gateway

Um `502 Bad Gateway` normalmente indica um problema na comunicação entre o Nginx e o upstream.

Possíveis causas incluem:

- API parada;
- container não iniciado;
- porta incorreta;
- hostname incorreto;
- Docker network problem;
- conexão recusada;
- processo Flask indisponível.

A investigação deve começar pela camada de infraestrutura antes de assumir que existe um bug funcional na API.

---

# 49. 504 Gateway Timeout

Um `504 Gateway Timeout` indica que o Nginx não recebeu uma resposta do upstream dentro do tempo esperado.

Possíveis causas:

- operação lenta;
- banco lento;
- Redis indisponível;
- deadlock;
- processamento excessivo;
- timeout configurado inadequadamente;
- API travada.

Nesse cenário, logs e `request_id` podem ajudar a acompanhar a operação até a aplicação.

---

# 50. Nginx Configuration Validation

Alterações na configuração do Nginx devem ser validadas antes de serem aplicadas.

Uma configuração inválida pode impedir o serviço de iniciar ou recarregar corretamente.

Conceitualmente:

```text id="8f3qwp"
Edit config
    │
    ▼
Validate
    │
    ├── Success
    │
    └── Failure
           │
           ▼
        Do not apply
```

A validação deve fazer parte do processo operacional sempre que possível.

---

# 51. Reload versus Restart

Alterações de configuração podem, dependendo do caso, utilizar reload em vez de restart.

### Reload

Recarrega a configuração preservando o processo de maneira mais controlada.

### Restart

Encerra e inicia novamente o serviço.

A escolha depende da alteração realizada e do processo operacional utilizado.

Para mudanças de configuração simples, reload pode reduzir interrupções desnecessárias.

---

# 52. Deployment do Nginx

Alterações no Nginx fazem parte do deployment de infraestrutura.

Um fluxo possível é:

```text id="e3t6p1"
Change config
      │
      ▼
Git
      │
      ▼
CI / Validation
      │
      ▼
Production
      │
      ▼
Nginx config validation
      │
      ▼
Reload
      │
      ▼
Smoke test
```

A configuração não deve ser alterada manualmente em produção sem refletir a alteração no código versionado.

---

# 53. Desenvolvimento

Durante o desenvolvimento, o Nginx pode não estar presente no mesmo papel que possui em produção.

Por exemplo:

```text id="j4m7gz"
Browser
  │
  ├── Vite dev server
  │
  └── Flask development server
```

O Vite pode fornecer o frontend e um proxy de desenvolvimento pode encaminhar requests para a API.

Isso significa que:

```text id="t8w5k0"
Development architecture
      ≠
Production architecture
```

O importante é compreender as diferenças relevantes.

---

# 54. Vite Proxy

Durante o desenvolvimento, o Vite pode atuar como proxy para requests da API.

Conceitualmente:

```text id="n7v8x2"
Browser
   │
   ▼
Vite
   │
   │ /api
   ▼
Flask
```

Em produção:

```text id="r3q1n5"
Browser
   │
   ▼
Nginx
   │
   │ /api
   ▼
Flask
```

Essa semelhança ajuda a manter o contrato de `/api` entre os ambientes.

---

# 55. API Prefix

O uso de `/api` como prefixo possui importância operacional.

Ele permite separar claramente:

```text id="y4v6u8"
/        → frontend

/api/*   → backend
```

Isso simplifica:

- routing;
- reverse proxy;
- desenvolvimento;
- documentação;
- debugging;
- observability;
- organização de endpoints.

---

# 56. Cookie Scope e `/api`

Como a autenticação utiliza cookies, o routing `/api` também influencia o escopo dos cookies.

O comportamento deve ser considerado conjuntamente entre:

- browser;
- cookie `Path`;
- domínio;
- HTTPS;
- Nginx;
- Flask.

Um pequeno erro em qualquer uma dessas camadas pode produzir falhas difíceis de diagnosticar.

---

# 57. Static Asset Security

Arquivos estáticos devem ser disponibilizados somente a partir do diretório destinado ao frontend.

A configuração não deve permitir que paths arbitrários do filesystem do host sejam expostos.

Isso ajuda a reduzir riscos relacionados a:

- directory traversal;
- exposição de arquivos internos;
- secrets;
- arquivos de configuração;
- source files desnecessários.

---

# 58. Directory Traversal

O Nginx possui mecanismos próprios para resolver paths, mas a configuração ainda deve ser cuidadosamente revisada.

O objetivo é garantir que uma request como:

```text id="x3z1y9"
../../etc/passwd
```

não resulte na exposição de arquivos fora do diretório autorizado.

A aplicação e a infraestrutura devem trabalhar em conjunto para evitar esse tipo de problema.

---

# 59. Sensitive Files

Arquivos como:

```text id="s1y5m2"
.env
.git/
private keys
configuration files
database dumps
logs
```

não devem ser publicamente acessíveis através do Nginx.

A melhor estratégia é não colocar esses arquivos no diretório público do frontend.

---

# 60. HTTP Methods

O Nginx pode restringir métodos HTTP em determinadas rotas quando necessário.

Porém, a validação principal dos métodos suportados pela API continua pertencendo ao backend.

Por exemplo:

```text id="d7v9q4"
/api/products
```

pode aceitar:

```text
GET
POST
```

enquanto:

```text id="s8p3r2"
/api/products/{uuid}
```

pode possuir outro conjunto de métodos.

O Nginx não deve duplicar toda essa lógica de routing da API.

---

# 61. OPTIONS Requests

Requests `OPTIONS` podem aparecer durante o comportamento de CORS.

O tratamento deve ser compatível com a configuração da aplicação.

Uma configuração de Nginx que bloqueie indiscriminadamente `OPTIONS` pode causar problemas em ambientes onde preflight requests são necessárias.

---

# 62. HTTP Status Codes

O Nginx pode produzir status codes antes que a request alcance o backend.

Isso cria duas fontes possíveis de respostas HTTP:

```text id="5z6r3k"
Nginx
 │
 ├── 4xx / 5xx infrastructure errors
 │
 └── upstream
        │
        └── application responses
```

Essa diferença deve ser considerada na observability e no troubleshooting.

---

# 63. Monitoring

O Nginx pode fornecer métricas operacionais importantes, como:

- número de requests;
- status codes;
- request duration;
- upstream latency;
- connection counts;
- errors.

Essas informações podem futuramente alimentar a estratégia de observability do Exactum.

Com Prometheus/Grafana, por exemplo, seria possível visualizar:

```text id="6g1v2p"
Nginx
 │
 ├── Requests
 ├── Errors
 ├── Latency
 └── Throughput
```

---

# 64. Nginx e Prometheus

A integração futura com Prometheus pode permitir monitorar a camada HTTP separadamente da aplicação.

Isso cria uma visão:

```text id="7q2j8k"
Client
  │
  ▼
Nginx
  │
  ├── HTTP metrics
  │
  ▼
Flask
  │
  ├── Application metrics
  │
  ▼
PostgreSQL / Redis
```

Essa separação facilita identificar onde uma degradação está ocorrendo.

---

# 65. Performance

O Nginx é adequado para lidar com grande quantidade de conexões HTTP de maneira eficiente.

Porém, performance do sistema inteiro depende de:

- Nginx;
- Flask;
- PostgreSQL;
- Redis;
- VPS;
- network;
- Cloudflare;
- queries;
- application code.

O Nginx não corrige automaticamente gargalos de backend.

Por exemplo:

```text id="a6f5k0"
Nginx fast
     +
API slow
     =
System slow
```

---

# 66. Bottleneck Investigation

Quando a aplicação apresenta lentidão, o Nginx pode ajudar a determinar em qual camada o problema está.

Uma investigação pode observar:

```text id="7y2k8p"
Client latency
      │
      ▼
Nginx request time
      │
      ▼
Upstream response time
      │
      ▼
Application processing
      │
      ▼
Database / Redis
```

Se o tempo gasto estiver concentrado no upstream, o problema provavelmente não está no serving HTTP do Nginx.

---

# 67. Availability

O Nginx pode continuar executando mesmo quando a API está indisponível.

Isso significa que:

```text id="5x7m9z"
Nginx running
      ≠
Application healthy
```

Um health check operacional precisa verificar a cadeia completa quando o objetivo for determinar disponibilidade da aplicação.

---

# 68. Dependency Failure

Se PostgreSQL estiver indisponível:

```text id="8x0s3a"
Nginx
  │
  ▼
Flask
  │
  ▼
PostgreSQL ✗
```

o Nginx continuará podendo responder às requests, mas a aplicação poderá retornar erros.

Da mesma forma, uma falha no Redis pode afetar autenticação ou outras funcionalidades sem necessariamente derrubar o processo Nginx.

Essa separação ajuda no diagnóstico.

---

# 69. Nginx e Graceful Operations

Operações sobre Nginx devem minimizar interrupções.

Sempre que possível:

- validar configuração;
- utilizar reload quando apropriado;
- verificar logs;
- executar smoke tests;
- confirmar routing.

Isso reduz o risco de transformar uma alteração simples de infraestrutura em indisponibilidade completa.

---

# 70. Troubleshooting

Uma investigação de problemas envolvendo Nginx pode seguir:

```text id="6x9s8m"
1. DNS / Cloudflare
        │
        ▼
2. HTTPS
        │
        ▼
3. Nginx process
        │
        ▼
4. Nginx configuration
        │
        ▼
5. Docker network
        │
        ▼
6. API container
        │
        ▼
7. Flask
        │
        ▼
8. PostgreSQL / Redis
```

Essa sequência ajuda a evitar investigação aleatória.

---

# 71. Problemas comuns

Alguns sintomas e possíveis áreas de investigação:

| Sintoma                     | Área inicial                        |
| --------------------------- | ----------------------------------- |
| Site não abre               | DNS / Cloudflare / Nginx            |
| `502`                       | upstream / API                      |
| `504`                       | timeout / API / database            |
| Frontend abre mas API falha | `/api` routing / backend            |
| Login falha                 | cookies / API / CORS                |
| Refresh falha               | cookie Path / authentication        |
| Rota React retorna `404`    | SPA fallback                        |
| Assets não carregam         | static files / paths                |
| HTTPS problemático          | TLS / Cloudflare / Nginx            |
| API lenta                   | upstream / application / DB         |
| Cookie não chega à API      | Domain / Path / HTTPS               |
| CORS error                  | browser / API / proxy configuration |

---

# 72. Segurança Operacional

A configuração do Nginx deve ser tratada como parte da superfície de segurança do Exactum.

Alterações devem considerar:

- exposição de portas;
- TLS;
- headers;
- request size;
- timeouts;
- rate limiting;
- logs;
- arquivos públicos;
- proxy headers;
- upstreams;
- métodos HTTP.

Uma configuração incorreta pode criar vulnerabilidades mesmo quando o backend está corretamente implementado.

---

# 73. Estado atual

Atualmente, o Nginx ocupa uma posição central no ambiente de produção do Exactum.

Sua função principal é:

- disponibilizar o frontend;
- atuar como reverse proxy;
- encaminhar `/api` para o backend;
- integrar o tráfego externo aos containers;
- participar da infraestrutura HTTP/HTTPS;
- gerar logs de acesso e erros;
- separar o tráfego público dos serviços internos.

O frontend e a API são executados em containers Docker, enquanto PostgreSQL e Redis permanecem como componentes internos da infraestrutura.

O Cloudflare participa da camada externa do domínio e da infraestrutura de rede.

---

# 74. Evolução planejada

Conforme o Exactum evoluir, o Nginx poderá assumir ou integrar novas responsabilidades operacionais, como:

- load balancing;
- múltiplas instâncias da API;
- health-aware routing;
- métricas;
- observability mais detalhada;
- rate limiting de borda;
- políticas de segurança HTTP mais avançadas;
- cache control mais sofisticado;
- suporte a WebSockets;
- integração com novos serviços;
- estratégias de deployment como blue/green ou rolling deployment.

Essas funcionalidades devem ser introduzidas conforme houver necessidade real.

A simples existência de suporte técnico para determinada funcionalidade não significa que ela precise fazer parte da arquitetura atual.

---

# 75. Relação com a arquitetura geral

O Nginx pertence à camada de infraestrutura HTTP.

Sua posição pode ser representada como:

```text id="l4q1v7"
Client
  │
  ▼
External Infrastructure
  │
  ├── Cloudflare
  │
  ▼
HTTP Infrastructure
  │
  └── Nginx
        │
        ▼
Application
  │
  └── Flask
        │
        ▼
Persistence / Infrastructure
```

Essa separação mantém responsabilidades claras.

O Nginx não deve conhecer detalhes das regras de negócio do Exactum.

---

# 76. Princípios arquiteturais

A utilização do Nginx no Exactum segue alguns princípios:

### Reverse Proxy

O tráfego externo deve ser intermediado por uma camada HTTP controlada.

### Minimal Exposure

Serviços internos não devem ser expostos desnecessariamente.

### Separation of Concerns

Nginx cuida de infraestrutura HTTP; Flask cuida da aplicação.

### Explicit Routing

Frontend e API possuem responsabilidades de routing claramente definidas.

### Secure Transport

O ambiente de produção deve utilizar HTTPS.

### Observability

Access logs e error logs devem permitir investigação operacional.

### Configuration as Code

Configurações devem ser versionadas e reproduzíveis.

### Defense in Depth

Nginx representa uma camada adicional de segurança, não substituto da segurança da aplicação.

### Production Simplicity

A configuração atual deve permanecer proporcional ao estágio do projeto.

---

# 77. Documentos relacionados

Este documento está relacionado principalmente a:

- `docs/operations/development.md`
- `docs/operations/docker.md`
- `docs/operations/deployment.md`
- `docs/operations/runbook.md`
- `docs/observability/overview.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/correlation.md`
- `docs/security/overview.md`
- `docs/security/authentication.md`
- `docs/security/session-management.md`
- `docs/security/threat-model.md`
- `docs/api/overview.md`
- `docs/api/authentication.md`
- `docs/api/errors.md`

---

# 78. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites operacionais e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação atual.

Por exemplo:

- `actor` representa conceitualmente quem originou uma ação, podendo ser representado atualmente por `user_uuid`;
- `tenant` representa conceitualmente o contexto organizacional, podendo ser representado atualmente por `tenant_uuid`;
- `resource` representa conceitualmente um recurso da API, como um produto, venda ou usuário;
- `upstream` representa conceitualmente o serviço para o qual o Nginx encaminha uma requisição.

Essa distinção permite documentar responsabilidades e conceitos arquiteturais sem limitar sua definição à implementação atual.

A infraestrutura de HTTP também poderá evoluir conforme o sistema cresça. O Nginx poderá futuramente participar de uma arquitetura com múltiplas instâncias da API, workers, métricas, load balancing e estratégias de deployment mais sofisticadas.

Portanto, este documento deve ser interpretado como uma representação do **modelo atual de infraestrutura HTTP e de sua direção de evolução**, e não como uma especificação imutável da infraestrutura futura do Exactum.
