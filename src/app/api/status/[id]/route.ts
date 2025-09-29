import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateStatusSchema = z.object({
  ativo: z.boolean().optional(),
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  tipo: z.enum(["LEAD", "PROSPECT", "CLIENTE", "NEGOCIACAO", "FECHADO", "PERDIDO"]).optional(),
  ordem: z.number().min(0).optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o status existe
    const existingStatus = await prisma.statusCustom.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return NextResponse.json(
        { message: "Status não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o status
    await prisma.statusCustom.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Status deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Verificar se o status existe
    const existingStatus = await prisma.statusCustom.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      return NextResponse.json(
        { message: "Status não encontrado" },
        { status: 404 }
      );
    }

    // Se está atualizando o nome, verificar se não existe outro com o mesmo nome
    if (validatedData.nome && validatedData.nome !== existingStatus.nome) {
      const duplicateName = await prisma.statusCustom.findFirst({
        where: {
          nome: {
            equals: validatedData.nome,
            mode: "insensitive",
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { message: "Já existe um status com este nome" },
          { status: 400 }
        );
      }
    }

    // Se está atualizando a ordem, verificar se não existe outro com a mesma ordem
    if (validatedData.ordem !== undefined && validatedData.ordem !== existingStatus.ordem) {
      const duplicateOrder = await prisma.statusCustom.findFirst({
        where: {
          ordem: validatedData.ordem,
          id: {
            not: id,
          },
        },
      });

      if (duplicateOrder) {
        return NextResponse.json(
          { message: "Já existe um status com esta ordem" },
          { status: 400 }
        );
      }
    }

    // Atualizar o status
    const updatedStatus = await prisma.statusCustom.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Status atualizado com sucesso",
      status: updatedStatus,
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);

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