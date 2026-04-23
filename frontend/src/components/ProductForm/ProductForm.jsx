import { useState, useEffect } from "react";
import { Package, AlignLeft, DollarSign, Boxes, Tag, LayoutGrid, Activity } from "lucide-react";

export default function ProductForm({
  initialData = {},
  onSubmit,
  submitText,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || "");
      setStockQuantity(initialData.stock_quantity || 0);
      setSku(initialData.sku || "");
      setCategory(initialData.category || "");
      setIsActive(initialData.is_active ?? true);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stockQuantity),
      sku,
      category,
      is_active: isActive
    });
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700";

  return (
    <div className="flex items-center justify-center p-5 bg-gray-50/50">
      <form 
        className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm " 
        onSubmit={handleSubmit}
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {submitText.includes("Criar") ? "Novo Produto" : "Editar Produto"}
          </h2>
          <p className="text-sm text-gray-500">Informe os detalhes técnicos do produto</p>
        </div>

        <div className="space-y-5">
          {/* Nome */}
          <div>
            <label className={labelClass}>
              <Package className="w-4 h-4 text-slate-400" /> Nome do Produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Teclado Mecânico RGB"
              className={inputClass}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelClass}>
              <AlignLeft className="w-4 h-4 text-slate-400" /> Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Breve descrição do produto..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Grid: Preço e Estoque */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <DollarSign className="w-4 h-4 text-slate-400" /> Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Boxes className="w-4 h-4 text-slate-400" /> Estoque Inicial
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Grid: SKU e Categoria */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <Tag className="w-4 h-4 text-slate-400" /> SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-123"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <LayoutGrid className="w-4 h-4 text-slate-400" /> Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Eletrônicos"
                className={inputClass}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>
              <Activity className="w-4 h-4 text-slate-400" /> Status de Venda
            </label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className={inputClass}
            >
              <option value="true">Disponível (Ativo)</option>
              <option value="false">Indisponível (Inativo)</option>
            </select>
          </div>

          {/* Botão de Ação */}
          <div className="pt-4">
            <button
              type="submit"
              className="
                w-full
                rounded-xl
                bg-blue-600
                px-5
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-md
                transition-all
                duration-200
                hover:bg-blue-700
                hover:shadow-lg
                active:scale-[0.98]
              "
            >
              {submitText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}