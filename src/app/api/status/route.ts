import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato #RRGGBB"),
  ativo: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    // Verificar se já existe um status com o mesmo nome
    const existingStatus = await prisma.statusCustom.findFirst({
      where: {
        nome: {
          equals: validatedData.nome,
          mode: "insensitive",
        },
      },
    });

    if (existingStatus) {
      return NextResponse.json(
        { message: "Já existe um status com este nome" },
        { status: 400 }
      );
    }

    // Criar o status
    const newStatus = await prisma.statusCustom.create({
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        cor: validatedData.cor,
        ativo: validatedData.ativo,
      },
    });

    return NextResponse.json(
      {
        message: "Status cadastrado com sucesso",
        status: newStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
        },
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
    const statusList = await prisma.statusCustom.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json({
      statusList,
    });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}