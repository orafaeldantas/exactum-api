# System Context

## 1. Visão Geral

O Exactum é uma plataforma SaaS multi-tenant de ERP voltada para pequenas e médias empresas do varejo.

Em nível de sistema, o Exactum atua como o núcleo responsável por processar operações de negócio relacionadas a produtos, estoque, vendas, usuários, autorização e administração de tenants.

A plataforma é acessada principalmente através de uma interface web e expõe uma API REST responsável por autenticação, autorização, processamento das operações de negócio e acesso aos dados persistidos.

O sistema também mantém integração com componentes de infraestrutura responsáveis por persistência, gestão de sessões e suporte operacional.

Este documento descreve o Exactum a partir de seu contexto externo, identificando os principais atores, sistemas e fronteiras que interagem com a plataforma.

---

## 2. Objetivos do Sistema

O Exactum tem como principais objetivos:

- Centralizar operações de estoque e vendas.
- Fornecer um fluxo operacional de ponto de venda (PDV).
- Permitir administração de usuários, papéis e permissões.
- Suportar múltiplas empresas dentro da mesma plataforma.
- Garantir isolamento lógico entre tenants.
- Fornecer indicadores operacionais e gerenciais.
- Registrar atividades relevantes para auditoria.
- Fornecer mecanismos de administração em nível de plataforma.
- Manter uma arquitetura capaz de evoluir conforme a complexidade do sistema aumenta.

Além das funcionalidades diretamente voltadas ao usuário, o projeto possui como objetivo arquitetural evoluir progressivamente suas fronteiras internas, reduzindo o acoplamento entre regras de negócio, framework e infraestrutura.

---

## 3. Fronteira do Sistema

A fronteira do Exactum compreende os componentes responsáveis diretamente pelo comportamento da plataforma.

### Dentro da fronteira

Fazem parte do sistema:

- API REST do Exactum.
- Regras de negócio.
- Autenticação.
- Autorização.
- Gestão de usuários.
- Gestão de tenants.
- Gestão de produtos.
- Gestão de estoque.
- Gestão de vendas.
- PDV.
- Dashboards e indicadores.
- Gestão de sessões.
- Auditoria.
- Eventos de plataforma.
- Logging operacional.
- Persistência das informações de negócio.

### Fora da fronteira

São considerados componentes externos ao núcleo lógico da aplicação:

- Navegador do usuário.
- Cliente HTTP/API.
- Nginx.
- PostgreSQL como mecanismo de persistência.
- Redis como mecanismo de gestão de sessão e tokens.
- Infraestrutura de hospedagem.
- Futuros provedores e serviços externos previstos no roadmap.

A distinção entre sistema e infraestrutura não significa que esses componentes sejam independentes do funcionamento do Exactum. Eles representam dependências externas utilizadas pela aplicação para executar suas responsabilidades.

---

## 4. Atores

### 4.1 Usuário do Tenant

Representa um usuário pertencente a uma empresa cadastrada no Exactum.

Pode executar operações de negócio de acordo com as permissões atribuídas ao seu papel.

Dependendo de suas permissões, pode:

- Consultar produtos.
- Realizar operações de estoque.
- Registrar vendas.
- Utilizar o PDV.
- Consultar indicadores.
- Executar outras operações autorizadas pelo tenant.

O usuário nunca deve ser considerado autorizado apenas por estar autenticado. A autorização é determinada pelo contexto do tenant, papel e permissões aplicáveis à operação.

---

### 4.2 Administrador do Tenant

Representa um usuário com privilégios administrativos dentro de um tenant.

Além das operações disponíveis aos demais usuários, pode possuir responsabilidades como:

- Gerenciamento de usuários.
- Gerenciamento de papéis.
- Gerenciamento de permissões.
- Administração de recursos do tenant.
- Consulta de informações de auditoria.
- Administração operacional da empresa.

As capacidades efetivamente disponíveis são determinadas pelo modelo de autorização da plataforma.

---

### 4.3 Super-admin

Representa um operador administrativo em nível de plataforma.

Diferentemente dos administradores de tenant, o super-admin atua fora do escopo normal de uma única empresa.

Suas responsabilidades podem incluir:

- Administração de tenants.
- Suspensão e reativação de tenants.
- Administração de contas em nível de plataforma.
- Operações administrativas.
- Diagnóstico de problemas.
- Impersonate administrativo.

Operações realizadas pelo super-admin possuem tratamento específico de auditoria e eventos de plataforma.

---

### 4.4 Operador de Plataforma

O sistema também pode ser considerado sob a perspectiva operacional de quem mantém sua infraestrutura.

Esse ator não representa necessariamente um usuário funcional do ERP.

Suas responsabilidades estão relacionadas a:

- Operação da infraestrutura.
- Diagnóstico de falhas.
- Análise de logs.
- Monitoramento da aplicação.
- Deploy.
- Manutenção do ambiente.

Esse contexto é particularmente relevante para a evolução futura da observabilidade do Exactum.

---

## 5. Sistemas e Componentes Externos

### 5.1 Navegador Web

O navegador representa o principal cliente do Exactum.

Ele executa a aplicação frontend construída com React e é responsável pela interação do usuário com a plataforma.

O navegador:

- Apresenta a interface do ERP.
- Envia requisições HTTP para a API.
- Mantém os cookies de autenticação fornecidos pelo backend.
- Apresenta respostas e erros ao usuário.
- Utiliza informações de autorização para controlar a experiência de usuário.

O navegador **não é uma fronteira de segurança**.

Toda operação sensível deve ser validada novamente pelo backend.

---

### 5.2 Nginx

O Nginx atua como proxy reverso entre o cliente e a aplicação.

Seu papel inclui:

- Receber requisições HTTP/HTTPS.
- Encaminhar requisições para a API.
- Servir o frontend quando aplicável.
- Atuar como ponto de entrada da aplicação publicada.

O Nginx faz parte da infraestrutura de execução e não contém as regras de negócio do Exactum.

---

### 5.3 PostgreSQL

O PostgreSQL é o mecanismo de persistência relacional utilizado pelo Exactum.

É responsável pelo armazenamento de:

- Usuários.
- Tenants.
- Produtos.
- Estoque.
- Vendas.
- Papéis.
- Permissões.
- Registros de auditoria.
- Eventos e demais entidades persistentes da aplicação.

A aplicação acessa o banco através da camada de persistência.

O PostgreSQL é considerado infraestrutura de persistência e não deve conter regras de negócio que pertençam ao núcleo da aplicação, salvo mecanismos de integridade próprios do banco.

---

### 5.4 Redis

O Redis é utilizado como componente de suporte à gestão de sessão.

Entre suas responsabilidades atuais estão:

- Armazenamento associado a refresh tokens.
- Controle de sessões.
- Revogação de sessões.
- Invalidação de tokens.
- Suporte a operações relacionadas ao ciclo de vida da autenticação.

O Redis não é a fonte primária dos dados de negócio do Exactum.

---

## 6. Contexto do Sistema

A visão simplificada do contexto do Exactum pode ser representada da seguinte forma:

```text
                         ┌───────────────────────┐
                         │     Usuário Tenant    │
                         └───────────┬───────────┘
                                     │
                                     │
                         ┌───────────▼───────────┐
                         │                       │
                         │      Navegador        │
                         │   React / Vite        │
                         │                       │
                         └───────────┬───────────┘
                                     │
                                  HTTPS
                                     │
                         ┌───────────▼───────────┐
                         │                       │
                         │        Nginx          │
                         │    Reverse Proxy      │
                         │                       │
                         └───────────┬───────────┘
                                     │
                                     │ HTTP
                                     │
                         ┌───────────▼───────────┐
                         │                       │
                         │     Exactum API       │
                         │        Flask          │
                         │                       │
                         │  Business & Security  │
                         │                       │
                         └───────┬───────┬───────┘
                                 │       │
                     ┌───────────┘       └───────────┐
                     │                               │
                     ▼                               ▼
          ┌────────────────────┐          ┌────────────────────┐
          │                    │          │                    │
          │     PostgreSQL     │          │       Redis        │
          │                    │          │                    │
          │ Business Data      │          │ Sessions / Tokens  │
          │                    │          │                    │
          └────────────────────┘          └────────────────────┘


          ┌──────────────────────┐
          │    Super-admin       │
          └──────────┬───────────┘
                     │
                     │ Administrative Operations
                     │
                     ▼
              ┌───────────────┐
              │  Exactum API  │
              └───────────────┘
```
