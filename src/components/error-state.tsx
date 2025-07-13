"use client";

import { FileText, RefreshCw } from "lucide-react";
import { styles } from "@/styles/report-styles";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div
      style={{
        ...styles.card,
        borderColor: "#fecaca",
        backgroundColor: "#fef2f2",
      }}
    >
      <div
        style={{
          ...styles.cardContent,
          textAlign: "center",
          padding: "3rem 2rem",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            backgroundColor: "#fee2e2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <FileText
            style={{ width: "2rem", height: "2rem", color: "#dc2626" }}
          />
        </div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#7f1d1d",
            marginBottom: "0.5rem",
          }}
        >
          Erro na Consulta
        </h3>
        <p style={{ color: "#b91c1c", marginBottom: "1.5rem" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            ...styles.buttonSecondary,
            borderColor: "#fca5a5",
            color: "#b91c1c",
          }}
        >
          <RefreshCw style={{ width: "1rem", height: "1rem" }} />
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
