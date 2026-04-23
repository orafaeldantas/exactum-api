import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Search, ShoppingCart, Trash2, Plus, Minus, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';

const VendaLocal = () => {
  const [itensVenda, setItensVenda] = useState([]);
  const [busca, setBusca] = useState("");
  const [hora, setHora] = useState(new Date());

  const { user } = useContext(AuthContext);
  
  // Estados para cálculos financeiros
  const [desconto, setDesconto] = useState(0);
  const [valorPago, setValorPago] = useState("");
  
  const inputBusca = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const adicionarProduto = (e) => {
    e.preventDefault();
    if (!busca) return;
    
    const novoItem = {
      id: Math.random(),
      nome: `Produto Exemplo ${busca}`,
      preco: 45.90,
      quantidade: 1,
      estoqueAtual: 10,
      previsaoDias: 15 
    };

    setItensVenda([...itensVenda, novoItem]);
    setBusca("");
    inputBusca.current.focus();
  };

  // Lógica de cálculos
  const totalBruto = itensVenda.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = totalBruto * (desconto / 100);
  const totalFinal = totalBruto - valorDesconto;
  const troco = Number(valorPago) > totalFinal ? Number(valorPago) - totalFinal : 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 p-6 gap-6 font-sans">
      
      {/* COLUNA ESQUERDA: Registro de Itens */}
      <div className="flex-1 flex flex-col gap-4">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Exactum <span className="text-blue-600">| PDV</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Terminal de Saída Local</p>
          </div>
          <div className="flex gap-4 items-center px-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status do Banco</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-600 text-emerald-600">PostgreSQL Conectado</span>
                </div>
              </div>
          </div>
        </header>

        <form onSubmit={adicionarProduto} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            ref={inputBusca}
            type="text"
            className="w-full bg-white border-2 border-transparent focus:border-blue-500 focus:outline-hidden rounded-xl p-4 pl-12 shadow-sm transition-all text-lg placeholder:text-slate-400"
            placeholder="Bipar código ou digitar nome do item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </form>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Produto</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-center">Qtd</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Preço Un.</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Subtotal</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itensVenda.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-sm">
                      <div className="font-bold text-slate-800">{item.nome}</div>
                      <div className="text-[10px] text-slate-400 font-mono italic">REF: {Math.floor(item.id * 10000)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3 bg-slate-100 w-fit mx-auto rounded-lg p-1">
                        <button className="p-1 hover:bg-white rounded-md transition-all text-slate-600"><Minus size={14}/></button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantidade}</span>
                        <button className="p-1 hover:bg-white rounded-md transition-all text-slate-600"><Plus size={14}/></button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium text-sm">R$ {item.preco.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-slate-900 text-sm">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    <td className="p-4 text-right text-sm">
                      <button className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {itensVenda.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60 py-20">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="font-medium">Nenhum item na lista de saída</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA */}
      <aside className="w-96 flex flex-col gap-4">
        
        {/* Painel do Operador */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold group" 
                      onClick={() => navigate("/dashboard")}>
                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <ChevronLeft size={16} className="text-white" />
                </div>
                VOLTAR
              </button>
              <div className="text-right font-mono text-sm text-blue-400 font-bold tracking-widest">
                {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="h-px bg-slate-800 w-full" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm border-2 border-blue-500/50">
              {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Operador Ativo</p>
                <p className="text-sm font-bold text-slate-200">{user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inteligência Exactum */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col gap-4 overflow-hidden">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <AlertTriangle size={14} className="text-blue-600" /> Insights de Demanda
          </h3>
          <div className="space-y-3 overflow-y-auto pr-1">
            {itensVenda.length > 0 ? (
              <>
                <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-400">
                  <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Risco de Ruptura</p>
                  <p className="text-xs text-amber-800 leading-tight">
                    <b>{itensVenda[0]?.nome}</b> atingirá o estoque zero em <b>5 dias</b> após esta baixa.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border-l-4 border-blue-400">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Ação Sugerida</p>
                  <p className="text-xs text-blue-800 leading-tight">
                    Antecipar reposição para amanhã para manter a curva de demanda.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2 px-8">
                 <AlertTriangle size={24} className="opacity-20" />
                 <p className="text-xs italic leading-relaxed">Aguardando inserção de dados para calcular impacto no inventário...</p>
              </div>
            )}
          </div>
        </div>

        {/* FINALIZAÇÃO E TROCO */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 space-y-4">
          <div className="space-y-3">
            {/* Input de Desconto */}
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Desconto (%)</span>
              <input 
                type="text" 
                inputMode="numeric"
                className="bg-transparent text-right font-black text-blue-400 focus:outline-none w-16 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value.replace(/\D/g, '')))}
                onFocus={(e) => e.target.select()}
              />
            </div>

            {/* Input de Valor Pago */}
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor Recebido</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-blue-400 font-mono">R$</span>
                <input 
                  type="text" 
                  inputMode="decimal"
                  className="bg-transparent text-right font-black text-white focus:outline-none w-24 text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  value={valorPago}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    if (!isNaN(val) || val === '') setValorPago(val);
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>

            <div className="h-px bg-slate-800 my-2" />

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                <span>Subtotal</span>
                <span>R$ {totalBruto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-blue-500 font-black text-xs uppercase tracking-tighter">Total Líquido</span>
                <span className="text-4xl font-black tracking-tighter text-white">
                  R$ {totalFinal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Display de Troco Dinâmico */}
            {Number(valorPago) > 0 && (
              <div className={`flex justify-between items-center p-3 rounded-xl transition-all duration-300 ${troco > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/30'}`}>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Troco</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  R$ {troco.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
          <button className="group w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex justify-center items-center gap-3">
            <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> 
            Finalizar Saída
          </button>
        </div>
      </aside>

    </div>
  );
};

export default VendaLocal;