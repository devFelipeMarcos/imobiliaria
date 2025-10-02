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
  Link2,
  Users,
  FileText,
  Search,
  LogOut,
  HelpCircle,
  Settings,
  Share,
  Tag,
  MessageCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

interface CorretorSidebarProps {
  currentUser: SessionUser;
  className?: string;
}

const menuCategories = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/cliente",
    category: "main",
  },
  {
    title: "Status",
    icon: Tag,
    url: "/cliente/status",
    category: "main",
  },
];

const leadItems = [
  {
    title: "Meus Leads",
    icon: Users,
    url: "/cliente/leads",
  },
  {
    title: "Novo Lead",
    icon: FileText,
    url: "/cliente/leads/novo",
  },
  {
    title: "Meu novo Lead",
    icon: Share,
    url: "/cliente/meu-novo-lead",
  },
];

const whatsappItems = [
  {
    title: "Configurar WhatsApp",
    icon: MessageCircle,
    url: "/cliente/whatsapp",
  },
  {
    title: "Lista de transmissão",
    icon: Users,
    url: "/cliente/whatsapp/lista-transmissao",
  },
];

export function CorretorSidebar({
  currentUser,
  className,
}: CorretorSidebarProps) {
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

  // Função para filtrar itens por busca
  const filterItems = (items: any[]) => 
    items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredMainItems = filterItems(menuCategories);
  const filteredLeadItems = filterItems(leadItems);
  const filteredWhatsappItems = filterItems(whatsappItems);

  const isActiveLink = (url: string) => {
    if (url === "/cliente") {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className={`bg-slate-900 border-r border-slate-700 ${className}`}
    >
      <SidebarHeader className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="text-white h-4 w-4" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  CRM Imobiliário
                </h2>
                <p className="text-gray-400 text-xs">Portal do Corretor</p>
              </div>
            </div>
          )}
          <SidebarTrigger className="text-gray-400 hover:text-white hover:bg-slate-700 h-8 w-8" />
        </div>

        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto bg-slate-900">
        {/* Itens Principais */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-4">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`flex items-center w-full p-3 transition-all duration-200 ${
                      isActiveLink(item.url)
                        ? "bg-slate-700 text-white border-r-2 border-blue-500"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
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

        {/* Categoria Leads */}
        {(filteredLeadItems.length > 0 || !searchQuery) && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-green-300 uppercase tracking-wider px-4">
                Leads
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredLeadItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center w-full p-3 transition-all duration-200 ${
                        isActiveLink(item.url)
                          ? "bg-slate-700 text-white border-r-2 border-green-500"
                          : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
        )}

        {/* Categoria WhatsApp */}
        {(filteredWhatsappItems.length > 0 || !searchQuery) && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-emerald-300 uppercase tracking-wider px-4">
                WhatsApp
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredWhatsappItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center w-full p-3 transition-all duration-200 ${
                        isActiveLink(item.url)
                          ? "bg-slate-700 text-white border-r-2 border-emerald-500"
                          : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
        )}

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
                  className="flex items-center w-full p-3 transition-all duration-200 text-gray-300 hover:bg-slate-700 hover:text-white"
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
                  className="flex items-center w-full p-3 transition-all duration-200 text-gray-300 hover:bg-slate-700 hover:text-white"
                  tooltip={isCollapsed ? "Configurações" : undefined}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium text-sm">
                      Configurações
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-700 bg-slate-800">
        {!isCollapsed ? (
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-blue-500">
                <AvatarImage
                  src={currentUser.avatar || ""}
                  alt={currentUser.name || ""}
                />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {currentUser.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 hover:text-white transition-colors"
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
              className="w-full h-10 text-gray-300 hover:text-white hover:bg-slate-700"
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
