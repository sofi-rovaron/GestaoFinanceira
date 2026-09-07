"use client";

import { useMemo } from "react";
import { FileUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useExtratos, formatarValor } from "@/lib/use-extract";
import { ResumoCards } from "@/components/card/resume-extract-card";
import type { Extrato } from "@/lib/use-extract";

// Paleta fixa para as fatias do gráfico de categorias
const CORES_CATEGORIA = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#06b6d4",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
];

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/** Agrupa os extratos em receitas/despesas por mês (últimos 7 meses com dados) */
function useLineData(extratos: Extrato[]) {
  return useMemo(() => {
    const porMes = new Map<string, { receitas: number; despesas: number }>();

    for (const e of extratos) {
      const chave = e.data_transacao.slice(0, 7); // "YYYY-MM"
      const atual = porMes.get(chave) ?? { receitas: 0, despesas: 0 };
      if (e.tipo === "recebimento") atual.receitas += e.valor;
      else atual.despesas += e.valor;
      porMes.set(chave, atual);
    }

    return Array.from(porMes.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([chave, valores]) => {
        const mesIndex = Number(chave.slice(5, 7)) - 1;
        return {
          name: MESES_ABREV[mesIndex] ?? chave,
          ...valores,
        };
      });
  }, [extratos]);
}

/** Agrupa as despesas (pagamentos) por categoria */
function usePieData(extratos: Extrato[]) {
  return useMemo(() => {
    const porCategoria = new Map<string, number>();

    for (const e of extratos) {
      if (e.tipo !== "pagamento") continue;
      const categoria = e.categoria ?? "outro";
      porCategoria.set(
        categoria,
        (porCategoria.get(categoria) ?? 0) + e.valor
      );
    }

    return Array.from(porCategoria.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: CORES_CATEGORIA[index % CORES_CATEGORIA.length],
      }));
  }, [extratos]);
}

export default function DashboardFinanceiro() {
  const { extratos, loading } = useExtratos();

  const totalRecebimentos = useMemo(
    () =>
      extratos
        .filter((e) => e.tipo === "recebimento")
        .reduce((acc, e) => acc + e.valor, 0),
    [extratos]
  );

  const totalPagamentos = useMemo(
    () =>
      extratos
        .filter((e) => e.tipo === "pagamento")
        .reduce((acc, e) => acc + e.valor, 0),
    [extratos]
  );

  const lineData = useLineData(extratos);
  const pieData = usePieData(extratos);

  // Extratos já vêm ordenados por data (mais recentes primeiro) do hook
  const transacoesRecentes = extratos.slice(0, 5);

  return (
    <section>
      <div className="row">
        <div className="container">
          <div className="flex flex-col gap-5 mt-14 md:mt-0">
            {/* Header */}
            <div className="flex flex-col gap-y-5 md:flex-row items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão Financeira
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Visão geral das suas movimentações
                </p>
              </div>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-all text-sm font-medium">
                <FileUp size={18} /> Importar Extrato PDF
              </button>
            </div>

            {/* Cards superiores (mesmo componente usado em Extratos) */}
            <ResumoCards
              totalRecebimentos={totalRecebimentos}
              totalPagamentos={totalPagamentos}
            />

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-12 text-center">
                <p className="text-sm text-gray-400">Carregando gráficos...</p>
              </div>
            ) : extratos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-12 text-center">
                <p className="text-sm text-gray-400">
                  Nenhuma movimentação encontrada ainda.
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Adicione uma transação ou importe um extrato para ver os
                  gráficos.
                </p>
              </div>
            ) : (
              <>
                {/* Seção de Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                    <h3 className="font-bold mb-1">Tendência Mensal</h3>
                    <p className="text-xs text-slate-400 mb-6">
                      Receitas vs Despesas
                    </p>
                    <div className="h-[240px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            width={48}
                          />
                          <Tooltip
                            formatter={(value) => formatarValor(Number(value ?? 0))}
                          />
                          <Legend iconType="circle" />
                          <Line
                            type="monotone"
                            dataKey="receitas"
                            name="Receitas"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="despesas"
                            name="Despesas"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                    <h3 className="font-bold mb-1">Despesas por Categoria</h3>
                    <p className="text-xs text-slate-400 mb-6">
                      Distribuição das despesas
                    </p>
                    {pieData.length === 0 ? (
                      <div className="h-[240px] sm:h-[300px] w-full flex items-center justify-center">
                        <p className="text-sm text-slate-400">
                          Nenhuma despesa registrada ainda.
                        </p>
                      </div>
                    ) : (
                      <div className="h-[240px] sm:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => formatarValor(Number(value ?? 0))}
                            />
                            <Legend
                              layout="horizontal"
                              align="center"
                              verticalAlign="bottom"
                              wrapperStyle={{ fontSize: 12 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabela de Transações */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50">
                    <h3 className="font-bold">Transações Recentes</h3>
                    <p className="text-xs text-slate-400">
                      Últimas movimentações
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-medium">Descrição</th>
                          <th className="px-6 py-4 font-medium">Categoria</th>
                          <th className="px-6 py-4 font-medium">Data</th>
                          <th className="px-6 py-4 font-medium text-right">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transacoesRecentes.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50/50 transition-colors text-sm"
                          >
                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                              {t.descricao}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="bg-slate-100 px-3 py-1 rounded-full text-[11px] text-slate-600">
                                {t.categoria ?? "outro"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                              {t.data_transacao.split("-").reverse().join("/")}
                            </td>
                            <td
                              className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                                t.tipo === "recebimento"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {t.tipo === "recebimento" ? "+ " : "- "}
                              {formatarValor(t.valor)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}