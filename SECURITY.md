# Política de Segurança

## 1. Visão geral

O Exactum é um projeto de ERP Web em estágio **alpha**, desenvolvido para gestão de estoque, vendas e operações de ponto de venda (PDV).

A segurança é uma preocupação central da arquitetura, especialmente nos aspectos de autenticação, autorização, isolamento entre tenants, gerenciamento de sessões e rastreabilidade de operações administrativas.

Como o projeto continua em desenvolvimento, suas funcionalidades e seus controles de segurança estão sujeitos a mudanças. A existência de mecanismos de proteção não significa que o sistema esteja livre de vulnerabilidades ou que tenha sido submetido a uma auditoria de segurança independente.

## 2. Versões suportadas

Durante o estágio alpha, a manutenção e as correções de segurança são priorizadas conforme a evolução do projeto.

| Versão                            | Suporte de segurança      |
| --------------------------------- | ------------------------- |
| Versões alpha em desenvolvimento  | Avaliação caso a caso     |
| Versões antigas ou sem manutenção | Sem garantia de correções |

Não há, neste estágio, uma política formal de suporte de longo prazo (LTS). Recomenda-se utilizar a versão mais recente disponibilizada pelo projeto e acompanhar os avisos de segurança publicados pelos mantenedores.

## 3. Como reportar uma vulnerabilidade

O Exactum utiliza o recurso **Private Vulnerability Reporting** do GitHub para receber relatos de segurança de forma privada.

Para reportar uma vulnerabilidade:

1. Acesse a aba [Security do repositório](https://github.com/orafaeldantas/exactum-api/security).
2. Entre em **Advisories**.
3. Clique em **Report a vulnerability**.
4. Preencha o formulário com a descrição, os passos para reprodução e o impacto potencial da vulnerabilidade.

**Não publique detalhes de vulnerabilidades não corrigidas em issues públicas.**

Caso o recurso esteja indisponível, entre em contato com o mantenedor por um canal privado antes de divulgar detalhes técnicos publicamente.

Se não houver um canal privado disponível, entre em contato com o mantenedor por um meio privado associado ao projeto antes de publicar detalhes técnicos.

Sempre que possível, inclua:

- Uma descrição objetiva da vulnerabilidade.
- A versão, o commit ou o ambiente afetado.
- Os pré-requisitos para reproduzir o comportamento.
- Os passos mínimos para reprodução.
- O impacto potencial sobre confidencialidade, integridade ou disponibilidade.
- Evidências técnicas que não exponham dados pessoais, credenciais ou informações de terceiros.
- Uma sugestão de correção, caso exista.

Evite incluir tokens, senhas, chaves, dados reais de clientes ou informações confidenciais no relatório.

## 4. Tratamento dos relatos

Os relatos recebidos serão avaliados conforme sua gravidade, impacto, possibilidade de exploração e abrangência.

O processo esperado é:

1. **Recebimento:** análise inicial das informações enviadas.
2. **Validação:** tentativa de reprodução em ambiente controlado.
3. **Avaliação:** identificação dos componentes afetados e do impacto potencial.
4. **Correção:** desenvolvimento e validação de uma mitigação ou correção, quando aplicável.
5. **Divulgação:** publicação das informações relevantes após a avaliação e, quando possível, após a disponibilização de uma correção.

Como o Exactum é mantido em desenvolvimento, não há garantia de um prazo fixo para resposta, correção ou divulgação. A comunicação será conduzida conforme a disponibilidade dos mantenedores e a complexidade do problema.

Não existe, neste momento, um programa formal de recompensa financeira por vulnerabilidades (_bug bounty_).

## 5. Áreas relevantes para a segurança

Os relatos podem envolver, entre outros, os seguintes componentes:

- **Authentication:** validação da identidade e gerenciamento de credenciais.
- **Authorization:** verificação das permissões para executar operações.
- **Tenant Isolation:** prevenção de acesso indevido a dados pertencentes a outros tenants.
- **Session Management:** ciclo de vida, renovação e revogação de sessões.
- **Refresh Token Rotation:** renovação de tokens e detecção de reutilização indevida.
- **Impersonation:** rastreabilidade e restrições das operações realizadas por meio de impersonação administrativa.
- **API Security:** validação de entradas, exposição de dados e controle de acesso aos recursos.
- **Infrastructure Security:** configuração de containers, proxy reverso, aplicação e serviços de infraestrutura.

## 6. Controles existentes e limitações conhecidas

A arquitetura do Exactum inclui mecanismos como autenticação baseada em JWT armazenado em cookies HttpOnly, gerenciamento de sessões com Redis, autorização baseada em permissões, isolamento de tenants e registros de auditoria para operações relevantes.

Esses mecanismos devem ser avaliados considerando sua implementação efetiva, sua configuração e a interação entre os componentes.

### Limitações conhecidas

- A utilização de cookies HttpOnly reduz a exposição direta dos tokens ao JavaScript do navegador, mas **não impede ataques CSRF por si só**.
- A proteção CSRF ainda não está implementada.
- O projeto está em estágio alpha e não possui garantia de auditoria de segurança independente.
- A presença de controles de autenticação, autorização e isolamento não elimina a necessidade de testes de segurança contínuos.

As limitações acima não devem ser interpretadas como uma lista exaustiva de possíveis vulnerabilidades.

## 7. Conduta durante a pesquisa

Solicitamos que pesquisadores de segurança:

- Evitem acessar, modificar ou excluir dados de terceiros.
- Não interrompam serviços nem realizem testes destrutivos.
- Não utilizem a vulnerabilidade para obter acesso além do necessário à validação.
- Não divulguem publicamente informações que facilitem a exploração de uma falha ainda não corrigida.
- Interrompam os testes caso identifiquem exposição de dados reais ou impacto inesperado.

A pesquisa deve ser conduzida de forma responsável e limitada ao necessário para demonstrar o problema.

## 8. Escopo e responsabilidade

Esta política orienta o reporte responsável de vulnerabilidades relacionadas ao projeto Exactum. Ela não constitui garantia de ausência de falhas, contrato de suporte, autorização irrestrita para testes em ambientes de terceiros ou compromisso de prazo para correções.

O uso do software deve considerar seu estágio de desenvolvimento e os riscos associados à implantação em ambientes reais.

## 9. Referências

- [Repositório oficial do Exactum API](https://github.com/orafaeldantas/exactum-api)
- [Documentação de segurança do projeto](docs/security/overview.md)
- [Documentação de Authentication](docs/security/authentication.md)
- [Documentação de Authorization](docs/security/authorization.md)
- [Documentação de Session Management](docs/security/session-management.md)
- [Documentação de Tenant Isolation](docs/security/tenant-isolation.md)
- [Threat Model](docs/security/threat-model.md)
