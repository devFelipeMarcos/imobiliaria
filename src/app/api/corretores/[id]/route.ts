import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do corretor é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o usuário com role CORRETOR
    const user = await prisma.user.findUnique({
      where: {
        id: id,
        role: "CORRETOR", // Garantir que é um corretor
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        userDetails: {
          select: {
            cpfCnpj: true,
            telefone: true,
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

    if (!user) {
      return NextResponse.json(
        { message: "Corretor não encontrado" },
        { status: 404 }
      );
    }

    // Retornar dados do corretor
    const corretorData = {
      id: user.id,
      nome: user.name,
      email: user.email,
      cpf: user.userDetails?.cpfCnpj,
      telefone: user.userDetails?.telefone,
      imobiliaria: user.imobiliaria,
    };

    return NextResponse.json(corretorData);
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}