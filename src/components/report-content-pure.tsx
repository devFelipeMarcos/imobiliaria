import { forwardRef } from "react";
import type { ReportData } from "@/types/report";

interface ReportContentProps {
  reportData: ReportData;
}

// Estilos otimizados para PDF com tamanhos maiores
const pureStyles = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    width: "100%",
    minHeight: "800px", // Altura mínima para ocupar mais espaço
    fontSize: "16px",
    lineHeight: "1.4",
  },
  reportHeader: {
    textAlign: "center" as const,
    marginBottom: "40px",
    paddingBottom: "30px",
    borderBottom: "3px solid rgb(37, 99, 235)",
  },
  reportTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "rgb(17, 24, 39)",
    margin: "0 0 20px 0",
    lineHeight: "1.2",
  },
  badge: {
    backgroundColor: "rgb(37, 99, 235)",
    color: "rgb(255, 255, 255)",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "18px",
    fontWeight: "600",
    display: "inline-block",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "rgb(17, 24, 39)",
    marginBottom: "20px",
    display: "block",
  },
  tableContainer: {
    backgroundColor: "rgb(249, 250, 251)",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "20px",
    border: "2px solid rgb(229, 231, 235)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: "rgb(255, 255, 255)",
    fontSize: "16px",
    margin: "0",
  },
  tableHeader: {
    backgroundColor: "rgb(37, 99, 235)",
  },
  tableHeaderCell: {
    padding: "16px 20px",
    textAlign: "left" as const,
    fontWeight: "700",
    fontSize: "18px",
    color: "rgb(255, 255, 255)",
    backgroundColor: "rgb(37, 99, 235)",
    border: "2px solid rgb(37, 99, 235)",
  },
  tableCell: {
    padding: "16px 20px",
    fontSize: "16px",
    border: "1px solid rgb(229, 231, 235)",
    backgroundColor: "rgb(255, 255, 255)",
    color: "rgb(0, 0, 0)",
    verticalAlign: "top" as const,
    lineHeight: "1.4",
  },
  tableRow: {
    backgroundColor: "rgb(255, 255, 255)",
  },
  footer: {
    borderTop: "2px solid rgb(229, 231, 235)",
    marginTop: "40px",
    paddingTop: "30px",
    textAlign: "center" as const,
    fontSize: "16px",
    color: "rgb(75, 85, 99)",
  },
  footerLine: {
    margin: "12px 0",
    lineHeight: "1.5",
  },
  footerCompany: {
    fontWeight: "700",
    fontSize: "20px",
    color: "rgb(17, 24, 39)",
  },
};

export const ReportContentPure = forwardRef<HTMLDivElement, ReportContentProps>(
  ({ reportData }, ref) => {
    return (
      <div ref={ref} style={pureStyles.container} data-pdf-container="true">
        {/* Report Header */}
        <div style={pureStyles.reportHeader} data-pdf-header="true">
          <h2 style={pureStyles.reportTitle} data-pdf-title="true">
            CONSULTA DADOS CADASTRAIS
          </h2>
          <span style={pureStyles.badge} data-pdf-badge="true">
            FONTE: PRIVADA
          </span>
        </div>

        {/* Personal Data Section */}
        <div style={pureStyles.section} data-pdf-section="true">
          <div
            style={pureStyles.tableContainer}
            data-pdf-table-container="true"
          >
            <table style={pureStyles.table}>
              <thead style={pureStyles.tableHeader}>
                <tr>
                  <th style={pureStyles.tableHeaderCell}>CPF</th>
                  <th style={pureStyles.tableHeaderCell}>Nome Completo</th>
                </tr>
              </thead>
              <tbody>
                <tr style={pureStyles.tableRow}>
                  <td
                    style={{
                      ...pureStyles.tableCell,
                      fontFamily: "monospace",
                      fontWeight: "600",
                      fontSize: "18px",
                    }}
                  >
                    {reportData.infobase_cpf}
                  </td>
                  <td
                    style={{
                      ...pureStyles.tableCell,
                      fontWeight: "600",
                      fontSize: "17px",
                    }}
                  >
                    {reportData.infobase_personnome_nome_full}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={pureStyles.tableContainer}
            data-pdf-table-container="true"
          >
            <table style={pureStyles.table}>
              <thead style={pureStyles.tableHeader}>
                <tr>
                  <th style={pureStyles.tableHeaderCell}>Data de Nascimento</th>
                  <th style={pureStyles.tableHeaderCell}>Nome da Mãe</th>
                </tr>
              </thead>
              <tbody>
                <tr style={pureStyles.tableRow}>
                  <td
                    style={{
                      ...pureStyles.tableCell,
                      fontWeight: "500",
                      fontSize: "17px",
                    }}
                  >
                    {reportData.infobase_nasc_dia}/
                    {reportData.infobase_nasc_mes}/
                    {reportData.infobase_nasc_ano}
                  </td>
                  <td style={{ ...pureStyles.tableCell, fontSize: "17px" }}>
                    {reportData.infobase_nomemae_full}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Addresses Section */}
        <div style={pureStyles.section} data-pdf-section="true">
          <h3 style={pureStyles.sectionTitle} data-pdf-section-title="true">
            📍 ENDEREÇOS CADASTRADOS
          </h3>
          <div
            style={pureStyles.tableContainer}
            data-pdf-table-container="true"
          >
            <table style={pureStyles.table}>
              <thead style={pureStyles.tableHeader}>
                <tr>
                  <th style={pureStyles.tableHeaderCell}>Logradouro</th>
                  <th style={pureStyles.tableHeaderCell}>Complemento</th>
                  <th style={pureStyles.tableHeaderCell}>Bairro</th>
                  <th style={pureStyles.tableHeaderCell}>Cidade</th>
                  <th style={pureStyles.tableHeaderCell}>CEP</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2].map((i) => {
                  const prefix = `infobase_histendereco_${i}_` as const;
                  if (reportData[`${prefix}street` as keyof ReportData]) {
                    return (
                      <tr key={i} style={pureStyles.tableRow}>
                        <td style={pureStyles.tableCell}>
                          {reportData[`${prefix}street` as keyof ReportData]}
                        </td>
                        <td style={pureStyles.tableCell}>
                          {
                            reportData[
                              `${prefix}complement` as keyof ReportData
                            ]
                          }
                        </td>
                        <td style={pureStyles.tableCell}>
                          {
                            reportData[
                              `${prefix}neighborhood` as keyof ReportData
                            ]
                          }
                        </td>
                        <td style={pureStyles.tableCell}>
                          {reportData[`${prefix}city` as keyof ReportData]}
                        </td>
                        <td
                          style={{
                            ...pureStyles.tableCell,
                            fontFamily: "monospace",
                            fontWeight: "500",
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

        {/* Phones Section */}
        <div style={pureStyles.section} data-pdf-section="true">
          <h3 style={pureStyles.sectionTitle} data-pdf-section-title="true">
            📞 TELEFONES CADASTRADOS
          </h3>
          <div
            style={pureStyles.tableContainer}
            data-pdf-table-container="true"
          >
            <table style={pureStyles.table}>
              <thead style={pureStyles.tableHeader}>
                <tr>
                  <th style={pureStyles.tableHeaderCell}>
                    Números de Telefone
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.infobase_histcel_celular_1_telefone && (
                  <tr style={pureStyles.tableRow}>
                    <td
                      style={{
                        ...pureStyles.tableCell,
                        fontFamily: "monospace",
                        fontWeight: "600",
                        fontSize: "18px",
                      }}
                    >
                      {reportData.infobase_histcel_celular_1_telefone}
                    </td>
                  </tr>
                )}
                {reportData.infobase_histtel_telefone_2_telefone && (
                  <tr style={pureStyles.tableRow}>
                    <td
                      style={{
                        ...pureStyles.tableCell,
                        fontFamily: "monospace",
                        fontWeight: "600",
                        fontSize: "18px",
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

        {/* Emails Section */}
        <div style={pureStyles.section} data-pdf-section="true">
          <h3 style={pureStyles.sectionTitle} data-pdf-section-title="true">
            📧 EMAILS CADASTRADOS
          </h3>
          <div
            style={pureStyles.tableContainer}
            data-pdf-table-container="true"
          >
            <table style={pureStyles.table}>
              <thead style={pureStyles.tableHeader}>
                <tr>
                  <th style={pureStyles.tableHeaderCell}>Endereços de Email</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => {
                  const key =
                    `infobase_histemail_${i}_email` as keyof ReportData;
                  if (reportData[key]) {
                    return (
                      <tr key={i} style={pureStyles.tableRow}>
                        <td
                          style={{
                            ...pureStyles.tableCell,
                            fontFamily: "monospace",
                            color: "rgb(37, 99, 235)",
                            fontWeight: "500",
                            fontSize: "17px",
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
        <div style={pureStyles.footer} data-pdf-footer="true">
          <div style={pureStyles.footerLine}>
            <strong style={{ fontSize: "18px" }}>📞 (64) 3623-0280</strong>
          </div>
          <div
            style={{ ...pureStyles.footerLine, ...pureStyles.footerCompany }}
          >
            TH LOGISTICA
          </div>
          <div style={pureStyles.footerLine}>
            <strong>CNPJ:</strong> 33.426.690/0001-02 |{" "}
            <strong>Telefone:</strong> +55 (64) 3623-0280
          </div>
        </div>
      </div>
    );
  }
);

ReportContentPure.displayName = "ReportContentPure";
