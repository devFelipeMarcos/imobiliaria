import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão ADMFULL
    if (session.user.role !== "ADMFULL") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
    } = body;

    // Validações básicas - apenas nome, email e telefone são obrigatórios
    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: "Nome, email e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma imobiliária com o mesmo CNPJ (apenas se CNPJ foi fornecido)
    if (cnpj && cnpj.trim()) {
      const existingImobiliaria = await prisma.imobiliaria.findUnique({
        where: { cnpj: cnpj.replace(/\D/g, "") },
      });

      if (existingImobiliaria) {
        return NextResponse.json(
          { error: "Já existe uma imobiliária com este CNPJ" },
          { status: 400 }
        );
      }
    }

    // Verificar se já existe uma imobiliária com o mesmo email
    const existingEmail = await prisma.imobiliaria.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Já existe uma imobiliária com este email" },
        { status: 400 }
      );
    }

    // Criar a imobiliária
    const imobiliaria = await prisma.imobiliaria.create({
      data: {
        nome,
        cnpj: cnpj && cnpj.trim() ? cnpj.replace(/\D/g, "") : null, // Salvar apenas números ou null
        email,
        telefone: telefone ? telefone.replace(/\D/g, "") : null, // Salvar apenas números ou null
        endereco: endereco && endereco.trim() ? endereco : null,
        cidade: cidade && cidade.trim() ? cidade : null,
        estado: estado && estado.trim() ? estado : null,
        cep: cep && cep.trim() ? cep.replace(/\D/g, "") : null, // Salvar apenas números ou null
      },
    });

    return NextResponse.json({
      message: "Imobiliária criada com sucesso",
      imobiliaria: {
        id: imobiliaria.id,
        nome: imobiliaria.nome,
        email: imobiliaria.email,
        cidade: imobiliaria.cidade,
        estado: imobiliaria.estado,
      },
    });
  } catch (error) {
    console.error("Erro ao criar imobiliária:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem permissão ADMFULL
    if (session.user.role !== "ADMFULL") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { cidade: { contains: search, mode: "insensitive" as const } },
            { estado: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Buscar imobiliárias com paginação
    const [imobiliarias, total] = await Promise.all([
      prisma.imobiliaria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              usuarios: true,
            },
          },
        },
      }),
      prisma.imobiliaria.count({ where }),
    ]);

    // Formatar dados para retorno
    const formattedImobiliarias = imobiliarias.map((imobiliaria) => ({
      id: imobiliaria.id,
      nome: imobiliaria.nome,
      cnpj: imobiliaria.cnpj ? imobiliaria.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : null,
      email: imobiliaria.email,
      telefone: imobiliaria.telefone ? imobiliaria.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3") : null,
      endereco: imobiliaria.endereco,
      cidade: imobiliaria.cidade,
      estado: imobiliaria.estado,
      cep: imobiliaria.cep ? imobiliaria.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : null,
      totalUsuarios: imobiliaria._count.usuarios,
      createdAt: imobiliaria.createdAt,
      updatedAt: imobiliaria.updatedAt,
    }));

    return NextResponse.json({
      imobiliarias: formattedImobiliarias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar imobiliárias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}