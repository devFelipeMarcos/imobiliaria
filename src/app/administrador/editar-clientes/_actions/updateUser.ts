"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Atualizar dados básicos do usuário
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: "USER" | "ADMIN";
  }
) {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    revalidatePath("/administrador/editar-clientes");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Erro ao atualizar usuário" };
  }
}

// Atualizar ou criar UserDetails
export async function updateUserDetails(
  userId: string,
  data: {
    nome?: string;
    cpfCnpj?: string | null;
    telefone?: string | null;
    preco?: number | null;
  }
) {
  try {
    // Verificar se já existe UserDetails para este usuário
    const existingDetails = await db.userDetails.findUnique({
      where: { userId },
    });

    let userDetails;

    if (existingDetails) {
      // Atualizar existente
      userDetails = await db.userDetails.update({
        where: { userId },
        data: {
          nome: data.nome,
          cpfCnpj: data.cpfCnpj,
          telefone: data.telefone,
          preco: data.preco,
        },
      });
    } else {
      // Criar novo
      userDetails = await db.userDetails.create({
        data: {
          userId,
          nome: data.nome,
          cpfCnpj: data.cpfCnpj,
          telefone: data.telefone,
          preco: data.preco,
        },
      });
    }

    revalidatePath("/administrador/editar-clientes");
    return { success: true, userDetails };
  } catch (error) {
    console.error("Erro ao atualizar detalhes do usuário:", error);
    return { success: false, error: "Erro ao atualizar detalhes do usuário" };
  }
}

// Atualizar status do usuário
export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "INACTIVE"
) {
  try {
    // Opção 1: Se você tem um campo 'status' na tabela User
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: status,
      },
    });

    revalidatePath("/administrador/editar-clientes");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    return { success: false, error: "Erro ao atualizar status do usuário" };
  }
}
