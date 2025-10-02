import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ corretorId: string }> }
) {
  const { corretorId } = await context.params;
  try {

    if (!corretorId) {
      return NextResponse.json(
        { error: "ID do corretor é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o corretor (usuário) com suas informações e imobiliária
    const corretor = await prisma.user.findUnique({
      where: {
        id: corretorId,
        status: "ACTIVE", // Apenas corretores ativos
        role: {
          in: ["CORRETOR", "ADMIN", "ADMFULL"] // Apenas roles que podem ser corretores
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        userDetails: {
          select: {
            telefone: true,
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

    if (!corretor) {
      return NextResponse.json(
        { error: "Corretor não encontrado ou inativo" },
        { status: 404 }
      );
    }

    if (!corretor.imobiliaria) {
      return NextResponse.json(
        { error: "Corretor não está associado a uma imobiliária" },
        { status: 400 }
      );
    }

    return NextResponse.json(corretor);
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}