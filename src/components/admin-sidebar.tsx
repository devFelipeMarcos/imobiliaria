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
  Contact,
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
import { logUserLogout } from "@/app/audit/actions";

type SessionUser = {
  id?: string;
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
    title: "Cadastrar Corretor",
    url: "/administrador/cadastrar-corretor",
    icon: UserPlus,
    hasSubmenu: false,
  },
  {
    title: "Cadastrar Admin",
    url: "/administrador/cadastrar-admin",
    icon: Shield,
    hasSubmenu: false,
  },
  {
    title: "Leads",
    icon: Contact,
    hasSubmenu: true,
    submenu: [
      {
        title: "Meus Leads",
        url: "/administrador/meus-leads",
        icon: Contact,
      },
      {
        title: "Todos os Leads",
        url: "/administrador/todos-leads",
        icon: Users,
      },
    ],
  },
  {
    title: "Cadastrar Status",
    url: "/administrador/cadastrar-status",
    icon: Settings,
    hasSubmenu: false,
  },

  {
    title: "Logs do Sistema",
    url: "/administrador/logs",
    icon: History,
    hasSubmenu: false,
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
      // Log do logout antes de fazer o signOut
      if (currentUser.id) {
        await logUserLogout(currentUser.id);
      }

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
        "border-r border-slate-700/50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <SidebarHeader className="border-b border-slate-700/50 p-4 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-xs text-slate-400">Painel Gerencial</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
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
              className="pl-8 h-9 text-sm bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto bg-slate-900/50">
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4">
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
                            "flex items-center w-full p-3 transition-all duration-200 text-slate-300",
                            "hover:bg-purple-500/20 hover:text-purple-300",
                            isActiveParent(item.submenu) &&
                              "bg-purple-500/30 text-purple-300 border-r-2 border-purple-400"
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
                          <SidebarMenuSub className="ml-4 pl-5 border-l border-slate-600/50">
                            {item.submenu?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveLink(subItem.url)}
                                  className="py-2.5 pl-3 text-sm"
                                >
                                  <Link
                                    href={subItem.url}
                                    className={cn(
                                      "flex items-center space-x-3 transition-colors",
                                      isActiveLink(subItem.url)
                                        ? "text-purple-300 bg-purple-500/20"
                                        : "text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
                                    )}
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
                        "p-3 transition-all duration-200 text-slate-300",
                        "hover:bg-purple-500/20 hover:text-purple-300",
                        isActiveLink(item.url!) &&
                          "bg-purple-500/30 text-purple-300 border-r-2 border-purple-400"
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
            <Separator className="my-4 bg-slate-700/50" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4">
                Suporte
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/ajuda"
                        className="flex items-center p-3 text-slate-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors"
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

      <SidebarFooter className="border-t border-slate-700/50 p-4 bg-slate-800/50">
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <Avatar className="h-9 w-9 border-2 border-purple-400/50 shadow-lg">
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
                <p className="text-sm font-medium text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser.email}
                </p>
                <Badge
                  variant="secondary"
                  className="text-xs mt-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-400/30"
                >
                  {currentUser.role || "Administrador"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-600/50">
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <Button
            variant={isCollapsed ? "ghost" : "outline"}
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full justify-start text-slate-400 hover:text-red-400 border-slate-600",
              "hover:border-red-400/50 hover:bg-red-500/20 transition-colors",
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
