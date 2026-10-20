# Modelo de Ameaças

## 1. Visão Geral

Este documento descreve o modelo de ameaças do Exactum, identificando os principais ativos, atores, superfícies de ataque, ameaças e controles de segurança da plataforma.

O objetivo não é afirmar que o sistema é imune a ataques, mas estabelecer uma visão estruturada de:

- o que precisa ser protegido;
- contra quais ameaças;
- quais componentes podem ser explorados;
- quais controles mitigam essas ameaças;
- quais riscos permanecem;
- quais áreas devem receber atenção durante a evolução do sistema.

O modelo acompanha o estágio atual do Exactum como uma plataforma SaaS multi-tenant em evolução.

A segurança é tratada como uma propriedade transversal da aplicação:

```text
                    Exactum
                       │
        ┌──────────────┼──────────────┐
        │              │              │
 Authentication   Authorization   Tenant Isolation
        │              │              │
        └──────────────┼──────────────┘
                       │
                Application Logic
                       │
              ┌────────┴────────┐
              │                 │
          PostgreSQL          Redis
              │                 │
              └────────┬────────┘
                       │
                 Observability
```

---

# 2. Escopo

Este threat model cobre principalmente:

- aplicação web;
- API REST;
- autenticação;
- sessões;
- autorização;
- RBAC;
- multi-tenancy;
- isolamento de dados;
- impersonation;
- PostgreSQL;
- Redis;
- infraestrutura de aplicação;
- comunicação HTTP;
- logs;
- auditoria;
- operações administrativas;
- CI/CD e deployment;
- comportamento do frontend como cliente não confiável.

O documento não pretende substituir:

- testes de segurança;
- análise de código;
- penetration testing;
- revisão de infraestrutura;
- análise de dependências;
- incident response plan;
- hardening específico do sistema operacional.

---

# 3. Objetivos de Segurança

Os principais objetivos de segurança são:

1. preservar a confidencialidade dos dados;
2. preservar a integridade dos dados;
3. manter disponibilidade adequada da aplicação;
4. impedir acesso não autorizado;
5. impedir privilege escalation;
6. impedir acesso cross-tenant;
7. proteger credenciais e sessões;
8. impedir manipulação indevida de operações administrativas;
9. manter rastreabilidade de operações relevantes;
10. reduzir o impacto de comprometimento de componentes individuais.

Esses objetivos podem ser resumidos como:

```text
Confidentiality
       +
Integrity
       +
Availability
       +
Accountability
       =
Security Objectives
```

---

# 4. Ativos

Os ativos relevantes para segurança incluem dados, credenciais, infraestrutura e contexto operacional.

## 4.1. Dados do Usuário

Informações relacionadas aos usuários da plataforma.

Exemplos:

- identidade;
- dados de conta;
- roles;
- permissões;
- estado da conta.

---

## 4.2. Dados do Tenant

Dados pertencentes às organizações utilizando o sistema.

Exemplos:

- produtos;
- estoque;
- vendas;
- dados administrativos;
- relatórios;
- registros relacionados às operações comerciais.

O principal requisito é impedir que dados de um tenant sejam expostos para outro.

---

## 4.3. Credenciais de Autenticação

Credenciais utilizadas para autenticação.

Comprometimento desses dados pode permitir:

```text
Credential Theft
      │
      ▼
Account Compromise
      │
      ▼
Unauthorized Access
```

---

## 4.4. Credenciais da Sessão

Incluem tokens e informações utilizadas para manter sessões autenticadas.

O comprometimento de uma sessão pode permitir que um atacante atue como o usuário legítimo enquanto a sessão permanecer válida.

---

## 4.5. Dados de Autorização

Inclui:

- roles;
- permissions;
- associações entre usuários e roles;
- contexto de tenant;
- contexto de plataforma.

A manipulação indevida desses dados pode resultar em privilege escalation.

---

## 4.6. Registros de Auditoria

Registros utilizados para rastrear operações relevantes.

Esses dados são importantes para:

- investigação;
- accountability;
- diagnóstico;
- análise de incidentes.

---

## 4.7. Infraestrutura

Inclui:

- VPS;
- containers;
- Nginx;
- PostgreSQL;
- Redis;
- sistema operacional;
- rede;
- pipeline de CI/CD.

Comprometimento da infraestrutura pode comprometer múltiplos tenants simultaneamente.

---

## 4.8. Código-Fonte

O código-fonte contém:

- regras de negócio;
- lógica de autorização;
- configuração;
- integrações;
- mecanismos de segurança.

O código deve ser considerado informação potencialmente sensível do ponto de vista operacional, mesmo quando o projeto possui componentes públicos.

---

# 5. Fronteiras de Confiança

Trust boundaries representam pontos onde dados ou autoridade passam de um contexto para outro.

O Exactum possui várias fronteiras relevantes.

```text
┌───────────────────────────────────────┐
│             Untrusted Client          │
│                                       │
│ Browser / HTTP Request                │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│             API Boundary              │
│                                       │
│ Authentication / Validation            │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│          Application Boundary         │
│                                       │
│ Authorization / Business Rules        │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│        Persistence Boundary            │
│                                       │
│ Repository / PostgreSQL                │
└───────────────────────────────────────┘
```

Outras fronteiras importantes incluem:

```text
Application ↔ Redis
Application ↔ Nginx
Application ↔ External Services
Developer ↔ CI/CD
CI/CD ↔ Production
Super Admin ↔ Tenant Context
```

Cada fronteira deve ser tratada como potencial ponto de ataque.

---

# 6. Agentes de Ameaça

O modelo considera diferentes tipos de atores.

## 6.1. Atacante Não Autenticado

Atacante sem conta autenticada.

Pode tentar:

- descobrir endpoints;
- explorar vulnerabilidades HTTP;
- realizar brute force;
- explorar validações;
- explorar erros;
- obter informações da aplicação.

---

## 6.2. Usuário Autenticado com Baixo Privilégio

Usuário legítimo com permissões limitadas.

Esse ator é especialmente relevante porque possui acesso válido à aplicação.

Pode tentar:

- acessar recursos de outro usuário;
- acessar outro tenant;
- elevar privilégios;
- manipular IDs;
- modificar payloads;
- explorar endpoints administrativos.

---

## 6.3. Conta Comprometida

Uma conta legítima comprometida por terceiros.

O atacante pode possuir:

- credenciais;
- sessão válida;
- permissões legítimas.

O objetivo pode ser utilizar essas permissões para ampliar o acesso.

---

## 6.4. Administrador de Tenant Malicioso

Administrador legítimo de um tenant que tenta:

- acessar outros tenants;
- abusar de privilégios;
- manipular roles;
- conceder permissões indevidas;
- explorar funcionalidades administrativas.

---

## 6.5. Insider Malicioso

Ator com acesso privilegiado à infraestrutura, código ou operações.

Pode tentar:

- acessar dados diretamente;
- alterar configuração;
- manipular logs;
- modificar deployments;
- acessar credenciais;
- explorar privilégios administrativos.

---

## 6.6. Infraestrutura Comprometida

Um atacante que consegue comprometer:

- VPS;
- container;
- banco;
- Redis;
- pipeline;
- credenciais de deployment.

Esse cenário possui impacto potencialmente elevado porque pode ultrapassar as barreiras da aplicação.

---

# 7. Superfície de Ataque

A superfície de ataque do Exactum inclui:

```text
                    Internet
                       │
                       ▼
                ┌────────────┐
                │   Nginx    │
                └─────┬──────┘
                      │
                      ▼
                ┌────────────┐
                │ Exactum API│
                └─────┬──────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      PostgreSQL    Redis      External APIs
          │
          ▼
       Data
```

Também fazem parte da superfície:

- autenticação;
- recuperação de senha;
- endpoints administrativos;
- endpoints de usuários;
- endpoints tenant-scoped;
- uploads, quando aplicável;
- documentação OpenAPI;
- Swagger UI;
- cookies;
- headers HTTP;
- parâmetros de URL;
- query parameters;
- request bodies;
- logs;
- mecanismos de impersonation;
- pipeline de deployment.

---

# 8. Classificação de Ameaças

As ameaças podem ser organizadas segundo categorias inspiradas no modelo STRIDE.

| Category               | Meaning                      | Examples               |
| ---------------------- | ---------------------------- | ---------------------- |
| Spoofing               | Impersonar uma identidade    | Roubo de sessão        |
| Tampering              | Alterar dados indevidamente  | Manipulação de payload |
| Repudiation            | Negar uma ação realizada     | Ausência de auditoria  |
| Information Disclosure | Obter informação indevida    | Cross-tenant access    |
| Denial of Service      | Impedir disponibilidade      | Rate abuse             |
| Elevation of Privilege | Obter privilégios superiores | RBAC bypass            |

O modelo abaixo utiliza essas categorias como referência conceitual.

---

# 9. Spoofing

## 9.1. Comprometimento de Credenciais

### Ameaça

Um atacante obtém credenciais válidas de um usuário.

### Impacto

O atacante pode autenticar-se como a vítima.

```text
Credential Theft
      │
      ▼
Authentication
      │
      ▼
Valid User Session
```

### Mitigações

- autenticação no backend;
- proteção de credenciais;
- gerenciamento de sessão;
- bloqueio de usuários;
- expiração de sessões;
- revogação de refresh tokens;
- cookies HttpOnly.

### Risco Residual

Uma credencial legítima comprometida continua sendo uma ameaça significativa enquanto mecanismos adicionais de proteção não estiverem presentes.

---

# 10. Roubo de Sessão

### Ameaça

Um atacante obtém um token ou sessão válida.

### Impacto

O atacante pode atuar como o usuário comprometido.

### Mitigações

- cookies HttpOnly;
- separação entre access token e refresh token;
- refresh token rotation;
- armazenamento de informações de sessão no Redis;
- revogação;
- logout invalidando sessão;
- controle de expiração.

### Risco Residual

Comprometimento do ambiente do usuário ou infraestrutura pode ainda permitir captura ou abuso de uma sessão válida.

---

# 11. Adulteração

## 11.1. Manipulação de Parâmetros da Requisição

### Ameaça

O atacante modifica parâmetros da requisição.

Exemplo:

```http
PUT /api/products/<id>
```

com payload alterado para tentar modificar:

```json
{
  "tenant_id": "other-tenant"
}
```

### Mitigações

- backend como autoridade;
- tenant context;
- authorization;
- tenant-scoped repositories;
- validação de entrada.

---

## 11.2. Manipulação de Role

### Ameaça

Um usuário tenta alterar diretamente sua role.

Exemplo conceitual:

```json
{
  "role": "super-admin"
}
```

### Impacto

Privilege escalation.

### Mitigações

Roles e permissions são controladas pelo backend e não devem ser aceitas como autoridade simplesmente porque foram fornecidas pelo cliente.

---

# 12. Escalada de Privilégio

Privilege escalation representa um dos riscos mais importantes em uma aplicação com RBAC.

## 12.1. Escalada Horizontal de Privilégio

Um usuário acessa recursos de outro usuário com privilégios equivalentes.

```text
User A
  │
  └──► Resource of User B
```

---

## 12.2. Escalada Vertical de Privilégio

Um usuário obtém privilégios superiores.

```text
User
  │
  ▼
Admin
```

### Mitigações

- RBAC;
- permissions granulares;
- authorization no backend;
- deny by default;
- tenant-scoped roles;
- validação de operações administrativas.

---

# 13. Acesso Cross-Tenant

Este é um dos riscos mais importantes do Exactum por se tratar de uma plataforma SaaS multi-tenant.

### Ameaça

Um usuário do tenant A acessa dados do tenant B.

```text
Tenant A
   │
   │ malicious request
   ▼
Tenant B Data
```

### Impacto

- exposição de dados;
- modificação indevida;
- exclusão indevida;
- comprometimento da confiança entre tenants.

### Mitigações

- tenant context;
- autorização;
- tenant-scoped queries;
- repositories;
- isolamento defensivo em múltiplas camadas;
- testes cross-tenant.

### Invariante de Segurança

```text
EffectiveTenant == ResourceTenant
```

para operações tenant-scoped.

---

# 14. BOLA / IDOR

Broken Object Level Authorization pode ocorrer quando um atacante utiliza um identificador válido para acessar um objeto que não deveria estar disponível.

Exemplo:

```http
GET /api/products/<uuid>
```

O UUID pode ser válido, mas pertencer a outro tenant.

### Mitigação

A busca deve considerar o contexto do tenant.

Conceitualmente:

```sql
SELECT *
FROM products
WHERE id = :id
  AND tenant_id = :tenant_id;
```

UUIDs reduzem previsibilidade, mas não substituem autorização.

---

# 15. Alteração Cross-Tenant

Uma variação particularmente grave ocorre quando o atacante consegue modificar um recurso pertencente a outro tenant.

Exemplo:

```text
Tenant A
   │
   ▼
PUT Product belonging to Tenant B
```

### Impacto

- corrupção de dados;
- alteração de estoque;
- alteração de vendas;
- perda de integridade.

### Mitigação

Toda operação de escrita deve validar simultaneamente:

```text
Identity
+
Permission
+
Tenant
+
Resource
```

---

# 16. Exclusão Cross-Tenant

A exclusão de recursos possui risco adicional porque pode causar perda de dados.

### Mitigações

- authorization;
- tenant scoping;
- soft delete quando aplicável;
- transações;
- audit logging;
- testes negativos.

---

# 17. Controle de Acesso Quebrado (Broken Access Control)

### Ameaça

Um endpoint executa uma operação protegida sem verificar adequadamente a autorização.

Exemplo:

```text
POST /api/admin/...
```

sem verificar a permission necessária.

### Mitigações

- autorização no backend;
- RBAC;
- permissions granulares;
- deny by default;
- testes de endpoints protegidos.

---

# 18. Confiança no Frontend

### Ameaça

O atacante modifica o frontend ou envia requisições diretamente sem utilizar a interface oficial.

Exemplo:

```text
Browser
   │
   ├── Normal UI
   │
   └── Direct HTTP Request
```

### Mitigação

O frontend não é considerado uma boundary de segurança.

Toda regra crítica é aplicada no backend.

```text
Frontend
   │
   ▼
UX
```

enquanto:

```text
Backend
   │
   ▼
Security Authority
```

---

# 19. Manipulação do Identificador do Tenant

### Ameaça

O atacante tenta alterar `tenant_id` em:

- URL;
- query parameter;
- body;
- header.

### Mitigação

O tenant efetivo deve derivar do contexto autenticado e das regras de autorização.

O valor enviado pelo cliente não deve substituir o contexto confiável.

---

# 20. Fixação de Sessão e Replay

### Ameaça

Um atacante tenta reutilizar ou fixar credenciais de sessão.

### Mitigações

- refresh token rotation;
- revocation;
- expiração;
- Redis session management;
- cookies HttpOnly;
- logout invalidation.

O gerenciamento de sessão é uma camada importante contra reutilização prolongada de credenciais.

---

# 21. Abuso de Refresh Token

### Ameaça

Comprometimento de um refresh token permite tentar obter novos access tokens.

### Mitigações

O fluxo de refresh utiliza:

```text
Refresh Token
      │
      ▼
Session Lookup
      │
      ▼
Redis
      │
      ▼
Token Rotation
      │
      ▼
New Access + Refresh Token
```

O token anterior deve deixar de ser válido após a rotação.

Isso reduz a janela de reutilização de um refresh token comprometido.

---

# 22. Abuso de Sessão Revogada

### Ameaça

Um usuário é bloqueado ou realiza logout, mas uma sessão previamente válida continua sendo aceita.

### Mitigações

- Redis-backed session management;
- refresh token revocation;
- user blocking;
- tenant suspension;
- session lifecycle management.

---

# 23. Abuso de Impersonation

Impersonation possui risco elevado por envolver autoridade de plataforma.

### Ameaças

Um atacante pode tentar:

- iniciar impersonation sem autorização;
- permanecer impersonando indefinidamente;
- executar operações de plataforma através do contexto impersonado;
- ocultar a identidade original;
- manipular o contexto do tenant.

### Mitigações

- operação explicitamente protegida;
- distinção entre identidade original e efetiva;
- contexto de tenant;
- auditoria;
- eventos de plataforma;
- término explícito da impersonation.

Conceitualmente:

```text
Original Admin
      │
      ▼
Impersonation
      │
      ├── Original Identity
      │
      └── Effective Identity
                │
                ▼
          Target Tenant
```

A identidade original deve permanecer rastreável.

---

# 24. Adulteração de Logs de Auditoria

### Ameaça

Um atacante tenta alterar ou remover evidências de uma operação.

### Impacto

Perda de accountability e dificuldade de investigação.

### Mitigações

- separação conceitual entre logs de infraestrutura, platform events e tenant audit;
- geração de eventos pelo backend;
- controle de acesso;
- persistência adequada;
- acesso restrito à infraestrutura.

### Risco Residual

Se um atacante obtiver controle administrativo completo da infraestrutura, registros locais podem ser comprometidos.

---

# 25. Exposição de Informações

## 25.1. Mensagens de Erro Sensíveis

### Ameaça

Mensagens de erro revelam:

- estrutura interna;
- queries;
- stack traces;
- credenciais;
- detalhes de infraestrutura.

### Mitigações

- tratamento centralizado de exceções;
- respostas padronizadas;
- logs separados das respostas HTTP.

---

## 25.2. Enumeração de Recursos

### Ameaça

Um atacante utiliza diferenças de respostas para descobrir recursos existentes.

### Mitigações

- autorização;
- respostas consistentes;
- UUIDs;
- ausência de informações desnecessárias.

UUIDs ajudam contra enumeração previsível, mas não devem ser considerados mecanismo de autorização.

---

# 26. Vazamento de Dados via Cache

### Ameaça

Dados de um tenant são retornados a outro através de cache.

Exemplo conceitual:

```text
Cache Key:
product:<id>
```

Se o escopo não for suficiente, uma entrada criada para Tenant A pode ser reutilizada por Tenant B.

### Mitigação

Quando necessário, incluir tenant no escopo da chave:

```text
tenant:<tenant_id>:product:<id>
```

O cache deve preservar os mesmos limites de segurança do banco de dados.

---

# 27. Comprometimento do Redis

Redis é utilizado para gerenciamento de sessões e pode conter informações sensíveis relacionadas ao ciclo de vida de autenticação.

### Ameaça

Acesso indevido ao Redis.

### Impacto

- comprometimento de sessões;
- manipulação de estado;
- revogação indevida;
- potencial comprometimento de autenticação.

### Mitigações

- Redis não deve ser exposto publicamente;
- acesso restrito pela infraestrutura;
- configuração segura;
- secrets fora do código;
- controle de rede.

---

# 28. Comprometimento do PostgreSQL

### Ameaça

Acesso direto não autorizado ao banco.

### Impacto

Potencial comprometimento de todos os tenants.

Esse cenário ultrapassa as proteções normais da aplicação.

### Mitigações

- credenciais protegidas;
- acesso de rede restrito;
- containers;
- least privilege;
- migrations controladas;
- backups;
- infraestrutura protegida.

### Risco Residual

Comprometimento do banco possui potencial de impacto sistêmico.

---

# 29. SQL Injection

### Ameaça

Entrada controlada pelo atacante altera a estrutura de uma query SQL.

### Mitigações

- SQLAlchemy;
- parâmetros;
- ORM;
- validação de entrada;
- ausência de construção insegura de SQL baseada diretamente em input.

Mesmo utilizando ORM, consultas SQL customizadas devem seguir as mesmas práticas de parametrização.

---

# 30. Negação de Serviço

### Ameaça

Um atacante envia quantidade excessiva de requisições ou explora operações custosas.

### Impacto

- degradação;
- indisponibilidade;
- aumento de consumo de CPU;
- aumento de conexões;
- sobrecarga do banco.

### Mitigações

- rate limiting;
- Nginx;
- controle de infraestrutura;
- otimização de queries;
- limites apropriados.

### Melhorias Futuras

A introdução de processamento assíncrono, filas e observabilidade de métricas pode melhorar a capacidade de detectar e absorver determinadas cargas.

---

# 31. Força Bruta

### Ameaça

Tentativas repetidas de autenticação para descobrir credenciais.

### Mitigações

- rate limiting;
- controle de sessão;
- bloqueio de usuário;
- monitoramento;
- respostas de autenticação apropriadas.

---

# 32. Abuso da Recuperação de Senha

### Ameaça

O mecanismo de recuperação de senha pode ser abusado para:

- assumir contas;
- enumerar usuários;
- reutilizar tokens;
- realizar ataques de engenharia social.

### Mitigações

- credenciais temporárias;
- expiração;
- fluxo controlado pelo backend;
- invalidação apropriada;
- não confiar no frontend.

---

# 33. CSRF

A autenticação por cookies introduz uma consideração importante: browsers enviam cookies automaticamente.

### Ameaça

Um site externo tenta induzir o browser do usuário a executar uma operação autenticada.

### Mitigações

O desenho de autenticação deve considerar:

- política de cookies;
- `SameSite`;
- `Secure`;
- validação de origem quando aplicável;
- proteção CSRF para operações sensíveis.

A configuração efetiva deve ser revisada conforme o modelo de deployment e os requisitos da aplicação.

---

# 34. Roubo de Cookie

### Ameaça

Um atacante obtém acesso aos cookies de autenticação.

### Mitigações

- `HttpOnly`;
- `Secure`;
- configuração adequada de `SameSite`;
- HTTPS;
- expiração;
- rotação de refresh tokens;
- revogação via Redis.

`HttpOnly` reduz o risco de acesso ao cookie através de JavaScript, mas não protege contra todos os tipos de comprometimento do ambiente do usuário.

---

# 35. XSS

### Ameaça

Código JavaScript malicioso é executado no contexto da aplicação.

### Impacto Potencial

- manipulação da interface;
- ações em nome do usuário;
- roubo de informações acessíveis ao JavaScript;
- exploração de funcionalidades.

### Mitigações

- escaping;
- validação;
- sanitização quando necessária;
- práticas seguras no frontend;
- cookies HttpOnly para credenciais.

Cookies HttpOnly reduzem o impacto de determinados cenários de roubo de sessão via JavaScript, mas não eliminam o risco de XSS.

---

# 36. Relação entre CSRF e XSS

Esses riscos não devem ser tratados como equivalentes.

```text
XSS
 │
 └── Executes code in application context

CSRF
 │
 └── Abuses browser's automatic credential submission
```

A presença de uma proteção não elimina automaticamente a outra.

---

# 37. SSRF

Se o backend realizar futuramente requisições HTTP baseadas em entrada controlada pelo usuário, SSRF deverá ser considerada.

Exemplo:

```text
User Input
    │
    ▼
Backend HTTP Request
    │
    ▼
Internal Service
```

No estado atual, qualquer funcionalidade que introduza esse comportamento deve passar por análise específica.

---

# 38. Riscos de Upload de Arquivos

Caso funcionalidades de upload sejam adicionadas, devem ser avaliados:

- file type validation;
- MIME validation;
- file size;
- path traversal;
- malware;
- armazenamento;
- nomes de arquivos;
- execução acidental;
- isolamento entre tenants.

Uploads devem sempre respeitar tenant isolation.

---

# 39. Riscos de Dependências

A aplicação depende de bibliotecas e componentes externos.

Exemplos:

- Flask;
- SQLAlchemy;
- Marshmallow;
- Redis client;
- PostgreSQL driver;
- React;
- Nginx;
- Docker;
- bibliotecas de frontend.

### Ameaça

Uma vulnerabilidade em dependência pode comprometer a aplicação.

### Mitigações

- atualização de dependências;
- lockfiles;
- revisão de mudanças;
- CI;
- análise de vulnerabilidades quando disponível.

---

# 40. Cadeia de Suprimentos (Supply Chain)

A cadeia de desenvolvimento também representa uma superfície de ataque.

```text
Developer
   │
   ▼
Git Repository
   │
   ▼
CI/CD
   │
   ▼
Build
   │
   ▼
Production
```

Um atacante que comprometa qualquer etapa pode potencialmente inserir código malicioso no ambiente de produção.

### Mitigações

- Git;
- revisão de código;
- CI;
- secrets protegidos;
- pipeline controlado;
- deployment via ambiente restrito.

---

# 41. Comprometimento de Credenciais de CI/CD

### Ameaça

Comprometimento de credenciais utilizadas pelo pipeline.

### Impacto

O atacante pode executar deployment ou acessar infraestrutura.

### Mitigações

- secrets armazenados no mecanismo de secrets do CI;
- acesso mínimo necessário;
- chaves separadas;
- rotação;
- restrição de permissões.

---

# 42. Escape de Container

### Ameaça

Uma vulnerabilidade permite que um atacante escape do container e acesse o host.

### Impacto

Comprometimento potencial da infraestrutura inteira.

### Mitigações

- imagens atualizadas;
- princípio de least privilege;
- redução de capabilities;
- isolamento de serviços;
- atualização do Docker;
- hardening do host.

---

# 43. Exposição do Nginx

Nginx funciona como reverse proxy e boundary de entrada.

### Ameaças

- configuração incorreta;
- exposição de portas;
- headers inadequados;
- proxy abuse;
- acesso direto a serviços internos.

### Mitigações

Arquitetura:

```text
Internet
   │
   ▼
 Nginx
   │
   ▼
 API
```

Serviços internos como PostgreSQL e Redis não devem ser expostos diretamente à Internet.

---

# 44. Gerenciamento de Secrets

### Ameaça

Credenciais são armazenadas:

- no código;
- no Git;
- em imagens;
- em logs;
- em arquivos públicos.

### Impacto

Comprometimento de:

- banco;
- Redis;
- JWT;
- serviços externos;
- infraestrutura.

### Mitigações

Secrets devem ser fornecidos por configuração de ambiente ou mecanismos apropriados de secret management.

Nunca devem ser versionados no repositório.

---

# 45. Riscos de Logging

Logs podem se tornar uma fonte de vazamento.

### Ameaça

Dados sensíveis são registrados inadvertidamente.

Exemplos:

```text
Authorization header
Password
Refresh token
Session secret
```

### Mitigação

Logs estruturados devem registrar contexto operacional sem armazenar segredos desnecessários.

---

# 46. Repúdio

### Ameaça

Um usuário nega ter realizado determinada operação.

### Mitigações

- audit logs;
- platform events;
- user context;
- tenant context;
- correlation IDs;
- timestamps.

Conceitualmente:

```text
Request
   │
   ├── request_id
   ├── user_uuid
   ├── tenant_uuid
   └── event
        │
        ▼
      Audit
```

---

# 47. Correlação e Investigação de Incidentes

Correlation IDs permitem relacionar diferentes registros de uma mesma operação.

```text
Request
  │
  ├── API Log
  ├── Application Log
  ├── Platform Event
  └── Audit Event
```

Todos podem ser relacionados através de um identificador de correlação.

Isso melhora significativamente a capacidade de investigação.

---

# 48. Matriz de Ameaças

A tabela abaixo resume as principais ameaças.

| Threat                  | Impact      | Primary Controls               | Residual Risk             |
| ----------------------- | ----------- | ------------------------------ | ------------------------- |
| Credential theft        | High        | Auth/session controls          | User environment          |
| Session theft           | High        | HttpOnly, rotation, revocation | Endpoint compromise       |
| Cross-tenant read       | Critical    | Tenant scoping                 | Implementation bugs       |
| Cross-tenant write      | Critical    | Authorization + tenant scoping | Implementation bugs       |
| Privilege escalation    | Critical    | RBAC + permissions             | Logic flaws               |
| BOLA / IDOR             | High        | Resource + tenant checks       | Missing checks            |
| Brute force             | Medium/High | Rate limiting                  | Distributed attacks       |
| CSRF                    | High        | Cookie/security policy         | Misconfiguration          |
| XSS                     | High        | Input/output controls          | Frontend flaws            |
| SQL injection           | Critical    | ORM/parameterization           | Unsafe raw SQL            |
| Redis compromise        | Critical    | Network isolation              | Infrastructure compromise |
| DB compromise           | Critical    | Network + credentials          | Host compromise           |
| DoS                     | High        | Rate limiting/Nginx            | Resource exhaustion       |
| Impersonation abuse     | Critical    | Explicit authorization + audit | Privileged compromise     |
| Secret leakage          | Critical    | Environment/secrets            | Operational mistakes      |
| Supply chain compromise | High        | CI/CD controls                 | Dependency compromise     |
| Audit tampering         | High        | Access control                 | Infrastructure compromise |

---

# 49. Priorização de Riscos

A prioridade de segurança deve considerar:

```text
Risk = Likelihood × Impact
```

As ameaças de maior prioridade são aquelas que podem comprometer múltiplos tenants ou permitir privilege escalation.

### Prioridade Crítica

- cross-tenant access;
- privilege escalation;
- authentication compromise;
- session compromise;
- impersonation abuse;
- database compromise;
- secret compromise.

### Prioridade Alta

- BOLA / IDOR;
- XSS;
- CSRF;
- SQL injection;
- DoS;
- CI/CD compromise.

### Prioridade Média

- information disclosure;
- resource enumeration;
- brute force;
- logging issues.

A classificação deve ser revisada conforme o sistema evolui.

---

# 50. Defesa em Profundidade

O Exactum utiliza uma abordagem de defesa em profundidade.

```text
                 ┌──────────────────┐
                 │     Network      │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │      Nginx       │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Authentication   │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Tenant Context   │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │  Authorization   │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Application Rules│
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Tenant-scoped DB │
                 └──────────────────┘
```

O objetivo é evitar que o comprometimento de uma única camada resulte automaticamente em comprometimento total.

---

# 51. Premissas de Segurança

O modelo assume que:

1. o servidor de produção possui configuração segura;
2. PostgreSQL não está diretamente exposto à Internet;
3. Redis não está diretamente exposto à Internet;
4. secrets de produção não estão versionados;
5. HTTPS é utilizado em produção;
6. dependências são mantidas razoavelmente atualizadas;
7. o ambiente de CI/CD é protegido;
8. o operador de infraestrutura possui controle apropriado sobre o servidor;
9. o backend é considerado a autoridade de segurança;
10. o frontend é considerado não confiável.

Caso essas premissas deixem de ser verdadeiras, o risco do sistema muda significativamente.

---

# 52. Invariantes de Segurança

Alguns invariantes devem permanecer verdadeiros independentemente da implementação.

## Identidade

```text
Authenticated identity must be established by trusted mechanisms.
```

## Autorização

```text
No permission → No operation.
```

## Isolamento de Tenant

```text
Tenant A cannot access Tenant B resources.
```

## Propriedade do Recurso

```text
Authorized user + wrong tenant ≠ authorized operation.
```

## Sessão

```text
Revoked session ≠ valid session.
```

## Privilégio de Plataforma

```text
Tenant privilege ≠ platform privilege.
```

## Frontend

```text
Frontend validation ≠ security control.
```

---

# 53. Estratégia de Testes de Segurança

O threat model deve ser refletido diretamente na estratégia de testes.

## Autenticação

Testar:

- credenciais inválidas;
- sessão expirada;
- refresh token inválido;
- refresh token revogado;
- logout;
- usuário bloqueado.

## Autorização

Testar:

- role sem permission;
- permission válida;
- privilege escalation;
- operações administrativas.

## Isolamento de Tenant

Testar:

- leitura cross-tenant;
- escrita cross-tenant;
- exclusão cross-tenant;
- alteração de `tenant_id`;
- IDs de recursos pertencentes a outros tenants.

## Impersonation

Testar:

- início;
- término;
- identidade original;
- identidade efetiva;
- tenant efetivo;
- permissões;
- auditoria.

## API

Testar:

- validação;
- erros;
- rate limiting;
- parâmetros manipulados;
- payloads inesperados.

---

# 54. Testes de Regressão de Segurança

Qualquer alteração em:

- autenticação;
- autorização;
- repositories;
- modelos;
- tenant context;
- sessões;
- impersonation;
- middleware;
- queries;

pode afetar diretamente a segurança.

Por isso, mudanças nesses componentes devem incluir testes de regressão.

Um refactor arquitetural não deve ser considerado seguro apenas porque os testes funcionais existentes continuam passando.

---

# 55. Detecção de Incidentes

Os mecanismos de observabilidade devem ajudar a identificar comportamentos anômalos.

Indicadores relevantes incluem:

- múltiplas falhas de autenticação;
- tentativas repetidas de autorização;
- alterações administrativas;
- impersonation;
- suspensão de tenants;
- mudanças de roles;
- comportamento anormal de sessões;
- erros inesperados;
- picos de requisições.

A correlação entre logs e eventos permite investigar a sequência de uma possível intrusão.

---

# 56. Considerações sobre Resposta a Incidentes

Em caso de suspeita de comprometimento, medidas possíveis incluem:

```text
Detect
  │
  ▼
Contain
  │
  ▼
Revoke Sessions
  │
  ▼
Block Accounts
  │
  ▼
Investigate Logs
  │
  ▼
Remediate
  │
  ▼
Recover
```

Dependendo da natureza do incidente, pode ser necessário:

- revogar sessões;
- bloquear usuários;
- rotacionar secrets;
- revisar logs;
- verificar alterações no banco;
- verificar deployments;
- revisar acessos à infraestrutura.

---

# 57. Risco Residual

Nenhum mecanismo elimina completamente o risco.

Mesmo com:

- autenticação;
- RBAC;
- tenant isolation;
- cookies protegidos;
- Redis;
- rate limiting;
- logs;
- auditoria;

ainda existem riscos associados a:

- vulnerabilidades de software;
- comprometimento do endpoint do usuário;
- credenciais roubadas;
- erros de configuração;
- dependências vulneráveis;
- comprometimento da infraestrutura;
- bugs de lógica;
- erros humanos;
- ataques desconhecidos.

O objetivo do threat model é reduzir e controlar esses riscos, não afirmar segurança absoluta.

---

# 58. Melhorias Futuras de Segurança

Conforme o Exactum evolui, possíveis melhorias incluem:

- análise automatizada de dependências;
- security scanning no CI;
- SAST;
- DAST;
- penetration testing;
- métricas de segurança;
- alertas;
- observabilidade com Prometheus/Grafana;
- políticas de autorização mais próximas dos domínios;
- maior isolamento de serviços;
- hardening adicional de containers;
- gestão centralizada de secrets;
- revisão periódica do threat model;
- testes automatizados de segurança;
- análise específica de workers e filas após introdução de processamento assíncrono.

Essas melhorias devem ser introduzidas conforme o risco e a maturidade do sistema justificarem.

---

# 59. Evolução do Modelo de Ameaças

O threat model não é um documento estático.

Ele deve ser revisado quando ocorrerem mudanças significativas, como:

- novos domínios;
- novos endpoints;
- novos tipos de usuários;
- novos mecanismos de autorização;
- introdução de filas;
- introdução de integrações externas;
- novos serviços;
- mudança de infraestrutura;
- alteração do modelo de autenticação;
- mudança no modelo de tenancy;
- introdução de funcionalidades de IA;
- exposição de novos dados.

Uma nova superfície de ataque deve resultar em uma nova avaliação de ameaças.

---

# 60. Checklist de Revisão de Segurança

Antes de considerar uma nova funcionalidade pronta, verificar:

### Autenticação

- [ ] A operação exige autenticação?
- [ ] A sessão é validada?
- [ ] O estado do usuário é considerado?

### Autorização

- [ ] A permission correta é exigida?
- [ ] O backend realiza a validação?
- [ ] Existe possibilidade de privilege escalation?

### Isolamento de Tenant

- [ ] O recurso pertence ao tenant correto?
- [ ] A query possui tenant scoping?
- [ ] O cliente consegue manipular o tenant?

### Dados

- [ ] Dados sensíveis podem aparecer na resposta?
- [ ] Logs podem registrar dados sensíveis?
- [ ] Cache respeita tenant isolation?

### Operações

- [ ] A operação é auditável?
- [ ] Existe correlation ID?
- [ ] Falhas são registradas adequadamente?

### Infraestrutura

- [ ] Novas portas foram expostas?
- [ ] Novos secrets foram introduzidos?
- [ ] Serviços internos permanecem protegidos?

---

# 61. Relação com a Arquitetura de Segurança

O threat model complementa os demais documentos de segurança.

```text
                    Security
                       │
       ┌───────────────┼────────────────┐
       │               │                │
Authentication   Authorization   Tenant Isolation
       │               │                │
       └───────────────┼────────────────┘
                       │
                Session Management
                       │
                       ▼
                 Threat Model
                       │
                       ▼
                Security Testing
```

Os outros documentos descrevem mecanismos específicos.

Este documento descreve **contra quais ameaças esses mecanismos devem proteger o sistema**.

---

# 62. Relação com a Arquitetura

As ameaças também influenciam a arquitetura.

Por exemplo:

```text
Tenant Isolation
      │
      ▼
Repository Scoping
      │
      ▼
Persistence Design
```

Da mesma forma:

```text
Authorization
      │
      ▼
Application Services
      │
      ▼
Domain Policies
```

E:

```text
Session Security
      │
      ▼
Redis
      │
      ▼
Infrastructure Isolation
```

Segurança, portanto, não é uma camada isolada adicionada depois da arquitetura.

Ela influencia as próprias fronteiras arquiteturais.

---

# 63. Princípios Norteadores

O modelo de ameaças do Exactum segue os seguintes princípios:

### Assumir que o Cliente Não é Confiável

Toda entrada externa deve ser considerada potencialmente maliciosa.

### Negar por Padrão

Operações não autorizadas devem ser rejeitadas.

### Verificar na Fronteira

Dados e identidade devem ser validados antes de atravessar fronteiras de confiança.

### Aplicar no Backend

Regras críticas de segurança pertencem ao backend.

### Escopo por Tenant

Dados tenant-scoped devem permanecer vinculados ao tenant autorizado.

### Menor Privilégio

Privilégios devem ser mínimos e explícitos.

### Defesa em Profundidade

Nenhuma camada deve ser considerada a única proteção.

### Falhar de Forma Fechada (Fail Closed)

Em caso de dúvida, a operação deve falhar de maneira segura.

### Auditar Ações Sensíveis à Segurança

Operações administrativas e de segurança devem possuir rastreabilidade.

### A Segurança Evolui com o Sistema

Novas funcionalidades devem resultar em novas avaliações de ameaça.

---

# 64. Resumo

O threat model do Exactum identifica como principais riscos:

- comprometimento de credenciais;
- roubo ou abuso de sessões;
- broken access control;
- privilege escalation;
- BOLA/IDOR;
- cross-tenant access;
- manipulação de parâmetros;
- abuso de impersonation;
- exposição de informações;
- SQL injection;
- XSS;
- CSRF;
- DoS;
- comprometimento de Redis ou PostgreSQL;
- vazamento de secrets;
- riscos de CI/CD e supply chain;
- comprometimento da infraestrutura.

Os principais mecanismos de mitigação são:

```text
Authentication
      +
Session Management
      +
RBAC / Authorization
      +
Tenant Isolation
      +
Input Validation
      +
Rate Limiting
      +
Secure Cookies
      +
Redis Session Control
      +
Auditability
      +
Observability
      +
Infrastructure Isolation
```

O princípio central é:

> **Segurança deve ser preservada mesmo quando o cliente é malicioso, os parâmetros são manipulados e uma camada individual falha.**

O threat model deve acompanhar a evolução do Exactum e ser revisado sempre que novas superfícies de ataque forem introduzidas.

---

# 65. Documentos Relacionados

- `docs/security/overview.md`
- `docs/security/authentication.md`
- `docs/security/authorization.md`
- `docs/security/session-management.md`
- `docs/security/tenant-isolation.md`
- `docs/architecture/overview.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/domain-boundaries.md`
- `docs/architecture/multi-tenancy.md`
- `docs/observability/overview.md`
- `docs/observability/platform-events.md`
- `docs/observability/audit-logging.md`
- `docs/observability/correlation.md`

---

# 66. Status

**Status:** Active
**Security Model:** Defense in depth
**Architecture:** Layered / evolving toward domain-oriented architecture
**Multi-Tenancy:** Logical isolation
**Review:** Updated as security architecture evolves
