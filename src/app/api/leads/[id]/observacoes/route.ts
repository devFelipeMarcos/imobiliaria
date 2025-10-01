import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verificar se o lead existe e se o usuário tem permissão
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        imobiliariaId: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isOwner = lead.userId === session.user.id;
    const isSameImobiliaria = lead.imobiliariaId === session.user.imobiliariaId;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAdmFull = session.user.role === "ADMFULL";

    if (!isOwner && !isSameImobiliaria && !isSuperAdmin && !isAdmFull) {
      return NextResponse.json(
        { error: "Sem permissão para acessar as observações deste lead" },
        { status: 403 }
      );
    }

    // Buscar observações do lead
    const observacoes = await prisma.leadObservacao.findMany({
      where: { leadId: id },
      include: {
        usuario: {
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
    });

    return NextResponse.json(observacoes);
  } catch (error) {
    console.error("Erro ao buscar observações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { observacao, statusId } = body;

    if (!observacao || observacao.trim() === "") {
      return NextResponse.json(
        { error: "Observação é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se o lead existe e se o usuário tem permissão
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isOwner = lead.userId === session.user.id;
    const isSameImobiliaria = lead.imobiliariaId === session.user.imobiliariaId;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAdmFull = session.user.role === "ADMFULL";

    if (!isOwner && !isSameImobiliaria && !isSuperAdmin && !isAdmFull) {
      return NextResponse.json(
        { error: "Sem permissão para adicionar observações a este lead" },
        { status: 403 }
      );
    }

    let statusAnterior = null;
    let statusNovo = null;
    let tipoAcao = "OBSERVACAO";

    // Se foi fornecido um novo status, atualizar o lead
    if (statusId && statusId !== lead.statusId) {
      const novoStatus = await prisma.statusCustom.findUnique({
        where: { id: statusId },
      });

      if (!novoStatus) {
        return NextResponse.json(
          { error: "Status não encontrado" },
          { status: 400 }
        );
      }

      statusAnterior = lead.status?.nome || null;
      statusNovo = novoStatus.nome;
      tipoAcao = "MUDANCA_STATUS";

      // Atualizar o status do lead
      await prisma.lead.update({
        where: { id },
        data: { statusId },
      });

      // Registrar no audit log
      await prisma.auditLog.create({
        data: {
          acao: "UPDATE",
          entidade: "Lead",
          entidadeId: id,
          descricao: `Status do lead alterado de "${statusAnterior}" para "${statusNovo}"`,
          dadosAntigos: {
            statusId: lead.statusId,
            status: statusAnterior,
          },
          dadosNovos: {
            statusId: statusId,
            status: statusNovo,
          },
          usuarioId: session.user.id,
        },
      });
    }

    // Criar a observação
    const novaObservacao = await prisma.leadObservacao.create({
      data: {
        leadId: id,
        usuarioId: session.user.id,
        observacao: observacao.trim(),
        statusAnterior,
        statusNovo,
        tipoAcao,
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(novaObservacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar observação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}