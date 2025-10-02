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
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    }

    switch (status) {
      case "CREATING":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Criando
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge variant="outline">
            <MessageCircle className="w-3 h-3 mr-1" />
            Aguardando Conexão
          </Badge>
        );
      case "DISCONNECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Desconectado
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração do WhatsApp</h1>
          <p className="text-muted-foreground">
            Configure sua instância do WhatsApp para receber leads
            automaticamente
          </p>
        </div>
        <Button variant="outline" onClick={refreshStatus} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {!instanceStatus?.hasInstance ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Criar Instância do WhatsApp
            </CardTitle>
            <CardDescription>
              Você ainda não possui uma instância do WhatsApp configurada. Crie
              uma para começar a receber leads automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createInstance}
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Criar Instância do WhatsApp
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Sua Instância do WhatsApp
                </div>
                {getStatusBadge(
                  instanceStatus.instance!.status,
                  instanceStatus.instance!.connected
                )}
              </CardTitle>
              <CardDescription>
                Nome da instância: {instanceStatus.instance!.instanceName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <p className="text-sm text-muted-foreground">
                    {instanceStatus.instance!.clientName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Criado em</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      instanceStatus.instance!.createdAt
                    ).toLocaleString("pt-BR")}
                  </p>
                </div>
                {instanceStatus.instance!.phoneNumber && (
                  <div>
                    <label className="text-sm font-medium">Número</label>
                    <p className="text-sm text-muted-foreground">
                      {instanceStatus.instance!.phoneNumber}
                    </p>
                  </div>
                )}
                {instanceStatus.instance!.profileName && (
                  <div>
                    <label className="text-sm font-medium">
                      Nome do Perfil
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {instanceStatus.instance!.profileName}
                    </p>
                  </div>
                )}
                {instanceStatus.instance!.connectedAt && (
                  <div>
                    <label className="text-sm font-medium">Conectado em</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        instanceStatus.instance!.connectedAt
                      ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>

              {instanceStatus.instance!.errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {instanceStatus.instance!.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {!instanceStatus.instance!.connected && (
                  <Button onClick={getQrCode} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4 mr-2" />
                    )}
                    Gerar QR Code
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={deleteInstance}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Deletar Instância
                </Button>
              </div>
            </CardContent>
          </Card>

          {qrCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code para Conexão
                </CardTitle>
                <CardDescription>
                  Escaneie este QR Code com seu WhatsApp para conectar a
                  instância
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  {qrCode.startsWith('data:image') ? (
                    <Image
                      src={qrCode}
                      alt="QR Code do WhatsApp"
                      width={256}
                      height={256}
                      className="rounded"
                    />
                  ) : (
                    <Image
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code do WhatsApp"
                      width={256}
                      height={256}
                      className="rounded"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
