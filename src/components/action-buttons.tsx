"use client";

import { Download, Eye, FileText } from "lucide-react";
import { styles } from "@/styles/report-styles";

interface ActionButtonsProps {
  onDownload: () => void;
  onOpenInNewTab: () => void;
  onGeneratePdf: () => void;
  generatingPdf: boolean;
  hasPdfUrl: boolean;
}

export function ActionButtons({
  onDownload,
  onOpenInNewTab,
  onGeneratePdf,
  generatingPdf,
  hasPdfUrl,
}: ActionButtonsProps) {
  return (
    <div style={{ ...styles.card, padding: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <button
          onClick={onDownload}
          style={{
            ...styles.button,
            opacity: generatingPdf ? 0.5 : 1,
            cursor: generatingPdf ? "not-allowed" : "pointer",
          }}
          disabled={generatingPdf}
        >
          <Download style={{ width: "1rem", height: "1rem" }} />
          {generatingPdf ? "Gerando..." : "Download PDF"}
        </button>
        <button
          onClick={onOpenInNewTab}
          style={{
            ...styles.buttonSecondary,
            opacity: generatingPdf ? 0.5 : 1,
            cursor: generatingPdf ? "not-allowed" : "pointer",
          }}
          disabled={generatingPdf}
        >
          <Eye style={{ width: "1rem", height: "1rem" }} />
          Visualizar PDF
        </button>
        {!hasPdfUrl && (
          <button
            onClick={onGeneratePdf}
            disabled={generatingPdf}
            style={{
              ...styles.buttonSecondary,
              opacity: generatingPdf ? 0.5 : 1,
              cursor: generatingPdf ? "not-allowed" : "pointer",
            }}
          >
            <FileText style={{ width: "1rem", height: "1rem" }} />
            Gerar PDF
          </button>
        )}
      </div>
    </div>
  );
}
