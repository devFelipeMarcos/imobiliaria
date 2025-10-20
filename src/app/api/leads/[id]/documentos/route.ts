import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { uploadFileToS3 } from "@/lib/s3";

// GET - Buscar documentos de um lead
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: leadId } = await context.params;

    // Verificar se o lead existe e se o usuário tem permissão
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: true,
        imobiliaria: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Verificar permissões
    const isOwner = lead.userId === session.user.id;
    const isFromSameImobiliaria = lead.imobiliariaId === session.user.imobiliariaId;
    const isAdmin = ['ADMIN', 'ADMFULL'].includes(session.user.role || '');

    if (!isOwner && !isFromSameImobiliaria && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão para acessar este lead" }, { status: 403 });
    }

    // Buscar documentos do lead
    const documentos = await prisma.leadDocumento.findMany({
      where: { leadId },
      include: {
        documentacao: {
          select: {
            id: true,
            nome: true,
            obrigatoriedade: true,
          },
        },
        usuario: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Salvar um novo documento
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: leadId } = await context.params;

    // Verificar se o lead existe e se o usuário tem permissão
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: true,
        imobiliaria: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Verificar permissões
    const isOwner = lead.userId === session.user.id;
    const isFromSameImobiliaria = lead.imobiliariaId === session.user.imobiliariaId;
    const isAdmin = ['ADMIN', 'ADMFULL'].includes(session.user.role || '');

    if (!isOwner && !isFromSameImobiliaria && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão para acessar este lead" }, { status: 403 });
    }

    // Extrair dados do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentacaoId = formData.get('documentacaoId') as string;

    if (!file || !documentacaoId) {
      return NextResponse.json({ 
        error: "Arquivo e tipo de documentação são obrigatórios" 
      }, { status: 400 });
    }

    // Validar tipo de arquivo (apenas PDF)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: "Apenas arquivos PDF são permitidos" 
      }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Arquivo muito grande. Máximo 10MB" 
      }, { status: 400 });
    }

    // Verificar se já existe um documento deste tipo para este lead
    const existingDoc = await prisma.leadDocumento.findUnique({
      where: {
        leadId_documentacaoId: {
          leadId,
          documentacaoId,
        },
      },
    });

    // Converter arquivo para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Fazer upload para S3
    const folder = `leads/${leadId}/documentos`;
    const uploadResult = await uploadFileToS3(
      buffer,
      file.name,
      file.type,
      folder
    );

    if (!uploadResult.success) {
      return NextResponse.json({ 
        error: 'Erro ao fazer upload do arquivo: ' + uploadResult.error 
      }, { status: 500 });
    }

    // Se já existe um documento, atualizar; senão, criar novo
    let documento;
    if (existingDoc) {
      documento = await prisma.leadDocumento.update({
        where: { id: existingDoc.id },
        data: {
          nomeArquivo: file.name,
          urlS3: uploadResult.url!,
          tamanho: file.size,
          tipoMime: file.type,
          uploadedBy: session.user.id,
        },
        include: {
          documentacao: {
            select: {
              id: true,
              nome: true,
              obrigatoriedade: true,
            },
          },
          usuario: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      documento = await prisma.leadDocumento.create({
        data: {
          leadId,
          documentacaoId,
          nomeArquivo: file.name,
          urlS3: uploadResult.url!,
          tamanho: file.size,
          tipoMime: file.type,
          uploadedBy: session.user.id,
        },
        include: {
          documentacao: {
            select: {
              id: true,
              nome: true,
              obrigatoriedade: true,
            },
          },
          usuario: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json(documento, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar documento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}