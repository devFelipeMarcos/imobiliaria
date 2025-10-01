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
        { error: "Acesso negado. Apenas ADMFULL pode acessar estas atividades." },
        { status: 403 }
      );
    }

    // Buscar atividades recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar criações de imobiliárias
    const imobiliariasRecentes = await prisma.imobiliaria.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        nome: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Buscar criações de usuários admin
    const adminsRecentes = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        imobiliaria: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Buscar criações de corretores
    const corretoresRecentes = await prisma.user.findMany({
      where: {
        role: "CORRETOR",
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        imobiliaria: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Combinar e formatar atividades
    const atividades = [
      ...imobiliariasRecentes.map(imob => ({
        id: `imob-${imob.id}`,
        acao: "Nova Imobiliária",
        entidade: "Imobiliária",
        descricao: `Imobiliária "${imob.nome}" foi criada`,
        usuario: "Sistema",
        createdAt: imob.createdAt.toISOString(),
        tipo: "Criação"
      })),
      ...adminsRecentes.map(admin => ({
        id: `admin-${admin.id}`,
        acao: "Novo Administrador",
        entidade: "Usuário",
        descricao: `Admin "${admin.name || admin.email}" foi criado${admin.imobiliaria ? ` para ${admin.imobiliaria.nome}` : ''}`,
        usuario: "Sistema",
        createdAt: admin.createdAt.toISOString(),
        tipo: "Criação"
      })),
      ...corretoresRecentes.map(corretor => ({
        id: `corretor-${corretor.id}`,
        acao: "Novo Corretor",
        entidade: "Usuário",
        descricao: `Corretor "${corretor.name || corretor.email}" foi criado${corretor.imobiliaria ? ` para ${corretor.imobiliaria.nome}` : ''}`,
        usuario: "Sistema",
        createdAt: corretor.createdAt.toISOString(),
        tipo: "Criação"
      }))
    ];

    // Ordenar por data mais recente
    atividades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Retornar apenas as 20 mais recentes
    return NextResponse.json(atividades.slice(0, 20));
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}