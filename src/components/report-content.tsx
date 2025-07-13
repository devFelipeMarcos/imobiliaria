import { forwardRef } from "react";
import { Building2, Phone } from "lucide-react";
import { styles } from "@/styles/report-styles";
import type { ReportData } from "@/types/report";

interface ReportContentProps {
  reportData: ReportData;
}

export const ReportContent = forwardRef<HTMLDivElement, ReportContentProps>(
  ({ reportData }, ref) => {
    return (
      <div ref={ref}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            {/* Report Header */}
            <div style={styles.reportHeader}>
              <h2 style={styles.reportTitle}>CONSULTA DADOS CADASTRAIS</h2>
              <span style={styles.badge}>FONTE: PRIVADA</span>
            </div>

            {/* Personal Data Table */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>CPF</th>
                      <th style={styles.tableHeaderCell}>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.tableRow}>
                      <td
                        style={{ ...styles.tableCell, fontFamily: "monospace" }}
                      >
                        {reportData.infobase_cpf}
                      </td>
                      <td style={{ ...styles.tableCell, fontWeight: "500" }}>
                        {reportData.infobase_personnome_nome_full}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ ...styles.table, marginTop: "0.5rem" }}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Data Nascimento</th>
                      <th style={styles.tableHeaderCell}>Nome Mãe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {reportData.infobase_nasc_dia}/
                        {reportData.infobase_nasc_mes}/
                        {reportData.infobase_nasc_ano}
                      </td>
                      <td style={styles.tableCell}>
                        {reportData.infobase_nomemae_full}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Addresses */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={styles.sectionTitle}>
                <Building2
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#2563eb",
                  }}
                />
                ENDEREÇOS:
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Logradouro</th>
                      <th style={styles.tableHeaderCell}>Complemento</th>
                      <th style={styles.tableHeaderCell}>Bairro</th>
                      <th style={styles.tableHeaderCell}>Cidade</th>
                      <th style={styles.tableHeaderCell}>CEP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2].map((i) => {
                      const prefix = `infobase_histendereco_${i}_` as const;
                      if (reportData[`${prefix}street` as keyof ReportData]) {
                        return (
                          <tr key={i} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              {
                                reportData[
                                  `${prefix}street` as keyof ReportData
                                ]
                              }
                            </td>
                            <td style={styles.tableCell}>
                              {
                                reportData[
                                  `${prefix}complement` as keyof ReportData
                                ]
                              }
                            </td>
                            <td style={styles.tableCell}>
                              {
                                reportData[
                                  `${prefix}neighborhood` as keyof ReportData
                                ]
                              }
                            </td>
                            <td style={styles.tableCell}>
                              {reportData[`${prefix}city` as keyof ReportData]}
                            </td>
                            <td
                              style={{
                                ...styles.tableCell,
                                fontFamily: "monospace",
                              }}
                            >
                              {
                                reportData[
                                  `${prefix}postalcode` as keyof ReportData
                                ]
                              }
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phones */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={styles.sectionTitle}>
                <Phone
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#2563eb",
                  }}
                />
                TELEFONES:
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Números</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.infobase_histcel_celular_1_telefone && (
                      <tr style={styles.tableRow}>
                        <td
                          style={{
                            ...styles.tableCell,
                            fontFamily: "monospace",
                          }}
                        >
                          {reportData.infobase_histcel_celular_1_telefone}
                        </td>
                      </tr>
                    )}
                    {reportData.infobase_histtel_telefone_2_telefone && (
                      <tr style={styles.tableRow}>
                        <td
                          style={{
                            ...styles.tableCell,
                            fontFamily: "monospace",
                          }}
                        >
                          {reportData.infobase_histtel_telefone_2_telefone}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emails */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={styles.sectionTitle}>EMAILS:</h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Endereços</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((i) => {
                      const key =
                        `infobase_histemail_${i}_email` as keyof ReportData;
                      if (reportData[key]) {
                        return (
                          <tr key={i} style={styles.tableRow}>
                            <td
                              style={{
                                ...styles.tableCell,
                                fontFamily: "monospace",
                                color: "#2563eb",
                              }}
                            >
                              {reportData[key]}
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                marginTop: "2rem",
                paddingTop: "2rem",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "#4b5563",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <Phone style={{ width: "1rem", height: "1rem" }} />
                  <span>(64) 3623-0280</span>
                </div>
                <p style={{ fontWeight: "600", margin: "0.5rem 0" }}>
                  TH LOGISTICA
                </p>
                <p style={{ margin: 0 }}>
                  CNPJ: 33.426.690/0001-02 | +55 (64)-3623-0280
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReportContent.displayName = "ReportContent";
