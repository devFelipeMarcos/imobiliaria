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
    <div className="space-y-6 p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-white shadow-lg">
        <PageHeader
          title="Meus Leads"
          description="Gerencie todos os seus leads"
          action={
            <Link href="/cliente/leads/novo">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 border-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Lead
              </Button>
            </Link>
          }
        />
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Linha de busca */}
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Linha de filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filtros:</span>
              </div>
              
              <Select value={selectedStatus} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
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
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="createdAt">Data de criação</SelectItem>
                  <SelectItem value="updatedAt">Última atualização</SelectItem>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-gray-400 mb-6">
                Comece cadastrando seu primeiro lead para começar a gerenciar seus contatos.
              </p>
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/cliente/leads/novo">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Lead
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-slate-600 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Header com nome e ações */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-white cursor-pointer hover:text-blue-400 truncate"
                          onClick={() => handleLeadClick(lead.id)}
                        >
                          {lead.nome}
                        </h3>
                        <p className="text-gray-300 text-sm">{lead.telefone}</p>
                        {lead.email && (
                          <p className="text-gray-400 text-xs truncate">{lead.email}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
                          <DropdownMenuItem 
                            onClick={() => router.push(`/cliente/leads/${lead.id}`)}
                            className="text-white hover:bg-slate-600"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openStatusDialog(lead)}
                            className="text-white hover:bg-slate-600"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Alterar status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: lead.status?.cor || '#6b7280',
                          color: 'white'
                        }}
                      >
                        {lead.status?.nome || 'Sem status'}
                      </Badge>
                      {lead._count && lead._count.observacoes > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MessageSquare className="h-3 w-3" />
                          {lead._count.observacoes}
                        </div>
                      )}
                    </div>

                    {/* Datas */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      {lead.updatedAt !== lead.createdAt && (
                        <div className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Atualizado: {new Date(lead.updatedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {/* Corretor */}
                    <div className="text-xs text-gray-400">
                      Corretor: {lead.user.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para alterar status */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Alterar Status do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">{selectedLead.nome}</h4>
                <p className="text-sm text-gray-400">{selectedLead.telefone}</p>
                {selectedLead.email && (
                  <p className="text-sm text-gray-400">{selectedLead.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Novo Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
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
                  Observação {newStatus !== selectedLead.status?.id ? "(opcional)" : "(obrigatória)"}
                </Label>
                <Textarea
                  id="observacao"
                  placeholder="Adicione uma observação sobre este lead..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateLead}
                  disabled={updating || (!observacao.trim() && newStatus === selectedLead.status?.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updating ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}