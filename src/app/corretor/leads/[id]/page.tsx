"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  status: {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
  };
  user: {
    id: string;
    nome: string;
  };
  imobiliaria: {
    id: string;
    nome: string;
  };
}

interface Observacao {
  id: string;
  observacao: string;
  statusAnterior?: string;
  statusNovo?: string;
  tipoAcao: string;
  createdAt: string;
  usuario: {
    id: string;
    name: string;
  };
}

interface Status {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
}

interface Documentacao {
  id: string;
  nome: string;
  obrigatoriedade: "OBRIGATORIO" | "OPCIONAL" | "NAO_APLICAVEL";
  ativo: boolean;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [documentacoes, setDocumentacoes] = useState<Documentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o diálogo de observação
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newObservacao, setNewObservacao] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [documentos, setDocumentos] = useState<{[key: string]: File | null}>({});

  // TODO: Preparar para integração com AWS S3
  // const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  // const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchObservacoes();
    fetchStatus();
    fetchDocumentacoes();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/leads/${leadId}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setNewStatus(data.status?.id || "");
      } else if (response.status === 404) {
        setError("Lead não encontrado");
      } else {
        setError("Erro ao carregar lead");
        toast.error("Erro ao carregar lead");
      }
    } catch (error) {
      console.error("Erro ao buscar lead:", error);
      setError("Erro de conexão");
      toast.error("Erro ao carregar lead");
    } finally {
      setLoading(false);
    }
  };

  const fetchObservacoes = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}/observacoes`);
      if (response.ok) {
        const data = await response.json();
        setObservacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar observações:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        // A API retorna um objeto com statusList, não um array direto
        const statusArray = data.statusList || [];
        setStatusList(statusArray.filter((status: Status) => status.id));
      } else {
        console.error("Erro ao buscar status:", response.status);
        toast.error("Erro ao carregar lista de status");
      }
    } catch (error) {
      console.error("Erro ao buscar status:", error);
      toast.error("Erro ao carregar lista de status");
    }
  };

  const fetchDocumentacoes = async () => {
    try {
      const response = await fetch("/api/documentacoes");
      if (response.ok) {
        const data = await response.json();
        const documentacoesAtivas = data.filter((doc: Documentacao) => doc.ativo);
        setDocumentacoes(documentacoesAtivas);
        
        // Inicializar o estado de documentos com base nas documentações ativas
        const initialDocumentos: {[key: string]: File | null} = {};
        documentacoesAtivas.forEach((doc: Documentacao) => {
          initialDocumentos[doc.id] = null;
        });
        setDocumentos(initialDocumentos);
      } else {
        console.error("Erro ao buscar documentações:", response.status);
        toast.error("Erro ao carregar documentações");
      }
    } catch (error) {
      console.error("Erro ao buscar documentações:", error);
      toast.error("Erro ao carregar documentações");
    }
  };

  const handleAddObservacao = async () => {
    if (!newObservacao.trim() && newStatus === lead?.status?.id) {
      toast.error("Adicione uma observação ou altere o status");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/observacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observacao: newObservacao.trim(),
          statusId: newStatus !== lead?.status?.id ? newStatus : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Observação adicionada com sucesso!");
        setNewObservacao("");
        setIsDialogOpen(false);
        fetchLead();
        fetchObservacoes();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao adicionar observação");
      }
    } catch (error) {
      console.error("Erro ao adicionar observação:", error);
      toast.error("Erro ao adicionar observação");
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = (documentoId: string, file: File | null, nomeDocumento: string) => {
    if (!file) return
    
    // Validar tipo de arquivo
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione apenas arquivos PDF.')
      return
    }
    
    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB em bytes
    if (file.size > maxSize) {
      toast.error('O arquivo deve ter no máximo 10MB.')
      return
    }
    
    setDocumentos(prev => ({
      ...prev,
      [documentoId]: file
    }))
    
    toast.success(`${nomeDocumento} carregado com sucesso!`)
  }

  const handleRemoveDocument = (documentoId: string, nomeDocumento: string) => {
    setDocumentos(prev => ({
      ...prev,
      [documentoId]: null
    }))
    toast.success(`${nomeDocumento} removido com sucesso!`)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, documentoId: string, nomeDocumento: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(documentoId, files[0], nomeDocumento)
    }
  }

  // TODO: Implementar upload para AWS S3
  const handleSaveDocuments = async () => {
    try {
      // Placeholder para futura implementação com AWS S3
      // const formData = new FormData()
      // if (documentos.rg) formData.append('rg', documentos.rg)
      // if (documentos.comprovanteResidencia) formData.append('comprovanteResidencia', documentos.comprovanteResidencia)
      
      // const response = await fetch(`/api/corretor/leads/${id}/documentos`, {
      //   method: 'POST',
      //   body: formData
      // })
      
      // Por enquanto, apenas simular o salvamento
      toast.success('Documentos salvos localmente! (Integração com AWS S3 será implementada futuramente)')
      
    } catch (error) {
      console.error('Erro ao salvar documentos:', error)
      toast.error('Erro ao salvar documentos')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getActionText = (observacao: Observacao) => {
    if (observacao.tipoAcao === "STATUS_CHANGE") {
      return `Status alterado de "${observacao.statusAnterior}" para "${observacao.statusNovo}"`;
    }
    return "Observação adicionada";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-700 rounded mb-6"></div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <div className="space-x-4">
            <Button onClick={() => router.push("/corretor/leads")}>
              Voltar para lista de leads
            </Button>
            {error !== "Lead não encontrado" && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Lead não encontrado</h1>
          <Button onClick={() => router.push("/corretor/leads")}>
            Voltar para lista de leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/corretor/leads")}
              className="text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Detalhes do Lead</h1>
              <p className="text-blue-200 text-sm">Gerencie informações e documentos</p>
            </div>
          </div>
        </div>

        {/* Informações do Lead com gradiente */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {lead.nome}
                </CardTitle>
                <div className="flex items-center gap-2 mt-3">
                  {lead.status ? (
                    <Badge
                      style={{ 
                        backgroundColor: lead.status.cor,
                        boxShadow: `0 0 20px ${lead.status.cor}40`
                      }}
                      className="text-white border-0 shadow-lg"
                    >
                      {lead.status.nome}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-600 text-white">Status não definido</Badge>
                  )}
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 shadow-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Adicionar Observação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-blue-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Observação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-white">
                        Status
                      </Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-sm border-blue-500/30">
                          {statusList.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full shadow-lg"
                                  style={{ 
                                    backgroundColor: status.cor,
                                    boxShadow: `0 0 10px ${status.cor}60`
                                  }}
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
                        Observação{" "}
                        {newStatus !== lead.status?.id
                          ? "(opcional)"
                          : "(obrigatória)"}
                      </Label>
                      <Textarea
                        id="observacao"
                        placeholder="Adicione uma observação sobre este lead..."
                        value={newObservacao}
                        onChange={(e) => setNewObservacao(e.target.value)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddObservacao}
                        disabled={
                          updating ||
                          (!newObservacao.trim() &&
                            newStatus === lead.status?.id)
                        }
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 shadow-lg"
                      >
                        {updating ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span>{lead.telefone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3 text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <span>{lead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>Corretor: {lead.user.nome}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <span>Criado em: {formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span>Atualizado em: {formatDate(lead.updatedAt)}</span>
                </div>
                <div className="text-blue-100 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span>Imobiliária: {lead.imobiliaria.nome}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para organizar conteúdo */}
        <Tabs defaultValue="observacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger 
              value="observacoes" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Timeline de Observações
            </TabsTrigger>
            <TabsTrigger 
              value="documentacao" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documentação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="observacoes">
            {/* Timeline de Observações */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Timeline de Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {observacoes.length === 0 ? (
                  <div className="text-center py-12 text-blue-200">
                    <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-blue-300" />
                    </div>
                    <p className="text-lg font-medium mb-2">Nenhuma observação encontrada</p>
                    <p className="text-sm text-blue-300">
                      Adicione a primeira observação para este lead
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {observacoes.map((observacao, index) => (
                      <div key={observacao.id} className="relative">
                        {index !== observacoes.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-blue-500 to-teal-500"></div>
                        )}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                              <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                   <div className="text-sm font-semibold text-white flex items-center gap-2">
                                     <div className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                                       <User className="h-3 w-3 text-white" />
                                     </div>
                                     {observacao.usuario?.name || "Usuário não identificado"}
                                   </div>
                                   <div className="text-xs text-blue-200 mt-1 font-medium">
                                     {getActionText(observacao)}
                                   </div>
                                 </div>
                                <div className="flex items-center gap-2 text-xs text-blue-300 bg-white/10 px-3 py-1 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(observacao.createdAt)}
                                </div>
                              </div>
                              {observacao.observacao && (
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                  <p className="text-blue-100 text-sm leading-relaxed">
                                    {observacao.observacao}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentacao">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Documentação do Lead
                </CardTitle>
                <p className="text-sm text-blue-200 mt-2">
                  Faça upload dos documentos necessários (apenas arquivos PDF)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {documentacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Nenhuma documentação cadastrada para esta imobiliária
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Layout em grid para documentos dinâmicos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {documentacoes.map((doc, index) => {
                        const colors = [
                          { from: 'blue-500', to: 'cyan-500', border: 'blue-400' },
                          { from: 'purple-500', to: 'pink-500', border: 'purple-400' },
                          { from: 'emerald-500', to: 'teal-500', border: 'emerald-400' },
                          { from: 'orange-500', to: 'red-500', border: 'orange-400' },
                          { from: 'indigo-500', to: 'purple-500', border: 'indigo-400' },
                          { from: 'green-500', to: 'emerald-500', border: 'green-400' }
                        ];
                        const colorScheme = colors[index % colors.length];
                        
                        return (
                          <div key={doc.id} className="space-y-2">
                            <label className="text-sm font-semibold text-white flex items-center gap-2">
                              <div className={`p-1 rounded-full bg-gradient-to-r from-${colorScheme.from} to-${colorScheme.to}`}>
                                <FileText className="h-3 w-3 text-white" />
                              </div>
                              {doc.nome}
                              {doc.obrigatoriedade === 'OBRIGATORIO' && (
                                <span className="text-red-400 text-xs">*</span>
                              )}
                            </label>
                            <div 
                              className={`border-2 border-dashed border-${colorScheme.border}/30 rounded-lg p-4 text-center bg-gradient-to-br from-${colorScheme.from}/10 to-${colorScheme.to}/10 hover:border-${colorScheme.border}/50 hover:from-${colorScheme.from}/20 hover:to-${colorScheme.to}/20 transition-all duration-300 backdrop-blur-sm`}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, doc.id, doc.nome)}
                            >
                              {documentos[doc.id] ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                                      <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                      <span className="text-sm font-semibold text-white block truncate max-w-[150px]">
                                        {documentos[doc.id]?.name}
                                      </span>
                                      <span className="text-xs text-blue-200">
                                        {documentos[doc.id] ? (documentos[doc.id]!.size / 1024 / 1024).toFixed(2) : '0'} MB
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveDocument(doc.id, doc.nome)}
                                    className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Remover
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className={`p-3 rounded-full bg-gradient-to-r from-${colorScheme.from}/20 to-${colorScheme.to}/20 w-12 h-12 mx-auto flex items-center justify-center`}>
                                    <Upload className={`h-5 w-5 text-${colorScheme.from.split('-')[0]}-300`} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-100 font-medium mb-1">
                                      Arraste ou clique para enviar
                                    </p>
                                    <p className="text-xs text-blue-300">
                                      PDF (máx. 10MB)
                                    </p>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0] || null, doc.nome)}
                                    className="hidden"
                                    id={`${doc.id}-upload`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById(`${doc.id}-upload`)?.click()}
                                    className={`bg-gradient-to-r from-${colorScheme.from}/20 to-${colorScheme.to}/20 border-${colorScheme.border}/30 text-${colorScheme.from.split('-')[0]}-200 hover:from-${colorScheme.from}/30 hover:to-${colorScheme.to}/30 hover:border-${colorScheme.border}/50 transition-all duration-300`}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Selecionar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botão para salvar documentos */}
                    <div className="flex justify-end pt-3 border-t border-white/10">
                      <Button 
                        disabled={Object.values(documentos).every(doc => doc === null)}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 transition-all duration-300"
                        onClick={handleSaveDocuments}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Documentos
                      </Button>
                    </div>
                  </>
                )}
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
