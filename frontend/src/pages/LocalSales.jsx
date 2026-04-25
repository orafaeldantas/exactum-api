import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft,
  CreditCard,
  Banknote,
  QrCode,
  CreditCard as DebitIcon
} from 'lucide-react';

const VendaLocal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [isDbConnected, setIsDbConnected] = useState(false);

  // --- Sale States ---
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // --- Product & Search States ---
  const [productsDb, setProductsDb] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // --- Financial & Payment States ---
  const [discountPercent, setDiscountPercent] = useState(0);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("money"); // money, pix, debit, credit, installments
  const [installments, setInstallments] = useState(1);

  // Load products from DB on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiFetch("/products");
        const data = await response.json();
        setProductsDb(data || []);
        setIsDbConnected(true);
      } catch (err) {
        console.error("Error loading products:", err);
        setIsDbConnected(false);
      }
    };
    fetchProducts();

    // Update clock every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter products based on search input (ID or Name)
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = productsDb.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase()) || 
        p.id.toString().includes(value)
      );
      setSearchSuggestions(filtered);
      setIsSuggestionsOpen(true);
    } else {
      setSearchSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  // Add item to cart or increment quantity if already present
  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock_quantity || 0,
        prediction: product.previsao_dias || 5,
        sku: product.sku
      }]);
    }
    setSearchTerm("");
    setIsSuggestionsOpen(false);
    searchInputRef.current?.focus();
  };

  // Manual quantity adjustment
  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  // Logic to send data for backend
   const sendData = async (e) => {
    e.preventDefault();
    const data = {
      "sale": {
        "paymentMethod": paymentMethod,
        "totalToPay": totalToPay,
        "item_quantity": cartItems.length
      },
      "itemsSale": cartItems
    }

    console.log(data)

    try {

      const response = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Erro ao executar venda");
      }

    } catch (err) {
      console.log(err)
    }

  }

  // Financial summary calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const totalToPay = subtotal - discountAmount;
  const changeAmount = Number(amountReceived) > totalToPay ? Number(amountReceived) - totalToPay : 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 p-6 gap-6 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Main Sales Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Exactum <span className="text-blue-600">| PDV</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Terminal de Vendas</p>
          </div>
          <div className="flex gap-4 items-center px-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Banco de Dados</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isDbConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className={`text-xs font-bold ${isDbConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isDbConnected ? "Conectado" : "Offline"}
                  </span>
                </div>
              </div>
          </div>
        </header>

        {/* SEARCH INPUT & DROPDOWN */}
        <div className="relative z-30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-white border-2 border-transparent focus:border-blue-600 focus:outline-none rounded-xl p-4 pl-12 shadow-sm transition-all text-lg"
              placeholder="Bipar código ou pesquisar nome do produto..."
              value={searchTerm}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
            />
          </div>

          {isSuggestionsOpen && searchSuggestions.length > 0 && (            
            <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-2xl border border-slate-200 max-h-72 overflow-y-auto z-50">
              {searchSuggestions.map((p) => (               
                <div key={p.id} onClick={() => addToCart(p)} className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 group">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 group-hover:text-blue-700">{p.name}</span>
                    <span className={p.stock_quantity > 0 ? "text-[10px] text-slate-400 font-mono" : "text-[10px] text-red-400 font-mono bg-red"}>
                      ID: {p.id} | {p.stock_quantity > 0 ? `ESTOQUE : ${p.stock_quantity}`: "SEM ESTOQUE"}
                    </span>
                  </div>
                  <span className="font-black text-blue-600 italic">R$ {Number(p.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ITEMS TABLE */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 text-[10px] uppercase">Produto</th>
                  <th className="p-4 font-semibold text-slate-600 text-[10px] uppercase text-center">Qtd</th>
                  <th className="p-4 font-semibold text-slate-600 text-[10px] uppercase">Unitário</th>
                  <th className="p-4 font-semibold text-slate-600 text-[10px] uppercase text-right">Subtotal</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="p-4 text-sm">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase font-bold">REF: {item.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3 bg-slate-100 w-fit mx-auto rounded-lg p-1 border border-slate-200">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md text-slate-600 shadow-sm"><Minus size={14}/></button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md text-slate-600 shadow-sm"><Plus size={14}/></button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium text-sm">R$ {item.price.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-slate-900 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</td>
                    <td className="p-4 text-right text-sm">
                      <button onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cartItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60 py-32">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="font-medium text-sm italic">Carrinho vazio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Summary & Payment */}
      <aside className="w-96 flex flex-col gap-4">
        
        {/* OPERATOR INFO */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest group" onClick={() => navigate("/dashboard")}>
              <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors"><ChevronLeft size={14} className="text-white" /></div>
              Dashboard
            </button>
            <div className="text-right font-mono text-sm text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-full">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-sm uppercase shadow-lg shadow-blue-900/40">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase">Operador</p>
              <p className="text-sm font-bold text-slate-200">{user?.username || 'Administrador'}</p>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS PANEL */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-blue-600" /> Exactum AI Insights
          </h3>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {cartItems.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-400 animate-in slide-in-from-right">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Risco de Ruptura</p>
                <p className="text-xs text-amber-800 leading-tight">
                  <b>{cartItems[cartItems.length - 1]?.name}</b> atingirá o estoque zero em <b>{cartItems[cartItems.length - 1]?.prediction} dias</b>.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic text-center mt-10 px-6 font-medium">Bipe um produto para análise preditiva de estoque em tempo real.</p>
            )}
          </div>
        </div>

        {/* CHECKOUT SECTION */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 space-y-4">
          
          {/* PAYMENT METHODS SELECTOR */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center mb-1">Forma de Pagamento</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'money', icon: Banknote, label: 'Dinheiro' },
                { id: 'pix', icon: QrCode, label: 'PIX' },
                { id: 'debit', icon: DebitIcon, label: 'Débito' },
                { id: 'credit', icon: CreditCard, label: 'Crédito' },
                { id: 'installments', icon: CreditCard, label: 'Parcelado' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                    paymentMethod === m.id ? 'bg-blue-600 border-blue-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <m.icon size={16} />
                  <span className="text-[8px] font-bold mt-1 uppercase leading-none">{m.label}</span>
                </button>
              ))}
            </div>
            
            {/* Installment Selector (visible only for 'installments' method) */}
            {paymentMethod === 'installments' && (
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-bold text-blue-400 focus:outline-none"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}x de R$ {(totalToPay / (i+1)).toFixed(2)}</option>
                ))}
              </select>
            )}
          </div>

          {/* CASH RECEIVED INPUT (visible only for 'money' method) */}
          {paymentMethod === "money" && (
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">             
                <span className="text-[10px] font-black text-slate-400 uppercase">Valor Recebido</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-blue-400">R$</span>
                  <input 
                    type="text" 
                    className="bg-transparent text-right font-black text-white focus:outline-none w-24 text-xl"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value.replace(',', '.'))}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
            )}

          {/* DISCOUNT & FINAL CALCULATION AREA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] font-black text-slate-400 uppercase">Desconto (%)</span>
              <input 
                type="text" 
                className="bg-transparent text-right font-black text-blue-400 focus:outline-none w-16 text-lg"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value.replace(/\D/g, '')))}
                onFocus={(e) => e.target.select()}
              />
            </div>
            
            <div className="h-px bg-slate-800 my-2" />

            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-blue-500 font-black text-xs uppercase tracking-tighter">Total Líquido</span>
                <span className="text-4xl font-black tracking-tighter text-white">R$ {totalToPay.toFixed(2)}</span>
              </div>
              {/* Dynamic change display */}
              {Number(amountReceived) > 0 && changeAmount > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-[10px] font-black uppercase">Troco</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">R$ {changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <button className="group w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] 
                  shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex justify-center items-center gap-3"
                  onClick={sendData}                 
          >
            <CheckCircle size={20} /> Finalizar Venda       
          </button>
        </div>
      </aside>

    </div>
  );
};

export default VendaLocal;