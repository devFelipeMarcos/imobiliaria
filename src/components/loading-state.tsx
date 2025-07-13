import { styles } from "@/styles/report-styles";

export function LoadingState() {
  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.cardContent,
          textAlign: "center",
          padding: "4rem 2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "5rem",
              height: "5rem",
              border: "4px solid #dbeafe",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "0.5rem",
          }}
        >
          Carregando Dados
        </h3>
        <p style={{ color: "#4b5563", margin: 0 }}>
          Buscando informações cadastrais...
        </p>
      </div>
    </div>
  );
}
