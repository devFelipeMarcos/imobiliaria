"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      const url = editingStatus ? `/api/status/${editingStatus.id}` : "/api/status";
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
          editingStatus ? "Status atualizado com sucesso!" : "Status criado com sucesso!"
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

  const filteredStatus = statusList.filter((status) =>
    status.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (status.descricao && status.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeStatusCount = statusList.filter(s => s.ativo).length;
  const inactiveStatusCount = statusList.filter(s => !s.ativo).length;
  const totalLeads = statusList.reduce((sum, s) => sum + s._count.leads, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Status</h1>
          <p className="text-muted-foreground">
            Gerencie os status dos seus leads e prospects
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Status
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingStatus ? "Editar Status" : "Criar Novo Status"}
                </DialogTitle>
                <DialogDescription>
                  {editingStatus
                    ? "Edite as informações do status."
                    : "Crie um novo status para organizar seus leads."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Novo Lead, Em Negociação..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Descrição opcional do status..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cor"
                      type="color"
                      value={formData.cor}
                      onChange={(e) =>
                        setFormData({ ...formData, cor: e.target.value })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.cor}
                      onChange={(e) =>
                        setFormData({ ...formData, cor: e.target.value })
                      }
                      placeholder="#3B82F6"
                      className="flex-1"
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
                  />
                  <Label htmlFor="ativo">Status ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingStatus ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Status</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Ativos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStatusCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Inativos</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{inactiveStatusCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Vinculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStatus.map((status) => (
            <Card key={status.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.cor }}
                    />
                    <CardTitle className="text-lg">{status.nome}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(status)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          disabled={deleting === status.id}
                        >
                          {deleting === status.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o status "{status.nome}"?
                            {status._count.leads > 0 && (
                              <span className="block mt-2 text-red-600 font-medium">
                                Atenção: Este status possui {status._count.leads} lead(s) vinculado(s).
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(status.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {status.descricao && (
                  <CardDescription>{status.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant={status.ativo ? "default" : "secondary"}>
                      {status.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{status._count.leads} leads</span>
                    </div>
                  </div>
                </div>
                {status.imobiliaria && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {status.imobiliaria.nome}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredStatus.length === 0 && !loading && (
        <div className="text-center py-8">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum status encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Tente ajustar sua busca ou criar um novo status."
              : "Comece criando seu primeiro status."}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Status
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}