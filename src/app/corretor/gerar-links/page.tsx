"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Link,
  Copy,
  Share2,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  createdAt: Date;
  corretorId: string;
}

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export default function GerarLinksPage() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [linkGerado, setLinkGerado] = useState("");
  const [leadsCapturados, setLeadsCapturados] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsHoje: 0,
    leadsEstaSemana: 0,
  });

  // Gerar link único baseado no ID do usuário
  const gerarLink = () => {
    if (!currentUser?.id) {
      toast.error("Erro: Usuário não autenticado");
      return;
    }

    const baseUrl = window.location.origin;
    const linkUnico = `${baseUrl}/capturar-lead/${currentUser.id}`;
    setLinkGerado(linkUnico);
    toast.success("Link gerado com sucesso!");
  };

  // Copiar link para área de transferência
  const copiarLink = async () => {
    if (!linkGerado) return;
    
    try {
      await navigator.clipboard.writeText(linkGerado);
      toast.success("Link copiado para área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  // Compartilhar via WhatsApp
  const compartilharWhatsApp = () => {
    if (!linkGerado) return;
    
    const mensagem = encodeURIComponent(
      `Olá! Estou disponível para ajudar você com suas necessidades imobiliárias. Deixe seus dados neste link e entrarei em contato: ${linkGerado}`
    );
    const urlWhatsApp = `https://wa.me/?text=${mensagem}`;
    window.open(urlWhatsApp, "_blank");
  };

  // Abrir link em nova aba
  const visualizarLink = () => {
    if (!linkGerado) return;
    window.open(linkGerado, "_blank");
  };

  // Carregar sessão do usuário
  useEffect(() => {
    async function loadSession() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          const user = session.user as any;
          setCurrentUser({
            id: user.id,
            name: user.name || user.email || "Usuário",
            email: user.email || "",
            role: user.role || "CORRETOR",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      }
    }
    loadSession();
  }, []);

  // Buscar leads capturados
  const buscarLeads = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      // Primeiro buscar dados do corretor
      const corretorResponse = await fetch(`/api/corretores/${currentUser.id}`);
      if (corretorResponse.ok) {
        const corretorData = await corretorResponse.json();
        
        // Buscar leads usando o corretorId correto
        const response = await fetch(`/api/leads/corretor/${corretorData.id}`);
        if (response.ok) {
          const data = await response.json();
          setLeadsCapturados(data.leads || []);
          setStats({
            totalLeads: data.stats?.totalLeads || 0,
            leadsHoje: data.stats?.leadsHoje || 0,
            leadsEstaSemana: data.stats?.leadsEstaSemana || 0
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      buscarLeads();
    }
  }, [currentUser]);

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <Link className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Gerador de Links
          </h1>
          <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto px-4">
            Crie links personalizados para capturar leads e acompanhe seus resultados em tempo real
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="bg-purple-600 p-2 md:p-3 rounded-xl">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">Total de Leads</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="bg-green-600 p-2 md:p-3 rounded-xl">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">Leads Hoje</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats.leadsHoje}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="bg-blue-600 p-2 md:p-3 rounded-xl">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">Esta Semana</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats.leadsEstaSemana}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gerador de Link */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
              <Link className="h-4 w-4 md:h-5 md:w-5" />
              <span>Gerar Link de Captura</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="text-center">
              <Button
                onClick={gerarLink}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg"
              >
                <Link className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Gerar Novo Link
              </Button>
            </div>

            {linkGerado && (
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    value={linkGerado}
                    readOnly
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                  <Button
                    onClick={copiarLink}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="ml-2 sm:hidden">Copiar</span>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                  <Button
                    onClick={compartilharWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar WhatsApp
                  </Button>
                  <Button
                    onClick={visualizarLink}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-sm md:text-base"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Capturados */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-white flex items-center space-x-2 text-lg md:text-xl">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span>Leads Capturados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-300 mt-2 text-sm md:text-base">Carregando leads...</p>
              </div>
            ) : leadsCapturados.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className="text-gray-300 text-sm md:text-base">Nenhum lead capturado ainda</p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">Compartilhe seu link para começar a receber leads</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {leadsCapturados.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 md:p-3 rounded-xl flex-shrink-0">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-sm md:text-base truncate">{lead.nome}</p>
                        <div className="flex items-center space-x-2 text-gray-300 text-xs md:text-sm">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">{lead.telefone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-start sm:self-center">
                      <Badge variant="secondary" className="bg-white/10 text-gray-300 text-xs">
                        {formatarData(lead.createdAt)}
                      </Badge>
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