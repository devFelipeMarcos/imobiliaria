import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Enviar mensagem para todos os contatos da lista
export async function POST(
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

    // Buscar a lista de transmissão
    const broadcastList = await prisma.broadcastList.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        imobiliariaId: user.imobiliariaId,
        ativo: true
      },
      include: {
        whatsappInstance: true
      }
    })

    if (!broadcastList) {
      return NextResponse.json({ error: 'Lista de transmissão não encontrada' }, { status: 404 })
    }

    // Verificar se há uma instância do WhatsApp associada e conectada
    if (!broadcastList.whatsappInstance) {
      return NextResponse.json({ 
        error: 'Nenhuma instância do WhatsApp associada a esta lista' 
      }, { status: 400 })
    }

    if (!broadcastList.whatsappInstance.connected) {
      return NextResponse.json({ 
        error: 'Instância do WhatsApp não está conectada' 
      }, { status: 400 })
    }

    const contatos = broadcastList.contatos as Array<{ nome: string; telefone: string }>
    
    if (!contatos || contatos.length === 0) {
      return NextResponse.json({ 
        error: 'Nenhum contato encontrado na lista' 
      }, { status: 400 })
    }

    const results = []
    const errors = []

    // Enviar mensagem para cada contato
    for (const contato of contatos) {
      try {
        // Formatar o número de telefone (remover caracteres especiais e adicionar código do país se necessário)
        let phoneNumber = contato.telefone.replace(/\D/g, '')
        
        // Se não começar com 55 (código do Brasil), adicionar
        if (!phoneNumber.startsWith('55')) {
          phoneNumber = '55' + phoneNumber
        }

        // Personalizar a mensagem com o nome do contato
        const personalizedMessage = broadcastList.mensagem.replace(/\{nome\}/g, contato.nome)

        // Fazer a requisição para a Evolution API
        const evolutionResponse = await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${broadcastList.whatsappInstance.instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.EVOLUTION_API_KEY || ''
          },
          body: JSON.stringify({
            number: phoneNumber,
            text: personalizedMessage
          })
        })

        if (evolutionResponse.ok) {
          const responseData = await evolutionResponse.json()
          results.push({
            contato: contato.nome,
            telefone: contato.telefone,
            status: 'enviado',
            messageId: responseData.key?.id || null
          })
        } else {
          const errorData = await evolutionResponse.json()
          errors.push({
            contato: contato.nome,
            telefone: contato.telefone,
            status: 'erro',
            error: errorData.message || 'Erro desconhecido'
          })
        }

        // Aguardar um pouco entre os envios para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${contato.nome}:`, error)
        errors.push({
          contato: contato.nome,
          telefone: contato.telefone,
          status: 'erro',
          error: 'Erro interno ao enviar mensagem'
        })
      }
    }

    return NextResponse.json({
      message: 'Processo de envio concluído',
      total: contatos.length,
      enviados: results.length,
      erros: errors.length,
      results,
      errors
    })

  } catch (error) {
    console.error('Erro ao enviar lista de transmissão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}