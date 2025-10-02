"use server";

import { prisma } from "@/lib/prisma";

interface N8nWebhookData {
  number: string;
  text: string;
  instance: string;
  token: string;
}

interface UsuarioData {
  id: string;
  name: string;
}

interface ImobiliariaData {
  nome: string;
}

/**
 * Dispara webhook para n8n quando um novo lead é criado
 * @param telefone - Número de telefone do lead
 * @param nomeCompleto - Nome completo do lead
 * @param usuario - Dados do usuário (corretor)
 * @param imobiliaria - Dados da imobiliária
 */
export async function triggerN8nWebhook(
  telefone: string,
  nomeCompleto: string,
  usuario: UsuarioData,
  imobiliaria: ImobiliariaData
) {
  try {
    console.log("🔍 [DEBUG] Iniciando webhook n8n com dados:", {
      telefone,
      nomeCompleto,
      usuario: { id: usuario.id, name: usuario.name },
      imobiliaria: { nome: imobiliaria.nome },
    });

    // Função auxiliar para extrair o primeiro nome
    const extrairPrimeiroNome = (nome: string): string => {
      return nome.trim().split(" ")[0];
    };

    // Função auxiliar para limpar nome (remover caracteres especiais)
    const limparNome = (nome: string): string => {
      return nome.replace(/[^a-zA-Z0-9]/g, "");
    };

    // Extrai o primeiro nome
    const primeiroNome = extrairPrimeiroNome(nomeCompleto);
    console.log("🔍 [DEBUG] Primeiro nome extraído:", primeiroNome);

    // Limpa e formata o número de telefone
    let numeroLimpo = telefone.replace(/\D/g, "");
    console.log("🔍 [DEBUG] Número limpo inicial:", numeroLimpo);

    // Adiciona código do país se não estiver presente
    if (!numeroLimpo.startsWith("55")) {
      numeroLimpo = "55" + numeroLimpo;
    }
    console.log("🔍 [DEBUG] Número final formatado:", numeroLimpo);

    // Tenta obter a instância do WhatsApp vinculada ao corretor para usar nome e token reais
    const instanciaBanco = await prisma.whatsAppInstance.findFirst({
      where: { userId: usuario.id },
    });
    if (instanciaBanco) {
      console.log("🔍 [DEBUG] Instância encontrada no banco:", {
        id: instanciaBanco.id,
        instanceName: instanciaBanco.instanceName,
        hasToken: Boolean(instanciaBanco.token),
      });
    } else {
      console.warn(
        "⚠️ [DEBUG] Nenhuma instância do WhatsApp encontrada para o usuário. Usando nome gerado e sem token."
      );
    }

    // Gera nome da instância como fallback: nomeCorretora_nomeCorretor_idUser
    const nomeCorretora = limparNome(imobiliaria.nome);
    const nomeCorretor = limparNome(usuario.name);
    const instanceNameFallback = `${nomeCorretora}_${nomeCorretor}_${usuario.id}`;
    const instanceName = instanciaBanco?.instanceName || instanceNameFallback;
    const token = instanciaBanco?.token || "";
    console.log("🔍 [DEBUG] Nome da instância usado:", instanceName);
    if (!token) {
      console.warn(
        "⚠️ [DEBUG] Token da instância não disponível; prosseguindo sem token."
      );
    } else {
      console.log("🔍 [DEBUG] Token da instância presente e será enviado.");
    }

    // Monta a mensagem personalizada
    const mensagem =
      `✅ Boas notícias ${primeiroNome}! Recebi o seu cadastro no programa Minha Casa Minha Vida 🏠\n\n` +
      `📋 Estou entrando em contato para prosseguir com o seu atendimento personalizado\n\n` +
      `🔗 Em breve você receberá mais informações sobre:\n` +
      `• Documentação necessária 📄\n` +
      `• Processo de aprovação ✅\n` +
      `• Opções de imóveis disponíveis 🏡\n\n` +
      `📞 Qualquer dúvida, estamos à disposição!`;
    console.log("🔍 [DEBUG] Mensagem personalizada:", mensagem);

    // Dados para enviar ao webhook (escapando quebras de linha para JSON válido)
    const webhookData: N8nWebhookData = {
      number: numeroLimpo,
      text: mensagem.replace(/\n/g, "\\n"),
      instance: instanceName,
      token,
    };

    console.log("🚀 [DEBUG] Dados completos para webhook:", webhookData);
    console.log(
      "🌐 [DEBUG] URL do webhook:",
      "https://n8n.felipemarcos.site/webhook/corretora"
    );

    // Faz a requisição para o webhook do n8n
    const response = await fetch(
      "https://n8n.felipemarcos.site/webhook/corretora",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      }
    );

    console.log("📡 [DEBUG] Resposta recebida - Status:", response.status);
    console.log(
      "📡 [DEBUG] Resposta recebida - Status Text:",
      response.statusText
    );

    // Tenta ler o corpo da resposta
    let responseBody;
    try {
      responseBody = await response.text();
      console.log("📡 [DEBUG] Corpo da resposta:", responseBody);
    } catch (bodyError) {
      console.log("⚠️ [DEBUG] Erro ao ler corpo da resposta:", bodyError);
    }

    if (response.ok) {
      console.log("✅ [DEBUG] Webhook n8n executado com sucesso!");
      console.log("✅ [DEBUG] Dados enviados:", webhookData);
    } else {
      console.error("❌ [DEBUG] Erro ao executar webhook n8n");
      console.error("❌ [DEBUG] Status:", response.status);
      console.error("❌ [DEBUG] Status Text:", response.statusText);
      console.error(
        "❌ [DEBUG] Headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.error("❌ [DEBUG] Dados que foram enviados:", webhookData);
    }
  } catch (error) {
    console.error("💥 [DEBUG] Erro crítico ao disparar webhook n8n:", error);
    console.error(
      "💥 [DEBUG] Stack trace:",
      error instanceof Error ? error.stack : "Stack não disponível"
    );
    console.error("💥 [DEBUG] Dados que tentamos enviar:", {
      telefone,
      nomeCompleto,
      usuario: { id: usuario.id, name: usuario.name },
      imobiliaria: { nome: imobiliaria.nome },
    });
    // Não lança o erro para não quebrar o fluxo principal de criação do lead
  }
}
