"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Building,
  Shield,
  Users,
  FileText,
  Search,
  LogOut,
  HelpCircle,
  Settings,
  Plus,
  Crown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

interface AdmMasterSidebarProps {
  currentUser: SessionUser;
  className?: string;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/admmaster",
  },
  {
    title: "Imobiliárias",
    icon: Building,
    url: "/admmaster/imobiliarias",
  },
  {
    title: "Criar Imobiliária",
    icon: Plus,
    url: "/admmaster/criar-imobiliaria",
  },
  {
    title: "Corretores",
    icon: Users,
    url: "/admmaster/corretores",
  },
  {
    title: "Administradores",
    icon: Shield,
    url: "/admmaster/admins",
  },
  {
    title: "Criar Admin",
    icon: Plus,
    url: "/admmaster/criar-admin",
  },
  {
    title: "Relatórios",
    icon: FileText,
    url: "/admmaster/relatorios",
  },
];

export function AdmMasterSidebar({ currentUser, className }: AdmMasterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useSidebar();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/authentication");
          },
          onError: (ctx) => {
            console.error("Erro ao fazer logout:", ctx.error);
            router.push("/authentication");
          },
        },
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      router.push("/authentication");
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActiveLink = (url: string) => {
    if (url === "/admmaster") {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className={`bg-gradient-to-b from-blue-900 via-teal-800 to-green-700 border-r border-blue-600/30 transition-all duration-300 ease-in-out ${className}`}
    >
      <SidebarHeader className="border-b border-blue-600/30 bg-blue-900/50">
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Crown className="text-white h-4 w-4" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Master Admin</h2>
                <p className="text-blue-200 text-xs">Portal Master</p>
              </div>
            </div>
          )}
          <SidebarTrigger className="text-blue-200 hover:text-white hover:bg-teal-700/50 h-8 w-8 transition-all duration-200 rounded-md" data-sidebar-trigger />
        </div>

        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
              <Input
                placeholder="Buscar menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-teal-800/50 border-blue-600 text-white placeholder:text-blue-300 focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto bg-blue-900/50">
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-4">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`flex items-center w-full p-3 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      isActiveLink(item.url)
                        ? "bg-teal-600/50 text-white border-r-2 border-blue-300 shadow-lg"
                        : "text-blue-200 hover:bg-teal-700/50 hover:text-white hover:shadow-md"
                    }`}
                    isActive={isActiveLink(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a href={item.url} className="flex items-center w-full">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium text-sm">
                          {item.title}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção de Suporte */}
        <SidebarGroup className="mt-auto">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-4">
              Suporte
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex items-center w-full p-3 transition-all duration-300 ease-in-out transform hover:scale-105 text-blue-200 hover:bg-teal-700/50 hover:text-white hover:shadow-md"
                  tooltip={isCollapsed ? "Ajuda" : undefined}
                >
                  <HelpCircle className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium text-sm">Ajuda</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex items-center w-full p-3 transition-all duration-300 ease-in-out transform hover:scale-105 text-blue-200 hover:bg-teal-700/50 hover:text-white hover:shadow-md"
                  tooltip={isCollapsed ? "Configurações" : undefined}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium text-sm">Configurações</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-600/30 bg-blue-900/50">
        {!isCollapsed ? (
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-teal-400">
                <AvatarImage src={currentUser.avatar || ""} alt={currentUser.name || ""} />
                <AvatarFallback className="bg-teal-600 text-white font-semibold">
                  {currentUser.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.name || "Usuário"}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {currentUser.email}
                </p>
                <p className="text-xs text-teal-300 font-medium">
                  Master Admin
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-teal-700/50 border-teal-500 text-blue-100 hover:bg-teal-600 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="w-full h-10 text-blue-200 hover:text-white hover:bg-teal-700/50"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}