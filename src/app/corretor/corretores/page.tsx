"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Users, Building2, Edit, UserX, UserCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/loading-state";
import { redirect } from "next/navigation";

interface Imobiliaria {
  id: string;
  nome: string;
  ativo: boolean;
}

interface Equipe {
  id: string;
  nome: string;
  imobiliariaId: string;
}

interface Corretor {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  imobiliaria: Imobiliaria;
  equipe?: Equipe;
  createdAt: string;
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  // Removido estado de imobiliárias
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    equipeId: "",
    status: undefined as "ACTIVE" | "INACTIVE" | undefined,
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        redirect("/authentication");
      }
      setCurrentUser(session.user);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    loadCorretores();
    loadEquipes();
  }, []);

  const loadCorretores = async () => {
    try {
      const response = await fetch("/api/usuarios?role=CORRETOR");
      if (response.ok) {
        const data = await response.json();
        setCorretores(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar corretores:", error);
      toast.error("Erro ao carregar corretores");
    } finally {
      setLoading(false);
    }
  };

  const loadEquipes = async () => {
    try {
      const response = await fetch(`/api/equipes`);
      if (response.ok) {
        const data = await response.json();
        setEquipes(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (isEditing && editingId) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
        };
        if (formData.status) payload.status = formData.status;
        payload.equipeId = formData.equipeId ? formData.equipeId : null;

        const response = await fetch(`/api/usuarios/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao atualizar corretor");
        }

        toast.success("Corretor atualizado com sucesso!");
        setIsEditing(false);
        setEditingId(null);
      } else {
        if (!formData.status) {
          toast.error("Selecione o status do corretor");
          setCreating(false);
          return;
        }

        const createPayload: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "CORRETOR",
          status: formData.status,
        };
        if (formData.equipeId) createPayload.equipeId = formData.equipeId;

        const response = await fetch("/api/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao cadastrar corretor");
        }

        toast.success("Corretor cadastrado com sucesso!");
        setShowForm(false);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        equipeId: "",
        status: undefined,
      });
      loadCorretores();
    } catch (error: any) {
      console.error("Erro ao salvar corretor:", error);
      toast.error(error.message || "Erro ao salvar corretor");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (corretorId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await fetch(`/api/usuarios/${corretorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar status do corretor");
      }

      toast.success(`Corretor ${newStatus === "ACTIVE" ? "ativado" : "inativado"} com sucesso!`);
      loadCorretores();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do corretor");
    }
  };

  const handleEditCorretor = (corretorId: string) => {
    const c = corretores.find((x) => x.id === corretorId);
    if (!c) return;
    setIsEditing(true);
    setEditingId(corretorId);
    setShowForm(true);
    setFormData({
      name: c.name || "",
      email: c.email || "",
      password: "",
      equipeId: c.equipe?.id || "",
      status: c.status,
    });
  };

  const filteredCorretores = corretores.filter(
    (corretor) =>
      corretor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corretor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="space-y-6 p-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Corretores</h1>
              <p className="text-blue-100 mt-1">
                Cadastre e gerencie os corretores da sua imobiliária
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de ação / formulário condicional */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="h-5 w-5" />
                  {isEditing ? "Editar Corretor" : "Cadastrar Corretor"}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {showForm
                    ? isEditing
                      ? "Atualize os dados do corretor selecionado"
                      : "Preencha os dados para cadastrar um novo corretor"
                    : "Clique abaixo para iniciar o cadastro"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button
                    onClick={() => {
                      setShowForm(true);
                      setIsEditing(false);
                      setEditingId(null);
                      setFormData({
                        name: "",
                        email: "",
                        password: "",
                        equipeId: "",
                        status: undefined,
                      });
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                  >
                    Cadastrar novo corretor
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nome completo"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-white">Senha</Label>
                      {!isEditing ? (
                        <Input
                          id="password"
                          type="password"
                          placeholder="Senha do corretor"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          required={!isEditing}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                        />
                      ) : (
                        <p className="text-sm text-blue-100">A senha não pode ser alterada por aqui.</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="equipe" className="text-white">Equipe (opcional)</Label>
                      <Select
                        value={formData.equipeId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, equipeId: value })
                        }
                       >
                         <SelectTrigger className="bg-white/10 border-white/20 text-white">
                           <SelectValue placeholder={
                             equipes.length === 0
                               ? "Nenhuma equipe disponível"
                               : "Selecione a equipe"
                           } />
                         </SelectTrigger>
                         <SelectContent>
                           {equipes.map((equipe) => (
                             <SelectItem key={equipe.id} value={equipe.id}>
                               {equipe.nome}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-white">Status</Label>
                      <Select
                        value={formData.status ?? ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as "ACTIVE" | "INACTIVE" })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                        disabled={creating}
                      >
                        {creating ? (isEditing ? "Salvando..." : "Cadastrando...") : (isEditing ? "Salvar Alterações" : "Cadastrar Corretor")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-white/30 text-white"
                        onClick={() => {
                          setShowForm(false);
                          setIsEditing(false);
                          setEditingId(null);
                          setFormData({
                            name: "",
                            email: "",
                            password: "",
                            equipeId: "",
                            status: undefined,
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Corretores */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Corretores Cadastrados
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Lista de todos os corretores cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Busca */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Tabela */}
                {filteredCorretores.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Nenhum corretor encontrado
                    </h3>
                    <p className="text-gray-300">
                      {searchTerm
                        ? "Tente ajustar os filtros de busca"
                        : "Cadastre o primeiro corretor para começar"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-blue-100">Nome</TableHead>
                          <TableHead className="text-blue-100">Email</TableHead>
                          <TableHead className="text-blue-100">Imobiliária</TableHead>
                          <TableHead className="text-blue-100">Equipe</TableHead>
                          <TableHead className="text-blue-100">Status</TableHead>
                          <TableHead className="text-blue-100">Cadastrado em</TableHead>
                          <TableHead className="text-right text-blue-100">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCorretores.map((corretor) => (
                          <TableRow key={corretor.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">
                              {corretor.name}
                            </TableCell>
                            <TableCell className="text-gray-300">{corretor.email}</TableCell>
                            <TableCell className="text-gray-300">{corretor.imobiliaria.nome}</TableCell>
                            <TableCell>
                              {corretor.equipe ? (
                                <Badge variant="outline" className="border-blue-400 text-blue-300">
                                  {corretor.equipe.nome}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">Sem equipe</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={corretor.status === "ACTIVE" ? "default" : "secondary"}
                                className={
                                  corretor.status === "ACTIVE"
                                    ? "bg-green-500/20 text-green-300 border-green-400"
                                    : "bg-gray-500/20 text-gray-300 border-gray-400"
                                }
                              >
                                {corretor.status === "ACTIVE" ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(corretor.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCorretor(corretor.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-500/20 text-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(corretor.id, corretor.status)}
                                  className={`h-8 w-8 p-0 ${
                                    corretor.status === "ACTIVE"
                                      ? "hover:bg-red-500/20 text-red-300"
                                      : "hover:bg-green-500/20 text-green-300"
                                  }`}
                                >
                                  {corretor.status === "ACTIVE" ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}