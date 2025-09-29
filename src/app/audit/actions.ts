'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT';

interface CreateAuditLogParams {
  acao: ActionType;
  entidade: string;
  entidadeId?: string;
  descricao: string;
  dadosAntigos?: any;
  dadosNovos?: any;
  alvoUsuarioId?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';

    const auditLog = await prisma.auditLog.create({
      data: {
        acao: params.acao,
        entidade: params.entidade,
        entidadeId: params.entidadeId,
        descricao: params.descricao,
        dadosAntigos: params.dadosAntigos ? JSON.parse(JSON.stringify(params.dadosAntigos)) : null,
        dadosNovos: params.dadosNovos ? JSON.parse(JSON.stringify(params.dadosNovos)) : null,
        ipAddress,
        userAgent,
        usuarioId: session?.user?.id,
        alvoUsuarioId: params.alvoUsuarioId,
      },
    });

    return { success: true, data: auditLog };
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    return { success: false, error: 'Erro ao criar log de auditoria' };
  }
}

export async function getAuditLogs(page = 1, limit = 50, filters?: {
  entidade?: string;
  acao?: ActionType;
  usuarioId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado' };
    }

    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters?.entidade) {
      where.entidade = filters.entidade;
    }
    
    if (filters?.acao) {
      where.acao = filters.acao;
    }
    
    if (filters?.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          alvoUsuario: {
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
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return { success: false, error: 'Erro ao buscar logs de auditoria' };
  }
}

export async function getAuditLogById(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado' };
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        alvoUsuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      return { success: false, error: 'Log não encontrado' };
    }

    return { success: true, data: log };
  } catch (error) {
    console.error('Erro ao buscar log de auditoria:', error);
    return { success: false, error: 'Erro ao buscar log de auditoria' };
  }
}

// Funções auxiliares para facilitar o uso
export async function logLeadCreated(leadData: any, leadId: string) {
  return createAuditLog({
    acao: 'CREATE',
    entidade: 'Lead',
    entidadeId: leadId,
    descricao: `Lead "${leadData.nome}" foi criado`,
    dadosNovos: leadData,
  });
}

export async function logLeadUpdated(oldData: any, newData: any, leadId: string) {
  return createAuditLog({
    acao: 'UPDATE',
    entidade: 'Lead',
    entidadeId: leadId,
    descricao: `Lead "${newData.nome}" foi atualizado`,
    dadosAntigos: oldData,
    dadosNovos: newData,
  });
}

export async function logLeadDeleted(leadData: any, leadId: string) {
  return createAuditLog({
    acao: 'DELETE',
    entidade: 'Lead',
    entidadeId: leadId,
    descricao: `Lead "${leadData.nome}" foi excluído`,
    dadosAntigos: leadData,
  });
}

export async function logUserLogin(userId: string) {
  return createAuditLog({
    acao: 'LOGIN',
    entidade: 'User',
    entidadeId: userId,
    descricao: 'Usuário fez login no sistema',
    alvoUsuarioId: userId,
  });
}

export async function logUserLogout(userId: string) {
  return await createAuditLog({
    acao: 'LOGOUT',
    entidade: 'User',
    entidadeId: userId,
    descricao: `Usuário fez logout`,
    alvoUsuarioId: userId,
  });
}

export async function logUserRegistration(userId: string) {
  return await createAuditLog({
    acao: 'CREATE',
    entidade: 'User',
    entidadeId: userId,
    descricao: `Novo usuário registrado`,
    alvoUsuarioId: userId,
  });
}