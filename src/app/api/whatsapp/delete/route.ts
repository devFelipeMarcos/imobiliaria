import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WhatsAppStatus } from '@/generated/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é um corretor
    if (session.user.role !== 'CORRETOR') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas corretores podem deletar instâncias do WhatsApp.' },
        { status: 403 }
      );
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        imobiliaria: true,
        whatsappInstance: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se existe uma instância para este corretor
    if (!user.whatsappInstance) {
      return NextResponse.json(
        { error: 'Nenhuma instância do WhatsApp encontrada para este corretor' },
        { status: 404 }
      );
    }

    const instance = user.whatsappInstance;

    // Deletar instância no Evolution API
    try {
      const evolutionResponse = await fetch(
        `https://evo.admfelipemarcos.site/instance/delete/${instance.instanceName}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': process.env.API_KEY_EVO!
          }
        }
      );

      if (!evolutionResponse.ok) {
        const errorData = await evolutionResponse.text();
        console.error('Erro ao deletar instância no Evolution API:', errorData);
        // Continua para deletar do banco mesmo se falhar na API
      }
    } catch (evolutionError) {
      console.error('Erro ao conectar com Evolution API:', evolutionError);
      // Continua para deletar do banco mesmo se falhar na API
    }

    // Atualizar status da instância no banco para DELETED
    await prisma.whatsAppInstance.update({
      where: { id: instance.id },
      data: {
        status: WhatsAppStatus.DELETED,
        connected: false,
        qrCode: null,
        phoneNumber: null,
        profileName: null,
        errorMessage: 'Instância deletada pelo usuário'
      }
    });

    // Deletar instância do banco de dados
    await prisma.whatsAppInstance.delete({
      where: { id: instance.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Instância do WhatsApp deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar instância do WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}