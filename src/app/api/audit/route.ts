import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

    // Verificar se o usuário tem permissão para ver logs
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    if (!allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Sem permissão para acessar logs de auditoria" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const entidade = searchParams.get("entidade");
    const acao = searchParams.get("acao");
    const usuarioId = searchParams.get("usuarioId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Filtrar por imobiliária se o usuário for ADMIN
    if (session.user.role === "ADMIN" && session.user.imobiliariaId) {
      // Para ADMINs, mostrar apenas logs relacionados à sua imobiliária
      where.OR = [
        {
          usuario: {
            imobiliariaId: session.user.imobiliariaId,
          },
        },
        {
          alvoUsuario: {
            imobiliariaId: session.user.imobiliariaId,
          },
        },
        {
          entidade: "Lead",
          // Buscar leads da imobiliária através de uma subconsulta
        },
      ];
    }
    
    if (entidade) {
      where.entidade = entidade;
    }
    
    if (acao) {
      where.acao = acao;
    }
    
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          alvoUsuario: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}