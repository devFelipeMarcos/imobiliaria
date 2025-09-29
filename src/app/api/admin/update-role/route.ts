import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "CLIENT", "CORRETOR"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar o role e status do usuário
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        role: validatedData.role,
        status: validatedData.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        message: "Permissões atualizadas com sucesso",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}