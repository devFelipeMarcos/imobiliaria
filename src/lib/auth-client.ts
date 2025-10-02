// authClient.ts
import { createAuthClient } from "better-auth/react";
import "@/types/auth"; // Importa as extensões de tipo

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export const { useSession } = authClient;
