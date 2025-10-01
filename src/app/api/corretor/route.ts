import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const corretorSchema = z.object({
  name: z.string().min(3),
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

    // Verificar se o CPF já existe
    const existingCpf = await prisma.userDetails.findFirst({
      where: { cpfCnpj: validatedData.cpf },
    });

    if (existingCpf) {
      return NextResponse.json(
        { error: "CPF já está em uso" },
        { status: 400 }
      );
    }

    // Criar usuário usando Better Auth
    const user = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.senha,
      },
    });

    // Atualizar o usuário com role e status
    const updatedUser = await prisma.user.update({
      where: { id: user.user.id },
      data: {
        role: "CORRETOR",
        status: "ACTIVE",
      },
    });

    // Criar ou atualizar UserDetails
    await prisma.userDetails.upsert({
      where: { userId: user.user.id },
      create: {
        userId: user.user.id,
        telefone: validatedData.telefone,
        cpfCnpj: validatedData.cpf,
      },
      update: {
        telefone: validatedData.telefone,
        cpfCnpj: validatedData.cpf,
      },
    });

    return NextResponse.json(
      { 
        message: "Corretor cadastrado com sucesso",
        user: updatedUser
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
    const corretores = await prisma.user.findMany({
      where: { role: "CORRETOR" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        userDetails: {
          select: {
            telefone: true,
            cpfCnpj: true,
          },
        },
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