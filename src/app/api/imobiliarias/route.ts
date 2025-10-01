import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const imobiliariaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  logo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas SUPER_ADMIN pode criar imobiliárias
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = imobiliariaSchema.parse(body);

    // Verificar se já existe uma imobiliária com o mesmo nome
    const existingImobiliaria = await prisma.imobiliaria.findFirst({
      where: { nome: validatedData.nome },
    });

    if (existingImobiliaria) {
      return NextResponse.json(
        { error: "Já existe uma imobiliária com este nome" },
        { status: 400 }
      );
    }

    const imobiliaria = await prisma.imobiliaria.create({
      data: validatedData,
    });

    return NextResponse.json(imobiliaria, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let imobiliarias;

    if (session?.user?.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode ver todas as imobiliárias
      imobiliarias = await prisma.imobiliaria.findMany({
        include: {
          _count: {
            select: {
              usuarios: true,
              leads: true,
            },
          },
        },
        orderBy: { nome: "asc" },
      });
    } else if (session?.user?.role === "ADMIN" && session?.user?.imobiliariaId) {
      // ADMIN pode ver apenas sua própria imobiliária
      imobiliarias = await prisma.imobiliaria.findMany({
        where: { id: session.user.imobiliariaId },
        include: {
          _count: {
            select: {
              usuarios: true,
              leads: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(imobiliarias);
  } catch (error) {
    console.error("Erro ao buscar imobiliárias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}