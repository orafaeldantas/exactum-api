# Changelog

Todas as mudanças relevantes do Exactum são registradas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue, quando aplicável, os princípios do [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.2.0]

### Added

- Documentação arquitetural para descrever o contexto do sistema, a arquitetura da aplicação e os limites de domínio.
- Architecture Decision Records (ADRs) para registrar decisões arquiteturais relevantes e suas justificativas.
- Documentação de segurança para Authentication, Authorization, Session Management, Tenant Isolation e Threat Model.
- Documentação de Observability, incluindo Structured Logging, Correlation ID, Platform Events e Audit Logging.
- Documentação da API, incluindo convenções, Authentication, tratamento de erros e versionamento.
- Documentação de banco de dados, migrations e Soft Delete.
- Documentação operacional para desenvolvimento, Docker, Nginx, deployment e runbooks.
- Documentação da estratégia de testes e do pipeline de CI.
- Política de segurança para orientar o reporte responsável de vulnerabilidades.

### Changed

- Organização da documentação para tornar mais explícitas as responsabilidades arquiteturais, os limites de segurança e as práticas operacionais.
- Descrição da arquitetura em camadas, com evolução orientada a domínios e redução planejada do acoplamento entre a lógica da aplicação e o framework.
- Documentação do modelo multi-tenant com Shared Database / Shared Schema e isolamento por tenant.
- Documentação do uso de UUIDs públicos, mantendo a distinção conceitual entre identidade pública do recurso e identidade interna de persistência.
- Documentação da autenticação por cookies HttpOnly, do gerenciamento de sessões com Redis e da Refresh Token Rotation.
- Documentação do modelo de impersonação administrativa, incluindo a distinção entre a identidade original e a identidade representada.
- Esclarecimento da diferença entre logs operacionais, Platform Events e Audit Logging.
- Distinção entre o estado arquitetural atual e as evoluções planejadas, evitando descrever componentes futuros como funcionalidades já implementadas.

### Security

- Documentação dos controles existentes de autenticação, autorização, gerenciamento de sessões e isolamento de tenants.
- Registro explícito de limitações conhecidas, incluindo a ausência de proteção CSRF implementada.

### Documentation

- Consolidação da documentação técnica em `docs/`, organizada por arquitetura, segurança, observabilidade, API, banco de dados, operações e testes.
- Inclusão de referências cruzadas entre a documentação e as decisões arquiteturais registradas em ADRs.

---

[0.2.0]: https://github.com/orafaeldantas/exactum-api/compare/HEAD...HEAD
