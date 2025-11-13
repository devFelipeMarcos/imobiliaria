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
  Download,
  Edit,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
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
    name: string;
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
  descricao?: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [documentacoes, setDocumentacoes] = useState<Documentacao[]>([]);
  const [documentos, setDocumentos] = useState<{[key: string]: File | null}>({});
  const [documentosSalvos, setDocumentosSalvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o diálogo de observação
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newObservacao, setNewObservacao] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Integração com AWS S3 implementada via componente FileUpload

  useEffect(() => {
    if (leadId) {
      fetchLead();
      fetchObservacoes();
      fetchStatus();
      fetchDocumentacoes();
      fetchDocumentosSalvos();
    }
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

  const fetchDocumentosSalvos = async () => {
    if (!leadId) return;
    
    try {
      const response = await fetch(`/api/leads/${leadId}/documentos`);
      if (response.ok) {
        const data = await response.json();
        setDocumentosSalvos(data);
      } else {
        console.error("Erro ao buscar documentos salvos:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar documentos salvos:", error);
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

  // Funções de manipulação de documentos
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, docId: string, docNome: string) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(docId, files[0], docNome);
    }
  };

  const handleFileUpload = async (docId: string, file: File | null, docNome: string) => {
    if (!file || !leadId) return;

    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    // Validar tamanho do arquivo (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentacaoId', docId);

      const response = await fetch(`/api/leads/${leadId}/documentos`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDocumentos(prev => ({
          ...prev,
          [docId]: file
        }));
        // Atualizar a lista de documentos salvos
        await fetchDocumentosSalvos();
        toast.success(`${docNome} enviado e salvo com sucesso!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao enviar arquivo');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo');
    }
  };

  const handleRemoveDocument = async (docId: string, docNome: string) => {
    if (!leadId) return;

    // Verificar se existe um documento salvo para este tipo
    const documentoSalvo = documentosSalvos.find(doc => doc.documentacaoId === docId);
    
    if (documentoSalvo) {
      try {
        const response = await fetch(`/api/leads/${leadId}/documentos/${documentoSalvo.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Atualizar a lista de documentos salvos
          await fetchDocumentosSalvos();
          toast.success(`${docNome} removido com sucesso!`);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Erro ao remover arquivo');
        }
      } catch (error) {
        console.error('Erro ao remover documento:', error);
        toast.error('Erro ao remover arquivo');
      }
    }

    // Remover do estado local também
    setDocumentos(prev => ({
      ...prev,
      [docId]: null
    }));
  };

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
                  <span>Corretor: {lead.user.name}</span>
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
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
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
                        <div className="flex flex-col sm:flex-row gap-4">
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
                
                {/* Contador de Progresso */}
                {documentacoes.length > 0 && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Progresso da Documentação
                      </span>
                      <span className="text-sm text-blue-200">
                        {documentosSalvos.length}/{documentacoes.length} documentos
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(documentosSalvos.length / documentacoes.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-300 mt-1">
                      <span>
                        Obrigatórios: {documentacoes.filter(doc => doc.obrigatoriedade === 'OBRIGATORIO').length}
                      </span>
                      <span>
                        Enviados: {documentosSalvos.filter(doc => 
                          documentacoes.find(d => d.id === doc.documentacaoId)?.obrigatoriedade === 'OBRIGATORIO'
                        ).length}
                      </span>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="space-y-3">
                    {documentacoes.map((doc, index) => {
                      const documentoSalvo = documentosSalvos.find(d => d.documentacaoId === doc.id);
                      const isUploaded = !!documentoSalvo;
                      
                      return (
                        <div 
                          key={doc.id} 
                          className={`p-4 rounded-lg border transition-all duration-300 ${
                            isUploaded 
                              ? 'bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                isUploaded 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                  : 'bg-gradient-to-r from-gray-500 to-gray-600'
                              }`}>
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-medium">{doc.nome}</h3>
                                  {doc.obrigatoriedade === 'OBRIGATORIO' && (
                                    <span className="text-red-400 text-xs font-semibold">OBRIGATÓRIO</span>
                                  )}
                                  {isUploaded && (
                                    <span className="text-emerald-400 text-xs font-semibold">✓ ENVIADO</span>
                                  )}
                                </div>
                                {isUploaded && documentoSalvo && (
                                  <div className="text-sm text-blue-200 mt-1">
                                    <span>{documentoSalvo.nomeArquivo}</span>
                                    <span className="text-xs text-blue-300 ml-2">
                                      {(documentoSalvo.tamanho / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  </div>
                                )}
                                {doc.descricao && (
                                  <p className="text-xs text-blue-300 mt-1">{doc.descricao}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isUploaded ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (documentoSalvo) {
                                        try {
                                          const response = await fetch(`/api/leads/${leadId}/documentos/${documentoSalvo.id}/download`);
                                          if (response.ok) {
                                            const data = await response.json();
                                            window.open(data.downloadUrl, '_blank');
                                          } else {
                                            const error = await response.json();
                                            alert('Erro ao baixar arquivo: ' + error.error);
                                          }
                                        } catch (error) {
                                          console.error('Erro ao baixar arquivo:', error);
                                          alert('Erro ao baixar arquivo');
                                        }
                                      }
                                    }}
                                    className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 hover:border-blue-400/50"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveDocument(doc.id, doc.nome)}
                                    className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 hover:border-red-400/50"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Remover
                                  </Button>
                                </>
                              ) : (
                                <>
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
                                    className="bg-emerald-500/20 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30 hover:border-emerald-400/50"
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    Enviar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
               </CardContent>
             </Card>
           </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
