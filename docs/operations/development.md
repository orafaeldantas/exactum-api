# Development Environment

## 1. Objetivo

O ambiente de desenvolvimento do Exactum fornece a estrutura necessária para executar, testar e evoluir a aplicação localmente de forma consistente.

Este documento descreve:

- requisitos do ambiente;
- ferramentas utilizadas;
- estrutura de execução local;
- configuração da API;
- configuração do frontend;
- PostgreSQL;
- Redis;
- Docker;
- variáveis de ambiente;
- database migrations;
- execução de testes;
- linting;
- desenvolvimento iterativo;
- troubleshooting;
- integração com Git;
- diferenças entre desenvolvimento e produção;
- práticas para manter o ambiente reproduzível.

O objetivo é reduzir diferenças entre ambientes e tornar o processo de desenvolvimento previsível para colaboradores atuais e futuros.

---

## 2. Development Stack

O ambiente de desenvolvimento do Exactum utiliza principalmente:

```text
Backend
├── Python
├── Flask
├── SQLAlchemy
├── Alembic / Flask-Migrate
├── Marshmallow
└── Flask-Smorest

Database
├── PostgreSQL
└── Redis

Frontend
├── React
├── Vite
└── Tailwind CSS

Tooling
├── Git
├── uv
├── Ruff
└── Pytest

Infrastructure
├── Docker
├── Docker Compose
└── Nginx
```

As versões exatas utilizadas pelo projeto devem ser obtidas a partir dos arquivos de configuração e manifests versionados no repositório.

---

## 3. Development Environment

O desenvolvimento pode ser realizado diretamente no sistema operacional ou utilizando containers, dependendo da necessidade.

Uma representação comum é:

```text
Developer Machine
       │
       ├── Backend
       │
       ├── Frontend
       │
       ├── PostgreSQL
       │
       └── Redis
```

Docker pode ser utilizado para padronizar principalmente os serviços de infraestrutura.

---

## 4. Source Repository

O código fonte do Exactum é versionado utilizando Git.

O repositório principal do backend é:

```text
https://github.com/orafaeldantas/exactum-api
```

O repositório deve ser clonado antes da configuração do ambiente.

Exemplo:

```bash id="6up3pj"
git clone <repository>
cd exactum-api
```

O endereço efetivo do repositório deve ser obtido da configuração atual do projeto caso seja necessário reproduzir o ambiente.

---

## 5. Operating System

O Exactum pode ser desenvolvido em sistemas compatíveis com as ferramentas utilizadas pelo projeto.

O ambiente de desenvolvimento deve fornecer suporte adequado para:

- Python;
- Node.js;
- Docker;
- Git;
- PostgreSQL;
- Redis.

Linux é particularmente adequado ao ambiente utilizado em produção e ao tooling de infraestrutura do projeto.

---

## 6. Python

O backend utiliza Python.

A versão principal atualmente adotada pelo projeto deve ser mantida consistente entre:

- desenvolvimento;
- testes;
- CI;
- produção.

O ambiente local deve utilizar a versão compatível especificada pelo projeto.

Exemplo:

```bash id="h7j0d9"
python --version
```

A versão efetivamente utilizada deve corresponder à configuração versionada do projeto.

---

## 7. uv

O projeto utiliza `uv` como ferramenta de gerenciamento do ambiente Python e dependências.

Responsabilidades incluem:

- criação do ambiente virtual;
- resolução de dependências;
- instalação;
- execução de comandos;
- reprodutibilidade do ambiente.

Conceitualmente:

```text
pyproject.toml
      │
      ▼
     uv
      │
      ▼
Virtual Environment
      │
      ▼
Python Application
```

---

## 8. Virtual Environment

O backend deve ser executado dentro de um ambiente Python isolado.

Isso evita conflitos entre dependências do Exactum e pacotes instalados globalmente no sistema.

Conceitualmente:

```text
System Python
     │
     ├── unrelated projects
     │
     └── Exactum environment
             │
             └── project dependencies
```

---

## 9. Dependency Management

As dependências do backend devem ser declaradas nos arquivos de configuração do projeto.

O objetivo é evitar dependências implícitas.

Uma máquina nova deve conseguir reproduzir o ambiente a partir dos arquivos versionados.

Exemplo conceitual:

```text
Project Configuration
        │
        ▼
Dependency Resolution
        │
        ▼
Installed Environment
```

---

## 10. Node.js

O frontend React utiliza o ecossistema Node.js.

O ambiente deve possuir uma versão compatível com a configuração do frontend.

A versão deve ser mantida consistente entre desenvolvimento e CI sempre que possível.

---

## 11. Frontend Dependencies

As dependências do frontend devem ser instaladas a partir dos manifests versionados.

O processo conceitual é:

```text
package.json
package-lock / lockfile
        │
        ▼
Package Manager
        │
        ▼
node_modules
```

O lockfile deve ser preservado no repositório quando utilizado pelo projeto.

---

## 12. Environment Variables

Configurações dependentes do ambiente devem ser fornecidas por environment variables ou mecanismos equivalentes.

Exemplos conceituais:

```text
DATABASE_URL
REDIS_URL
JWT configuration
CORS configuration
Application environment
Logging configuration
```

Os nomes exatos devem seguir a configuração real da aplicação.

---

## 13. Secrets

Secrets não devem ser commitados no Git.

Exemplos:

- database passwords;
- JWT secrets;
- API credentials;
- private keys;
- external service credentials.

O repositório deve conter apenas valores seguros para desenvolvimento ou exemplos sem credenciais reais.

---

## 14. `.env`

Um arquivo `.env` pode ser utilizado localmente quando suportado pela aplicação.

Exemplo conceitual:

```env id="q6qv29"
DATABASE_URL=...
REDIS_URL=...
SECRET_KEY=...
```

O arquivo contendo credenciais reais deve permanecer fora do versionamento quando apropriado.

Um arquivo de exemplo pode documentar as variáveis necessárias:

```text
.env.example
```

---

## 15. Configuration by Environment

A configuração deve distinguir pelo menos:

```text
development
testing
production
```

Cada ambiente pode possuir:

- database diferente;
- Redis diferente;
- logging diferente;
- CORS diferente;
- security settings diferentes;
- external services diferentes.

O código da aplicação deve evitar depender de condições específicas da máquina do desenvolvedor.

---

## 16. Local PostgreSQL

O PostgreSQL é o database relacional principal do Exactum.

Em desenvolvimento, pode ser executado:

```text
Local PostgreSQL
```

ou:

```text
Docker PostgreSQL
```

O uso de Docker facilita a reprodução do ambiente.

---

## 17. PostgreSQL Container

Uma representação típica é:

```text
Docker Compose
     │
     └── PostgreSQL
            │
            ▼
        Exactum API
```

O banco utilizado no desenvolvimento deve ser isolado do banco de produção.

---

## 18. Database Initialization

Após iniciar PostgreSQL, a aplicação deve possuir um database compatível com sua configuração.

Exemplo conceitual:

```text
PostgreSQL
   │
   └── exactum_dev
```

O nome real deve seguir as configurações do projeto.

---

## 19. Redis

Redis é utilizado pelo Exactum para estado operacional e funcionalidades como:

- refresh sessions;
- session management;
- revocation;
- cache quando aplicável;
- outros estados temporários.

No desenvolvimento, Redis pode ser executado localmente ou via Docker.

---

## 20. Redis Container

Arquitetura local:

```text
Docker Compose
     │
     ├── PostgreSQL
     │
     └── Redis
```

A API se conecta aos dois serviços.

---

## 21. Backend Startup

A API Flask deve ser executada utilizando o mecanismo definido pelo projeto.

O processo conceitual é:

```text
Python Environment
       │
       ▼
Flask Application
       │
       ├── PostgreSQL
       └── Redis
```

Os comandos exatos devem seguir os scripts e configurações atuais do repositório.

---

## 22. Frontend Startup

O frontend React é executado em modo de desenvolvimento utilizando Vite.

Conceitualmente:

```text
React
  │
  ▼
Vite Dev Server
  │
  ▼
Browser
```

O frontend se comunica com a API backend utilizando a configuração de desenvolvimento correspondente.

---

## 23. API and Frontend

Durante desenvolvimento, frontend e backend podem executar em processos separados.

Exemplo:

```text
Browser
   │
   ▼
Vite
   │
   │ API Requests
   ▼
Flask
   │
   ├── PostgreSQL
   └── Redis
```

Essa separação facilita desenvolvimento independente das duas camadas.

---

## 24. Vite Proxy

Quando configurado, o Vite pode atuar como proxy para requests da API.

Isso permite manter uma estrutura semelhante a:

```text
Browser
   │
   ▼
Vite
   │
   └── /api
          │
          ▼
       Flask
```

A configuração efetiva deve ser mantida no arquivo de configuração do frontend.

---

## 25. HttpOnly Cookies in Development

A autenticação do Exactum utiliza HttpOnly cookies.

Portanto, o frontend não deve acessar diretamente o JWT.

O fluxo é:

```text
Login
  │
  ▼
Flask
  │
  ├── Access Cookie
  └── Refresh Cookie
```

O browser gerencia os cookies.

O frontend realiza requests com as credenciais configuradas para permitir o envio dos cookies.

---

## 26. Authentication Development Flow

Conceitualmente:

```text
Browser
   │
   │ POST /auth/login
   ▼
Flask
   │
   ├── authenticate
   ├── create session
   └── set cookies
   │
   ▼
Browser
```

Posteriormente:

```text
Browser
   │
   │ authenticated request
   ▼
Flask
   │
   └── HttpOnly Cookie
```

O frontend não precisa decodificar o JWT.

---

## 27. Refresh Sessions

O refresh token é associado ao gerenciamento de sessão operacional.

Redis pode manter informações relacionadas ao JTI e ao estado da sessão.

Conceitualmente:

```text
Refresh Cookie
      │
      ▼
JWT JTI
      │
      ▼
Redis Session
      │
      ├── user
      ├── tenant
      └── session state
```

Esse fluxo deve ser preservado também no ambiente de desenvolvimento.

---

## 28. Database Migrations

Antes de executar a aplicação sobre um database novo ou atualizado, as migrations devem estar aplicadas.

Fluxo:

```text
Repository
    │
    ▼
Alembic / Flask-Migrate
    │
    ▼
PostgreSQL
```

O ambiente local deve utilizar o mesmo mecanismo oficial de migrations utilizado no projeto.

---

## 29. Fresh Database

Para testar um ambiente limpo, pode ser necessário utilizar um database vazio.

Fluxo:

```text
Empty PostgreSQL
       │
       ▼
Run migrations
       │
       ▼
Current Schema
```

Isso também ajuda a detectar dependências acidentais de alterações manuais.

---

## 30. Seed Data

Dados iniciais podem ser necessários para desenvolvimento.

Exemplos:

- development users;
- roles;
- permissions;
- sample tenant;
- sample products.

Seed data deve ser distinguido de migrations estruturais.

```text
Migration
→ schema evolution

Seed
→ development data
```

---

## 31. Production Data Must Not Be Used Locally

Dados reais de produção não devem ser copiados indiscriminadamente para o ambiente local.

Isso reduz riscos relacionados a:

- secrets;
- personal data;
- customer data;
- credentials;
- tenant information;
- compliance;
- accidental modification.

Quando dados reais forem necessários para troubleshooting, devem existir processos controlados de sanitization e access.

---

## 32. Development Database

O database de desenvolvimento deve ser descartável quando necessário.

Isso facilita:

- recriação do ambiente;
- testes de migrations;
- reprodução de bugs;
- limpeza de dados;
- desenvolvimento de features.

Conceitualmente:

```text
Destroy
   │
   ▼
Create
   │
   ▼
Migrate
   │
   ▼
Seed
```

---

## 33. Docker Compose

Docker Compose pode ser utilizado para orquestrar serviços locais.

Exemplo conceitual:

```text
docker compose
      │
      ├── exactum_api
      ├── postgres
      └── redis
```

Dependendo do fluxo de desenvolvimento, frontend pode executar fora do Compose utilizando o Vite.

---

## 34. Service Dependencies

A API depende de serviços de infraestrutura.

Conceitualmente:

```text
exactum_api
    │
    ├── PostgreSQL
    └── Redis
```

O frontend depende da disponibilidade da API para operações que exigem backend.

---

## 35. Health Checks

A API possui mecanismos de health checking para verificar dependências relevantes.

Conceitualmente:

```text
Health Endpoint
      │
      ├── Application
      ├── PostgreSQL
      └── Redis
```

Isso ajuda a identificar rapidamente problemas de infraestrutura local.

---

## 36. Local Troubleshooting

Quando a API não inicia, a investigação deve começar pelas dependências.

Checklist:

```text
[ ] PostgreSQL running
[ ] Redis running
[ ] DATABASE_URL correct
[ ] REDIS_URL correct
[ ] environment variables loaded
[ ] migrations applied
[ ] dependencies installed
[ ] Python version compatible
[ ] port available
```

---

## 37. PostgreSQL Troubleshooting

Problemas comuns:

```text
connection refused
authentication failed
database does not exist
migration failure
port already in use
```

A investigação deve verificar:

```text
Application
   │
   ▼
DATABASE_URL
   │
   ▼
PostgreSQL
   │
   └── Database
```

---

## 38. Redis Troubleshooting

Problemas comuns:

```text
connection refused
wrong Redis URL
authentication issue
wrong port
stale session state
```

Em desenvolvimento, Redis state pode ser limpo quando necessário para reproduzir cenários de autenticação.

---

## 39. Ports

Serviços locais devem utilizar portas configuradas no projeto.

Conceitualmente:

```text
Frontend
   │
   └── development port

Backend
   │
   └── API port

PostgreSQL
   │
   └── database port

Redis
   │
   └── Redis port
```

Conflitos de portas devem ser resolvidos no ambiente local sem alterar arbitrariamente os contratos utilizados pelo projeto.

---

## 40. CORS

O desenvolvimento pode utilizar uma origem diferente da produção.

Por exemplo:

```text
Frontend
→ localhost:<frontend-port>

API
→ localhost:<api-port>
```

A configuração de CORS deve permitir apenas as origins necessárias.

Não é recomendável utilizar permissões excessivamente amplas apenas para facilitar o desenvolvimento.

---

## 41. Cookies and CORS

Como a autenticação utiliza cookies, desenvolvimento deve considerar:

- origin;
- credentials;
- cookie attributes;
- SameSite;
- Secure;
- CORS.

O frontend deve enviar requests com credenciais quando necessário.

---

## 42. CSRF

HttpOnly cookies protegem o conteúdo do token contra acesso direto via JavaScript, mas não eliminam o problema de CSRF.

O Exactum atualmente possui essa distinção documentada:

```text
HttpOnly
≠
CSRF Protection
```

A ausência de uma estratégia explícita de CSRF deve ser tratada como uma preocupação de segurança conhecida e não como uma propriedade automática dos cookies.

---

## 43. Debugging

Durante desenvolvimento, debugging deve ocorrer preferencialmente utilizando:

- logs;
- debugger;
- testes;
- reproduções locais;
- inspection de requests;
- database inspection.

Não se deve introduzir temporariamente mecanismos de debugging que alterem permanentemente o comportamento de produção.

---

## 44. Structured Logging

A aplicação utiliza uma estratégia de logging estruturado e contextual.

Durante desenvolvimento, logs podem ajudar a acompanhar:

```text
request_id
method
path
status_code
duration
user
tenant
exception
```

O nível de detalhe pode ser maior em desenvolvimento do que em produção, desde que informações sensíveis sejam protegidas.

---

## 45. Request Correlation

Requests devem manter seu `request_id` para facilitar troubleshooting.

Conceitualmente:

```text
Browser
   │
   ▼
API Request
   │
   ├── request_id
   │
   ├── logs
   ├── audit
   └── events
```

Isso permite acompanhar uma operação de ponta a ponta.

---

## 46. Swagger / OpenAPI

O backend disponibiliza documentação OpenAPI/Swagger.

Durante desenvolvimento, essa documentação pode ser utilizada para:

- testar endpoints;
- verificar schemas;
- validar responses;
- explorar authentication;
- reproduzir requests;
- conferir contratos.

A autenticação baseada em cookies deve ser considerada ao utilizar o Swagger UI.

---

## 47. API Testing During Development

Uma feature backend deve ser validada em diferentes níveis:

```text
Unit Tests
     │
     ▼
Application Logic
     │
     ▼
Integration Tests
     │
     ▼
API
```

Quando necessário, testes manuais pelo Swagger ou ferramentas HTTP podem complementar os testes automatizados.

---

## 48. Pytest

O projeto utiliza Pytest para testes automatizados.

O ambiente de desenvolvimento deve permitir executar a suíte de testes localmente antes de abrir um Pull Request ou realizar merge.

Conceitualmente:

```text
Code Change
    │
    ▼
Pytest
    │
    ▼
Pass / Fail
```

---

## 49. Test Database

Testes que interagem com PostgreSQL devem utilizar um database de teste isolado.

O database de teste não deve compartilhar estado operacional com:

```text
development
```

ou:

```text
production
```

Isso reduz risco de corrupção e resultados não determinísticos.

---

## 50. Redis During Tests

Testes que dependem de Redis devem utilizar um estado isolado.

Especialmente em testes de:

- authentication;
- refresh;
- revocation;
- sessions;
- impersonation.

Estado residual entre testes pode produzir falsos resultados.

---

## 51. Ruff

Ruff é utilizado para linting e qualidade do código Python.

O processo de desenvolvimento deve incluir:

```text
Code
  │
  ▼
Ruff
  │
  ▼
Issues
```

O objetivo é detectar:

- erros;
- imports;
- problemas de estilo;
- padrões inadequados;
- problemas estáticos suportados pela configuração do projeto.

---

## 52. Formatting

A formatação do código deve seguir a configuração oficial do projeto.

Não devem existir estilos conflitantes entre:

```text
Developer Machine
CI
Repository
```

A configuração versionada é a referência.

---

## 53. Git Workflow

O desenvolvimento deve ocorrer em branches apropriadas.

Fluxo conceitual:

```text
main
 │
 ├── feature/...
 ├── fix/...
 └── refactor/...
```

O nome das branches deve seguir as convenções utilizadas pelo projeto.

---

## 54. Small Changes

Mudanças devem preferencialmente ser pequenas e coerentes.

Um change set pode conter:

```text
feature
+
tests
+
documentation
+
migration
```

quando esses elementos forem parte da mesma mudança.

Evita-se misturar alterações sem relação clara.

---

## 55. Refactoring

Refactors devem preservar comportamento quando não houver mudança funcional intencional.

Uma estratégia útil é:

```text
Before
  │
  ▼
Tests
  │
  ▼
Refactor
  │
  ▼
Tests
  │
  ▼
After
```

Isso reduz o risco de introduzir regressões durante reorganizações arquiteturais.

---

## 56. Architecture Changes

Mudanças arquiteturais maiores devem ser acompanhadas pela documentação correspondente.

Exemplo:

```text
Code Change
    │
    ├── Architecture
    ├── Domain Boundary
    ├── Security
    └── Database
```

Quando uma alteração muda uma decisão arquitetural importante, um ADR pode ser apropriado.

---

## 57. Documentation During Development

Documentação não deve ser deixada exclusivamente para o final do projeto.

Mudanças relevantes devem atualizar:

- architecture docs;
- API docs;
- security docs;
- database docs;
- operations docs;
- testing docs.

Isso mantém documentação e implementação alinhadas.

---

## 58. Development Lifecycle

Um ciclo de desenvolvimento típico pode ser:

```text
Requirement
    │
    ▼
Design
    │
    ▼
Implementation
    │
    ▼
Tests
    │
    ▼
Lint
    │
    ▼
Documentation
    │
    ▼
Review
    │
    ▼
Merge
```

Quando houver alteração de schema:

```text
Migration
```

também faz parte do change set.

---

## 59. Local Feature Workflow

Exemplo:

```text
1. Create branch
2. Understand requirement
3. Define behavior
4. Implement backend
5. Implement frontend if required
6. Add/update tests
7. Create migration if required
8. Run Ruff
9. Run Pytest
10. Test manually when useful
11. Update documentation
12. Review diff
13. Commit
```

---

## 60. Database Inspection

Durante desenvolvimento, ferramentas como PostgreSQL clients podem ser utilizadas para inspecionar:

- tables;
- indexes;
- constraints;
- rows;
- migrations;
- query results.

Alterações estruturais, entretanto, devem continuar sendo realizadas por migrations.

Ferramentas de inspeção não substituem o versionamento do schema.

---

## 61. DBeaver

Um database client como DBeaver pode ser utilizado para:

- visualizar o schema;
- executar queries;
- inspecionar indexes;
- analisar relacionamentos;
- investigar dados locais;
- acompanhar migrations.

Deve ser utilizado principalmente como ferramenta de inspeção e desenvolvimento.

Alterações permanentes de schema devem ser refletidas nas migrations.

---

## 62. Raw SQL During Development

Queries SQL manuais podem ser úteis para:

- investigar problemas;
- validar índices;
- testar hipóteses;
- analisar dados;
- verificar performance.

Entretanto, alterações estruturais realizadas manualmente não devem permanecer como estado não versionado.

---

## 63. Query Performance

Quando uma query apresenta problemas de performance, o desenvolvimento pode utilizar ferramentas do PostgreSQL como:

```sql id="t1z3me"
EXPLAIN
EXPLAIN ANALYZE
```

para investigar:

- sequential scans;
- index scans;
- joins;
- cardinalidade;
- custo estimado;
- tempo de execução.

A otimização deve ser baseada em evidência da query real.

---

## 64. Reproducing Bugs

Um bug deve, sempre que possível, ser reduzido a uma reprodução local.

Fluxo:

```text
Production / Reported Issue
          │
          ▼
Reproduction
          │
          ▼
Local Environment
          │
          ▼
Test
          │
          ▼
Fix
          │
          ▼
Regression Test
```

Adicionar um regression test reduz a chance de o problema retornar.

---

## 65. Authentication Bug Reproduction

Problemas relacionados à autenticação podem exigir inspeção de:

```text
Browser
 │
 ├── cookies
 └── requests
      │
      ▼
API
 │
 ├── JWT
 ├── session
 └── Redis
```

O conteúdo sensível dos tokens não deve ser exposto em logs ou documentação.

---

## 66. Impersonation Development

O fluxo de impersonation deve ser testado considerando:

```text
Super Admin
     │
     ▼
Impersonate
     │
     ▼
Target User
     │
     ▼
Stop Impersonation
     │
     ▼
Original Super Admin
```

Como os JWTs estão em HttpOnly cookies, o frontend não deve depender de decodificação dos tokens para determinar o estado de impersonation.

A API deve fornecer o estado necessário ao frontend de forma explícita.

---

## 67. Tenant Development

Features tenant-scoped devem ser testadas utilizando pelo menos dois tenants quando a regra de isolamento for relevante.

Exemplo:

```text
Tenant A
├── User A
└── Product A

Tenant B
├── User B
└── Product B
```

Uma request autenticada como Tenant A não deve acessar dados de Tenant B.

---

## 68. Development Security

Mesmo no ambiente local:

- secrets reais devem ser evitados;
- production credentials não devem ser reutilizadas;
- dados sensíveis devem ser protegidos;
- CORS deve ser restritivo;
- endpoints administrativos devem continuar protegidos;
- tenant isolation deve permanecer funcional.

“É apenas desenvolvimento” não deve ser utilizado como justificativa para introduzir padrões inseguros que possam posteriormente chegar à produção.

---

## 69. Production Parity

O ambiente local não precisa ser idêntico à produção em todos os detalhes.

Entretanto, conceitos importantes devem permanecer equivalentes:

```text
PostgreSQL
Redis
Migrations
Authentication
Configuration model
Application architecture
```

Diferenças inevitáveis devem ser explicitamente configuradas por ambiente.

---

## 70. Development vs Production

| Aspecto    | Development             | Production                 |
| ---------- | ----------------------- | -------------------------- |
| Debug      | Pode ser habilitado     | Desabilitado               |
| Logs       | Maior detalhamento      | Controlados                |
| Database   | Local/isolado           | PostgreSQL de produção     |
| Redis      | Local/isolado           | Redis de produção          |
| Secrets    | Desenvolvimento         | Secrets protegidos         |
| CORS       | Origins locais          | Origins oficiais           |
| Frontend   | Vite dev server         | Build + Nginx              |
| API        | Flask development setup | Container/production setup |
| Data       | Synthetic/test data     | Real                       |
| Deployment | Manual/local            | CI/CD                      |

---

## 71. Docker Development

Docker pode fornecer um ambiente consistente para:

```text
PostgreSQL
Redis
API
```

quando necessário.

O objetivo não é obrigar todos os fluxos de desenvolvimento a utilizar containers, mas facilitar reprodução e isolamento.

---

## 72. Container Volumes

Serviços stateful podem utilizar volumes para preservar dados locais entre reinicializações.

Por exemplo:

```text
PostgreSQL Container
       │
       ▼
Persistent Volume
```

Entretanto, volumes de desenvolvimento podem ser descartados quando for necessário recriar completamente o ambiente.

---

## 73. Reset Development Environment

Quando o ambiente local estiver inconsistente, uma estratégia possível é reconstruí-lo.

Conceitualmente:

```text
Stop Services
     │
     ▼
Remove Development State
     │
     ▼
Start Services
     │
     ▼
Run Migrations
     │
     ▼
Seed
```

Essa operação deve ser realizada somente sobre ambientes locais.

Nunca deve ser utilizada indiscriminadamente em produção.

---

## 74. Dependency Updates

Atualizações de dependências devem ser tratadas como mudanças de código.

Antes de atualizar:

```text
Dependency N
```

para:

```text
Dependency N+1
```

deve-se avaliar:

- breaking changes;
- security advisories;
- compatibility;
- tests;
- migration requirements.

---

## 75. Security Updates

Dependências relacionadas a:

- authentication;
- cryptography;
- HTTP;
- database drivers;
- framework;

merecem atenção especial quando atualizadas.

Atualizações de segurança devem ser aplicadas de forma controlada e testadas.

---

## 76. CI Consistency

O ambiente local deve tentar reproduzir as mesmas verificações executadas pelo CI.

Exemplo:

```text
Local
├── Ruff
├── Pytest
└── Migration checks

CI
├── Ruff
├── Pytest
└── Migration checks
```

Quanto maior a equivalência, menor a chance de uma mudança funcionar localmente e falhar no CI.

---

## 77. Pre-Commit Validation

Antes de abrir um Pull Request ou mergear uma mudança, recomenda-se validar:

```text
[ ] Git diff reviewed
[ ] Ruff passes
[ ] Tests pass
[ ] Migrations reviewed
[ ] Documentation updated
[ ] No secrets committed
[ ] Environment-specific files ignored
```

---

## 78. `.gitignore`

Arquivos locais e temporários devem ser ignorados pelo Git quando apropriado.

Exemplos:

```text
.env
.venv/
__pycache__/
node_modules/
coverage/
local databases
IDE files
```

Os padrões efetivos devem seguir o `.gitignore` atual do projeto.

---

## 79. IDE Configuration

Configurações específicas de IDE podem existir localmente, mas não devem alterar o comportamento esperado do projeto.

Ferramentas diferentes devem respeitar:

- Python version;
- formatter;
- linter;
- test runner;
- environment variables;
- project structure.

---

## 80. Shell Commands

Comandos utilizados para desenvolvimento devem preferencialmente estar documentados ou ser reproduzíveis a partir dos arquivos do projeto.

Isso reduz dependência de conhecimento tribal.

Quando scripts forem utilizados, devem possuir nomes claros e responsabilidades bem definidas.

---

## 81. Development Documentation

Este documento deve permanecer como ponto de entrada para a configuração do ambiente local.

Detalhes específicos podem estar documentados em:

- `docs/operations/docker.md`
- `docs/operations/nginx.md`
- `docs/database/migrations.md`
- `docs/testing/strategy.md`
- `docs/testing/ci.md`

---

## 82. Current State

O ambiente de desenvolvimento do Exactum é baseado em:

```text
Python
Flask
PostgreSQL
Redis
React
Vite
Docker
Git
uv
Pytest
Ruff
```

O backend utiliza PostgreSQL e Redis, enquanto o frontend utiliza React/Vite.

O projeto possui database migrations versionadas e testes automatizados.

A infraestrutura de produção utiliza Docker, Nginx, GitHub Actions e VPS, enquanto o desenvolvimento local pode utilizar uma combinação de processos locais e containers.

---

## 83. Known Evolution Points

O ambiente de desenvolvimento poderá evoluir conforme o Exactum amadureça.

Possíveis evoluções:

- Dev Containers;
- ambientes totalmente containerizados;
- scripts de bootstrap;
- Makefile ou task runner;
- fixtures/seed data mais completos;
- ambientes efêmeros;
- testes de integração automatizados;
- observabilidade local;
- OpenTelemetry;
- Celery;
- RabbitMQ;
- ferramentas de profiling;
- ambientes de staging mais próximos da produção.

Essas possibilidades devem ser adotadas conforme trouxerem valor real ao fluxo de desenvolvimento.

---

## 84. Design Principles

O ambiente de desenvolvimento segue alguns princípios:

### 1. Reprodutibilidade

Outro desenvolvedor deve conseguir reconstruir o ambiente utilizando os arquivos versionados.

### 2. Isolamento

Development, testing e production devem permanecer separados.

### 3. Segurança

Secrets e dados reais não devem ser expostos desnecessariamente.

### 4. Paridade

Conceitos críticos devem permanecer próximos aos utilizados em produção.

### 5. Automação

O máximo possível do processo deve ser reproduzível por comandos e ferramentas versionadas.

### 6. Observabilidade

Logs e ferramentas de diagnóstico devem facilitar a investigação de problemas.

### 7. Testabilidade

O ambiente deve permitir executar a suíte de testes de forma confiável.

### 8. Evolução incremental

A complexidade do ambiente deve crescer conforme as necessidades do sistema.

---

## 85. Related Documentation

Este documento se relaciona diretamente com:

- `docs/operations/docker.md`
- `docs/operations/deployment.md`
- `docs/operations/nginx.md`
- `docs/operations/runbook.md`
- `docs/database/schema.md`
- `docs/database/migrations.md`
- `docs/database/soft-delete.md`
- `docs/testing/strategy.md`
- `docs/testing/ci.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/observability/overview.md`
- `docs/api/overview.md`

---

## 86. Naming and Architectural Evolution

Alguns termos utilizados neste documento representam conceitos de ambiente e arquitetura, não necessariamente nomes literais presentes no código.

Por exemplo:

- `development environment` representa o conjunto de ferramentas e serviços necessários para desenvolver o sistema;
- `application` pode representar o backend Flask ou o sistema como um todo, dependendo do contexto;
- `database` representa o PostgreSQL utilizado pelo ambiente;
- `session state` pode representar dados persistidos ou operacionais relacionados à autenticação;
- `service` pode representar tanto um processo de infraestrutura quanto uma responsabilidade da camada de aplicação, dependendo do contexto.

Essa distinção permite manter a documentação conceitualmente clara sem exigir correspondência literal entre cada termo e uma classe, função, container ou arquivo específico.

### Observação sobre evolução

O ambiente descrito representa o **estado atual e a direção de evolução do Exactum**.

Conforme o projeto avance, o processo de desenvolvimento poderá incorporar novas ferramentas, automações e serviços. A adoção de Docker, Dev Containers, task runners, staging environments, observability tooling ou background workers poderá modificar a forma como o ambiente é inicializado sem alterar necessariamente os princípios fundamentais de isolamento, reprodutibilidade, segurança e paridade com produção.
