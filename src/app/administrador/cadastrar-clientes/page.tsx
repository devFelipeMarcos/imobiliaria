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
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Cadastrar Cliente
          </h1>
          <p className="text-slate-600">
            Adicione um novo cliente à plataforma LogiSecure. Preencha as
            informações abaixo para criar uma nova conta.
          </p>
        </div>

        {/* Formulário */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <span>Informações do Cliente</span>
            </CardTitle>
            <CardDescription>
              Preencha os dados básicos para criar uma nova conta de cliente
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Nome Completo</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo do cliente"
                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
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
                      <FormLabel className="text-slate-700 font-medium flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="cliente@empresa.com"
                          type="email"
                          className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
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
                      <FormLabel className="text-slate-700 font-medium flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Senha</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Digite ou gere uma senha"
                            type={showPassword ? "text" : "password"}
                            className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500 pr-20"
                            {...field}
                            disabled={isLoading}
                          />
                          <div className="absolute right-1 top-1 flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-slate-100"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-500" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-purple-100"
                              onClick={handleGeneratePassword}
                              disabled={isLoading}
                              title="Gerar senha aleatória"
                            >
                              <RefreshCw className="h-4 w-4 text-purple-600" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-slate-500 mt-1">
                        A senha deve ter pelo menos 8 caracteres. Use o botão de
                        gerar para criar uma senha segura.
                      </p>
                    </FormItem>
                  )}
                />

                {/* Botões */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Limpar Formulário
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-8"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Cadastrar Cliente
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 p-1 rounded">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-purple-800 mb-1">
                  Segurança da Senha
                </p>
                <ul className="text-purple-700 space-y-1">
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
