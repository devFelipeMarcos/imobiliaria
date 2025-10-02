import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é um corretor
    if (session.user.role !== "CORRETOR") {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas corretores podem obter QR code do WhatsApp.",
        },
        { status: 403 }
      );
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { whatsappInstance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se existe uma instância para este corretor
    if (!user.whatsappInstance) {
      return NextResponse.json(
        {
          error: "Nenhuma instância do WhatsApp encontrada para este corretor",
        },
        { status: 404 }
      );
    }

    const instance = user.whatsappInstance;

    // Obter QR Code do Evolution API
    try {
      console.log(`Tentando obter QR Code para instância: ${instance.instanceName}`);
      
      const evolutionResponse = await fetch(
        `https://evo.admfelipemarcos.site/instance/connect/${instance.instanceName}`,
        {
          method: "GET",
          headers: {
            apikey: process.env.API_KEY_EVO!,
          },
        }
      );

      console.log(`Status da resposta Evolution API: ${evolutionResponse.status}`);

      if (!evolutionResponse.ok) {
        const errorData = await evolutionResponse.text();
        console.error("Erro ao obter QR Code do Evolution API:", errorData);
        return NextResponse.json(
          { 
            error: "Erro ao obter QR Code do Evolution API",
            details: errorData,
            status: evolutionResponse.status
          },
          { status: 500 }
        );
      }

      const evolutionData = await evolutionResponse.json();
      console.log("Dados recebidos da Evolution API:", JSON.stringify(evolutionData, null, 2));

      // Verificar se existe QR code na resposta
      // Baseado na documentação da Evolution API, o campo pode ser 'code' ou 'base64'
      const qrCodeData = evolutionData.base64 || evolutionData.code || evolutionData.qrcode || evolutionData.qr;
      const pairingCode = evolutionData.pairingCode;
      
      console.log("QR Code encontrado:", qrCodeData ? "Sim" : "Não");
      console.log("Pairing Code encontrado:", pairingCode ? "Sim" : "Não");
      console.log("Campos disponíveis na resposta:", Object.keys(evolutionData));

      // Se não há QR code mas há pairing code, retornar erro específico
      if (!qrCodeData && pairingCode) {
        return NextResponse.json({
          success: false,
          error: "Instância retornou pairing code ao invés de QR code. Verifique se a instância está configurada corretamente.",
          pairingCode: pairingCode,
          rawResponse: evolutionData,
        }, { status: 400 });
      }

      // Se não há nem QR code nem pairing code
      if (!qrCodeData) {
        return NextResponse.json({
          success: false,
          error: "QR Code não foi gerado pela Evolution API. Verifique se a instância está ativa.",
          rawResponse: evolutionData,
        }, { status: 400 });
      }

      // Atualizar QR Code no banco se disponível
      await prisma.whatsAppInstance.update({
        where: { id: instance.id },
        data: {
          qrCode: qrCodeData,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        qrCode: qrCodeData,
        pairingCode: pairingCode,
        rawResponse: evolutionData, // Para debug
        instance: {
          id: instance.id,
          instanceName: instance.instanceName,
          status: instance.status,
          connected: instance.connected,
        },
      });
    } catch (evolutionError) {
      console.error("Erro ao conectar com Evolution API:", evolutionError);
      return NextResponse.json(
        { error: "Erro ao conectar com Evolution API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao obter QR Code da instância do WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
