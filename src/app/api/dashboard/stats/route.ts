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

    const { searchParams } = new URL(request.url);
    const corretorFilter = searchParams.get("corretor");
    const statusFilter = searchParams.get("status");

    let whereClause: any = {};

    // Aplicar filtros baseados na role
    if (user.role === "CORRETOR") {
      whereClause.userId = user.id;
    } else if (user.role === "ADMIN") {
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
      }
      whereClause.imobiliariaId = user.imobiliariaId;
      
      // Aplicar filtros adicionais para admin
      if (corretorFilter) {
        whereClause.userId = corretorFilter;
      }
      if (statusFilter) {
        whereClause.statusId = statusFilter;
      }
    }
    // SUPER_ADMIN e ADMFULL podem ver todos os leads

    // Estatísticas básicas
    const totalLeads = await prisma.lead.count({ where: whereClause });

    // Leads por status
    const leadsPorStatus = await prisma.lead.groupBy({
      by: ['statusId'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Buscar informações dos status
    const statusInfo = await prisma.statusCustom.findMany({
      where: {
        id: {
          in: leadsPorStatus.map(item => item.statusId).filter(Boolean) as string[],
        },
      },
      select: {
        id: true,
        nome: true,
        cor: true,
      },
    });

    const statusMap = statusInfo.reduce((acc, status) => {
      acc[status.id] = status;
      return acc;
    }, {} as Record<string, any>);

    const leadsPorStatusFormatado = leadsPorStatus.map(item => ({
      status: item.statusId ? statusMap[item.statusId]?.nome || 'Sem Status' : 'Sem Status',
      cor: item.statusId ? statusMap[item.statusId]?.cor || '#6B7280' : '#6B7280',
      count: item._count.id,
    }));

    // Leads dos últimos 30 dias (para gráfico de linha)
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);

    const leadsUltimos30Dias = await prisma.lead.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: dataInicio,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Agrupar leads por dia
    const leadsPorDia = leadsUltimos30Dias.reduce((acc, lead) => {
      const data = lead.createdAt.toISOString().split('T')[0];
      acc[data] = (acc[data] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Criar array com todos os dias dos últimos 30 dias
    const dadosGraficoTempo = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      dadosGraficoTempo.push({
        data: dataStr,
        leads: leadsPorDia[dataStr] || 0,
      });
    }

    // Estatísticas de hoje, semana e mês
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date();
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [leadsHoje, leadsSemana, leadsMes] = await Promise.all([
      prisma.lead.count({
        where: {
          ...whereClause,
          createdAt: { gte: hoje },
        },
      }),
      prisma.lead.count({
        where: {
          ...whereClause,
          createdAt: { gte: inicioSemana },
        },
      }),
      prisma.lead.count({
        where: {
          ...whereClause,
          createdAt: { gte: inicioMes },
        },
      }),
    ]);

    // Top corretores (apenas para admin)
    let topCorretores: Array<{
      id: string;
      nome: string;
      totalLeads: number;
    }> = [];
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "ADMFULL") {
      const corretoresStats = await prisma.lead.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      const corretoresInfo = await prisma.user.findMany({
        where: {
          id: {
            in: corretoresStats.map(item => item.userId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const corretoresMap = corretoresInfo.reduce((acc, corretor) => {
        acc[corretor.id] = corretor;
        return acc;
      }, {} as Record<string, any>);

      topCorretores = corretoresStats.map(item => ({
        id: item.userId,
        nome: corretoresMap[item.userId]?.name || 'Corretor Desconhecido',
        totalLeads: item._count.id,
      }));
    }

    return NextResponse.json({
      estatisticasBasicas: {
        totalLeads,
        leadsHoje,
        leadsSemana,
        leadsMes,
      },
      leadsPorStatus: leadsPorStatusFormatado,
      dadosGraficoTempo,
      topCorretores,
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}