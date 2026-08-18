# Application Architecture

## 1. Visão Geral

A aplicação backend do Exactum é atualmente organizada predominantemente
segundo uma arquitetura em camadas.

A estrutura separa responsabilidades relacionadas ao transporte HTTP,
processamento das operações de aplicação, persistência e infraestrutura.

Essa organização representa o estágio atual da aplicação na versão
`v0.2.x`.

A partir da `v0.3.x`, a arquitetura será progressivamente reorganizada
em torno de fronteiras de domínio mais explícitas, reduzindo o
acoplamento entre regras de negócio, framework e infraestrutura.

O objetivo não é introduzir DDD como um padrão formal de maneira
isolada, mas utilizar seus princípios de separação de responsabilidades,
modelagem de domínio e definição de fronteiras para tornar a aplicação
mais sustentável conforme sua complexidade aumenta.

---

## 2. Estado Arquitetural Atual

A arquitetura atual pode ser representada de forma simplificada como:

```text
                         HTTP Request
                              │
                              ▼
                    ┌───────────────────┐
                    │ Routes / Views    │
                    │ HTTP Controllers  │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Application       │
                    │ Services          │
                    └─────────┬─────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
          ┌───────────────┐       ┌───────────────┐
          │ Repositories  │       │ Infrastructure│
          │               │       │ Services      │
          └───────┬───────┘       └───────────────┘
                  │
                  ▼
          ┌───────────────┐
          │ Persistence   │
          │ SQLAlchemy    │
          └───────┬───────┘
                  │
                  ▼
             PostgreSQL
```
