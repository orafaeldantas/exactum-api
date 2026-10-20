# Runbook Operacional

## 1. Objetivo

Este documento define os procedimentos operacionais para diagnóstico, investigação e resposta a incidentes no **Exactum**.

O objetivo de um Runbook não é apenas listar comandos, mas estabelecer uma sequência racional para investigar problemas sem introduzir mudanças desnecessárias no ambiente.

Os procedimentos descritos aqui abrangem principalmente:

- indisponibilidade da API;
- falhas de PostgreSQL;
- falhas de Redis;
- problemas de autenticação;
- problemas de cookies e sessão;
- falhas de migrations;
- problemas de deployment;
- erros do Nginx;
- problemas de HTTPS;
- containers com falha;
- problemas de conectividade entre serviços;
- consumo excessivo de disco;
- problemas de health checks;
- erros 4xx e 5xx;
- degradação de performance;
- problemas relacionados a tenant isolation;
- investigação utilizando logs e correlation IDs;
- recuperação operacional.

O Runbook complementa a documentação arquitetural e operacional do projeto.

Ele deve ser utilizado principalmente em situações em que o comportamento observado no sistema não é imediatamente explicado pela aplicação.

---

# 2. Escopo

Este documento considera o ambiente de produção atual do Exactum, baseado em:

```text
Internet
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ├── Frontend
   │
   └── /api
         │
         ▼
     exactum_api
         │
         ├── PostgreSQL
         │
         └── Redis
```

A infraestrutura é executada em um VPS e utiliza Docker/Compose para gerenciamento dos serviços.

Os principais componentes considerados neste Runbook são:

- Cloudflare;
- Nginx;
- frontend;
- Exactum API;
- PostgreSQL;
- Redis;
- Docker;
- Docker Compose;
- GitHub Actions;
- migrations;
- sistema operacional Linux.

---

## 2.1 Convenções dos comandos deste Runbook

Os comandos deste documento assumem que estão sendo executados **no VPS de produção**, a partir do diretório do projeto utilizado pelo workflow de deploy (`.github/workflows/deploy.yml`):

```bash
cd /etc/opt/exactum-api
export COMPOSE_FILE=docker-compose.prod.yml
```

Com `COMPOSE_FILE` definido, os comandos `docker compose ...` passam a utilizar automaticamente o arquivo de produção. Sem essa variável, o Compose utilizaria o `docker-compose.yml` de desenvolvimento.

Os comandos do Compose utilizam **nomes de serviço**, não nomes de container:

| Serviço (Compose) | Container        | Responsabilidade             |
| ----------------- | ---------------- | ---------------------------- |
| `nginx`           | `exactum_nginx`  | Reverse proxy, TLS, frontend |
| `api`             | `exactum_api`    | API Flask (Gunicorn)         |
| `db`              | `exactum_db`     | PostgreSQL 15                |
| `redis`           | `exactum_redis`  | Redis (sessões e cache)      |

Exemplo:

```bash
docker compose logs --tail=200 api     # correto (nome do serviço)
docker logs --tail=200 exactum_api     # equivalente, usando o nome do container
```

---

# 3. Princípios de Operação

A investigação operacional deve seguir alguns princípios fundamentais.

## 3.1 Diagnosticar antes de alterar

O primeiro objetivo durante um incidente é descobrir:

> **O que está falhando, onde está falhando e por que está falhando?**

Evite reiniciar serviços imediatamente sem entender o problema.

Um restart pode:

- apagar evidências temporárias;
- interromper conexões existentes;
- esconder uma condição de corrida;
- remover contexto importante dos logs;
- fazer o problema reaparecer posteriormente.

Sempre que possível:

```text
Observe
   ↓
Colete evidências
   ↓
Formule hipótese
   ↓
Teste hipótese
   ↓
Aplique correção
   ↓
Valide
```

---

# 4. Modelo Mental de Troubleshooting

Quando algo está indisponível, investigue de fora para dentro.

```text
Internet
   ↓
DNS
   ↓
Cloudflare
   ↓
HTTPS
   ↓
Nginx
   ↓
Frontend/API routing
   ↓
Application
   ↓
Redis/PostgreSQL
```

Por exemplo, se:

```text
https://exactum.app.br/api/health
```

não responde, não comece imediatamente investigando PostgreSQL.

Primeiro determine se:

1. o domínio resolve;
2. o Cloudflare está acessível;
3. o HTTPS está funcionando;
4. o Nginx está funcionando;
5. o Nginx consegue alcançar a API;
6. a API está funcionando;
7. a API consegue acessar PostgreSQL e Redis.

Esse processo reduz drasticamente o espaço de investigação.

---

# 5. Primeira Resposta a um Incidente

Ao identificar um problema em produção, registre inicialmente:

- horário aproximado;
- endpoint ou funcionalidade afetada;
- comportamento observado;
- status HTTP;
- mensagem de erro;
- usuário/tenant afetado, quando aplicável;
- `request_id`, quando disponível;
- alterações recentes;
- último deployment;
- migrations executadas recentemente;
- alterações de infraestrutura.

Uma investigação deve procurar responder:

```text
Quando começou?
O que mudou antes disso?
Quem é afetado?
Qual componente está falhando?
O problema é reproduzível?
O problema é sistêmico ou isolado?
```

---

# 6. Health Check

O primeiro teste para problemas gerais da API deve ser o endpoint de health.

Exemplo:

```bash
curl -i https://exactum.app.br/api/health
```

O resultado deve ser analisado considerando:

- HTTP status;
- response body;
- tempo de resposta;
- headers;
- eventual `request_id`;
- logs correspondentes no backend/Nginx.

O health check possui importância especial porque deve permitir diferenciar:

```text
API indisponível
```

de:

```text
API disponível, mas dependência indisponível
```

e de:

```text
API disponível e dependências saudáveis
```

---

# 7. API Indisponível

## 7.1 Sintoma

Exemplos:

```text
502 Bad Gateway
```

```text
503 Service Unavailable
```

```text
Connection refused
```

```text
Connection timed out
```

ou ausência completa de resposta.

## 7.2 Primeira verificação

No servidor:

```bash
docker compose ps
```

Verifique se o container da API está:

```text
Up
```

ou se está:

```text
Exited
Restarting
Unhealthy
```

---

## 7.3 Verificar logs

```bash
docker compose logs --tail=200 api
```

Para acompanhar em tempo real:

```bash
docker compose logs -f api
```

Procure por:

- traceback;
- exception;
- database connection error;
- Redis connection error;
- configuration error;
- migration error;
- import error;
- missing environment variable;
- startup failure.

---

# 8. Container da API Reiniciando

Se:

```bash
docker compose ps
```

mostrar algo semelhante a:

```text
Restarting
```

o problema normalmente está relacionado ao processo de inicialização da aplicação.

Investigue:

```bash
docker compose logs --tail=300 api
```

Não comece removendo o container.

Primeiro identifique o erro.

Possíveis causas:

- variável de ambiente ausente;
- erro de import;
- migration inconsistente;
- conexão com PostgreSQL;
- conexão com Redis;
- erro de configuração;
- dependência Python incompatível;
- código recém-deployado com erro;
- problema de filesystem;
- erro de permissões.

---

# 9. PostgreSQL

## 9.1 Sintomas

Problemas no PostgreSQL podem aparecer na API como:

```text
500 Internal Server Error
```

ou:

```text
database connection failed
```

```text
connection refused
```

```text
timeout
```

```text
too many connections
```

---

## 9.2 Verificar container

```bash
docker compose ps db
```

Se necessário:

```bash
docker compose logs --tail=200 db
```

---

## 9.3 Verificar conectividade

Primeiro confirme se o container está ativo.

Depois verifique a comunicação a partir da API.

Exemplo:

```bash
# A imagem da API inclui netcat (usado pelo entrypoint.sh)
docker compose exec api nc -z db 5432 && echo "PostgreSQL acessível"

# Verificação direta no container do banco
docker compose exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

A ideia é validar:

```text
API container
     │
     ▼
PostgreSQL container
```

e não somente verificar se PostgreSQL está "Up".

Um container ativo não significa necessariamente que a aplicação consiga utilizá-lo corretamente.

---

# 10. PostgreSQL sem Espaço

Problemas de armazenamento podem provocar comportamento aparentemente não relacionado.

Verifique o host:

```bash
df -h
```

E:

```bash
df -i
```

O primeiro verifica espaço em disco.

O segundo verifica quantidade de inodes disponíveis.

Também pode ser útil:

```bash
docker system df
```

para avaliar o consumo relacionado ao Docker.

Não execute limpeza agressiva automaticamente.

Comandos como:

```bash
docker system prune
```

devem ser utilizados somente depois de compreender quais recursos podem ser removidos.

Em produção, limpeza de Docker deve ser tratada como operação deliberada.

---

# 11. Redis

## 11.1 Sintomas

Falhas no Redis podem afetar:

- refresh sessions;
- logout;
- revogação de tokens;
- rate limiting;
- cache;
- operações dependentes de estado temporário.

Dependendo do fluxo, a API pode continuar parcialmente funcional enquanto determinados recursos de autenticação deixam de funcionar.

---

## 11.2 Verificar container

```bash
docker compose ps redis
```

Logs:

```bash
docker compose logs --tail=200 redis
```

---

## 11.3 Testar Redis

Quando a imagem possuir o cliente Redis:

```bash
docker compose exec redis redis-cli ping
```

Resposta esperada:

```text
PONG
```

---

# 12. Problemas de Login

Quando login apresenta erro, primeiro determine em qual camada o problema ocorre.

```text
Frontend
   ↓
Nginx
   ↓
API
   ↓
Authentication
   ↓
Database
   ↓
Redis/session state
```

Verifique:

1. request chega à API;
2. endpoint retorna status esperado;
3. credenciais são válidas;
4. usuário está ativo;
5. tenant está ativo;
6. cookies são emitidos;
7. browser aceita os cookies;
8. sessão é registrada quando necessário.

---

# 13. Problemas com Cookies HttpOnly

O Exactum utiliza cookies `HttpOnly` para autenticação.

Consequentemente, o frontend não deve tentar acessar diretamente:

```javascript
document.cookie;
```

para recuperar o JWT.

A investigação deve verificar o comportamento HTTP.

No browser, utilize:

```text
Developer Tools
→ Network
→ Request
→ Response Headers
```

e:

```text
Developer Tools
→ Application
→ Cookies
```

Verifique:

- cookie presente;
- `HttpOnly`;
- `Secure`;
- `Path`;
- `SameSite`;
- domínio;
- expiração;
- envio posterior pelo browser.

---

# 14. Refresh Token Falhando

Um refresh failure pode aparecer como:

```text
401 Unauthorized
```

ou:

```text
missing token
```

ou:

```text
invalid token
```

ou:

```text
revoked token
```

A investigação deve considerar:

```text
Browser
   ↓
refresh cookie
   ↓
/auth/refresh
   ↓
JWT validation
   ↓
Redis session
   ↓
rotation
   ↓
new cookies
```

Verifique especialmente:

- refresh cookie;
- cookie path;
- validade do refresh token;
- JTI;
- estado da sessão no Redis;
- rotação anterior;
- logout/revogação;
- usuário bloqueado;
- tenant suspenso.

Uma falha de refresh não deve ser tratada simplesmente como "JWT inválido" sem verificar o estado da sessão.

---

# 15. Path do Cookie

O `Path` dos cookies é particularmente importante no ambiente atual.

O refresh token deve estar disponível para as rotas de autenticação que precisam recebê-lo.

Um erro de `Path` pode produzir um comportamento aparentemente contraditório:

```text
Login funciona
↓
cookie existe
↓
/refresh não recebe cookie
↓
401
```

Ao investigar esse problema, verifique o cookie efetivamente enviado na requisição, e não apenas sua existência no browser.

---

# 16. Problemas de Logout

O logout deve invalidar o estado de sessão correspondente e limpar os cookies de autenticação.

Se logout retornar:

```text
401
```

investigue:

- access token;
- refresh token;
- cookie path;
- sessão Redis;
- JTI;
- expiração;
- configuração de autenticação.

Também confirme se o browser recebeu os headers de remoção dos cookies.

---

# 17. Problemas de Impersonation

Quando impersonation falhar, investigue separadamente:

```text
Super-admin
     ↓
Authorization
     ↓
run-impersonate
     ↓
Impersonation state
     ↓
Access token
     ↓
Refresh token
     ↓
Redis
```

Verifique:

- super-admin possui permissão;
- usuário alvo existe;
- tenant alvo existe;
- estado de impersonation foi criado;
- sessão original continua válida;
- access token representa o usuário impersonado;
- refresh token mantém a identidade original;
- estado correspondente existe no Redis;
- stop-impersonate restaura corretamente o contexto original.

O frontend não deve ser utilizado como fonte de verdade para determinar se impersonation está ativo.

O estado autoritativo é o backend.

---

# 18. Erros 401

Um:

```text
401 Unauthorized
```

indica normalmente problema de autenticação.

Investigue:

```text
Cookie enviado?
        ↓
JWT presente?
        ↓
JWT válido?
        ↓
JWT expirado?
        ↓
Refresh disponível?
        ↓
Session válida no Redis?
```

Não confunda:

```text
401
```

com:

```text
403
```

---

# 19. Erros 403

Um:

```text
403 Forbidden
```

normalmente indica que a identidade foi reconhecida, mas não possui autorização suficiente para executar a operação.

Investigue:

- usuário;
- tenant;
- role;
- permission;
- endpoint;
- recurso;
- estado do recurso;
- eventual impersonation.

Exemplo conceitual:

```text
Authenticated
    +
Authorized? ── No ──> 403
```

O frontend pode esconder funcionalidades sem permissão, mas essa verificação nunca substitui a autorização no backend.

---

# 20. Isolamento de Tenant

Problemas relacionados a tenant isolation devem ser tratados como incidentes de alta prioridade.

Se um usuário conseguir acessar dados de outro tenant, a prioridade não é apenas corrigir a resposta HTTP.

É necessário investigar:

- endpoint;
- controller;
- application service;
- repository;
- query;
- filtros de tenant;
- contexto da requisição;
- autorização;
- possibilidade de reprodução;
- logs;
- audit logs;
- platform events.

A investigação deve determinar:

```text
Qual tenant originou a requisição?
Qual tenant deveria ser acessado?
Qual tenant foi efetivamente consultado?
Qual recurso foi retornado?
```

Quando houver suspeita real de isolamento incorreto, preservar evidências antes de realizar alterações amplas.

---

# 21. Erros 404

Um:

```text
404 Not Found
```

pode ocorrer em diferentes camadas.

Possibilidades:

```text
Cloudflare
Nginx
Frontend
API routing
Resource lookup
```

Primeiro determine se o endpoint existe.

Depois diferencie:

```text
Route inexistente
```

de:

```text
Resource inexistente
```

e:

```text
Resource não acessível no tenant atual
```

Essa distinção é importante para evitar transformar problemas de tenant isolation em simples "404".

---

# 22. Erros 409

`409 Conflict` normalmente representa conflito com o estado atual do recurso.

Exemplos conceituais:

- duplicidade;
- conflito de estado;
- operação incompatível com o estado atual;
- concorrência lógica.

Investigue:

```text
Estado atual
+
Operação solicitada
=
Conflito?
```

Não trate automaticamente um `409` como falha de infraestrutura.

---

# 23. Erros 422

`422 Unprocessable Entity` pode indicar que a requisição chegou corretamente à aplicação, mas os dados não puderam ser processados conforme as regras de validação.

Investigue:

- payload;
- schema;
- tipos;
- campos obrigatórios;
- regras de validação;
- representação esperada pelo endpoint.

---

# 24. Erros 429

`429 Too Many Requests` normalmente está relacionado a rate limiting.

Investigue:

- origem das requisições;
- endpoint;
- usuário;
- tenant;
- IP;
- política aplicada;
- volume de requests;
- possível comportamento automatizado.

Não remova o rate limit simplesmente para eliminar o sintoma.

Primeiro determine por que o limite foi atingido.

---

# 25. Erros 500

Um `500 Internal Server Error` indica falha inesperada no processamento.

O primeiro passo é localizar o erro no backend.

Procure por:

```text
request_id
```

ou outro identificador de correlação disponível.

Depois consulte os logs correspondentes.

Exemplo conceitual:

```text
HTTP 500
   ↓
request_id
   ↓
application log
   ↓
exception
   ↓
stack trace
   ↓
root cause
```

Nunca dependa apenas da mensagem exibida ao usuário.

A resposta externa deve permanecer sanitizada.

---

# 26. Nginx

## 26.1 Verificar container

```bash
docker compose ps nginx
```

Logs:

```bash
docker compose logs --tail=200 nginx
```

---

## 26.2 Erro 502

Um:

```text
502 Bad Gateway
```

normalmente indica que o Nginx não conseguiu obter uma resposta válida do upstream.

Investigue:

```text
Nginx
   ↓
API container
```

Verifique:

- API está ativa?
- upstream está correto?
- porta está correta?
- containers estão na mesma network?
- API está escutando?
- DNS interno do Docker resolve?
- API está reiniciando?

---

## 26.3 Erro 504

Um:

```text
504 Gateway Timeout
```

pode indicar que o upstream não respondeu dentro do timeout configurado.

Possibilidades:

- query lenta;
- PostgreSQL congestionado;
- API bloqueada;
- operação pesada;
- dependência externa lenta;
- deadlock;
- problema de rede.

Não aumente o timeout imediatamente.

Primeiro determine por que a operação está demorando.

---

# 27. HTTPS

Quando HTTPS apresentar problemas, investigue em camadas:

```text
DNS
 ↓
Cloudflare
 ↓
TLS
 ↓
Nginx
```

Verifique:

- DNS;
- certificado;
- modo TLS do Cloudflare;
- validade do certificado;
- configuração do Nginx;
- redirecionamentos;
- headers relacionados a HTTPS.

O objetivo é descobrir se o problema ocorre:

```text
antes do servidor
```

ou:

```text
no servidor
```

ou:

```text
entre Cloudflare e origin
```

---

# 28. DNS

Teste resolução:

```bash
dig exactum.app.br
```

ou:

```bash
nslookup exactum.app.br
```

Compare o resultado esperado com o IP do ambiente de produção.

Alterações de DNS podem levar tempo para propagação dependendo da configuração de cache/TTL.

---

# 29. Deployment Falhando

Quando um deployment falhar, investigue primeiro o pipeline.

Fluxo atual:

```text
GitHub
   ↓
GitHub Actions
   ↓
SSH
   ↓
VPS
   ↓
Docker Compose
   ↓
Migration
   ↓
Application
```

Verifique:

1. workflow falhou em qual etapa;
2. SSH funcionou;
3. código foi atualizado;
4. imagem/build foi atualizado;
5. containers foram recriados;
6. migrations executaram;
7. health check passou.

Não assuma que:

```text
GitHub Actions = aplicação atualizada
```

Um pipeline pode completar parcialmente.

---

# 30. Deployment com Código Atualizado mas Serviço Antigo

Quando o código no servidor estiver atualizado, mas a aplicação continuar apresentando comportamento antigo, verifique:

```bash
docker compose ps
```

e:

```bash
docker compose images
```

Também confirme:

- container foi recriado;
- imagem corresponde à versão esperada;
- volume não está sobrescrevendo arquivos;
- Compose utilizado é o correto;
- deployment não falhou após atualização do código.

---

# 31. Migration Falhando

Migrations alteram estado persistente e devem ser tratadas com cuidado.

Primeiro determine:

```text
Migration executou?
```

Depois:

```text
Banco foi parcialmente alterado?
```

e:

```text
Aplicação esperava qual schema?
```

Verifique o histórico de migrations.

Não execute migrations antigas manualmente sem entender o estado atual do banco.

Antes de operações potencialmente destrutivas, preserve backup quando apropriado.

---

# 32. Migration e Compatibilidade

Uma alteração de schema deve ser compatível com o estado da aplicação durante o deployment.

Idealmente:

```text
Database migration
        ↓
Application version
```

devem possuir uma estratégia compatível de rollout.

Evite mudanças que criem uma janela em que:

```text
Aplicação antiga
```

e:

```text
Schema novo
```

sejam incompatíveis.

Isso é especialmente importante em deployments sem downtime completo.

---

# 33. Rollback

Rollback deve ser tratado como operação planejada.

Existem pelo menos três tipos diferentes de rollback:

```text
Código
Database schema
Dados
```

Eles não são equivalentes.

Fazer rollback do código pode ser simples:

```text
versão anterior
```

mas rollback de migration pode ser muito mais perigoso.

Nunca presuma que:

```text
rollback do código
=
rollback completo do sistema
```

Uma migration que remove ou transforma dados pode tornar um rollback de aplicação insuficiente.

---

# 34. Backup

Antes de operações de alto risco no banco, considere:

- backup;
- snapshot;
- verificação de integridade;
- possibilidade de restauração.

Backup sem teste de restore não oferece garantia operacional suficiente.

A capacidade importante é:

```text
Backup
   ↓
Restore
   ↓
Sistema recuperado
```

## 34.1 Estado atual

> **Atualmente não existe backup automatizado do PostgreSQL.**
>
> O workflow de deploy executa `flask db upgrade` diretamente, sem gerar backup prévio. Os dados residem apenas no volume Docker `pgdata` do VPS.

Até que uma rotina automatizada (agendada e com cópia fora do VPS) seja implementada, o backup deve ser feito manualmente antes de qualquer operação de risco, incluindo deploys que contenham migrations.

## 34.2 Backup manual

```bash
mkdir -p ~/backups

docker compose exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > ~/backups/exactum_$(date +%Y%m%d_%H%M%S).dump

ls -lh ~/backups
```

O formato `custom` permite restauração seletiva com `pg_restore`.

Mantenha uma cópia fora do VPS. Um backup armazenado apenas no mesmo servidor não protege contra perda do servidor.

## 34.3 Restore

> Restaurar sobrescreve os dados atuais. Confirme o arquivo e o ambiente antes de executar.

```bash
docker compose stop api

docker compose exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' \
  < ~/backups/<arquivo>.dump

docker compose start api
```

Após o restore, valide:

```bash
docker compose exec api flask db current
curl -i https://exactum.app.br/api/health
```

---

# 35. Containers Parados

Para listar todos os containers:

```bash
docker ps -a
```

Para obter estado detalhado:

```bash
docker inspect <container>
```

Investigue:

- exit code;
- restart policy;
- health status;
- mounts;
- network;
- environment;
- command;
- logs.

---

# 36. Docker Compose

Verifique o estado geral:

```bash
docker compose ps
```

Verifique logs:

```bash
docker compose logs --tail=200
```

Reinicie somente um serviço quando possível:

```bash
docker compose restart <service>
```

Evite:

```bash
docker compose down
```

como primeira resposta a qualquer incidente.

Derrubar todo o ambiente pode:

- interromper serviços saudáveis;
- remover redes;
- aumentar downtime;
- dificultar diagnóstico.

---

# 37. Restart Controlado

Um restart pode ser apropriado quando:

- processo está travado;
- container está em estado inconsistente;
- memória foi consumida de maneira anormal;
- configuração foi corrigida;
- evidências importantes já foram coletadas.

Após o restart, valide:

```text
container
 ↓
health
 ↓
logs
 ↓
endpoint
 ↓
dependências
```

Nunca considere:

```text
container voltou
```

como equivalente a:

```text
incidente resolvido
```

---

# 38. Memória

Verifique:

```bash
free -h
```

e:

```bash
docker stats
```

Observe:

- memória utilizada;
- CPU;
- network;
- block I/O;
- containers com crescimento anormal.

Problemas de memória podem provocar:

- OOM;
- container restart;
- lentidão;
- timeouts;
- degradação geral.

No Linux, também pode ser útil verificar:

```bash
dmesg | grep -i oom
```

quando permitido pelo ambiente.

---

# 39. CPU

Verifique:

```bash
top
```

ou:

```bash
htop
```

e:

```bash
docker stats
```

Se um container estiver consumindo CPU excessivamente, determine se isso está relacionado a:

- loop;
- query;
- processamento pesado;
- requests excessivos;
- background task;
- bug;
- deployment recente.

Não limite CPU simplesmente para esconder o problema.

---

# 40. Disco

Verifique:

```bash
df -h
```

Depois:

```bash
docker system df
```

E, quando necessário:

```bash
du -sh /var/*
```

O objetivo é descobrir:

```text
Quem está consumindo espaço?
```

Possíveis fontes:

- Docker images;
- containers;
- volumes;
- logs;
- PostgreSQL;
- backups;
- arquivos temporários.

---

# 41. Logs

Os logs são uma das principais fontes de evidência operacional.

O primeiro passo deve ser localizar o componente:

```text
Cloudflare
Nginx
API
PostgreSQL
Redis
```

Depois correlacionar os eventos através de:

```text
timestamp
request_id
user
tenant
endpoint
```

Quando possível, evite analisar logs isoladamente.

O contexto entre componentes frequentemente revela a causa.

---

# 42. Correlation ID

Quando existir um:

```text
request_id
```

utilize-o para reconstruir a requisição.

Exemplo conceitual:

```text
Nginx
  │
  │ request_id=abc123
  ▼
API
  │
  │ request_id=abc123
  ▼
Application Service
  │
  ▼
Repository
```

Isso permite relacionar diferentes registros referentes à mesma operação.

---

# 43. Investigação de Performance

Quando o sistema estiver lento, primeiro determine:

```text
Tudo está lento?
```

ou:

```text
Somente um endpoint?
```

ou:

```text
Somente um tenant?
```

ou:

```text
Somente determinadas operações?
```

Depois investigue:

```text
Nginx
 ↓
API
 ↓
Application Service
 ↓
Database/Redis
```

Métricas úteis incluem:

- request duration;
- database duration;
- Redis duration;
- CPU;
- memory;
- network;
- query execution time.

---

# 44. PostgreSQL Lento

Uma API lenta pode ser consequência de uma query lenta.

Investigue:

- quantidade de dados;
- índices;
- filtros;
- joins;
- ordenação;
- paginação;
- locks;
- concorrência;
- plano de execução.

Não crie índices indiscriminadamente.

Um índice pode melhorar leitura, mas aumentar custo de:

- INSERT;
- UPDATE;
- DELETE;
- armazenamento.

A alteração deve ser orientada pelo padrão de acesso real.

---

# 45. Redis Lento ou Indisponível

Investigue:

- disponibilidade;
- memória;
- conexões;
- volume de operações;
- tamanho das estruturas;
- eviction;
- rede;
- latência.

Determine também se o Redis está sendo utilizado para:

```text
cache
```

ou:

```text
estado operacional
```

porque o impacto da indisponibilidade pode ser diferente.

No Exactum, o Redis possui responsabilidades relacionadas a estado de sessão e outros mecanismos temporários, portanto sua indisponibilidade pode afetar autenticação e operações dependentes desse estado.

---

# 46. Problemas Específicos de Tenant

Se somente um tenant estiver apresentando problema, compare:

```text
Tenant afetado
vs.
Tenant saudável
```

Investigue:

- quantidade de dados;
- configurações;
- usuários;
- permissões;
- produtos;
- vendas;
- estado da conta;
- operações recentes.

Isso pode ajudar a distinguir:

```text
bug sistêmico
```

de:

```text
bug dependente de dados
```

---

# 47. Problemas Após Alteração de Código

Quando o problema começou logo após deployment, compare:

```text
última versão saudável
vs.
versão atual
```

Verifique:

- commits;
- migrations;
- variáveis de ambiente;
- dependências;
- Docker image;
- configuração Nginx;
- configuração Cloudflare;
- mudanças em Redis/PostgreSQL.

A correlação temporal não prova causalidade, mas fornece uma hipótese inicial forte para investigação.

---

# 48. Problemas Após Alteração de Infraestrutura

Quando o problema aparece depois de uma alteração operacional, investigue:

- Docker Compose;
- Nginx;
- firewall;
- DNS;
- Cloudflare;
- certificados;
- portas;
- networks;
- volumes;
- permissões;
- recursos do VPS.

Sempre compare a configuração atual com a última configuração conhecida como saudável.

---

# 49. Segurança Durante Troubleshooting

Durante uma investigação, nunca exponha:

- JWT;
- refresh token;
- passwords;
- API keys;
- secrets;
- connection strings completas;
- dados sensíveis de usuários;
- dados sensíveis de tenants.

Mesmo em logs temporários, evite registrar tokens completos.

Se precisar compartilhar uma evidência:

```text
secret
```

deve ser:

```text
redacted
```

ou parcialmente mascarado.

---

# 50. Troubleshooting de CORS

Quando uma requisição funciona via:

```bash
curl
```

mas falha no browser, considere:

- CORS;
- cookies;
- SameSite;
- Secure;
- origem;
- preflight;
- headers;
- proxy Nginx.

Verifique especialmente a diferença entre:

```text
Browser request
```

e:

```text
Direct HTTP request
```

O browser aplica políticas que ferramentas como `curl` não aplicam.

---

# 51. Troubleshooting de CSRF

O Exactum atualmente utiliza cookies HttpOnly, mas **não possui uma implementação dedicada de proteção CSRF**.

Isso é uma diferença importante:

```text
HttpOnly
≠
CSRF protection
```

Portanto, problemas relacionados a cookies não devem ser interpretados como problemas de CSRF automaticamente.

Ao evoluir a arquitetura, a proteção CSRF deve ser tratada como uma preocupação de segurança própria.

---

# 52. Troubleshooting do Frontend

Quando a API funciona, mas a aplicação web não:

```text
Frontend
   ↓
Nginx
   ↓
API
```

investigue:

- arquivos estáticos;
- build;
- assets;
- JavaScript runtime errors;
- environment variables;
- API base URL;
- `/api` routing;
- cookies;
- CORS;
- cache do browser;
- cache/CDN.

No browser:

```text
Developer Tools
→ Console
```

e:

```text
Developer Tools
→ Network
```

são fontes primárias de evidência.

---

# 53. API Funciona no Swagger, mas Não no Frontend

Esse cenário é particularmente útil para diagnóstico.

Se:

```text
Swagger → API funciona
Frontend → API falha
```

a causa provavelmente está em alguma diferença entre os requests.

Compare:

- URL;
- método;
- headers;
- cookies;
- credentials;
- payload;
- origin;
- CORS;
- proxy.

Não assuma que o backend está quebrado somente porque o frontend apresenta erro.

---

# 54. API Funciona Localmente, mas Falha em Produção

Compare os ambientes.

```text
Development
vs.
Production
```

Verifique:

- environment variables;
- database;
- Redis;
- Docker;
- Nginx;
- Cloudflare;
- cookies;
- HTTPS;
- CORS;
- networking;
- versions;
- migrations.

Um problema exclusivo de produção frequentemente está relacionado a configuração ou infraestrutura, mas não necessariamente.

---

# 55. Problemas de Environment Variables

Verifique se as variáveis necessárias estão presentes no container.

Evite imprimir secrets completos.

Utilize abordagens que confirmem apenas:

```text
variable exists
```

ou:

```text
variable correctly configured
```

sem expor o valor.

Variáveis particularmente importantes incluem configurações relacionadas a:

- database;
- Redis;
- JWT;
- cookies;
- CORS;
- application environment;
- external integrations.

---

# 56. Procedimento de Incidente: API Fora do Ar

Fluxo recomendado:

```text
1. Testar endpoint público
        ↓
2. Verificar DNS/HTTPS
        ↓
3. Verificar Nginx
        ↓
4. Verificar API container
        ↓
5. Verificar API logs
        ↓
6. Verificar PostgreSQL/Redis
        ↓
7. Identificar root cause
        ↓
8. Corrigir
        ↓
9. Validar health
        ↓
10. Validar endpoint real
```

Somente depois disso considere o incidente encerrado.

---

# 57. Procedimento de Incidente: 502

```text
502
 ↓
Nginx
 ↓
Upstream
 ↓
API container
 ↓
Application startup
 ↓
Dependencies
```

Checklist:

- Nginx está ativo?
- API está ativa?
- API está escutando?
- upstream está correto?
- network está correta?
- API está reiniciando?
- logs mostram startup failure?
- PostgreSQL/Redis estão disponíveis?

---

# 58. Procedimento de Incidente: 500

```text
500
 ↓
request_id
 ↓
API logs
 ↓
exception
 ↓
stack trace
 ↓
service
 ↓
repository/database/Redis
```

Checklist:

- endpoint;
- request;
- tenant;
- user;
- request_id;
- exception;
- stack trace;
- dependência;
- alteração recente.

---

# 59. Procedimento de Incidente: Login Falhando

```text
Frontend
 ↓
POST login
 ↓
API
 ↓
Credentials
 ↓
User
 ↓
Tenant
 ↓
JWT
 ↓
Cookies
 ↓
Redis
```

Checklist:

- endpoint responde?
- usuário existe?
- usuário está ativo?
- tenant está ativo?
- password validation funciona?
- access cookie foi emitido?
- refresh cookie foi emitido?
- cookies possuem atributos corretos?
- sessão foi registrada?
- browser envia cookies nas requisições seguintes?

---

# 60. Procedimento de Incidente: Refresh Falhando

```text
Refresh request
 ↓
Cookie?
 ↓
JWT?
 ↓
JTI?
 ↓
Redis session?
 ↓
Revoked?
 ↓
Expired?
 ↓
Rotation
 ↓
New cookies
```

Checklist:

- refresh cookie presente;
- cookie Path;
- cookie Domain;
- Secure;
- SameSite;
- JWT válido;
- JTI válido;
- sessão Redis;
- token revogado;
- usuário ativo;
- tenant ativo.

---

# 61. Procedimento de Incidente: Deployment Falhando

```text
GitHub Actions
 ↓
SSH
 ↓
VPS
 ↓
Code
 ↓
Docker
 ↓
Migration
 ↓
Application
 ↓
Health Check
```

Checklist:

- workflow passou?
- SSH passou?
- código correto?
- build correto?
- containers atualizados?
- migration executada?
- migration compatível?
- API iniciou?
- health check passou?
- endpoints críticos funcionam?

---

# 62. Procedimento de Incidente: PostgreSQL Indisponível

```text
API
 ↓
Network
 ↓
PostgreSQL
 ↓
Process
 ↓
Storage
```

Checklist:

- container ativo;
- logs;
- health;
- network;
- credentials;
- disk;
- memory;
- connections;
- database state.

---

# 63. Procedimento de Incidente: Redis Indisponível

```text
API
 ↓
Network
 ↓
Redis
 ↓
Process
 ↓
Memory
```

Checklist:

- container;
- logs;
- ping;
- memory;
- network;
- session state;
- rate limiting;
- cache;
- impacto funcional.

---

# 64. Procedimento de Incidente: Disco Cheio

```text
df -h
 ↓
df -i
 ↓
docker system df
 ↓
identify consumer
 ↓
remove/archive safely
 ↓
validate services
```

Nunca remova indiscriminadamente:

```text
volumes
```

especialmente volumes que possam conter dados persistentes.

---

# 65. Procedimento de Incidente: HTTPS

```text
DNS
 ↓
Cloudflare
 ↓
TLS
 ↓
Nginx
 ↓
Application
```

Checklist:

- domínio resolve;
- Cloudflare responde;
- certificado válido;
- origin acessível;
- Nginx ativo;
- redirect correto;
- cookies de autenticação presentes (`access_token`, `refresh_token`);
- API acessível.

---

# 66. Critérios para Encerramento

Um incidente não deve ser considerado resolvido apenas porque o erro deixou de aparecer momentaneamente.

Antes de encerrar, valide:

- serviço está ativo;
- health check está saudável;
- endpoint afetado funciona;
- dependências estão saudáveis;
- logs não mostram novos erros;
- autenticação funciona, quando relevante;
- autorização funciona, quando relevante;
- tenant isolation permanece correta;
- não existem efeitos colaterais conhecidos.

Quando apropriado, também valide:

```text
login
refresh
logout
```

e uma operação representativa do domínio afetado.

---

# 67. Pós-Incidente

Incidentes relevantes devem gerar uma análise posterior.

Perguntas importantes:

```text
O que aconteceu?
Por que aconteceu?
Como foi detectado?
Por que não foi detectado antes?
Como foi mitigado?
Qual foi a causa raiz?
Qual foi o impacto?
Como evitar recorrência?
```

O objetivo não é apenas corrigir o bug.

É melhorar o sistema.

---

# 68. Análise de Causa Raiz

A investigação deve tentar diferenciar:

```text
Symptom
```

de:

```text
Root Cause
```

Exemplo:

```text
Sintoma:
API retorna 500.

Causa imediata:
Query falha.

Causa raiz:
Migration introduziu estado incompatível com a aplicação.
```

Corrigir somente o sintoma pode fazer o incidente reaparecer.

---

# 69. Mudanças Preventivas

Após um incidente, mudanças possíveis incluem:

- testes adicionais;
- health checks melhores;
- métricas;
- alertas;
- logs adicionais;
- validação de configuração;
- migration checks;
- CI checks;
- documentação;
- melhoria de rollback;
- índices;
- limites de recursos;
- melhorias de segurança;
- melhoria de observabilidade.

A correção deve ser proporcional ao problema.

---

# 70. Checklist Operacional Rápido

## API

```text
[ ] Container ativo
[ ] Health check OK
[ ] Logs sem erro crítico
[ ] PostgreSQL acessível
[ ] Redis acessível
```

## Nginx

```text
[ ] Container ativo
[ ] Configuração válida
[ ] Upstream acessível
[ ] HTTPS funcionando
[ ] Logs normais
```

## PostgreSQL

```text
[ ] Container ativo
[ ] Storage disponível
[ ] Connections normais
[ ] Logs normais
[ ] Schema compatível
```

## Redis

```text
[ ] Container ativo
[ ] PING OK
[ ] Memory normal
[ ] Session state disponível
```

## Deployment

```text
[ ] GitHub Actions OK
[ ] SSH OK
[ ] Código atualizado
[ ] Containers atualizados
[ ] Migration OK
[ ] Health check OK
```

## Segurança

```text
[ ] Nenhum secret exposto
[ ] Tenant isolation validada
[ ] Authorization funcionando
[ ] Cookies corretos
[ ] Logs sanitizados
```

---

# 71. Comandos de Referência

## Containers

```bash
docker ps
docker ps -a
docker compose ps
docker compose logs --tail=200
docker compose logs -f <service>
docker stats
```

## Host

```bash
df -h
df -i
free -h
top
htop
```

## Armazenamento Docker

```bash
docker system df
```

## DNS

```bash
dig exactum.app.br
nslookup exactum.app.br
```

## HTTP

```bash
curl -i https://exactum.app.br/api/health
```

## Redis

```bash
docker compose exec redis redis-cli ping
```

---

# 72. O que Não Fazer

Durante incidentes, evite ações impulsivas como:

```bash
docker compose down
```

sem necessidade.

Também evite:

- apagar volumes;
- apagar banco;
- executar migrations manualmente sem entender o estado;
- limpar Redis indiscriminadamente;
- remover rate limiting sem investigação;
- desativar autenticação;
- alterar permissões para "testar";
- expor secrets;
- desabilitar HTTPS;
- modificar Cloudflare sem hipótese;
- fazer múltiplas alterações simultaneamente.

Quanto mais mudanças forem feitas ao mesmo tempo, mais difícil será determinar qual alteração resolveu ou agravou o problema.

---

# 73. Estratégia de Diagnóstico

Uma investigação operacional eficiente pode ser resumida em:

```text
Observe
  ↓
Localize
  ↓
Correlacione
  ↓
Formule hipótese
  ↓
Teste
  ↓
Corrija
  ↓
Valide
  ↓
Documente
```

O Runbook não substitui conhecimento do sistema.

Ele reduz a necessidade de improvisação durante situações em que o sistema está sob pressão.

---

# 74. Estado Atual

O Exactum atualmente possui uma infraestrutura de produção baseada em:

- VPS;
- Docker;
- Docker Compose;
- Nginx;
- Cloudflare;
- PostgreSQL;
- Redis;
- GitHub Actions;
- HTTPS;
- structured logging;
- correlation IDs;
- autenticação baseada em JWT HttpOnly cookies;
- Redis-backed session state.

O sistema está em evolução e sua maturidade operacional ainda não representa uma plataforma distribuída de grande escala.

Consequentemente, os procedimentos atuais priorizam:

```text
simplicidade
+
observabilidade
+
diagnóstico determinístico
+
baixo risco operacional
```

---

# 75. Evolução Futura

Conforme a infraestrutura evoluir, o Runbook deverá acompanhar novos componentes e responsabilidades.

Possíveis evoluções incluem:

- Prometheus;
- Grafana;
- métricas de aplicação;
- alerting;
- OpenTelemetry;
- distributed tracing;
- Celery;
- RabbitMQ;
- background workers;
- external APIs;
- object storage;
- automated backups;
- automated restore testing;
- infrastructure as code;
- container orchestration;
- stronger deployment strategies;
- zero-downtime deployment;
- automated rollback.

A introdução desses componentes aumenta a capacidade operacional, mas também aumenta a complexidade.

Portanto, cada nova infraestrutura deve vir acompanhada de:

```text
Observability
+
Failure Mode
+
Recovery Procedure
+
Documentation
```

---

# 76. Princípios Operacionais

O funcionamento confiável do Exactum depende de alguns princípios:

1. **Diagnose before changing.**
2. **Preserve evidence before destructive operations.**
3. **Prefer small and reversible changes.**
4. **Use correlation to reconstruct failures.**
5. **Treat database operations as high-risk operations.**
6. **Do not expose secrets during troubleshooting.**
7. **Validate dependencies instead of trusting container status.**
8. **Do not confuse authentication with authorization.**
9. **Treat tenant isolation as a security boundary.**
10. **Do not consider a restart equivalent to a fix.**
11. **Validate the complete request path after remediation.**
12. **Document relevant incidents and their root causes.**

---

# 77. Relação com Outros Documentos

Este Runbook complementa principalmente:

- `docs/operations/development.md`
- `docs/operations/docker.md`
- `docs/operations/deployment.md`
- `docs/operations/nginx.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`
- `docs/observability/overview.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/platform-events.md`
- `docs/observability/audit-logging.md`
- `docs/observability/correlation.md`
- `docs/database/migrations.md`
- `docs/api/errors.md`

---

# 78. Observação sobre Nomenclatura e Evolução Arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação da API.

Por exemplo:

```text
actor
```

é utilizado como conceito arquitetural para representar quem originou ou executou determinada ação, enquanto a implementação atual pode representar essa identidade por meio de:

```text
user_uuid
```

Da mesma forma:

```text
tenant
```

pode ser representado atualmente por:

```text
tenant_uuid
```

e:

```text
resource
```

pode ser representado por identificadores específicos como:

```text
product_uuid
sale_uuid
user_uuid
```

Essa distinção permite que a documentação descreva o significado arquitetural dos elementos sem limitar os conceitos aos detalhes atuais de implementação.

A organização apresentada também poderá evoluir conforme o sistema avance.

Responsabilidades atualmente agrupadas em determinados domínios poderão posteriormente ser extraídas para contextos próprios, assim como novos mecanismos de infraestrutura e observabilidade poderão ser introduzidos.

Portanto, este documento deve ser interpretado como uma representação do **modelo operacional atual e de sua direção de evolução**, e não como uma descrição imutável da infraestrutura futura.

---

# 79. Conclusão

O Runbook estabelece uma abordagem sistemática para operar e investigar o Exactum.

A principal ideia é simples:

> **um incidente deve ser investigado como um problema de sistema, e não apenas como um erro isolado da aplicação.**

A partir de uma arquitetura composta por Cloudflare, Nginx, containers, API, PostgreSQL e Redis, uma falha em qualquer camada pode se manifestar em outra.

Por isso, a investigação deve seguir o caminho completo da requisição:

```text
Client
  ↓
Cloudflare
  ↓
Nginx
  ↓
API
  ↓
Application Services
  ↓
Repositories
  ↓
PostgreSQL / Redis
```

Combinando essa visão com:

- logs estruturados;
- correlation IDs;
- health checks;
- observabilidade;
- procedimentos de recuperação;
- controle de mudanças;
- segurança;
- análise de causa raiz;

o sistema se torna progressivamente mais previsível de operar e mais fácil de diagnosticar.

O objetivo final de um Runbook não é prever todos os problemas possíveis.

É garantir que, quando um problema ocorrer, exista um **processo racional, reproduzível e seguro para descobrir o que aconteceu e restaurar o sistema**.
