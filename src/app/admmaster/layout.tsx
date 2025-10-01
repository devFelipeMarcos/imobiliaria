"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdmMasterSidebar } from "@/components/admmaster-sidebar";
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

export default function AdmMasterLayout({
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

        // Verificar se o usuário tem role de ADMFULL
        if (user.role !== "ADMFULL") {
          router.replace("/cliente/consulta");
          return;
        }

        setCurrentUser({
          id: user.id,
          name: user.name || user.email || "Usuário",
          email: user.email || "",
          role: user.role || "CLIENT",
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdmMasterSidebar currentUser={currentUser} />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="min-h-[100vh] flex-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
