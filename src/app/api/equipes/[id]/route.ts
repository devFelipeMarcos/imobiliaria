import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateEquipeSchema = z.object({
  ativo: z.boolean(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = (session.user as unknown) as { role?: string; imobiliariaId?: string };
    const allowedRoles = ["ADMIN", "SUPER_ADMIN", "ADMFULL"];
    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const data = updateEquipeSchema.parse(body);

    const equipe = await (prisma as any).equipe.findUnique({
      where: { id },
    });

    if (!equipe) {
      return NextResponse.json({ error: "Equipe não encontrada" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      if (!user.imobiliariaId || equipe.imobiliariaId !== user.imobiliariaId) {
        return NextResponse.json({ error: "Equipe não pertence à sua imobiliária" }, { status: 403 });
      }
    }

    const updated = await (prisma as any).equipe.update({
      where: { id },
      data: { ativo: data.ativo },
      include: {
        imobiliaria: { select: { id: true, nome: true } },
        _count: { select: { usuarios: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      nome: updated.nome,
      ativo: updated.ativo,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      totalUsuarios: updated._count?.usuarios ?? 0,
      imobiliaria: updated.imobiliaria,
    });
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}