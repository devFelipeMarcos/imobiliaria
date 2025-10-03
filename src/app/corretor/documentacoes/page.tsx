"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const documentacaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  obrigatoriedade: z.enum(["OBRIGATORIO", "OPCIONAL", "NAO_APLICAVEL"], {
    errorMap: () => ({ message: "Selecione uma opção válida" }),
  }),
});

type DocumentacaoFormData = z.infer<typeof documentacaoSchema>;

interface Documentacao {
  id: string;
  nome: string;
  obrigatoriedade: "OBRIGATORIO" | "OPCIONAL" | "NAO_APLICAVEL";
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const obrigatoriedadeLabels = {
  OBRIGATORIO: "Obrigatório",
  OPCIONAL: "Opcional",
  NAO_APLICAVEL: "N/A",
};

const obrigatoriedadeColors = {
  OBRIGATORIO: "destructive",
  OPCIONAL: "default",
  NAO_APLICAVEL: "secondary",
} as const;

export default function DocumentacoesPage() {
  const [documentacoes, setDocumentacoes] = useState<Documentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentacao | null>(null);

  const form = useForm<DocumentacaoFormData>({
    resolver: zodResolver(documentacaoSchema),
    defaultValues: {
      nome: "",
      obrigatoriedade: "OPCIONAL",
    },
  });

  const fetchDocumentacoes = async () => {
    try {
      const response = await fetch("/api/documentacoes");
      if (response.ok) {
        const data = await response.json();
        setDocumentacoes(data);
      } else {
        toast.error("Erro ao carregar documentações");
      }
    } catch (error) {
      toast.error("Erro ao carregar documentações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentacoes();
  }, []);

  const onSubmit = async (data: DocumentacaoFormData) => {
    try {
      const url = editingDoc ? `/api/documentacoes/${editingDoc.id}` : "/api/documentacoes";
      const method = editingDoc ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          editingDoc ? "Documentação atualizada com sucesso!" : "Documentação criada com sucesso!"
        );
        setIsDialogOpen(false);
        setEditingDoc(null);
        form.reset();
        fetchDocumentacoes();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar documentação");
      }
    } catch (error) {
      toast.error("Erro ao salvar documentação");
    }
  };

  const handleEdit = (doc: Documentacao) => {
    setEditingDoc(doc);
    form.setValue("nome", doc.nome);
    form.setValue("obrigatoriedade", doc.obrigatoriedade);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta documentação?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documentacoes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Documentação deletada com sucesso!");
        fetchDocumentacoes();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar documentação");
      }
    } catch (error) {
      toast.error("Erro ao deletar documentação");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDoc(null);
    form.reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

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
              📄 Documentações
            </h1>
            <p className="text-slate-600 text-lg">
              Gerencie as documentações e seus níveis de obrigatoriedade
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingDoc(null)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Documentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {editingDoc ? "✏️ Editar Documentação" : "➕ Nova Documentação"}
                </DialogTitle>
              </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Documentação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: RG, CPF, Comprovante de Renda..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="obrigatoriedade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Obrigatoriedade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OBRIGATORIO">Obrigatório</SelectItem>
                          <SelectItem value="OPCIONAL">Opcional</SelectItem>
                          <SelectItem value="NAO_APLICAVEL">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDialogClose}
                    className="border-slate-200 text-gray-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {editingDoc ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              📋 Lista de Documentações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {documentacoes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Nenhuma documentação cadastrada
                </h3>
                <p className="text-slate-600 mb-4">
                  Comece criando uma nova documentação para organizar seus documentos.
                </p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100">
                      <TableHead className="font-semibold text-slate-700">Nome</TableHead>
                      <TableHead className="font-semibold text-slate-700">Obrigatoriedade</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Data de Criação</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                     {documentacoes.map((doc) => (
                       <TableRow key={doc.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                         <TableCell className="font-medium text-slate-800">{doc.nome}</TableCell>
                         <TableCell>
                           <Badge
                             className={
                               doc.obrigatoriedade === "OBRIGATORIO"
                                 ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm"
                                 : doc.obrigatoriedade === "OPCIONAL"
                                 ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                                 : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm"
                             }
                           >
                             {doc.obrigatoriedade === "OBRIGATORIO"
                               ? "🔴 Obrigatório"
                               : doc.obrigatoriedade === "OPCIONAL"
                               ? "🔵 Opcional"
                               : "⚪ Não Aplicável"}
                           </Badge>
                         </TableCell>
                         <TableCell>
                           <Badge 
                             className={
                               doc.ativo 
                                 ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm" 
                                 : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm"
                             }
                           >
                             {doc.ativo ? "✅ Ativo" : "❌ Inativo"}
                           </Badge>
                         </TableCell>
                    <TableCell>
                      {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                         <TableCell className="text-right">
                           <div className="flex justify-end space-x-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEdit(doc)}
                               className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle className="text-xl font-semibold text-slate-800">
                                     🗑️ Confirmar exclusão
                                   </AlertDialogTitle>
                                   <AlertDialogDescription className="text-slate-600">
                                     Tem certeza que deseja excluir a documentação "<span className="font-medium text-slate-800">{doc.nome}</span>"?
                                     Esta ação não pode ser desfeita.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="border-slate-200 text-gray-700 hover:bg-slate-50">
                                     Cancelar
                                   </AlertDialogCancel>
                                   <AlertDialogAction 
                                     onClick={() => handleDelete(doc.id)}
                                     className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                   >
                                     Excluir
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
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
     );
   }