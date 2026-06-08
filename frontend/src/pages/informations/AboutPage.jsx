export default function AboutPage() {
    return (
      <div className="space-y-8">
  
        <div>
  
          <h1 className="text-4xl font-black text-gray-900">
            Quem Somos
          </h1>
  
          <p className="mt-3 text-gray-500">
            Conheça a proposta do Exactum.
          </p>
  
        </div>
  
        <section className="rounded-3xl border bg-white p-8">
  
          <h2 className="text-xl font-bold mb-4">
            Nossa missão
          </h2>
  
          <p className="text-gray-600 leading-8">
            O Exactum nasceu com o objetivo de
            simplificar operações empresariais,
            centralizar informações e transformar
            dados em decisões.
          </p>
  
        </section>
  
        <section className="rounded-3xl border bg-white p-8">
  
          <h2 className="font-bold mb-4">
            O que oferecemos
          </h2>
  
          <ul className="space-y-3 text-gray-600">
  
            <li>Controle de estoque</li>
  
            <li>Gestão operacional</li>
  
            <li>Indicadores e relatórios</li>
  
            <li>Segurança e rastreabilidade</li>
  
          </ul>
  
        </section>
  
      </div>
    );
  }