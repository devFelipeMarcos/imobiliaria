export interface ReportData {
  infobase_cpf: string;
  infobase_personnome_nome_full: string;
  infobase_nasc_dia: string;
  infobase_nasc_mes: string;
  infobase_nasc_ano: string;
  infobase_nomemae_full: string;
  infobase_histendereco_1_street?: string;
  infobase_histendereco_1_complement?: string;
  infobase_histendereco_1_neighborhood?: string;
  infobase_histendereco_1_city?: string;
  infobase_histendereco_1_postalcode?: string;
  infobase_histendereco_2_street?: string;
  infobase_histendereco_2_complement?: string;
  infobase_histendereco_2_neighborhood?: string;
  infobase_histendereco_2_city?: string;
  infobase_histendereco_2_postalcode?: string;
  infobase_histcel_celular_1_telefone?: string;
  infobase_histtel_telefone_2_telefone?: string;
  infobase_histemail_1_email?: string;
  infobase_histemail_2_email?: string;
  infobase_histemail_3_email?: string;
  infobase_histemail_4_email?: string;
}

export interface AppState {
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  reportData: ReportData | null;
  generatingPdf: boolean;
  currentDateTime: string;
  mounted: boolean;
}
