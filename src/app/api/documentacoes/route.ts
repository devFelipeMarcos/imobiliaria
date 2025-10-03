import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const documentacaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  obrigatoriedade: z.enum(["OBRIGATORIO", "OPCIONAL", "NAO_APLICAVEL"], {
    errorMap: () => ({ message: "Obrigatoriedade deve ser OBRIGATORIO, OPCIONAL ou NAO_APLICAVEL" }),
  }),
  ativo: z.boolean().default(true),
});

// GET - Listar documentações
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user;

    // Verificar se o usuário tem permissão (admin, admfull ou corretor para leitura)
    if (!user.role || !["ADMIN", "ADMFULL", "CORRETOR"].includes(user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar documentações da imobiliária do usuário
    const documentacoes = await prisma.documentacao.findMany({
      where: {
        imobiliariaId: user.imobiliariaId,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(documentacoes);
  } catch (error) {
    console.error("Erro ao buscar documentações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova documentação
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user;

    // Verificar se o usuário tem permissão (admin ou admfull)
    if (!user.role || !["ADMIN", "ADMFULL"].includes(user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = documentacaoSchema.parse(body);

    // Verificar se já existe uma documentação com o mesmo nome na imobiliária
    const existingDoc = await prisma.documentacao.findFirst({
      where: {
        nome: validatedData.nome,
        imobiliariaId: user.imobiliariaId,
      },
    });

    if (existingDoc) {
      return NextResponse.json(
        { error: "Já existe uma documentação com este nome" },
        { status: 400 }
      );
    }

    const documentacao = await prisma.documentacao.create({
      data: {
        ...validatedData,
        imobiliariaId: user.imobiliariaId,
      },
    });

    return NextResponse.json(documentacao, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar documentação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}