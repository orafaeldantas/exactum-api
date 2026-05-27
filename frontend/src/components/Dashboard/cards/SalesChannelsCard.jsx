import { 
  PieChart,
} from "lucide-react"


function SalesChannelsCard({
    
}) {

    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 p-8">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">

              <div>

                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <PieChart className="text-slate-400" size={20}/>
                  Canais de Venda
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  Distribuição percentual por origem
                </p>

              </div>

              <div className="
                px-3
                py-1
                rounded-full
                bg-slate-50
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                text-slate-500
              ">
                Mês Atual
              </div>

            </div>

            {/* LISTA */}
            <div className="space-y-5">

              {[
                {
                  name: "Loja Física",
                  value: 100,
                  color: "bg-blue-600"
                },
                /*
                {
                  name: "Marketplace",
                  value: 0,
                  color: "bg-emerald-500"
                },
                
                {
                  name: "WhatsApp",
                  value: 0,
                  color: "bg-amber-500"
                } */

              ].map((item, i) => {

                const leader = i === 0;

                return (

                  <div
                    key={i}
                    className="
                      rounded-2xl
                      p-4
                      hover:bg-slate-50
                      transition-all
                    "
                  >

                    <div className="flex justify-between items-center mb-3">

                      <div className="flex items-center gap-3">

                        <div
                          className={`
                            w-3
                            h-3
                            rounded-full
                            ${item.color}
                          `}
                        />

                        <span className="
                          text-sm
                          font-semibold
                          text-slate-800
                        ">
                          {item.name}
                        </span>

                        {leader && (

                          <span
                            className="
                              px-2
                              py-0.5
                              rounded-full
                              bg-blue-50
                              text-blue-700
                              text-[9px]
                              uppercase
                              font-bold
                              tracking-widest
                            "
                          >
                            líder
                          </span>

                        )}

                      </div>

                      <span className="
                        text-lg
                        font-extrabold
                        text-slate-900
                      ">
                        {item.value}%
                      </span>

                    </div>

                    <div className="
                      h-3
                      bg-slate-100
                      rounded-full
                      overflow-hidden
                    ">

                      <div
                        className={`
                          h-full
                          rounded-full
                          ${item.color}
                          transition-all
                          duration-1000
                        `}
                        style={{
                          width: `${item.value}%`
                        }}
                      />

                    </div>

                  </div>

                )

              })}

            </div>

              {/* INSIGHT */}

              <div className="
                mt-8
                p-5
                rounded-3xl
                bg-slate-50
                border
                border-slate-100
              ">

                <div className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  text-slate-400
                  font-bold
                  mb-2
                ">
                  Insight
                </div>

                <p className="
                  text-sm
                  text-slate-700
                  leading-relaxed
                  font-medium
                ">
                  Loja Física representa o principal canal de vendas
                  e mantém crescimento consistente no período.
                </p>

              </div>

        </div>
    );
}

export default SalesChannelsCard;