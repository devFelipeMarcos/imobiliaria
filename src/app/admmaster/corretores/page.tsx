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
import { Plus, Search, Edit, Trash2, Building } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Corretor {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  imobiliaria?: {
    id: string;
    nome: string;
  };
}

interface Imobiliaria {
  id: string;
  nome: string;
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imobiliariaId, setImobiliariaId] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar corretores
      const corretoresRes = await fetch("/api/corretores");
      if (!corretoresRes.ok) throw new Error("Erro ao buscar corretores");
      const corretoresData = await corretoresRes.json();
      setCorretores(corretoresData);

      // Buscar imobiliárias
      const imobiliariasRes = await fetch("/api/imobiliarias");
      if (!imobiliariasRes.ok) throw new Error("Erro ao buscar imobiliárias");
      const imobiliariasData = await imobiliariasRes.json();
      setImobiliarias(imobiliariasData);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !email || !password || !imobiliariaId) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: "CORRETOR", 
          status, 
          imobiliariaId 
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao criar corretor");
      
      toast.success("Corretor criado com sucesso!");
      
      // Limpar formulário
      setName("");
      setEmail("");
      setPassword("");
      setImobiliariaId("");
      setStatus("ACTIVE");
      setShowForm(false);
      
      // Recarregar lista de corretores
      fetchData();
    } catch (e: any) {
      setError(e.message ?? "Erro ao criar corretor");
      toast.error(e.message ?? "Erro ao criar corretor");
    } finally {
      setSaving(false);
    }
  };

  const filteredCorretores = corretores.filter(corretor =>
    corretor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    corretor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    corretor.imobiliaria?.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando corretores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Corretores</h1>
          <p className="text-gray-600 mt-2">
            Cadastre e gerencie corretores vinculados às imobiliárias
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Corretor
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Corretor</CardTitle>
            <CardDescription>
              Preencha os dados para cadastrar um novo corretor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imobiliaria">Imobiliária</Label>
                <Select value={imobiliariaId} onValueChange={setImobiliariaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a imobiliária" />
                  </SelectTrigger>
                  <SelectContent>
                    {imobiliarias.map((imobiliaria) => (
                      <SelectItem key={imobiliaria.id} value={imobiliaria.id}>
                        {imobiliaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? "Salvando..." : "Salvar Corretor"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setName("");
                  setEmail("");
                  setPassword("");
                  setImobiliariaId("");
                  setStatus("ACTIVE");
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou imobiliária..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Corretores */}
      <Card>
        <CardHeader>
          <CardTitle>Corretores Cadastrados</CardTitle>
          <CardDescription>
            {filteredCorretores.length} corretor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Imobiliária</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCorretores.map((corretor) => (
                <TableRow key={corretor.id}>
                  <TableCell className="font-medium">{corretor.name}</TableCell>
                  <TableCell>{corretor.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      {corretor.imobiliaria?.nome || "Não vinculado"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={corretor.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {corretor.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(corretor.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCorretores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum corretor encontrado</p>
                      <p className="text-sm">
                        {searchQuery
                          ? "Tente ajustar os filtros de busca"
                          : "Cadastre o primeiro corretor clicando em 'Novo Corretor'"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}