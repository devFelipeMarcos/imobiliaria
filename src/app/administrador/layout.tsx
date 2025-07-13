"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

type SessionUser = {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

export default function AdministradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          router.replace("/authentication");
          return;
        }

        const user = session.user as any; // Better Auth user type

        // Verificar se o usuário tem role de ADMIN
        if (user.role !== "ADMIN") {
          router.replace("/cliente/consulta");
          return;
        }

        setCurrentUser({
          name: user.name || user.email || "Usuário",
          email: user.email || "",
          role: user.role || "USER",
          avatar: user.image || user.avatar || "",
        });
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        router.replace("/authentication");
        return;
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  // Tela de loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário válido, não renderiza nada (redirecionamento já foi feito)
  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar currentUser={currentUser} />
        <SidebarInset>
          <main className="flex-1 bg-slate-50">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
