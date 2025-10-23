"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Home, Heart, CheckCircle, User, Phone, MapPin, DollarSign } from "lucide-react";
import { z } from "zod";
import { getImobiliariaInfo, createLeadForImobiliaria } from "@/app/api/public/leads-imobiliaria/actions";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  imobiliariaId: z.string().min(1, "Imobiliária é obrigatória"),
  regiao: z.string().optional(),
  temDependente: z.boolean().optional(),
  valorRenda: z.coerce.number().optional(),
  tipoRenda: z.enum(["formal", "informal"]).optional(),
});

interface ImobiliariaInfo {
  id: string;
  nome: string;
}

export default function PublicLeadImobiliariaPage({ params }: { params: Promise<{ imobiliariaId: string }> }) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    imobiliariaId: "",
    regiao: "",
    temDependente: false,
    valorRenda: "",
    tipoRenda: "" as "" | "formal" | "informal",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imobiliariaInfo, setImobiliariaInfo] = useState<ImobiliariaInfo | null>(null);
  const [isLoadingImobiliaria, setIsLoadingImobiliaria] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const resolvedParams = await params;
        const imobiliariaId = resolvedParams.imobiliariaId;
        setFormData(prev => ({ ...prev, imobiliariaId }));
        const info = await getImobiliariaInfo(imobiliariaId);
        setImobiliariaInfo(info);
      } catch (error) {
        console.error("Erro ao buscar informações da imobiliária:", error);
      } finally {
        setIsLoadingImobiliaria(false);
      }
    };

    fetchInfo();
  }, [params]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.history.back();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSuccess]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "telefone") {
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
      const dataToSubmit = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, ''),
        valorRenda: formData.valorRenda ? Number(formData.valorRenda) : undefined,
        tipoRenda: formData.tipoRenda || undefined,
      };
      const validated = leadSchema.parse(dataToSubmit);
      await createLeadForImobiliaria(validated);
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

  if (isLoadingImobiliaria) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!imobiliariaInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Imobiliária não encontrada ou inativa.</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80"></div>
        <Card className="relative z-10 w-full max-w-lg text-center bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">🎉 Lead Cadastrado com Sucesso!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium mb-2">
                Obrigado pelo seu interesse, {formData.nome}!
              </p>
              <p className="text-green-700 text-sm">
                A <strong>{imobiliariaInfo?.nome}</strong> entrará em contato em breve através do WhatsApp.
              </p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Aguarde o contato no WhatsApp: {formData.telefone}</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Home className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Imobiliária: {imobiliariaInfo?.nome}</span>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 text-sm font-medium mb-2">Redirecionando automaticamente em:</p>
              <div className="flex items-center justify-center">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {countdown}
                </div>
              </div>
              <p className="text-orange-600 text-xs mt-2">Você pode fechar esta janela a qualquer momento</p>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-20 py-12 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-2 mb-8">
              <Shield className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 text-sm font-medium">Realize seu sonho hoje mesmo</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Conquiste o</span>
              <span className="block bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">seu sonho</span>
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-orange-100 mb-8">Saia do aluguel</h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Transforme o sonho da casa própria em realidade. Nossa equipe especializada está pronta para te ajudar.
            </p>
          </div>
        </div>

        <div id="form-section" className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-20">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Comece agora mesmo!</h3>
                <p className="text-gray-600 mb-4">Preencha seus dados e nossa equipe entrará em contato em até 24 horas</p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800"><strong>Imobiliária:</strong> {imobiliariaInfo.nome}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700 font-medium">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input id="nome" type="text" placeholder="Digite seu nome completo" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} className={`pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800 ${errors.nome ? "border-red-500" : ""}`} />
                  </div>
                  {errors.nome && (<p className="text-sm text-red-600">{errors.nome}</p>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-gray-700 font-medium">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input id="telefone" type="tel" placeholder="(11) 99999-9999" value={formData.telefone} onChange={(e) => handleInputChange("telefone", e.target.value)} className={`pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800 ${errors.telefone ? "border-red-500" : ""}`} />
                  </div>
                  {errors.telefone && (<p className="text-sm text-red-600">{errors.telefone}</p>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regiao" className="text-gray-700 font-medium">Região</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input id="regiao" type="text" placeholder="Ex: Zona Sul" value={formData.regiao} onChange={(e) => handleInputChange("regiao", e.target.value)} className="pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Tem dependente?</Label>
                    <Select value={formData.temDependente ? "true" : "false"} onValueChange={(val) => handleInputChange("temDependente", val === "true") }>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Não</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorRenda" className="text-gray-700 font-medium">Valor da renda</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input id="valorRenda" type="number" step="0.01" placeholder="Ex: 3500.00" value={formData.valorRenda} onChange={(e) => handleInputChange("valorRenda", e.target.value)} className="pl-11 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-gray-800" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Renda</Label>
                  <Select value={formData.tipoRenda || undefined} onValueChange={(val) => handleInputChange("tipoRenda", val as "formal" | "informal") }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de renda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {errors.submit && (<p className="text-sm text-red-600 text-center">{errors.submit}</p>)}

                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
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