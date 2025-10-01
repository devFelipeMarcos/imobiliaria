import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const createLeadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  corretorId: z.string().min(1, "ID do corretor é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const validatedData = createLeadSchema.parse(body);
    const { nome, telefone, corretorId } = validatedData;

    // Verificar se é um User com role de corretor
    const user = await prisma.user.findUnique({
      where: {
        id: corretorId,
        status: "ACTIVE",
        role: {
          in: ["CORRETOR", "ADMIN", "ADMFULL"]
        }
      },
      include: {
        imobiliaria: true
      }
    });

    if (!user || !user.imobiliaria) {
      return NextResponse.json(
        { error: "Corretor não encontrado ou inativo" },
        { status: 404 }
      );
    }

    // Verificar se a imobiliária está ativa
    if (!user.imobiliaria.ativo) {
      return NextResponse.json(
        { error: "Imobiliária não está ativa" },
        { status: 404 }
      );
    }

    // Criar o lead usando o User como corretor
    const lead = await prisma.lead.create({
      data: {
        nome,
        telefone,
        userId: corretorId,
        imobiliariaId: user.imobiliaria.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Lead criado com sucesso",
      lead: {
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        corretor: lead.user,
        imobiliaria: lead.imobiliaria,
        createdAt: lead.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar lead:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}