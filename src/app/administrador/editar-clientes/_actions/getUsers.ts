"use server";

import { db } from "@/lib/prisma";

const getUsers = async () => {
  const usuarios = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // Adicione outros campos que você tem na sua tabela User
      // Se você tem um campo status, descomente a linha abaixo:
      // status: true,

      // Se você não tem campo status mas tem outros campos como emailVerified, etc:
      emailVerified: true, // ou qualquer campo que indique se o usuário está ativo
    },
  });
  return usuarios;
};

const getUsersDetails = async () => {
  const detalhes_usuarios = await db.userDetails.findMany();
  return detalhes_usuarios;
};

// Nova função para buscar usuários com seus detalhes em uma única query
const getUsersWithDetails = async () => {
  const usuarios = await db.user.findMany({
    include: {
      userDetails: true, // Isso vai incluir os detalhes automaticamente
    },
  });
  return usuarios;
};

export default getUsers;
export { getUsersDetails, getUsersWithDetails };
