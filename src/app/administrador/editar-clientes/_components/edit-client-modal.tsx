"use client";

import React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Edit,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Schema para edição de cliente
const editClientSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  role: z.enum(["USER", "ADMIN"], { message: "Role deve ser USER ou ADMIN" }),
  cpfCnpj: z.string().optional(),
  telefone: z.string().optional(),
  preco: z.string().optional(),
});

type EditClientFormValues = z.infer<typeof editClientSchema>;

// Tipo para o usuário completo
export type UserWithDetails = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  userDetails?: {
    id: string;
    nome: string | null;
    preco: number | null;
    cpfCnpj: string | null;
    telefone: string | null;
  };
};

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  onSave: (userId: string, data: EditClientFormValues) => Promise<void>;
  isLoading: boolean;
}

export function EditClientModal({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading,
}: EditClientModalProps) {
  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      nome: "",
      email: "",
      role: "USER",
      cpfCnpj: "",
      telefone: "",
      preco: "",
    },
  });

  // Atualizar formulário quando o usuário mudar
  React.useEffect(() => {
    if (user && isOpen) {
      form.reset({
        nome: user.userDetails?.nome || user.name,
        email: user.email,
        role: user.role,
        cpfCnpj: user.userDetails?.cpfCnpj || "",
        telefone: user.userDetails?.telefone || "",
        preco: user.userDetails?.preco?.toString() || "",
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (data: EditClientFormValues) => {
    if (!user) return;

    try {
      await onSave(user.id, data);
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar cliente");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-purple-600" />
            <span>Editar Cliente</span>
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente. Todos os campos são opcionais
            exceto nome e email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nome Completo</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo do cliente"
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
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@exemplo.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">Usuário</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF/CNPJ */}
              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>CPF/CNPJ</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        disabled={isLoading}
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
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Telefone</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preço */}
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Preço</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="150.00"
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
