"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Settings,
  Palette,
  Type,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const statusSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  descricao: z.string().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, { message: "Cor deve estar no formato #RRGGBB" }),
  ativo: z.boolean(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface StatusCustom {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  ativo: boolean;
  createdAt: string;
}

const predefinedColors = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

export default function CadastrarStatusPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusList, setStatusList] = useState<StatusCustom[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const router = useRouter();

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      cor: "#6B7280",
      ativo: true,
    },
  });

  useEffect(() => {
    fetchStatusList();
  }, []);

  const fetchStatusList = async () => {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        setStatusList(data.statusList || []);
      }
    } catch (error) {
      console.error("Erro ao carregar status:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const onSubmit = async (values: StatusFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao cadastrar status");
      }

      toast.success("Status cadastrado com sucesso!", {
        description: "O status foi adicionado ao sistema.",
        icon: <CheckCircle className="h-4 w-4" />,
      });

      form.reset();
      fetchStatusList(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao cadastrar status:", error);
      toast.error("Erro ao cadastrar status", {
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/status/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar status");
      }

      toast.success("Status deletado com sucesso!");
      fetchStatusList();
    } catch (error) {
      toast.error("Erro ao deletar status");
    }
  };

  const toggleStatus = async (id: string, ativo: boolean) => {
    try {
      const response = await fetch(`/api/status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      toast.success("Status atualizado com sucesso!");
      fetchStatusList();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <Settings className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Gerenciar Status
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto px-4 md:px-0">
            Configure os status personalizados para o pipeline de vendas
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-purple-800/50 text-white border-white/20 text-sm md:text-base"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Form Card */}
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="space-y-1 text-center p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl lg:text-2xl flex items-center justify-center gap-2 text-white">
                <Plus className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                Novo Status
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm md:text-base">
                Crie um novo status personalizado para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Type className="h-3 w-3 md:h-4 md:w-4" />
                          Nome do Status *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Interessado"
                            {...field}
                            className="h-10 md:h-11 text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Descrição */}
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrição opcional do status"
                            {...field}
                            className="min-h-[60px] md:min-h-[80px] text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cor */}
                  <FormField
                    control={form.control}
                    name="cor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Palette className="h-3 w-3 md:h-4 md:w-4" />
                          Cor
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2 md:space-y-3">
                            <Input
                              type="color"
                              {...field}
                              className="h-10 md:h-11 w-16 md:w-20"
                            />
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {predefinedColors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => field.onChange(color)}
                                />
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  {/* Ativo */}
                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Status Ativo
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Determina se o status estará disponível para uso
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Cadastrar Status
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Status List */}
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <Settings className="h-6 w-6 text-blue-400" />
                Status Cadastrados
              </CardTitle>
              <CardDescription className="text-gray-300">
                Lista de todos os status do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingList ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : statusList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nenhum status cadastrado
                </div>
              ) : (
                <div className="space-y-3">
                  {statusList
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((status) => (
                      <div
                        key={status.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: status.cor }}
                          />
                          <div>
                            <div className="font-medium">{status.nome}</div>
                            {status.descricao && (
                              <div className="text-sm text-slate-500">
                                {status.descricao}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={status.ativo}
                            onCheckedChange={(checked) =>
                              toggleStatus(status.id, checked)
                            }
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStatus(status.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}