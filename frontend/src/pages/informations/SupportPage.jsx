import { useState } from "react";
import {
  LifeBuoy,
  ChevronDown,
  Send,
  Clock,
  FlaskConical,
} from "lucide-react";

const FAQS = [
  {
    question: "O que significa a versão Alpha?",
    answer:
      "Significa que o Exactum ainda está em desenvolvimento ativo. Funcionalidades podem mudar, novas telas são adicionadas com frequência e é possível encontrar instabilidades pontuais. Estamos construindo o produto junto dos primeiros usuários.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Aplicamos controle de acesso por papel, isolamento de dados entre empresas (tenants) e boas práticas de segurança. Você pode ler todos os detalhes na nossa Política de Privacidade.",
  },
  {
    question: "Encontrei um bug. O que eu faço?",
    answer:
      "Nosso canal de contato ainda está sendo configurado. Assim que estiver disponível, essa será a melhor forma de nos avisar com detalhes sobre o que aconteceu.",
  },
  {
    question: "Como faço upgrade do meu plano?",
    answer:
      "Hoje todas as contas estão no plano Starter, gratuito durante o Alpha. Os planos Professional e Enterprise ainda estão em definição — quando estiverem disponíveis, avisaremos com antecedência.",
  },
  {
    question: "Posso cancelar minha conta quando quiser?",
    answer:
      "Sim, a qualquer momento. Assim que nosso canal de contato estiver ativo, você poderá solicitar o encerramento por ali, conforme descrito nos nossos Termos de Uso.",
  },
];

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="text-sm font-semibold text-slate-800">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid overflow-hidden transition-all duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-slate-500">{answer}</p>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { value: "duvida", label: "Dúvida geral" },
  { value: "bug", label: "Bug / Problema técnico" },
  { value: "sugestao", label: "Sugestão" },
  { value: "comercial", label: "Comercial" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const formDisabled = true;

  const disabledInputClass =
    "w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-400 outline-none placeholder:text-slate-300";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Suporte</h1>
        <p className="mt-3 text-slate-500">Estamos aqui para ajudar — conte com a gente.</p>
      </div>

      {/* Alpha notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm leading-relaxed text-amber-800">
          <span className="font-bold">Estamos em fase Alpha</span> e nosso canal oficial de contato
          ainda está sendo configurado. O formulário abaixo mostra como vai funcionar, mas o envio
          estará disponível em breve.
        </p>
      </div>

      {/* FAQ */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Perguntas frequentes</h2>
        <p className="mb-2 text-sm text-slate-500">Talvez sua dúvida já esteja respondida aqui.</p>
        <div>
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* Contact form — visible preview, submission disabled */}
      <section className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
          <Clock className="h-3 w-3" />
          Em breve
        </span>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Fale com a gente</h2>
            <p className="text-sm text-slate-500">Esse canal ainda está sendo configurado.</p>
          </div>
        </div>

        <fieldset disabled={formDisabled} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                Nome
              </label>
              <input id="name" type="text" placeholder="Seu nome" className={disabledInputClass} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                E-mail
              </label>
              <input id="email" type="email" placeholder="voce@empresa.com" className={disabledInputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Categoria
            </label>
            <select id="category" defaultValue="duvida" className={disabledInputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Mensagem
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Conte com detalhes o que você precisa..."
              className={`${disabledInputClass} resize-none`}
            />
          </div>

          <button
            type="button"
            disabled
            title="Disponível em breve"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 py-3.5 text-sm font-bold text-slate-400 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            Enviar mensagem
          </button>
        </fieldset>
      </section>
    </div>
  );
}