import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar dados do usuário com sua imobiliária
    const userData = await prisma.user.findUnique({
      where: { 
        id: user.id,
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        userDetails: {
          select: {
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

    if (!userData || !userData.imobiliaria) {
      return NextResponse.json({ error: "Corretor não encontrado ou sem imobiliária" }, { status: 404 });
    }

    // Retornar dados no formato esperado
    const corretorInfo = {
      id: userData.id,
      nome: userData.name,
      email: userData.email,
      telefone: userData.userDetails?.telefone,
      status: userData.status,
      imobiliarias: [{
        ativo: true,
        imobiliaria: userData.imobiliaria
      }]
    };

    return NextResponse.json(corretorInfo);

  } catch (error) {
    console.error("Erro ao buscar informações do corretor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}