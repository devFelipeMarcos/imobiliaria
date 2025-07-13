// Importações dinâmicas para evitar problemas de SSR
const jsPDF = typeof window !== "undefined" ? require("jspdf").jsPDF : null;

export const generateTextPdf = async (
  reportData: any,
  onProgress?: (status: string) => void
): Promise<string> => {
  if (!jsPDF) {
    throw new Error("jsPDF não carregado");
  }

  try {
    onProgress?.("Gerando PDF com texto copiável...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const leftMargin = 10;
    const rightMargin = 10;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    const footerHeight = 25; // Espaço reservado para o footer
    let yPosition = 35; // Começar mais baixo por causa do cabeçalho

    // Função para desenhar cabeçalho da página
    const drawPageHeader = () => {
      // Linha superior
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, 15, pageWidth - rightMargin, 15);

      // TH LOGISTICA (esquerda)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("TH LOGISTICA", leftMargin, 25);

      // Telefone (direita)
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("(64) 3623-0280", pageWidth - rightMargin, 25, {
        align: "right",
      });

      // Linha inferior
      pdf.line(leftMargin, 30, pageWidth - rightMargin, 30);
    };

    // Função para desenhar footer da página
    const drawPageFooter = () => {
      const footerY = pageHeight - 20;

      // Linha superior do footer
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, footerY - 5, pageWidth - rightMargin, footerY - 5);

      // Telefone
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("(64) 3623-0280", pageWidth / 2, footerY + 2, {
        align: "center",
      });

      // Nome da empresa
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(
        "Consultebras Gerenciadora de Risco",
        pageWidth / 2,
        footerY + 8,
        { align: "center" }
      );

      // CNPJ
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        "CNPJ: 33.426.690/0001-02 | +55 (64)-3623-0280",
        pageWidth / 2,
        footerY + 13,
        { align: "center" }
      );
    };

    // Função para adicionar nova página se necessário
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - footerHeight - 10) {
        drawPageFooter();
        pdf.addPage();
        drawPageHeader();
        yPosition = 45;
      }
    };

    // Função para calcular altura necessária para uma célula
    const calculateCellHeight = (
      text: string,
      maxWidth: number,
      fontSize = 9
    ) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text || "", maxWidth);
      return Math.max(8, lines.length * 4 + 2); // Mínimo 8mm, +2mm de padding
    };

    // Função para desenhar tabela com bordas completas e cabeçalho compacto
    const drawTable = (headers: string[], rows: string[][], startY: number) => {
      const colWidth = contentWidth / headers.length;
      let currentY = startY;

      // Cabeçalho da tabela - MAIS COMPACTO (8mm em vez de 12mm)
      pdf.setFillColor(37, 99, 235);
      pdf.rect(leftMargin, currentY, contentWidth, 8, "F");

      // Bordas do cabeçalho
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(1);
      pdf.rect(leftMargin, currentY, contentWidth, 8);

      // Linhas verticais do cabeçalho
      for (let i = 1; i < headers.length; i++) {
        pdf.line(
          leftMargin + i * colWidth,
          currentY,
          leftMargin + i * colWidth,
          currentY + 8
        );
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);

      headers.forEach((header, index) => {
        pdf.text(header, leftMargin + 3 + index * colWidth, currentY + 5.5); // Ajustado para 8mm
      });

      currentY += 8;

      // Linhas da tabela
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      rows.forEach((row, rowIndex) => {
        // Calcula a altura necessária para esta linha
        let maxCellHeight = 8;
        row.forEach((cell, colIndex) => {
          const cellWidth = colWidth - 6;
          const cellHeight = calculateCellHeight(cell || "", cellWidth, 9);
          maxCellHeight = Math.max(maxCellHeight, cellHeight);
        });

        // Verifica se precisa de nova página
        checkNewPage(maxCellHeight);

        // Fundo alternado
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(leftMargin, currentY, contentWidth, maxCellHeight, "F");
        }

        // Bordas das células
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);

        // Borda horizontal superior
        pdf.line(leftMargin, currentY, leftMargin + contentWidth, currentY);

        // Bordas verticais
        for (let i = 0; i <= headers.length; i++) {
          pdf.line(
            leftMargin + i * colWidth,
            currentY,
            leftMargin + i * colWidth,
            currentY + maxCellHeight
          );
        }

        // Desenha o conteúdo das células
        row.forEach((cell, colIndex) => {
          const text = cell || "";
          const maxWidth = colWidth - 6;
          const lines = pdf.splitTextToSize(text, maxWidth);

          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(
              line,
              leftMargin + 3 + colIndex * colWidth,
              currentY + 6 + lineIndex * 4
            );
          });
        });

        currentY += maxCellHeight;
      });

      // Borda horizontal inferior da tabela
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, currentY, leftMargin + contentWidth, currentY);

      return currentY;
    };

    // ===== PRIMEIRA PÁGINA - DADOS CADASTRAIS =====
    drawPageHeader();

    // Título principal
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("CONSULTA DADOS CADASTRAIS", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 8;

    // Badge FONTE: PRIVADA
    pdf.setFillColor(37, 99, 235);
    pdf.rect(pageWidth / 2 - 25, yPosition - 4, 50, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("FONTE: PRIVADA", pageWidth / 2, yPosition + 1, {
      align: "center",
    });
    yPosition += 15;

    // Dados pessoais
    pdf.setTextColor(0, 0, 0);
    const personalHeaders = ["CPF", "Nome"];
    const personalRows = [
      [
        reportData.infobase_cpf || "",
        reportData.infobase_personnome_nome_full || "",
      ],
    ];
    yPosition = drawTable(personalHeaders, personalRows, yPosition) + 5;

    const birthHeaders = ["Data Nascimento", "Nome Mãe"];
    const birthRows = [
      [
        `${reportData.infobase_nasc_dia}/${reportData.infobase_nasc_mes}/${reportData.infobase_nasc_ano}`,
        reportData.infobase_nomemae_full || "",
      ],
    ];
    yPosition = drawTable(birthHeaders, birthRows, yPosition) + 10;

    // Endereços
    checkNewPage(30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("ENDEREÇOS:", leftMargin, yPosition);
    yPosition += 8;

    const addressHeaders = [
      "Logradouro",
      "Complemento",
      "Bairro",
      "Cidade",
      "CEP",
    ];
    const addressRows: string[][] = [];

    for (let i = 1; i <= 5; i++) {
      const street = reportData[`infobase_histendereco_${i}_street`];
      if (street) {
        addressRows.push([
          street || "",
          reportData[`infobase_histendereco_${i}_complement`] || "",
          reportData[`infobase_histendereco_${i}_neighborhood`] || "",
          reportData[`infobase_histendereco_${i}_city`] || "",
          reportData[`infobase_histendereco_${i}_postalcode`] || "",
        ]);
      }
    }

    if (addressRows.length > 0) {
      yPosition = drawTable(addressHeaders, addressRows, yPosition) + 10;
    }

    // Telefones
    checkNewPage(30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("TELEFONES:", leftMargin, yPosition);
    yPosition += 8;

    const phoneHeaders = ["Números"];
    const phoneRows: string[][] = [];

    if (reportData.infobase_histcel_celular_1_telefone) {
      const phone1 = reportData.infobase_histcel_celular_1_telefone;
      phoneRows.push([`(${phone1.substring(0, 2)}) ${phone1.substring(2)}`]);
    }
    if (reportData.infobase_histtel_telefone_2_telefone) {
      const phone2 = reportData.infobase_histtel_telefone_2_telefone;
      phoneRows.push([`(${phone2.substring(0, 2)}) ${phone2.substring(2)}`]);
    }

    if (reportData.infobase_histtel_telefone_3_telefone) {
      const phone3 = reportData.infobase_histtel_telefone_3_telefone;
      phoneRows.push([`(${phone3.substring(0, 2)}) ${phone3.substring(2)}`]);
    }

    if (phoneRows.length > 0) {
      yPosition = drawTable(phoneHeaders, phoneRows, yPosition) + 10;
    }

    // Emails
    checkNewPage(30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("EMAILS:", leftMargin, yPosition);
    yPosition += 8;

    const emailHeaders = ["Endereços"];
    const emailRows: string[][] = [];

    for (let i = 1; i <= 4; i++) {
      const email = reportData[`infobase_histemail_${i}_email`];
      if (email) {
        emailRows.push([email]);
      }
    }

    if (emailRows.length > 0) {
      yPosition = drawTable(emailHeaders, emailRows, yPosition) + 10;
    }

    // Relacionamentos
    checkNewPage(30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("RELACIONAMENTOS:", leftMargin, yPosition);
    yPosition += 8;

    const relationHeaders = ["Documento", "Nome", "Relacionamento"];
    const relationRows = [["0", reportData.infobase_nomemae_full || "", "MÃE"]];
    yPosition = drawTable(relationHeaders, relationRows, yPosition) + 15;

    // Footer da primeira página
    drawPageFooter();

    // ===== SEGUNDA PÁGINA - RECEITA FEDERAL =====
    pdf.addPage();
    drawPageHeader();
    yPosition = 45;

    // Título
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("CONSULTA SITUAÇÃO RECEITA FEDERAL", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 8;

    // Badge FONTE: RECEITA FEDERAL
    pdf.setFillColor(37, 99, 235);
    pdf.rect(pageWidth / 2 - 35, yPosition - 4, 70, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("FONTE: RECEITA FEDERAL", pageWidth / 2, yPosition + 1, {
      align: "center",
    });
    yPosition += 15;

    // Dados da Receita Federal
    pdf.setTextColor(0, 0, 0);
    const rfHeaders = ["CPF", "Nome", "Situação"];
    const rfRows = [
      [
        reportData.infobase_cpf || "",
        reportData.infobase_personnome_nome_full || "",
        "REGULAR",
      ],
    ];
    yPosition = drawTable(rfHeaders, rfRows, yPosition) + 5;

    const rfDetailsHeaders = [
      "Data Nascimento",
      "Data Inscrição",
      "Consta Óbito",
    ];
    const rfDetailsRows = [
      [
        `${reportData.infobase_nasc_dia}/${reportData.infobase_nasc_mes}/${reportData.infobase_nasc_ano}`,
        "",
        "NÃO",
      ],
    ];
    yPosition = drawTable(rfDetailsHeaders, rfDetailsRows, yPosition) + 15;

    // Footer da segunda página
    drawPageFooter();

    // ===== TERCEIRA PÁGINA - MANDADOS DE PRISÃO =====
    pdf.addPage();
    drawPageHeader();
    yPosition = 45;

    // Título
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("CONSULTA MANDADOS DE PRISÃO", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 8;

    // Badge FONTE: CNJ
    pdf.setFillColor(37, 99, 235);
    pdf.rect(pageWidth / 2 - 20, yPosition - 4, 40, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("FONTE: CNJ", pageWidth / 2, yPosition + 1, { align: "center" });
    yPosition += 15;

    // Data da consulta
    pdf.setTextColor(0, 0, 0);
    const now = new Date();
    const dateStr =
      now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");

    const consultHeaders = ["Data da requisição", "Última atualização"];
    const consultRows = [[dateStr, dateStr]];
    yPosition = drawTable(consultHeaders, consultRows, yPosition) + 10;

    // Mensagem
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Mensagem Fonte", leftMargin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const message =
      "DOCUMENTO/ENTIDADE INEXISTENTE OU NÃO ENCONTRADA. NÃO HÁ MANDADOS PARA ESTE DOCUMENTO";
    const messageLines = pdf.splitTextToSize(message, contentWidth);
    messageLines.forEach((line: string, index: number) => {
      pdf.text(line, leftMargin, yPosition + index * 5);
    });
    yPosition += messageLines.length * 5 + 15;

    // Footer da terceira página
    drawPageFooter();

    onProgress?.("Finalizando...");

    const pdfBlob = pdf.output("blob");
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error(`Erro ao gerar PDF: ${(error as Error).message}`);
  }
};

export const downloadPdf = (
  pdfUrl: string,
  filename = "relatorio-consulta-cadastral.pdf"
): void => {
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const openPdfInNewTab = (pdfUrl: string): void => {
  window.open(pdfUrl, "_blank");
};
