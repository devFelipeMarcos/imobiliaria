"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Tag,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

interface Status {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  imobiliaria?: {
    id: string;
    nome: string;
  };
  _count: {
    leads: number;
  };
}

interface StatusFormData {
  nome: string;
  descricao: string;
  cor: string;
  ativo: boolean;
}

export default function StatusPage() {
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<StatusFormData>({
    nome: "",
    descricao: "",
    cor: "#3B82F6",
    ativo: true,
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatusList(data.statusList || []);
      } else {
        toast.error("Erro ao carregar status");
      }
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      toast.error("Erro ao carregar status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingStatus
        ? `/api/status/${editingStatus.id}`
        : "/api/status";
      const method = editingStatus ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingStatus
            ? "Status atualizado com sucesso!"
            : "Status criado com sucesso!"
        );
        setShowForm(false);
        setEditingStatus(null);
        resetForm();
        loadStatus();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao salvar status");
      }
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      toast.error("Erro ao salvar status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (status: Status) => {
    setEditingStatus(status);
    setFormData({
      nome: status.nome,
      descricao: status.descricao || "",
      cor: status.cor,
      ativo: status.ativo,
    });
    setShowForm(true);
  };

  const handleDelete = async (statusId: string) => {
    setDeleting(statusId);
    try {
      const response = await fetch(`/api/status/${statusId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Status excluído com sucesso!");
        loadStatus();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao excluir status");
      }
    } catch (error) {
      console.error("Erro ao excluir status:", error);
      toast.error("Erro ao excluir status");
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      cor: "#3B82F6",
      ativo: true,
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStatus(null);
    resetForm();
  };

  const filteredStatus = statusList.filter(
    (status) =>
      status.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (status.descricao &&
        status.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeStatusCount = statusList.filter((s) => s.ativo).length;
  const inactiveStatusCount = statusList.filter((s) => !s.ativo).length;
  const totalLeads = statusList.reduce((sum, s) => sum + s._count.leads, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-300/10 to-teal-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              🏷️ Gerenciar Status
            </h1>
            <p className="text-slate-600 text-lg">
              Gerencie os status dos seus leads e prospects
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {editingStatus
                      ? "✏️ Editar Status"
                      : "➕ Criar Novo Status"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {editingStatus
                      ? "Edite as informações do status."
                      : "Crie um novo status para organizar seus leads."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="nome"
                      className="text-slate-700 font-medium"
                    >
                      Nome *
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Ex: Novo Lead, Em Negociação..."
                      required
                      className="border-slate-200 text-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="descricao"
                      className="text-slate-700 font-medium"
                    >
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      placeholder="Descrição opcional do status..."
                      rows={3}
                      className="border-slate-200 text-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cor" className="text-slate-700 font-medium">
                      Cor
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="cor"
                        type="color"
                        value={formData.cor}
                        onChange={(e) =>
                          setFormData({ ...formData, cor: e.target.value })
                        }
                        className="w-16 h-10 p-1 border rounded border-slate-200"
                      />
                      <Input
                        value={formData.cor}
                        onChange={(e) =>
                          setFormData({ ...formData, cor: e.target.value })
                        }
                        placeholder="#3B82F6"
                        className="flex-1 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, ativo: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                    />
                    <Label
                      htmlFor="ativo"
                      className="text-slate-700 font-medium"
                    >
                      Status ativo
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    disabled={submitting}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingStatus ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                📊 Total de Status
              </CardTitle>
              <Tag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {statusList.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                ✅ Status Ativos
              </CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeStatusCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                ❌ Status Inativos
              </CardTitle>
              <EyeOff className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {inactiveStatusCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                👥 Leads Vinculados
              </CardTitle>
              <Users className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {totalLeads}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="🔍 Buscar status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-md focus:shadow-lg transition-all duration-300 focus:bg-white/90 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Status List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <p className="text-slate-600 text-lg">Carregando status...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStatus.map((status) => (
              <Card
                key={status.id}
                className="relative bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 hover:scale-105"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-5 h-5 rounded-full shadow-md"
                        style={{ backgroundColor: status.cor }}
                      />
                      <CardTitle className="text-lg text-slate-800">
                        {status.nome}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(status)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleting === status.id}
                          >
                            {deleting === status.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-semibold text-slate-800">
                              🗑️ Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600">
                              Tem certeza que deseja excluir o status "
                              {status.nome}"?
                              {status._count.leads > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                  ⚠️ Atenção: Este status possui{" "}
                                  {status._count.leads} lead(s) vinculado(s).
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(status.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {status.descricao && (
                    <CardDescription className="text-slate-600">
                      {status.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={status.ativo ? "default" : "secondary"}
                        className={
                          status.ativo
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {status.ativo ? "✅ Ativo" : "❌ Inativo"}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{status._count.leads} leads</span>
                      </div>
                    </div>
                  </div>
                  {status.imobiliaria && (
                    <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-md px-2 py-1">
                      🏢 {status.imobiliaria.nome}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredStatus.length === 0 && !loading && (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <Tag className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {searchQuery
                    ? "🔍 Nenhum status encontrado"
                    : "📝 Nenhum status criado"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery
                    ? "Tente ajustar sua busca ou criar um novo status."
                    : "Comece criando seu primeiro status para organizar seus leads."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Status
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
