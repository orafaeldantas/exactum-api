import { Lock, FileText, Sparkles } from "lucide-react";

const SECTIONS = [
  { id: "introducao", title: "Introdução" },
  { id: "dados-coletados", title: "Dados que Coletamos" },
  { id: "finalidade", title: "Finalidade do Tratamento" },
  { id: "base-legal", title: "Base Legal (LGPD)" },
  { id: "compartilhamento", title: "Compartilhamento de Dados" },
  { id: "seguranca", title: "Armazenamento e Segurança" },
  { id: "retencao", title: "Retenção e Eliminação" },
  { id: "direitos", title: "Seus Direitos" },
  { id: "cookies", title: "Cookies" },
  { id: "alteracoes", title: "Alterações desta Política" },
  { id: "contato", title: "Encarregado de Dados" },
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

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-slate-500">Última atualização: 3 de julho de 2026</p>
        </div>

        {/* Alpha notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-800">
            <span className="font-bold">Exactum está em versão Alpha.</span> Nossas práticas de
            tratamento de dados podem evoluir conforme o produto amadurece. Alterações relevantes
            serão sempre comunicadas.
          </p>
        </div>

        <Section id="introducao" number="1" title="Introdução">
          <p>
            Esta Política de Privacidade descreve como a Exactum Tecnologia ("Exactum", "nós")
            coleta, utiliza, armazena e protege os dados pessoais tratados por meio da plataforma
            Exactum ("Plataforma"). Ao utilizar a Plataforma, você concorda com as práticas descritas
            aqui, em conjunto com os nossos Termos de Uso.
          </p>
        </Section>

        <Section id="dados-coletados" number="2" title="Dados que Coletamos">
          <p>Coletamos apenas os dados necessários para autenticação, operação do sistema e suporte, incluindo:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-semibold text-slate-700">Dados de cadastro:</span> nome, e-mail, cargo e dados da empresa (tenant);</li>
            <li><span className="font-semibold text-slate-700">Dados operacionais:</span> produtos, estoque, vendas e demais informações que você insere na Plataforma para gerir seu negócio;</li>
            <li><span className="font-semibold text-slate-700">Dados técnicos:</span> endereço IP, tipo de dispositivo, navegador e logs de acesso, usados para segurança e diagnóstico;</li>
            <li><span className="font-semibold text-slate-700">Comunicações de suporte:</span> mensagens trocadas com nosso time quando você solicita ajuda.</li>
          </ul>
          <p>Não coletamos dados sensíveis (como origem racial, saúde ou convicção religiosa) além do estritamente necessário para a operação da conta.</p>
        </Section>

        <Section id="finalidade" number="3" title="Finalidade do Tratamento">
          <p>Utilizamos os dados coletados para:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Viabilizar a autenticação e o funcionamento da sua conta;</li>
            <li>Operar as funcionalidades da Plataforma (estoque, PDV, relatórios, alertas);</li>
            <li>Prestar suporte técnico e responder solicitações;</li>
            <li>Melhorar a Plataforma, identificar falhas e priorizar novas funcionalidades;</li>
            <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
          </ul>
          <p>Não utilizamos seus dados operacionais (estoque, vendas, clientes) para fins publicitários ou de venda a terceiros.</p>
        </Section>

        <Section id="base-legal" number="4" title="Base Legal (LGPD)">
          <p>
            O tratamento de dados pessoais pela Exactum observa a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018 — LGPD), fundamentando-se principalmente em:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-semibold text-slate-700">Execução de contrato:</span> para viabilizar o uso da Plataforma que você contratou;</li>
            <li><span className="font-semibold text-slate-700">Legítimo interesse:</span> para segurança, prevenção a fraudes e melhoria do serviço;</li>
            <li><span className="font-semibold text-slate-700">Cumprimento de obrigação legal:</span> quando exigido por lei ou autoridade competente;</li>
            <li><span className="font-semibold text-slate-700">Consentimento:</span> quando aplicável, para comunicações opcionais.</li>
          </ul>
        </Section>

        <Section id="compartilhamento" number="5" title="Compartilhamento de Dados">
          <p>
            Não vendemos seus dados pessoais. Podemos compartilhar informações limitadas com:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Provedores de infraestrutura em nuvem contratados para hospedagem e operação da Plataforma;</li>
            <li>Ferramentas de suporte e comunicação utilizadas pelo nosso time;</li>
            <li>Autoridades públicas, quando exigido por lei, ordem judicial ou regulação aplicável.</li>
          </ul>
          <p>Todos os terceiros envolvidos no processamento de dados são contratualmente obrigados a manter padrões de confidencialidade e segurança compatíveis com esta Política.</p>
        </Section>

        <Section id="seguranca" number="6" title="Armazenamento e Segurança">
          <p>
            Aplicamos medidas técnicas e organizacionais para proteger os dados armazenados,
            incluindo controle de acesso por papel, criptografia de credenciais e segregação de
            dados entre diferentes tenants da Plataforma.
          </p>
          <p>
            Nenhum sistema é completamente livre de risco. Durante a fase Alpha, seguimos reforçando
            continuamente nossas práticas de segurança conforme a Plataforma evolui.
          </p>
        </Section>

        <Section id="retencao" number="7" title="Retenção e Eliminação">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa e pelo período adicional necessário
            para cumprir obrigações legais, resolver disputas ou fazer cumprir nossos acordos. Após o
            encerramento da conta, os dados são eliminados ou anonimizados, respeitando prazos legais
            de guarda quando aplicável.
          </p>
        </Section>

        <Section id="direitos" number="8" title="Seus Direitos">
          <p>Nos termos da LGPD, você tem direito a:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Confirmar a existência de tratamento e acessar seus dados;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Solicitar a portabilidade dos seus dados a outro fornecedor;</li>
            <li>Revogar o consentimento e se opor a tratamentos realizados com base nele;</li>
            <li>Solicitar informações sobre com quem seus dados foram compartilhados.</li>
          </ul>
          <p>Para exercer qualquer desses direitos, entre em contato pelos canais indicados na seção "Encarregado de Dados" abaixo.</p>
        </Section>

        <Section id="cookies" number="9" title="Cookies">
          <p>
            Utilizamos cookies essenciais para manter sua sessão autenticada e garantir o
            funcionamento básico da Plataforma. Ainda não utilizamos cookies de rastreamento
            publicitário. Caso isso mude no futuro, esta seção será atualizada com as opções de
            controle disponíveis.
          </p>
        </Section>

        <Section id="alteracoes" number="10" title="Alterações desta Política">
          <p>
            Esta Política pode ser atualizada periodicamente, especialmente durante a fase Alpha.
            Alterações relevantes serão comunicadas por e-mail ou aviso dentro da Plataforma antes
            de entrarem em vigor.
          </p>
        </Section>

        <Section id="contato" number="11" title="Encarregado de Dados">
          <p>
            Dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais podem
            ser encaminhadas ao nosso encarregado de dados (DPO) através dos canais de suporte
            disponíveis na Plataforma.
          </p>
        </Section>

      </div>
    </div>
  );
}