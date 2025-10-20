import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🚀 [API Upload] Requisição de upload recebida');
  
  try {
    // Verificar autenticação
    console.log('🔐 [API Upload] Verificando autenticação...');
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      console.log('❌ [API Upload] Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ [API Upload] Usuário autenticado:', {
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email
    });

    // Verificar se o usuário tem permissão (CORRETOR ou ADMIN)
    if (!session.user.role || !['CORRETOR', 'ADMIN', 'ADMFULL'].includes(session.user.role)) {
      console.log('❌ [API Upload] Permissão negada para role:', session.user.role);
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    console.log('📦 [API Upload] Extraindo arquivo do FormData...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ [API Upload] Nenhum arquivo encontrado no FormData');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    console.log('📄 [API Upload] Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validar tipo de arquivo (permitir documentos comuns)
    console.log('🔍 [API Upload] Validando tipo de arquivo...');
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('❌ [API Upload] Tipo de arquivo não permitido:', file.type);
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT' 
      }, { status: 400 });
    }

    console.log('✅ [API Upload] Tipo de arquivo válido:', file.type);

    // Validar tamanho do arquivo (máximo 10MB)
    console.log('📏 [API Upload] Validando tamanho do arquivo...');
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('❌ [API Upload] Arquivo muito grande:', file.size, 'bytes (máximo:', maxSize, 'bytes)');
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 10MB' 
      }, { status: 400 });
    }

    console.log('✅ [API Upload] Tamanho do arquivo válido:', file.size, 'bytes');

    // Converter arquivo para Buffer
    console.log('🔄 [API Upload] Convertendo arquivo para Buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ [API Upload] Buffer criado com tamanho:', buffer.length, 'bytes');

    // Definir pasta baseada no role do usuário
    const folder = session.user.role === 'CORRETOR' ? 'corretor-files' : 'admin-files';
    console.log('📁 [API Upload] Pasta de destino definida:', folder);

    // Fazer upload para S3
    console.log('☁️ [API Upload] Iniciando upload para AWS S3...');
    console.log('📤 [API Upload] Parâmetros do upload:', {
      fileName: file.name,
      fileType: file.type,
      bufferSize: buffer.length,
      folder: folder
    });

    const uploadResult = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      folder
    );

    console.log('📡 [API Upload] Resultado do upload S3:', uploadResult);

    if (!uploadResult.success) {
      console.log('❌ [API Upload] Falha no upload para S3:', uploadResult.error);
      return NextResponse.json({ 
        error: 'Erro ao fazer upload do arquivo: ' + uploadResult.error 
      }, { status: 500 });
    }

    console.log('🎉 [API Upload] Upload para S3 bem-sucedido!');
    console.log('🔗 [API Upload] URL do arquivo:', uploadResult.url);
    console.log('🔑 [API Upload] Chave do arquivo:', uploadResult.key);

    // Retornar informações do arquivo
    const responseData = {
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        key: uploadResult.key,
        url: uploadResult.url,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      }
    };

    console.log('📋 [API Upload] Resposta final:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 [API Upload] Erro no upload:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Configuração para permitir arquivos grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};