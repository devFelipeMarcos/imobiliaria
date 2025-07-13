"use client";

import { useState, useEffect, useRef } from "react";
import { formatAnaliseDetalhe } from "@/app/datapf/format";
import { RefreshCw } from "lucide-react";
import {
  generateTextPdf,
  downloadPdf,
  openPdfInNewTab,
} from "@/lib/pdf-generator-text";
import { PageHeader } from "@/components/page-header";
import { StatusBar } from "@/components/status-bar";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ActionButtons } from "@/components/action-buttons";
import { ReportContentPure } from "@/components/report-content-pure";
import { PdfViewer } from "@/components/pdf-viewer";
import { styles } from "@/styles/report-styles";
import type { ReportData, AppState } from "@/types/report";

export default function ArkPdfPreview() {
  const [state, setState] = useState<AppState>({
    pdfUrl: null,
    loading: true,
    error: null,
    reportData: null,
    generatingPdf: false,
    currentDateTime: "",
    mounted: false,
  });

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setState((prev) => ({
      ...prev,
      mounted: true,
      currentDateTime: `${now.toLocaleDateString(
        "pt-BR"
      )} às ${now.toLocaleTimeString("pt-BR")}`,
    }));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const res = await fetch("/api/ark");
        if (!res.ok) throw new Error("Erro ao buscar dados");

        const { elements } = await res.json();
        const raw = elements?.[0]?.AnaliseDetalhe || "";
        const reportData = formatAnaliseDetalhe(raw) as ReportData;

        setState((prev) => ({ ...prev, reportData, loading: false }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Erro desconhecido",
          loading: false,
        }));
      }
    }

    if (state.mounted) {
      loadData();
    }
  }, [state.mounted]);

  const handleGeneratePdf = async () => {
    if (!state.reportData) return;

    try {
      setState((prev) => ({ ...prev, generatingPdf: true, error: null }));

      // Usa o novo gerador de PDF com texto copiável
      const pdfUrl = await generateTextPdf(state.reportData, (status) =>
        console.log("PDF Status:", status)
      );

      setState((prev) => ({ ...prev, pdfUrl, generatingPdf: false }));
    } catch (err) {
      console.error("Erro completo:", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Erro ao gerar PDF",
        generatingPdf: false,
      }));
    }
  };

  const handleDownload = async () => {
    if (state.pdfUrl) {
      downloadPdf(state.pdfUrl);
    } else {
      await handleGeneratePdf();
      setTimeout(() => {
        if (state.pdfUrl) downloadPdf(state.pdfUrl);
      }, 1000);
    }
  };

  const handleOpenInNewTab = async () => {
    if (state.pdfUrl) {
      openPdfInNewTab(state.pdfUrl);
    } else {
      await handleGeneratePdf();
      setTimeout(() => {
        if (state.pdfUrl) openPdfInNewTab(state.pdfUrl);
      }, 1000);
    }
  };

  if (!state.mounted) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", paddingTop: "2rem" }}>
          <RefreshCw
            style={{
              width: "2rem",
              height: "2rem",
              color: "#2563eb",
              marginBottom: "1rem",
            }}
          />
          <p style={{ color: "#4b5563" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <PageHeader />

      <div style={styles.mainContent}>
        <StatusBar
          loading={state.loading}
          error={state.error}
          generatingPdf={state.generatingPdf}
          currentDateTime={state.currentDateTime}
        />

        {state.loading && <LoadingState />}

        {state.error && <ErrorState error={state.error} />}

        {!state.loading && !state.error && state.reportData && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <ActionButtons
              onDownload={handleDownload}
              onOpenInNewTab={handleOpenInNewTab}
              onGeneratePdf={handleGeneratePdf}
              generatingPdf={state.generatingPdf}
              hasPdfUrl={!!state.pdfUrl}
            />

            {/* Preview do conteúdo na tela */}
            <ReportContentPure ref={reportRef} reportData={state.reportData} />

            {state.pdfUrl && <PdfViewer pdfUrl={state.pdfUrl} />}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
