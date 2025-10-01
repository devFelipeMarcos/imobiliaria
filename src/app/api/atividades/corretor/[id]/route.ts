import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID do corretor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão (admin ou o próprio corretor)
    if (session.user.role !== 'ADMIN') {
      // Se não for admin, verificar se é o próprio corretor
      if (session.user.id !== id) {
        return NextResponse.json(
          { message: 'Acesso negado' },
          { status: 403 }
        );
      }
    }

    // Buscar atividades recentes relacionadas ao corretor
    const atividades = await prisma.auditLog.findMany({
      where: {
        OR: [
          // Ações realizadas pelo corretor (usuário)
          {
            usuarioId: id
          },
          // Ações relacionadas aos leads do corretor
          {
            entidade: 'Lead',
            entidadeId: {
              in: await prisma.lead.findMany({
                where: { userId: id },
                select: { id: true }
              }).then(leads => leads.map(lead => lead.id))
            }
          },
          // Ações relacionadas ao próprio usuário
          {
            entidade: 'User',
            entidadeId: id
          }
        ]
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Últimas 10 atividades
    });

    // Formatar as atividades para exibição
    const atividadesFormatadas = atividades.map(atividade => ({
      id: atividade.id,
      acao: atividade.acao,
      entidade: atividade.entidade,
      descricao: atividade.descricao,
      usuario: atividade.usuario?.name || 'Sistema',
      createdAt: atividade.createdAt,
      tipo: getActivityType(atividade.acao, atividade.entidade),
      icone: getActivityIcon(atividade.acao, atividade.entidade),
    }));

    return NextResponse.json({
      success: true,
      data: atividadesFormatadas,
    });

  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getActivityType(acao: string, entidade: string): string {
  const tipos: Record<string, string> = {
    'CREATE_Lead': 'lead_criado',
    'UPDATE_Lead': 'lead_atualizado',
    'DELETE_Lead': 'lead_removido',
    'CREATE_Corretor': 'corretor_criado',
    'UPDATE_Corretor': 'corretor_atualizado',
    'LOGIN_User': 'login',
    'LOGOUT_User': 'logout',
    'VIEW_Lead': 'lead_visualizado',
    'EXPORT_Lead': 'lead_exportado',
  };

  return tipos[`${acao}_${entidade}`] || 'atividade_geral';
}

function getActivityIcon(acao: string, entidade: string): string {
  const icones: Record<string, string> = {
    'CREATE_Lead': '👤',
    'UPDATE_Lead': '✏️',
    'DELETE_Lead': '🗑️',
    'CREATE_Corretor': '🏢',
    'UPDATE_Corretor': '⚙️',
    'LOGIN_User': '🔐',
    'LOGOUT_User': '🚪',
    'VIEW_Lead': '👁️',
    'EXPORT_Lead': '📊',
  };

  return icones[`${acao}_${entidade}`] || '📋';
}