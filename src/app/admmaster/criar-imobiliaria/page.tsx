"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FormData {
  nome: string;
  cnpj?: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  descricao?: string;
  website?: string;
}

export default function CriarImobiliariaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    descricao: "",
    website: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const validateForm = () => {
    const requiredFields = ['nome', 'email', 'telefone'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]?.trim()) {
        toast.error(`O campo ${field} é obrigatório`);
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    // Validar CNPJ apenas se preenchido
    if (formData.cnpj && formData.cnpj.trim()) {
      const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
      if (cnpjNumbers.length !== 14) {
        toast.error("CNPJ deve ter 14 dígitos");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admmaster/imobiliarias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Imobiliária criada com sucesso!");
        router.push("/admmaster/imobiliarias");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar imobiliária");
      }
    } catch (error) {
      console.error("Erro ao criar imobiliária:", error);
      toast.error("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="flex-1 space-y-0 p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 min-h-screen">
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
              Criar Imobiliária
            </h2>
            <p className="text-blue-200/80">
              Cadastre uma nova imobiliária no sistema
            </p>
          </div>
        </div>
      </div>

      <Card className="py-0 border-blue-500/30 shadow-2xl shadow-blue-900/50 bg-slate-800/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="py-3 bg-gradient-to-r from-blue-800 via-teal-700 to-green-700 text-white border-b border-blue-500/30">
          <CardTitle className="flex items-center text-white">
            <Building className="mr-2 h-5 w-5" />
            Dados da Imobiliária
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-slate-800/60 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-blue-200 font-medium">Nome da Imobiliária *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Ex: Imobiliária ABC"
                  required
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200 font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@imobiliaria.com"
                  required
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-blue-200 font-medium">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-teal-200 font-medium">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="bg-slate-700/50 border-teal-500/30 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-teal-200 font-medium">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.imobiliaria.com"
                  className="bg-slate-700/50 border-teal-500/30 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep" className="text-teal-200 font-medium">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="bg-slate-700/50 border-teal-500/30 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-teal-200 font-medium">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Rua, número, bairro"
                className="bg-slate-700/50 border-teal-500/30 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-green-200 font-medium">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="São Paulo"
                  className="bg-slate-700/50 border-green-500/30 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-green-200 font-medium">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-green-500/30 text-white focus:border-green-400 focus:ring-green-400/50 backdrop-blur-sm">
                    <SelectValue placeholder="Selecione o estado" className="text-slate-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-green-500/30">
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado} className="text-white hover:bg-slate-700">
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-green-200 font-medium">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva a imobiliária..."
                rows={4}
                className="bg-slate-700/50 border-green-500/30 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/50 backdrop-blur-sm resize-none"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-blue-100">
              <Button type="button" variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/admmaster">Cancelar</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Imobiliária
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}