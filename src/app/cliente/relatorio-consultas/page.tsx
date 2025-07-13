import { FileText, Download, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RelatorioConsultasPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Relatório de Consultas
          </h1>
          <p className="text-slate-600">
            Visualize e exporte relatórios detalhados das suas consultas
            realizadas.
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Consultas
              </CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">127</div>
              <p className="text-xs text-slate-500">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Consultas Aprovadas
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">98</div>
              <p className="text-xs text-slate-500">77% de aprovação</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Este Mês
              </CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">23</div>
              <p className="text-xs text-slate-500">Consultas realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações de Relatório */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Exportar Relatórios</CardTitle>
            <CardDescription>
              Gere e baixe relatórios personalizados das suas consultas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Relatório Mensal (PDF)
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Relatório Anual (Excel)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
