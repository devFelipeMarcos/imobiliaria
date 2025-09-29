"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
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
import { toast } from "sonner";

const corretorSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z
    .string()
    .min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  cpf: z
    .string()
    .regex(/^\d{11}$/, { message: "CPF deve ter 11 dígitos" }),
  senha: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type CorretorFormValues = z.infer<typeof corretorSchema>;

export default function CadastrarCorretorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<CorretorFormValues>({
    resolver: zodResolver(corretorSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      senha: "",
    },
  });

  const onSubmit = async (values: CorretorFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/corretor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao cadastrar corretor");
      }

      toast.success("Corretor cadastrado com sucesso!", {
        description: "O corretor foi adicionado ao sistema e pode fazer login.",
        icon: <CheckCircle className="h-4 w-4" />,
      });

      form.reset();
      router.push("/administrador");
    } catch (error) {
      console.error("Erro ao cadastrar corretor:", error);
      toast.error("Erro ao cadastrar corretor", {
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cadastrar Corretor
          </h1>
          <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto px-4 md:px-0">
            Adicione um novo corretor ao sistema CRM da imobiliária
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:bg-white/10 border border-white/20 text-sm md:text-base"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            Voltar
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center p-4 md:p-6">
            <CardTitle className="text-lg md:text-2xl flex items-center justify-center gap-2 text-white">
              <User className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
              Informações do Corretor
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm md:text-base">
              Preencha os dados do corretor para cadastrá-lo no sistema
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
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <User className="h-3 w-3 md:h-4 md:w-4" />
                          Nome Completo
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
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="corretor@exemplo.com"
                            {...field}
                            className="h-10 md:h-11 text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Telefone */}
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                          Telefone *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            className="h-10 md:h-11 text-sm md:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CPF */}
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
                          CPF *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678901"
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
                    name="senha"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/administrador/corretores")}
                    className="flex-1 h-10 md:h-11 text-sm md:text-base border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                    <span className="sm:hidden">Voltar</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-10 md:h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg text-sm md:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        <span className="hidden sm:inline">Cadastrando...</span>
                        <span className="sm:hidden">Salvando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Cadastrar Corretor</span>
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