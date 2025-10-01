"use server";

import { prisma } from "@/lib/prisma";

export async function getCorretorInfo(corretorId: string) {
  try {
    // Verificar se é um User com role de corretor
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
      }
    });

    if (!user || !user.imobiliaria) {
      throw new Error("Corretor não encontrado ou inativo");
    }

    return {
      id: user.id,
      nome: user.name,
      imobiliaria: {
        id: user.imobiliaria.id,
        nome: user.imobiliaria.nome
      }
    };
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    throw new Error("Erro ao buscar informações do corretor");
  }
}

export async function createLeadForCorretor(data: {
  nome: string;
  whatsapp: string;
  corretorId: string;
}) {
  try {
    // Verificar se é um User com role de corretor
    const user = await prisma.user.findUnique({
      where: {
        id: data.corretorId,
        status: "ACTIVE",
        role: {
          in: ["CORRETOR", "ADMIN", "ADMFULL"]
        }
      },
      include: {
        imobiliaria: true
      }
    });

    if (!user || !user.imobiliaria) {
      throw new Error("Corretor não encontrado ou inativo");
    }

    // Criar o lead usando o User
    const lead = await prisma.lead.create({
      data: {
        nome: data.nome,
        telefone: data.whatsapp,
        userId: data.corretorId,
        imobiliariaId: user.imobiliaria.id
      }
    });

    return lead;
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    throw new Error("Erro ao cadastrar lead");
  }
}