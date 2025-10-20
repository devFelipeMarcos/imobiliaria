import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
    secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKETNAME!;

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Faz upload de um arquivo para o S3
 */
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  console.log('🚀 [S3] Iniciando upload para S3');
  console.log('📋 [S3] Parâmetros recebidos:', {
    fileName,
    contentType,
    folder,
    fileSize: file.length,
    bucketName: BUCKET_NAME
  });

  try {
    // Verificar variáveis de ambiente
    console.log('🔧 [S3] Verificando configurações AWS...');
    console.log('🌍 [S3] Region:', process.env.NEXT_PUBLIC_REGION);
    console.log('🪣 [S3] Bucket:', BUCKET_NAME);
    console.log('🔑 [S3] Access Key ID:', process.env.NEXT_PUBLIC_ACCESSKEYID ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('🔐 [S3] Secret Access Key:', process.env.NEXT_PUBLIC_SECRETACCESSKEY ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('🔗 [S3] S3 URL:', process.env.NEXT_PUBLIC_S3URL);

    // Gera uma chave única para o arquivo
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${fileName}`;
    console.log('🔑 [S3] Chave gerada:', key);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL removido - bucket não permite ACLs
    });

    console.log('📤 [S3] Enviando comando PutObject para S3...');
    console.log('📋 [S3] Detalhes do comando:', {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'Removido (bucket não permite ACLs)',
      BodySize: file.length
    });

    await s3Client.send(command);
    console.log('✅ [S3] Comando enviado com sucesso!');

    const url = `${process.env.NEXT_PUBLIC_S3URL}${key}`;
    console.log('🔗 [S3] URL final gerada:', url);

    const result = {
      success: true,
      key,
      url,
    };

    console.log('🎉 [S3] Upload concluído com sucesso:', result);
    return result;
  } catch (error) {
    console.error('💥 [S3] Erro ao fazer upload para S3:', error);
    console.error('📊 [S3] Detalhes do erro:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Gera uma URL assinada para download de um arquivo
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<DownloadResult> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Deleta um arquivo do S3
 */
export async function deleteFileFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar arquivo do S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Extrai a chave do arquivo a partir da URL completa
 */
export function extractKeyFromUrl(url: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_S3URL!;
  return url.replace(baseUrl, '');
}

export { s3Client, BUCKET_NAME };