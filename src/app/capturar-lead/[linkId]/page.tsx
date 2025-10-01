"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { CheckCircle, Phone, Mail, User } from "lucide-react";

interface CorretorInfo {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  creci?: string;
  imobiliarias: {
    imobiliaria: {
      id: string;
      nome: string;
    };
  }[];
}

export default function CapturarLeadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [corretorInfo, setCorretorInfo] = useState<CorretorInfo | null>(null);
  
  // Dados do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  
  // Configurações da página
  const titulo = searchParams.get("titulo") || "Entre em contato";
  const descricao = searchParams.get("descricao") || "";
  const mensagemPersonalizada = searchParams.get("mensagem") || "";
  const corretorId = searchParams.get("corretor");

  useEffect(() => {
    async function loadCorretorInfo() {
      if (!corretorId) {
        setError("Link inválido - corretor não especificado");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/public/corretor/${corretorId}`);
        
        if (!response.ok) {
          throw new Error("Corretor não encontrado");
        }

        const data = await response.json();
        setCorretorInfo(data);
      } catch (error) {
        console.error("Erro ao carregar informações do corretor:", error);
        setError("Erro ao carregar informações do corretor");
      } finally {
        setLoading(false);
      }
    }

    loadCorretorInfo();
  }, [corretorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !telefone.trim()) {
      setError("Nome e telefone são obrigatórios");
      return;
    }

    if (!corretorId || !corretorInfo) {
      setError("Informações do corretor não encontradas");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/public/capturar-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim() || null,
          mensagem: mensagem.trim() || null,
          corretorId,
          imobiliariaId: corretorInfo.imobiliarias[0]?.imobiliaria.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar informações");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      setError(error instanceof Error ? error.message : "Erro ao enviar informações");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error && !corretorInfo) return <ErrorState error={error} />;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Mensagem Enviada!
            </h2>
            <p className="text-muted-foreground mb-4">
              Obrigado pelo seu interesse! {corretorInfo?.nome} entrará em contato em breve.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>📞 {corretorInfo?.telefone}</p>
              <p>📧 {corretorInfo?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{titulo}</h1>
          {descricao && (
            <p className="text-lg text-muted-foreground">{descricao}</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Informações</CardTitle>
              {mensagemPersonalizada && (
                <p className="text-sm text-muted-foreground">{mensagemPersonalizada}</p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem (Opcional)</Label>
                  <Textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Conte-nos sobre o que você está procurando..."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Informações"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informações do Corretor */}
          {corretorInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Seu Corretor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{corretorInfo.nome}</p>
                    {corretorInfo.creci && (
                      <p className="text-sm text-muted-foreground">CRECI: {corretorInfo.creci}</p>
                    )}
                  </div>
                </div>

                {corretorInfo.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{corretorInfo.telefone}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">{corretorInfo.email}</p>
                </div>

                {corretorInfo.imobiliarias.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Imobiliária:</p>
                    {corretorInfo.imobiliarias.map((rel) => (
                      <p key={rel.imobiliaria.id} className="text-sm text-muted-foreground">
                        {rel.imobiliaria.nome}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}