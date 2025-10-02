"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Home, Heart, CheckCircle, User, Phone, Star, ArrowRight } from "lucide-react";
import { z } from "zod";
import { getCorretorInfo, createLeadForCorretor } from "@/app/api/public/leads/actions";
import { authClient } from "@/lib/auth-client";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "Corretor é obrigatório"),
});

interface CorretorInfo {
  id: string;
  nome: string;
  imobiliaria: {
    id: string;
    nome: string;
  };
}

export default function LeadPublicoPage() {
  const { data: session, isPending } = authClient.useSession();
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    corretorId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [corretorInfo, setCorretorInfo] = useState<CorretorInfo | null>(null);
  const [isLoadingCorretor, setIsLoadingCorretor] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchCorretorInfo = async () => {
      if (!session?.user?.id) return;
      
      try {
        setFormData(prev => ({ ...prev, corretorId: session.user.id }));
        const info = await getCorretorInfo(session.user.id);
        setCorretorInfo(info);
      } catch (error) {
        console.error("Erro ao buscar informações do corretor:", error);
      } finally {
        setIsLoadingCorretor(false);
      }
    };

    if (session?.user?.id) {
      fetchCorretorInfo();
    }
  }, [session, isPending]);

  // Countdown e redirecionamento automático após sucesso
  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Recarrega a página para permitir novo cadastro
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess]);

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "whatsapp") {
      const formattedValue = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Remove a máscara do WhatsApp antes de validar e enviar
      const dataToSubmit = {
        ...formData,
        whatsapp: formData.whatsapp.replace(/\D/g, '') // Remove todos os caracteres não numéricos
      };
      
      const validatedData = leadSchema.parse(dataToSubmit);
      await createLeadForCorretor(validatedData);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: "Erro ao cadastrar lead. Tente novamente." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoadingCorretor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !corretorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Corretor não encontrado ou inativo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
        style={{
          backgroundImage: "url('/imagem.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"></div>
        
        <Card className="relative z-10 w-full max-w-lg text-center bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            {/* Ícone animado */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto animate-bounce" />
            </div>
            
            {/* Título principal */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🎉 Lead Cadastrado com Sucesso!
            </h2>
            
            {/* Mensagem personalizada */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium mb-2">
                Obrigado pelo seu interesse, {formData.nome}!
              </p>
              <p className="text-green-700 text-sm">
                <strong>{corretorInfo?.nome}</strong> da <strong>{corretorInfo?.imobiliaria.nome}</strong> entrará em contato em breve através do WhatsApp.
              </p>
            </div>
            
            {/* Informações adicionais */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Aguarde o contato no WhatsApp: {formData.whatsapp}</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <User className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm">Corretor: {corretorInfo?.nome}</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Home className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Imobiliária: {corretorInfo?.imobiliaria.nome}</span>
              </div>
            </div>
            
            {/* Countdown */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 text-sm font-medium mb-2">
                Recarregando página em:
              </p>
              <div className="flex items-center justify-center">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {countdown}
                </div>
              </div>
              <p className="text-orange-600 text-xs mt-2">
                A página será recarregada para permitir novo cadastro
              </p>
            </div>
          </CardContent>
        </Card>
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-2 mb-8">
              <Shield className="h-4 w-4 text-yellow-400" />
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
                <p className="text-gray-600 mb-4">
                  Preencha seus dados e nossa equipe entrará em contato em até
                  24 horas
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Corretor:</strong> {corretorInfo.nome}
                  </p>
                  <p className="text-sm text-blue-600">
                    {corretorInfo.imobiliaria.nome}
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700 font-medium">
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      className={`pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800 ${
                        errors.nome ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-gray-700 font-medium">
                    WhatsApp
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      className={`pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800 ${
                        errors.whatsapp ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="text-sm text-red-600">{errors.whatsapp}</p>
                  )}
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-600 text-center">{errors.submit}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
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