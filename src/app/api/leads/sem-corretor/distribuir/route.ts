import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role = session.user.role || "";
    if (!["ADMIN", "ADMFULL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const imobiliariaId = role === "ADMIN" ? session.user.imobiliariaId : (await request.json().catch(() => ({}))).imobiliariaId || session.user.imobiliariaId;
    if (!imobiliariaId) {
      return NextResponse.json({ error: "Imobiliária não definida" }, { status: 400 });
    }

    const corretores = await prisma.user.findMany({
      where: { role: "CORRETOR", imobiliariaId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    if (corretores.length === 0) {
      return NextResponse.json({ error: "Nenhum corretor ativo encontrado" }, { status: 400 });
    }

    const leadsSemCorretor = await prisma.lead.findMany({
      where: { imobiliariaId, userId: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (leadsSemCorretor.length === 0) {
      return NextResponse.json({ message: "Nenhum lead sem corretor" });
    }

    // Obter contagem atual por corretor
    const contagens = new Map<string, number>();
    for (const c of corretores) {
      const count = await prisma.lead.count({ where: { imobiliariaId, userId: c.id } });
      contagens.set(c.id, count);
    }

    const atribuicoes: Array<{ leadId: string; corretorId: string }> = [];

    for (const lead of leadsSemCorretor) {
      // Encontrar corretor com menor contagem
      let escolhido = corretores[0].id;
      let menor = contagens.get(escolhido) ?? 0;
      for (const c of corretores) {
        const qtd = contagens.get(c.id) ?? 0;
        if (qtd < menor) {
          menor = qtd;
          escolhido = c.id;
        }
      }
      atribuicoes.push({ leadId: lead.id, corretorId: escolhido });
      contagens.set(escolhido, menor + 1);
    }

    // Executar atualizações
    for (const a of atribuicoes) {
      await prisma.lead.update({ where: { id: a.leadId }, data: { userId: a.corretorId } });
    }

    return NextResponse.json({ success: true, atribuicoes: atribuicoes.length });
  } catch (error) {
    console.error("Erro ao distribuir leads:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}