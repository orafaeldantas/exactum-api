import { ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopProductsCard({ topItems }) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={18} />
            Produtos Mais Vendidos
          </h4>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium">
            Ranking dos itens com maior volume no período
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-slate-50 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
          TOP 5
        </div>
      </div>

      {/* LIST */}
      <div className="p-2 sm:p-3 md:p-4">
        {topItems.slice(0, 5).map((item, i) => {
          const isFirst = i === 0;

          return (
            <button
              key={i}
              className={`
                group
                w-full
                text-left
                p-3 sm:p-3.5 md:p-4
                rounded-2xl
                transition-all
                duration-300
                mb-2
                border
                ${
                  isFirst
                    ? "bg-gradient-to-r from-amber-50 to-white border-amber-100 shadow-sm"
                    : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                }
              `}
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* RANK */}
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12
                      rounded-2xl
                      flex items-center justify-center
                      shrink-0
                      transition-all
                      ${
                        isFirst
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-slate-100"
                      }
                    `}
                  >
                    {isFirst ? (
                      <Star
                        size={16}
                        strokeWidth={2.5}
                        className="text-amber-500"
                      />
                    ) : (
                      <span className="font-black text-xs sm:text-sm text-slate-500">
                        #{i + 1}
                      </span>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate">
                        {item.name}
                      </p>

                      {isFirst && (
                        <span
                          className="
                            px-1.5 py-0.5 sm:px-2 sm:py-1
                            rounded-full
                            bg-amber-50
                            text-amber-700
                            text-[8px] sm:text-[9px]
                            font-black
                            uppercase
                            tracking-widest
                            whitespace-nowrap
                          "
                        >
                          TOP 1
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                      {item.category || "Categoria Geral"}
                    </p>
                  </div>
                </div>

                {/* QUANTIDADE */}
                <div className="text-right shrink-0">
                  <p className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900">
                    {item.total_quantity}
                  </p>

                  <p
                    className="
                      text-[8px] sm:text-[10px]
                      uppercase
                      tracking-[0.1em] sm:tracking-[0.15em]
                      text-slate-400
                      font-bold
                    "
                  >
                    unidades
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-3 sm:p-4 border-t border-slate-100">
        <button
          onClick={() => navigate("/products-sales")}
          className="
            w-full
            h-10 sm:h-12
            rounded-2xl
            bg-slate-50
            hover:bg-blue-50
            text-slate-700
            hover:text-blue-600
            transition-all
            font-black
            text-xs sm:text-sm
            flex
            items-center
            justify-center
            gap-2
          "
        >
          Ver catálogo completo
          <ChevronRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default TopProductsCard;
