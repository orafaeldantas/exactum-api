import { 
    Target
  } from "lucide-react"
  
  import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine
  } from "recharts";


function SalesGoalChart({
    goalValue,
    invoicing,
    accumulatedRevenueDaily

}) {

    const salesGoalChart = accumulatedRevenueDaily;

    const chartMax = Math.max(
        goalValue,
        ...salesGoalChart.map(item => item.revenue),
         invoicing
        );

    const yDomain = [
        0,
        Math.ceil(chartMax * 1.5)
      ];

    return (
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
            <h4 className="text-xl font-black"> Receita Acumulada (R$)</h4>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                <Target size={14} className="text-blue-500" /> Comparativo vs Meta Mensal
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>

            <AreaChart
              data={salesGoalChart}
              margin={{
                top: 70,
                right: 30,
                left: 20,
                bottom: 30
              }}
            >

              <defs>

              <linearGradient
                id="salesGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.45}
                />

                <stop
                  offset="40%"
                  stopColor="#3b82f6"
                  stopOpacity={0.18}
                />

                <stop
                  offset="100%"
                  stopColor="#ffffff"
                  stopOpacity={0}
                />

              </linearGradient>

              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={yDomain}

                tickCount={8}

                axisLine={false}

                tickLine={false}

                width={70}

                tick={{
                  fill: "#64748b",
                  fontSize: 15
                }}

                tickFormatter={(value) => {
                  return `${Math.round(value / 1000)}k`;
                }}
              />

                <Tooltip
                  animationDuration={200}
                  animationEasing="ease-out"

                  cursor={{
                    fill: "rgba(241, 245, 249, 0.5)",
                    radius: 12
                  }}

                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 30px rgba(19, 65, 172, 0.08)",
                    padding: "10px 14px"
                  }}

                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}
                  itemStyle={{ color: "#2563eb", fontWeight: 800, fontSize: "15px" }}

                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR")}`,
                    "Ticket"
                  ]}
                />

              <ReferenceLine
                y={goalValue}
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="10 8"

                label={({ viewBox }) => {

                  const centerX =
                    (viewBox?.x ?? 0) +
                    (viewBox?.width ?? 0) / 2;

                  const y =
                    (viewBox?.y ?? 0) - 40;

                  return (
                    <g>

                      <rect
                        x={centerX - 95}
                        y={y}
                        width={190}
                        height={30}
                        rx={14}
                        fill="#fffbeb"
                      />

                      <text
                        x={centerX}
                        y={y + 20}
                        textAnchor="middle"
                        fill="#92400e"
                        fontSize="12"
                        fontWeight="900"
                      >
                        Meta Mensal • R$ {goalValue.toLocaleString("pt-BR")}
                      </text>

                    </g>
                  );
                }}
              />

              <Area
                type="monotone"

                dataKey="revenue"

                stroke="#2563eb"

                strokeWidth={4}

                fill="url(#salesGradient)"

                animationDuration={1600}

                animationEasing="ease"

                activeDot={{
                  r: 8,
                  strokeWidth: 3,
                  fill: "#2563eb",
                  stroke: "#ffffff"
                }}

                dot={{
                  r: 0
                }}
              />

            </AreaChart>

          </ResponsiveContainer>
        </div>
    );
}

export default SalesGoalChart;