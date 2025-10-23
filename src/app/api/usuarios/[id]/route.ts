import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  equipeId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const actor = (session.user as unknown) as { role?: string; imobiliariaId?: string };
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    if (!allowedRoles.includes(actor.role as string)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        status: true,
        imobiliariaId: true,
        equipeId: true,
        email: true,
      },
    });

    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // ADMIN só pode alterar usuários da própria imobiliária
    if (actor.role === "ADMIN") {
      if (!actor.imobiliariaId || target.imobiliariaId !== actor.imobiliariaId) {
        return NextResponse.json({ error: "Usuário não pertence à sua imobiliária" }, { status: 403 });
      }
      // ADMIN não deve alterar usuários que não sejam CORRETOR
      if (target.role !== "CORRETOR") {
        return NextResponse.json({ error: "Administradores só podem alterar corretores" }, { status: 403 });
      }
    }

    const updateData: any = {};

    if (typeof data.status !== "undefined") {
      updateData.status = data.status;
    }

    if (typeof data.equipeId !== "undefined") {
      // Validar equipe, se fornecida
      if (data.equipeId === null) {
        updateData.equipeId = null;
      } else if (data.equipeId) {
        const equipe = await (prisma as any).equipe.findUnique({ where: { id: data.equipeId } });
        if (!equipe) {
          return NextResponse.json({ error: "Equipe não encontrada" }, { status: 404 });
        }
        // Equipe deve pertencer à mesma imobiliária do usuário alvo
        if (target.imobiliariaId && equipe.imobiliariaId !== target.imobiliariaId) {
          return NextResponse.json({ error: "Equipe não pertence à mesma imobiliária do usuário" }, { status: 400 });
        }
        // ADMIN só pode usar equipe da própria imobiliária
        if (actor.role === "ADMIN" && actor.imobiliariaId && equipe.imobiliariaId !== actor.imobiliariaId) {
          return NextResponse.json({ error: "Equipe não pertence à sua imobiliária" }, { status: 403 });
        }
        updateData.equipeId = data.equipeId;
      }
    }

    // Atualização de nome
    if (typeof data.name !== "undefined") {
      updateData.name = data.name;
    }

    // Atualização de email com verificação de unicidade
    if (typeof data.email !== "undefined") {
      const newEmail = data.email.trim();
      if (newEmail !== target.email) {
        const existingByEmail = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existingByEmail && existingByEmail.id !== target.id) {
          return NextResponse.json({ error: "Email já está em uso" }, { status: 400 });
        }
      }
      updateData.email = newEmail;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhuma alteração fornecida" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        imobiliariaId: true,
        createdAt: true,
        imobiliaria: { select: { id: true, nome: true } },
        equipe: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}