import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLeadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  imobiliariaId: z.string().min(1, "ID da imobiliária é obrigatório"),
  regiao: z.string().optional(),
  temDependente: z.boolean().optional(),
  valorRenda: z.number().optional(),
  tipoRenda: z.enum(["formal", "informal"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLeadSchema.parse(body);

    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: validated.imobiliariaId },
    });

    if (!imobiliaria || !imobiliaria.ativo) {
      return NextResponse.json(
        { error: "Imobiliária não encontrada ou inativa" },
        { status: 404 }
      );
    }

    // Verificar duplicidade
    const leadExistente = await prisma.lead.findFirst({
      where: {
        telefone: validated.telefone,
        imobiliariaId: validated.imobiliariaId,
      },
    });

    if (leadExistente) {
      const atualizado = await prisma.lead.update({
        where: { id: leadExistente.id },
        data: {
          nome: validated.nome,
          regiao: validated.regiao,
          temDependente: validated.temDependente ?? false,
          valorRenda: validated.valorRenda,
          tipoRenda: validated.tipoRenda,
          updatedAt: new Date(),
        },
        include: {
          imobiliaria: { select: { id: true, nome: true } },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead atualizado com sucesso",
        lead: atualizado,
      }, { status: 200 });
    }

    const lead = await prisma.lead.create({
      data: {
        nome: validated.nome,
        telefone: validated.telefone,
        imobiliariaId: validated.imobiliariaId,
        userId: null,
        regiao: validated.regiao,
        temDependente: validated.temDependente ?? false,
        valorRenda: validated.valorRenda,
        tipoRenda: validated.tipoRenda,
      },
      include: {
        imobiliaria: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lead criado com sucesso",
      lead,
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lead da imobiliária:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })) 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}