"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  descricao: string;
  dadosAntigos?: any;
  dadosNovos?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  usuario: {
    id: string;
    name: string;
    email: string;
  };
  alvoUsuario?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filtros
  const [entidade, setEntidade] = useState("");
  const [acao, setAcao] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (entidade) params.append("entidade", entidade);
      if (acao) params.append("acao", acao);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/audit?${params}`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entidade, acao, startDate, endDate]);

  const handleSearch = () => {
    fetchLogs(1);
  };

  const clearFilters = () => {
    setEntidade("");
    setAcao("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "LOGIN":
        return "bg-purple-100 text-purple-800";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case "Lead":
        return "bg-orange-100 text-orange-800";
      case "User":
        return "bg-indigo-100 text-indigo-800";
      case "Imovel":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return "N/A";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.descricao.toLowerCase().includes(searchLower) ||
      log.usuario.name.toLowerCase().includes(searchLower) ||
      log.usuario.email.toLowerCase().includes(searchLower) ||
      log.entidade.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize todas as ações realizadas no sistema
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por descrição, usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="entidade">Entidade</Label>
              <Select value={entidade} onValueChange={setEntidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as entidades</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="User">Usuário</SelectItem>
                  <SelectItem value="Imovel">Imóvel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="acao">Ação</Label>
              <Select value={acao} onValueChange={setAcao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="startDate">Data inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs ({pagination.total} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getActionBadgeColor(log.acao)}>
                          {log.acao}
                        </Badge>
                        <Badge className={getEntityBadgeColor(log.entidade)}>
                          {log.entidade}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm">{log.descricao}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        <span>Por: {log.usuario.name} ({log.usuario.email})</span>
                        {log.alvoUsuario && (
                          <span> • Alvo: {log.alvoUsuario.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Log</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>ID</Label>
                                <p className="text-sm font-mono">{selectedLog.id}</p>
                              </div>
                              <div>
                                <Label>Data/Hora</Label>
                                <p className="text-sm">
                                  {format(new Date(selectedLog.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                              <div>
                                <Label>Ação</Label>
                                <Badge className={getActionBadgeColor(selectedLog.acao)}>
                                  {selectedLog.acao}
                                </Badge>
                              </div>
                              <div>
                                <Label>Entidade</Label>
                                <Badge className={getEntityBadgeColor(selectedLog.entidade)}>
                                  {selectedLog.entidade}
                                </Badge>
                              </div>
                              <div>
                                <Label>ID da Entidade</Label>
                                <p className="text-sm font-mono">{selectedLog.entidadeId}</p>
                              </div>
                              <div>
                                <Label>Usuário</Label>
                                <p className="text-sm">
                                  {selectedLog.usuario.name} ({selectedLog.usuario.email})
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Descrição</Label>
                              <p className="text-sm">{selectedLog.descricao}</p>
                            </div>
                            
                            {selectedLog.dadosAntigos && (
                              <div>
                                <Label>Dados Anteriores</Label>
                                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                  {formatJsonData(selectedLog.dadosAntigos)}
                                </pre>
                              </div>
                            )}
                            
                            {selectedLog.dadosNovos && (
                              <div>
                                <Label>Dados Novos</Label>
                                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                  {formatJsonData(selectedLog.dadosNovos)}
                                </pre>
                              </div>
                            )}
                            
                            {selectedLog.ipAddress && (
                              <div>
                                <Label>Endereço IP</Label>
                                <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                              </div>
                            )}
                            
                            {selectedLog.userAgent && (
                              <div>
                                <Label>User Agent</Label>
                                <p className="text-xs break-all">{selectedLog.userAgent}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
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
  );
}