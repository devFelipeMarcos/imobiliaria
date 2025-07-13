import { FileText, Phone } from "lucide-react";
import { styles } from "@/styles/report-styles";

export function PageHeader() {
  return (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <FileText
              style={{ width: "1.75rem", height: "1.75rem", color: "#ffffff" }}
            />
          </div>
          <div>
            <h1 style={styles.title}>CONSULTEBRAS</h1>
            <p style={styles.subtitle}>Gerenciadora de Risco</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#4b5563",
              marginBottom: "0.25rem",
            }}
          >
            <Phone style={{ width: "1rem", height: "1rem" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
              (64) 3623-0280
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
            CNPJ: 33.426.690/0001-02
          </p>
        </div>
      </div>
    </div>
  );
}
