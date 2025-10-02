import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WhatsAppStatus } from "@/generated/prisma";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
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
            "Acesso negado. Apenas corretores podem criar instâncias do WhatsApp.",
        },
        { status: 403 }
      );
    }

    // Verificar se o corretor está vinculado a uma imobiliária
    if (!session.user.imobiliariaId) {
      return NextResponse.json(
        { error: "Corretor não está vinculado a uma imobiliária." },
        { status: 400 }
      );
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        whatsappInstance: true,
        imobiliaria: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe uma instância para este corretor
    if (user.whatsappInstance) {
      return NextResponse.json(
        {
          error:
            "Você já possui uma instância do WhatsApp. Exclua a atual para criar uma nova.",
        },
        { status: 400 }
      );
    }

    if (!user.imobiliaria) {
      return NextResponse.json(
        { error: "Corretor deve estar vinculado a uma imobiliária" },
        { status: 400 }
      );
    }

    // Gerar nome da instância: nomeImobiliaria_NomeCorretor_userId
    const instanceName = `${user.imobiliaria.nome.replace(
      /\s+/g,
      ""
    )}_${user.name.replace(/\s+/g, "")}_${user.id}`;
    const clientName = `${user.name} - ${user.imobiliaria.nome}`;

    // Gerar token aleatório no formato UUID em maiúsculas
    const token = (
      globalThis.crypto?.randomUUID?.() || randomUUID()
    ).toUpperCase();

    // Criar instância no Evolution API
    const evolutionResponse = await fetch(
      "https://evo.admfelipemarcos.site/instance/create",
      {
        method: "POST",
        headers: {
          apikey: process.env.API_KEY_EVO!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName,
          integration: "WHATSAPP-BAILEYS",
          clientName,
          token: token,
          Setting: {
            rejectCall: false,
            msgCall: "",
            groupsIgnore: false,
            alwaysOnline: false,
            readMessages: false,
            readStatus: false,
            syncFullHistory: false,
          },
        }),
      }
    );

    console.log(token);

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text();
      console.error("Erro ao criar instância no Evolution API:", errorData);
      return NextResponse.json(
        { error: "Erro ao criar instância no Evolution API" },
        { status: 500 }
      );
    }

    const evolutionData = await evolutionResponse.json();

    // Salvar instância no banco de dados, incluindo o token
    const whatsappInstance = await prisma.whatsAppInstance.create({
      data: {
        instanceName,
        clientName,
        token,
        status: WhatsAppStatus.CREATING,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      instance: whatsappInstance,
      evolutionResponse: evolutionData,
    });
  } catch (error) {
    console.error("Erro ao criar instância do WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
