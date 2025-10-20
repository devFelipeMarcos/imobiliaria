import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDownloadUrl, extractKeyFromUrl } from '@/lib/s3';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    console.log('🔍 [DOWNLOAD] Iniciando processo de download');
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      console.log('❌ [DOWNLOAD] Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ [DOWNLOAD] Usuário autenticado:', session.user.id);

    const { id: leadId, docId } = await context.params;
    console.log('📋 [DOWNLOAD] Parâmetros:', { leadId, docId });

    // Verificar se o lead existe e se o usuário tem acesso
    console.log('🔍 [DOWNLOAD] Buscando lead no banco...');
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      console.log('❌ [DOWNLOAD] Lead não encontrado:', leadId);
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    console.log('✅ [DOWNLOAD] Lead encontrado:', lead.id);

    // Verificar permissões
    const role = session.user.role || '';
    const isCorretor = role === 'CORRETOR' && lead.userId === session.user.id;
    const isAdmImobiliaria = ['ADMIN', 'ADMFULL'].includes(role) && lead.imobiliariaId === session.user.imobiliariaId;
    const isSuperAdmin = role === 'SUPER_ADMIN';

    console.log('🔐 [DOWNLOAD] Verificando permissões:', {
      userRole: role,
      userId: session.user.id,
      leadUserId: lead.userId,
      leadImobiliariaId: lead.imobiliariaId,
      userImobiliariaId: session.user.imobiliariaId,
      isCorretor,
      isAdmImobiliaria,
      isSuperAdmin
    });

    if (!isCorretor && !isAdmImobiliaria && !isSuperAdmin) {
      console.log('❌ [DOWNLOAD] Acesso negado para usuário');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    console.log('✅ [DOWNLOAD] Permissões verificadas');

    // Buscar o documento
    console.log('🔍 [DOWNLOAD] Buscando documento no banco...');
    const documento = await prisma.leadDocumento.findUnique({
      where: { id: docId },
      include: {
        documentacao: true,
      },
    });

    if (!documento) {
      console.log('❌ [DOWNLOAD] Documento não encontrado:', docId);
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    console.log('✅ [DOWNLOAD] Documento encontrado:', {
      id: documento.id,
      nomeArquivo: documento.nomeArquivo,
      urlS3: documento.urlS3,
      leadId: documento.leadId
    });

    // Verificar se o documento pertence ao lead correto
    if (documento.leadId !== leadId) {
      console.log('❌ [DOWNLOAD] Documento não pertence ao lead:', { documentoLeadId: documento.leadId, leadId });
      return NextResponse.json({ error: 'Documento não pertence a este lead' }, { status: 403 });
    }

    // Extrair a chave do S3 da URL
    console.log('🔑 [DOWNLOAD] Extraindo chave do S3 da URL:', documento.urlS3);
    const key = extractKeyFromUrl(documento.urlS3);
    console.log('🔑 [DOWNLOAD] Chave extraída:', key);

    // Gerar URL assinada para download (válida por 1 hora)
    console.log('🔗 [DOWNLOAD] Gerando URL assinada...');
    const downloadResult = await getDownloadUrl(key, 3600);

    if (!downloadResult.success) {
      console.log('❌ [DOWNLOAD] Erro ao gerar URL assinada:', downloadResult.error);
      return NextResponse.json({ 
        error: 'Erro ao gerar URL de download: ' + downloadResult.error 
      }, { status: 500 });
    }

    console.log('✅ [DOWNLOAD] URL assinada gerada com sucesso');

    const response = {
      downloadUrl: downloadResult.url,
      nomeArquivo: documento.nomeArquivo,
      tipoMime: documento.tipoMime,
      tamanho: documento.tamanho,
    };

    console.log('📤 [DOWNLOAD] Retornando resposta:', response);

    // Retornar a URL assinada
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [DOWNLOAD] Erro ao gerar download:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}