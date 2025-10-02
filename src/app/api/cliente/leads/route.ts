import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerN8nWebhook } from "@/lib/n8n-webhook";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusId = searchParams.get("statusId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

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

    // Adicionar filtro de busca se fornecido
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Adicionar filtro por status se fornecido
    if (statusId) {
      whereClause.statusId = statusId;
    }

    // Configurar ordenação
    const orderBy: any = {};
    if (sortBy === "nome" || sortBy === "telefone" || sortBy === "createdAt" || sortBy === "updatedAt") {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    // Buscar leads com paginação
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        include: {
          status: {
            select: {
              id: true,
              nome: true,
              cor: true,
              descricao: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          imobiliaria: {
            select: {
              id: true,
              nome: true,
            },
          },
          _count: {
            select: {
              observacoes: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.lead.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { nome, telefone, statusId } = body;

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    let userId: string;
    let imobiliariaId: string;

    if (user.role === "CORRETOR") {
      // Verificar se o usuário tem imobiliária associada
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Corretor não vinculado a nenhuma imobiliária" }, { status: 400 });
      }

      userId = user.id;
      imobiliariaId = user.imobiliariaId;
    } else {
      // Para admins, usar a imobiliária do usuário
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
      }

      // Para SUPER_ADMIN e ADMFULL, precisamos de um corretor padrão ou permitir especificar
      if (user.role === "ADMIN") {
        // Buscar um corretor (usuário com role CORRETOR) da imobiliária para associar o lead
        const corretor = await prisma.user.findFirst({
          where: {
            role: "CORRETOR",
            imobiliariaId: user.imobiliariaId,
            status: "ACTIVE",
          },
        });

        if (!corretor) {
          return NextResponse.json({ error: "Nenhum corretor encontrado na imobiliária" }, { status: 400 });
        }

        userId = corretor.id;
        imobiliariaId = user.imobiliariaId;
      } else {
          // Para SUPER_ADMIN e ADMFULL, permitir especificar corretor e imobiliária
          const { userId: bodyUserId, imobiliariaId: bodyImobiliariaId } = body;
          
          if (!bodyUserId || !bodyImobiliariaId) {
            return NextResponse.json({ 
              error: "UserId e ImobiliariaId são obrigatórios para este tipo de usuário" 
            }, { status: 400 });
          }

          userId = bodyUserId;
          imobiliariaId = bodyImobiliariaId;
        }
    }

    // Criar o lead
    const lead = await prisma.lead.create({
      data: {
        nome,
        telefone,
        userId,
        imobiliariaId,
        statusId: statusId || null,
      },
      include: {
        status: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Disparar webhook n8n em background
    triggerN8nWebhook(
      lead.telefone, 
      lead.nome, 
      { id: lead.user.id, name: lead.user.name },
      { nome: lead.imobiliaria.nome }
    ).catch(error => {
      console.error('Erro ao disparar webhook n8n:', error);
    });

    return NextResponse.json(lead, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}