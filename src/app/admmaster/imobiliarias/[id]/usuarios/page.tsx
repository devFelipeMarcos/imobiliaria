"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Users, ArrowLeft, Plus, UserPlus, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
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

export default function UsuariosImobiliariaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [imobiliaria, setImobiliaria] = useState<Imobiliaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CORRETOR">("ADMIN");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar dados da imobiliária
      const imobRes = await fetch(`/api/imobiliarias/${id}`);
      if (imobRes.ok) {
        const imobData = await imobRes.json();
        setImobiliaria(imobData);
      }

      // Buscar usuários da imobiliária
      const usersRes = await fetch(`/api/usuarios?imobiliariaId=${id}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsuarios(usersData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !email || !password) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, status, imobiliariaId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao criar usuário");
      
      toast.success("Usuário criado com sucesso!");
      
      // Limpar formulário
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN");
      setStatus("ACTIVE");
      setShowForm(false);
      
      // Recarregar lista de usuários
      fetchData();
    } catch (e: any) {
      setError(e.message ?? "Erro ao criar usuário");
      toast.error(e.message ?? "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: "bg-blue-500",
      CORRETOR: "bg-green-500",
      SUPER_ADMIN: "bg-teal-500",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" ? "bg-green-500" : "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admmaster/imobiliarias">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">
              Usuários - {imobiliaria?.nome || "Imobiliária"}
            </h1>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Adicionar Usuário"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Adicionar Novo Usuário</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do usuário"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Senha</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Função</label>
                <Select value={role} onValueChange={(value: "ADMIN" | "CORRETOR") => setRole(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CORRETOR">Corretor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <Select value={status} onValueChange={(value: "ACTIVE" | "INACTIVE") => setStatus(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowForm(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Usuários Cadastrados ({usuarios.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">Nenhum usuário cadastrado ainda</p>
              <p className="text-white/50 text-sm">Clique em "Adicionar Usuário" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white">Nome</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Função</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="border-white/20">
                      <TableCell className="text-white font-medium">
                        {usuario.name}
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{usuario.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadge(usuario.role)} text-white`}>
                          {usuario.role === "ADMIN" ? "Administrador" : 
                           usuario.role === "CORRETOR" ? "Corretor" : usuario.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(usuario.status)} text-white`}>
                          {usuario.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {formatDate(usuario.createdAt)}
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
  );
}