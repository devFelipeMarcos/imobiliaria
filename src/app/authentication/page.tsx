"use client";

import { useState, useEffect } from "react";
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
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
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
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verificação Segura",
      description: "Sistema de verificação de documentos confiável",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Rastreamento em Tempo Real",
      description: "Acompanhe entregas com precisão",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Relatórios Detalhados",
      description: "Dados analíticos para melhor decisão",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Validação Confiável",
      description: "Processos validados e certificados",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

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
    setIsLoading(true);
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

    if (signInError) {
      setIsLoading(false);
      return;
    }

    // 2) pega a sessão completa (já com status)
    const { data: sessionData } = await authClient.getSession();

    const user = sessionData?.user as { status?: string };

    // 3) verifica o status
    if (user?.status !== "ACTIVE") {
      toast.error(
        "Acesso negado. Seu usuário está inativo, favor entrar em contato com o suporte."
      );
      setIsLoading(false);
      return;
    }

    // 4) só então redireciona
    toast.success("Login realizado com sucesso!");
    router.replace("/cliente/consulta");
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center mb-16">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">
              Faça Login
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">
              Plataforma de Verificação{" "}
              <span className="text-purple-400">Segura</span>
            </h2>

            <div className="h-40 mb-8 relative">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-purple-200">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/30"
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-white/60">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Sistema seguro e certificado</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-purple-500/10">
            <CardHeader className="space-y-6 pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Acesso Seguro
                </CardTitle>
                <CardDescription className="mt-2 text-white/70">
                  Entre com suas credenciais para acessar a plataforma
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              placeholder="usuario@empresa.com"
                              type="email"
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/5 text-white/50"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          Acessar Plataforma
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="text-center pt-4">
                <div className="text-sm text-white/70">
                  Não tem acesso?{" "}
                  <Link
                    href="/authentication/signup"
                    className="font-medium text-white hover:text-purple-300 hover:underline transition-colors"
                  >
                    Solicitar credenciais
                  </Link>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-white/70">
                    <p className="font-medium mb-1 text-white">
                      Acesso Protegido
                    </p>
                    <p>
                      Suas credenciais são criptografadas e protegidas com
                      tecnologia avançada
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
