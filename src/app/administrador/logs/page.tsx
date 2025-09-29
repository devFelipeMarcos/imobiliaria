'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Calendar, User, Activity, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '@/app/audit/actions';

interface AuditLog {
  id: string;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  descricao: string;
  dadosAntigos: any;
  dadosNovos: any;
  ipAddress: string | null;
  userAgent: string | null;
  usuarioId: string | null;
  alvoUsuarioId: string | null;
  createdAt: Date;
  usuario: {
    id: string;
    name: string;
    email: string;
  } | null;
  alvoUsuario: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedAction, selectedEntity]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedAction && selectedAction !== 'all') filters.acao = selectedAction;
      if (selectedEntity && selectedEntity !== 'all') filters.entidade = selectedEntity;

      const result = await getAuditLogs(currentPage, 20, filters);
      
      if (result.success && result.data) {
        setLogs(result.data.logs);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        toast.error(result.error || 'Erro ao carregar logs');
      }
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'update':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'delete':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'login':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'logout':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'view':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'export':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'view':
        return '👁️';
      case 'export':
        return '📤';
      default:
        return '📋';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log =>
    log.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.usuario?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 md:mb-3">
            Logs de Auditoria
          </h1>
          <p className="text-slate-300 text-sm md:text-base lg:text-lg">Histórico de ações realizadas no sistema</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6 md:mb-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="VIEW">Visualizar</SelectItem>
                  <SelectItem value="EXPORT">Exportar</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="User">Usuário</SelectItem>
                  <SelectItem value="Corretor">Corretor</SelectItem>
                  <SelectItem value="Page">Página</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => {
                  setSelectedAction('');
                  setSelectedEntity('');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <div className="space-y-3 md:space-y-4">
          {filteredLogs.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 md:p-8 text-center">
                <Activity className="h-8 w-8 md:h-12 md:w-12 text-slate-400 mx-auto mb-3 md:mb-4" />
                <p className="text-slate-300 text-base md:text-lg">Nenhum log encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className="text-lg md:text-2xl flex-shrink-0">{getActionIcon(log.acao)}</span>
                        <Badge className={`${getActionColor(log.acao)} text-xs md:text-sm`}>
                          {log.acao}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-slate-300 text-xs md:text-sm">
                          {log.entidade}
                        </Badge>
                        <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">{formatDate(log.createdAt)}</span>
                          <span className="sm:hidden">{new Date(log.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <p className="text-white text-sm md:text-base lg:text-lg mb-3 break-words">{log.descricao}</p>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                        {log.usuario && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-3 w-3 md:h-4 md:w-4 text-purple-400 flex-shrink-0" />
                            <span className="truncate">Usuário: {log.usuario.name}</span>
                          </div>
                        )}
                        
                        {log.ipAddress && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="flex-shrink-0">🌐</span>
                            <span className="truncate">IP: {log.ipAddress}</span>
                          </div>
                        )}
                      </div>

                      {expandedLog === log.id && (
                        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-black/20 rounded-lg">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                            {log.dadosAntigos && (
                              <div>
                                <h4 className="text-red-300 font-semibold mb-2 text-sm md:text-base">Dados Anteriores:</h4>
                                <pre className="text-xs text-slate-300 bg-black/30 p-2 rounded overflow-auto max-h-32 md:max-h-48">
                                  {JSON.stringify(log.dadosAntigos, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.dadosNovos && (
                              <div>
                                <h4 className="text-green-300 font-semibold mb-2 text-sm md:text-base">Dados Novos:</h4>
                                <pre className="text-xs text-slate-300 bg-black/30 p-2 rounded overflow-auto max-h-32 md:max-h-48">
                                  {JSON.stringify(log.dadosNovos, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          
                          {log.userAgent && (
                            <div className="mt-3">
                              <h4 className="text-slate-300 font-semibold mb-1 text-sm md:text-base">User Agent:</h4>
                              <p className="text-xs text-slate-400 break-all">{log.userAgent}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 flex-shrink-0"
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 md:gap-3 mt-6 md:mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto text-xs md:text-sm"
            >
              Anterior
            </Button>
            
            <span className="flex items-center px-3 md:px-4 text-white text-xs md:text-sm order-first sm:order-none">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto text-xs md:text-sm"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}