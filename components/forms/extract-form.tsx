import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIAS, Extrato } from "@/lib/use-extract";

interface ExtratoFormProps {
  form: Partial<Extrato>;
  onChange: (form: Partial<Extrato>) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  isNovo?: boolean;
}

export function ExtratoForm({
  form,
  onChange,
  onSalvar,
  onCancelar,
  isNovo,
}: ExtratoFormProps) {
  const set = (key: keyof Extrato, value: string | number) =>
    onChange({ ...form, [key]: value });

  if (!isNovo) {
    // Modo edição inline na tabela
    return null;
  }

  // Modo adicionar — painel acima da tabela
  return (
    <div className="bg-white rounded-xl border border-[#021A49]/20 shadow-sm px-5 py-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">Nova transação</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 outline-none focus:border-[#021A49]"
          >
            <option value="pagamento">Pagamento</option>
            <option value="recebimento">Recebimento</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500">Descrição</label>
          <Input
            value={form.descricao ?? ""}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Ex: Salário, Mercado..."
            className="text-sm border-gray-200 bg-gray-50 focus:border-[#021A49] focus:ring-[#021A49]/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Categoria</label>
          <select
            value={form.categoria ?? "outro"}
            onChange={(e) => set("categoria", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 outline-none focus:border-[#021A49]"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Valor (R$)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.valor ?? ""}
            onChange={(e) => set("valor", e.target.value === "" ? "" : parseFloat(e.target.value))}
            className="text-sm w-28 border-gray-200 bg-gray-50 focus:border-[#021A49]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Data</label>
          <input
            type="date"
            value={form.data_transacao ?? ""}
            onChange={(e) => set("data_transacao", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-900 outline-none focus:border-[#021A49]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onSalvar}
            className="bg-[#021A49] hover:bg-[#021A49]/90 text-white gap-1.5 rounded-lg"
          >
            <Check size={13} /> Salvar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelar}
            className="border-gray-200 text-gray-500 rounded-lg"
          >
            <X size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
