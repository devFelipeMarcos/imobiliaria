"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Contact,
  Link as LinkIcon,
  TrendingUp,
  Calendar,
  Users,
  Phone,
  Mail,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  createdAt: string;
}

interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  leads: Lead[];
}

interface Atividade {
  id: string;
  acao: string;
  entidade: string;
  descricao: string;
  usuario: string;
  createdAt: string;
  tipo: string;
  icone: string;
}

export default function CorretorDashboard() {
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [corretorId, setCorretorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          
          // Buscar dados do corretor
          const corretorResponse = await fetch(`/api/corretores/${session.user.id}`);
          if (corretorResponse.ok) {
            const corretorData = await corretorResponse.json();
            setCorretorId(corretorData.id);
            
            // Buscar estatísticas de leads
            const leadsResponse = await fetch(`/api/leads/corretor/${corretorData.id}`);
            if (leadsResponse.ok) {
              const leadsData = await leadsResponse.json();
              setLeadStats({
                total: leadsData.stats?.totalLeads || 0,
                today: leadsData.stats?.leadsHoje || 0,
                thisWeek: leadsData.stats?.leadsEstaSemana || 0,
                leads: leadsData.leads || []
              });
            }
            
            // Buscar atividades recentes
            const atividadesResponse = await fetch(`/api/atividades/corretor/${corretorData.id}`);
            if (atividadesResponse.ok) {
              const atividadesData = await atividadesResponse.json();
              if (atividadesData.success) {
                setAtividades(atividadesData.data);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-slate-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
            <Building className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Dashboard do Corretor
          </h1>
          <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Gerencie seus leads e acompanhe seu desempenho
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Total de Leads</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {leadStats?.total || 0}
                  </p>
                </div>
                <div className="bg-purple-600 p-2 md:p-3 rounded-xl">
                  <Contact className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Leads Hoje</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {leadStats?.today || 0}
                  </p>
                </div>
                <div className="bg-green-600 p-2 md:p-3 rounded-xl">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Esta Semana</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {leadStats?.thisWeek || 0}
                  </p>
                </div>
                <div className="bg-blue-600 p-2 md:p-3 rounded-xl">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="text-center space-y-3 md:space-y-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 md:p-4 rounded-xl mx-auto w-fit">
                  <LinkIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-white">Gerar Links</h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    Crie links personalizados para capturar leads
                  </p>
                </div>
                <Link href="/corretor/gerar-links">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm md:text-base">
                    Acessar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="text-center space-y-3 md:space-y-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 md:p-4 rounded-xl mx-auto w-fit">
                  <Contact className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-white">Meus Leads</h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    Visualize e gerencie todos os seus leads
                  </p>
                </div>
                <Link href="/corretor/meus-leads">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm md:text-base">
                    Acessar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="text-center space-y-3 md:space-y-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 md:p-4 rounded-xl mx-auto w-fit">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-white">Relatórios</h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    Acompanhe seu desempenho e métricas
                  </p>
                </div>
                <Link href="/corretor/relatorios">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-sm md:text-base">
                    Acessar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid com Leads Recentes e Atividades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Leads Recentes */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Contact className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                Leads Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {leadStats?.leads && leadStats.leads.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {leadStats.leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg flex-shrink-0">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm md:text-base truncate">{lead.nome}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-300 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{formatPhone(lead.telefone)}</span>
                            </span>
                            <span className="flex items-center gap-1 mt-1 sm:mt-0">
                              <Clock className="h-3 w-3" />
                              {formatDate(lead.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-600/30 text-xs flex-shrink-0 ml-2">
                        Novo
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Contact className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-300 text-sm md:text-base">Nenhum lead encontrado</p>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">
                    Comece gerando links para capturar seus primeiros leads
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {atividades && atividades.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {atividades.slice(0, 5).map((atividade) => (
                    <div
                      key={atividade.id}
                      className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="text-lg md:text-2xl flex-shrink-0">{atividade.icone}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-xs md:text-sm leading-tight">
                          {atividade.descricao}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs text-gray-400 mt-1">
                          <span className="truncate">{atividade.usuario}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="mt-1 sm:mt-0">{formatDate(atividade.createdAt)}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-purple-600/10 text-purple-300 border-purple-600/30 text-xs flex-shrink-0 ml-2"
                      >
                        {atividade.acao}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Clock className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-300 text-sm md:text-base">Nenhuma atividade encontrada</p>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">
                    As atividades aparecerão aqui conforme você usar o sistema
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}