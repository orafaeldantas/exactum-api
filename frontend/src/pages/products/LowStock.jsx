import { useEffect, useState, useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService"; 
import { TenantContext } from "../../context/TenantContext";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";


import { Pencil, ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';

export default function LowStockProducts() {
  const navigate = useNavigate();
  
  const { lowStock = [], loadProducts, loading } = getProducts(); 
  const { tenantData } = useContext(TenantContext);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const productsPerPage = 10;

  const LOW_STOCK_THRESHOLD = tenantData.global_min_stock;

  
  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = lowStock.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (page - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (

    <LoadingOverlay loading={loading} minDuration={250} message="Buscando dados...">
      <div className="min-h-screen bg-gray-50 p-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={32} />
              Alerta de Estoque
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Produtos abaixo do limite de segurança ({LOW_STOCK_THRESHOLD} un.)
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="rounded-xl bg-white border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
              onClick={() => navigate("/products")}
            >
              Ver Todo Inventário
            </button>
            <button className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-700 active:scale-95">
              Gerar Ordem de Compra
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Itens Críticos</p>
              <p className="text-2xl font-bold text-gray-800">{lowStock.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Filtrar alertas..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" 
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Produto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Qtd. Atual</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Nível de Urgência</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      <div className="text-xs text-gray-400">ID: {product.uuid}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${product.stock_quantity <= 3 ? 'text-red-700 bg-red-100' : 'text-orange-700 bg-orange-100'}`}>
                        {product.stock_quantity} un.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${product.stock_quantity <= 3 ? 'bg-red-500' : 'bg-orange-500'}`} 
                            style={{ width: `${Math.min((product.stock_quantity / LOW_STOCK_THRESHOLD) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {product.stock_quantity <= 3 ? 'Crítico' : 'Baixo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
                          onClick={() => navigate(`/product/edit/${product.uuid}`)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Repor
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors">
                          <ShoppingCart className="w-3.5 h-3.5" /> Comprar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="text-gray-300" size={40} />
                        <p className="text-gray-500 font-medium">Nenhum alerta de estoque encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)} 
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700">
              <span className="text-orange-600">{page}</span>
              <span className="text-gray-400">/</span>
              <span>{totalPages}</span>
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)} 
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
}