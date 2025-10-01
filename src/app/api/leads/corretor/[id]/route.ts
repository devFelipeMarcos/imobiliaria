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

    // Buscar leads do corretor
    const leads = await prisma.lead.findMany({
      where: {
        userId: id,
      },
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limitar a 50 leads mais recentes
    });

    // Calcular estatísticas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date();
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const leadsHoje = await prisma.lead.count({
      where: {
        userId: id,
        createdAt: {
          gte: hoje,
        },
      },
    });

    const leadsEstaSemana = await prisma.lead.count({
      where: {
        userId: id,
        createdAt: {
          gte: inicioSemana,
        },
      },
    });

    const totalLeads = await prisma.lead.count({
      where: {
        userId: id,
      },
    });

    const stats = {
      totalLeads,
      leadsHoje,
      leadsEstaSemana,
    };

    return NextResponse.json({
      leads,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar leads do corretor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}