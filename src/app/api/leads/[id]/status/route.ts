import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { statusId } = await request.json();

    if (!statusId) {
      return NextResponse.json(
        { error: 'Status ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        corretor: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    // Verificar autorização - apenas admin ou o próprio corretor pode alterar
    if (session.user.role !== 'ADMIN' && session.user.id !== lead.corretor.userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verificar se o status existe
    const status = await prisma.statusCustom.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      return NextResponse.json(
        { error: 'Status não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o status do lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { statusId },
      include: {
        status: {
          select: {
            id: true,
            nome: true,
            cor: true,
            descricao: true,
          },
        },
        corretor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}