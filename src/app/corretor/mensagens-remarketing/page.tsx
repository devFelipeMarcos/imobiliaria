"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import {
  MessageCircle,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface MensagemRemarketing {
  id: string;
  mensagem: string;
  idcorretor: string;
  datacriada: string;
  dias_disparo: number;
  status: boolean;
  ultima_atualizacao: string;
}

const DIAS_OPCOES = [
  { value: 1, label: "1 dia" },
  { value: 2, label: "2 dias" },
  { value: 7, label: "7 dias" },
  { value: 14, label: "14 dias" },
  { value: 30, label: "30 dias" },
];

export default function MensagensRemarketingPage() {
  const [mensagens, setMensagens] = useState<MensagemRemarketing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [filtroDias, setFiltroDias] = useState<string>("all");

  // Estados para o formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMensagem, setEditingMensagem] = useState<MensagemRemarketing | null>(null);
  const [formData, setFormData] = useState({
    mensagem: "",
    dias_disparo: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMensagens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filtroStatus !== "all") {
        params.append("status", filtroStatus);
      }
      
      if (filtroDias !== "all") {
        params.append("diasDisparo", filtroDias);
      }

      const response = await fetch(`/api/corretor/mensagens-remarketing?${params}`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar mensagens");
      }

      const data = await response.json();
      setMensagens(data.mensagens);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      setError("Erro ao carregar mensagens de remarketing");
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensagens();
  }, [filtroStatus, filtroDias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingMensagem 
        ? "/api/corretor/mensagens-remarketing"
        : "/api/corretor/mensagens-remarketing";
      
      const method = editingMensagem ? "PUT" : "POST";
      const body = editingMensagem 
        ? { ...formData, id: editingMensagem.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar mensagem");
      }

      toast.success(editingMensagem ? "Mensagem atualizada!" : "Mensagem criada!");
      setIsDialogOpen(false);
      setEditingMensagem(null);
      setFormData({ mensagem: "", dias_disparo: 1 });
      fetchMensagens();
    } catch (error: any) {
      console.error("Erro ao salvar mensagem:", error);
      toast.error(error.message || "Erro ao salvar mensagem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (mensagem: MensagemRemarketing) => {
    setEditingMensagem(mensagem);
    setFormData({
      mensagem: mensagem.mensagem,
      dias_disparo: mensagem.dias_disparo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) {
      return;
    }

    try {
      const response = await fetch(`/api/corretor/mensagens-remarketing?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir mensagem");
      }

      toast.success("Mensagem excluída!");
      fetchMensagens();
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Erro ao excluir mensagem");
    }
  };

  const handleToggleStatus = async (mensagem: MensagemRemarketing) => {
    try {
      const response = await fetch("/api/corretor/mensagens-remarketing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: mensagem.id,
          mensagem: mensagem.mensagem,
          status: !mensagem.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar status");
      }

      toast.success(`Mensagem ${!mensagem.status ? "ativada" : "desativada"}!`);
      fetchMensagens();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da mensagem");
    }
  };

  const openNewDialog = () => {
    setEditingMensagem(null);
    setFormData({ mensagem: "", dias_disparo: 1 });
    setIsDialogOpen(true);
  };

  const getDiasLabel = (dias: number) => {
    const opcao = DIAS_OPCOES.find(op => op.value === dias);
    return opcao ? opcao.label : `${dias} dias`;
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="space-y-6 p-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-white shadow-xl">
          <PageHeader
            title="💬 Mensagens de Remarketing"
            description="Gerencie suas mensagens automáticas para remarketing de leads"
          />
        </div>

        {/* Filtros e Ações com estilo azul-verde */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
                <Filter className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="true">Ativas</SelectItem>
                <SelectItem value="false">Inativas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroDias} onValueChange={setFiltroDias}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filtrar por dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os dias</SelectItem>
                {DIAS_OPCOES.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value.toString()}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openNewDialog}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingMensagem ? "Editar Mensagem" : "Nova Mensagem de Remarketing"}
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  {editingMensagem 
                    ? "Atualize o conteúdo da sua mensagem de remarketing"
                    : "Crie uma nova mensagem automática para remarketing de leads"
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="dias_disparo" className="text-white">Dias para Disparo</Label>
                  <Select
                    value={formData.dias_disparo.toString()}
                    onValueChange={(value) => setFormData({ ...formData, dias_disparo: parseInt(value) })}
                    disabled={!!editingMensagem}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_OPCOES.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value.toString()}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingMensagem && (
                    <p className="text-xs text-slate-400 mt-1">
                      Não é possível alterar os dias de disparo ao editar
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mensagem" className="text-white">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Digite a mensagem de remarketing..."
                    rows={6}
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                  >
                    {submitting ? "Salvando..." : editingMensagem ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Mensagens */}
        <div className="grid gap-4">
          {mensagens.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 mb-4">
                  <MessageCircle className="h-12 w-12 text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Nenhuma mensagem encontrada</h3>
                <p className="text-slate-300 text-center mb-4 max-w-md">
                  Comece criando sua primeira mensagem de remarketing para automatizar o contato com seus leads
                </p>
                <Button 
                  onClick={openNewDialog}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Mensagem
                </Button>
              </CardContent>
            </Card>
          ) : (
            mensagens.map((mensagem) => (
              <Card key={mensagem.id} className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1 border-blue-400/50 text-blue-300 bg-blue-500/20"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {getDiasLabel(mensagem.dias_disparo)}
                      </Badge>
                      <Badge 
                        variant={mensagem.status ? "default" : "secondary"}
                        className={mensagem.status 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                          : "bg-slate-600 text-slate-300"
                        }
                      >
                        {mensagem.status ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => handleEdit(mensagem)} className="text-white hover:bg-slate-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(mensagem)} className="text-white hover:bg-slate-700">
                          {mensagem.status ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(mensagem.id)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2 text-white">Mensagem:</h4>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {mensagem.mensagem}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700">
                      <span className="flex items-center gap-1">
                        📅 Criada: {new Date(mensagem.datacriada).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 Atualizada: {new Date(mensagem.ultima_atualizacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}