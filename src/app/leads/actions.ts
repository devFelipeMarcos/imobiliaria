'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { logLeadCreated } from '@/app/audit/actions'

export async function getCorretores() {
  try {
    const corretores = await prisma.corretor.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc'
      }
    })
    
    return { success: true, data: corretores }
  } catch (error) {
    console.error('Erro ao buscar corretores:', error)
    return { success: false, error: 'Erro ao buscar corretores' }
  }
}

export async function createLead(data: {
  nome: string
  telefone: string
  corretorId: string
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        corretorId: data.corretorId,
      },
      include: {
        corretor: {
          select: {
            nome: true
          }
        }
      }
    })
    
    // Log da criação do lead
    await logLeadCreated(lead, lead.id)
    
    return { success: true, data: lead }
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return { success: false, error: 'Erro ao criar lead' }
  }
}

export async function getLeadsByCorretor() {
  try {
    // Obter sessão do usuário logado
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar o corretor associado ao usuário logado
    const corretor = await prisma.corretor.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!corretor) {
      return { success: false, error: 'Corretor não encontrado para este usuário' }
    }

    // Buscar leads do corretor
    const leads = await prisma.lead.findMany({
      where: {
        corretorId: corretor.id
      },
      include: {
        corretor: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: leads }
  } catch (error) {
    console.error('Erro ao buscar leads do corretor:', error)
    return { success: false, error: 'Erro ao buscar leads do corretor' }
  }
}

export async function getAllLeads() {
  try {
    // Verificar se o usuário tem permissão (ADMIN ou CORRETOR)
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const user = session.user as any
    if (user.role !== 'ADMIN' && user.role !== 'CORRETOR') {
      return { success: false, error: 'Sem permissão para visualizar todos os leads' }
    }

    // Buscar todos os leads
    const leads = await prisma.lead.findMany({
      include: {
        corretor: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: leads }
  } catch (error) {
    console.error('Erro ao buscar todos os leads:', error)
    return { success: false, error: 'Erro ao buscar todos os leads' }
  }
}