import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const allowedRoles = ["CORRETOR", "ADMIN", "SUPER_ADMIN", "ADMFULL"];
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { titulo, descricao, mensagemPersonalizada } = body;

    if (!titulo?.trim()) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    let corretorId: string;

    if (user.role === "CORRETOR") {
      // Usar diretamente o ID do usuário
      corretorId = user.id;
    } else {
      // Para outros roles, seria necessário especificar o corretor
      // Por enquanto, vamos retornar erro para não-corretores
      return NextResponse.json({ 
        error: "Funcionalidade disponível apenas para corretores" 
      }, { status: 403 });
    }

    // Gerar um ID único para o link
    const linkId = `${corretorId}-${Date.now()}`;
    
    // Criar URL base (você pode ajustar conforme seu domínio)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const linkGerado = `${baseUrl}/capturar-lead/${linkId}`;

    // Salvar configurações do link no banco (opcional - você pode criar uma tabela para isso)
    // Por enquanto, vamos apenas retornar o link com os parâmetros codificados

    const linkParams = new URLSearchParams({
      corretor: corretorId,
      titulo: titulo.trim(),
      ...(descricao?.trim() && { descricao: descricao.trim() }),
      ...(mensagemPersonalizada?.trim() && { mensagem: mensagemPersonalizada.trim() }),
    });

    const linkCompleto = `${linkGerado}?${linkParams.toString()}`;

    return NextResponse.json({
      link: linkCompleto,
      linkId,
      corretorId,
    });

  } catch (error) {
    console.error("Erro ao gerar link:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}