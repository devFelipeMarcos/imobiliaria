import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar usuários que pertencem a esta imobiliária
    const usuarios = await prisma.user.findMany({
      where: {
        imobiliariaId: id,
        status: 'ACTIVE',
        role: {
          in: ['CORRETOR', 'ADMIN', 'ADMFULL']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        userDetails: {
          select: {
            telefone: true
          }
        }
      }
    });

    // Mapear para o formato esperado pelo frontend
    const corretores = usuarios.map(user => ({
      id: user.id,
      nome: user.name,
      email: user.email,
      telefone: user.userDetails?.telefone || null,
      role: user.role,
      status: user.status
    }));

    return NextResponse.json({
      corretores: corretores,
    });
  } catch (error) {
    console.error("Erro ao buscar corretores da imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}