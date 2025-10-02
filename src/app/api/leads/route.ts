import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { triggerN8nWebhook } from "@/lib/n8n-webhook";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "ID do corretor é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem uma imobiliária associada
    if (!session.user.imobiliariaId) {
      return NextResponse.json(
        { error: "Usuário deve estar vinculado a uma imobiliária" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // Primeiro, verificar se o corretorId é um userId (para links dinâmicos)
    let corretorId = validatedData.corretorId;
    
    // Tentar encontrar o corretor (user) pelo id
    let corretor = await prisma.user.findUnique({
      where: { id: validatedData.corretorId },
    });

    if (!corretor) {
      return NextResponse.json(
        { message: "Corretor não encontrado" },
        { status: 404 }
      );
    }

    corretorId = corretor.id;

    // Verificar se o corretor pertence à mesma imobiliária
    if (corretor?.imobiliariaId !== session.user.imobiliariaId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Corretor não está vinculado à sua imobiliária" },
        { status: 403 }
      );
    }

    // Verificar se já existe um lead com o mesmo telefone para esta imobiliária
    const leadExistente = await prisma.lead.findFirst({
      where: {
        telefone: validatedData.telefone,
        imobiliariaId: session.user.imobiliariaId,
      },
    });

    if (leadExistente) {
      return NextResponse.json(
        { message: "Lead já existe para esta imobiliária" },
        { status: 409 }
      );
    }

    // Criar o lead
    const lead = await prisma.lead.create({
      data: {
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        userId: corretorId,
        imobiliariaId: session.user.imobiliariaId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    // Disparar webhook n8n em background
    triggerN8nWebhook(
      lead.telefone, 
      lead.nome, 
      { id: lead.user.id, name: lead.user.name },
      { nome: lead.imobiliaria.nome }
    ).catch(error => {
      console.error('Erro ao disparar webhook n8n:', error);
    });

    return NextResponse.json(
      { 
        message: "Lead cadastrado com sucesso",
        lead 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let whereClause: any = {};

    if (session.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode ver todos os leads
      const { searchParams } = new URL(request.url);
      const imobiliariaId = searchParams.get("imobiliariaId");
      if (imobiliariaId) {
        whereClause.imobiliariaId = imobiliariaId;
      }
    } else {
      // Outros usuários só podem ver leads de sua imobiliária
      whereClause.imobiliariaId = session.user.imobiliariaId;
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}