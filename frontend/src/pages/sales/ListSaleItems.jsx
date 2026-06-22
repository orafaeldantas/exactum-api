import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSaleItems } from "../../services/saleService";  
import { 
  ArrowLeft, Package, Tag, Hash, ShoppingBag, ShoppingCart, Loader2, Printer, Info 
} from "lucide-react";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";

export default function SaleDetails() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const { saleItems, loadSaleItems, loading } = getSaleItems();

  useEffect(() => {
    loadSaleItems(uuid);
  }, [uuid]);

  const sale = saleItems?.sale;
  const items = (saleItems?.items || [])

  if (!sale && !loading) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-gray-600">Venda não encontrada ou erro ao carregar.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (

    <LoadingOverlay loading={loading} minDuration={250} message="Buscando dados..."> 
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detalhes da Venda</h1>
            <p className="text-sm text-gray-500 font-medium">
              Pedido #{sale?.id} • {sale?.created_at ? new Date(sale?.created_at).toLocaleDateString('pt-BR') : 'Data Indisponível'}
            </p>
          </div>
        </div>
        
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
          <Printer className="h-4 w-4" /> Imprimir Comprovante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Info className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informações Gerais</p>
          </div>
          <p className="text-sm font-semibold text-gray-600">Pagamento: <span className="text-gray-800">{sale?.payment_method || "N/A"}</span></p>
          <p className="text-sm font-semibold text-gray-600">Hora: <span className="text-gray-800">
            {sale?.created_at ? new Date(sale?.created_at).toLocaleTimeString('pt-BR') : '--:--'}
          </span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 mb-2 text-purple-500">
            <ShoppingCart className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume de Itens</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            {items.reduce((acc, item) => acc + (item.quantity || 0), 0)} 
            <span className="text-sm font-medium text-gray-500 ml-2">unidades</span>
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <Tag className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Total</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            R$ {Number(sale?.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Produtos do Pedido
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-600">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-600">Produto</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-600">Qtd</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (        
                <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-gray-600">
                      {item.sku || <span className="text-gray-300">N/A</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                    R$ {(Number(item.item_price || 0) * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50/50 border-t border-gray-100">
          <div className="flex justify-end px-6 py-4">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mr-8 flex items-center">Total do Pedido:</span>
             <span className="text-xl font-black text-blue-600">
                R$ {Number(sale?.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </span>
          </div>
        </div>
      </div>
    </div>
    </LoadingOverlay> 
  );
}