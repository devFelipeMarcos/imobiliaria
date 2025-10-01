"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Users,
  FileCheck,
  BarChart3,
  Crown,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { logUserLogin } from "@/app/audit/actions";

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Email administrativo inválido" }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData: AdminLoginFormValues) {
    // 1) tenta logar
    const { data: signInData, error: signInError } =
      await authClient.signIn.email(
        { email: formData.email, password: formData.password },
        {
          onError: (ctx) => {
            if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
              toast.error("401 - E-mail ou senha incorreta!");
            } else {
              toast.error(ctx.error.message);
            }
          },
          // não faz redirect aqui
        }
      );

    if (signInError) return;

    // 2) pega a sessão completa (já com status)
    const { data: sessionData } = await authClient.getSession();

    const user = sessionData?.user as { status?: string; role?: string };

    // 3) verifica o status
    if (user?.status !== "ACTIVE") {
      toast.error(
        "Acesso negado. Seu usuário está inativo, favor entrar em contato com o suporte."
      );
      return;
    }

    if (user?.role !== "ADMIN") {
      toast.error(
        "Acesso negado. Seu usuário não tem permissão para acessar esta área."
      );
      return;
    }

    // 4) log do login bem-sucedido
    if (sessionData?.user?.id) {
      await logUserLogin(sessionData.user.id);
    }

    // 5) só então redireciona
    toast.success("Login realizado com sucesso!");
    router.replace("/admmaster");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Management Overview */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Faça Login</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-blue-200">Painel de Gestão</p>
                  <Badge className="bg-teal-600 text-white hover:bg-teal-600 text-xs">
                    MANAGER
                  </Badge>
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Gestão Completa de{" "}
              <span className="text-teal-400">Verificações</span>
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed">
              Painel administrativo para gestão de usuários, empresas e
              processos de verificação. Controle total sobre as operações da
              plataforma Faça Login .
            </p>
          </div>

          {/* Management Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-teal-600/20 p-2 rounded-lg">
                <Users className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gestão de Usuários</h3>
                <p className="text-slate-400">
                  Administre contas de empresas, motoristas e operadores
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-600/20 p-2 rounded-lg">
                <FileCheck className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Controle de Verificações
                </h3>
                <p className="text-slate-400">
                  Supervisione e aprove processos de verificação de antecedentes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-pink-600/20 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Relatórios Gerenciais</h3>
                <p className="text-slate-400">
                  Análises detalhadas e métricas de performance operacional
                </p>
              </div>
            </div>
          </div>

          {/* Management Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">847</div>
              <div className="text-sm text-slate-400">Empresas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">12.4K</div>
              <div className="text-sm text-slate-400">Verificações</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">94.2%</div>
              <div className="text-sm text-slate-400">Taxa Aprovação</div>
            </div>
          </div>

          {/* Management Notice */}
          <div className="bg-teal-900/20 border border-teal-800/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <UserCog className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-teal-300 mb-1">
                  Acesso Gerencial
                </p>
                <p className="text-blue-200/80">
                  Este painel permite o controle completo das operações de
                  verificação, gestão de usuários e análise de dados da
                  plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Admin Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 shadow-teal-500/10">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-2 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-2">
                  <span className="text-xl font-bold text-slate-800">
                    Faça Login
                  </span>
                  <Badge className="bg-teal-600 text-white hover:bg-teal-600 ml-2 text-xs">
                    MANAGER
                  </Badge>
                </div>
              </div>

              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                  <UserCog className="h-6 w-6 text-teal-600" />
                  Painel Gerencial
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Acesso para gestores e administradores da plataforma
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Email Gerencial
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="gestor@thiagosecure.com"
                            type="email"
                            className="h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Senha de Acesso
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••••••"
                              type={showPassword ? "text" : "password"}
                              className="h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500 pr-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-medium shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Autenticando...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Acessar Painel Gerencial
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300" />
                    </div>
                  </div>
                </form>
              </Form>

              <div className="text-center">
                <div className="text-sm text-slate-600">
                  <Link
                    href="/authentication"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ← Voltar a área de clientes
                  </Link>
                </div>
              </div>

              {/* Management Notice */}
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-teal-800">
                    <p className="font-medium mb-1">Acesso Gerencial</p>
                    <p>
                      Painel destinado a gestores para administração de
                      usuários, empresas e processos de verificação da
                      plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Sessão gerencial segura</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Conexão protegida</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
