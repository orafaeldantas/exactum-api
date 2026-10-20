# Docker e Containerização

## Objetivo

O Exactum utiliza **Docker** como mecanismo de containerização para padronizar o ambiente de execução da aplicação, reduzir diferenças entre ambientes e simplificar o processo de desenvolvimento, deploy e operação.

A containerização também estabelece uma separação clara entre os principais componentes da aplicação, permitindo que backend, frontend, banco de dados e demais serviços de infraestrutura tenham ciclos de execução e configuração independentes.

No ambiente de produção, o Exactum é executado utilizando **Docker Compose**, com os serviços principais organizados em containers e conectados por uma network interna.

A arquitetura atual utiliza Docker em conjunto com:

- Flask para o backend;
- React/Vite para o frontend;
- PostgreSQL para persistência;
- Redis para estado temporário e session management;
- Nginx para servir o frontend e atuar como reverse proxy;
- GitHub Actions para CI/CD;
- VPS Linux para hospedagem.

Este documento descreve como esses componentes são organizados e operados através de Docker.

---

# 1. Papel do Docker no Exactum

Docker não é utilizado apenas para facilitar a instalação das dependências.

No Exactum, a containerização possui responsabilidades relacionadas a:

- isolamento de processos;
- padronização de ambientes;
- reprodução do ambiente de execução;
- gerenciamento dos serviços da aplicação;
- configuração de redes internas;
- persistência de dados através de volumes;
- separação entre aplicação e infraestrutura;
- simplificação do deploy;
- previsibilidade operacional.

A aplicação deixa de depender diretamente das características do sistema operacional hospedeiro para executar seus principais componentes.

O host fornece principalmente os recursos necessários para executar os containers, enquanto cada serviço mantém seu próprio ambiente de execução.

---

# 2. Visão geral da arquitetura

A estrutura simplificada do ambiente pode ser representada como:

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │    Nginx    │
                │  container  │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
      ┌──────────────┐   ┌──────────────┐
      │   Frontend   │   │    Flask     │
      │    React     │   │     API      │
      │   container  │   │   container  │
      └──────────────┘   └──────┬───────┘
                                 │
                         ┌───────┴────────┐
                         │                │
                         ▼                ▼
                  ┌─────────────┐  ┌─────────────┐
                  │ PostgreSQL  │  │    Redis    │
                  │  container  │  │  container  │
                  └─────────────┘  └─────────────┘
```

A comunicação entre os serviços ocorre através da Docker network definida pelo Compose.

O Nginx funciona como ponto de entrada HTTP/HTTPS da aplicação em produção, enquanto o backend acessa PostgreSQL e Redis através da rede interna.

---

# 3. Serviços containerizados

A configuração atual utiliza containers para os principais componentes da aplicação.

## 3.1 Backend

O backend do Exactum é executado em um container próprio.

Responsabilidades:

- executar a aplicação Flask;
- disponibilizar a REST API;
- processar autenticação e autorização;
- executar Application Services;
- acessar PostgreSQL;
- acessar Redis;
- executar migrations quando aplicável;
- gerar logs da aplicação;
- executar os mecanismos de observabilidade implementados.

O container do backend não deve assumir responsabilidades pertencentes ao host ou ao banco de dados.

---

## 3.2 Frontend

O frontend é construído utilizando React e Vite.

No ambiente de produção, o processo de build gera os arquivos estáticos que são disponibilizados através do Nginx.

A imagem de produção do frontend possui como objetivo principal fornecer os artefatos compilados da aplicação, evitando manter ferramentas de desenvolvimento desnecessárias no runtime final.

O frontend se comunica com a API através do endpoint público disponibilizado pelo Nginx.

---

## 3.3 PostgreSQL

O PostgreSQL é executado em um container separado.

Sua responsabilidade é fornecer a persistência relacional da aplicação.

O banco não deve ser tratado como parte descartável do ciclo de vida do container.

Por isso, seus dados são armazenados utilizando um **Docker volume** ou mecanismo equivalente de persistência.

A remoção ou recriação do container PostgreSQL não deve resultar automaticamente na perda dos dados persistidos.

---

## 3.4 Redis

O Redis é utilizado como infraestrutura de estado temporário e suporte operacional.

Entre seus usos atuais estão:

- refresh session management;
- armazenamento de estado relacionado a sessões;
- controle de revogação;
- dados temporários relacionados à autenticação;
- funcionalidades que dependem de acesso rápido a estado transitório.

Assim como o PostgreSQL, o Redis possui um container próprio.

Entretanto, a natureza dos dados armazenados é diferente.

Enquanto o PostgreSQL representa a persistência principal do sistema, o Redis contém principalmente estado operacional e temporário.

Portanto, as estratégias de persistência e recuperação podem ser diferentes entre os dois serviços.

---

## 3.5 Nginx

O Nginx atua como camada HTTP de entrada no ambiente de produção.

Entre suas responsabilidades estão:

- receber requisições externas;
- disponibilizar o frontend;
- encaminhar requisições destinadas à API;
- atuar como reverse proxy;
- fornecer a integração HTTP entre o cliente e o backend;
- participar da configuração de HTTPS e domínio em conjunto com a infraestrutura externa.

O Nginx não substitui as responsabilidades de autenticação e autorização do backend.

A segurança da aplicação continua sendo responsabilidade da API.

---

# 4. Docker Compose

O gerenciamento dos serviços é realizado através do **Docker Compose**.

O Compose permite declarar os componentes necessários para executar a aplicação como uma unidade operacional.

Conceitualmente:

```text
Docker Compose
│
├── frontend
├── exactum_api
├── postgres
├── redis
└── nginx
```

A configuração define aspectos como:

- imagens;
- build contexts;
- containers;
- networks;
- volumes;
- environment variables;
- portas;
- dependências;
- health checks;
- comandos de inicialização.

Isso permite que a infraestrutura necessária ao Exactum seja descrita de maneira declarativa.

---

# 5. Desenvolvimento e produção

O Exactum possui necessidades diferentes nos ambientes de desenvolvimento e produção.

## Desenvolvimento

Durante o desenvolvimento, pode ser conveniente executar determinados componentes diretamente no host e outros através de containers.

Por exemplo:

```text
Host
├── Flask
├── React/Vite
│
└── Docker
    ├── PostgreSQL
    └── Redis
```

Essa estratégia permite:

- hot reload;
- debugging mais simples;
- desenvolvimento iterativo;
- acesso direto às ferramentas da linguagem;
- isolamento dos serviços de infraestrutura.

O desenvolvimento não precisa reproduzir literalmente cada detalhe do ambiente de produção.

O objetivo é manter uma boa experiência de desenvolvimento sem perder compatibilidade arquitetural com produção.

---

## Produção

Em produção, a estratégia é mais controlada.

O ambiente é executado no VPS através de containers:

```text
VPS Linux
│
└── Docker
    │
    └── Docker Compose
        ├── Nginx
        ├── Frontend
        ├── Exactum API
        ├── PostgreSQL
        └── Redis
```

Isso reduz a dependência do estado específico do sistema operacional do servidor.

O deploy passa a consistir principalmente em atualizar as imagens/código e recriar os serviços necessários.

---

# 6. Redes

Os serviços do Compose são conectados através de uma network interna.

Isso permite que os containers se comuniquem utilizando os nomes dos serviços definidos no Compose.

Conceitualmente:

```text
exactum_api
     │
     ├──────────► postgres
     │
     └──────────► redis
```

O backend não precisa conhecer o endereço IP interno do container PostgreSQL.

Em vez disso, pode utilizar o hostname correspondente ao serviço.

Essa abordagem é preferível a configurar IPs estáticos manualmente.

---

# 7. Exposição de portas

Nem todo serviço precisa ser exposto diretamente ao host ou à Internet.

A arquitetura deve diferenciar:

```text
Internet
   │
   ▼
Nginx
   │
   ▼
Internal Docker Network
   │
   ├── API
   ├── PostgreSQL
   └── Redis
```

PostgreSQL e Redis são serviços internos e não devem ser disponibilizados publicamente sem uma necessidade operacional explícita.

A exposição externa deve ser minimizada.

Isso reduz a superfície de ataque e mantém a comunicação entre componentes internos dentro da network privada do ambiente.

---

# 8. Volumes

Containers possuem ciclo de vida independente dos dados persistentes.

Por isso, dados que precisam sobreviver à recriação de containers devem utilizar volumes ou outro mecanismo de persistência adequado.

O principal exemplo é o PostgreSQL:

```text
postgres container
       │
       ▼
PostgreSQL volume
       │
       ▼
persistent database data
```

Assim:

```text
docker compose down
        │
        ▼
container removido
        │
        ▼
volume permanece
```

desde que o volume não seja explicitamente removido.

Isso é especialmente importante em produção.

---

# 9. PostgreSQL e persistência

O banco de dados deve ser tratado como estado persistente da aplicação.

Operações como:

```bash
docker compose restart
```

ou:

```bash
docker compose up -d
```

não devem apagar os dados do banco.

Por outro lado, operações destrutivas como:

```bash
docker compose down -v
```

podem remover volumes associados ao Compose.

Esse comando deve ser utilizado com extrema cautela, principalmente em ambientes que contenham dados importantes.

No desenvolvimento, a remoção de volumes pode ser útil para reconstruir um ambiente limpo.

Em produção, essa operação não deve fazer parte do fluxo normal de deploy.

---

# 10. Redis e persistência

O Redis possui características diferentes do PostgreSQL.

Grande parte do estado armazenado pelo Exactum no Redis possui natureza temporária ou operacional.

Por exemplo:

```text
PostgreSQL
    │
    └── fonte principal de dados persistentes

Redis
    │
    └── estado temporário / operacional
```

Isso significa que a estratégia de recuperação do Redis pode ser diferente da estratégia utilizada para o PostgreSQL.

O sistema deve ser projetado para lidar corretamente com a perda de estado temporário quando isso for aceitável.

Sessões, revogações e outros estados mantidos no Redis devem possuir comportamento definido caso o serviço seja reiniciado.

---

# 11. Variáveis de Ambiente

Configurações dependentes do ambiente não devem ser hardcoded nas imagens.

Entre os exemplos estão:

- database URL;
- Redis URL;
- secret keys;
- JWT configuration;
- cookie configuration;
- CORS configuration;
- application environment;
- logging configuration;
- external service credentials.

Conceitualmente:

```text
Docker Image
     │
     └── aplicação
            │
            └── Environment Variables
                     │
                     ├── desenvolvimento
                     └── produção
```

A mesma imagem pode, quando apropriado, ser executada com configurações diferentes em ambientes distintos.

Secrets não devem ser commitados no repositório.

---

# 12. Imagens Docker

As imagens devem conter somente o necessário para executar o serviço.

Uma imagem de produção deve evitar incluir:

- ferramentas de desenvolvimento desnecessárias;
- caches de package managers;
- arquivos temporários;
- secrets;
- arquivos pessoais;
- código não utilizado no runtime.

Isso reduz:

- tamanho da imagem;
- tempo de transferência;
- superfície de ataque;
- quantidade de dependências;
- complexidade operacional.

Quando aplicável, o uso de **multi-stage builds** permite separar o ambiente de build do ambiente final de execução.

---

# 13. Imagem do Backend

A imagem do backend deve fornecer o runtime necessário para executar a aplicação Flask.

O processo conceitual é:

```text
Python base image
       │
       ├── system dependencies
       ├── Python dependencies
       ├── application code
       │
       ▼
Exactum API image
```

A imagem deve possuir uma configuração consistente com o ambiente de produção.

Dependências devem ser instaladas de forma determinística sempre que possível.

O projeto está em processo de migração do gerenciamento tradicional de `requirements` para **uv**, portanto a estratégia definitiva de dependency management pode evoluir juntamente com a aplicação.

---

# 14. Imagem do Frontend

O frontend utiliza uma etapa de build para gerar os artefatos estáticos.

Conceitualmente:

```text
Node / Vite
     │
     ▼
npm build
     │
     ▼
dist/
     │
     ▼
Nginx runtime
```

Isso permite separar o ambiente necessário para compilar a aplicação do ambiente necessário para servi-la.

A imagem final de produção não precisa carregar todo o toolchain de desenvolvimento do frontend.

---

# 15. Ciclo de Vida dos Containers

Containers devem ser considerados componentes descartáveis do ambiente.

O ciclo esperado é:

```text
Image
  │
  ▼
Container
  │
  ├── start
  ├── stop
  ├── restart
  └── recreate
```

O container pode ser recriado sem que isso represente perda dos dados persistentes.

Isso é uma das principais vantagens do modelo de containerização.

O estado persistente deve estar fora da camada efêmera do container.

---

# 16. Health Checks

Serviços críticos devem possuir mecanismos que permitam verificar se estão realmente disponíveis.

Existe uma diferença importante entre:

```text
container está executando
```

e:

```text
serviço está saudável
```

Um container pode estar em estado `running` enquanto a aplicação interna está indisponível.

Por isso, health checks podem verificar:

- disponibilidade da API;
- conexão com PostgreSQL;
- conexão com Redis;
- readiness de serviços;
- condições necessárias para receber tráfego.

No backend do Exactum, o health endpoint também verifica dependências importantes da aplicação.

---

# 17. Ordem de Inicialização

A ordem de inicialização dos containers não deve ser confundida com disponibilidade real dos serviços.

Por exemplo:

```text
PostgreSQL container started
        ≠
PostgreSQL ready
```

Da mesma forma:

```text
Redis container started
        ≠
Redis ready
```

A aplicação deve ser capaz de lidar com a possibilidade de uma dependência ainda estar inicializando.

Health checks e retry strategies podem ser utilizados para tornar o startup mais robusto.

---

# 18. Migrations

Database migrations possuem um ciclo de vida próprio.

O startup do backend não deve ser tratado automaticamente como sinônimo de execução de migrations.

As migrations precisam ser controladas de maneira explícita.

Conceitualmente:

```text
Deploy
  │
  ├── atualizar aplicação
  │
  ├── executar migrations
  │
  └── iniciar/atualizar serviços
```

A estratégia exata pode variar conforme o processo de deploy.

No ambiente de produção do Exactum, migrations fazem parte do processo operacional e são executadas de forma separada do fluxo normal da aplicação quando necessário.

Isso reduz o risco de múltiplos containers tentarem executar alterações estruturais simultaneamente.

---

# 19. Docker e CI/CD

O Docker também integra o processo de CI/CD do Exactum.

O fluxo simplificado é:

```text
Developer
    │
    ▼
Git
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── tests
    ├── lint
    └── validation
    │
    ▼
Deployment
    │
    ▼
VPS
    │
    ▼
Docker Compose
```

A automação reduz a quantidade de operações manuais necessárias para atualizar o ambiente de produção.

O deploy atual utiliza conexão SSH com o VPS e Docker Compose.

---

# 20. Docker no processo de Deploy

O Docker permite que o deploy seja baseado na atualização dos serviços em vez de uma configuração manual do servidor.

Um fluxo conceitual é:

```text
New commit
    │
    ▼
CI
    │
    ├── tests
    └── validation
    │
    ▼
VPS
    │
    ▼
Docker Compose
    │
    ├── update API
    ├── update frontend
    └── preserve infrastructure state
```

O objetivo é tornar o processo repetível e previsível.

---

# 21. Logs dos containers

Os containers devem enviar seus logs para o mecanismo padrão de logging do ambiente.

A aplicação deve produzir logs estruturados e contextualizados.

Informações como:

- `request_id`;
- método HTTP;
- endpoint;
- status code;
- duração;
- usuário;
- tenant;
- componente;
- erro;

podem ser utilizadas para investigação operacional.

Docker fornece a camada de execução dos processos, enquanto a aplicação continua responsável pela qualidade semântica dos logs.

A estratégia completa de logging está documentada em:

`docs/observability/infrastructure-logging.md`

---

# 22. Segurança dos containers

Containerização não é uma fronteira de segurança absoluta.

Um container não deve ser considerado automaticamente seguro apenas por estar isolado.

Práticas importantes incluem:

- utilizar imagens confiáveis;
- manter imagens atualizadas;
- minimizar dependências;
- não armazenar secrets na imagem;
- reduzir portas expostas;
- restringir comunicação entre serviços;
- evitar privilégios desnecessários;
- revisar permissões de volumes;
- atualizar dependências;
- monitorar vulnerabilidades;
- separar ambientes.

A segurança da aplicação continua dependendo de múltiplas camadas:

```text
Application Security
        +
Container Security
        +
Host Security
        +
Network Security
        +
Operational Security
```

---

# 23. Container não substitui a segurança da aplicação

É importante não confundir isolamento de containers com mecanismos como:

- Authentication;
- Authorization;
- Tenant Isolation;
- Input Validation;
- CSRF protection;
- Rate Limiting;
- Session Management;
- Audit Logging.

Esses mecanismos continuam sendo responsabilidades da aplicação e de sua infraestrutura.

Por exemplo, colocar PostgreSQL em uma network privada não substitui a necessidade de implementar corretamente:

```text
tenant_id filtering
```

no acesso aos dados.

Da mesma forma, utilizar HttpOnly cookies não elimina automaticamente outros requisitos de segurança da autenticação.

---

# 24. Desenvolvimento local com Docker

Docker pode ser utilizado para reproduzir parte ou todo o ambiente local.

Uma configuração comum é manter infraestrutura em containers:

```text
Docker
├── PostgreSQL
└── Redis

Host
├── Flask
└── Vite
```

Essa abordagem é útil porque evita a necessidade de instalar e configurar manualmente PostgreSQL e Redis no sistema operacional do desenvolvedor.

Também permite destruir e recriar serviços de infraestrutura de maneira relativamente simples.

---

# 25. Desenvolvimento totalmente containerizado

Também é possível executar todos os componentes através do Compose:

```text
Docker Compose
├── frontend
├── api
├── postgres
├── redis
└── nginx
```

Essa estratégia oferece maior paridade com produção, porém pode tornar o ciclo de desenvolvimento mais pesado.

Por isso, o ambiente local deve equilibrar:

- reproducibility;
- developer experience;
- debugging;
- performance;
- production parity.

Não existe necessidade de forçar uma única estratégia para todos os fluxos de desenvolvimento.

---

# 26. Volumes de desenvolvimento

Volumes podem ser utilizados para persistir dados durante o desenvolvimento.

Exemplo conceitual:

```text
PostgreSQL container
        │
        ▼
development volume
```

Isso evita perder o banco a cada recriação do container.

Quando for necessário reconstruir completamente o ambiente, o volume pode ser removido deliberadamente.

Essa operação deve ser entendida como destrutiva.

---

# 27. Reset do ambiente

Durante o desenvolvimento, pode ser necessário reconstruir o ambiente.

Um reset pode envolver:

```text
containers
    +
networks
    +
volumes
    +
database
```

A remoção do volume do PostgreSQL significa efetivamente começar com um banco vazio.

Por isso, operações de reset devem ser claramente separadas de operações normais de restart/recreate.

Uma distinção importante é:

```text
restart
    → reinicia o processo

recreate
    → recria o container

down
    → remove containers

down -v
    → remove containers e volumes
```

O comportamento exato depende da configuração do Compose, mas a diferença conceitual deve ser preservada.

---

# 28. Backup

Docker volumes não substituem backups.

Um volume protege principalmente contra a perda do container, mas não necessariamente contra:

- corrupção de dados;
- erro humano;
- exclusão acidental;
- comprometimento do host;
- falha do armazenamento;
- ransomware;
- desastre físico.

Portanto:

```text
Persistence
    ≠
Backup
```

O PostgreSQL deve possuir uma estratégia de backup independente do ciclo de vida dos containers.

A estratégia operacional de backup e recovery pode ser detalhada futuramente no `runbook`.

---

# 29. Dados de Produção

Dados de produção não devem ser tratados como dados descartáveis.

Operações como:

```bash
docker compose down -v
```

ou qualquer operação equivalente que remova volumes devem ser consideradas potencialmente destrutivas.

Antes de operações de manutenção, deve existir uma avaliação de:

- estado dos serviços;
- existência de backup;
- impacto da operação;
- migrations pendentes;
- dependências;
- possibilidade de rollback.

A infraestrutura deve favorecer operações reversíveis sempre que possível.

---

# 30. Docker Compose e configuração

A configuração do Compose deve permanecer versionada junto ao projeto.

Isso permite que a infraestrutura seja tratada como código:

```text
Repository
│
├── application code
├── Dockerfiles
├── Compose configuration
└── deployment configuration
```

Essa abordagem melhora:

- rastreabilidade;
- revisão por Git;
- reproducibility;
- documentação;
- rollback;
- onboarding.

Alterações relevantes na infraestrutura devem passar pelo mesmo processo de revisão utilizado para alterações de código.

---

# 31. Desenvolvimento versus Produção

Uma diferença importante entre os ambientes é a prioridade de cada um.

| Aspecto         | Desenvolvimento               | Produção                   |
| --------------- | ----------------------------- | -------------------------- |
| Hot reload      | desejável                     | não necessário             |
| Debug detalhado | desejável                     | controlado                 |
| Volumes         | convenientes                  | cuidadosamente gerenciados |
| Portas          | podem ser expostas localmente | minimizadas                |
| Secrets         | ambiente local                | gerenciamento seguro       |
| Build           | frequentemente iterativo      | reproduzível               |
| Logs            | detalhados                    | estruturados e controlados |
| Reset           | aceitável                     | altamente restrito         |
| Migrations      | iterativas                    | controladas                |
| Paridade        | importante                    | ambiente real              |
| Performance     | secundária                    | crítica                    |

O objetivo não é tornar os ambientes idênticos, mas garantir que diferenças relevantes sejam conhecidas e controladas.

---

# 32. Troubleshooting

Problemas de Docker devem ser investigados em camadas.

Uma sequência útil é:

```text
Container
   │
   ▼
Process
   │
   ▼
Network
   │
   ▼
Dependency
   │
   ▼
Application
```

Por exemplo, diante de uma API indisponível:

1. verificar se o container está executando;
2. verificar logs;
3. verificar health check;
4. verificar network;
5. verificar PostgreSQL;
6. verificar Redis;
7. verificar Nginx;
8. verificar configuração;
9. verificar aplicação;
10. verificar request/correlation ID.

Esse processo evita assumir que todo problema é causado pelo código da aplicação.

---

# 33. Comandos operacionais

Os comandos exatos podem variar conforme os arquivos Compose utilizados, mas os principais conceitos são:

### Subir serviços

```bash
docker compose up -d
```

### Ver status

```bash
docker compose ps
```

### Visualizar logs

```bash
docker compose logs
```

### Acompanhar logs

```bash
docker compose logs -f
```

### Reiniciar serviço

```bash
docker compose restart <service>
```

### Recriar serviços

```bash
docker compose up -d --build
```

### Parar e remover containers

```bash
docker compose down
```

### Remover também volumes

```bash
docker compose down -v
```

O último comando deve ser tratado como operação potencialmente destrutiva.

---

# 34. Boas práticas

A operação do Docker no Exactum deve seguir alguns princípios:

1. Containers devem ser tratados como componentes reproduzíveis.
2. Dados persistentes não devem depender do filesystem efêmero do container.
3. Secrets não devem ser incorporados às imagens.
4. Serviços internos não devem ser expostos desnecessariamente.
5. Imagens devem ser mantidas atualizadas.
6. Health checks devem refletir disponibilidade real.
7. Migrations devem ser controladas explicitamente.
8. Desenvolvimento e produção devem possuir estratégias adequadas às suas necessidades.
9. Docker não deve ser tratado como substituto de Application Security.
10. Operações destrutivas devem ser explícitas.
11. Logs devem manter contexto suficiente para investigação.
12. Configuração de infraestrutura deve permanecer versionada.
13. Deploys devem ser reproduzíveis.
14. Backups devem ser independentes dos Docker volumes.
15. Alterações de infraestrutura devem ser revisadas como código.

---

# 35. Estado atual

Atualmente, o Exactum utiliza Docker como parte fundamental de sua infraestrutura de produção.

A aplicação é executada em um VPS Linux utilizando Docker Compose, com os principais componentes organizados em containers.

O ambiente de produção integra:

- React;
- Nginx;
- Flask;
- PostgreSQL;
- Redis;
- Docker Compose;
- GitHub Actions.

O deployment atual utiliza GitHub Actions e conexão SSH com o VPS para atualizar o ambiente.

O desenvolvimento local possui maior flexibilidade e pode executar componentes diretamente no host ou através de containers, conforme a necessidade do fluxo de trabalho.

---

# 36. Evolução planejada

A estratégia de containerização pode evoluir juntamente com a arquitetura do Exactum.

Possíveis evoluções incluem:

- melhoria dos Dockerfiles;
- multi-stage builds;
- imagens menores;
- hardening dos containers;
- health checks mais completos;
- estratégias de graceful shutdown;
- observabilidade de containers;
- métricas de infraestrutura;
- gerenciamento mais estruturado de secrets;
- backup e disaster recovery mais robustos;
- registry privado ou público para imagens;
- melhoria do pipeline de CI/CD;
- separação mais clara entre build e runtime;
- execução de workers assíncronos;
- integração com Celery;
- RabbitMQ;
- evolução para uma infraestrutura mais distribuída caso a escala justifique.

A adoção dessas tecnologias deve ocorrer conforme necessidades reais do sistema, evitando adicionar complexidade operacional sem benefício correspondente.

---

# 37. Relação com a arquitetura geral

Docker representa a camada de execução e infraestrutura da aplicação.

Ele não define, por si só, os limites de domínio do Exactum.

A separação deve permanecer conceitualmente:

```text
Domain Architecture
        │
        ▼
Application Architecture
        │
        ▼
Runtime / Infrastructure
        │
        ▼
Docker
```

Isso permite que a arquitetura interna da aplicação evolua sem depender de uma determinada estratégia de containerização.

Da mesma forma, uma mudança futura na infraestrutura não deve exigir necessariamente uma reescrita dos domínios da aplicação.

---

# 38. Princípios arquiteturais

A utilização de Docker no Exactum segue alguns princípios:

### Reprodutibilidade

O ambiente deve poder ser recriado de maneira previsível.

### Isolamento

Cada serviço deve possuir responsabilidades e ciclo de vida bem definidos.

### Containers Efêmeros

Containers podem ser recriados sem que isso represente perda de estado persistente.

### Persistência Explícita

Dados importantes devem possuir mecanismo explícito de persistência.

### Exposição Mínima

Somente os serviços que realmente precisam de exposição externa devem possuir portas públicas.

### Infraestrutura como Código

A infraestrutura deve ser descrita e versionada junto ao projeto.

### Segurança Operacional

Operações potencialmente destrutivas devem ser explícitas e controladas.

### Paridade com Produção

O ambiente de desenvolvimento deve manter compatibilidade suficiente com produção para reduzir surpresas no deploy.

---

# 39. Documentos relacionados

Este documento está relacionado principalmente a:

- `docs/operations/development.md`
- `docs/operations/deployment.md`
- `docs/operations/nginx.md`
- `docs/operations/runbook.md`
- `docs/database/migrations.md`
- `docs/database/schema.md`
- `docs/observability/infrastructure-logging.md`
- `docs/observability/correlation.md`
- `docs/security/overview.md`
- `docs/api/overview.md`

---

# 40. Observação sobre nomenclatura e evolução arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação atual.

Por exemplo:

- `actor` representa conceitualmente quem originou uma ação, podendo ser representado atualmente por `user_uuid`;
- `tenant` representa conceitualmente o contexto organizacional, podendo ser representado atualmente por `tenant_uuid`;
- `resource` representa conceitualmente um recurso da API, como um produto, venda ou usuário.

Essa distinção permite documentar responsabilidades e conceitos arquiteturais sem limitar sua definição à implementação atual.

A estratégia de containerização também poderá evoluir conforme o sistema cresça. Novos serviços, workers, filas e mecanismos de observabilidade poderão ser introduzidos quando houver necessidade técnica ou operacional.

Portanto, este documento deve ser interpretado como uma representação do **modelo operacional atual e de sua direção de evolução**, e não como uma descrição imutável da infraestrutura futura do Exactum.
