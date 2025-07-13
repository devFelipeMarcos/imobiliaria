"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ConsultaStatus = "PENDENTE" | "CONCLUÍDO" | "ERROR API" | "PROCESSANDO";

type Consulta = {
  id: string;
  cpf: string;
  dataHora: string;
  status: ConsultaStatus;
};

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(cpf.charAt(10))) return false;

  return true;
}

// Função para formatar CPF
function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, "");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getStatusIcon(status: ConsultaStatus) {
  switch (status) {
    case "CONCLUÍDO":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "ERROR API":
      return <XCircle className="h-4 w-4 text-orange-600" />;
    case "PROCESSANDO":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}

function getStatusVariant(status: ConsultaStatus) {
  switch (status) {
    case "CONCLUÍDO":
      return "default"; // Será customizado com classe CSS
    case "ERROR API":
      return "secondary";
    case "PROCESSANDO":
      return "outline";
    default:
      return "outline";
  }
}

// Dados mock expandidos para demonstrar a paginação
const consultasMock: Consulta[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1).padStart(3, "0"),
  cpf: `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(
    Math.random() * 900 + 100
  )}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(
    Math.random() * 90 + 10
  )}`,
  dataHora: new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
  ).toLocaleString("pt-BR"),
  status: ["PENDENTE", "CONCLUÍDO", "ERROR API", "PROCESSANDO"][
    Math.floor(Math.random() * 4)
  ] as ConsultaStatus,
}));

export default function ConsultasPage() {
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [consultas, setConsultas] = useState<Consulta[]>(consultasMock);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(consultas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsultas = consultas.slice(startIndex, endIndex);

  const handleCpfChange = (value: string) => {
    const formatted = formatarCPF(value);
    setCpf(formatted);

    // Validação automática quando tiver 11 dígitos
    const numericValue = value.replace(/[^\d]/g, "");
    if (numericValue.length === 11) {
      if (!validarCPF(numericValue)) {
        setCpfError("CPF inválido");
      } else {
        setCpfError("");
      }
    } else if (numericValue.length > 0 && numericValue.length < 11) {
      setCpfError("");
    } else {
      setCpfError("");
    }
  };

  const handleConsulta = async () => {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");

    if (!validarCPF(cpfLimpo)) {
      setCpfError("CPF inválido");
      toast.error("Por favor, insira um CPF válido");
      return;
    }

    setIsLoading(true);

    try {
      // Simular chamada da API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const novaConsulta: Consulta = {
        id: String(Date.now()),
        cpf: cpf,
        dataHora: new Date().toLocaleString("pt-BR"),
        status: "PROCESSANDO",
      };

      setConsultas((prev) => [novaConsulta, ...prev]);
      setCpf("");
      toast.success("Consulta realizada com sucesso!");

      // Volta para a primeira página para mostrar a nova consulta
      setCurrentPage(1);
    } catch (error) {
      toast.error("Erro ao realizar consulta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAtualizarHistorico = async () => {
    toast.info("Atualizando histórico...");

    // Simular atualização
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Atualizar status das consultas em processamento
    setConsultas((prev) =>
      prev.map((consulta) => {
        if (consulta.status === "PROCESSANDO") {
          return {
            ...consulta,
            status: Math.random() > 0.5 ? "CONCLUÍDO" : "ERROR API",
          };
        }
        return consulta;
      })
    );

    toast.success("Histórico atualizado!");
  };

  const handleVisualizarPdf = async (consultaId: string) => {
    setLoadingPdf(`view-${consultaId}`);

    try {
      // Simular carregamento do PDF
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aqui você abriria o PDF em uma nova aba ou modal
      toast.success("PDF carregado com sucesso!");

      // Simular abertura do PDF
      window.open(`/api/consultas/${consultaId}/pdf`, "_blank");
    } catch (error) {
      toast.error("Erro ao carregar PDF");
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleBaixarPdf = async (consultaId: string) => {
    setLoadingPdf(`download-${consultaId}`);

    try {
      // Simular download do PDF
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("PDF baixado com sucesso!");

      // Simular download
      const link = document.createElement("a");
      link.href = `/api/consultas/${consultaId}/pdf?download=true`;
      link.download = `consulta-${consultaId}.pdf`;
      link.click();
    } catch (error) {
      toast.error("Erro ao baixar PDF");
    } finally {
      setLoadingPdf(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Consultas de Antecedentes
          </h1>
          <p className="text-slate-600">
            Realize consultas de antecedentes criminais e acompanhe o histórico
            das suas solicitações.
          </p>
        </div>

        {/* Formulário de Consulta */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Nova Consulta</span>
            </CardTitle>
            <CardDescription>
              Insira o CPF para realizar uma nova consulta de antecedentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                maxLength={14}
                className={cpfError ? "border-red-500" : ""}
              />
              {cpfError && <p className="text-sm text-red-600">{cpfError}</p>}
            </div>
            <Button
              onClick={handleConsulta}
              disabled={isLoading || !cpf}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Realizar Consulta
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Consultas */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico de Consultas</CardTitle>
              <CardDescription>
                {consultas.length} consulta{consultas.length !== 1 ? "s" : ""}{" "}
                encontrada
                {consultas.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAtualizarHistorico}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentConsultas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        Nenhuma consulta realizada ainda
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentConsultas.map((consulta) => (
                      <TableRow key={consulta.id}>
                        <TableCell className="font-medium">
                          #{consulta.id}
                        </TableCell>
                        <TableCell>{consulta.cpf}</TableCell>
                        <TableCell>{consulta.dataHora}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(consulta.status)}
                            <Badge
                              variant={getStatusVariant(consulta.status)}
                              className={
                                consulta.status === "CONCLUÍDO"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {consulta.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVisualizarPdf(consulta.id)}
                              disabled={
                                loadingPdf === `view-${consulta.id}` ||
                                consulta.status !== "CONCLUÍDO"
                              }
                              title="Visualizar PDF"
                            >
                              {loadingPdf === `view-${consulta.id}` ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBaixarPdf(consulta.id)}
                              disabled={
                                loadingPdf === `download-${consulta.id}` ||
                                consulta.status !== "CONCLUÍDO"
                              }
                              title="Baixar PDF"
                            >
                              {loadingPdf === `download-${consulta.id}` ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, consultas.length)} de {consultas.length}{" "}
                  consultas
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
