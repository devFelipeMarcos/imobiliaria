import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de lista de transmissão
const createBroadcastListSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  contatos: z.array(z.object({
    nome: z.string().min(1, 'Nome do contato é obrigatório'),
    telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos')
  })).min(1, 'Pelo menos um contato é obrigatório'),
  whatsappInstanceId: z.string().optional()
})

// GET - Listar todas as listas de transmissão do usuário
export async function GET(request: NextRequest) {
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

    const broadcastLists = await prisma.broadcastList.findMany({
      where: {
        userId: user.id,
        imobiliariaId: user.imobiliariaId,
        ativo: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(broadcastLists)
  } catch (error) {
    console.error('Erro ao buscar listas de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova lista de transmissão
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createBroadcastListSchema.parse(body)

    // Verificar se já existe uma lista com o mesmo nome para este usuário
    const existingList = await prisma.broadcastList.findFirst({
      where: {
        nome: validatedData.nome,
        userId: user.id,
        imobiliariaId: user.imobiliariaId,
        ativo: true
      }
    })

    if (existingList) {
      return NextResponse.json({ error: 'Já existe uma lista com este nome' }, { status: 400 })
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

    const broadcastList = await prisma.broadcastList.create({
      data: {
        nome: validatedData.nome,
        mensagem: validatedData.mensagem,
        contatos: validatedData.contatos,
        userId: user.id,
        imobiliariaId: user.imobiliariaId,
        whatsappInstanceId: validatedData.whatsappInstanceId || null
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

    return NextResponse.json(broadcastList, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    
    console.error('Erro ao criar lista de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}