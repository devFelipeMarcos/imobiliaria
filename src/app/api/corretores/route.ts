import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar permissões: apenas ADMFULL, SUPER_ADMIN e ADMIN podem listar corretores
    const role = session.user.role ?? "";
    if (!["ADMFULL", "SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    let whereClause: any = {
      role: "CORRETOR"
    };

    // Se for ADMIN, só pode ver corretores da sua imobiliária
    if (role === "ADMIN") {
      if (!session.user.imobiliariaId) {
        return NextResponse.json(
          { error: "Administrador deve estar vinculado a uma imobiliária" },
          { status: 400 }
        );
      }
      whereClause.imobiliariaId = session.user.imobiliariaId;
    }

    const corretores = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
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

    return NextResponse.json(corretores);
  } catch (error) {
    console.error("Erro ao buscar corretores:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}