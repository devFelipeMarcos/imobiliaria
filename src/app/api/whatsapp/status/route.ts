import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
        { error: 'Acesso negado. Apenas corretores podem verificar status do WhatsApp.' },
        { status: 403 }
      );
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { whatsappInstance: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Se não tem instância, retorna null
    if (!user.whatsappInstance) {
      return NextResponse.json({
        hasInstance: false,
        instance: null
      });
    }

    const instance = user.whatsappInstance;

    // Tentar obter status atualizado do Evolution API
    try {
      const evolutionResponse = await fetch(
        `https://evo.admfelipemarcos.site/instance/fetchInstances?instanceName=${instance.instanceName}`,
        {
          method: 'GET',
          headers: {
            'apikey': process.env.API_KEY_EVO!
          }
        }
      );

      if (evolutionResponse.ok) {
        const evolutionData = await evolutionResponse.json();
        
        // Atualizar dados da instância se necessário
        if (evolutionData && evolutionData.length > 0) {
          const instanceData = evolutionData[0];
          
          await prisma.whatsAppInstance.update({
            where: { id: instance.id },
            data: {
              connected: instanceData.connectionStatus === 'open',
              phoneNumber: instanceData.profilePictureUrl || instance.phoneNumber,
              profileName: instanceData.profileName || instance.profileName,
              updatedAt: new Date()
            }
          });
        }
      }
    } catch (evolutionError) {
      console.error('Erro ao obter status do Evolution API:', evolutionError);
      // Continua com os dados do banco
    }

    // Buscar dados atualizados
    const updatedInstance = await prisma.whatsAppInstance.findUnique({
      where: { id: instance.id }
    });

    return NextResponse.json({
      hasInstance: true,
      instance: updatedInstance
    });

  } catch (error) {
    console.error('Erro ao obter status da instância do WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}