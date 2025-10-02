// authClient.ts
import { createAuthClient } from "better-auth/react";
import "@/types/auth"; // Importa as extensões de tipo

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_URL || "https://imobiliaria.admfelipemarcos.site",
});

export const { useSession } = authClient;
