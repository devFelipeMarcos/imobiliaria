"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Power,
  PowerOff,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  EditClientModal,
  type UserWithDetails,
} from "./_components/edit-client-modal";
import { getUsersWithDetails } from "./_actions/getUsers";
import { updateUserStatus } from "./_actions/updateUser";

export default function EditarClientesPage() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Função para determinar o status do usuário
  const getUserStatus = (user: any): "ACTIVE" | "INACTIVE" => {
    // Opção 1: Se você tem um campo 'status' na tabela User
    if (user.status) {
      return user.status === "ACTIVE" || user.status === true
        ? "ACTIVE"
        : "INACTIVE";
    }

    // Opção 2: Se você usa emailVerified para determinar se está ativo
    if (user.emailVerified !== undefined) {
      return user.emailVerified ? "ACTIVE" : "INACTIVE";
    }

    // Opção 3: Se você tem um campo deletedAt (soft delete)
    if (user.deletedAt !== undefined) {
      return user.deletedAt === null ? "ACTIVE" : "INACTIVE";
    }

    // Opção 4: Baseado na data de criação (usuários recentes são ativos)
    if (user.createdAt) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.createdAt) > thirtyDaysAgo ? "ACTIVE" : "INACTIVE";
    }

    // Fallback: assumir ativo por padrão
    return "ACTIVE";
  };

  // Carregar dados do banco
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingData(true);

        // Usar a nova função que já traz os dados relacionados
        const usersData = await getUsersWithDetails();

        // Mapear os dados para o formato esperado
        const combinedUsers: UserWithDetails[] = usersData.map((user) => ({
          id: user.id,
          name: user.name || user.email || "Usuário sem nome",
          email: user.email,
          role: (user.role as "USER" | "ADMIN") || "USER",
          status: getUserStatus(user), // Usar função para determinar status real
          createdAt: user.createdAt
            ? new Date(user.createdAt).toISOString().split("T")[0]
            : "",
          userDetails: user.userDetails
            ? {
                id: user.userDetails.id,
                nome: user.userDetails.nome,
                preco: user.userDetails.preco,
                cpfCnpj: user.userDetails.cpfCnpj,
                telefone: user.userDetails.telefone,
              }
            : undefined,
        }));

        setUsers(combinedUsers);
        setFilteredUsers(combinedUsers);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Erro ao carregar dados dos usuários");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUsers();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userDetails?.cpfCnpj?.includes(searchTerm) ||
          user.userDetails?.telefone?.includes(searchTerm) ||
          user.userDetails?.nome
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Filtro por role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Alternar status do usuário
  const toggleUserStatus = async (userId: string) => {
    setIsLoading(true);
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      // Chamar a server action para atualizar no banco
      const result = await updateUserStatus(userId, newStatus);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Atualizar estado local
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );

      const statusText = newStatus === "ACTIVE" ? "ativado" : "desativado";
      toast.success(`Cliente ${statusText} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do cliente");
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal de edição
  const openEditModal = (user: UserWithDetails) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  // Fechar modal de edição
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Callback para quando o modal salvar com sucesso
  const handleSaveSuccess = async () => {
    // Recarregar dados após salvar
    await refreshData();
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
  };

  // Recarregar dados
  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const usersData = await getUsersWithDetails();

      const combinedUsers: UserWithDetails[] = usersData.map((user) => ({
        id: user.id,
        name: user.name || user.email || "Usuário sem nome",
        email: user.email,
        role: (user.role as "USER" | "ADMIN") || "USER",
        status: getUserStatus(user), // Usar status real do banco
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : "",
        userDetails: user.userDetails
          ? {
              id: user.userDetails.id,
              nome: user.userDetails.nome,
              preco: user.userDetails.preco,
              cpfCnpj: user.userDetails.cpfCnpj,
              telefone: user.userDetails.telefone,
            }
          : undefined,
      }));

      setUsers(combinedUsers);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      toast.error("Erro ao recarregar dados");
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-slate-600">Carregando dados dos clientes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Editar Clientes
            </h1>
            <p className="text-slate-600">
              Gerencie e edite informações dos clientes cadastrados na
              plataforma.
            </p>
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            disabled={isLoadingData}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoadingData ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {users.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.status === "ACTIVE").length}
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Power className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Clientes Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter((u) => u.status === "INACTIVE").length}
                  </p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <PowerOff className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email, CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro Status */}
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Status</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro Role */}
              <Select
                value={roleFilter}
                onValueChange={(value: any) => setRoleFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as Funções</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>

              {/* Botão Limpar */}
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Clique nas ações para editar ou alterar status dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">
                  Nenhum cliente encontrado com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-800">
                                {user.userDetails?.nome || user.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {user.userDetails?.cpfCnpj ||
                                  "CPF não informado"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role === "ADMIN"
                              ? "Administrador"
                              : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "ACTIVE"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.userDetails?.telefone || "Não informado"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.userDetails?.preco
                            ? `R$ ${user.userDetails.preco.toFixed(2)}`
                            : "Não definido"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditModal(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Cliente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleUserStatus(user.id)}
                                disabled={isLoading}
                              >
                                {user.status === "ACTIVE" ? (
                                  <>
                                    <PowerOff className="mr-2 h-4 w-4 text-red-600" />
                                    <span className="text-red-600">
                                      Desativar
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Power className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">
                                      Ativar
                                    </span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          user={editingUser}
          onSave={handleSaveSuccess}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
