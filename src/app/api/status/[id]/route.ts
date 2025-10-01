import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateStatusSchema = z.object({
  ativo: z.boolean().optional(),
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Buscar o status
    const status = await prisma.statusCustom.findUnique({
      where: { id },
      include: {
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    if (!status) {
      return NextResponse.json(
        { message: "Status não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso a este status
    if (session.user.role !== "SUPER_ADMIN") {
      if (!session.user.imobiliariaId || session.user.imobiliariaId !== status.imobiliariaId) {
        return NextResponse.json(
          { message: "Acesso negado a este status" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      status,
    });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão (ADMIN ou SUPER_ADMIN)
    if (!session.user.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Acesso negado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se o status existe
    const existingStatus = await prisma.statusCustom.findUnique({
      where: { id },
      include: {
        imobiliaria: true,
      },
    });

    if (!existingStatus) {
      return NextResponse.json(
        { message: "Status não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso a este status
    if (session.user.role === "ADMIN") {
      if (!session.user.imobiliariaId || session.user.imobiliariaId !== existingStatus.imobiliariaId) {
        return NextResponse.json(
          { message: "Acesso negado a este status" },
          { status: 403 }
        );
      }
    }

    // Verificar se o status está sendo usado por algum lead
    const leadsUsingStatus = await prisma.lead.count({
      where: { statusId: id },
    });

    if (leadsUsingStatus > 0) {
      return NextResponse.json(
        { message: "Não é possível deletar um status que está sendo usado por leads" },
        { status: 400 }
      );
    }

    // Deletar o status
    await prisma.statusCustom.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Status deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão (ADMIN ou SUPER_ADMIN)
    if (!session.user.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Acesso negado" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Verificar se o status existe
    const existingStatus = await prisma.statusCustom.findUnique({
      where: { id },
      include: {
        imobiliaria: true,
      },
    });

    if (!existingStatus) {
      return NextResponse.json(
        { message: "Status não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso a este status
    if (session.user.role === "ADMIN") {
      if (!session.user.imobiliariaId || session.user.imobiliariaId !== existingStatus.imobiliariaId) {
        return NextResponse.json(
          { message: "Acesso negado a este status" },
          { status: 403 }
        );
      }
    }

    // Se está atualizando o nome, verificar se não existe outro com o mesmo nome na mesma imobiliária
    if (validatedData.nome && validatedData.nome !== existingStatus.nome) {
      const duplicateName = await prisma.statusCustom.findFirst({
        where: {
          nome: {
            equals: validatedData.nome,
            mode: "insensitive",
          },
          imobiliariaId: existingStatus.imobiliariaId,
          id: {
            not: id,
          },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { message: "Já existe um status com este nome nesta imobiliária" },
          { status: 400 }
        );
      }
    }

    // Atualizar o status
    const updatedStatus = await prisma.statusCustom.update({
      where: { id },
      data: validatedData,
      include: {
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Status atualizado com sucesso",
      status: updatedStatus,
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}