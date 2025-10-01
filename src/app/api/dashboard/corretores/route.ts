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
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    let whereClause: any = {
      role: "CORRETOR",
    };

    // Se for admin, mostrar apenas corretores da sua imobiliária
    if (user.role === "ADMIN") {
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
      }
      whereClause.imobiliariaId = user.imobiliariaId;
    }

    const corretores = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const corretoresFormatados = corretores.map(corretor => ({
      id: corretor.id,
      name: corretor.name,
      email: corretor.email,
      totalLeads: corretor._count.leads,
    }));

    return NextResponse.json({
      corretores: corretoresFormatados,
    });

  } catch (error) {
    console.error("Erro ao buscar corretores:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}