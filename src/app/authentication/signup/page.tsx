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
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Shield,
  Zap,
  Globe,
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
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { logUserRegistration } from "@/app/audit/actions";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "A senha deve conter letras maiúsculas, minúsculas e números",
      }),
    confirmPassword: z.string().min(8, {
      message: "A confirmação de senha deve ter pelo menos 8 caracteres",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Performance",
      description: "Experiência rápida e responsiva em todos os dispositivos",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança",
      description: "Proteção de dados com criptografia avançada",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Acessibilidade",
      description: "Interface acessível para todos os usuários",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Confiabilidade",
      description: "Sistema estável e sempre disponível",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(formData: SignupFormValues) {
    setIsLoading(true);
    const { data, error } = await authClient.signUp.email(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      },
      {
        onRequest: (ctx) => {},

        onSuccess: async (ctx) => {
          // Log do cadastro bem-sucedido
          if (ctx.data?.user?.id) {
            await logUserRegistration(ctx.data.user.id);
          }
          
          toast.success("Cadastro realizado com sucesso!");
          router.replace("/");
        },

        onError: (ctx) => {
          if (ctx.error.code === "USER_ALREADY_EXISTS") {
            toast.error(`E-mail já cadastrado!`);
          } else {
            toast.error(`Erro ao cadastrar ${ctx.error.message}`);
          }
          console.log(ctx);
          setIsLoading(false);
        },
      }
    );
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
              Sua Plataforma
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">
              Comece sua <span className="text-purple-400">Jornada</span>
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
            <span className="text-sm">Sistema seguro e confiável</span>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-purple-500/10">
            <CardHeader className="space-y-6 pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Criar Conta
                </CardTitle>
                <CardDescription className="mt-2 text-white/70">
                  Preencha os dados abaixo para criar sua conta
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium">
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              placeholder="Seu nome completo"
                              {...field}
                              disabled={isLoading}
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

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
                              placeholder="seu@email.com"
                              type="email"
                              {...field}
                              disabled={isLoading}
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                              {...field}
                              disabled={isLoading}
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 font-medium">
                          Confirmar Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              placeholder="••••••••"
                              type={showConfirmPassword ? "text" : "password"}
                              {...field}
                              disabled={isLoading}
                              className="h-12 bg-white/5 border-white/10 text-white pl-10 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/5 text-white/50"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
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
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Criar Conta
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="text-center pt-4">
                <div className="text-sm text-white/70">
                  Já tem uma conta?{" "}
                  <Link
                    href="/authentication"
                    className="font-medium text-white hover:text-purple-300 hover:underline transition-colors"
                  >
                    Fazer login
                  </Link>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-white/70">
                    <p className="font-medium mb-1 text-white">
                      Privacidade Garantida
                    </p>
                    <p>
                      Seus dados estão protegidos e nunca serão compartilhados
                      sem sua permissão
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
