import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function createBudgetProposals() {
  console.log('💰 Criando propostas de orçamento para todas as atividades...');

  try {
    // Obter todas as atividades
    const activities = await db.execute(sql`SELECT id, title FROM activities`);
    console.log(`📊 Encontradas ${activities.length} atividades`);

    // Limpar propostas existentes (se houver)
    await db.execute(sql`DELETE FROM activity_budget_proposals`);

    let totalProposals = 0;

    for (const activity of activities) {
      console.log(`💡 Criando propostas para: ${activity.title}`);
      
      // Criar 3 propostas para cada atividade: econômica, intermediária e premium
      const proposals = getProposalsForActivity(activity.title, activity.id);
      
      for (const proposal of proposals) {
        await db.execute(sql`
          INSERT INTO activity_budget_proposals (
            activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular
          ) VALUES (
            ${proposal.activityId},
            ${proposal.title},
            ${proposal.description},
            ${proposal.amount},
            ${proposal.currency},
            ${proposal.inclusions},
            ${proposal.exclusions},
            ${proposal.votes},
            ${proposal.isPopular}
          )
        `);
        totalProposals++;
      }
    }

    console.log(`✅ ${totalProposals} propostas de orçamento criadas com sucesso!`);

  } catch (error) {
    console.error('❌ Erro ao criar propostas:', error);
    throw error;
  }
}

function getProposalsForActivity(title: string, activityId: number) {
  // Propostas específicas para atividades conhecidas
  const specificProposals = {
    'Cristo Redentor / Corcovado': [
      {
        activityId,
        title: 'Van Oficial',
        description: 'Transporte em van oficial até o Cristo Redentor',
        amount: 85.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Transporte van', 'Entrada do monumento']),
        exclusions: JSON.stringify(['Alimentação', 'Bebidas']),
        votes: 28,
        isPopular: false
      },
      {
        activityId,
        title: 'Trem do Corcovado',
        description: 'Experiência completa com trem e guia turístico',
        amount: 160.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Trem do Corcovado', 'Guia turístico', 'Entrada']),
        exclusions: JSON.stringify(['Bebidas alcoólicas']),
        votes: 45,
        isPopular: true
      },
      {
        activityId,
        title: 'Tour Premium',
        description: 'Tour privativo com transporte executivo e fotografia',
        amount: 320.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Transporte privativo', 'Guia exclusivo', 'Fotos profissionais']),
        exclusions: JSON.stringify(['Compras pessoais']),
        votes: 18,
        isPopular: false
      }
    ],
    'Pão de Açúcar (Bondinho)': [
      {
        activityId,
        title: 'Ingresso Simples',
        description: 'Bondinho ida e volta com acesso aos mirantes',
        amount: 120.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Bondinho ida/volta', 'Acesso mirantes']),
        exclusions: JSON.stringify(['Alimentação', 'Bebidas']),
        votes: 15,
        isPopular: false
      },
      {
        activityId,
        title: 'Com Guia Turístico',
        description: 'Bondinho com guia especializado e material informativo',
        amount: 190.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Bondinho', 'Guia turístico', 'Material informativo']),
        exclusions: JSON.stringify(['Fotos profissionais']),
        votes: 32,
        isPopular: true
      },
      {
        activityId,
        title: 'Experiência VIP',
        description: 'Bondinho + voo de helicóptero + jantar com vista',
        amount: 650.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Bondinho', 'Helicóptero 15min', 'Jantar panorâmico']),
        exclusions: JSON.stringify(['Compras pessoais']),
        votes: 12,
        isPopular: false
      }
    ],
    'Cataratas do Iguaçu (lado brasileiro)': [
      {
        activityId,
        title: 'Entrada Básica',
        description: 'Acesso ao parque com trilha panorâmica',
        amount: 85.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Entrada do parque', 'Trilha panorâmica']),
        exclusions: JSON.stringify(['Transporte', 'Alimentação']),
        votes: 22,
        isPopular: false
      },
      {
        activityId,
        title: 'Tour Completo',
        description: 'Parque + transporte + guia especializado',
        amount: 150.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Entrada', 'Transporte', 'Guia especializado', 'Capa de chuva']),
        exclusions: JSON.stringify(['Refeições']),
        votes: 38,
        isPopular: true
      },
      {
        activityId,
        title: 'Experiência Premium',
        description: 'Tour completo + voo de helicóptero sobre as cataratas',
        amount: 450.00,
        currency: 'BRL',
        inclusions: JSON.stringify(['Tour completo', 'Voo helicóptero', 'Almoço', 'Fotos aéreas']),
        exclusions: JSON.stringify(['Compras pessoais']),
        votes: 15,
        isPopular: false
      }
    ]
  };

  // Se tiver proposta específica, usar ela; senão, usar proposta genérica
  if (specificProposals[title]) {
    return specificProposals[title];
  }

  // Propostas genéricas para outras atividades
  const basePrice = Math.floor(Math.random() * 100) + 50;
  
  return [
    {
      activityId,
      title: 'Opção Básica',
      description: 'Experiência padrão da atividade',
      amount: basePrice,
      currency: 'BRL',
      inclusions: JSON.stringify(['Atividade principal', 'Equipamentos básicos']),
      exclusions: JSON.stringify(['Alimentação', 'Bebidas', 'Transporte']),
      votes: Math.floor(Math.random() * 20) + 5,
      isPopular: false
    },
    {
      activityId,
      title: 'Opção Completa',
      description: 'Experiência com guia e comodidades extras',
      amount: Math.floor(basePrice * 1.8),
      currency: 'BRL',
      inclusions: JSON.stringify(['Atividade principal', 'Guia especializado', 'Equipamentos', 'Lanche']),
      exclusions: JSON.stringify(['Bebidas alcoólicas']),
      votes: Math.floor(Math.random() * 35) + 20,
      isPopular: true
    },
    {
      activityId,
      title: 'Opção Premium',
      description: 'Experiência exclusiva e personalizada',
      amount: Math.floor(basePrice * 3.2),
      currency: 'BRL',
      inclusions: JSON.stringify(['Experiência privativa', 'Guia exclusivo', 'Transporte', 'Refeição']),
      exclusions: JSON.stringify(['Compras pessoais']),
      votes: Math.floor(Math.random() * 15) + 8,
      isPopular: false
    }
  ];
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createBudgetProposals()
    .then(() => {
      console.log('✅ Criação de propostas concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}