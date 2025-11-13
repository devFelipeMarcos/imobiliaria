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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Filter, MoreVertical, Edit, Calendar, Phone, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

// Tipos mínimos para este painel
interface Status {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  ativo?: boolean;
}

interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  status?: { id: string; nome: string; cor: string } | null;
  user?: { id: string; name: string } | null;
  imobiliaria?: { id: string; nome: string } | null;
  _count?: { observacoes: number };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function TodosLeadsAdminPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatusId, setNewStatusId] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");

  // Buscar lista de status
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatusList((data.statusList || []).filter((s: Status) => s.ativo !== false));
      }
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    }
  };

  // Buscar leads com filtros e paginação
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (statusFilter) params.set("statusId", statusFilter);
      // Utiliza a rota com controle de acesso por role
      const response = await fetch(`/api/cliente/leads?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 403) {
          setError("Você não tem permissão para visualizar todos os leads.");
        } else {
          setError("Falha ao carregar leads.");
        }
        setLeads([]);
      } else {
        const data = await response.json();
        setLeads(data.leads || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
      setError("Erro interno ao carregar leads.");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status/observação do lead
  const handleUpdateLead = async () => {
    if (!selectedLead || !newStatusId) {
      toast.error("Selecione um status para atualizar");
      return;
    }
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: newStatusId, observacao }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Não foi possível atualizar o lead");
        return;
      }
      toast.success("Lead atualizado com sucesso");
      setSelectedLead(null);
      setNewStatusId("");
      setObservacao("");
      fetchLeads();
    } catch (err) {
      console.error("Erro ao atualizar lead:", err);
      toast.error("Erro interno ao atualizar lead");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const nextPage = () => {
    if (pagination && page < pagination.totalPages) setPage((p) => p + 1);
  };
  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 p-6">
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white shadow-xl">
          <PageHeader
            title="📋 Todos os Leads"
            description="Visualize os leads de todos os corretores conforme sua permissão"
          />
        </div>
 

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-xl">🔍 Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200" />
                <Input
                  placeholder="Buscar por nome, telefone ou e-mail"
                  value={search}
                  onChange={handleSearch}
                  className="pl-10 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-200" />
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                    <SelectItem value="ALL">Todos os Status</SelectItem>
                    {statusList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm text-blue-200">
                  {pagination?.totalCount || 0} resultados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
 

      <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white text-xl">📊 Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-white mb-2">Nenhum lead encontrado</h3>
              <p className="text-blue-200">Ajuste os filtros ou tente novamente.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                  onClick={() => router.push(`/corretor/leads/${lead.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">👤 {lead.nome}</h3>
                        <p className="text-blue-200 text-sm flex items-center gap-1">
                          <Phone className="h-4 w-4" /> {lead.telefone || "-"}
                        </p>
                        {lead.email && (
                          <p className="text-blue-300 text-xs truncate flex items-center gap-1">✉️ {lead.email}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-200 hover:text-white hover:bg-white/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                          <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                            <Link href={`/corretor/leads/${lead.id}`}>👁️ Ver detalhes</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedLead(lead); setNewStatusId(lead.status?.id || ""); setObservacao(""); }} className="text-white hover:bg-white/20">
                            <Edit className="h-4 w-4 mr-2" /> ✏️ Atualizar status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium px-2 py-1 rounded-full border border-white/20"
                        style={{ backgroundColor: lead.status?.cor || "#6b7280", color: "white" }}
                      >
                        🏷️ {lead.status?.nome || "Sem status"}
                      </Badge>
                      {lead._count?.observacoes ? (
                        <div className="flex items-center gap-1 text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">
                          <MessageSquare className="h-3 w-3" />
                          {lead._count.observacoes}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-xs text-blue-200 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        📅 Criado: {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      {lead.updatedAt !== lead.createdAt && (
                        <div className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          🔄 Atualizado: {new Date(lead.updatedAt).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">
                      👨‍💼 Corretor: {lead.user?.name || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
        <p className="text-sm text-blue-200">📄 Página {page} de {pagination?.totalPages || 1}</p>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={prevPage} disabled={page <= 1} className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50">
            ⬅️ Anterior
          </Button>
          <Button onClick={nextPage} disabled={pagination ? page >= pagination.totalPages : false} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50">
            Próxima ➡️
          </Button>
        </div>
      </div>
 

      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="bg-slate-800/95 border-white/20 text-white backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">✏️ Atualizar status do lead</DialogTitle>
          </DialogHeader>
           <div className="space-y-4">
             <div>

              <Label className="text-white">Status</Label>
              <Select value={newStatusId} onValueChange={setNewStatusId}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-sm">
                   {statusList.map((s) => (
                     <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div>
              <Label className="text-white">Observação (opcional)</Label>
               <Textarea
                 placeholder="Descreva o motivo da mudança ou observações"
                 value={observacao}
                 onChange={(e) => setObservacao(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm"
               />
             </div>
             <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedLead(null)} className="bg-white/10 border-white/30 text-white hover:bg-white/20">Cancelar</Button>
              <Button onClick={handleUpdateLead} className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700">Salvar</Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
   );
}
