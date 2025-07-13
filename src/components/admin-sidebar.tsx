"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Shield,
  Users,
  History,
  DollarSign,
  LogOut,
  Plus,
  ChevronDown,
  UserPlus,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type SessionUser = {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

interface AdminSidebarProps {
  currentUser: SessionUser;
}

const menuItems = [
  {
    title: "Gerenciar Acessos",
    icon: Users,
    hasSubmenu: true,
    submenu: [
      {
        title: "Cadastrar Clientes",
        url: "/administrador/cadastrar-clientes",
        icon: UserPlus,
      },
      {
        title: "Editar Clientes",
        url: "/administrador/editar-clientes",
        icon: UserCog,
      },
    ],
  },
  {
    title: "Histórico de Consultas",
    url: "/administrador/historico-consultas",
    icon: History,
    hasSubmenu: false,
  },
  {
    title: "Relatório Financeiro",
    url: "/administrador/relatorio-financeiro",
    icon: DollarSign,
    hasSubmenu: false,
  },
];

export function AdminSidebar({ currentUser }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Gerenciar Acessos"]);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/authentication");
          },
          onError: (ctx) => {
            console.error("Erro ao fazer logout:", ctx.error);
            // Mesmo com erro, redireciona para login
            router.push("/authentication");
          },
        },
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Em caso de erro, força o redirecionamento
      router.push("/authentication");
    }
  };

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((item) => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const isActiveLink = (url: string) => pathname === url;

  const isActiveParent = (submenu?: Array<{ url: string }>) => {
    if (!submenu) return false;
    return submenu.some((item) => pathname === item.url);
  };

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Thiago Secure</h2>
            <p className="text-sm text-slate-500">Painel Gerencial</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.hasSubmenu ? (
                    <Collapsible
                      open={openMenus.includes(item.title)}
                      onOpenChange={() => toggleMenu(item.title)}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="flex items-center justify-between w-full p-2"
                          isActive={isActiveParent(item.submenu)}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActiveLink(subItem.url)}
                              >
                                <Link
                                  href={subItem.url}
                                  className="flex items-center space-x-3 p-2"
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveLink(item.url!)}
                    >
                      <Link
                        href={item.url!}
                        className="flex items-center space-x-3 p-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/administrador/adicionar-modulo"
                    className="flex items-center space-x-3 p-2 text-slate-500 hover:text-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Adicionar Módulo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
              />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser.email}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                {currentUser.role}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:border-red-200 bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
