import { RefreshCw, CheckCircle } from "lucide-react";
import { styles } from "@/styles/report-styles";

interface StatusBarProps {
  loading: boolean;
  error: string | null;
  generatingPdf: boolean;
  currentDateTime: string;
}

export function StatusBar({
  loading,
  error,
  generatingPdf,
  currentDateTime,
}: StatusBarProps) {
  return (
    <div style={{ ...styles.card, padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              ...styles.badge,
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
            }}
          >
            RELATÓRIO GERADO
          </span>
          <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            {currentDateTime}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {(loading || generatingPdf) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#2563eb",
              }}
            >
              <RefreshCw style={{ width: "1rem", height: "1rem" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                {loading ? "Carregando..." : "Gerando PDF..."}
              </span>
            </div>
          )}
          {!loading && !error && !generatingPdf && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#16a34a",
              }}
            >
              <CheckCircle style={{ width: "1rem", height: "1rem" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                Pronto
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
