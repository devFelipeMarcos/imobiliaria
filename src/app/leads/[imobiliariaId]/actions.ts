'use server'

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { logLeadCreated } from '@/app/audit/actions'

export async function getCorretoresByImobiliaria(imobiliariaId: string) {
  try {
    const corretores = await prisma.user.findMany({
      where: {
        role: 'CORRETOR',
        imobiliariaId: imobiliariaId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return { success: true, data: corretores }
  } catch (error) {
    console.error('Erro ao buscar corretores da imobiliária:', error)
    return { success: false, error: 'Erro ao buscar corretores da imobiliária' }
  }
}

export async function createLeadForImobiliaria(data: {
  nome: string
  telefone: string
  corretorId: string
  imobiliariaId: string
}) {
  try {
    // Verificar se a imobiliária existe e está ativa
    const imobiliaria = await prisma.imobiliaria.findFirst({
      where: {
        id: data.imobiliariaId,
        ativo: true
      }
    })

    if (!imobiliaria) {
      throw new Error('Imobiliária não encontrada ou inativa')
    }

    // Verificar se o corretor existe e está vinculado à imobiliária
    const corretor = await prisma.user.findFirst({
      where: {
        id: data.corretorId,
        role: 'CORRETOR',
        imobiliariaId: data.imobiliariaId,
      }
    })

    if (!corretor) {
      throw new Error('Corretor não encontrado ou não pertence a esta imobiliária')
    }

    const lead = await prisma.lead.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        userId: data.corretorId,
        imobiliariaId: data.imobiliariaId,
      },
      include: {
        user: {
          select: {
            name: true
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

export async function getLeadsByImobiliaria(imobiliariaId: string) {
  try {
    // Buscar leads da imobiliária
    const leads = await prisma.lead.findMany({
      where: {
        imobiliariaId: imobiliariaId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: leads }
  } catch (error) {
    console.error('Erro ao buscar leads da imobiliária:', error)
    return { success: false, error: 'Erro ao buscar leads da imobiliária' }
  }
}

export async function getImobiliariaInfo(imobiliariaId: string) {
  try {
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: {
        id: imobiliariaId
      },
      select: {
        id: true,
        nome: true,
        ativo: true
      }
    })

    if (!imobiliaria) {
      return { success: false, error: 'Imobiliária não encontrada' }
    }

    if (!imobiliaria.ativo) {
      return { success: false, error: 'Imobiliária inativa' }
    }

    return { success: true, data: imobiliaria }
  } catch (error) {
    console.error('Erro ao buscar informações da imobiliária:', error)
    return { success: false, error: 'Erro ao buscar informações da imobiliária' }
  }
}