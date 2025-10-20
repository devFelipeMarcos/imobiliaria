import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar mensagens de remarketing do corretor
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Verificar se é um corretor
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const diasDisparo = searchParams.get("diasDisparo");
    const status = searchParams.get("status");

    let whereClause: any = {
      idcorretor: user.id, // Apenas mensagens do corretor logado
    };

    // Filtro por dias de disparo
    if (diasDisparo) {
      whereClause.dias_disparo = parseInt(diasDisparo);
    }

    // Filtro por status
    if (status !== null) {
      whereClause.status = status === "true";
    }

    const mensagens = await prisma.mensagemRemarketing.findMany({
      where: whereClause,
      orderBy: {
        dias_disparo: "asc",
      },
    });

    return NextResponse.json({ mensagens });
  } catch (error) {
    console.error("Erro ao buscar mensagens de remarketing:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova mensagem de remarketing
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Verificar se é um corretor
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { mensagem, dias_disparo } = body;

    // Validações
    if (!mensagem || !mensagem.trim()) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (!dias_disparo || ![1, 2, 7, 14, 30].includes(dias_disparo)) {
      return NextResponse.json(
        { error: "Dias de disparo deve ser 1, 2, 7, 14 ou 30" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma mensagem para este corretor e dias de disparo
    const mensagemExistente = await prisma.mensagemRemarketing.findUnique({
      where: {
        idcorretor_dias_disparo: {
          idcorretor: user.id,
          dias_disparo: dias_disparo,
        },
      },
    });

    if (mensagemExistente) {
      return NextResponse.json(
        { error: `Já existe uma mensagem cadastrada para ${dias_disparo} dias` },
        { status: 400 }
      );
    }

    const novaMensagem = await prisma.mensagemRemarketing.create({
      data: {
        mensagem: mensagem.trim(),
        idcorretor: user.id,
        dias_disparo,
      },
    });

    return NextResponse.json({ mensagem: novaMensagem }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar mensagem de remarketing:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar mensagem de remarketing
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Verificar se é um corretor
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { id, mensagem, status } = body;

    // Validações
    if (!id) {
      return NextResponse.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    if (!mensagem || !mensagem.trim()) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se a mensagem pertence ao corretor
    const mensagemExistente = await prisma.mensagemRemarketing.findFirst({
      where: {
        id,
        idcorretor: user.id,
      },
    });

    if (!mensagemExistente) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    const mensagemAtualizada = await prisma.mensagemRemarketing.update({
      where: { id },
      data: {
        mensagem: mensagem.trim(),
        status: status !== undefined ? status : mensagemExistente.status,
      },
    });

    return NextResponse.json({ mensagem: mensagemAtualizada });
  } catch (error) {
    console.error("Erro ao atualizar mensagem de remarketing:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar mensagem de remarketing
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    // Verificar se é um corretor
    if (user.role !== "CORRETOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a mensagem pertence ao corretor
    const mensagemExistente = await prisma.mensagemRemarketing.findFirst({
      where: {
        id,
        idcorretor: user.id,
      },
    });

    if (!mensagemExistente) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    await prisma.mensagemRemarketing.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Mensagem deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar mensagem de remarketing:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}