"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface DashboardStats {
  totalImobiliarias: number;
  totalAdmins: number;
  totalCorretores: number;
  totalLeads: number;
}

interface RecentActivity {
  id: string;
  acao: string;
  entidade: string;
  descricao: string;
  usuario: string;
  createdAt: string;
  tipo: string;
}

export default function AdmMasterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas gerais
      const statsResponse = await fetch("/api/admmaster/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Buscar atividades recentes
      const activitiesResponse = await fetch("/api/admmaster/activities");
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Master</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admmaster/criar-imobiliaria">
              <Plus className="mr-2 h-4 w-4" />
              Nova Imobiliária
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imobiliárias</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalImobiliarias || 0}</div>
            <p className="text-xs text-muted-foreground">
              Imobiliárias cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAdmins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Administradores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Corretores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCorretores || 0}</div>
            <p className="text-xs text-muted-foreground">
              Corretores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Leads no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Gerenciar Imobiliárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admmaster/criar-imobiliaria">
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Imobiliária
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admmaster/imobiliarias">
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Existentes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Gerenciar Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admmaster/criar-admin">
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Admin
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admmaster/admins">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Existentes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admmaster/relatorios">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Relatórios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((atividade) => (
                <div key={atividade.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {atividade.acao}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {atividade.descricao} - {atividade.usuario}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(atividade.createdAt).toLocaleDateString()}
                  </div>
                  <Badge variant="outline">{atividade.tipo}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma atividade recente encontrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}