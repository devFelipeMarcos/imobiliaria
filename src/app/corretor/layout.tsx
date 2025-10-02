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

export default function ClienteLayout({
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

        // Verificar se o usuário tem role de CORRETOR, ADMIN, SUPER_ADMIN ou ADMFULL
        const allowedRoles = ["CORRETOR", "ADMIN", "SUPER_ADMIN", "ADMFULL"];
        if (!allowedRoles.includes(user.role)) {
          router.replace("/authentication");
          return;
        }

        setCurrentUser({
          id: user.id,
          name: user.name || user.email || "Usuário",
          email: user.email || "",
          role: user.role || "CORRETOR",
          avatar: user.image || undefined,
        });
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        router.replace("/authentication");
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <SidebarProvider>
        <CorretorSidebar currentUser={currentUser} />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}