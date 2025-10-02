"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Phone, Calendar, Filter, MoreVertical, MessageSquare, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  status?: {
    id: string;
    nome: string;
    cor: string;
    descricao?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  imobiliaria: {
    id: string;
    nome: string;
  };
  _count?: {
    observacoes: number;
  };
}

interface Status {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  ativo: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Estados para alterar status
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatusList(data.statusList.filter((status: Status) => status.ativo));
      }
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    }
  };

  const fetchLeads = async (page: number = 1, search: string = "", statusId: string = "", sort: string = "createdAt", order: string = "desc") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy: sort,
        sortOrder: order,
      });

      if (search) {
        params.append("search", search);
      }

      if (statusId && statusId !== "all") {
        params.append("statusId", statusId);
      }

      const response = await fetch(`/api/cliente/leads?${params}`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar leads");
      }

      const data = await response.json();
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      setError("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    fetchLeads(currentPage, searchTerm, selectedStatus, sortBy, sortOrder);
  }, [currentPage, selectedStatus, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLeads(1, searchTerm, selectedStatus, sortBy, sortOrder);
  };

  const handleFilterChange = (statusId: string) => {
    setSelectedStatus(statusId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openStatusDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status?.id || "");
    setObservacao("");
    setIsDialogOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId: newStatus || undefined,
          observacao: observacao.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar lead");
      }

      // Atualizar a lista de leads
      await fetchLeads(currentPage, searchTerm, selectedStatus, sortBy, sortOrder);
      
      setIsDialogOpen(false);
      setSelectedLead(null);
      setNewStatus("");
      setObservacao("");
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      setError("Erro ao atualizar lead");
    } finally {
      setUpdating(false);
    }
  };

  const handleLeadClick = (leadId: string) => {
    router.push(`/cliente/leads/${leadId}`);
  };

  if (loading && leads.length === 0) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white shadow-xl">
          <PageHeader
            title="📋 Meus Leads"
            description="Gerencie todos os seus leads de forma eficiente"
            action={
              <Link href="/cliente/leads/novo">
                <Button className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <UserPlus className="mr-2 h-4 w-4" />
                  ✨ Novo Lead
                </Button>
              </Link>
            }
          />
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Linha de busca */}
              <div className="flex gap-4">
                <Input
                  placeholder="🔍 Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-500 to-teal-600 text-white hover:from-blue-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Linha de filtros */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-200" />
                  <span className="text-sm text-blue-200">Filtros:</span>
                </div>
                
                <Select value={selectedStatus} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/30 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusList.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: status.cor }}
                          />
                          {status.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/30 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                    <SelectItem value="createdAt">📅 Data de criação</SelectItem>
                    <SelectItem value="updatedAt">🔄 Última atualização</SelectItem>
                    <SelectItem value="nome">👤 Nome</SelectItem>
                    <SelectItem value="telefone">📱 Telefone</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  🧹 Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Leads */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-xl">📊 Lista de Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum lead encontrado
                </h3>
                <p className="text-blue-200 mb-6">
                  Comece cadastrando seu primeiro lead para começar a gerenciar seus contatos.
                </p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/cliente/leads/novo">
                    <UserPlus className="mr-2 h-4 w-4" />
                    ✨ Cadastrar Primeiro Lead
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <div className="space-y-3">
                      {/* Header com nome e ações */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-white cursor-pointer hover:text-green-400 truncate transition-colors duration-200"
                            onClick={() => handleLeadClick(lead.id)}
                          >
                            👤 {lead.nome}
                          </h3>
                          <p className="text-blue-200 text-sm flex items-center gap-1">
                            📱 {lead.telefone}
                          </p>
                          {lead.email && (
                            <p className="text-blue-300 text-xs truncate flex items-center gap-1">
                              ✉️ {lead.email}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-200 hover:text-white hover:bg-white/20">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/cliente/leads/${lead.id}`)}
                              className="text-white hover:bg-white/20"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              👁️ Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openStatusDialog(lead)}
                              className="text-white hover:bg-white/20"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              ✏️ Alterar status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary"
                          className="text-xs font-medium px-2 py-1 rounded-full border border-white/20"
                          style={{
                            backgroundColor: lead.status?.cor || '#6b7280',
                            color: 'white'
                          }}
                        >
                          🏷️ {lead.status?.nome || 'Sem status'}
                        </Badge>
                        {lead._count && lead._count.observacoes > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">
                            <MessageSquare className="h-3 w-3" />
                            {lead._count.observacoes}
                          </div>
                        )}
                      </div>

                      {/* Datas */}
                      <div className="text-xs text-blue-200 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          📅 Criado: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {lead.updatedAt !== lead.createdAt && (
                          <div className="flex items-center gap-1">
                            <Edit className="h-3 w-3" />
                            🔄 Atualizado: {new Date(lead.updatedAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>

                      {/* Corretor */}
                      <div className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">
                        👨‍💼 Corretor: {lead.user.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-blue-200">
                  📄 Página {pagination.page} de {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    ⬅️ Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Próxima ➡️
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo para alterar status */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-slate-800/95 border-white/20 text-white backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">✏️ Alterar Status do Lead</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="font-medium text-white mb-2">👤 {selectedLead.nome}</h4>
                  <p className="text-sm text-blue-200">📱 {selectedLead.telefone}</p>
                  {selectedLead.email && (
                    <p className="text-sm text-blue-200">✉️ {selectedLead.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">🏷️ Novo Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white backdrop-blur-sm">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: status.cor }}
                            />
                            {status.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao" className="text-white">
                    📝 Observação {newStatus !== selectedLead.status?.id ? "(opcional)" : "(obrigatória)"}
                  </Label>
                  <Textarea
                    id="observacao"
                    placeholder="Adicione uma observação sobre este lead..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    ❌ Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateLead}
                    disabled={updating || (!observacao.trim() && newStatus === selectedLead.status?.id)}
                    className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 disabled:opacity-50"
                  >
                    {updating ? "💾 Salvando..." : "✅ Salvar"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}