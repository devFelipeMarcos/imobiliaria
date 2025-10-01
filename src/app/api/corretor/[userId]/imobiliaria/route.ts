import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Buscar o usuário pelo userId na tabela user
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        imobiliaria: {
          select: {
            id: true,
            nome: true,
            ativo: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!user.imobiliaria) {
      return NextResponse.json(
        { error: 'Usuário não possui imobiliária associada' },
        { status: 404 }
      )
    }

    // Retornar as informações da imobiliária
    return NextResponse.json(user.imobiliaria)
  } catch (error) {
    console.error('Erro ao buscar imobiliária do corretor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}