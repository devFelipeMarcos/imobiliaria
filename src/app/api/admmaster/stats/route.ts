import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem role de ADMFULL
    if (session.user.role !== "ADMFULL") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas ADMFULL pode acessar estas estatísticas." },
        { status: 403 }
      );
    }

    // Buscar estatísticas gerais
    const [
      totalImobiliarias,
      totalAdmins,
      totalCorretores,
      totalLeads
    ] = await Promise.all([
      // Total de imobiliárias
      prisma.imobiliaria.count(),
      
      // Total de administradores (ADMIN e SUPER_ADMIN)
      prisma.user.count({
        where: {
          role: {
            in: ["ADMIN", "SUPER_ADMIN"]
          }
        }
      }),
      
      // Total de corretores
      prisma.user.count({
        where: {
          role: "CORRETOR"
        }
      }),
      
      // Total de leads
      prisma.lead.count()
    ]);

    const stats = {
      totalImobiliarias,
      totalAdmins,
      totalCorretores,
      totalLeads
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}