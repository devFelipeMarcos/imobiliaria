'use server'

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { logLeadCreated } from '@/app/audit/actions'

export async function getCorretorInfo(corretorId: string) {
  try {
    const corretor = await prisma.user.findUnique({
      where: {
        id: corretorId,
        role: 'CORRETOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        imobiliaria: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    if (!corretor) {
      return { success: false, error: 'Corretor não encontrado ou inativo' }
    }

    if (!corretor.imobiliaria) {
      return { success: false, error: 'Corretor não possui imobiliária ativa associada' }
    }

    return { success: true, data: corretor }
  } catch (error) {
    console.error('Erro ao buscar informações do corretor:', error)
    return { success: false, error: 'Erro ao buscar informações do corretor' }
  }
}

export async function createLeadForCorretor(data: {
  nome: string
  telefone: string
  corretorId: string
  imobiliariaId: string
}) {
  try {
    // Verificar se o corretor existe e está ativo
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