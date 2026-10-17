# Exactum — Guia de Engenharia para o Claude Code

Plataforma SaaS multi-tenant de gestão comercial (estoque, vendas e PDV). Monorepo com backend Flask (`backend/`) e frontend React (`frontend/`).

---

## 1. Stack

- **Backend:** Python 3.11, Flask, Flask-Smorest (OpenAPI), Marshmallow, SQLAlchemy 2, Alembic (Flask-Migrate), PostgreSQL 15, Redis
- **Frontend:** React, Vite, Tailwind, Lucide, framer-motion, Recharts, react-hot-toast
- **Infra:** Docker Compose, Nginx (atrás do Cloudflare), GitHub Actions, deploy via SSH em VPS
- **Repo:** uv, ruff, mypy, pytest, Husky + commitlint, Conventional Commits, GitHub Flow

## 2. Comandos

Ambiente local (raiz do repositório):

```bash
docker compose up -d --build                # api (5000), db (5433), redis (6379)
docker compose exec api flask db upgrade    # aplicar migrations
docker compose exec api flask seed-rbac     # catálogo de permissões (rodar antes do seed)
docker compose exec api flask seed          # super-admin, tenants, produtos e vendas de exemplo
cd frontend && npm run dev                  # http://localhost:5173 (proxy /api → :5000)
```

Qualidade (em `backend/`, os mesmos passos do CI):

```bash
uv run ruff check . && uv run ruff format --check .
uv run mypy .
uv run pytest                               # exige DATABASE_TESTS_URL (ver seção 6)
uv run flask db migrate -m "<descrição>"    # gerar migration; revisar o arquivo antes de commitar
```

Swagger em `http://localhost:5000/doc/swagger`; health em `/health`.

---

## 3. Arquitetura

### Camadas (backend)

Cada domínio fica em `backend/app/domains/<domínio>/` (`auth`, `user`, `tenant`, `product`, `sale`, `goal`, `rbac`, `platform`, `observability`).

```
Routes (Blueprint) → Controller → Service → Repository → Model
```

| Camada     | Responsabilidade                                                                         | Não pode                                           |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Routes     | Rota, schemas Marshmallow de entrada/saída, status HTTP, `@jwt_required` e `@permission_required` | Conter regra de negócio ou acessar o banco         |
| Controller | Extrair contexto do request (`g`, IP, user-agent) e montar a resposta (cookies, `AuthResponse`) | Conter regra de negócio ou acessar o banco         |
| Service    | Regras de negócio, orquestração, transação (commit/rollback), eventos de auditoria       | Conhecer `request`, `g`, `jsonify` ou detalhes HTTP |
| Repository | Consultas e persistência via SQLAlchemy                                                  | Conter regra de negócio, fazer commit ou lançar erros HTTP |
| Model      | Mapeamento ORM (`backend/app/models/`)                                                   | Conter lógica de aplicação                         |

- Dependências apontam sempre para dentro: Routes → Controller → Service → Repository. Nunca o contrário.
- Um domínio não importa o repository de outro; a comunicação acontece pelo service.

### Multi-tenancy

- **Banco e schema compartilhados** (ADR-001). Tabelas tenant-scoped têm `tenant_id` (FK interna, `BIGINT`); `uuid` é o identificador público exposto pela API. IDs internos nunca saem da API.
- O tenant vem **sempre** do JWT (`g.tenant_id`, populado em `app/core/middlewares/context.py`). Nenhuma camada aceita `tenant_id` vindo do payload, da URL ou da query string.
- Isolamento em duas camadas:
  1. **Obrigatório:** todo método de repository sobre dados tenant-scoped filtra explicitamente por `tenant_id` (inclusive `update()`/`delete()`).
  2. **Rede de proteção:** `app/database/tenant_filter.py` aplica `with_loader_criteria` automaticamente, mas hoje cobre só `User`, `Product` e `Goal`, só em `SELECT`, e não filtra quando `g.tenant_id` está vazio. Não confie nele sozinho.
- Consultas cross-tenant só com `execution_options(skip_tenant_filter=True)` e **apenas** no domínio `platform`.

### Autenticação e autorização

- JWT em cookies HttpOnly (`access_token` 15 min, `refresh_token` 30 dias, path `/api/auth`). Refresh token com rotação e estado no Redis (`tenant:{id}:user:{id}:refresh:{jti}`).
- **RBAC:** permissões no formato `<recurso>:<ação>` (catálogo em `app/infra/seed/rbac_seed.py`), verificadas com `@permission_required("product:view")`. Roles padrão por tenant em `app/domains/rbac/constants.py`: `administrador`, `gerente_de_vendas`, `vendedor`, `estoquista`, `acesso_restrito`.
- **Super-admin** não é role: é a claim `is_super_admin`, verificada por `@require_super_admin`.
- Autorização é verificada na borda (decorators nas routes) **e** regras de propriedade no service.
- Mudou roles ou permissões de alguém? Invalide o cache de permissões (`tenant:{id}:user:{id}:permissions`).
- Impersonate sempre gera **platform event** (`IMPERSONATION_STARTED` / `IMPERSONATION_FINISHED`).
- Revogação: blocklist no Redis com TTL igual ao do access token, por usuário ou por tenant. Hoje ela só é checada em `permission_required`.

### Logs e observabilidade

- `platform_events`: eventos de plataforma (login, logout, impersonate, ações de super-admin).
- `audit_logs`: ações de negócio por tenant (criação, alteração, exclusão, mudanças de permissão), geradas no service.
- Ambas as tabelas ficam no mesmo banco/schema. Logs técnicos de request vão para o logger estruturado com `request_id`.
- Nunca registrar senhas, tokens, cookies ou dados sensíveis em log.

Decisões arquiteturais estão em `docs/architecture/decisions/` (ADRs). A documentação técnica está em `docs/`, e as limitações conhecidas em `docs/security/overview.md`. Consulte antes de propor mudanças estruturais.

---

## 4. Código legado e refatoração gradual

As regras deste guia são o **padrão do projeto**. Parte do código existente ainda não as segue (ver tabela). A estratégia é refatorar aos poucos:

- **Código novo** segue as regras deste guia desde o início.
- **Código existente** é adaptado quando for tocado por outro motivo, limitado ao trecho envolvido na mudança.
- A refatoração vai em **commit separado** (`refactor(...)`), antes ou depois da feature/correção, nunca misturada com ela.
- Refatorações além do trecho tocado, ou que mudem contratos públicos, precisam ser propostas e aprovadas antes.
- Não "corrija" padrões legados em arquivos que não fazem parte da tarefa.

Divergências conhecidas entre o código atual e as regras:

| Regra                                        | Estado atual                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Services recebem dependências por construtor | Maioria usa `@staticmethod` (só `RBACService` recebe dependências)           |
| Commit/rollback no service                   | Vários repositories fazem `commit()` (`product`, `rbac`, `observability`)    |
| Formato único de erro                        | Três formatos: `AppException`, flask-smorest e JWT (`docs/api/errors.md`)     |
| Listagens paginadas                          | Nenhuma listagem é paginada                                                  |
| Testes unitários com fakes                   | Só existem testes funcionais em `backend/tests/functional/`                  |
| Exceções de domínio em vez de built-ins      | Há `raise KeyError(...)` / `ValueError(...)` em services                     |

---

## 5. Princípios de engenharia

- **S — Responsabilidade única:** um motivo para mudar. Service grande é dividido por caso de uso; um método de repository por consulta ou KPI, com nome descritivo.
- **O — Aberto/fechado:** novos comportamentos por extensão, não por `if/elif` crescente. Ex.: meios de pagamento do POS como estratégias.
- **L — Liskov:** implementações alternativas (repository fake, cache) respeitam o mesmo contrato de entrada, saída e exceções.
- **I — Segregação de interfaces:** dependa só do que usa; nada de repository "faz-tudo".
- **D — Inversão de dependência:** services recebem repository, cache e clientes externos pelo construtor ou factory (como `get_rbac_service()`), o que permite testar com fakes.
- **KISS / YAGNI:** a solução mais simples para o problema atual; nada de abstração "para o futuro".
- **DRY com critério:** extraia duplicação de regra, não de código parecido por coincidência.
- **Composição sobre herança. Falhe cedo:** valide na borda, proteja invariantes no domínio.

---

## 6. Padrões de código

### Python

- Type hints em todas as assinaturas públicas (o CI roda mypy).
- Nomes descritivos em inglês; funções com verbo (`get_active_tenants`, `revoke_user_sessions`).
- Funções curtas, com um nível de abstração.
- Sem números ou strings mágicas: use constantes ou enums (ex.: `PlatformEvents`, `AuditEvents`).
- Lint e formatação com ruff, conforme `backend/pyproject.toml`.

### Tratamento de erros

- Services lançam **exceções de domínio** que herdam de `AppException` (ex.: `ProductNotFound`, `ForbiddenException`), definidas em `<domínio>_exceptions.py` com `status_code` e `message`.
- A tradução para HTTP acontece em um ponto central (`app/exceptions/handlers.py`), não nos services.
- Respostas de erro não expõem stack trace nem detalhes internos.
- Nunca use `except Exception: pass`. Se capturar, registre e relance ou converta em exceção de domínio.

### API

- Recursos no plural, substantivos, sem verbos na URL.
- Status corretos: `201` criação, `204` sem conteúdo, `400/422` validação, `401/403` auth, `404`, `409` conflito.
- Todo endpoint tem schema Marshmallow de entrada e saída, documentado no Swagger.
- Recursos identificados por `uuid` na URL (`/products/<uuid:product_uuid>`).
- Listagens novas são paginadas.
- Valores calculáveis (preços, totais, estoque) são calculados no backend, nunca aceitos do cliente.
- Mudanças incompatíveis no contrato exigem aprovação.

### Banco de dados

- Toda mudança de schema via migration Alembic, revisada e reversível (`downgrade` implementado). Nunca alterar tabelas manualmente.
- Constraints de unicidade em dados tenant-scoped devem incluir `tenant_id`.
- Operações concorrentes sobre o mesmo registro (ex.: baixa de estoque) usam lock (`with_for_update()`) ou update atômico.
- Evite N+1: use `joinedload` / `selectinload` quando necessário.
- Índices para colunas usadas em filtros, joins e ordenações frequentes.
- Soft delete via `SoftDeleteMixin` (`deleted_at`). Queries filtram `deleted_at.is_(None)` explicitamente.

### Frontend

- Componentes pequenos e com responsabilidade única; lógica de dados em hooks customizados.
- Chamadas à API centralizadas em `frontend/src/services/` (`api.js` trata refresh de token).
- Estados de loading, erro e vazio tratados em toda tela que consome dados.
- Permissões no frontend só controlam a UI; a autorização real é sempre do backend.
- Design system: `blue-600` primária, texto `slate`, `rounded-2xl`, ícones Lucide.

### Convenções de domínio e idioma

- Nomenclatura `platform` (nunca `system`) no backend e no frontend.
- Nomes de domínio separados de nomes de autorização (role ≠ contexto).
- Labels da UI e documentação em `docs/` em português. Código, nomes de variáveis e mensagens de commit em inglês.

---

## 7. Testes

- Toda feature ou correção inclui testes. Bug corrigido ganha um teste que reproduz o problema.
- **Funcionais/integração:** endpoints e repositories contra PostgreSQL e Redis reais (`backend/tests/functional/`, fixtures em `backend/tests/fixtures/`).
- **Unitários:** services com dependências substituídas por fakes (código novo ou refatorado para DI).
- **Obrigatórios para código que acessa dados:** um tenant não enxerga, altera nem exclui dados de outro; permissão ausente retorna `403`; casos de erro, não só o caminho feliz.
- Padrão Arrange / Act / Assert e nomes que descrevem o comportamento esperado.
- ⚠️ **Banco de testes:** a suíte executa `TRUNCATE` e `drop_all()`. Rode sempre com `DATABASE_TESTS_URL` apontando para um banco dedicado (ex.: `exactum_db_tests`). Nunca rode `pytest` com `DATABASE_URL` de um banco com dados reais, porque a fixture usa `DATABASE_URL` como fallback.

## 8. Segurança

- Segredos apenas via variáveis de ambiente; nunca no código, em logs ou em commits.
- Toda entrada externa é validada (Marshmallow na borda, invariantes no service).
- Queries sempre parametrizadas (ORM ou bind params); nunca concatenação de strings em SQL.
- Menor privilégio em roles e endpoints; todo endpoint novo protegido declara sua permissão.
- Limitações conhecidas estão em `docs/security/overview.md`. Não as descreva como resolvidas sem a correção correspondente. Detalhes exploráveis de vulnerabilidades abertas não vão para a documentação pública.

### Registro de falhas

- Toda vulnerabilidade, falha de integridade de dados ou risco operacional encontrado é registrado em `docs/security/findings.md`, seguindo o template e os critérios do próprio arquivo, com o próximo ID `SEC-xxx`. Não relate falhas só no chat.
- O arquivo é **privado e nunca é commitado**, nem adicionado com `git add -f`.
- O Claude registra e propõe; a correção segue o fluxo da seção 9, uma falha por PR (exceto falhas com a mesma causa raiz).
- Antes de começar uma correção, leia o item e atualize o status para `Em correção`. Ao terminar, use `Corrigida`. `Em produção` só depois do deploy verificado.
- Commits de correção citam apenas o ID no corpo (ex.: `Refs: SEC-004`), sem descrever como explorar a falha. O histórico do repositório é público.
- Ao fechar um item, siga o checklist "Ao fechar um item" do `findings.md`.

---

## 9. Fluxo de desenvolvimento

Toda alteração passa por revisão humana antes de ser integrada.

1. **Plano antes da implementação.** Para tarefas não triviais, apresente a abordagem e aguarde aprovação.
2. **Decisões justificadas.** Explique o racional técnico e as alternativas consideradas. Decisões estruturais geram ou atualizam um ADR em `docs/architecture/decisions/`.
3. **Mudanças pequenas e revisáveis.** Uma responsabilidade por alteração; evite diffs extensos.
4. **Áreas sensíveis exigem aprovação prévia:** migrations, autenticação, autorização, isolamento de tenant e infraestrutura.
5. **Dependências novas** precisam de justificativa e aprovação.
6. **Requisitos de negócio não são presumidos.** Em caso de ambiguidade, pergunte.
7. **Refatoração separada de feature.** Não misture as duas no mesmo commit (ver seção 4).
8. **Documentação acompanha o código.** Mudou comportamento descrito em `docs/`? Atualize no mesmo PR.

### Commits

Conventional Commits conforme `CONTRIBUTING.md`, validados pelo commitlint:

- Tipos: `feat`, `fix`, `refactor`, `format`, `perf`, `chore`, `docs`, `style`, `ci`, `test`
- Escopos (únicos aceitos): `ui`, `frontend`, `api`, `backend`, `db`, `infra`, `repo`
- Assunto no imperativo, em minúsculas, sem ponto final. Ex.: `fix(backend): compute sale total from product prices`
- Branches com prefixo `feat/`, `fix/`, `hotfix/`, `chore/`; commits diretos em `main`/`develop` são bloqueados pelo hook.

### Definition of Done

- [ ] Código segue as camadas e os princípios deste guia
- [ ] Testes escritos e passando, incluindo isolamento de tenant e casos de erro
- [ ] `ruff`, `ruff format` e `mypy` sem erros
- [ ] Endpoint documentado no Swagger (se aplicável)
- [ ] Migration criada, revisada e reversível (se aplicável)
- [ ] Auditoria registrada para ações relevantes
- [ ] Documentação em `docs/` atualizada (se aplicável)
- [ ] ADR criado ou atualizado (se for decisão estrutural)
- [ ] Commit no padrão acima

## 10. Nunca

- Commitar segredos, `.env` ou credenciais.
- Desativar ou contornar o filtro de tenant fora do domínio `platform`.
- Aceitar `tenant_id`, preços ou totais vindos do cliente.
- Colocar regra de negócio em routes, controllers ou repositories.
- Rodar testes contra um banco que não seja de testes.
- Fazer push, merge ou alterar o histórico do Git sem pedido explícito.
