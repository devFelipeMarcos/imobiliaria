const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function seedStatus() {
  try {
    console.log('Criando status padrão...');

    // Verificar se já existem status
    const existingStatus = await prisma.statusCustom.findMany();
    
    if (existingStatus.length > 0) {
      console.log('Status já existem no banco. Pulando seed...');
      return;
    }

    // Criar status padrão
    const statusData = [
      {
        nome: 'Novo',
        descricao: 'Lead recém capturado',
        cor: '#3B82F6', // azul
        tipo: 'LEAD',
        ativo: true,
        ordem: 1
      },
      {
        nome: 'Atendimento inicial',
        descricao: 'Primeiro atendimento realizado',
        cor: '#8B5CF6', // roxo
        tipo: 'LEAD',
        ativo: true,
        ordem: 2
      },
      {
        nome: 'Parou de responder',
        descricao: 'Cliente parou de responder',
        cor: '#F59E0B', // amarelo
        tipo: 'LEAD',
        ativo: true,
        ordem: 3
      },
      {
        nome: 'Enviou documentação',
        descricao: 'Cliente enviou documentação necessária',
        cor: '#10B981', // verde
        tipo: 'PROSPECT',
        ativo: true,
        ordem: 4
      },
      {
        nome: 'Aguardando documentação',
        descricao: 'Aguardando cliente enviar documentação',
        cor: '#F97316', // laranja
        tipo: 'PROSPECT',
        ativo: true,
        ordem: 5
      },
      {
        nome: 'Aguardando resposta do banco',
        descricao: 'Documentação enviada, aguardando análise bancária',
        cor: '#06B6D4', // ciano
        tipo: 'NEGOCIACAO',
        ativo: true,
        ordem: 6
      },
      {
        nome: 'Nome sujo',
        descricao: 'Cliente com restrições no CPF',
        cor: '#DC2626', // vermelho
        tipo: 'PERDIDO',
        ativo: true,
        ordem: 7
      },
      {
        nome: 'Rating bancário',
        descricao: 'Problema com rating bancário do cliente',
        cor: '#991B1B', // vermelho escuro
        tipo: 'PERDIDO',
        ativo: true,
        ordem: 8
      }
    ];

    for (const status of statusData) {
      await prisma.statusCustom.create({
        data: status
      });
      console.log(`Status "${status.nome}" criado com sucesso!`);
    }

    console.log('Todos os status foram criados com sucesso!');

  } catch (error) {
    console.error('Erro ao criar status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStatus();