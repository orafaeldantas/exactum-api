import { Link } from "react-router-dom";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  Users,
  ArrowRight,
} from "lucide-react";

const OFFERINGS = [
  {
    icon: LayoutDashboard,
    title: "Controle de estoque",
    description: "Um único painel para acompanhar produtos, quantidades e movimentações em tempo real.",
  },
  {
    icon: Bell,
    title: "Gestão operacional",
    description: "PDV, histórico de vendas e cadastro centralizados, sem depender de planilhas soltas.",
  },
  {
    icon: BarChart3,
    title: "Indicadores e relatórios",
    description: "Visão clara do que está acontecendo na operação, para decisões baseadas em dados reais.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e rastreabilidade",
    description: "Controle de acessos por papel e registro de logs de toda a atividade relevante do sistema.",
  },
];

const VALUES = [
  {
    icon: Sparkles,
    title: "Dados que viram decisão",
    description: "Não basta registrar informação — ela precisa ajudar alguém a decidir melhor no dia a dia.",
  },
  {
    icon: FlaskConical,
    title: "Construção em público",
    description: "Estamos em fase Alpha e isso é proposital: preferimos evoluir junto dos primeiros usuários a lançar algo fechado.",
  },
  {
    icon: Users,
    title: "Feito para quem opera",
    description: "Pensado para quem lida com estoque e vendas no dia a dia, não só para quem olha relatório no fim do mês.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Quem Somos</h1>
        <p className="mt-3 text-slate-500">Conheça a proposta do Exactum.</p>
      </div>

      {/* Missão */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Nossa missão</h2>
        <p className="text-slate-600 leading-8">
          O Exactum nasceu com o objetivo de simplificar operações empresariais, centralizar
          informações e transformar dados em decisões. Acreditamos que gestão de estoque não
          deveria depender de planilhas soltas, memória e boa vontade, e sim de um sistema que
          mostra, com clareza, o que está acontecendo na operação agora.
        </p>
      </section>

      {/* O que oferecemos */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">O que oferecemos</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {OFFERINGS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rumo à IA preditiva */}
      <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Para onde estamos indo</h2>
            <p className="text-slate-600 leading-relaxed">
              Estamos trabalhando para que o Exactum vá além de registrar o presente: o próximo
              passo é ajudar a antecipar o futuro, com previsão de demanda e recomendações de
              reposição baseadas em inteligência artificial. Essa parte do produto ainda está em
              desenvolvimento, preferimos entregar algo confiável a prometer algo que não existe.
            </p>
          </div>
        </div>
      </section>

      {/* Nossos valores */}
      <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Nossos valores</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-gray-100 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA final */}
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-slate-900 p-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Pronto para organizar seu estoque?</h2>
        <p className="max-w-md text-sm text-slate-400">
          Crie sua empresa no Exactum e comece a centralizar sua operação hoje mesmo.
        </p>
        <Link
          to="/create-tenant"
          className="group mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.5)]"
        >
          Criar minha empresa
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}