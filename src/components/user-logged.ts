"use server";

import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(), // you need to pass the headers object.
});

// Dados do usuário logado
export const currentUser = {
  name: session?.user?.name || "Carlos Silva",
  email: session?.user?.email || "carlos.silva@Thiago Secure.com",
  role: session?.user?.role || "Administrador",
  avatar: session?.user?.image || "https://i.pravatar.cc/150?img=3",
};
