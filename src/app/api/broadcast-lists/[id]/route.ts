import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para atualização de lista de transmissão
const updateBroadcastListSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  mensagem: z.string().min(1, 'Mensagem é obrigatória').optional(),
  contatos: z.array(z.object({
    nome: z.string().min(1, 'Nome do contato é obrigatório'),
    telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos')
  })).min(1, 'Pelo menos um contato é obrigatório').optional(),
  whatsappInstanceId: z.string().optional(),
  ativo: z.boolean().optional()
})

// GET - Buscar lista de transmissão específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { imobiliaria: true }
    })

    if (!user || !user.imobiliariaId) {
      return NextResponse.json({ error: 'Usuário não encontrado ou não associado a uma imobiliária' }, { status: 404 })
    }

    const broadcastList = await prisma.broadcastList.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        imobiliariaId: user.imobiliariaId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        whatsappInstance: {
          select: {
            id: true,
            instanceName: true,
            connected: true
          }
        }
      }
    })

    if (!broadcastList) {
      return NextResponse.json({ error: 'Lista de transmissão não encontrada' }, { status: 404 })
    }

    return NextResponse.json(broadcastList)
  } catch (error) {
    console.error('Erro ao buscar lista de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar lista de transmissão
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { imobiliaria: true }
    })

    if (!user || !user.imobiliariaId) {
      return NextResponse.json({ error: 'Usuário não encontrado ou não associado a uma imobiliária' }, { status: 404 })
    }

    // Verificar se a lista existe e pertence ao usuário
    const existingList = await prisma.broadcastList.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        imobiliariaId: user.imobiliariaId
      }
    })

    if (!existingList) {
      return NextResponse.json({ error: 'Lista de transmissão não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateBroadcastListSchema.parse(body)

    // Se o nome está sendo alterado, verificar se já existe outra lista com o mesmo nome
    if (validatedData.nome && validatedData.nome !== existingList.nome) {
      const duplicateList = await prisma.broadcastList.findFirst({
        where: {
          nome: validatedData.nome,
          userId: user.id,
          imobiliariaId: user.imobiliariaId,
          ativo: true,
          id: { not: params.id }
        }
      })

      if (duplicateList) {
        return NextResponse.json({ error: 'Já existe uma lista com este nome' }, { status: 400 })
      }
    }

    // Se whatsappInstanceId foi fornecido, verificar se pertence ao usuário
    if (validatedData.whatsappInstanceId) {
      const whatsappInstance = await prisma.whatsAppInstance.findFirst({
        where: {
          id: validatedData.whatsappInstanceId,
          userId: user.id
        }
      })

      if (!whatsappInstance) {
        return NextResponse.json({ error: 'Instância do WhatsApp não encontrada' }, { status: 404 })
      }
    }

    const updatedBroadcastList = await prisma.broadcastList.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        whatsappInstance: {
          select: {
            id: true,
            instanceName: true,
            connected: true
          }
        }
      }
    })

    return NextResponse.json(updatedBroadcastList)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    
    console.error('Erro ao atualizar lista de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir lista de transmissão (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { imobiliaria: true }
    })

    if (!user || !user.imobiliariaId) {
      return NextResponse.json({ error: 'Usuário não encontrado ou não associado a uma imobiliária' }, { status: 404 })
    }

    // Verificar se a lista existe e pertence ao usuário
    const existingList = await prisma.broadcastList.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        imobiliariaId: user.imobiliariaId
      }
    })

    if (!existingList) {
      return NextResponse.json({ error: 'Lista de transmissão não encontrada' }, { status: 404 })
    }

    // Soft delete - marcar como inativo
    await prisma.broadcastList.update({
      where: { id: params.id },
      data: {
        ativo: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Lista de transmissão excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lista de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}