import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE - Deletar um documento específico
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: leadId, docId } = await context.params;

    // Verificar se o documento existe
    const documento = await prisma.leadDocumento.findUnique({
      where: { id: docId },
      include: {
        lead: {
          include: {
            user: true,
            imobiliaria: true,
          },
        },
      },
    });

    if (!documento) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Verificar se o documento pertence ao lead correto
    if (documento.leadId !== leadId) {
      return NextResponse.json({ error: "Documento não pertence a este lead" }, { status: 400 });
    }

    // Verificar permissões
    const isOwner = documento.lead.userId === session.user.id;
    const isFromSameImobiliaria = documento.lead.imobiliariaId === session.user.imobiliariaId;
    const isAdmin = ['ADMIN', 'ADMFULL'].includes(session.user.role || '');

    if (!isOwner && !isFromSameImobiliaria && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão para deletar este documento" }, { status: 403 });
    }

    // Deletar o documento do banco de dados
    await prisma.leadDocumento.delete({
      where: { id: docId },
    });

    return NextResponse.json({ message: "Documento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Buscar um documento específico (para download)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: leadId, docId } = await context.params;

    // Verificar se o documento existe
    const documento = await prisma.leadDocumento.findUnique({
      where: { id: docId },
      include: {
        lead: {
          include: {
            user: true,
            imobiliaria: true,
          },
        },
        documentacao: {
          select: {
            id: true,
            nome: true,
            obrigatoriedade: true,
          },
        },
        usuario: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!documento) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Verificar se o documento pertence ao lead correto
    if (documento.leadId !== leadId) {
      return NextResponse.json({ error: "Documento não pertence a este lead" }, { status: 400 });
    }

    // Verificar permissões
    const isOwner = documento.lead.userId === session.user.id;
    const isFromSameImobiliaria = documento.lead.imobiliariaId === session.user.imobiliariaId;
    const isAdmin = ['ADMIN', 'ADMFULL'].includes(session.user.role || '');

    if (!isOwner && !isFromSameImobiliaria && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão para acessar este documento" }, { status: 403 });
    }

    return NextResponse.json(documento);
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}