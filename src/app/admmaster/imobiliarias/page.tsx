"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Imobiliaria {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  descricao?: string;
  website?: string;
  totalUsuarios: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ImobiliariasPage() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchImobiliarias = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admmaster/imobiliarias?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setImobiliarias(data.imobiliarias);
        setPagination(data.pagination);
      } else {
        toast.error("Erro ao carregar imobiliárias");
      }
    } catch (error) {
      console.error("Erro ao buscar imobiliárias:", error);
      toast.error("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImobiliarias();
  }, []);

  const handleSearch = () => {
    fetchImobiliarias(1, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchImobiliarias(1, "");
  };

  const handlePageChange = (newPage: number) => {
    fetchImobiliarias(newPage, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm" className="border-blue-400/30 bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 hover:text-white backdrop-blur-sm">
            <Link href="/admmaster">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 via-teal-300 to-green-300 bg-clip-text text-transparent">
              Imobiliárias
            </h2>
            <p className="text-blue-200/80">
              Gerencie todas as imobiliárias cadastradas no sistema
            </p>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg">
          <Link href="/admmaster/criar-imobiliaria">
            <Plus className="mr-2 h-4 w-4" />
            Nova Imobiliária
          </Link>
        </Button>
      </div>

      <Card className="py-0 border-blue-500/30 shadow-2xl shadow-blue-900/50 bg-slate-800/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="py-3 bg-gradient-to-r from-blue-800 via-teal-700 to-green-700 text-white border-b border-blue-500/30">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Lista de Imobiliárias
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {pagination.total} {pagination.total === 1 ? "imobiliária" : "imobiliárias"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-slate-800/60">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Buscar por nome, email, cidade ou estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" className="border-blue-400/30 bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 hover:text-white backdrop-blur-sm">
              Buscar
            </Button>
            {searchTerm && (
              <Button onClick={clearSearch} variant="ghost" size="sm" className="text-blue-200 hover:bg-blue-800/30">
                Limpar
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : imobiliarias.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma imobiliária encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Tente ajustar os termos de busca." : "Comece criando uma nova imobiliária."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/admmaster/criar-imobiliaria">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Imobiliária
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border border-blue-500/30 bg-slate-800/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Usuários</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imobiliarias.map((imobiliaria) => (
                      <TableRow key={imobiliaria.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{imobiliaria.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              CNPJ: {imobiliaria.cnpj}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {imobiliaria.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="mr-1 h-3 w-3" />
                              {imobiliaria.telefone}
                            </div>
                            {imobiliaria.website && (
                              <div className="flex items-center text-sm">
                                <Globe className="mr-1 h-3 w-3" />
                                <a
                                  href={imobiliaria.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            {imobiliaria.cidade}, {imobiliaria.estado}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CEP: {imobiliaria.cep}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            <Badge variant="outline">
                              {imobiliaria.totalUsuarios}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(imobiliaria.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild variant="outline" size="sm" className="border-blue-400/30 bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 hover:text-white">
                              <Link href={`/admmaster/imobiliarias/${imobiliaria.id}/editar`}>
                                Editar
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="text-teal-200 hover:bg-teal-800/30">
                              <Link href={`/admmaster/imobiliarias/${imobiliaria.id}/usuarios`}>
                                Usuários
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-4 border-t border-blue-100">
                  <div className="flex-1 text-sm text-blue-600/70">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                    {pagination.total} {pagination.total === 1 ? "resultado" : "resultados"}
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-blue-700">Página</p>
                      <p className="text-sm font-medium text-blue-700">
                        {pagination.page} de {pagination.totalPages}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}