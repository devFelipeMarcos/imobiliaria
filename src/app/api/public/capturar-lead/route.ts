import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, email, mensagem, corretorId, imobiliariaId } = body;

    // Validações básicas
    if (!nome?.trim() || !telefone?.trim()) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    if (!corretorId) {
      return NextResponse.json(
        { error: "Corretor não especificado" },
        { status: 400 }
      );
    }

    // Verificar se o corretor existe e está ativo
    const user = await prisma.user.findUnique({
      where: {
        id: corretorId,
        status: "ACTIVE",
        role: {
          in: ["CORRETOR", "ADMIN", "ADMFULL"]
        }
      },
      include: {
        imobiliaria: true
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Corretor não encontrado ou inativo" },
        { status: 404 }
      );
    }

    if (!user.imobiliaria || !user.imobiliaria.ativo) {
      return NextResponse.json(
        { error: "Corretor não possui imobiliária ativa" },
        { status: 400 }
      );
    }

    // Usar a imobiliária especificada ou a do usuário
    let finalImobiliariaId = imobiliariaId;
    if (!finalImobiliariaId) {
      finalImobiliariaId = user.imobiliaria.id;
    } else {
      // Verificar se a imobiliária especificada é a mesma do usuário
      if (finalImobiliariaId !== user.imobiliaria.id) {
        return NextResponse.json(
          { error: "Imobiliária não válida para este corretor" },
          { status: 400 }
        );
      }
    }

    // Verificar se já existe um lead com o mesmo telefone para este corretor
    const leadExistente = await prisma.lead.findFirst({
      where: {
        telefone: telefone.trim(),
        userId: corretorId,
      },
    });

    if (leadExistente) {
      // Atualizar o lead existente com as novas informações
      const leadAtualizado = await prisma.lead.update({
        where: {
          id: leadExistente.id,
        },
        data: {
          nome: nome.trim(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Lead atualizado com sucesso",
        lead: {
          id: leadAtualizado.id,
          nome: leadAtualizado.nome,
          telefone: leadAtualizado.telefone,
        },
      });
    }

    // Criar novo lead
    const novoLead = await prisma.lead.create({
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        userId: corretorId,
        imobiliariaId: finalImobiliariaId,
      },
    });

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        acao: "CREATE",
        entidade: "Lead",
        entidadeId: novoLead.id,
        descricao: "Lead criado via link dinâmico",
        dadosNovos: {
          nome: novoLead.nome,
          telefone: novoLead.telefone,
          userId: corretorId,
          imobiliariaId: finalImobiliariaId,
          origem: "link_dinamico",
        },
      },
    });

    return NextResponse.json({
      message: "Lead criado com sucesso",
      lead: {
        id: novoLead.id,
        nome: novoLead.nome,
        telefone: novoLead.telefone,
      },
    });
  } catch (error) {
    console.error("Erro ao capturar lead:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}