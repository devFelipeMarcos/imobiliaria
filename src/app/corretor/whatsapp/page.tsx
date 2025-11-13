"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  MessageCircle,
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
} from "lucide-react";
import Image from "next/image";

interface WhatsAppInstance {
  id: string;
  instanceName: string;
  clientName: string;
  status: "CREATING" | "ACTIVE" | "DISCONNECTED" | "ERROR" | "DELETED";
  connected: boolean;
  phoneNumber?: string;
  profileName?: string;
  qrCode?: string;
  errorMessage?: string;
  createdAt: string;
  connectedAt?: string;
}

interface InstanceStatus {
  hasInstance: boolean;
  instance: WhatsAppInstance | null;
}

export default function WhatsAppConfigPage() {
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buscar status da instância
  const fetchInstanceStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/status");
      if (!response.ok) {
        throw new Error("Erro ao buscar status da instância");
      }
      const data = await response.json();
      setInstanceStatus(data);
    } catch (err) {
      setError("Erro ao carregar informações do WhatsApp");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova instância
  const createInstance = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/whatsapp/create", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar instância");
      }

      const data = await response.json();
      setSuccess(
        "Instância criada com sucesso! Agora você pode gerar o QR Code para conectar."
      );
      await fetchInstanceStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Deletar instância
  const deleteInstance = async () => {
    if (
      !confirm(
        "Tem certeza que deseja deletar sua instância do WhatsApp? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/whatsapp/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar instância");
      }

      setSuccess("Instância deletada com sucesso!");
      setQrCode(null);
      await fetchInstanceStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Obter QR Code
  const getQrCode = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/whatsapp/qrcode");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API QR Code:", errorData);
        throw new Error(
          errorData.error || 
          `Erro ao obter QR Code (Status: ${response.status})`
        );
      }

      const data = await response.json();
      console.log("Resposta da API QR Code:", data);
      
      if (!data.qrCode) {
        console.warn("QR Code não encontrado na resposta:", data);
        setError("QR Code não foi gerado. Verifique se a instância está ativa e tente novamente.");
        return;
      }
      
      setQrCode(data.qrCode);
      setSuccess("QR Code gerado com sucesso! Escaneie com seu WhatsApp.");
    } catch (err: any) {
      console.error("Erro ao obter QR Code:", err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Atualizar status
  const refreshStatus = async () => {
    setLoading(true);
    await fetchInstanceStatus();
  };

  useEffect(() => {
    fetchInstanceStatus();
  }, []);

  // Auto-refresh a cada 30 segundos se não estiver conectado
  useEffect(() => {
    if (instanceStatus?.hasInstance && !instanceStatus.instance?.connected) {
      const interval = setInterval(fetchInstanceStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [instanceStatus]);

  const getStatusBadge = (status: string, connected: boolean) => {
    if (connected) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
          <CheckCircle className="w-3 h-3 mr-1" />
          ✅ Conectado
        </Badge>
      );
    }

    switch (status) {
      case "CREATING":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
            <Clock className="w-3 h-3 mr-1" />
            ⏳ Criando
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
            <MessageCircle className="w-3 h-3 mr-1" />
            ⏰ Aguardando Conexão
          </Badge>
        );
      case "DISCONNECTED":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
            <XCircle className="w-3 h-3 mr-1" />
            ❌ Desconectado
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg">
            <XCircle className="w-3 h-3 mr-1" />
            ⚠️ Erro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
            <p className="text-white text-lg">Carregando configurações do WhatsApp...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📱 Configuração do WhatsApp
            </h1>
            <p className="text-blue-100 text-lg">
              Configure sua instância do WhatsApp para receber leads automaticamente
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshStatus} 
            disabled={loading}
            className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            🔄 Atualizar
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="bg-red-500/20 border-red-400 backdrop-blur-sm">
            <AlertDescription className="text-red-100 font-medium">
              ❌ {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/20 border-green-400 backdrop-blur-sm">
            <AlertDescription className="text-green-100 font-medium">
              ✅ {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {!instanceStatus?.hasInstance ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                📱 Criar Instância do WhatsApp
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Você ainda não possui uma instância do WhatsApp configurada. Crie uma para começar a receber leads automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createInstance}
                disabled={actionLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                🚀 Criar Instância do WhatsApp
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Instance Info Card */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    📱 Sua Instância do WhatsApp
                  </div>
                  {getStatusBadge(
                    instanceStatus.instance!.status,
                    instanceStatus.instance!.connected
                  )}
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Nome da instância: <span className="font-semibold text-white">{instanceStatus.instance!.instanceName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <label className="text-sm font-medium text-blue-200">👤 Cliente</label>
                    <p className="text-white font-semibold">
                      {instanceStatus.instance!.clientName}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <label className="text-sm font-medium text-blue-200">📅 Criado em</label>
                    <p className="text-white font-semibold">
                      {new Date(
                        instanceStatus.instance!.createdAt
                      ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {instanceStatus.instance!.phoneNumber && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <label className="text-sm font-medium text-blue-200">📞 Número</label>
                      <p className="text-white font-semibold">
                        {instanceStatus.instance!.phoneNumber}
                      </p>
                    </div>
                  )}
                  {instanceStatus.instance!.profileName && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <label className="text-sm font-medium text-blue-200">👤 Nome do Perfil</label>
                      <p className="text-white font-semibold">
                        {instanceStatus.instance!.profileName}
                      </p>
                    </div>
                  )}
                  {instanceStatus.instance!.connectedAt && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 md:col-span-2">
                      <label className="text-sm font-medium text-blue-200">✅ Conectado em</label>
                      <p className="text-white font-semibold">
                        {new Date(
                          instanceStatus.instance!.connectedAt
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                {instanceStatus.instance!.errorMessage && (
                  <Alert className="bg-red-500/20 border-red-400 backdrop-blur-sm">
                    <AlertDescription className="text-red-100 font-medium">
                      ⚠️ {instanceStatus.instance!.errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  {!instanceStatus.instance!.connected && (
                    <Button 
                      onClick={getQrCode} 
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4 mr-2" />
                      )}
                      📱 Gerar QR Code
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={deleteInstance}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    🗑️ Deletar Instância
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Card */}
            {qrCode && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    📱 QR Code para Conexão
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    Escaneie este QR Code com seu WhatsApp para conectar a instância
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="bg-white p-6 rounded-xl border-4 border-white/20 shadow-2xl">
                    {qrCode.startsWith('data:image') ? (
                      <Image
                        src={qrCode}
                        alt="QR Code do WhatsApp"
                        width={256}
                        height={256}
                        className="rounded-lg"
                      />
                    ) : (
                      <Image
                        src={`data:image/png;base64,${qrCode}`}
                        alt="QR Code do WhatsApp"
                        width={256}
                        height={256}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
