// app/api/ark/pdf/route.ts
import { NextResponse } from "next/server";
import { formatAnaliseDetalhe } from "@/app/datapf/format";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(request: Request) {
  // 1) Buscando os dados da nossa API simulada
  const { origin } = new URL(request.url);
  const res = await fetch(`${origin}/api/ark`);
  const { elements } = await res.json();
  const detalheRaw = elements?.[0]?.AnaliseDetalhe || "";
  const d = formatAnaliseDetalhe(detalheRaw);

  // 2) Criação do PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSizeTitle = 18;
  const fontSize = 12;
  const margin = 50;
  let y = height - margin;

  // Título
  page.drawText("Relatório de Risk Consulting", {
    x: margin,
    y: y,
    size: fontSizeTitle,
    font,
    color: rgb(0.1, 0.1, 0.5),
  });
  y -= fontSizeTitle + 20;

  // Seção Identificadores
  page.drawText("Dados Identificadores", {
    x: margin,
    y: y,
    size: fontSize + 2,
    font,
  });
  y -= fontSize + 10;
  const identificadores = [
    `CPF: ${d.infobase_cpf}`,
    `Nome: ${d.infobase_personnome_nome_full}`,
    `Data Nascimento: ${d.infobase_nasc_dia}/${d.infobase_nasc_mes}/${d.infobase_nasc_ano}`,
    `Nome Mãe: ${d.infobase_nomemae_full}`,
  ];
  identificadores.forEach((line) => {
    page.drawText(line, { x: margin, y, size: fontSize, font });
    y -= fontSize + 4;
  });
  y -= 10;

  // Seção Endereços
  page.drawText("Endereços", { x: margin, y, size: fontSize + 2, font });
  y -= fontSize + 10;
  for (let i = 1; i <= 2; i++) {
    page.drawText(`Endereço ${i}:`, { x: margin, y, size: fontSize + 1, font });
    y -= fontSize + 6;
    const prefix = `infobase_histendereco_${i}_`;
    const linhas = [
      `Logradouro: ${d[`${prefix}street`]}`,
      `Complemento: ${d[`${prefix}complement`]}`,
      `Bairro: ${d[`${prefix}neighborhood`]}`,
      `Cidade: ${d[`${prefix}city`]}`,
      `CEP: ${d[`${prefix}postalcode`]}`,
    ];
    linhas.forEach((line) => {
      page.drawText(line, { x: margin + 10, y, size: fontSize, font });
      y -= fontSize + 4;
    });
    y -= 6;
  }
  y -= 10;

  // Seção Contato
  page.drawText("Contato", { x: margin, y, size: fontSize + 2, font });
  y -= fontSize + 10;
  page.drawText(`Fone 1: ${d.infobase_histcel_celular_1_telefone}`, {
    x: margin,
    y,
    size: fontSize,
    font,
  });
  y -= fontSize + 4;
  page.drawText(`Fone 2: ${d.infobase_histtel_telefone_2_telefone}`, {
    x: margin,
    y,
    size: fontSize,
    font,
  });
  y -= fontSize + 10;
  page.drawText("E‑mails:", { x: margin, y, size: fontSize + 1, font });
  y -= fontSize + 6;
  [1, 2, 3, 4].forEach((i) => {
    const key = `infobase_histemail_${i}_email`;
    const val = d[key];
    if (val) {
      page.drawText(`- ${val}`, { x: margin + 10, y, size: fontSize, font });
      y -= fontSize + 4;
    }
  });

  // 3) Retornar o PDF gerado
  const pdfBytes = await pdfDoc.save();
  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="relatorio_ark.pdf"',
    },
  });
}
