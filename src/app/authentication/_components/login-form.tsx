"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { TwitchLogo } from "@phosphor-icons/react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
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
    const { data, error } = await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onRequest: (ctx) => {},

        onSuccess: (ctx) => {
          console.log(ctx);
          toast.success("Login realizado com sucesso!");
          router.replace("/");
        },

        onError: (ctx) => {
          if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            toast.error("401 - E-mail ou senha incorreta!");
          } else {
            toast.error(ctx.error.message);
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="seu@email.com"
                  type="email"
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
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
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
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Esconder senha" : "Mostrar senha"}
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
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-[#DB4437] text-white hover:bg-[#c33d2f] hover:text-white"
          onClick={loginWithGoogle} // mantenha essa função se ela já está implementada para o Google
        >
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            fill="currentColor"
          >
            <path d="M488 261.8c0-17.8-1.6-35-4.6-51.6H249v97.7h135.5c-5.8 31-23 57.2-49.3 75.1v62.3h79.7c46.7-43 73.6-106.5 73.6-183.5zM249 492c66.7 0 122.7-22.2 163.6-60.3l-79.7-62.3c-22.2 15-50.6 23.8-83.9 23.8-64.6 0-119.4-43.6-139-102.2H29.1v64.1C69.9 439.6 152.4 492 249 492zM110 299.3c-4.9-14.8-7.7-30.6-7.7-46.8s2.8-32 7.7-46.8v-64.1H29.1C10.4 174 0 209.7 0 256s10.4 82 29.1 114.7L110 299.3zM249 100.5c36.2 0 68.6 12.4 94.2 36.6l70.6-70.6C371.6 28.1 316.1 0 249 0 152.4 0 69.9 52.4 29.1 133.3l80.9 64.1c19.6-58.6 74.4-102.2 139-102.2z" />
          </svg>
          Entrar com Google
        </Button>
      </form>
    </Form>
  );
}
