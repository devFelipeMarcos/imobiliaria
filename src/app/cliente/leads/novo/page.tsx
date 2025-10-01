"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Phone,
  Home,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "Selecione um corretor"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface Corretor {
  id: string;
  nome: string;
}

interface ImobiliariaInfo {
  id: string;
  nome: string;
}

// Server Actions
async function getCorretoresByImobiliaria(imobiliariaId: string) {
  try {
    const response = await fetch(`/api/imobiliarias/${imobiliariaId}/corretores`);
    if (!response.ok) {
      throw new Error("Erro ao buscar corretores");
    }
    const data = await response.json();
    return { success: true, data: data.corretores };
  } catch (error) {
    console.error("Erro ao buscar corretores:", error);
    return { success: false, error: "Erro ao buscar corretores" };
  }
}

async function createLeadForImobiliaria(data: {
  nome: string;
  telefone: string;
  corretorId: string;
  imobiliariaId: string;
}) {
  try {
    const response = await fetch("/api/cliente/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao criar lead");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao criar lead" 
    };
  }
}

export default function NovoLeadPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [imobiliariaInfo, setImobiliariaInfo] = useState<ImobiliariaInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCorretores, setIsLoadingCorretores] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      corretorId: "",
    },
  });

  // Buscar usuário atual e informações da imobiliária
  const fetchUserAndImobiliaria = async () => {
    try {
      setIsLoadingUser(true);
      const { data: session } = await authClient.getSession();
      
      if (!session?.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      setCurrentUser(session.user);

      // Buscar informações da imobiliária do corretor atual
      const response = await fetch(`/api/corretor/${session.user.id}/imobiliaria`);
      if (!response.ok) {
        throw new Error("Erro ao buscar informações da imobiliária");
      }

      const data = await response.json();
      setImobiliariaInfo(data);
      
      // Após obter a imobiliária, buscar os corretores
      if (data?.id) {
        await fetchCorretores(data.id);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      toast.error("Erro ao carregar informações da imobiliária");
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Buscar corretores da imobiliária específica
  const fetchCorretores = async (imobiliariaId: string) => {
    try {
      setIsLoadingCorretores(true);
      const result = await getCorretoresByImobiliaria(imobiliariaId);
      if (result.success && result.data) {
        setCorretores(result.data);
      } else {
        console.error("Erro ao buscar corretores:", result.error);
        setCorretores([]);
        toast.error("Erro ao carregar corretores desta imobiliária");
      }
    } catch (error) {
      console.error("Erro ao buscar corretores:", error);
      setCorretores([]);
      toast.error("Erro ao carregar corretores");
    } finally {
      setIsLoadingCorretores(false);
    }
  };

  useEffect(() => {
    fetchUserAndImobiliaria();
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    if (!imobiliariaInfo?.id) {
      toast.error("Informações da imobiliária não encontradas");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createLeadForImobiliaria({
        ...data,
        imobiliariaId: imobiliariaInfo.id,
      });

      if (result.success) {
        toast.success(
          "Lead cadastrado com sucesso! Em breve entraremos em contato."
        );
        form.reset();
      } else {
        toast.error(result.error || "Erro ao cadastrar lead");
      }
    } catch (error) {
      console.error("Erro ao cadastrar lead:", error);
      toast.error("Erro ao cadastrar lead");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/imagem.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Seção esquerda - Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-20 py-12 lg:py-20">
          <div className="max-w-2xl">
            {/* Badge de destaque */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-8">
              <Star className="h-4 w-4 text-blue-400" />
              <span className="text-blue-100 text-sm font-medium">
                Cadastre um novo lead
              </span>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Novo</span>
              <span className="block bg-gradient-to-r from-blue-400 via-teal-400 to-green-500 bg-clip-text text-transparent">
                Lead
              </span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-100 mb-8">
              {imobiliariaInfo?.nome || "Sua Imobiliária"}
            </h2>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Cadastre um novo lead em nossa plataforma. Nossa equipe
              especializada está pronta para ajudar a transformar esse
              contato em uma oportunidade de negócio.
            </p>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              {[
                "Atendimento personalizado e especializado",
                "Acompanhamento completo do processo",
                "Equipe qualificada e experiente",
                "Suporte completo até o fechamento",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA secundário para mobile */}
            <div className="lg:hidden">
              <Button
                onClick={() =>
                  document
                    .getElementById("form-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Heart className="mr-2 h-5 w-5" />
                Cadastrar novo lead
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Seção direita - Formulário */}
        <div
          id="form-section"
          className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-20"
        >
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              {/* Header do formulário */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800 border border-slate-600 text-gray-300 text-sm font-medium mb-4">
                  <Home className="w-4 h-4 mr-2 text-blue-400" />
                  Novo Lead
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-4">
                  Cadastrar Novo Lead
                </h1>
                <p className="text-gray-600">
                  Preencha os dados do cliente para cadastrar um novo lead
                </p>
              </div>

              {/* Formulário */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Digite o nome completo"
                              className="pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          WhatsApp
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="(11) 99999-9999"
                              className="pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corretorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Qual corretor irá atender?
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingCorretores}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800">
                              <SelectValue 
                                placeholder={
                                  isLoadingCorretores 
                                    ? "Carregando corretores..." 
                                    : "Selecione o corretor"
                                } 
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(corretores) &&
                              corretores.map((corretor) => (
                                <SelectItem
                                  key={corretor.id}
                                  value={corretor.id}
                                >
                                  {corretor.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || isLoadingCorretores || corretores.length === 0}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Cadastrar Lead
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Garantia/Segurança */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Dados seguros e protegidos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}