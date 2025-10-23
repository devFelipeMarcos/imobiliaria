import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = session.user.role || "";
    if (!["ADMIN", "ADMFULL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await context.params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Se ADMIN, validar que lead e corretor são da mesma imobiliária
    if (role === "ADMIN") {
      if (lead.imobiliariaId !== session.user.imobiliariaId) {
        return NextResponse.json({ error: "Lead não pertence à sua imobiliária" }, { status: 403 });
      }
      const corretor = await prisma.user.findUnique({ where: { id: userId } });
      if (!corretor || corretor.role !== "CORRETOR" || corretor.imobiliariaId !== session.user.imobiliariaId) {
        return NextResponse.json({ error: "Corretor inválido para sua imobiliária" }, { status: 400 });
      }
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { userId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao associar corretor ao lead:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}