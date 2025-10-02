"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  Edit,
  Trash2,
  Users,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BroadcastListForm } from "@/components/broadcast-list-form";

interface Contact {
  nome: string;
  telefone: string;
}

interface WhatsAppInstance {
  id: string;
  instanceName: string;
  connected: boolean;
}

interface BroadcastList {
  id: string;
  nome: string;
  mensagem: string;
  contatos: Contact[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  whatsappInstance?: WhatsAppInstance;
}

export default function ListaTransmissaoPage() {
  const [broadcastLists, setBroadcastLists] = useState<BroadcastList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedList, setSelectedList] = useState<BroadcastList | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sendingList, setSendingList] = useState<string | null>(null);

  // Carregar listas de transmissão
  const loadBroadcastLists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/broadcast-lists");

      if (!response.ok) {
        throw new Error("Erro ao carregar listas");
      }

      const data = await response.json();
      setBroadcastLists(data);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
      toast.error("Erro ao carregar listas de transmissão");
    } finally {
      setLoading(false);
    }
  };

  // Deletar lista
  const handleDeleteList = async (listId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) return;

    try {
      const response = await fetch(`/api/broadcast-lists/${listId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir lista");
      }

      toast.success("Lista excluída com sucesso!");
      loadBroadcastLists();
    } catch (error) {
      console.error("Erro ao excluir lista:", error);
      toast.error("Erro ao excluir lista");
    }
  };

  // Enviar mensagens
  const handleSendMessages = async (listId: string) => {
    try {
      setSendingList(listId);
      const response = await fetch(`/api/broadcast-lists/${listId}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagens");
      }

      toast.success("Mensagens enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar mensagens:", error);
      toast.error("Erro ao enviar mensagens");
    } finally {
      setSendingList(null);
    }
  };

  // Editar lista
  const handleEditList = (list: BroadcastList) => {
    setSelectedList(list);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Nova lista
  const handleNewList = () => {
    setSelectedList(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Callback quando lista é salva
  const handleListSaved = () => {
    setIsFormOpen(false);
    setSelectedList(null);
    setIsEditMode(false);
    loadBroadcastLists();
  };

  // Filtrar listas
  const filteredLists = broadcastLists.filter(
    (list) =>
      list.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadBroadcastLists();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              📢 Listas de Transmissão
            </h1>
            <p className="text-blue-100 mt-1">
              Gerencie suas listas de transmissão do WhatsApp
            </p>
          </div>
          <Button
            onClick={handleNewList}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            📝 Nova Lista
          </Button>
        </div>

        {/* Barra de pesquisa */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
            <Input
              placeholder="🔍 Pesquisar listas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">
                    📢 Total de Listas
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {broadcastLists.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">
                    👥 Total de Contatos
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {broadcastLists.reduce(
                      (total, list) => total + list.contatos.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">
                    ✅ Listas Ativas
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {broadcastLists.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de transmissão */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/10 border-white/20 animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-1/2 bg-white/15" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4 bg-white/20" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20 bg-white/15" />
                    <Skeleton className="h-8 w-20 bg-white/15" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLists.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm ? "Nenhuma lista encontrada" : "Nenhuma lista criada"}
              </h3>
              <p className="text-blue-100 mb-6">
                {searchTerm
                  ? "Tente ajustar os termos de pesquisa"
                  : "Crie sua primeira lista de transmissão para começar a enviar mensagens em massa"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleNewList}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Lista
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <Card
                key={list.id}
                className="bg-white/10 border-white/20 hover:bg-white/15 transition-all shadow-lg"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg font-semibold">
                        📢 {list.nome}
                      </CardTitle>
                      <CardDescription className="text-blue-200 mt-1">
                        {list.contatos.length} contatos
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Mensagem */}
                  <div>
                    <p className="text-sm font-medium text-white mb-2">
                      💬 Mensagem:
                    </p>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                      <p className="text-blue-100 text-sm line-clamp-3">
                        {list.mensagem}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditList(list)}
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteList(list.id)}
                      className="flex-1 bg-white/10 border-white/20 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleSendMessages(list.id)}
                    disabled={sendingList === list.id}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingList === list.id ? "Enviando..." : "🚀 Enviar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog do formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              {isEditMode
                ? "✏️ Editar Lista de Transmissão"
                : "📢 Nova Lista de Transmissão"}
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {isEditMode
                ? "Edite os dados da sua lista de transmissão"
                : "Crie uma nova lista para enviar mensagens em massa via WhatsApp"}
            </DialogDescription>
          </DialogHeader>

          <BroadcastListForm
            list={selectedList}
            onSave={handleListSaved}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
