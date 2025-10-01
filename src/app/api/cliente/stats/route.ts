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
    const allowedRoles = ["CORRETOR", "ADMIN", "SUPER_ADMIN", "ADMFULL"];
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    let whereClause: any = {};

    // Se for corretor, mostrar apenas seus leads
    if (user.role === "CORRETOR") {
      whereClause.userId = user.id;
    } else if (user.role === "ADMIN") {
      // Se for admin, mostrar leads da sua imobiliária
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
      }

      whereClause.imobiliariaId = user.imobiliariaId;
    }
    // SUPER_ADMIN e ADMFULL podem ver todos os leads (whereClause vazio)

    // Buscar estatísticas
    const totalLeads = await prisma.lead.count({
      where: whereClause,
    });

    // Leads ativos (sem status de "convertido" ou "perdido")
    const leadsAtivos = await prisma.lead.count({
      where: {
        ...whereClause,
        status: {
          nome: {
            notIn: ["Convertido", "Perdido", "Cancelado"],
          },
        },
      },
    });

    // Leads convertidos
    const leadsConvertidos = await prisma.lead.count({
      where: {
        ...whereClause,
        status: {
          nome: "Convertido",
        },
      },
    });

    // Calcular taxa de conversão
    const taxaConversao = totalLeads > 0 ? Math.round((leadsConvertidos / totalLeads) * 100) : 0;

    return NextResponse.json({
      totalLeads,
      leadsAtivos,
      leadsConvertidos,
      taxaConversao,
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}