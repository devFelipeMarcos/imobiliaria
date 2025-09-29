"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CorretorSidebar } from "@/components/corretor-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

export default function CorretorLayout({
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

        // Verificar se o usuário tem role de CORRETOR
        if (user.role !== "CORRETOR") {
          router.replace("/cliente/consulta");
          return;
        }

        setCurrentUser({
          id: user.id,
          name: user.name || user.email || "Usuário",
          email: user.email || "",
          role: user.role || "CLIENT",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-300">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário válido, não renderiza nada (redirecionamento já foi feito)
  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <CorretorSidebar currentUser={currentUser} />
        <SidebarInset>
          <main className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}