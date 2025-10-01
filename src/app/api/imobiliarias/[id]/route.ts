import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateImobiliariaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.union([
    z.string().email("Email inválido"),
    z.literal(""),
    z.undefined()
  ]).optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  logo: z.string().optional(),
  ativo: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permissões
    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "ADMFULL" &&
      session.user.imobiliariaId !== id
    ) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            leads: true,
            status: true,
          },
        },
      },
    });

    if (!imobiliaria) {
      return NextResponse.json(
        { error: "Imobiliária não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(imobiliaria);
  } catch (error) {
    console.error("Erro ao buscar imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permissões
    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "ADMFULL" &&
      session.user.imobiliariaId !== id
    ) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateImobiliariaSchema.parse(body);
    
    // Converter strings vazias em null para o banco de dados
    const processedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    // Verificar se a imobiliária existe
    const existingImobiliaria = await prisma.imobiliaria.findUnique({
      where: { id },
    });

    if (!existingImobiliaria) {
      return NextResponse.json(
        { error: "Imobiliária não encontrada" },
        { status: 404 }
      );
    }

    // Se está alterando o nome, verificar se não existe outro com o mesmo nome
    if (validatedData.nome && validatedData.nome !== existingImobiliaria.nome) {
      const duplicateImobiliaria = await prisma.imobiliaria.findFirst({
        where: {
          nome: validatedData.nome,
          id: { not: id },
        },
      });

      if (duplicateImobiliaria) {
        return NextResponse.json(
          { error: "Já existe uma imobiliária com este nome" },
          { status: 400 }
        );
      }
    }

    const updatedImobiliaria = await prisma.imobiliaria.update({
      where: { id },
      data: processedData,
    });

    return NextResponse.json(updatedImobiliaria);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas SUPER_ADMIN e ADMFULL podem deletar imobiliárias
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMFULL") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    // Verificar se a imobiliária existe
    const existingImobiliaria = await prisma.imobiliaria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            leads: true,
          },
        },
      },
    });

    if (!existingImobiliaria) {
      return NextResponse.json(
        { error: "Imobiliária não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se há dados relacionados
    if (
      existingImobiliaria._count.usuarios > 0 ||
      existingImobiliaria._count.leads > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível deletar a imobiliária pois ela possui dados relacionados (usuários ou leads)",
        },
        { status: 400 }
      );
    }

    await prisma.imobiliaria.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Imobiliária deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}