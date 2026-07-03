import { FileText, Sparkles } from "lucide-react";

const SECTIONS = [
  { id: "aceitacao", title: "Aceitação dos Termos" },
  { id: "alpha", title: "Sobre a Versão Alpha" },
  { id: "cadastro", title: "Cadastro e Conta" },
  { id: "uso-permitido", title: "Uso Permitido" },
  { id: "responsabilidades", title: "Responsabilidades do Usuário" },
  { id: "planos", title: "Planos e Pagamento" },
  { id: "propriedade", title: "Propriedade Intelectual" },
  { id: "disponibilidade", title: "Disponibilidade e Limitação de Responsabilidade" },
  { id: "rescisao", title: "Rescisão e Cancelamento" },
  { id: "alteracoes", title: "Alterações destes Termos" },
  { id: "legislacao", title: "Legislação Aplicável e Foro" },
  { id: "contato", title: "Contato" },
];

function Section({ id, number, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
          {number}
        </span>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-12">
      {/* Smooth scroll for the in-page anchor nav */}
      <style>{`html { scroll-behavior: smooth; }`}</style>

      {/* In-page navigation — desktop only */}
      <aside className="sticky top-28 hidden lg:block">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Neste documento</p>
        <nav className="flex flex-col gap-1 border-l border-gray-200">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="-ml-px border-l-2 border-transparent px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:border-blue-200 hover:text-blue-600"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Termos de Uso</h1>
          <p className="mt-2 text-sm text-slate-500">Última atualização: 3 de julho de 2026</p>
        </div>

        {/* Alpha notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-800">
            <span className="font-bold">Exactum está em versão Alpha.</span> Estes termos podem ser
            atualizados com frequência conforme a plataforma evolui. Recomendamos revisitar esta
            página periodicamente.
          </p>
        </div>

        <Section id="aceitacao" number="1" title="Aceitação dos Termos">
          <p>
            Ao criar uma conta ou utilizar a plataforma Exactum ("Plataforma"), você concorda
            integralmente com estes Termos de Uso e com a nossa Política de Privacidade. Caso não
            concorde com qualquer disposição aqui descrita, solicitamos que não utilize a Plataforma.
          </p>
          <p>
            Estes termos constituem um acordo entre você (ou a empresa que você representa) e a
            Exactum Tecnologia, aplicável a todo o uso do sistema, incluindo o painel web, aplicativos
            e integrações eventualmente disponibilizadas.
          </p>
        </Section>

        <Section id="alpha" number="2" title="Sobre a Versão Alpha">
          <p>
            A Plataforma encontra-se atualmente em fase de desenvolvimento ativo ("Alpha"). Isso
            significa que:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Funcionalidades podem ser adicionadas, alteradas ou removidas sem aviso prévio;</li>
            <li>Podem ocorrer instabilidades, indisponibilidades temporárias ou perda de dados;</li>
            <li>Não há garantia de disponibilidade contínua (SLA) durante esta fase;</li>
            <li>Recomendamos manter backups próprios de informações críticas do seu negócio.</li>
          </ul>
          <p>
            Ao utilizar a Plataforma durante o período Alpha, você reconhece e aceita esses riscos,
            entendendo que se trata de um produto em construção.
          </p>
        </Section>

        <Section id="cadastro" number="3" title="Cadastro e Conta">
          <p>
            Para utilizar a Plataforma, é necessário criar uma conta ("tenant") fornecendo informações
            verdadeiras, completas e atualizadas sobre você e sua empresa. Você é responsável por
            manter essas informações atualizadas.
          </p>
          <p>
            Cada tenant pode conter múltiplos usuários com diferentes níveis de permissão (administrador,
            gerente de vendas, vendedor, estoquista), conforme configurado pelo administrador da conta.
            A gestão de acessos internos é de responsabilidade do administrador do tenant.
          </p>
        </Section>

        <Section id="uso-permitido" number="4" title="Uso Permitido">
          <p>
            A Plataforma deve ser utilizada exclusivamente para fins lícitos de gestão empresarial,
            incluindo controle de estoque, ponto de venda, cadastro de produtos e acompanhamento de
            vendas. É vedado:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Utilizar a Plataforma para fins ilegais ou fraudulentos;</li>
            <li>Tentar acessar áreas, dados ou tenants de terceiros sem autorização;</li>
            <li>Realizar engenharia reversa, extração massiva de dados ou testes de invasão sem consentimento prévio por escrito;</li>
            <li>Sobrecarregar deliberadamente a infraestrutura da Plataforma (ex: ataques de negação de serviço);</li>
            <li>Revender ou sublicenciar o acesso à Plataforma sem autorização.</li>
          </ul>
        </Section>

        <Section id="responsabilidades" number="5" title="Responsabilidades do Usuário">
          <p>
            Você é responsável pela proteção de suas credenciais de acesso (e-mail e senha), devendo
            mantê-las em sigilo e não compartilhá-las com terceiros. Qualquer atividade realizada com
            suas credenciais será considerada de sua responsabilidade.
          </p>
          <p>
            Caso identifique uso não autorizado da sua conta, você deve nos notificar imediatamente
            para que possamos tomar as medidas cabíveis, incluindo o bloqueio temporário do acesso.
          </p>
          <p>
            Você também é responsável pela veracidade dos dados inseridos na Plataforma (produtos,
            preços, estoque, vendas), já que a Exactum não valida o conteúdo cadastrado por cada tenant.
          </p>
        </Section>

        <Section id="planos" number="6" title="Planos e Pagamento">
          <p>
            Durante a fase Alpha, a Plataforma é disponibilizada no plano Starter sem custo. Planos
            pagos (Professional e Enterprise) estão em definição e serão comunicados com antecedência
            antes de qualquer cobrança, incluindo valores, condições e prazos de transição.
          </p>
          <p>
            Nenhuma cobrança será realizada sem consentimento explícito do usuário. Eventuais mudanças
            de plano no futuro respeitarão um período de aviso prévio razoável.
          </p>
        </Section>

        <Section id="propriedade" number="7" title="Propriedade Intelectual">
          <p>
            Todo o código-fonte, design, marca, logotipo e demais elementos da Plataforma são de
            propriedade da Exactum Tecnologia e protegidos por legislação de propriedade intelectual
            aplicável. É vedada a reprodução, distribuição ou modificação sem autorização prévia.
          </p>
          <p>
            Os dados inseridos por você na Plataforma (produtos, estoque, vendas, clientes) permanecem
            de sua propriedade. A Exactum não reivindica direitos sobre esses dados, utilizando-os
            exclusivamente para prestação do serviço.
          </p>
        </Section>

        <Section id="disponibilidade" number="8" title="Disponibilidade e Limitação de Responsabilidade">
          <p>
            Envidamos esforços razoáveis para manter a Plataforma disponível e funcionando
            corretamente, mas não garantimos operação ininterrupta ou livre de erros, especialmente
            durante a fase Alpha.
          </p>
          <p>
            Na máxima extensão permitida pela legislação aplicável, a Exactum não se responsabiliza
            por perdas indiretas, lucros cessantes ou danos decorrentes de indisponibilidade,
            instabilidade ou perda de dados durante o uso da Plataforma nesta fase de desenvolvimento.
          </p>
        </Section>

        <Section id="rescisao" number="9" title="Rescisão e Cancelamento">
          <p>
            Você pode encerrar sua conta a qualquer momento, mediante solicitação através dos canais
            de suporte. A Exactum também pode suspender ou encerrar contas que violem estes Termos,
            mediante notificação prévia sempre que possível.
          </p>
          <p>
            Após o encerramento, seus dados poderão ser mantidos por um período razoável para fins de
            backup e cumprimento de obrigações legais, sendo posteriormente eliminados conforme nossa
            Política de Privacidade.
          </p>
        </Section>

        <Section id="alteracoes" number="10" title="Alterações destes Termos">
          <p>
            Estes Termos podem ser atualizados periodicamente, especialmente durante a fase Alpha, para
            refletir mudanças na Plataforma ou na legislação aplicável. Alterações relevantes serão
            comunicadas por e-mail ou aviso dentro da Plataforma. O uso continuado após as alterações
            constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section id="legislacao" number="11" title="Legislação Aplicável e Foro">
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo a Lei
            Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Fica eleito o foro da comarca da
            sede da Exactum Tecnologia para dirimir eventuais controvérsias, com renúncia a qualquer
            outro, por mais privilegiado que seja.
          </p>
        </Section>

        <Section id="contato" number="12" title="Contato">
          <p>
            Dúvidas sobre estes Termos de Uso podem ser encaminhadas para nosso time através dos
            canais de suporte disponíveis na Plataforma.
          </p>
        </Section>
        
      </div>
    </div>
  );
}