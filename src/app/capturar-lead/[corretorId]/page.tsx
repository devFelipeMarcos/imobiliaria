"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  Send,
  CheckCircle,
  Building,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface Corretor {
  id: string;
  nome: string;
  email: string;
}

export default function CapturarLeadPage() {
  const params = useParams();
  const router = useRouter();
  const corretorId = params.corretorId as string;
  
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingCorretor, setIsLoadingCorretor] = useState(true);

  // Buscar dados do corretor
  useEffect(() => {
    const buscarCorretor = async () => {
      try {
        const response = await fetch(`/api/corretores/${corretorId}`);
        if (response.ok) {
          const data = await response.json();
          setCorretor(data);
        } else {
          toast.error("Corretor não encontrado");
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao buscar corretor:", error);
        toast.error("Erro ao carregar informações");
        router.push("/");
      } finally {
        setIsLoadingCorretor(false);
      }
    };

    if (corretorId) {
      buscarCorretor();
    }
  }, [corretorId, router]);

  // Formatar telefone
  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }
    
    return telefone;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (telefone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, insira um telefone válido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.replace(/\D/g, ""),
          corretorId,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Seus dados foram enviados com sucesso!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao enviar dados");
      }
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      toast.error("Erro ao enviar dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCorretor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardContent className="p-6 md:p-8 text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-3 md:mb-4">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Dados Enviados!
              </h2>
              <p className="text-gray-300 text-sm md:text-base">
                Obrigado pelo seu interesse! {corretor?.nome} entrará em contato em breve.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-current" />
              ))}
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Atendimento 5 estrelas garantido
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
            <Building className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Encontre seu Imóvel
            </h1>
            <p className="text-gray-300 text-sm md:text-base px-4">
              Deixe seus dados e {corretor?.nome} entrará em contato
            </p>
          </div>
        </div>

        {/* Informações do Corretor */}
        {corretor && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 md:p-3 rounded-xl">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm md:text-base truncate">{corretor.nome}</p>
                  <p className="text-gray-300 text-xs md:text-sm">Corretor Especialista</p>
                </div>
                <div className="flex-shrink-0">
                  <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-white text-center text-lg md:text-xl">
              Seus Dados de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-300 text-sm md:text-base">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="pl-9 md:pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10 md:h-11 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-300 text-sm md:text-base">
                  Telefone/WhatsApp
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="(11) 99999-9999"
                    className="pl-9 md:pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10 md:h-11 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 md:py-3 text-base md:text-lg h-10 md:h-12"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                    <span className="text-sm md:text-base">Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Enviar Dados</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center px-4">
          <p className="text-gray-400 text-xs md:text-sm">
            Seus dados estão seguros e serão usados apenas para contato
          </p>
        </div>
      </div>
    </div>
  );
}