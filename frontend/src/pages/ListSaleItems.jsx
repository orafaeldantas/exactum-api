import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSales } from "../services/saleService";  // Supondo que você tenha essa função
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Hash, 
  ShoppingCart, 
  Loader2, 
  Printer,
  Info
} from "lucide-react";

export default function SaleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSales(id);
        setSale(data);
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Carregando Detalhes...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-8 text-center">
        <p>Venda não encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header com Navegação */}
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
            <p className="text-sm text-gray-500 font-medium">Pedido #{sale.id} • {new Date(sale.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
        >
          <Printer className="h-4 w-4" /> Imprimir Comprovante
        </button>
      </div>

      {/* KPI / Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Info className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informações Gerais</p>
          </div>
          <p className="text-sm font-semibold text-gray-600">Pagamento: <span className="text-gray-800">{sale.payment_method}</span></p>
          <p className="text-sm font-semibold text-gray-600">Data: <span className="text-gray-800">{new Date(sale.created_at).toLocaleTimeString('pt-BR')}</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 mb-2 text-purple-500">
            <ShoppingCart className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume de Itens</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            {sale.items?.reduce((acc, item) => acc + item.quantity, 0)} <span className="text-sm font-medium text-gray-500">unidades</span>
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <Tag className="w-4 h-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Total</p>
          </div>
          <h3 className="text-2xl font-black text-gray-800">
            R$ {Number(sale.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Itens da Venda */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Produtos do Pedido
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">SKU / ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Produto</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">Qtd</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Preço Unit.</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.items?.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-mono font-medium text-gray-600">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    R$ {Number(item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                    R$ {(item.quantity * (item.price || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50/50">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase">Total Geral:</td>
                <td className="px-6 py-4 text-right text-xl font-black text-blue-600">
                  R$ {Number(sale.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}