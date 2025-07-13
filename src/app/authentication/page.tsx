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
  Truck,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
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
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  async function onSubmit(formData: LoginFormValues) {
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

    const user = sessionData?.user as { status?: string };

    // 3) verifica o status
    if (user?.status !== "ACTIVE") {
      toast.error(
        "Acesso negado. Seu usuário está inativo, favor entrar em contato com o suporte."
      );
      return;
    }

    // 4) só então redireciona
    toast.success("Login realizado com sucesso!");
    router.replace("/cliente/consulta");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Thiago Secure</h1>
                <p className="text-blue-200">Verificação & Antecedentes</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Segurança e Confiabilidade em{" "}
              <span className="text-blue-400">Logística</span>
            </h2>

            <p className="text-xl text-slate-300 leading-relaxed">
              Plataforma líder em verificação de dados e checagem de
              antecedentes para o setor logístico. Protegemos sua cadeia de
              suprimentos com tecnologia de ponta.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-green-600/20 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verificação Completa</h3>
                <p className="text-slate-400">
                  Análise detalhada de antecedentes criminais e histórico
                  profissional
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Logística Segura</h3>
                <p className="text-slate-400">Segurança em 1° lugar</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-600/20 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Relatórios Detalhados</h3>
                <p className="text-slate-400">
                  Dashboard completo com métricas e análises avançadas
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">99.9%</div>
              <div className="text-sm text-slate-400">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">24/7</div>
              <div className="text-sm text-slate-400">Suporte</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">500K+</div>
              <div className="text-sm text-slate-400">Verificações</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-slate-800">
                  Thiago Secure
                </span>
              </div>

              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                Acesso Seguro
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                Entre com suas credenciais para acessar a plataforma de
                verificação
              </CardDescription>
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
                          Email Corporativo
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="usuario@empresa.com"
                            type="email"
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
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
                              <span className="sr-only">
                                {showPassword
                                  ? "Esconder senha"
                                  : "Mostrar senha"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Acessar Plataforma
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center space-y-4">
                <div className="text-sm text-slate-600">
                  Não tem acesso?{" "}
                  <Link
                    href="/authentication/signup"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Solicitar credenciais
                  </Link>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-slate-600">
                    <p className="font-medium mb-1">Acesso Seguro</p>
                    <p>
                      Suas credenciais são protegidas com criptografia de ponta
                    </p>
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
