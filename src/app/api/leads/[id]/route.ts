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

    // Buscar o lead com todas as informações necessárias
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
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
        status: {
          select: {
            id: true,
            nome: true,
            cor: true,
            descricao: true,
          },
        },
        observacoes: {
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
        },
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
        { error: "Sem permissão para acessar este lead" },
        { status: 403 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Erro ao buscar lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { statusId, observacao } = body;

    // Buscar o lead atual
    const leadAtual = await prisma.lead.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });

    if (!leadAtual) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isOwner = leadAtual.userId === session.user.id;
    const isSameImobiliaria = leadAtual.imobiliariaId === session.user.imobiliariaId;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAdmFull = session.user.role === "ADMFULL";

    if (!isOwner && !isSameImobiliaria && !isSuperAdmin && !isAdmFull) {
      return NextResponse.json(
        { error: "Sem permissão para alterar este lead" },
        { status: 403 }
      );
    }

    // Atualizar o lead se houver mudança de status
    let leadAtualizado = leadAtual;
    if (statusId && statusId !== leadAtual.statusId) {
      leadAtualizado = await prisma.lead.update({
        where: { id },
        data: { statusId },
        include: {
          status: true,
        },
      });
    }

    // Criar observação se fornecida ou se houve mudança de status
    if (observacao || (statusId && statusId !== leadAtual.statusId)) {
      const statusAnterior = leadAtual.status?.nome || null;
      const statusNovo = leadAtualizado.status?.nome || null;
      
      await prisma.leadObservacao.create({
        data: {
          leadId: id,
          usuarioId: session.user.id,
          observacao: observacao || `Status alterado de "${statusAnterior}" para "${statusNovo}"`,
          statusAnterior,
          statusNovo: statusId && statusId !== leadAtual.statusId ? statusNovo : null,
          tipoAcao: statusId && statusId !== leadAtual.statusId ? "MUDANCA_STATUS" : "OBSERVACAO",
        },
      });

      // Registrar no audit log
      await prisma.auditLog.create({
        data: {
          acao: "UPDATE",
          entidade: "Lead",
          entidadeId: id,
          descricao: statusId && statusId !== leadAtual.statusId 
            ? `Status do lead alterado de "${statusAnterior}" para "${statusNovo}"`
            : "Observação adicionada ao lead",
          dadosAntigos: {
            statusId: leadAtual.statusId,
            status: statusAnterior,
          },
          dadosNovos: {
            statusId: leadAtualizado.statusId,
            status: statusNovo,
            observacao,
          },
          usuarioId: session.user.id,
        },
      });
    }

    // Buscar o lead atualizado com todas as informações
    const leadCompleto = await prisma.lead.findUnique({
      where: { id },
      include: {
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
        status: {
          select: {
            id: true,
            nome: true,
            cor: true,
            descricao: true,
          },
        },
        observacoes: {
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
        },
      },
    });

    return NextResponse.json(leadCompleto);
  } catch (error) {
    console.error("Erro ao atualizar lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}