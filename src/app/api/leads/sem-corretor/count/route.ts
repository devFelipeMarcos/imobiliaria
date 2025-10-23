import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = session.user.role || "";
    if (!["ADMIN", "ADMFULL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const imobiliariaId = role === "ADMIN" ? session.user.imobiliariaId : (request.nextUrl.searchParams.get("imobiliariaId") || session.user.imobiliariaId);
    if (!imobiliariaId) {
      return NextResponse.json({ error: "Imobiliária não definida" }, { status: 400 });
    }

    const count = await prisma.lead.count({ where: { userId: null, imobiliariaId } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erro ao contar leads sem corretor:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}