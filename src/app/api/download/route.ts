import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl, deleteFileFromS3 } from '@/lib/s3';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (!session.user.role || !['CORRETOR', 'ADMIN', 'ADMFULL'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Chave do arquivo não fornecida' }, { status: 400 });
    }

    // Verificar se o usuário tem permissão para acessar o arquivo
    // Corretores só podem acessar arquivos da pasta corretor-files
    // Admins podem acessar qualquer arquivo
    if (session.user.role === 'CORRETOR' && !key.startsWith('corretor-files/')) {
      return NextResponse.json({ error: 'Acesso negado a este arquivo' }, { status: 403 });
    }

    // Gerar URL de download
    const downloadResult = await getDownloadUrl(key, 3600); // 1 hora de expiração

    if (!downloadResult.success) {
      return NextResponse.json({ 
        error: 'Erro ao gerar URL de download: ' + downloadResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: downloadResult.url,
      expiresIn: 3600, // 1 hora
    });

  } catch (error) {
    console.error('Erro no download:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão
    if (!session.user.role || !['CORRETOR', 'ADMIN', 'ADMFULL'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Chave do arquivo não fornecida' }, { status: 400 });
    }

    // Verificar se o usuário tem permissão para deletar o arquivo
    // Corretores só podem deletar arquivos da pasta corretor-files
    // Admins podem deletar qualquer arquivo
    if (session.user.role === 'CORRETOR' && !key.startsWith('corretor-files/')) {
      return NextResponse.json({ error: 'Acesso negado para deletar este arquivo' }, { status: 403 });
    }

    // Deletar arquivo do S3
    const deleteResult = await deleteFileFromS3(key);

    if (!deleteResult.success) {
      return NextResponse.json({ 
        error: 'Erro ao deletar arquivo: ' + deleteResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}