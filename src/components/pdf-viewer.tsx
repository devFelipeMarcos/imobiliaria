import { styles } from "@/styles/report-styles";

interface PdfViewerProps {
  pdfUrl: string;
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  return (
    <div style={styles.card}>
      <div style={{ padding: "1.5rem", backgroundColor: "#f3f4f6" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            marginBottom: "1rem",
            textAlign: "center",
            margin: "0 0 1rem 0",
          }}
        >
          Preview do PDF Gerado
        </h3>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <iframe
            src={pdfUrl}
            width="100%"
            height="800"
            style={{ border: "none" }}
            title="Preview do Relatório PDF"
          />
        </div>
      </div>
    </div>
  );
}
