import { useNavigate } from "react-router-dom";
import { 
    ChevronRight,
    Star
  } from "lucide-react"


function TopProductsCard({
    topItems
}) {

    const navigate = useNavigate()

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* HEADER */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Star
                  className="text-amber-400 fill-amber-400"
                  size={20}
                />
                Produtos Mais Vendidos
              </h4>

              <p className="text-xs text-slate-500 mt-1 font-medium">
                Ranking dos itens com maior volume no período
              </p>

            </div>

            <div className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              TOP 5
            </div>

          </div>

          {/* LIST */}
          <div className="p-3">

            {topItems.slice(0, 5).map((item, i) => {

              const isFirst = i === 0;

              return (

                <button
                  key={i}

                  className={`
                    group
                    w-full
                    text-left
                    p-4
                    rounded-3xl
                    transition-all
                    duration-300
                    mb-2
                    border

                    ${
                      isFirst
                        ? "bg-gradient-to-r from-amber-50 to-white border-amber-100 shadow-sm"
                        : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm hover:border-slate-200"
                    }
                  `}
                >

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-4">

                      {/* RANK */}
                      <div
                        className={`
                          w-12
                          h-12
                          rounded-2xl
                          flex
                          items-center
                          justify-center
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
                            size={18}
                            strokeWidth={2.5}
                            className="text-amber-500"
                          />

                        ) : (

                          <span className="font-black text-sm text-slate-500">
                            #{i + 1}
                          </span>

                        )}

                      </div>

                      {/* INFO */}
                      <div>

                        <div className="flex items-center gap-2">

                          <p className="text-sm font-black text-slate-900">
                            {item.name}
                          </p>

                          {isFirst && (
                            <span
                            className="
                              px-2
                              py-1
                              rounded-full
                              bg-amber-50
                              text-amber-700
                              text-[9px]
                              font-black
                              uppercase
                              tracking-widest
                            "
                            >
                              TOP 1
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {item.category || "Categoria Geral"}
                        </p>

                      </div>

                    </div>

                    {/* QUANTIDADE */}
                    <div className="text-right">

                      <p className="text-lg font-extrabold text-slate-900">
                        {item.total_quantity}
                      </p>

                      <p className="
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-slate-400
                        font-bold
                      ">
                        unidades
                      </p>

                    </div>

                  </div>

                </button>

              );

            })}

          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-slate-100">

            <button
              onClick={() => navigate("/products")}
              className="
                w-full
                h-12
                rounded-2xl
                bg-slate-50
                hover:bg-blue-50
                text-slate-700
                hover:text-blue-600
                transition-all
                font-black
                text-sm
                flex
                items-center
                justify-center
                gap-2
              "
            >

              Ver catálogo completo

              <ChevronRight
                size={16}
              />

            </button>

          </div>

        </div>
    );
}

export default TopProductsCard;