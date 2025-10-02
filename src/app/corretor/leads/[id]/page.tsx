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
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Edit,
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

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o diálogo de observação
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newObservacao, setNewObservacao] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchLead();
    fetchObservacoes();
    fetchStatus();
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/corretor/leads")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Lead</h1>
        </div>

        {/* Informações do Lead */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-xl">
                  {lead.nome}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {lead.status ? (
                    <Badge
                      style={{ backgroundColor: lead.status.cor }}
                      className="text-white"
                    >
                      {lead.status.nome}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Status não definido</Badge>
                  )}
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Adicionar Observação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Adicionar Observação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-white">
                        Status
                      </Label>
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
                        className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
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
                        onClick={handleAddObservacao}
                        disabled={
                          updating ||
                          (!newObservacao.trim() &&
                            newStatus === lead.status?.id)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>{lead.telefone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>{lead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span>Corretor: {lead.user.nome}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em: {formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>Atualizado em: {formatDate(lead.updatedAt)}</span>
                </div>
                <div className="text-gray-300">
                  <span>Imobiliária: {lead.imobiliaria.nome}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Observações */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Timeline de Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {observacoes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma observação encontrada</p>
                <p className="text-sm">
                  Adicione a primeira observação para este lead
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {observacoes.map((observacao, index) => (
                  <div key={observacao.id} className="relative">
                    {index !== observacoes.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-600"></div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {observacao.usuario?.name ||
                                  "Usuário não identificado"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {getActionText(observacao)}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(observacao.createdAt)}
                            </span>
                          </div>
                          {observacao.observacao && (
                            <p className="text-gray-300 text-sm">
                              {observacao.observacao}
                            </p>
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
      </div>
    </div>
  );
}
