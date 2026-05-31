"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImportar } from "@/lib/use-imports";
import { UploadZona } from "@/components/feed/import/upload-import";
import { FeedbackStatus } from "@/components/feed/import/feedback-import";
import { PreviewTransacoes } from "@/components/feed/import/preview-import";
import { InfoImportar } from "@/components/feed/import/info-import";

export default function ImportarPage() {
  const {
    file,
    preview,
    status,
    mensagem,
    transacoes,
    handleFileChange,
    handleSubmit,
  } = useImportar();

  return (
    <div className="w-full flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar extrato</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Envie um PDF ou imagem do seu extrato bancário para extrair as
          transações automaticamente
        </p>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-5 flex flex-col gap-4">
            <UploadZona file={file} onChange={handleFileChange} />

            {preview && (
              <div className="rounded-xl overflow-hidden border border-gray-200 max-h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview do extrato"
                  className="w-full object-contain max-h-52"
                />
              </div>
            )}

            <FeedbackStatus status={status} mensagem={mensagem} />

            <Button
              onClick={handleSubmit}
              disabled={!file || status === "loading"}
              className="w-full bg-darkBlue! hover:bg-darkBlue/90! text-brand-darkBlue! rounded-lg h-10"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Processando...
                </span>
              ) : (
                "Enviar extrato"
              )}
            </Button>
          </div>

          <PreviewTransacoes transacoes={transacoes} />
        </div>

        <InfoImportar />
      </div>
    </div>
  );
}
