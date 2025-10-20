"use client";

import { useState, useEffect } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, Plus, Users, Building2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

interface Corretor {
  id: string;
  name: string;
  email: string;
  status: "ATIVO" | "INATIVO";
  createdAt: string;
  imobiliaria: {
    id: string;
    nome: string;
  };
}

interface Imobiliaria {
  id: string;
  nome: string;
  ativo: boolean;
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    imobiliariaId: "",
    status: "ATIVO" as "ATIVO" | "INATIVO",
  });

  useEffect(() => {
    checkUserPermissions();
    fetchData();
  }, []);

  const checkUserPermissions = async () => {
    try {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        redirect("/authentication");
        return;
      }

      const userRole = ((session.user as unknown) as { role?: string })?.role ?? "";
      if (!["ADMIN", "ADMFULL", "SUPER_ADMIN"].includes(userRole)) {
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
        redirect("/corretor");
        return;
      }

      setCurrentUser(session.user);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      redirect("/authentication");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar corretores
      const corretoresResponse = await fetch("/api/corretores");
      if (corretoresResponse.ok) {
        const corretoresData = await corretoresResponse.json();
        setCorretores(corretoresData);
      }

      // Buscar imobiliárias
      const imobiliariasResponse = await fetch("/api/imobiliarias");
      if (imobiliariasResponse.ok) {
        const imobiliariasData = await imobiliariasResponse.json();
        setImobiliarias(imobiliariasData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.imobiliariaId) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "CORRETOR",
          status: formData.status,
          imobiliariaId: formData.imobiliariaId,
        }),
      });

      if (response.ok) {
        toast.success("Corretor cadastrado com sucesso!");
        setFormData({
          name: "",
          email: "",
          password: "",
          imobiliariaId: "",
          status: "ATIVO",
        });
        fetchData(); // Recarregar lista
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao cadastrar corretor");
      }
    } catch (error) {
      console.error("Erro ao cadastrar corretor:", error);
      toast.error("Erro ao cadastrar corretor");
    } finally {
      setCreating(false);
    }
  };

  const filteredCorretores = corretores.filter(
    (corretor) =>
      corretor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corretor.imobiliaria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Corretores</h1>
          <p className="text-gray-600 mt-1">
            Cadastre e gerencie corretores da sua imobiliária
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          <span>Total: {filteredCorretores.length} corretores</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Corretor
              </CardTitle>
              <CardDescription>
                Cadastre um novo corretor para sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Digite o email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Digite a senha"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="imobiliaria">Imobiliária</Label>
                  <Select
                    value={formData.imobiliariaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, imobiliariaId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a imobiliária" />
                    </SelectTrigger>
                    <SelectContent>
                      {imobiliarias
                        .filter((imob) => imob.ativo)
                        .map((imobiliaria) => (
                          <SelectItem key={imobiliaria.id} value={imobiliaria.id}>
                            {imobiliaria.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "ATIVO" | "INATIVO") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? "Cadastrando..." : "Cadastrar Corretor"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Corretores */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Corretores Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de todos os corretores cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Busca */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, email ou imobiliária..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tabela */}
              {filteredCorretores.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum corretor encontrado
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Tente ajustar os filtros de busca"
                      : "Cadastre o primeiro corretor para começar"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Imobiliária</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastrado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCorretores.map((corretor) => (
                        <TableRow key={corretor.id}>
                          <TableCell className="font-medium">
                            {corretor.name}
                          </TableCell>
                          <TableCell>{corretor.email}</TableCell>
                          <TableCell>{corretor.imobiliaria.nome}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                corretor.status === "ATIVO"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {corretor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(corretor.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
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
  );
}