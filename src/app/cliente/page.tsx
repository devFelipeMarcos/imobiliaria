"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { authClient } from "@/lib/auth-client";
import {
  Users,
  UserPlus,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  Building,
  Phone,
  Mail,
  Clock,
  Filter,
  PieChart,
} from "lucide-react";
import Link from "next/link";

// Lazy loading dos componentes de gráficos para melhor performance
const CustomLineChart = lazy(() => import("@/components/charts/line-chart").then(module => ({ default: module.CustomLineChart })));
const CustomPieChart = lazy(() => import("@/components/charts/pie-chart").then(module => ({ default: module.CustomPieChart })));
const CustomBarChart = lazy(() => import("@/components/charts/bar-chart").then(module => ({ default: module.CustomBarChart })));

interface DashboardStats {
  estatisticasBasicas: {
    totalLeads: number;
    leadsHoje: number;
    leadsSemana: number;
    leadsMes: number;
  };
  leadsPorStatus: Array<{
    status: string;
    cor: string;
    count: number;
  }>;
  dadosGraficoTempo: Array<{
    data: string;
    leads: number;
  }>;
  topCorretores: Array<{
    id: string;
    nome: string;
    totalLeads: number;
  }>;
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status: {
    nome: string;
    cor: string;
  };
  user: {
    name: string;
  };
  createdAt: string;
}

interface Corretor {
  id: string;
  name: string;
  email: string;
  totalLeads: number;
}

interface Status {
  id: string;
  nome: string;
  cor: string;
}

export default function ClienteDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCorretor, setSelectedCorretor] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const loadDashboardData = async (corretorFilter?: string, statusFilter?: string) => {
    try {
      const params = new URLSearchParams();
      if (corretorFilter && corretorFilter !== 'all') params.append("corretor", corretorFilter);
      if (statusFilter && statusFilter !== 'all') params.append("status", statusFilter);

      const statsResponse = await fetch(`/api/dashboard/stats?${params.toString()}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          setError("Usuário não autenticado");
          return;
        }

        // Carregamento paralelo de todos os dados para melhor performance
        const [statsResult, corretoresResult, statusResult, leadsResult] = await Promise.allSettled([
          loadDashboardData(),
          fetch("/api/dashboard/corretores").then(res => res.ok ? res.json() : null),
          fetch("/api/status").then(res => res.ok ? res.json() : null),
          fetch("/api/cliente/leads?limit=5").then(res => res.ok ? res.json() : null)
        ]);

        // Processar resultados dos corretores
        if (corretoresResult.status === 'fulfilled' && corretoresResult.value) {
          setCorretores(corretoresResult.value.corretores || []);
        }

        // Processar resultados dos status
        if (statusResult.status === 'fulfilled' && statusResult.value) {
          setStatuses(statusResult.value.statusList || []);
        }

        // Processar resultados dos leads recentes
        if (leadsResult.status === 'fulfilled' && leadsResult.value) {
          setRecentLeads(leadsResult.value.leads || []);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadDashboardData(selectedCorretor, selectedStatus);
    }
  }, [selectedCorretor, selectedStatus]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="space-y-6 p-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-white shadow-xl">
          <PageHeader
            title="📊 Dashboard"
            description="Visão geral dos seus leads e atividades"
          />
        </div>

        {/* Filtros com estilo azul-verde */}
        <div className="flex gap-4 items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
              <Filter className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <Select value={selectedCorretor} onValueChange={setSelectedCorretor}>
            <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todos os corretores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os corretores</SelectItem>
              {corretores.map((corretor) => (
                <SelectItem key={corretor.id} value={corretor.id}>
                  {corretor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Estatísticas com gradientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total de Leads 👥
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.estatisticasBasicas.totalLeads || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Leads Hoje 📈
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.estatisticasBasicas.leadsHoje || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-600/20 to-cyan-800/20 backdrop-blur-sm border border-teal-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">
                Esta Semana 📊
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-600">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.estatisticasBasicas.leadsSemana || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-indigo-800/20 backdrop-blur-sm border border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Este Mês 🗓️
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-600">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.estatisticasBasicas.leadsMes || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos com tema azul-verde */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                📈 Leads por Período
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               {dashboardStats?.dadosGraficoTempo ? (
                 <Suspense fallback={
                   <div className="h-80 flex items-center justify-center">
                     <div className="text-center">
                       <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 mb-4 mx-auto w-fit">
                         <BarChart3 className="h-12 w-12 text-white animate-pulse" />
                       </div>
                       <p className="text-white">Carregando gráfico...</p>
                     </div>
                   </div>
                 }>
                   <CustomLineChart
                     data={dashboardStats.dadosGraficoTempo}
                     color="#0D9488"
                   />
                 </Suspense>
               ) : (
                 <div className="h-80 flex items-center justify-center">
                   <div className="text-center">
                     <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 mb-4 mx-auto w-fit">
                       <BarChart3 className="h-12 w-12 text-white animate-pulse" />
                     </div>
                     <p className="text-white">Carregando dados...</p>
                   </div>
                 </div>
               )}
             </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500">
                  <PieChart className="h-5 w-5" />
                </div>
                🥧 Leads por Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               {dashboardStats?.leadsPorStatus ? (
                 <Suspense fallback={
                   <div className="h-80 flex items-center justify-center">
                     <div className="text-center">
                       <div className="p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mb-4 mx-auto w-fit">
                         <PieChart className="h-12 w-12 text-white animate-pulse" />
                       </div>
                       <p className="text-white">Carregando gráfico...</p>
                     </div>
                   </div>
                 }>
                   <CustomPieChart
                     data={dashboardStats.leadsPorStatus}
                   />
                 </Suspense>
               ) : (
                 <div className="h-80 flex items-center justify-center">
                   <div className="text-center">
                     <div className="p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mb-4 mx-auto w-fit">
                       <PieChart className="h-12 w-12 text-white animate-pulse" />
                     </div>
                     <p className="text-white">Carregando dados...</p>
                   </div>
                 </div>
               )}
             </CardContent>
          </Card>
        </div>

        {/* Top Corretores */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                <Building className="h-5 w-5" />
              </div>
              🏆 Top Corretores
            </CardTitle>
          </CardHeader>
          <CardContent>
             {dashboardStats?.topCorretores ? (
               <CustomBarChart
                 data={dashboardStats.topCorretores}
                 color="#10B981"
               />
             ) : (
               <div className="h-80 flex items-center justify-center">
                 <div className="text-center">
                   <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4 mx-auto w-fit">
                     <Building className="h-12 w-12 text-white animate-pulse" />
                   </div>
                   <p className="text-white">Carregando gráfico...</p>
                 </div>
               </div>
             )}
           </CardContent>
        </Card>

        {/* Ações Rápidas com tema azul-verde */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span>👤</span> Cadastrar Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Adicione um novo lead ao seu pipeline
              </p>
              <Link href="/cliente/leads/novo">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 shadow-lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span>📋</span> Meus Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Visualize e gerencie todos os seus leads
              </p>
              <Link href="/cliente/leads">
                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="mr-2 h-4 w-4" />
                  Ver Leads
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span>🔗</span> Link Dinâmico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Gere um link personalizado para captura de leads
              </p>
              <Link href="/cliente/link-dinamico">
                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Gerar Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Leads Recentes com tema azul-verde */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Clock className="h-5 w-5" />
              </div>
              🕒 Leads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 mb-4 mx-auto w-fit">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <p className="text-blue-100">Nenhum lead encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{lead.nome}</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-200">
                        <Phone className="h-3 w-3" />
                        <span>{lead.telefone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-blue-200">
                          <Mail className="h-3 w-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-blue-300 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span>{lead.user.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {lead.status ? (
                        <Badge
                          style={{ backgroundColor: lead.status.cor }}
                          className="text-white shadow-lg"
                        >
                          {lead.status.nome}
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                          Sem status
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}