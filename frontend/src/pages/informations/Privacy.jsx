export default function PrivacyPage() {
    return (
      <div className="space-y-8">
  
        <h1 className="text-4xl font-black">
          Política de Privacidade
        </h1>
  
        <div className="rounded-3xl border bg-white p-8">
  
          <h2 className="font-bold mb-4">
            Dados coletados
          </h2>
  
          <p className="text-gray-600">
            Coletamos apenas informações
            necessárias para autenticação,
            operação do sistema e suporte.
          </p>
  
        </div>
  
        <div className="rounded-3xl border bg-white p-8">
  
          <h2 className="font-bold mb-4">
            Segurança
          </h2>
  
          <p className="text-gray-600">
            Aplicamos medidas técnicas para
            proteger os dados armazenados.
          </p>
  
        </div>
  
      </div>
    );
  }