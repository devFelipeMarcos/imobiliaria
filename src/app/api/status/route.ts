import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const statusSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato #RRGGBB"),
  ativo: z.boolean(),
  imobiliariaId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão (ADMIN ou SUPER_ADMIN)
    if (!session.user.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    // Determinar a imobiliária
    let imobiliariaId: string;
    if (session.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode especificar imobiliariaId ou usar o próprio
      imobiliariaId = validatedData.imobiliariaId || session.user.imobiliariaId || "";
    } else {
        // ADMIN só pode criar status para sua própria imobiliária
        if (!session.user.imobiliariaId) {
          return NextResponse.json(
            { message: "Usuário não possui imobiliária associada" },
            { status: 400 }
          );
        }
        imobiliariaId = session.user.imobiliariaId;
      }

    if (!imobiliariaId) {
      return NextResponse.json(
        { message: "ID da imobiliária é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe um status com o mesmo nome na mesma imobiliária
    const existingStatus = await prisma.statusCustom.findFirst({
      where: {
        nome: {
          equals: validatedData.nome,
          mode: "insensitive",
        },
        imobiliariaId: imobiliariaId,
      },
    });

    if (existingStatus) {
      return NextResponse.json(
        { message: "Já existe um status com este nome nesta imobiliária" },
        { status: 400 }
      );
    }

    // Criar o status
    const newStatus = await prisma.statusCustom.create({
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        cor: validatedData.cor,
        ativo: validatedData.ativo,
        imobiliariaId: imobiliariaId,
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

    return NextResponse.json(
      {
        message: "Status cadastrado com sucesso",
        status: newStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imobiliariaIdParam = searchParams.get("imobiliariaId");

    let whereClause: any = {};

    if (session.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode ver todos os status ou filtrar por imobiliária
      if (imobiliariaIdParam) {
        whereClause.imobiliariaId = imobiliariaIdParam;
      }
    } else {
      // Outros usuários só podem ver status da sua imobiliária
      if (!session.user.imobiliariaId) {
        return NextResponse.json(
          { message: "Usuário não está vinculado a uma imobiliária" },
          { status: 400 }
        );
      }
      whereClause.imobiliariaId = session.user.imobiliariaId;
    }

    const statusList = await prisma.statusCustom.findMany({
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
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json({
      statusList,
    });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}