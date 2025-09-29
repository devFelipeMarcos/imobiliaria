"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Lock,
  Save,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// Schema de validação
const clientSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function CadastrarClientesPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Função para gerar senha aleatória
  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Garantir pelo menos um de cada tipo
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Completar o resto da senha
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Embaralhar a senha
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    form.setValue("password", newPassword);
    toast.success("Senha gerada com sucesso!");
  };

  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);

    try {
      const pass = data.password || generateRandomPassword();
      const email = data.email.toLowerCase();
      const name = data.name.trim();

      const newUser = await authClient.signUp.email(
        {
          name: name,
          email: email,
          password: pass,
          callbackURL: "/",
        },
        {
          onRequest: (ctx) => {},

          onSuccess: (ctx) => {
            toast.success("Cadastro realizado com sucesso!");
            console.log(ctx);
          },

          onError: (ctx) => {
            if (ctx.error.code === "USER_ALREADY_EXISTS") {
              toast.error(`E-mail já cadastrado!`);
            } else {
              toast.error(`Erro ao cadastrar ${ctx.error.message}`);
            }
            console.log(ctx);
          },
        }
      );

      // Limpar formulário após sucesso
      form.reset();
    } catch (error) {
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Cadastrar Cliente
          </h1>
          <p className="text-gray-300 text-sm md:text-base px-4 md:px-0">
            Adicione um novo cliente à plataforma LogiSecure. Preencha as
            informações abaixo para criar uma nova conta.
          </p>
        </div>

        {/* Formulário */}
        <Card className="border border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center space-x-2 text-white text-lg md:text-xl">
              <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              <span>Informações do Cliente</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm md:text-base">
              Preencha os dados básicos para criar uma nova conta de cliente
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
              >
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium flex items-center space-x-2 text-sm md:text-base">
                        <User className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                        <span>Nome Completo</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo do cliente"
                          className="h-10 md:h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 text-sm md:text-base"
                          {...field}
                          disabled={isLoading}
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
                      <FormLabel className="text-white font-medium flex items-center space-x-2 text-sm md:text-base">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="cliente@empresa.com"
                          type="email"
                          className="h-10 md:h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 text-sm md:text-base"
                          {...field}
                          disabled={isLoading}
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
                      <FormLabel className="text-white font-medium flex items-center space-x-2 text-sm md:text-base">
                        <Lock className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                        <span>Senha</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Digite ou gere uma senha"
                            type={showPassword ? "text" : "password"}
                            className="h-10 md:h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 pr-16 md:pr-20 text-sm md:text-base"
                            {...field}
                            disabled={isLoading}
                          />
                          <div className="absolute right-1 top-1 flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-slate-100"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
                              ) : (
                                <Eye className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-purple-100"
                              onClick={handleGeneratePassword}
                              disabled={isLoading}
                              title="Gerar senha aleatória"
                            >
                              <RefreshCw className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs md:text-sm text-slate-500 mt-1">
                        A senha deve ter pelo menos 8 caracteres. Use o botão de
                        gerar para criar uma senha segura.
                      </p>
                    </FormItem>
                  )}
                />

                {/* Botões */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-3 md:pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                    className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-10 md:h-11 text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">Limpar Formulário</span>
                    <span className="sm:hidden">Limpar</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 md:px-8 h-10 md:h-11 text-sm md:text-base"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span className="hidden sm:inline">Cadastrando...</span>
                        <span className="sm:hidden">Aguarde...</span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Cadastrar Cliente</span>
                        <span className="sm:hidden">Cadastrar</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="bg-white/5 border border-white/20 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 p-1 rounded flex-shrink-0">
                <Lock className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <div className="text-xs md:text-sm">
                <p className="font-medium text-white mb-1 text-sm md:text-base">
                  Segurança da Senha
                </p>
                <ul className="text-gray-300 space-y-1">
                  <li>• Senhas geradas automaticamente são mais seguras</li>
                  <li>
                    • Contêm letras maiúsculas, minúsculas, números e símbolos
                  </li>
                  <li>• O cliente poderá alterar a senha no primeiro acesso</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
