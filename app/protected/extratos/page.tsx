"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  useExtratos,
  useExtratosFiltrados,
  type Extrato,
  type FiltrosState,
} from "@/lib/use-extract";
import { ResumoCards } from "@/components/card/resume-extract-card";
import { TabelaExtratos } from "@/components/feed/extract/table-extract-feed";
import { ExtratoForm } from "@/components/forms/extract-form";
import { FiltrosBar } from "@/components/feed/extract/filters-extract-feed";

const FILTROS_INICIAIS: FiltrosState = {
  tipo: "todos",
  categoria: "todas",
  dataInicio: "",
  dataFim: "",
  busca: "",
};

export default function ExtratosPage() {
  const { extratos, loading, salvarEdicao, deletarExtrato, adicionarExtrato } =
    useExtratos();

  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);
  const [ordenacao, setOrdenacao] = useState<"asc" | "desc">("desc");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Extrato>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mostrаrForm, setMostrandoForm] = useState(false);
  const [novoForm, setNovoForm] = useState<Partial<Extrato>>({
    tipo: "pagamento",
    descricao: "",
    categoria: "outro",
    valor: 0,
    data_transacao: new Date().toISOString().split("T")[0],
  });

  const extratosFiltrados = useExtratosFiltrados(extratos, filtros, ordenacao);

  const totalRecebimentos = extratosFiltrados
    .filter((e) => e.tipo === "recebimento")
    .reduce((acc, e) => acc + e.valor, 0);

  const totalPagamentos = extratosFiltrados
    .filter((e) => e.tipo === "pagamento")
    .reduce((acc, e) => acc + e.valor, 0);

  const iniciarEdicao = (e: Extrato) => {
    setEditandoId(e.id);
    setEditForm({ ...e });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditForm({});
  };

  const handleSalvarEdicao = async () => {
    if (!editandoId) return;
    await salvarEdicao(editandoId, editForm);
    setEditandoId(null);
    setEditForm({});
  };

  const handleDeletar = async (id: string) => {
    await deletarExtrato(id);
    setConfirmDeleteId(null);
  };

  const handleAdicionar = async () => {
    await adicionarExtrato(novoForm);
    setMostrandoForm(false);
    setNovoForm({
      tipo: "pagamento",
      descricao: "",
      categoria: "outro",
      valor: 0,
      data_transacao: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <section>
      <div className="row">
        <div className="container">
          <div className="flex flex-col gap-5 mt-14 md:mt-0">
            <div className="flex flex-col gap-y-5 md:flex-row items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Extratos</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Visualize e gerencie suas movimentações financeiras
                </p>
              </div>
              <Button
                onClick={() => setMostrandoForm((v) => !v)}
                className="bg-[#021A49] hover:bg-[#021A49]/90 text-white gap-2 rounded-lg shadow-sm"
              >
                <Plus size={15} />
                Nova transação
              </Button>
            </div>

            {/* Card */}
            <ResumoCards
              totalRecebimentos={totalRecebimentos}
              totalPagamentos={totalPagamentos}
            />

            {/* Filtro */}
            <FiltrosBar
              filtros={filtros}
              onChange={setFiltros}
              onLimpar={() => setFiltros(FILTROS_INICIAIS)}
            />

            {/* Form de novo extrato */}
            {mostrаrForm && (
              <ExtratoForm
                form={novoForm}
                onChange={setNovoForm}
                onSalvar={handleAdicionar}
                onCancelar={() => setMostrandoForm(false)}
                isNovo
              />
            )}

            {/* Tabela */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-12 text-center">
                <p className="text-sm text-gray-400">Carregando extratos...</p>
              </div>
            ) : extratosFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-12 text-center">
                <p className="text-sm text-gray-400">
                  Nenhum extrato encontrado.
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Tente ajustar os filtros ou adicionar uma nova transação.
                </p>
              </div>
            ) : (
              <TabelaExtratos
                extratos={extratosFiltrados}
                ordenacao={ordenacao}
                onOrdenacao={() =>
                  setOrdenacao((o) => (o === "desc" ? "asc" : "desc"))
                }
                editandoId={editandoId}
                editForm={editForm}
                onIniciarEdicao={iniciarEdicao}
                onCancelarEdicao={cancelarEdicao}
                onSalvarEdicao={handleSalvarEdicao}
                onEditFormChange={setEditForm}
                confirmDeleteId={confirmDeleteId}
                onConfirmDelete={setConfirmDeleteId}
                onDeletar={handleDeletar}
                onCancelarDelete={() => setConfirmDeleteId(null)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
