import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateDocumentacaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  obrigatoriedade: z.enum(["OBRIGATORIO", "OPCIONAL", "NAO_APLICAVEL"], {
    errorMap: () => ({ message: "Obrigatoriedade deve ser OBRIGATORIO, OPCIONAL ou NAO_APLICAVEL" }),
  }).optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar documentação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const documentacao = await prisma.documentacao.findFirst({
      where: {
        id: params.id,
        imobiliariaId: user.imobiliariaId,
      },
    });

    if (!documentacao) {
      return NextResponse.json(
        { error: "Documentação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(documentacao);
  } catch (error) {
    console.error("Erro ao buscar documentação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar documentação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateDocumentacaoSchema.parse(body);

    // Verificar se a documentação existe e pertence à imobiliária do usuário
    const existingDoc = await prisma.documentacao.findFirst({
      where: {
        id: params.id,
        imobiliariaId: user.imobiliariaId,
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Documentação não encontrada" },
        { status: 404 }
      );
    }

    // Se está alterando o nome, verificar se não existe outro com o mesmo nome
    if (validatedData.nome && validatedData.nome !== existingDoc.nome) {
      const duplicateDoc = await prisma.documentacao.findFirst({
        where: {
          nome: validatedData.nome,
          imobiliariaId: user.imobiliariaId,
          id: { not: params.id },
        },
      });

      if (duplicateDoc) {
        return NextResponse.json(
          { error: "Já existe uma documentação com este nome" },
          { status: 400 }
        );
      }
    }

    const documentacao = await prisma.documentacao.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(documentacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar documentação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar documentação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se a documentação existe e pertence à imobiliária do usuário
    const existingDoc = await prisma.documentacao.findFirst({
      where: {
        id: params.id,
        imobiliariaId: user.imobiliariaId,
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Documentação não encontrada" },
        { status: 404 }
      );
    }

    await prisma.documentacao.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Documentação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar documentação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}