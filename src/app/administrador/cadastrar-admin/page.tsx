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
  User,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle,
  Shield,
  UserPlus,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const adminSchema = z
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
    role: z.enum(["ADMIN"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type AdminFormValues = z.infer<typeof adminSchema>;

export default function CadastrarAdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  async function onSubmit(formData: AdminFormValues) {
    setIsLoading(true);
    
    try {
      // Primeiro, criar o usuário com better-auth
      const { data, error } = await authClient.signUp.email(
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          onRequest: (ctx) => {},
          onSuccess: async (ctx) => {
            // Após criar o usuário, atualizar o role para ADMIN
            try {
              const response = await fetch("/api/admin/update-role", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: ctx.data.user.id,
                  role: formData.role,
                  status: formData.status,
                }),
              });

              if (!response.ok) {
                throw new Error("Erro ao definir permissões de admin");
              }

              toast.success("Admin cadastrado com sucesso!", {
                description: "O administrador foi adicionado ao sistema.",
                icon: <CheckCircle className="h-4 w-4" />,
              });

              form.reset();
              router.push("/administrador");
            } catch (error) {
              console.error("Erro ao definir permissões:", error);
              toast.error("Usuário criado, mas erro ao definir permissões", {
                description: "Contate o suporte técnico.",
              });
            }
          },
          onError: (ctx) => {
            if (ctx.error.code === "USER_ALREADY_EXISTS") {
              toast.error("E-mail já cadastrado!");
            } else {
              toast.error(`Erro ao cadastrar: ${ctx.error.message}`);
            }
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Erro ao cadastrar admin:", error);
      toast.error("Erro ao cadastrar administrador");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cadastrar Administrador
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto px-4">
            Adicione um novo administrador ao sistema CRM da imobiliária
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:bg-white/10 text-sm"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            Voltar
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="space-y-1 text-center p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl lg:text-2xl flex items-center justify-center gap-2 text-white">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
              Informações do Administrador
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm md:text-base">
              Preencha os dados do administrador para cadastrá-lo no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <User className="h-3 w-3 md:h-4 md:w-4" />
                          Nome Completo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
                            {...field}
                            className="h-10 md:h-11 text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Mail className="h-3 w-3 md:h-4 md:w-4" />
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@exemplo.com"
                            {...field}
                            className="h-10 md:h-11 text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Senha */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                          Senha *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite a senha"
                              {...field}
                              className="h-10 md:h-11 pr-10 text-sm md:text-base"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-2 md:px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirmar Senha */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                          Confirmar Senha *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme a senha"
                              {...field}
                              className="h-10 md:h-11 pr-10 text-sm md:text-base"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-2 md:px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                              ) : (
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-10 md:h-11 text-sm md:text-base"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-10 md:h-11 text-sm md:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span className="hidden sm:inline">Cadastrando...</span>
                        <span className="sm:hidden">Aguarde...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Cadastrar Admin</span>
                        <span className="sm:hidden">Cadastrar</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}