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
    
    // Verificar se é um corretor
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const statusId = searchParams.get("statusId") || "";

    const skip = (page - 1) * limit;

    let whereClause: any = {
      userId: user.id, // Apenas leads do corretor logado
    };

    // Filtro de busca por nome ou telefone
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search } },
      ];
    }

    // Filtro por status
    if (statusId) {
      whereClause.statusId = statusId;
    }

    // Buscar leads com paginação
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              nome: true,
              cor: true,
              descricao: true,
            },
          },
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
        skip,
        take: limit,
      }),
      prisma.lead.count({ where: whereClause }),
    ]);

    // Calcular estatísticas básicas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date();
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [totalLeads, leadsHoje, leadsSemana, leadsMes] = await Promise.all([
      prisma.lead.count({
        where: { userId: user.id },
      }),
      prisma.lead.count({
        where: {
          userId: user.id,
          createdAt: { gte: hoje },
        },
      }),
      prisma.lead.count({
        where: {
          userId: user.id,
          createdAt: { gte: inicioSemana },
        },
      }),
      prisma.lead.count({
        where: {
          userId: user.id,
          createdAt: { gte: inicioMes },
        },
      }),
    ]);

    const stats = {
      totalLeads,
      leadsHoje,
      leadsSemana,
      leadsMes,
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      leads,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar leads do corretor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}