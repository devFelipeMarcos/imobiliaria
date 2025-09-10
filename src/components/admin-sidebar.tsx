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
  Settings,
  Home,
  BarChart3,
  HelpCircle,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type SessionUser = {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

interface AdminSidebarProps {
  currentUser: SessionUser;
  className?: string;
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/administrador",
    icon: Home,
    hasSubmenu: false,
  },
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
      {
        title: "Permissões",
        url: "/administrador/permissoes",
        icon: Shield,
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
    title: "Relatórios",
    icon: BarChart3,
    hasSubmenu: true,
    submenu: [
      {
        title: "Financeiro",
        url: "/administrador/relatorio-financeiro",
        icon: DollarSign,
      },
      {
        title: "Desempenho",
        url: "/administrador/relatorio-desempenho",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Configurações",
    url: "/administrador/configuracoes",
    icon: Settings,
    hasSubmenu: false,
  },
];

export function AdminSidebar({ currentUser, className }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Gerenciar Acessos"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtrar itens baseado na busca
  const filteredItems = menuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.submenu &&
        item.submenu.some((sub) =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <SidebarHeader className="border-b border-slate-200/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Admin Panel
                </h2>
                <p className="text-xs text-slate-500">Painel Gerencial</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="mt-4 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm bg-white border-slate-200 focus:border-purple-300"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.hasSubmenu ? (
                    <Collapsible
                      open={openMenus.includes(item.title)}
                      onOpenChange={() => toggleMenu(item.title)}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "flex items-center w-full p-3 transition-all duration-200",
                            "hover:bg-purple-50 hover:text-purple-700",
                            isActiveParent(item.submenu) &&
                              "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
                          )}
                          isActive={isActiveParent(item.submenu)}
                          tooltip={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="ml-3 font-medium text-sm">
                                {item.title}
                              </span>
                              <ChevronDown className="h-3 w-3 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!isCollapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 pl-5 border-l border-slate-200/50">
                            {item.submenu?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveLink(subItem.url)}
                                  className="py-2.5 pl-3 text-sm"
                                >
                                  <Link
                                    href={subItem.url}
                                    className="flex items-center space-x-3 text-slate-600 hover:text-purple-700 transition-colors"
                                  >
                                    <subItem.icon className="h-3.5 w-3.5" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveLink(item.url!)}
                      className={cn(
                        "p-3 transition-all duration-200",
                        "hover:bg-purple-50 hover:text-purple-700",
                        isActiveLink(item.url!) &&
                          "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
                      )}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link href={item.url!} className="flex items-center">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium text-sm">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4">
                Suporte
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/ajuda"
                        className="flex items-center p-3 text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span className="ml-3 text-sm">Ajuda & Suporte</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/60 p-4 bg-white/50">
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50/50">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarImage
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
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
                <Badge
                  variant="secondary"
                  className="text-xs mt-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  {currentUser.role || "Administrador"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <Button
            variant={isCollapsed ? "ghost" : "outline"}
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full justify-start text-slate-600 hover:text-red-600",
              "hover:border-red-200 hover:bg-red-50 transition-colors",
              isCollapsed ? "h-9 w-9" : "h-9"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
