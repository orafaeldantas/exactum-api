# Exactum 📦📈

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

O **Exactum** é um sistema inteligente de controle e previsão de estoque focado em transformar a gestão de pequenos e médios comércios. Ao centralizar entradas e saídas, o sistema utiliza dados históricos para sugerir compras assertivas, otimizando o capital de giro e eliminando rupturas de estoque.

---

## 📋 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Benefícios](#-arquitetura-e-benefícios)
- [Como Executar](#-como-executar)
- [Fluxo de Uso](#-fluxo-de-uso)

---

## 📖 Sobre o Projeto

Pequenos comerciantes frequentemente sofrem com o "achismo" na hora de repor mercadorias. O Exactum resolve isso através de:
- **Redução de Estoque Parado:** Identifica produtos com baixa rotatividade.
- **Prevenção de Perda de Vendas:** Alerta quando produtos essenciais estão prestes a acabar.
- **Previsão Baseada em Dados:** Calcula a necessidade de estoque para períodos futuros (ex: próximos 7 ou 30 dias).

---

## 🛠 Tecnologias Utilizadas

### Core Backend
* **Flask:** Framework web WSGI minimalista. Escolhido pela sua flexibilidade e velocidade de desenvolvimento, permitindo que o Exactum seja leve e eficiente.
* **PostgreSQL:** Banco de dados relacional de alto desempenho. Garante que os registros de movimentação de estoque sejam armazenados com máxima integridade e segurança.

### Infraestrutura e Ferramentas
* **Docker & Docker Compose:** Utilizados para a conteinerização da aplicação. Isso garante que o ambiente de desenvolvimento seja idêntico ao de produção, facilitando o deploy e a colaboração.
* **Flask-Migrations (Alembic):** Gerencia o versionamento do banco de dados. Essencial para que a estrutura das tabelas evolua sem perda de dados históricos.

---

## 🏗 Arquitetura e Benefícios

| Tecnologia | Função no Exactum | Valor Agregado |
| :--- | :--- | :--- |
| **Docker** | Isolamento de ambiente | Você sobe o projeto com um comando, sem configurar Python ou Postgres localmente. |
| **PostgreSQL** | Persistência robusta | Capacidade de lidar com milhares de registros de vendas com consistência ACID. |
| **Migrations** | Controle de versão de DB | Permite desfazer alterações no banco de dados tão fácil quanto desfazer um commit no Git. |
| **Flask** | Engine de Negócio | Facilidade para implementar a lógica de previsão e rotas de API. |

---

## 🚀 Como Executar

### Pré-requisitos
* [Docker](https://www.docker.com/) instalado.
* [Docker Compose](https://docs.docker.com/compose/) instalado.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/exactum.git](https://github.com/seu-usuario/exactum.git)
   cd exactum
   ```

2. **Configure as variáveis de ambiente:**

    Crie um arquivo .env na raiz (se necessário) ou utilize as configurações padrão do docker-compose.yml.

3. **Suba o container:**

    ```bash
    docker-compose up -d --build
    ```

4. **Prepare o Banco de Dados:**

    Execute as migrações para criar as tabelas necessárias:
    ```bash
    docker-compose exec web flask db upgrade
    ```

5. **Prepare o Banco de Dados:**

    Acesse a aplicação: O Exactum estará rodando em:
    ```bash 
    http://localhost:5000
    ```

**💡 Fluxo de Uso**

    - Cadastro: O usuário cadastra seus produtos e quantidades iniciais.

    - Movimentação: Diariamente, registram-se as vendas (saídas) e reposições (entradas).

    - Análise: O sistema processa o histórico.

    - Decisão: O gestor visualiza o relatório de previsão e planeja suas compras com precisão.

**🛣 Roadmap de Evolução**

    [ ] Implementação de Dashboards dinâmicos.

    [ ] Integração via API com sistemas de PDV externos.

    [ ] Módulo de inteligência artificial para previsão de sazonalidade.


Desenvolvido por Rafael Dantas - 2026