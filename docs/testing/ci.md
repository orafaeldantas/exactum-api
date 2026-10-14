# Continuous Integration Testing

## 1. Objetivo

Este documento define como a estratégia de Testing do **Exactum** é integrada ao processo de **Continuous Integration (CI)**.

Enquanto `docs/testing/strategy.md` define **o que deve ser testado e por quê**, este documento define **como essas verificações são executadas automaticamente** durante o ciclo de desenvolvimento.

O objetivo do CI é fornecer uma barreira automatizada capaz de detectar problemas antes que alterações avancem para ambientes posteriores.

O pipeline deve verificar principalmente:

- qualidade estática do código;
- execução dos testes;
- integração com PostgreSQL;
- integração com Redis quando necessária;
- cobertura de testes;
- consistência do ambiente;
- capacidade de build;
- regressões funcionais;
- problemas de configuração;
- incompatibilidades introduzidas por mudanças recentes.

A ideia central é:

```text
Developer Change
      ↓
Git
      ↓
Continuous Integration
      ↓
Quality Gates
      ↓
Validated Change
      ↓
Deployment
```

---

# 2. Continuous Integration

Continuous Integration significa integrar alterações ao código principal frequentemente e utilizar automação para verificar se essas alterações continuam compatíveis com o sistema.

No Exactum, o CI funciona como uma camada de validação entre desenvolvimento e deployment.

O objetivo não é garantir que qualquer alteração seja perfeita.

O objetivo é detectar automaticamente problemas conhecidos e relevantes antes que eles cheguem à produção.

---

# 3. Responsabilidades do CI

O CI possui principalmente quatro responsabilidades:

```text
Static Quality
       +
Automated Tests
       +
Build Validation
       +
Quality Gates
```

Essas responsabilidades podem ser expandidas conforme o projeto evolui.

---

# 4. Pipeline Conceitual

O pipeline pode ser representado como:

```text
Pull Request / Push
        │
        ▼
Environment Setup
        │
        ▼
Dependency Installation
        │
        ▼
Lint / Static Checks
        │
        ▼
Test Infrastructure
        │
        ▼
Pytest
        │
        ▼
Coverage
        │
        ▼
Build Validation
        │
        ▼
Quality Gate
        │
        ▼
Deployable Change
```

Nem todas as etapas precisam ser executadas em exatamente essa ordem em todas as versões do pipeline.

A ordem deve priorizar:

1. feedback rápido;
2. falhas baratas primeiro;
3. testes dependentes de infraestrutura depois;
4. verificações mais caras por último.

---

# 5. Push e Pull Request

O CI deve ser executado principalmente em:

- pushes relevantes;
- Pull Requests;
- branches protegidas;
- eventos necessários para deployment.

O objetivo é garantir que alterações sejam verificadas antes de serem promovidas.

Pull Requests são especialmente importantes porque permitem validar uma mudança antes de sua integração ao fluxo principal.

---

# 6. Branch Protection

Quando aplicável, branches principais devem utilizar regras que exijam a conclusão dos checks críticos.

Conceitualmente:

```text
Pull Request
     ↓
CI
     ↓
Tests PASS
     ↓
Lint PASS
     ↓
Coverage PASS
     ↓
Merge allowed
```

Isso reduz a possibilidade de alterações que não atendem aos requisitos mínimos chegarem ao código principal.

---

# 7. Ambiente de CI

O ambiente de CI deve ser o mais próximo possível das condições esperadas para execução dos testes.

O pipeline deve definir explicitamente:

- versão do Python;
- dependências;
- banco de teste;
- Redis, quando necessário;
- variáveis de ambiente;
- diretório de trabalho;
- comandos de validação.

Evitar depender de configurações implícitas do runner.

---

# 8. Python Version

A versão do Python utilizada pelo CI deve acompanhar a versão suportada pelo projeto.

No estado atual do Exactum, o backend utiliza Python 3.11.

Portanto, o CI deve executar os testes em ambiente compatível com essa versão.

Uma mudança futura de Python deve ser tratada como alteração de infraestrutura e deve passar por validação própria.

---

# 9. Dependency Management

O projeto utiliza `uv` como parte da estratégia de gerenciamento de dependências Python.

O CI deve instalar as dependências a partir da definição versionada do projeto.

O objetivo é reduzir diferenças entre:

```text
Developer Machine
```

e:

```text
CI Runner
```

A instalação deve ser reproduzível.

---

# 10. Reproducibility

Um pipeline saudável deve ser reproduzível.

Dado:

```text
same commit
+
same dependency definition
+
same configuration
```

o resultado esperado deve ser equivalente.

Isso reduz problemas como:

```text
works locally
but fails in CI
```

---

# 11. Environment Variables

O CI deve fornecer apenas as variáveis necessárias para execução dos testes.

Secrets devem ser armazenados no mecanismo apropriado do ambiente de CI.

Nunca devem ser colocados diretamente no código.

Também não devem ser impressos nos logs.

Exemplo conceitual:

```text
DATABASE_URL
REDIS_URL
JWT configuration
application environment
```

Os valores reais devem permanecer protegidos.

---

# 12. Test Services

Quando os testes dependem de infraestrutura real, o CI deve disponibilizar serviços correspondentes.

No Exactum, isso pode incluir:

```text
PostgreSQL
Redis
```

O modelo conceitual é:

```text
CI Runner
   │
   ├── PostgreSQL
   │
   ├── Redis
   │
   └── Pytest
```

O objetivo é testar integrações reais quando mocks não seriam suficientes.

---

# 13. PostgreSQL no CI

Testes que dependem do comportamento real do PostgreSQL devem utilizar uma instância isolada do banco.

O banco deve iniciar em estado conhecido.

Idealmente:

```text
Empty Database
      ↓
Migrations
      ↓
Current Schema
      ↓
Tests
```

Isso também permite verificar se as migrations continuam sendo aplicáveis.

---

# 14. Redis no CI

Quando os testes dependem de Redis, o CI deve disponibilizar uma instância isolada.

Isso é importante para funcionalidades como:

- refresh sessions;
- session revocation;
- rate limiting;
- cache;
- temporary state.

O estado do Redis não deve sobreviver entre execuções de maneira que altere o resultado dos testes.

---

# 15. Service Readiness

Iniciar um container não significa necessariamente que o serviço está pronto.

Por isso, antes de executar testes dependentes de infraestrutura, o pipeline deve garantir que:

```text
PostgreSQL
```

e:

```text
Redis
```

estejam efetivamente disponíveis.

Conceitualmente:

```text
Start Service
      ↓
Wait for Readiness
      ↓
Run Tests
```

Isso evita falhas falsas causadas simplesmente por timing de inicialização.

---

# 16. Ruff

O CI deve executar o Ruff como parte dos quality gates.

Exemplo:

```bash
ruff check .
```

Quando a configuração do projeto incluir verificação de formatação:

```bash
ruff format --check .
```

O objetivo é detectar:

- erros estáticos;
- imports incorretos;
- problemas de estilo;
- padrões proibidos;
- problemas identificáveis automaticamente.

---

# 17. Static Quality Before Tests

Checks baratos devem preferencialmente executar antes dos testes mais pesados.

Exemplo:

```text
Ruff
 ↓
Pytest
```

Se o código possui um problema simples detectável pelo lint, não há necessidade de gastar recursos executando toda a suíte.

Essa ordem melhora o feedback do desenvolvedor.

---

# 18. Pytest

O Pytest é o principal framework de testes do backend.

O CI deve executar a suíte automatizada através do comando padronizado do projeto.

Exemplo:

```bash
pytest
```

Quando necessário, parâmetros adicionais podem ser utilizados para:

- coverage;
- verbose output;
- test selection;
- parallel execution;
- markers.

A configuração deve permanecer centralizada no projeto sempre que possível.

---

# 19. Test Selection

O CI pode utilizar diferentes conjuntos de testes dependendo do objetivo do pipeline.

Exemplo conceitual:

```text
Fast Checks
    ↓
Unit Tests
    ↓
Integration/API Tests
    ↓
Full Suite
```

Pull Requests podem priorizar feedback rápido, enquanto branches principais podem executar uma suíte mais abrangente.

A estratégia concreta deve evitar duplicação desnecessária.

---

# 20. Test Markers

Quando a suíte crescer, markers podem separar categorias como:

```text
unit
integration
api
security
e2e
slow
```

Exemplo:

```bash
pytest -m unit
```

ou:

```bash
pytest -m integration
```

Markers devem representar categorias reais e úteis.

Não devem ser criados apenas para aumentar a quantidade de configurações.

---

# 21. Full Test Suite

Antes de uma alteração ser considerada pronta para deployment, a suíte completa relevante deve ser executada.

Isso é especialmente importante para alterações em:

- Authentication;
- Authorization;
- repositories;
- database;
- session management;
- tenant isolation;
- impersonation.

Essas áreas possuem efeitos sistêmicos.

---

# 22. Coverage

O CI deve coletar coverage durante a execução dos testes.

Exemplo conceitual:

```bash
pytest --cov
```

O relatório pode ser utilizado para identificar áreas com pouca cobertura.

O objetivo principal é detectar lacunas, não produzir um número artificialmente alto.

---

# 23. Coverage Threshold

Um threshold pode ser utilizado como quality gate.

Por exemplo:

```text
Coverage >= project threshold
```

Quando o projeto definir um threshold, uma alteração que reduza a cobertura abaixo do limite poderá impedir a conclusão do CI.

Porém, o threshold deve ser tratado como uma proteção mínima.

Ele não deve substituir análise de risco.

---

# 24. Coverage Atual

O Exactum historicamente mantém coverage próxima de **89–90%**.

Essa métrica indica uma suíte relativamente abrangente, mas não significa que todas as áreas tenham o mesmo nível de proteção.

Por isso, mudanças em áreas críticas devem continuar recebendo atenção específica.

---

# 25. Coverage e Novas Funcionalidades

Uma nova funcionalidade deve incluir testes proporcionais ao risco.

Por exemplo:

```text
New authentication flow
        ↓
High test coverage expected
```

Enquanto:

```text
Small internal helper
        ↓
Simpler unit test
```

A exigência deve ser proporcional à responsabilidade.

---

# 26. Coverage Regression

Uma redução de coverage não significa automaticamente que uma alteração é ruim.

Pode acontecer, por exemplo, quando:

- código morto é removido;
- arquitetura muda;
- testes são reorganizados;
- responsabilidades são extraídas.

Por isso, coverage deve ser analisada em conjunto com a alteração.

O CI fornece o sinal.

A engenharia fornece a interpretação.

---

# 27. Database Migrations no CI

Migrations devem ser verificadas automaticamente sempre que possível.

Uma validação importante é:

```text
Fresh PostgreSQL
       ↓
Apply all migrations
       ↓
Current schema
       ↓
Run tests
```

Isso reduz o risco de uma migration funcionar apenas em um banco local já existente.

---

# 28. Migration Regression

Uma migration nova deve ser avaliada considerando:

- schema anterior;
- schema esperado;
- aplicação;
- testes;
- constraints;
- índices;
- dados existentes quando aplicável.

O CI não deve simplesmente verificar que o arquivo da migration existe.

Deve verificar que o estado resultante é utilizável.

---

# 29. API Contract Validation

O CI pode validar contratos da API através dos API Tests.

Devem ser observados:

- status codes;
- response schema;
- error format;
- cookies;
- authentication;
- authorization;
- public identifiers.

Isso protege o frontend e futuros consumidores da API contra mudanças acidentais.

---

# 30. Security Checks

Mudanças relacionadas à segurança devem possuir cobertura automatizada.

O CI deve executar testes relacionados a:

```text
Authentication
Authorization
Tenant Isolation
Session Management
Impersonation
```

quando esses testes fizerem parte da suíte.

Uma alteração de segurança que quebra um teste deve interromper o pipeline até que o comportamento seja entendido.

---

# 31. Tenant Isolation no CI

Tenant isolation deve ser tratada como quality gate.

Exemplo:

```text
Tenant A
   ↓
request
   ↓
must never access
   ↓
Tenant B resource
```

Esses testes devem fazer parte da suíte automatizada.

Isso é especialmente importante porque alterações em repositories e services podem introduzir regressões silenciosas.

---

# 32. Authentication Regression no CI

A suíte de CI deve proteger o fluxo:

```text
Login
 ↓
Cookies
 ↓
Authenticated request
 ↓
Refresh
 ↓
Rotation
 ↓
Logout
```

Uma alteração em qualquer camada deve ser validada contra esse fluxo.

---

# 33. Impersonation Regression no CI

Impersonation deve possuir testes automatizados porque altera temporariamente o contexto de identidade.

O CI deve verificar, quando aplicável:

```text
Original Actor
      ↓
Start Impersonation
      ↓
Impersonated Access
      ↓
Refresh
      ↓
Stop Impersonation
      ↓
Original Context
```

Isso reduz o risco de uma alteração de autenticação afetar o comportamento de super-admin.

---

# 34. Error Handling no CI

Os testes devem verificar que exceptions conhecidas continuam sendo convertidas para respostas HTTP adequadas.

Exemplo:

```text
Application Exception
       ↓
Central Handler
       ↓
HTTP Response
       ↓
Expected error.code
```

Também deve ser verificado que exceptions inesperadas não expõem detalhes internos.

---

# 35. Build Validation

Além de testes, o CI deve validar que a aplicação pode ser construída.

Dependendo do pipeline:

```text
Python environment
+
Dependencies
+
Application
```

e:

```text
Docker image
```

podem ser construídos.

Um projeto que passa nos testes mas não consegue gerar seu artefato de deployment não está efetivamente pronto para entrega.

---

# 36. Docker Build

Quando Docker fizer parte do processo de entrega, o CI deve validar o Docker build.

Conceitualmente:

```bash
docker build ...
```

ou o mecanismo definido pelo projeto.

O objetivo é detectar:

- Dockerfile quebrado;
- dependência ausente;
- arquivo não copiado;
- build context incorreto;
- incompatibilidade de runtime.

---

# 37. Build vs Test

Build e Test validam propriedades diferentes.

```text
Tests
→ comportamento

Build
→ capacidade de produzir o artefato
```

Portanto, ambos podem ser necessários.

---

# 38. Deployment Gate

O deployment não deve depender apenas de:

```text
git push
```

Deve depender de uma sequência validada.

Conceitualmente:

```text
Code
 ↓
Lint
 ↓
Tests
 ↓
Coverage
 ↓
Build
 ↓
Quality Gate
 ↓
Deployment
```

Isso reduz a probabilidade de uma alteração evidentemente inválida chegar à produção.

---

# 39. CI e Deployment

O CI e o deployment são partes relacionadas, mas possuem responsabilidades diferentes.

### CI

Responde:

> **A alteração foi validada?**

### Deployment

Responde:

> **A alteração validada pode ser promovida para o ambiente alvo?**

Essa separação facilita a evolução da infraestrutura.

---

# 40. Falha no CI

Quando o CI falhar, o deployment correspondente não deve prosseguir automaticamente quando a falha for relevante ao quality gate.

A primeira tarefa é identificar a etapa:

```text
Ruff
Pytest
Coverage
Migration
Build
```

Depois analisar a causa.

---

# 41. Diagnóstico de Falha de Teste

Uma falha deve ser investigada na seguinte ordem:

```text
Which test?
    ↓
Which assertion?
    ↓
What changed?
    ↓
Is the test correct?
    ↓
Is the implementation correct?
    ↓
Is the environment correct?
```

Não altere o teste simplesmente para fazê-lo passar.

Primeiro determine qual comportamento deveria existir.

---

# 42. Teste Falhando por Ambiente

Nem toda falha indica bug na aplicação.

Possíveis causas:

- PostgreSQL não iniciou;
- Redis não iniciou;
- environment variable ausente;
- dependency version;
- timezone;
- filesystem;
- network;
- test data;
- race condition.

O pipeline deve tornar essas falhas distinguíveis quando possível.

---

# 43. Flaky Tests no CI

Flaky tests devem ser tratados como problemas de qualidade.

Se um teste:

```text
PASS
FAIL
PASS
```

sem mudança no código, a confiança no CI diminui.

A estratégia recomendada é:

```text
Detect
 ↓
Reproduce
 ↓
Identify cause
 ↓
Fix
 ↓
Restore confidence
```

Reexecutar automaticamente um teste indefinidamente não deve ser utilizado como substituto para corrigir flakiness.

---

# 44. Logs do CI

Os logs devem permitir identificar:

- etapa;
- comando;
- versão;
- erro;
- contexto suficiente para diagnóstico.

Mas não devem expor:

- passwords;
- JWT;
- refresh tokens;
- API keys;
- secrets;
- credentials.

---

# 45. Secrets no CI

Secrets devem ser fornecidos pelo mecanismo seguro da plataforma de CI.

Não devem aparecer em:

```text
source code
workflow files
test output
logs
artifacts
```

Quando testes precisam de credenciais fictícias, devem utilizar valores específicos de teste.

---

# 46. Test Artifacts

Quando apropriado, o CI pode produzir artifacts como:

- coverage report;
- test report;
- logs de falha;
- build artifacts.

Artifacts devem ser avaliados quanto à possibilidade de conter informações sensíveis.

---

# 47. Test Reports

Um relatório útil deve permitir responder:

```text
How many tests ran?
How many passed?
How many failed?
How many were skipped?
What is the coverage?
Which test failed?
```

Isso melhora a velocidade de diagnóstico.

---

# 48. Caching

Caching de dependências pode reduzir o tempo do CI.

Porém, cache não deve comprometer reprodutibilidade.

Quando ocorrer comportamento inexplicável, uma das hipóteses pode ser:

```text
stale cache
```

O pipeline deve permitir invalidar ou reconstruir caches quando necessário.

---

# 49. Dependency Updates

Alterações em dependências devem executar a suíte completa relevante.

Isso é especialmente importante para:

- Flask;
- SQLAlchemy;
- JWT libraries;
- Redis clients;
- PostgreSQL drivers;
- Pytest;
- Ruff.

Uma atualização aparentemente pequena pode alterar comportamento.

---

# 50. Python Version Updates

Mudanças na versão do Python devem ser tratadas como mudanças sistêmicas.

Antes de atualizar:

```text
Python version
```

validar:

- dependencies;
- tests;
- Docker;
- CI;
- production runtime;
- migrations/tools.

O objetivo é evitar diferenças entre CI e produção.

---

# 51. CI Failure Policy

Nem toda mensagem do pipeline possui o mesmo nível de severidade.

Exemplo:

```text
Lint failure
→ code quality gate

Test failure
→ behavior gate

Build failure
→ delivery gate
```

Todos podem bloquear o pipeline, mas o diagnóstico é diferente.

---

# 52. Quality Gates

Os principais quality gates são:

```text
[ ] Dependencies installed
[ ] Ruff passes
[ ] Tests pass
[ ] Coverage meets project policy
[ ] Migrations valid
[ ] Build succeeds
[ ] Security regression tests pass
```

Os gates podem evoluir conforme a maturidade do projeto.

---

# 53. Fast Feedback

Uma propriedade importante do CI é fornecer feedback rapidamente.

Por isso:

```text
Cheap checks
```

devem preferencialmente acontecer antes de:

```text
Expensive checks
```

Exemplo:

```text
Ruff
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
```

Entretanto, o ganho de velocidade não deve comprometer a confiabilidade.

---

# 54. Parallelization

Quando a suíte crescer, partes independentes podem ser executadas em paralelo.

Exemplo conceitual:

```text
          ┌── Unit Tests
CI ───────┼── API Tests
          ├── Integration Tests
          └── Static Checks
```

O paralelismo deve ser introduzido somente quando:

- testes são isolados;
- infraestrutura suporta concorrência;
- ganhos justificam complexidade.

---

# 55. CI Resource Usage

O pipeline deve evitar consumo desnecessário.

Boas práticas incluem:

- instalar somente dependências necessárias;
- utilizar caching adequadamente;
- evitar serviços não utilizados;
- executar testes relevantes;
- paralelizar quando fizer sentido.

O objetivo é equilibrar:

```text
Speed
+
Reliability
+
Cost
```

---

# 56. Local Reproduction

Uma falha de CI deve, sempre que possível, poder ser reproduzida localmente.

Exemplo:

```text
CI:
pytest → failure
```

deve permitir algo próximo de:

```bash
pytest path/to/test.py
```

localmente.

Quanto menor a diferença entre ambiente local e CI, menor o custo de diagnóstico.

---

# 57. CI e Desenvolvimento

O fluxo recomendado é:

```text
Developer
   ↓
Local Tests
   ↓
Commit
   ↓
Push / Pull Request
   ↓
CI
   ↓
Review
   ↓
Merge
```

O CI não deve ser utilizado como substituto para executar testes básicos localmente.

Ele funciona como uma segunda camada de validação.

---

# 58. CI e Documentação

Alterações relevantes no processo de CI devem ser refletidas na documentação.

Exemplos:

- novos quality gates;
- novo serviço de teste;
- nova versão do Python;
- novo mecanismo de coverage;
- nova etapa de build;
- nova ferramenta de segurança.

A documentação deve acompanhar o pipeline real.

---

# 59. CI e Observability

O CI também pode contribuir para a observabilidade do processo de desenvolvimento.

Métricas futuras podem incluir:

- pipeline duration;
- test duration;
- failure rate;
- flaky test rate;
- deployment frequency;
- change failure rate.

Essas métricas podem ajudar a avaliar a saúde do processo de engenharia.

---

# 60. CI e Developer Experience

Um bom CI deve ajudar o desenvolvedor, não apenas bloquear alterações.

Uma falha deve responder rapidamente:

```text
What failed?
Why?
Where?
How can I reproduce it?
```

Mensagens claras e comandos reproduzíveis reduzem o tempo entre:

```text
failure
```

e:

```text
fix
```

---

# 61. CI como Guardrail

O CI deve ser visto como um **guardrail**.

Ele não substitui:

- julgamento técnico;
- code review;
- arquitetura;
- threat modeling;
- testes exploratórios;
- observabilidade.

Ele impede automaticamente uma classe de erros conhecidos.

---

# 62. CI e Refactoring

Refactors estruturais devem passar pelos mesmos quality gates que novas funcionalidades.

Isso permite:

```text
Refactor
 ↓
Lint
 ↓
Tests
 ↓
Coverage
 ↓
Build
```

Se o comportamento permanece protegido, mudanças internas podem ser realizadas com menor risco.

---

# 63. CI e Database Changes

Alterações de banco merecem atenção especial.

Quando uma Pull Request modifica:

- model;
- migration;
- repository;
- schema;
- transaction;

o CI deve executar os testes relevantes de integração.

O objetivo é detectar incompatibilidade entre:

```text
Application
+
Database
```

antes do deployment.

---

# 64. CI e Security Changes

Alterações em:

- Authentication;
- Authorization;
- cookies;
- sessions;
- impersonation;
- tenant isolation;

devem executar testes de segurança relevantes.

Mudanças nessa área não devem depender apenas de testes manuais.

---

# 65. CI e API Evolution

Quando contratos da API forem alterados, o CI deve ajudar a detectar breaking changes.

Isso inclui mudanças em:

- status codes;
- response schemas;
- request schemas;
- error codes;
- authentication;
- identifiers.

O objetivo é evitar quebrar consumidores sem intenção.

---

# 66. CI e Frontend

Embora este documento seja principalmente voltado ao backend, o frontend também participa do contrato da API.

Uma alteração no backend pode afetar:

```text
React
 ↓
API client
 ↓
HTTP contract
```

Por isso, mudanças de API devem ser acompanhadas por testes e validações apropriados no frontend quando necessário.

---

# 67. CI e OpenAPI

Como o Exactum utiliza OpenAPI/Swagger, mudanças relevantes no contrato devem manter a documentação consistente com a implementação.

No futuro, podem ser adicionadas verificações automatizadas que comparem:

```text
OpenAPI specification
vs.
API behavior
```

Isso reduz divergências entre documentação e implementação.

---

# 68. CI e Production Safety

O CI não garante que uma aplicação esteja livre de todos os problemas.

Porém, ele deve impedir classes conhecidas de falha.

Exemplos:

```text
Broken import
Missing dependency
Failed test
Invalid migration
Broken build
Security regression
```

Isso reduz a probabilidade de problemas previsíveis chegarem à produção.

---

# 69. Current Pipeline Philosophy

A filosofia atual pode ser resumida em:

```text
Fast
+
Deterministic
+
Reproducible
+
Security-aware
+
Production-oriented
```

O CI deve permanecer simples enquanto o projeto for pequeno o suficiente para que simplicidade seja uma vantagem.

---

# 70. Estado Atual

O Exactum utiliza **GitHub Actions** como mecanismo de CI/CD.

O backend é validado utilizando principalmente:

- Python;
- `uv`;
- Pytest;
- coverage;
- Ruff;
- PostgreSQL;
- Redis quando necessário.

A pipeline é integrada ao processo de deployment do projeto.

O objetivo atual é manter o caminho:

```text
Code
 ↓
CI
 ↓
Validation
 ↓
Deployment
```

com o mínimo possível de divergência entre desenvolvimento, CI e produção.

---

# 71. Evolução Futura

À medida que o Exactum evoluir, o CI poderá incorporar:

- type checking;
- dependency vulnerability scanning;
- SAST;
- container scanning;
- OpenAPI contract testing;
- E2E tests;
- performance tests;
- migration compatibility checks;
- Docker image scanning;
- automated deployment verification;
- smoke tests pós-deployment;
- automated rollback.

Essas ferramentas devem ser introduzidas de acordo com necessidade real.

Adicionar ferramentas sem um problema que elas resolvam pode aumentar a complexidade do pipeline sem gerar benefício proporcional.

---

# 72. Futuro Pipeline

Uma evolução possível é:

```text
Pull Request
     │
     ▼
Ruff
     │
     ▼
Unit Tests
     │
     ▼
Integration Tests
     │
     ▼
Security Tests
     │
     ▼
Coverage
     │
     ▼
Build
     │
     ▼
Container Scan
     │
     ▼
Quality Gate
     │
     ▼
Merge
     │
     ▼
Deployment
     │
     ▼
Smoke Tests
     │
     ▼
Production
```

Essa arquitetura deve ser adotada progressivamente.

---

# 73. Failure Recovery

Uma falha no CI não altera automaticamente o código.

O fluxo deve ser:

```text
Failure
 ↓
Diagnosis
 ↓
Correction
 ↓
New Commit
 ↓
CI
```

O objetivo é manter o pipeline como fonte confiável de validação.

---

# 74. Anti-Patterns

Evitar:

### Ignorar testes falhando

```text
"Depois eu vejo isso."
```

### Desabilitar quality gates

```text
"Vou só remover esse check."
```

### Aumentar timeout sem investigar

```text
"Está lento, vamos esperar mais."
```

### Reduzir coverage artificialmente

```text
"Vou excluir esse código da coverage."
```

### Reexecutar pipeline indefinidamente

```text
"Uma hora passa."
```

### Esconder erros

```text
"Não precisa aparecer no CI."
```

Essas práticas reduzem a confiabilidade do pipeline.

---

# 75. Definition of Done do CI

Uma alteração está tecnicamente pronta para avançar quando, conforme aplicável:

```text
[ ] Dependencies resolve
[ ] Ruff passes
[ ] Unit tests pass
[ ] Integration tests pass
[ ] API tests pass
[ ] Security tests pass
[ ] Coverage policy satisfied
[ ] Migrations validated
[ ] Build succeeds
[ ] No secrets exposed
[ ] Required documentation updated
```

---

# 76. Relação com Outros Documentos

Este documento complementa principalmente:

- `docs/testing/strategy.md`
- `docs/operations/development.md`
- `docs/operations/docker.md`
- `docs/operations/deployment.md`
- `docs/operations/runbook.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/tenant-isolation.md`
- `docs/security/threat-model.md`
- `docs/observability/overview.md`
- `docs/database/migrations.md`
- `docs/api/overview.md`
- `docs/api/errors.md`
- `docs/api/versioning.md`

---

# 77. Observação sobre Nomenclatura e Evolução Arquitetural

A organização, os limites de domínio e os conceitos apresentados neste documento representam o estado atual e a direção arquitetural do Exactum.

As nomenclaturas utilizadas na documentação são, em alguns casos, **conceituais** e podem não corresponder exatamente aos nomes utilizados na implementação.

Por exemplo:

```text
actor
```

é utilizado como conceito arquitetural para representar quem originou ou executou determinada ação, enquanto a implementação atual pode representá-lo por:

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

pode corresponder a identificadores específicos como:

```text
product_uuid
sale_uuid
user_uuid
```

Essa distinção permite que a documentação descreva responsabilidades e conceitos arquiteturais sem limitar sua definição aos detalhes atuais da implementação.

A estratégia de CI também poderá evoluir conforme a infraestrutura, arquitetura e processo de desenvolvimento do Exactum amadureçam.

Portanto, este documento representa o **modelo atual de Continuous Integration e sua direção de evolução**, e não uma especificação imutável do pipeline futuro.

---

# 78. Conclusão

Continuous Integration é uma das principais barreiras entre uma alteração de código e sua entrada no ambiente de produção.

No Exactum, o CI combina:

```text
Static Analysis
+
Automated Testing
+
Coverage
+
Database Validation
+
Build Validation
+
Quality Gates
```

para reduzir regressões e aumentar a confiança nas mudanças.

A principal função do pipeline não é impedir todo e qualquer erro.

É impedir que erros conhecidos e detectáveis avancem sem serem percebidos.

O fluxo pode ser resumido como:

```text
Developer
    ↓
Code Change
    ↓
Local Validation
    ↓
Pull Request
    ↓
Continuous Integration
    ↓
Quality Gates
    ↓
Validated Change
    ↓
Deployment
```

À medida que o Exactum evoluir, o pipeline poderá incorporar novas camadas de segurança, performance, contract testing, container scanning e deployment verification.

Entretanto, o princípio fundamental permanece:

> **o CI deve fornecer feedback rápido, reproduzível e confiável sobre a qualidade e a segurança de uma alteração antes que ela avance para ambientes posteriores.**
