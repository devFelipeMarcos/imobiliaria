"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import {
  Share,
  Copy,
  ExternalLink,
  QrCode,
  Eye,
  CheckCircle,
  User,
  Phone,
  Home,
  Heart,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import QRCode from "qrcode";

export default function MeuNovoLeadPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkPublico, setLinkPublico] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setLoading(true);
        const sessionData = await authClient.getSession();

        if (!sessionData?.data?.user?.id) {
          setError("Usuário não autenticado");
          return;
        }

        const session = sessionData.data;
        setUserId(session.user.id);

        // Gerar o link público
        const baseUrl = window.location.origin;
        const publicLink = `${baseUrl}/public-lead/${session.user.id}`;
        setLinkPublico(publicLink);

        // Gerar QR Code
        try {
          const qrUrl = await QRCode.toDataURL(publicLink, {
            width: 256,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeUrl(qrUrl);
        } catch (qrError) {
          console.error("Erro ao gerar QR Code:", qrError);
        }
      } catch (err) {
        console.error("Erro ao inicializar:", err);
        setError("Erro ao carregar informações do usuário");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      console.error("Erro ao copiar:", err);
      toast.error("Erro ao copiar o link");
    }
  };

  const openPreview = () => {
    window.open(linkPublico, "_blank");
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu Link de Captura de Leads",
          text: "Preencha seus dados e entrarei em contato para ajudá-lo a encontrar o imóvel ideal!",
          url: linkPublico,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState error={error} />
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
              <Share className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 text-sm font-medium">
                Compartilhe seu link personalizado
              </span>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Meu novo</span>
              <span className="block bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Lead
              </span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-orange-100 mb-8">
              Capture leads automaticamente
            </h2>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Compartilhe seu link personalizado e capture novos leads de forma
              automática. Seus clientes preenchem um formulário simples e você
              recebe a notificação instantaneamente.
            </p>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              {[
                "Formulário simples e rápido para o cliente",
                "Você já aparece pré-selecionado como corretor",
                "Design profissional e responsivo",
                "Notificação instantânea de novos leads",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção direita - Conteúdo principal */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-20">
          <div className="w-full max-w-2xl space-y-6">
            {/* Card do Link */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Share className="h-5 w-5 text-orange-500" />
                  <span>Seu Link Público</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Link de Captura:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                    {linkPublico}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </Button>

                  <Button
                    onClick={shareLink}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Share className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </Button>

                  <Button
                    onClick={openPreview}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visualizar</span>
                  </Button>

                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </Button>
                </div>

                {showQR && qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Como Funciona */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span>Como Funciona</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <p className="text-sm text-gray-600">
                      Compartilhe seu link personalizado com clientes
                      interessados
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <p className="text-sm text-gray-600">
                      O cliente preenche o formulário simples com seus dados
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <p className="text-sm text-gray-600">
                      Você recebe uma notificação instantânea do novo lead
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <p className="text-sm text-gray-600">
                      Entre em contato e feche mais negócios!
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Vantagens:
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Formulário simples e rápido</li>
                    <li>• Você já aparece pré-selecionado</li>
                    <li>• Design profissional e responsivo</li>
                    <li>• Notificação instantânea</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <span>Preview do Formulário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border">
                  <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-6">
                      <div className="bg-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Home className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Encontre seu Imóvel dos Sonhos
                      </h2>
                      <p className="text-gray-600">
                        Preencha seus dados e entraremos em contato para
                        ajudá-lo
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Nome Completo
                        </Label>
                        <Input
                          placeholder="Digite seu nome completo"
                          disabled
                          className="mt-1 bg-gray-50 border-gray-300 text-gray-600 placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          WhatsApp
                        </Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          disabled
                          className="mt-1 bg-gray-50 border-gray-300 text-gray-600 placeholder-gray-400"
                        />
                      </div>

                      <Button
                        disabled
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium py-2 px-4 rounded-lg"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Cadastrar Lead
                      </Button>

                      <div className="flex items-center justify-center pt-2">
                        <div className="flex items-center text-sm text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          Dados seguros e protegidos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
