import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const statusCustomSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cor: z.string().min(1, "Cor é obrigatória"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem uma imobiliária associada
    if (!session.user.imobiliariaId) {
      return NextResponse.json(
        { error: "Usuário deve estar vinculado a uma imobiliária" },
        { status: 400 }
      );
    }

    // Apenas ADMIN e SUPER_ADMIN podem criar status customizados
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = statusCustomSchema.parse(body);

    // Verificar se já existe um status com o mesmo nome para esta imobiliária
    const existingStatus = await prisma.statusCustom.findFirst({
      where: {
        nome: validatedData.nome,
        imobiliariaId: session.user.imobiliariaId,
      },
    });

    if (existingStatus) {
      return NextResponse.json(
        { error: "Já existe um status com este nome para sua imobiliária" },
        { status: 400 }
      );
    }

    const statusCustom = await prisma.statusCustom.create({
      data: {
        ...validatedData,
        imobiliariaId: session.user.imobiliariaId,
      },
      include: {
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json(statusCustom, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar status customizado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let whereClause: any = {};

    if (session.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode ver todos os status customizados
      const { searchParams } = new URL(request.url);
      const imobiliariaId = searchParams.get("imobiliariaId");
      if (imobiliariaId) {
        whereClause.imobiliariaId = imobiliariaId;
      }
    } else {
      // Outros usuários só podem ver status de sua imobiliária
      whereClause.imobiliariaId = session.user.imobiliariaId;
    }

    const statusCustoms = await prisma.statusCustom.findMany({
      where: whereClause,
      include: {
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(statusCustoms);
  } catch (error) {
    console.error("Erro ao buscar status customizados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}