import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const corretorSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(10),
  cpf: z.string().regex(/^\d{11}$/),
  senha: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = corretorSchema.parse(body);

    // Verificar se o email já existe na tabela user
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe na tabela corretor
    const existingEmail = await prisma.corretor.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Verificar se o CPF já existe
    const existingCpf = await prisma.corretor.findUnique({
      where: { cpf: validatedData.cpf },
    });

    if (existingCpf) {
      return NextResponse.json(
        { error: "CPF já está em uso" },
        { status: 400 }
      );
    }

    // Usar transação para criar usuário e corretor
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário usando Better Auth (que já cuida da criptografia)
      const user = await auth.api.signUpEmail({
        body: {
          name: validatedData.nome,
          email: validatedData.email,
          password: validatedData.senha,
        },
      });

      // Atualizar o usuário com role e status
      const updatedUser = await tx.user.update({
        where: { id: user.user.id },
        data: {
          role: "CORRETOR",
          status: "ACTIVE",
        },
      });

      // Criar o corretor
      const corretor = await tx.corretor.create({
        data: {
          nome: validatedData.nome,
          email: validatedData.email,
          telefone: validatedData.telefone,
          cpf: validatedData.cpf,
          userId: user.user.id, // Relacionar com o usuário criado
        },
      });

      return { user: updatedUser, corretor };
    });

    return NextResponse.json(
      { 
        message: "Corretor cadastrado com sucesso",
        corretor: result.corretor,
        user: { id: result.user.id, email: result.user.email, role: result.user.role }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar corretor:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const corretores = await prisma.corretor.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        creci: true,
        comissao: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ corretores });
  } catch (error) {
    console.error("Erro ao buscar corretores:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}