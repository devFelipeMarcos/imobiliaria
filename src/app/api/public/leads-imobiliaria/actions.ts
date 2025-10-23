"use server";

import { prisma } from "@/lib/prisma";

export async function getImobiliariaInfo(imobiliariaId: string) {
  try {
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId },
    });

    if (!imobiliaria || !imobiliaria.ativo) {
      throw new Error("Imobiliária não encontrada ou inativa");
    }

    return {
      id: imobiliaria.id,
      nome: imobiliaria.nome,
    };
  } catch (error) {
    console.error("Erro ao buscar imobiliária:", error);
    throw new Error("Erro ao buscar informações da imobiliária");
  }
}

export async function createLeadForImobiliaria(data: {
  nome: string;
  telefone: string;
  imobiliariaId: string;
  regiao?: string;
  temDependente?: boolean;
  valorRenda?: number;
  tipoRenda?: "formal" | "informal";
}) {
  try {
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: data.imobiliariaId },
    });

    if (!imobiliaria || !imobiliaria.ativo) {
      throw new Error("Imobiliária não encontrada ou inativa");
    }

    // Removido: não atualizamos leads com corretor; ver lógica abaixo.

    // Verificar duplicidade apenas para leads SEM corretor na mesma imobiliária
    const leadExistenteSemCorretor = await prisma.lead.findFirst({
      where: {
        telefone: data.telefone,
        imobiliariaId: data.imobiliariaId,
        userId: null,
      },
    });

    if (leadExistenteSemCorretor) {
      // Atualiza somente o lead sem corretor
      const atualizado = await prisma.lead.update({
        where: { id: leadExistenteSemCorretor.id },
        data: {
          nome: data.nome,
          regiao: data.regiao,
          temDependente: data.temDependente ?? false,
          valorRenda: data.valorRenda,
          tipoRenda: data.tipoRenda,
        },
      });
      return atualizado;
    }

    const lead = await prisma.lead.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        imobiliariaId: data.imobiliariaId,
        // Sem corretor associado
        userId: null,
        // Novos campos
        regiao: data.regiao,
        temDependente: data.temDependente ?? false,
        valorRenda: data.valorRenda,
        tipoRenda: data.tipoRenda,
      },
      include: {
        imobiliaria: {
          select: { id: true, nome: true },
        },
      },
    });

    // Nota: Não disparamos webhook pois não há corretor associado
    return lead;
  } catch (error) {
    console.error("Erro ao criar lead da imobiliária:", error);
    throw new Error("Erro ao cadastrar lead");
  }
}