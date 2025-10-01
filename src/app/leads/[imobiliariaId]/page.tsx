"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useParams } from "next/navigation";
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
import { getCorretoresByImobiliaria, createLeadForImobiliaria } from "./actions";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "Selecione um corretor"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface Corretor {
  id: string;
  name: string;
}

export default function LeadsImobiliariaPage() {
  const params = useParams();
  const imobiliariaId = params.imobiliariaId as string;
  
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCorretores, setIsLoadingCorretores] = useState(true);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      corretorId: "",
    },
  });

  // Buscar corretores da imobiliária específica
  const fetchCorretores = async () => {
    if (!imobiliariaId) return;
    
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
    fetchCorretores();
  }, [imobiliariaId]);

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      const result = await createLeadForImobiliaria({
        ...data,
        imobiliariaId,
      });

      if (result.success) {
        toast.success(
          "Parabéns! Em breve entraremos em contato para realizar o seu sonho!"
        );
        form.reset();
      } else {
        toast.error(result.error || "Erro ao enviar informações");
      }
    } catch (error) {
      console.error("Erro ao cadastrar lead:", error);
      toast.error("Erro ao enviar informações");
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-2 mb-8">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 text-sm font-medium">
                Realize seu sonho hoje mesmo
              </span>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Conquiste o</span>
              <span className="block bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                seu sonho
              </span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-orange-100 mb-8">
              Saia do aluguel
            </h2>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Transforme o sonho da casa própria em realidade. Nossa equipe
              especializada está pronta para te ajudar a encontrar o imóvel
              perfeito e as melhores condições de financiamento.
            </p>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              {[
                "Atendimento personalizado e especializado",
                "Melhores opções de financiamento do mercado",
                "Acompanhamento completo do processo",
                "Suporte jurídico e documentação",
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
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                <Heart className="mr-2 h-5 w-5" />
                Quero minha casa própria
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Comece agora mesmo!
                </h3>
                <p className="text-gray-600">
                  Preencha seus dados e nossa equipe entrará em contato em até
                  24 horas
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
                              placeholder="Digite seu nome completo"
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
                          Qual corretor te atendeu?
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
                                  {corretor.name}
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
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Quero realizar meu sonho!
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Garantia/Segurança */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Seus dados estão seguros conosco</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}