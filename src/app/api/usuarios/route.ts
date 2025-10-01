import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "CORRETOR"], {
    errorMap: () => ({ message: "Role deve ser ADMIN ou CORRETOR" }),
  }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar permissões: SUPER_ADMIN e ADMFULL podem criar qualquer usuário, ADMIN pode criar apenas CORRETOR
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMFULL" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Se é ADMIN, só pode criar CORRETOR e deve estar vinculado a uma imobiliária
    if (session.user.role === "ADMIN") {
      if (validatedData.role !== "CORRETOR") {
        return NextResponse.json(
          { error: "Administradores só podem criar corretores" },
          { status: 403 }
        );
      }

      if (!session.user.imobiliariaId) {
        return NextResponse.json(
          { error: "Administrador deve estar vinculado a uma imobiliária" },
          { status: 400 }
        );
      }
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" },
        { status: 400 }
      );
    }

    // Determinar a imobiliária
    let imobiliariaId: string | null = null;
    if (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMFULL") {
      // SUPER_ADMIN e ADMFULL podem especificar imobiliariaId ou usar o próprio
      imobiliariaId = body.imobiliariaId || session.user.imobiliariaId || null;
    } else if (session.user.role === "ADMIN") {
      // ADMIN só pode criar usuários para sua própria imobiliária
      imobiliariaId = session.user.imobiliariaId || null;
    }

    // Usar better-auth para criar o usuário
    const createResult = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
      },
    });

    if (!createResult) {
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      );
    }

    // Atualizar o usuário com os campos adicionais
    const user = await prisma.user.update({
      where: { email: validatedData.email },
      data: {
        role: validatedData.role,
        status: validatedData.status,
        imobiliariaId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        imobiliariaId: true,
        createdAt: true,
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar usuário:", error);
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const imobiliariaId = searchParams.get("imobiliariaId");

    let whereClause: any = {};

    if (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMFULL") {
      // SUPER_ADMIN e ADMFULL podem ver todos os usuários
      if (role) {
        whereClause.role = role;
      }
      if (imobiliariaId) {
        whereClause.imobiliariaId = imobiliariaId;
      }
    } else if (session.user.role === "ADMIN") {
      // ADMIN pode ver apenas usuários de sua imobiliária
      whereClause.imobiliariaId = session.user.imobiliariaId;
      if (role) {
        whereClause.role = role;
      }
    } else {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        imobiliariaId: true,
        createdAt: true,
        imobiliaria: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}