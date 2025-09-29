import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "ID do corretor é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // Primeiro, verificar se o corretorId é um userId (para links dinâmicos)
    let corretorId = validatedData.corretorId;
    
    // Tentar encontrar o corretor pelo userId primeiro
    let corretor = await prisma.corretor.findUnique({
      where: { userId: validatedData.corretorId },
    });

    // Se não encontrou pelo userId, tentar pelo próprio corretorId
    if (!corretor) {
      corretor = await prisma.corretor.findUnique({
        where: { id: validatedData.corretorId },
      });
      
      if (corretor) {
        corretorId = corretor.id;
      }
    } else {
      corretorId = corretor.id;
    }

    if (!corretor) {
      return NextResponse.json(
        { message: "Corretor não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe um lead com o mesmo telefone para este corretor
    const leadExistente = await prisma.lead.findFirst({
      where: {
        telefone: validatedData.telefone,
        corretorId: corretorId,
      },
    });

    if (leadExistente) {
      return NextResponse.json(
        { message: "Lead já existe para este corretor" },
        { status: 409 }
      );
    }

    // Criar o lead
    const lead = await prisma.lead.create({
      data: {
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        corretorId: corretorId,
      },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
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

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            email: true,
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