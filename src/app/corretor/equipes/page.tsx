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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Users, Edit, UserX, UserCheck } from "lucide-react";
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
  imobiliaria: Imobiliaria;
  corretores: Array<{
    id: string;
    name: string;
  }>;
  ativo: boolean;
  createdAt: string;
  totalUsuarios: number;
}

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    ativo: true,
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
    loadEquipes();
  }, []);

  const loadEquipes = async () => {
    try {
      const response = await fetch("/api/equipes");
      if (response.ok) {
        const data = await response.json();
        setEquipes(Array.isArray(data) ? data : (data.equipes || []));
      }
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
      toast.error("Erro ao carregar equipes");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/equipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar equipe");
      }

      toast.success("Equipe criada com sucesso!");
      setFormData({
        nome: "",
        ativo: true,
      });
      loadEquipes();
    } catch (error: any) {
      console.error("Erro ao criar equipe:", error);
      toast.error(error.message || "Erro ao criar equipe");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (equipeId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(`/api/equipes/${equipeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar status da equipe");
      }

      toast.success(`Equipe ${newStatus ? "ativada" : "inativada"} com sucesso!`);
      loadEquipes();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da equipe");
    }
  };

  const handleEditEquipe = (equipeId: string) => {
    toast.info("Funcionalidade de edição será implementada em breve");
  };

  const filteredEquipes = equipes.filter(
    (equipe) =>
      equipe.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-2xl font-bold">Gerenciar Equipes</h1>
              <p className="text-blue-100 mt-1">
                Crie e gerencie equipes de corretores
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Cadastro */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="h-5 w-5" />
                  Criar Equipe
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Preencha os dados para criar uma nova equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-white">Nome da Equipe</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Nome da equipe"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                    disabled={creating}
                  >
                    {creating ? "Criando..." : "Criar Equipe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Equipes */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Equipes Cadastradas
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Lista de todas as equipes cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Busca */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome da equipe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Tabela */}
                {filteredEquipes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Nenhuma equipe encontrada
                    </h3>
                    <p className="text-gray-300">
                      {searchTerm
                        ? "Tente ajustar os filtros de busca"
                        : "Crie a primeira equipe para começar"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-blue-100">Nome</TableHead>
                          <TableHead className="text-blue-100">Corretores</TableHead>
                          <TableHead className="text-blue-100">Status</TableHead>
                          <TableHead className="text-blue-100">Criada em</TableHead>
                          <TableHead className="text-right text-blue-100">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEquipes.map((equipe) => (
                          <TableRow key={equipe.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">
                              {equipe.nome}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-blue-400 text-blue-300">
                                  {equipe.totalUsuarios} corretor{equipe.totalUsuarios !== 1 ? 'es' : ''}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={equipe.ativo ? "default" : "secondary"}
                                className={
                                  equipe.ativo
                                    ? "bg-green-500/20 text-green-300 border-green-400"
                                    : "bg-gray-500/20 text-gray-300 border-gray-400"
                                }
                              >
                                {equipe.ativo ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(equipe.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEquipe(equipe.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-500/20 text-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(equipe.id, equipe.ativo)}
                                  className={`h-8 w-8 p-0 ${
                                    equipe.ativo
                                      ? "hover:bg-red-500/20 text-red-300"
                                      : "hover:bg-green-500/20 text-green-300"
                                  }`}
                                >
                                  {equipe.ativo ? (
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