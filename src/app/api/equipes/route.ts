import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createEquipeSchema = z.object({
  nome: z.string().min(1, "Nome da equipe é obrigatório"),
  imobiliariaId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = (session.user as unknown) as { role?: string; imobiliariaId?: string };
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const imobiliariaIdParam = searchParams.get("imobiliariaId");

    let where: any = {};

    if (user.role === "ADMIN") {
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 400 });
      }
      where.imobiliariaId = user.imobiliariaId;
    } else if (imobiliariaIdParam) {
      where.imobiliariaId = imobiliariaIdParam;
    }

    const equipes = await (prisma as any).equipe.findMany({
      where,
      include: {
        _count: {
          select: {
            usuarios: true,
          },
        },
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    const result = equipes.map((eq: any) => ({
      id: eq.id,
      nome: eq.nome,
      ativo: eq.ativo,
      createdAt: eq.createdAt,
      updatedAt: eq.updatedAt,
      totalUsuarios: eq._count?.usuarios ?? 0,
      imobiliaria: eq.imobiliaria,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar equipes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
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

    const user = (session.user as unknown) as { role?: string; imobiliariaId?: string };
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = createEquipeSchema.parse(body);

    let imobiliariaId: string | null = null;
    if (user.role === "ADMIN") {
      if (!user.imobiliariaId) {
        return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 400 });
      }
      imobiliariaId = user.imobiliariaId;
    } else {
      if (!data.imobiliariaId) {
        return NextResponse.json({ error: "imobiliariaId é obrigatório" }, { status: 400 });
      }
      imobiliariaId = data.imobiliariaId;
    }

    // Validar imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId as string },
    });
    if (!imobiliaria || !imobiliaria.ativo) {
      return NextResponse.json({ error: "Imobiliária inválida" }, { status: 400 });
    }

    // Evitar duplicidade de nome por imobiliária
    const existente = await (prisma as any).equipe.findFirst({
      where: { nome: data.nome, imobiliariaId: imobiliariaId as string },
    });
    if (existente) {
      return NextResponse.json({ error: "Já existe uma equipe com este nome" }, { status: 400 });
    }

    const equipe = await (prisma as any).equipe.create({
      data: {
        nome: data.nome,
        imobiliariaId: imobiliariaId as string,
      },
      include: {
        imobiliaria: {
          select: { id: true, nome: true },
        },
      },
    });

    return NextResponse.json({
      id: equipe.id,
      nome: equipe.nome,
      ativo: equipe.ativo,
      createdAt: equipe.createdAt,
      updatedAt: equipe.updatedAt,
      imobiliaria: equipe.imobiliaria,
    });
  } catch (error) {
    console.error("Erro ao criar equipe:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}