"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdmMasterSidebar } from "@/components/admmaster-sidebar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Loader2, Menu } from "lucide-react";

type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

function MobileHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <header className="flex items-center justify-between p-4 border-b border-blue-600/30 bg-blue-900/50">
      <h1 className="text-xl font-semibold text-white">Master Admin</h1>
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md bg-teal-700/50 text-white hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
}

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
          router.replace("/corretor/consulta");
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-teal-800 to-green-700">
      <SidebarProvider>
        <AdmMasterSidebar currentUser={currentUser} />
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <MobileHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
