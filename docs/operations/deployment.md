# Deployment e Release

## Objetivo

O processo de **Deployment** do Exactum tem como objetivo disponibilizar novas versões da aplicação em produção de maneira previsível, rastreável e controlada.

O Exactum é hospedado em um **VPS Linux** e utiliza Docker Compose para executar os principais componentes da aplicação. O processo de atualização é automatizado através de **GitHub Actions**, que realiza as etapas de validação e utiliza conexão SSH para executar as operações necessárias no servidor.

O fluxo atual pode ser representado conceitualmente como:

```text
Developer
    │
    ▼
Git Commit
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Tests
    ├── Lint
    └── Validation
    │
    ▼
SSH
    │
    ▼
Production VPS
    │
    ▼
Docker Compose
    │
    ├── Exactum API
    ├── Frontend
    ├── Nginx
    ├── PostgreSQL
    └── Redis
```

O objetivo do deployment não é apenas atualizar código.

Uma release precisa preservar a consistência entre:

- aplicação;
- banco de dados;
- configuração;
- containers;
- dependências;
- infraestrutura;
- observabilidade;
- contratos da API.

---

# 1. Princípios do Deployment

O processo de deployment do Exactum segue alguns princípios fundamentais.

### Reproducibility

Uma mesma versão deve poder ser implantada de maneira previsível.

### Automation

Operações repetitivas devem ser executadas automaticamente sempre que possível.

### Validation Before Deployment

O código deve passar pelas verificações automatizadas antes de chegar ao ambiente de produção.

### Explicit Database Changes

Alterações estruturais no banco devem ser tratadas explicitamente através de migrations.

### Traceability

Uma release deve poder ser relacionada ao commit que originou o deployment.

### Operational Safety

Operações potencialmente destrutivas devem ser evitadas ou executadas de maneira explícita.

### Production Verification

O sucesso do processo de deploy não deve ser considerado apenas pelo fato de o pipeline ter terminado sem erro.

A aplicação precisa ser validada no ambiente de produção.

---

# 2. Ambiente de Produção

O Exactum atualmente utiliza um VPS Linux como ambiente de produção.

A infraestrutura pode ser representada como:

```text
Internet
   │
   ▼
Cloudflare
   │
   ▼
Production VPS
   │
   ▼
Docker
   │
   ▼
Docker Compose
   │
   ├── Nginx
   ├── Frontend
   ├── Exactum API
   ├── PostgreSQL
   └── Redis
```

O domínio público é utilizado para disponibilizar a aplicação.

O Cloudflare participa da camada externa de infraestrutura, enquanto o Nginx e os containers executam no VPS.

---

# 3. Source of Truth

O código-fonte do Exactum é mantido em Git.

O repositório Git representa a principal fonte de verdade para:

- código;
- configuração versionada;
- Dockerfiles;
- Docker Compose;
- migrations;
- testes;
- documentação;
- workflow de CI/CD.

O servidor de produção não deve ser utilizado como local primário de desenvolvimento.

Alterações permanentes devem ser realizadas no repositório e posteriormente implantadas através do processo de deployment.

Isso reduz o risco de **configuration drift** entre o código versionado e o ambiente de produção.

---

# 4. Git Workflow

Uma release começa normalmente a partir de uma alteração no código.

Fluxo conceitual:

```text
Feature / Fix
      │
      ▼
Git commit
      │
      ▼
Push
      │
      ▼
GitHub
      │
      ▼
CI/CD
```

Cada alteração relevante deve possuir um commit identificável.

Isso permite relacionar:

```text
Release
   │
   ▼
Commit
   │
   ▼
Code changes
```

Essa relação é importante para investigação de problemas e eventual rollback.

---

# 5. Continuous Integration

Antes do deployment, o código passa pelo processo de **Continuous Integration (CI)**.

O CI tem como objetivo detectar problemas antes que uma alteração seja disponibilizada em produção.

O pipeline de CI (`.github/workflows/ci.yml`) é executado em `push` e `pull_request` para as branches `main` e `develop`, com PostgreSQL 15 e Redis como serviços do job.

Etapas atuais, na ordem em que são executadas:

| Etapa                       | Comando                                                       |
| --------------------------- | ------------------------------------------------------------- |
| Instalação de dependências  | `uv sync --frozen`                                            |
| Lint                        | `uv run ruff check .`                                         |
| Formatação                  | `uv run ruff format --check .`                                |
| Type checking               | `uv run mypy .`                                               |
| Auditoria de dependências   | `uv run pip-audit --strict`                                   |
| Validação de migrations     | `uv run flask db upgrade && uv run flask db check`            |
| Testes e cobertura          | `uv run pytest --cov=app --cov-report=xml --cov-fail-under=80` |
| Upload de cobertura         | Codecov                                                       |

Todas as etapas são executadas no diretório `backend/`. O frontend não possui etapa de CI atualmente.

Detalhes adicionais estão em [`docs/testing/ci.md`](../testing/ci.md).

---

# 6. CI não é Deployment

É importante separar os conceitos.

**Continuous Integration** verifica a qualidade e consistência da alteração.

**Deployment** disponibiliza a alteração em um ambiente.

Portanto:

```text
CI
 │
 └── "Esta alteração está pronta para seguir?"

Deployment
 │
 └── "Esta alteração foi disponibilizada no ambiente?"
```

O pipeline pode conter ambos os processos, mas suas responsabilidades continuam distintas.

---

# 7. GitHub Actions

O GitHub Actions funciona como mecanismo de automação do pipeline.

Ele executa as etapas necessárias para validar e implantar o projeto.

O projeto possui três workflows:

| Workflow                | Gatilho                                | Responsabilidade                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------------ |
| `ci.yml`                | push / PR em `main` e `develop`        | Lint, type checking, auditoria, migrations, testes |
| `deploy.yml`            | push em `main`                         | Deploy via SSH no VPS                            |
| `check-pr-source.yml`   | PR para `main`                         | Garante que PRs para `main` venham de `develop`  |

O workflow deve evitar operações manuais sempre que elas puderem ser automatizadas com segurança.

---

# 8. SSH e acesso ao servidor

O deployment atual utiliza **SSH** para acessar o VPS.

O GitHub Actions estabelece a conexão com o servidor utilizando credenciais configuradas no ambiente de CI/CD.

A autenticação deve utilizar mecanismos apropriados, evitando:

- senhas hardcoded;
- chaves privadas commitadas;
- secrets dentro do código;
- credenciais expostas em logs.

As credenciais necessárias para o deployment devem permanecer armazenadas como **GitHub Actions Secrets** ou mecanismo equivalente.

---

# 9. Fluxo de Deployment

O deploy é executado pelo workflow `.github/workflows/deploy.yml` a cada `push` na branch `main`.

> **Importante:** o workflow de deploy **não depende** do workflow de CI. Os dois são disparados de forma independente pelo mesmo `push`, portanto um deploy pode ocorrer mesmo que o CI daquele commit falhe.
>
> Na prática, a garantia de qualidade depende de a alteração ter passado pelo CI no Pull Request antes do merge em `main`. Tornar o deploy dependente do CI (por exemplo, via `workflow_run` ou unificando os jobs com `needs:`) é uma melhoria planejada.

Fluxo atual:

```text
git push (main)
   │
   ├──────────────────────────┐
   ▼                          ▼
CI (ci.yml)              Deploy (deploy.yml)
                              │
                              ▼
                        SSH no VPS (appleboy/ssh-action)
                              │
                              ▼
                        cd /etc/opt/exactum-api
                        git fetch origin
                        git reset --hard origin/main
                              │
                              ▼
                        docker compose -f docker-compose.prod.yml build
                        docker compose -f docker-compose.prod.yml up -d db
                        docker compose -f docker-compose.prod.yml run --rm api flask db upgrade
                        docker compose -f docker-compose.prod.yml up -d --build
                        docker image prune -f
```

Características do fluxo atual:

- não há backup automático antes de `flask db upgrade`;
- não há health check automatizado após o deploy;
- não há rollback automatizado;
- o `git reset --hard` descarta qualquer alteração local no diretório do servidor.

O processo exato pode variar conforme a alteração realizada.

Uma mudança apenas de backend, por exemplo, pode possuir impacto diferente de uma alteração envolvendo:

- frontend;
- banco;
- infraestrutura;
- Nginx;
- configuração;
- migrations.

---

# 10. Build e atualização dos containers

Após a chegada da nova versão ao servidor, os serviços afetados precisam ser atualizados.

O Docker Compose permite reconstruir ou recriar os containers correspondentes.

Conceitualmente:

```text
New source
    │
    ▼
Docker build
    │
    ▼
New image
    │
    ▼
Container recreation
    │
    ▼
Updated service
```

O processo deve preservar os volumes e demais estados persistentes que não fazem parte da imagem.

---

# 11. Database Migrations

Alterações no schema do banco de dados devem utilizar **Alembic migrations**, através da integração utilizada pelo projeto.

Uma alteração de modelo pode seguir:

```text
Code change
    │
    ▼
Migration
    │
    ▼
CI validation
    │
    ▼
Production migration
    │
    ▼
Application update
```

Migrations devem ser tratadas como parte da release.

Não é suficiente alterar o model da aplicação e assumir que o banco de produção acompanhará automaticamente essa alteração.

---

# 12. Migration Before Application

Uma migration pode precisar ser executada antes da atualização da aplicação.

Isso é especialmente importante quando existe alteração estrutural incompatível com a versão atualmente em produção.

Exemplo:

```text
Version N
   │
   ▼
Migration
   │
   ▼
Database schema
   │
   ▼
Version N+1
```

Porém, a ordem correta depende da natureza da mudança.

Alterações compatíveis podem utilizar uma estratégia como:

```text
1. adicionar estrutura compatível
2. atualizar aplicação
3. migrar utilização
4. remover estrutura antiga posteriormente
```

Essa abordagem reduz riscos durante deployments que envolvem mudanças de schema.

---

# 13. Expand and Contract

Para mudanças mais sensíveis no banco, uma estratégia útil é o padrão **Expand and Contract**.

### Expand

Adicionar a nova estrutura sem remover a antiga.

```text
Old schema
    +
New schema
```

### Application Update

Atualizar a aplicação para utilizar a nova estrutura.

```text
Application
      │
      └── New schema
```

### Contract

Somente depois de confirmar que a estrutura antiga não é mais utilizada, removê-la.

```text
New schema only
```

Essa estratégia reduz a dependência de deployments perfeitamente atômicos.

---

# 14. Backward Compatibility

Durante um deployment, diferentes componentes podem existir temporariamente em estados diferentes.

Por exemplo:

```text
Old API
    │
    ▼
Database
    │
    ▼
New schema
```

ou:

```text
New API
    │
    ▼
Database
    │
    ▼
Schema compatible with previous version
```

Por isso, migrations e alterações de código devem considerar compatibilidade durante a transição.

Essa preocupação é especialmente importante em sistemas que utilizam:

- múltiplos containers;
- jobs assíncronos;
- cache;
- sessões;
- frontend independente do backend;
- deployments graduais.

---

# 15. Health Check

Depois da atualização, o ambiente precisa ser validado.

O Exactum possui health checks que verificam condições importantes da aplicação.

Um health check pode avaliar:

```text
API
 │
 ├── Application available
 ├── PostgreSQL available
 └── Redis available
```

Isso é mais significativo do que simplesmente verificar se o container está `running`.

---

# 16. Deployment Verification

Um deployment bem-sucedido possui pelo menos três níveis de validação.

## 16.1 Pipeline

Verificar se o GitHub Actions terminou sem erros.

```text
CI/CD
   └── success
```

## 16.2 Infrastructure

Verificar os containers.

```text
docker compose ps
```

e analisar logs quando necessário.

## 16.3 Application

Verificar a aplicação através de:

- health endpoint;
- frontend;
- autenticação;
- endpoints críticos;
- comportamento esperado da release.

Portanto:

```text
Pipeline success
       ≠
Deployment verified
```

---

# 17. Smoke Tests

Após um deployment, testes rápidos podem verificar os fluxos essenciais.

Exemplos:

```text
Application
   │
   ├── Frontend loads
   ├── Login works
   ├── Session works
   ├── API responds
   ├── Database available
   └── Redis available
```

Esses testes não substituem a suíte completa de testes automatizados.

Eles servem para verificar se o sistema realmente está operacional após a publicação.

---

# 18. Authentication Verification

Como a autenticação do Exactum utiliza HttpOnly cookies, mudanças relacionadas a:

- login;
- refresh;
- logout;
- CORS;
- cookie configuration;
- reverse proxy;
- domain;
- HTTPS;

merecem validação específica após deployment.

Um problema de configuração pode fazer a API parecer disponível enquanto a autenticação está quebrada.

Por isso, uma release envolvendo autenticação deve validar pelo menos:

```text
Login
  │
  ▼
Access Cookie
  │
  ▼
Authenticated Request
  │
  ▼
Refresh
  │
  ▼
Logout
```

---

# 19. Session Management

O Redis participa do gerenciamento de sessões do Exactum.

Portanto, deployments que alteram:

- JWT;
- refresh tokens;
- session state;
- Redis keys;
- revocation;
- impersonation;

devem considerar o estado existente no Redis.

Uma atualização da aplicação não deve invalidar sessões de maneira inesperada sem uma decisão explícita.

Quando uma mudança exigir incompatibilidade, esse comportamento deve ser documentado.

---

# 20. Impersonation

O mecanismo de impersonation possui estado relacionado à sessão e ao refresh token.

Consequentemente, alterações nessa área devem receber atenção especial durante deployment.

Após mudanças no mecanismo, é importante verificar:

```text
Super Admin
    │
    ▼
Start Impersonation
    │
    ▼
Impersonated User
    │
    ▼
Stop Impersonation
    │
    ▼
Original Super Admin
```

Também devem ser considerados:

- Redis state;
- refresh token;
- access token;
- cookies;
- observability events;
- audit logging.

---

# 21. Tenant Isolation

Mudanças relacionadas à persistência ou autenticação podem afetar diretamente a isolation entre tenants.

Por isso, releases que modificam:

- repositories;
- tenant filters;
- middleware;
- authentication;
- authorization;
- database queries;

devem considerar explicitamente o comportamento multi-tenant.

Uma release não pode ser considerada segura apenas porque o fluxo de um tenant funciona.

É necessário verificar que um tenant não consegue acessar recursos pertencentes a outro.

---

# 22. Observability durante Deployment

Observability deve fazer parte do processo de deployment.

Durante uma atualização, logs podem indicar:

- startup failure;
- database connection failure;
- Redis connection failure;
- migration failure;
- authentication errors;
- unexpected exceptions;
- configuration problems.

O uso de `request_id` e demais informações de contexto facilita relacionar problemas ocorridos após uma release.

O processo de deployment deve permitir responder:

```text
O que mudou?
       │
       ▼
Qual commit?
       │
       ▼
Qual versão?
       │
       ▼
Quando foi implantado?
       │
       ▼
Qual comportamento mudou?
       │
       ▼
Quais erros apareceram?
```

---

# 23. Release Correlation

Cada deployment deve poder ser relacionado a uma alteração específica no Git.

Idealmente:

```text
Production deployment
        │
        ▼
Commit SHA
        │
        ▼
Changed files
        │
        ▼
Migration
        │
        ▼
Observed behavior
```

Essa rastreabilidade é importante para troubleshooting e incident response.

---

# 24. Configuration Changes

Nem toda mudança de produção envolve código.

Alterações podem envolver:

- environment variables;
- Nginx;
- Docker Compose;
- domain configuration;
- cookie settings;
- CORS;
- Redis;
- PostgreSQL;
- resource limits;
- secrets.

Essas mudanças também devem ser tratadas como alterações de infraestrutura e possuir rastreabilidade.

Uma mudança manual diretamente no servidor, sem atualização da configuração versionada, aumenta o risco de **configuration drift**.

---

# 25. Secrets

Secrets utilizados pelo deployment não devem ser armazenados no repositório.

Exemplos:

- SSH private key;
- application secret;
- JWT secret;
- database credentials;
- Redis credentials;
- Cloudflare credentials;
- external API keys.

O pipeline deve receber essas informações através de mecanismos seguros.

Também é importante evitar que secrets sejam impressos nos logs do GitHub Actions.

---

# 26. Rollback

Rollback significa retornar o ambiente para uma versão anterior conhecida.

Um rollback pode envolver:

```text
Application
    │
    ▼
Previous commit/image
```

Porém, rollback de aplicação não significa automaticamente rollback do banco.

Essa diferença é crítica.

Se uma migration destrutiva já foi aplicada:

```text
New application
      │
      ▼
New schema
```

simplesmente voltar o código pode não ser suficiente.

Por isso, migrations devem ser projetadas considerando estratégias de reversão ou compatibilidade.

---

# 27. Rollback de Código

Quando o problema está apenas na aplicação, pode ser possível retornar ao commit anterior.

Conceitualmente:

```text
Version A
   │
   ▼
Version B
   │
   ▼
Problem detected
   │
   ▼
Rollback
   │
   ▼
Version A
```

Essa operação depende de o schema e demais componentes continuarem compatíveis com a versão anterior.

---

# 28. Rollback de Database

Database rollback é uma operação mais delicada.

Nem toda migration deve ser revertida automaticamente.

Algumas alterações podem envolver:

- perda de dados;
- transformação de dados;
- alteração de constraints;
- mudança de índices;
- alteração de tipos;
- renomeação de colunas;
- remoção de estruturas.

Por isso, rollback de banco deve ser tratado como operação independente e avaliado conforme a migration específica.

Em determinados casos, restaurar um backup pode ser mais apropriado do que executar um downgrade da migration.

---

# 29. Failed Deployment

Quando um deployment falha, a prioridade deve ser:

1. identificar o ponto de falha;
2. impedir novas alterações enquanto o incidente é investigado;
3. verificar estado dos containers;
4. verificar migrations;
5. verificar logs;
6. verificar health checks;
7. determinar se a aplicação continua operacional;
8. avaliar rollback;
9. corrigir a causa;
10. validar novamente.

O objetivo não é simplesmente "fazer o pipeline ficar verde".

O objetivo é restaurar um estado operacional conhecido.

---

# 30. Deployment parcialmente concluído

Um deployment pode falhar depois de algumas etapas já terem sido executadas.

Exemplo:

```text
CI                  ✓
SSH                 ✓
Code update         ✓
Image build         ✓
Migration           ✓
API restart         ✗
```

Nesse cenário, o servidor pode estar em um estado intermediário.

Por isso, o processo de recovery precisa considerar o estado real do ambiente, e não simplesmente executar o pipeline novamente sem análise.

---

# 31. Database Backup Before Risky Changes

Antes de migrations ou operações que possam alterar dados de maneira relevante, deve existir uma estratégia apropriada de backup.

Conceitualmente:

```text
Backup
   │
   ▼
Migration
   │
   ▼
Validation
   │
   ├── Success
   │
   └── Failure
          │
          ▼
       Recovery
```

A existência de um backup não elimina a necessidade de testar migrations.

Backup é uma camada de recovery, não uma substituição de validação.

> **Estado atual:** não existe backup automatizado. O workflow de deploy executa migrations sem backup prévio. Os comandos de backup e restore manuais estão em [`docs/operations/runbook.md` — seção 34](./runbook.md#34-backup).

---

# 32. Deployment de Frontend

Mudanças no frontend possuem algumas características próprias.

Uma nova versão pode alterar:

- JavaScript;
- CSS;
- assets;
- chamadas à API;
- nomes de endpoints;
- formato de responses;
- autenticação;
- cookies.

Por isso, frontend e backend devem considerar compatibilidade durante uma release.

Uma mudança no frontend que depende de uma API ainda inexistente pode quebrar o sistema mesmo que ambos os componentes funcionem isoladamente.

---

# 33. API Compatibility

Mudanças na API devem considerar consumidores existentes.

No caso atual, o principal consumidor é o frontend do Exactum, mas a API também representa um contrato público da aplicação.

Alterações como:

```text
rename endpoint
remove field
change response structure
change authentication behavior
```

podem quebrar clientes.

Por isso, alterações incompatíveis devem ser tratadas como mudanças de contrato.

---

# 34. Nginx

O Nginx participa diretamente do tráfego de produção.

Alterações em sua configuração podem afetar:

- routing;
- frontend;
- API;
- HTTPS;
- cookies;
- headers;
- proxy;
- timeouts.

Por isso, alterações no Nginx devem ser validadas antes de considerar o deployment concluído.

Uma configuração inválida pode tornar a aplicação inteira inacessível mesmo que os containers da API e do frontend estejam saudáveis.

---

# 35. Cloudflare

O Cloudflare participa da infraestrutura externa do domínio.

Uma alteração de aplicação normalmente não exige mudanças no Cloudflare.

Entretanto, alterações relacionadas a:

- DNS;
- HTTPS;
- proxy;
- domínio;
- caching;
- security settings;

podem afetar o comportamento da aplicação.

Essas mudanças devem ser tratadas como alterações de infraestrutura.

---

# 36. Deployment de Infraestrutura

Alterações de infraestrutura devem ser diferenciadas de alterações puramente funcionais.

Exemplos:

```text
Application change
    → Python / React

Infrastructure change
    → Docker / Nginx / VPS

Database change
    → Alembic / PostgreSQL

Security change
    → Authentication / Authorization / Cookies
```

Uma release pode envolver mais de uma dessas categorias simultaneamente.

Quanto maior o número de camadas alteradas, maior deve ser a atenção ao processo de validação.

---

# 37. Zero Downtime

O deployment atual não deve ser descrito como um sistema de **zero-downtime deployment** completo.

O uso de Docker Compose simplifica a atualização dos serviços, mas não significa automaticamente que todas as atualizações sejam realizadas sem interrupção.

Zero downtime normalmente exige mecanismos adicionais, como:

- múltiplas instâncias;
- load balancing;
- rolling deployments;
- readiness checks;
- graceful shutdown;
- backward-compatible migrations;
- estratégia de traffic switching.

Esses mecanismos podem ser introduzidos conforme a necessidade do sistema.

---

# 38. Graceful Shutdown

Serviços devem, quando possível, encerrar processos de maneira controlada.

Isso reduz riscos como:

- requests interrompidas;
- transações incompletas;
- conexões abertas;
- jobs interrompidos;
- inconsistências temporárias.

A estratégia de graceful shutdown pode se tornar mais importante conforme o Exactum incorporar processamento assíncrono.

---

# 39. Background Jobs

Atualmente, o Exactum ainda possui uma arquitetura predominantemente síncrona.

Entretanto, existe planejamento para introduzir:

- Celery;
- RabbitMQ;
- workers assíncronos.

Quando isso ocorrer, o deployment deverá considerar novos componentes:

```text
API
 │
 └── Queue
       │
       ▼
    Worker
```

Nesse cenário, uma release deverá considerar compatibilidade entre:

- API;
- worker;
- queue;
- database;
- Redis;
- application code.

Essa evolução exigirá uma estratégia de deployment mais sofisticada.

---

# 40. Release Types

Nem todas as releases possuem o mesmo nível de risco.

Uma classificação operacional útil é:

### Low Risk

Exemplos:

- documentação;
- pequenas alterações de frontend;
- correções isoladas.

### Medium Risk

Exemplos:

- alterações de API;
- autenticação;
- Redis;
- Nginx;
- mudanças significativas de backend.

### High Risk

Exemplos:

- migrations complexas;
- mudanças de autenticação;
- alterações de isolamento multi-tenant;
- alterações estruturais de banco;
- mudanças de infraestrutura.

A classificação não representa uma pontuação formal de risco, mas ajuda a determinar o nível de validação necessário.

---

# 41. Checklist Pré-Deploy

Antes de um deployment relevante:

```text
[ ] Código commitado
[ ] Testes passando
[ ] Ruff passando
[ ] Migration revisada
[ ] Compatibilidade avaliada
[ ] Secrets/configuração verificadas
[ ] Impacto no banco avaliado
[ ] Impacto no Redis avaliado
[ ] Impacto no Nginx avaliado
[ ] Backup considerado quando necessário
[ ] Rollback avaliado
```

---

# 42. Checklist Pós-Deploy

Após o deployment:

```text
[ ] GitHub Actions concluído
[ ] Containers saudáveis
[ ] Logs sem erros críticos
[ ] Health endpoint funcionando
[ ] Frontend carregando
[ ] Login funcionando
[ ] Refresh funcionando
[ ] Logout funcionando
[ ] Fluxos críticos funcionando
[ ] PostgreSQL acessível
[ ] Redis acessível
[ ] API respondendo
```

A lista pode ser adaptada conforme o tipo de release.

---

# 43. Troubleshooting

Quando uma release apresentar problemas, a investigação deve seguir uma sequência estruturada.

### 1. Pipeline

Verificar o GitHub Actions.

### 2. SSH

Verificar se o deployment alcançou o VPS.

### 3. Docker

Verificar:

```bash
docker compose ps
```

### 4. Logs

Verificar:

```bash
docker compose logs
```

### 5. Health

Verificar o endpoint de health.

### 6. Database

Verificar migrations e conexão.

### 7. Redis

Verificar disponibilidade e estado relevante.

### 8. Nginx

Verificar routing e proxy.

### 9. Application

Investigar logs e `request_id`.

### 10. Rollback

Se necessário, retornar para uma versão conhecida.

---

# 44. Deployment e Observability

Deployment e observability são complementares.

O deployment responde:

> O que foi colocado em produção?

Observability ajuda a responder:

> O que aconteceu depois?

Por isso, informações como:

- commit;
- timestamp;
- versão;
- request_id;
- event_id;
- logs;
- platform events;
- audit logs;

podem ser correlacionadas durante investigação.

---

# 45. Incident Response

Quando uma release causa um problema relevante, o processo deve priorizar restauração do serviço.

Uma sequência possível:

```text
Detection
   │
   ▼
Investigation
   │
   ▼
Containment
   │
   ▼
Rollback / Fix
   │
   ▼
Validation
   │
   ▼
Recovery
   │
   ▼
Post-incident analysis
```

O objetivo não é apenas corrigir o código, mas compreender:

- causa;
- impacto;
- detecção;
- duração;
- recuperação;
- prevenção.

---

# 46. Deployment Auditability

Mudanças de produção devem possuir rastreabilidade.

Idealmente, deve ser possível identificar:

```text
Who
 │
 └── quem realizou / iniciou o deployment

What
 │
 └── qual versão

When
 │
 └── quando

Where
 │
 └── qual ambiente

Why
 │
 └── qual alteração
```

Essa informação pode ser complementada futuramente por eventos de plataforma dedicados ao lifecycle de deployment.

---

# 47. Versioning

A versão da aplicação deve possuir uma relação clara com o código implantado.

Um modelo conceitual é:

```text
Version
   │
   └── Commit SHA
          │
          ├── Source code
          ├── Docker image
          └── Database migration state
```

Isso facilita reproduzir o estado de uma determinada release.

O versionamento formal da API possui regras próprias e é documentado em:

`docs/api/versioning.md`

---

# 48. Roll Forward

Nem todo problema deve ser resolvido através de rollback.

Em alguns casos, uma correção rápida pode ser implantada como uma nova versão.

Exemplo:

```text
Version A
   │
   ▼
Version B
   │
   ▼
Problem
   │
   ▼
Version C
   │
   ▼
Fix
```

Isso é conhecido como **roll forward**.

A escolha entre rollback e roll forward depende de:

- gravidade;
- facilidade de correção;
- estado do banco;
- impacto nos usuários;
- compatibilidade;
- possibilidade de recovery.

---

# 49. Deployment Reproducibility

Um deployment deve evitar depender de conhecimento implícito do operador.

Idealmente, uma nova pessoa com acesso adequado deve conseguir compreender:

```text
Repository
    │
    ▼
CI/CD
    │
    ▼
VPS
    │
    ▼
Docker Compose
    │
    ▼
Application
```

Esse princípio reduz o chamado **bus factor** operacional.

A documentação de deployment deve complementar os workflows automatizados.

---

# 50. Production Safety

Operações em produção devem ser realizadas com cautela.

Especialmente:

- migrations;
- remoção de volumes;
- alterações de secrets;
- alterações de Nginx;
- alterações de autenticação;
- alterações de tenant isolation;
- mudanças de banco;
- alterações de infraestrutura.

Comandos destrutivos não devem fazer parte de scripts de deployment sem uma necessidade claramente justificada.

---

# 51. Deployment e Segurança

O processo de deployment faz parte da segurança da aplicação.

Um pipeline comprometido pode permitir:

- alteração de código;
- acesso ao servidor;
- exposição de secrets;
- alteração de banco;
- comprometimento da aplicação.

Por isso, devem ser protegidos:

- GitHub repository;
- GitHub Actions;
- SSH credentials;
- VPS;
- environment variables;
- deployment secrets.

A segurança da aplicação não termina no código.

---

# 52. Dependências

Atualizações de dependências podem alterar o comportamento da aplicação.

Antes de atualizar dependências importantes, especialmente:

- Flask;
- SQLAlchemy;
- JWT libraries;
- Redis clients;
- PostgreSQL drivers;
- React;
- Vite;

deve-se considerar:

- breaking changes;
- migrations;
- security advisories;
- compatibility;
- test coverage.

Atualizações relevantes devem passar pelo CI antes do deployment.

---

# 53. Failed Migration

Se uma migration falhar, o processo deve parar antes de prosseguir cegamente com a atualização da aplicação.

Conceitualmente:

```text
Deploy
  │
  ▼
Migration
  │
  ├── Success ──► Continue
  │
  └── Failure
         │
         ▼
      Stop
         │
         ▼
      Inspect
```

A situação do banco deve ser avaliada antes de executar novamente ou tentar qualquer rollback.

---

# 54. Database Locking

Migrations podem gerar locks dependendo das operações realizadas.

Isso pode afetar:

- requests;
- writes;
- reads;
- performance;
- disponibilidade.

Alterações de schema potencialmente pesadas devem ser avaliadas antes da execução em produção.

Quando necessário, mudanças podem ser divididas em etapas menores.

---

# 55. Performance durante Deployment

O deployment pode temporariamente aumentar:

- CPU;
- memória;
- IO;
- database connections;
- network traffic.

Isso é especialmente relevante em um VPS com recursos limitados.

A infraestrutura deve ser observada durante releases que envolvem builds ou migrations significativas.

---

# 56. Resource Constraints

Containers podem competir pelos recursos disponíveis no host.

Em um ambiente pequeno, uma configuração inadequada pode fazer:

```text
Build
  │
  ▼
CPU / RAM pressure
  │
  ▼
Application degradation
```

Por isso, a infraestrutura deve considerar:

- memória;
- CPU;
- disk space;
- Docker images;
- logs;
- PostgreSQL;
- Redis.

Limpeza e monitoramento operacional fazem parte da manutenção do ambiente.

---

# 57. Disk Usage

O host de produção pode acumular:

- Docker images;
- stopped containers;
- build cache;
- logs;
- PostgreSQL data;
- backups.

O crescimento do armazenamento deve ser monitorado.

Operações automáticas de limpeza devem ser utilizadas com cuidado, especialmente quando podem afetar imagens necessárias ou dados persistentes.

---

# 58. Deployment Frequency

A frequência de deployment deve acompanhar a maturidade do sistema.

Não existe necessidade de esperar grandes conjuntos de mudanças para cada release.

Deployments menores tendem a facilitar:

- investigação;
- rollback;
- identificação de regressões;
- revisão;
- rastreabilidade.

Por outro lado, mudanças de infraestrutura ou schema podem justificar releases mais controladas.

---

# 59. Release Notes

Mudanças relevantes devem ser registradas no histórico do projeto.

O `CHANGELOG.md` pode ser utilizado para registrar:

- novas funcionalidades;
- correções;
- mudanças de comportamento;
- mudanças de API;
- mudanças de infraestrutura;
- alterações importantes de segurança.

Isso cria uma camada adicional de rastreabilidade entre código e releases.

---

# 60. Documentation as Part of Deployment

Uma alteração operacional relevante deve atualizar sua documentação correspondente.

Exemplos:

```text
Docker change
    → operations/docker.md

Deployment change
    → operations/deployment.md

Nginx change
    → operations/nginx.md

Migration change
    → database/migrations.md

API change
    → api/*
```

A documentação deve acompanhar a evolução real do sistema.

---

# 61. Environment Separation

Desenvolvimento e produção devem permanecer separados.

Nunca se deve assumir que:

```text
development database
=
production database
```

ou:

```text
development secrets
=
production secrets
```

Cada ambiente deve possuir suas próprias configurações e credenciais.

Essa separação é essencial para evitar operações acidentais no ambiente de produção.

---

# 62. Production Parity

Embora desenvolvimento e produção possam possuir diferenças, elas devem permanecer suficientemente próximas nos aspectos relevantes.

Particularmente:

- Python version;
- dependency versions;
- PostgreSQL;
- Redis;
- Docker;
- environment configuration;
- reverse proxy;
- authentication behavior.

Quanto maior a diferença entre os ambientes, maior a chance de um comportamento funcionar localmente e falhar em produção.

---

# 63. Deployment Checklist Simplificado

Para uma release comum:

```text
1. Implementar alteração
2. Executar testes localmente
3. Executar Ruff
4. Criar migration se necessário
5. Commitar
6. Push para GitHub
7. GitHub Actions executar CI
8. Corrigir qualquer falha
9. Deployment via SSH
10. Atualizar containers
11. Executar migrations quando necessário
12. Verificar health endpoint
13. Verificar logs
14. Testar fluxo crítico
15. Confirmar disponibilidade
16. Registrar release
```

---

# 64. Estado atual

O Exactum atualmente possui um processo de deployment baseado em:

- GitHub;
- GitHub Actions;
- SSH;
- VPS Linux;
- Docker;
- Docker Compose;
- PostgreSQL;
- Redis;
- Nginx.

O CI executa validações automatizadas antes do processo de deployment.

A aplicação é atualizada no VPS através do pipeline automatizado, reduzindo a necessidade de operações manuais repetitivas.

O banco utiliza migrations para evolução do schema.

A infraestrutura de produção permanece deliberadamente simples, adequada ao estágio atual do projeto e ao objetivo de manter controle operacional sobre o sistema.

---

# 65. Evolução planejada

Conforme o Exactum evoluir, o processo de deployment poderá incorporar:

- container registry;
- image tagging;
- immutable deployments;
- automated rollback;
- deployment health gates;
- staging environment;
- preview environments;
- automated smoke tests;
- blue/green deployment;
- rolling deployment;
- graceful shutdown;
- Celery workers;
- RabbitMQ;
- centralized secrets management;
- OpenTelemetry;
- Prometheus;
- Grafana;
- infrastructure as code;
- backup automation;
- disaster recovery procedures.

Essas evoluções devem ser introduzidas conforme a complexidade e necessidade operacional do sistema justificarem.

---

# 66. Relação com a arquitetura geral

Deployment representa a ponte entre o código versionado e o sistema efetivamente executado.

```text
Source Code
    │
    ▼
CI
    │
    ▼
Artifact / Runtime
    │
    ▼
Deployment
    │
    ▼
Infrastructure
    │
    ▼
Running System
```

A aplicação pode possuir uma arquitetura interna bem definida, mas isso não garante automaticamente um processo de operação confiável.

Por isso, deployment é tratado como parte da engenharia do sistema.

---

# 67. Princípios arquiteturais

O processo de deployment do Exactum segue os seguintes princípios:

### Automated Where Safe

Automatizar operações repetitivas sem remover controles necessários.

### Explicit Where Risky

Operações potencialmente destrutivas devem exigir maior controle.

### Reproducible

O deployment deve poder ser repetido de maneira previsível.

### Traceable

Toda alteração deve possuir relação com uma versão ou commit.

### Observable

O ambiente deve permitir verificar o resultado do deployment.

### Recoverable

Falhas devem possuir caminhos conhecidos de recuperação.

### Compatible

Mudanças de aplicação e banco devem considerar compatibilidade durante a transição.

### Minimal Operational Complexity

A infraestrutura deve permanecer proporcional ao estágio e às necessidades do sistema.

---

# 68. Documentos relacionados

Este documento está relacionado principalmente a:

- `docs/operations/development.md`
- `docs/operations/docker.md`
- `docs/operations/nginx.md`
- `docs/operations/runbook.md`
- `docs/database/migrations.md`
- `docs/database/schema.md`
- `docs/observability/overview.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/correlation.md`
- `docs/security/overview.md`
- `docs/security/authentication.md`
- `docs/security/session-management.md`
- `docs/api/authentication.md`
- `docs/api/versioning.md`

---

# 69. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites operacionais e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação atual.

Por exemplo:

- `actor` representa conceitualmente quem originou uma ação, podendo ser representado atualmente por `user_uuid`;
- `tenant` representa conceitualmente o contexto organizacional, podendo ser representado atualmente por `tenant_uuid`;
- `resource` representa conceitualmente um recurso da API, como um produto, venda ou usuário;
- `deployment` representa conceitualmente o processo de disponibilização de uma versão, independentemente da implementação específica utilizada pelo pipeline.

Essa distinção permite documentar responsabilidades e conceitos arquiteturais sem limitar sua definição à implementação atual.

O processo de deployment também poderá evoluir conforme a infraestrutura e a arquitetura do Exactum cresçam. Novos ambientes, workers, mecanismos de rollout, observabilidade e automação poderão ser introduzidos conforme necessidades reais surgirem.

Portanto, este documento deve ser interpretado como uma representação do **processo operacional atual e de sua direção de evolução**, e não como uma especificação imutável da infraestrutura futura do Exactum.
