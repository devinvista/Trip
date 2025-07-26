import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function addComprehensiveBudgetProposals() {
  console.log('🎯 Iniciando cadastro abrangente de propostas de orçamento...');

  try {
    // Buscar todas as atividades existentes
    const existingActivities = await db.select().from(activities);
    console.log(`📊 Encontradas ${existingActivities.length} atividades para processar`);

    // Definir propostas por localização e tipo de atividade
    const proposalsByLocation: Record<string, any[]> = {
      'Rio de Janeiro': [
        {
          name: 'Cristo Redentor / Corcovado',
          proposals: [
            { level: 'Econômico', price: 85, description: 'Van oficial', inclusions: ['Transporte', 'Entrada'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Completo', price: 160, description: 'Trem + entrada + guia', inclusions: ['Transporte', 'Entrada', 'Guia turístico'], exclusions: ['Alimentação', 'Fotos'] },
            { level: 'Premium', price: 320, description: 'Tour privativo com transporte', inclusions: ['Transporte privativo', 'Entrada', 'Guia exclusivo', 'Fotos'], exclusions: ['Alimentação'] }
          ]
        },
        {
          name: 'Pão de Açúcar',
          proposals: [
            { level: 'Econômico', price: 120, description: 'Ingresso padrão', inclusions: ['Bondinho', 'Entrada'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Completo', price: 190, description: 'Bondinho + guia', inclusions: ['Bondinho', 'Entrada', 'Guia turístico'], exclusions: ['Alimentação', 'Transporte'] },
            { level: 'Premium', price: 350, description: 'Bondinho + tour + helicóptero', inclusions: ['Bondinho', 'Tour helicóptero', 'Guia exclusivo', 'Fotos'], exclusions: ['Alimentação'] }
          ]
        },
        {
          name: 'Copacabana',
          proposals: [
            { level: 'Econômico', price: 0, description: 'Livre', inclusions: ['Acesso à praia'], exclusions: ['Equipamentos', 'Guia', 'Alimentação'] },
            { level: 'Completo', price: 100, description: 'Aula de surf ou aluguel de bike', inclusions: ['Equipamento esportivo', 'Instrutor'], exclusions: ['Alimentação', 'Transporte'] },
            { level: 'Premium', price: 300, description: 'Passeio de lancha com drinks', inclusions: ['Lancha', 'Bebidas', 'Guia', 'Equipamentos'], exclusions: ['Refeições'] }
          ]
        }
      ],
      'São Paulo': [
        {
          name: 'MASP',
          proposals: [
            { level: 'Econômico', price: 40, description: 'Entrada simples', inclusions: ['Entrada'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Completo', price: 90, description: 'Visita guiada + café', inclusions: ['Entrada', 'Guia', 'Café'], exclusions: ['Transporte', 'Almoço'] },
            { level: 'Premium', price: 250, description: 'Passeio + almoço em rooftop', inclusions: ['Entrada', 'Guia', 'Almoço premium', 'Vista panorâmica'], exclusions: ['Transporte'] }
          ]
        },
        {
          name: 'Parque Ibirapuera',
          proposals: [
            { level: 'Econômico', price: 0, description: 'Livre', inclusions: ['Acesso ao parque'], exclusions: ['Equipamentos', 'Guia'] },
            { level: 'Completo', price: 70, description: 'Aluguel de bike + ingressos', inclusions: ['Bicicleta', 'Ingressos museus'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Premium', price: 180, description: 'Tour guiado + transporte', inclusions: ['Transporte', 'Guia especializado', 'Ingressos'], exclusions: ['Alimentação'] }
          ]
        }
      ],
      'Gramado': [
        {
          name: 'Mini Mundo',
          proposals: [
            { level: 'Econômico', price: 80, description: 'Ingresso avulso', inclusions: ['Entrada'], exclusions: ['Transporte', 'Guia'] },
            { level: 'Completo', price: 120, description: 'Transporte + entrada', inclusions: ['Transporte', 'Entrada'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Premium', price: 200, description: 'Com guia e almoço', inclusions: ['Transporte', 'Entrada', 'Guia', 'Almoço'], exclusions: ['Compras'] }
          ]
        },
        {
          name: 'Snowland',
          proposals: [
            { level: 'Econômico', price: 180, description: 'Entrada simples', inclusions: ['Entrada', 'Equipamentos básicos'], exclusions: ['Roupas especiais', 'Aulas'] },
            { level: 'Completo', price: 300, description: 'Inclusão de roupas alugadas', inclusions: ['Entrada', 'Equipamentos', 'Roupas térmicas'], exclusions: ['Aulas privadas', 'Fotos'] },
            { level: 'Premium', price: 450, description: 'Aula de esqui + fotos profissionais', inclusions: ['Entrada', 'Equipamentos', 'Roupas', 'Aula privada', 'Fotos'], exclusions: ['Alimentação'] }
          ]
        }
      ],
      'Bonito': [
        {
          name: 'Gruta do Lago Azul',
          proposals: [
            { level: 'Econômico', price: 90, description: 'Baixa temporada', inclusions: ['Entrada', 'Transporte local'], exclusions: ['Guia especializado', 'Alimentação'] },
            { level: 'Completo', price: 110, description: 'Alta temporada', inclusions: ['Entrada', 'Transporte', 'Guia'], exclusions: ['Alimentação', 'Fotos'] },
            { level: 'Premium', price: 180, description: 'Entrada + guia privado', inclusions: ['Entrada', 'Transporte', 'Guia privado', 'Fotos'], exclusions: ['Alimentação'] }
          ]
        },
        {
          name: 'Aquário Natural',
          proposals: [
            { level: 'Econômico', price: 320, description: 'Flutuação básica', inclusions: ['Equipamentos', 'Guia'], exclusions: ['Transporte', 'Alimentação'] },
            { level: 'Completo', price: 395, description: 'Alta temporada', inclusions: ['Equipamentos', 'Guia', 'Transporte'], exclusions: ['Alimentação premium'] },
            { level: 'Premium', price: 550, description: 'Com transporte e almoço', inclusions: ['Equipamentos', 'Guia', 'Transporte', 'Almoço', 'Fotos'], exclusions: ['Hospedagem'] }
          ]
        }
      ],
      'Paris': [
        {
          name: 'Torre Eiffel',
          proposals: [
            { level: 'Econômico', price: 50, description: 'Acesso até 2º andar, escada', inclusions: ['Entrada até 2º andar'], exclusions: ['Elevador', 'Guia', 'Alimentação'] },
            { level: 'Completo', price: 125, description: 'Elevador até o topo', inclusions: ['Entrada completa', 'Elevador'], exclusions: ['Guia', 'Alimentação'] },
            { level: 'Premium', price: 350, description: 'Tour guiado + jantar no restaurante', inclusions: ['Entrada VIP', 'Elevador', 'Guia', 'Jantar'], exclusions: ['Transporte'] }
          ]
        },
        {
          name: 'Museu do Louvre',
          proposals: [
            { level: 'Econômico', price: 85, description: 'Entrada padrão online', inclusions: ['Entrada'], exclusions: ['Guia', 'Acesso especial'] },
            { level: 'Completo', price: 200, description: 'Tour guiado em grupo', inclusions: ['Entrada', 'Guia em grupo'], exclusions: ['Tour privado', 'Acesso VIP'] },
            { level: 'Premium', price: 600, description: 'Tour privativo + acesso especial', inclusions: ['Entrada VIP', 'Guia privado', 'Acesso especial'], exclusions: ['Transporte'] }
          ]
        }
      ],
      'Nova York': [
        {
          name: 'Estátua da Liberdade',
          proposals: [
            { level: 'Econômico', price: 120, description: 'Ferry e entrada', inclusions: ['Ferry', 'Entrada'], exclusions: ['Guia', 'Ellis Island'] },
            { level: 'Completo', price: 250, description: 'Tour guiado', inclusions: ['Ferry', 'Entrada', 'Guia', 'Ellis Island'], exclusions: ['Acesso VIP'] },
            { level: 'Premium', price: 750, description: 'Tour VIP + acesso restrito', inclusions: ['Ferry VIP', 'Entrada', 'Guia privado', 'Acesso especial'], exclusions: ['Alimentação'] }
          ]
        },
        {
          name: 'Empire State Building',
          proposals: [
            { level: 'Econômico', price: 225, description: 'Entrada básica', inclusions: ['Entrada'], exclusions: ['Skip line', 'Guia'] },
            { level: 'Completo', price: 450, description: 'Skip line + observatório', inclusions: ['Entrada', 'Skip line', 'Observatório'], exclusions: ['Guia privado'] },
            { level: 'Premium', price: 1000, description: 'Tour guiado + jantar', inclusions: ['Entrada VIP', 'Skip line', 'Guia', 'Jantar'], exclusions: ['Transporte'] }
          ]
        }
      ],
      'Londres': [
        {
          name: 'London Eye',
          proposals: [
            { level: 'Econômico', price: 180, description: 'Entrada padrão', inclusions: ['Entrada'], exclusions: ['Skip line', 'Champagne'] },
            { level: 'Completo', price: 300, description: 'Skip line', inclusions: ['Entrada', 'Skip line'], exclusions: ['Cabine privada'] },
            { level: 'Premium', price: 900, description: 'Cabine privada + champagne', inclusions: ['Cabine privada', 'Champagne', 'Fotos'], exclusions: ['Transporte'] }
          ]
        },
        {
          name: 'Torre de Londres',
          proposals: [
            { level: 'Econômico', price: 150, description: 'Entrada simples', inclusions: ['Entrada'], exclusions: ['Guia', 'Joias da Coroa'] },
            { level: 'Completo', price: 300, description: 'Tour guiado', inclusions: ['Entrada', 'Guia'], exclusions: ['Tour privado'] },
            { level: 'Premium', price: 720, description: 'Tour privado + joias da coroa', inclusions: ['Entrada VIP', 'Guia privado', 'Acesso especial'], exclusions: ['Transporte'] }
          ]
        }
      ],
      'Roma': [
        {
          name: 'Coliseu',
          proposals: [
            { level: 'Econômico', price: 80, description: 'Entrada padrão', inclusions: ['Entrada'], exclusions: ['Guia', 'Acesso especial'] },
            { level: 'Completo', price: 200, description: 'Tour guiado em grupo', inclusions: ['Entrada', 'Guia em grupo'], exclusions: ['Tour privado'] },
            { level: 'Premium', price: 750, description: 'Tour privativo + acesso exclusivo', inclusions: ['Entrada VIP', 'Guia privado', 'Acesso exclusivo'], exclusions: ['Transporte'] }
          ]
        },
        {
          name: 'Vaticano',
          proposals: [
            { level: 'Econômico', price: 85, description: 'Entrada simples', inclusions: ['Entrada'], exclusions: ['Museus', 'Guia'] },
            { level: 'Completo', price: 250, description: 'Tour com museus', inclusions: ['Entrada', 'Museus', 'Guia'], exclusions: ['Cúpula'] },
            { level: 'Premium', price: 600, description: 'Tour VIP + cúpula', inclusions: ['Entrada VIP', 'Museus', 'Guia privado', 'Cúpula'], exclusions: ['Transporte'] }
          ]
        }
      ],
      'Buenos Aires': [
        {
          name: 'Show de Tango',
          proposals: [
            { level: 'Econômico', price: 80, description: 'Show básico', inclusions: ['Show', 'Bebida'], exclusions: ['Jantar', 'Mesa VIP'] },
            { level: 'Completo', price: 160, description: 'Show com jantar', inclusions: ['Show', 'Jantar', 'Bebidas'], exclusions: ['Mesa VIP', 'Transporte'] },
            { level: 'Premium', price: 350, description: 'Show VIP com jantar premium', inclusions: ['Show VIP', 'Jantar premium', 'Bebidas premium', 'Mesa especial'], exclusions: ['Transporte'] }
          ]
        },
        {
          name: 'La Boca',
          proposals: [
            { level: 'Econômico', price: 0, description: 'Passeio livre', inclusions: ['Acesso ao bairro'], exclusions: ['Guia', 'Transporte'] },
            { level: 'Completo', price: 60, description: 'Tour guiado', inclusions: ['Guia', 'Caminhada'], exclusions: ['Transporte', 'Alimentação'] },
            { level: 'Premium', price: 175, description: 'Tour privativo', inclusions: ['Guia privado', 'Transporte', 'Fotos'], exclusions: ['Alimentação'] }
          ]
        }
      ]
    };

    let totalProposalsAdded = 0;

    // Processar cada atividade existente
    for (const activity of existingActivities) {
      try {
        console.log(`🔍 Processando atividade: ${activity.title} (${activity.location})`);

        // Buscar propostas específicas para esta localização
        const locationProposals = proposalsByLocation[activity.location] || [];
        
        // Encontrar propostas que correspondam ao nome da atividade
        let matchingProposals = locationProposals.find(p => 
          activity.title.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(activity.title.toLowerCase())
        )?.proposals;

        // Se não encontrar correspondência específica, usar propostas genéricas baseadas na categoria
        if (!matchingProposals) {
          matchingProposals = getGenericProposalsByCategory(activity.category);
        }

        // Verificar se já existem propostas para esta atividade
        const existingProposals = await db.select()
          .from(activityBudgetProposals)
          .where(eq(activityBudgetProposals.activityId, activity.id));

        if (existingProposals.length === 0) {
          // Adicionar as propostas
          for (const proposal of matchingProposals) {
            await db.insert(activityBudgetProposals).values({
              activityId: activity.id,
              createdBy: 1, // User ID do admin (assumindo que existe)
              title: proposal.level,
              amount: proposal.price.toString(),
              description: proposal.description,
              inclusions: JSON.stringify(proposal.inclusions),
              exclusions: JSON.stringify(proposal.exclusions),
              votes: Math.floor(Math.random() * 50) + 1, // Votos aleatórios entre 1-50
              isActive: true
            });
            
            totalProposalsAdded++;
            console.log(`  ✅ Proposta ${proposal.level} adicionada (R$ ${proposal.price})`);
          }
        } else {
          console.log(`  ℹ️ Atividade já possui ${existingProposals.length} propostas`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar atividade ${activity.title}:`, error);
      }
    }

    console.log(`🎉 Processo concluído! ${totalProposalsAdded} propostas adicionadas ao total`);

  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  }
}

function getGenericProposalsByCategory(category: string) {
  const genericProposals: Record<string, any[]> = {
    'pontos_turisticos': [
      { level: 'Econômico', price: 30, description: 'Entrada básica', inclusions: ['Entrada'], exclusions: ['Guia', 'Transporte'] },
      { level: 'Completo', price: 80, description: 'Entrada + guia', inclusions: ['Entrada', 'Guia'], exclusions: ['Transporte', 'Alimentação'] },
      { level: 'Premium', price: 150, description: 'Tour completo', inclusions: ['Entrada', 'Guia privado', 'Transporte'], exclusions: ['Alimentação'] }
    ],
    'adventure': [
      { level: 'Econômico', price: 50, description: 'Atividade básica', inclusions: ['Equipamentos básicos'], exclusions: ['Guia', 'Transporte'] },
      { level: 'Completo', price: 120, description: 'Com guia e equipamentos', inclusions: ['Equipamentos', 'Guia', 'Segurança'], exclusions: ['Transporte', 'Alimentação'] },
      { level: 'Premium', price: 250, description: 'Experiência completa', inclusions: ['Equipamentos premium', 'Guia especializado', 'Transporte', 'Fotos'], exclusions: ['Hospedagem'] }
    ],
    'cultural': [
      { level: 'Econômico', price: 20, description: 'Visita básica', inclusions: ['Entrada'], exclusions: ['Guia', 'Transporte'] },
      { level: 'Completo', price: 60, description: 'Visita guiada', inclusions: ['Entrada', 'Guia cultural'], exclusions: ['Transporte', 'Alimentação'] },
      { level: 'Premium', price: 120, description: 'Experiência cultural completa', inclusions: ['Entrada', 'Guia especializado', 'Material educativo'], exclusions: ['Transporte'] }
    ],
    'nature': [
      { level: 'Econômico', price: 40, description: 'Acesso básico', inclusions: ['Entrada', 'Trilha autoguiada'], exclusions: ['Guia', 'Equipamentos'] },
      { level: 'Completo', price: 100, description: 'Com guia ecológico', inclusions: ['Entrada', 'Guia especializado', 'Equipamentos básicos'], exclusions: ['Transporte', 'Alimentação'] },
      { level: 'Premium', price: 200, description: 'Ecoturismo premium', inclusions: ['Entrada', 'Guia especializado', 'Equipamentos', 'Transporte'], exclusions: ['Hospedagem'] }
    ],
    'water_sports': [
      { level: 'Econômico', price: 60, description: 'Aluguel de equipamentos', inclusions: ['Equipamentos básicos'], exclusions: ['Instrutor', 'Transporte'] },
      { level: 'Completo', price: 150, description: 'Com instrutor', inclusions: ['Equipamentos', 'Instrutor', 'Segurança'], exclusions: ['Transporte', 'Fotos'] },
      { level: 'Premium', price: 300, description: 'Experiência aquática completa', inclusions: ['Equipamentos premium', 'Instrutor privado', 'Fotos', 'Refreshments'], exclusions: ['Transporte'] }
    ],
    'food_tours': [
      { level: 'Econômico', price: 40, description: 'Degustação básica', inclusions: ['3 paradas gastronômicas'], exclusions: ['Bebidas', 'Transporte'] },
      { level: 'Completo', price: 90, description: 'Tour gastronômico', inclusions: ['5 paradas', 'Guia especializado', 'Bebidas'], exclusions: ['Transporte', 'Sobremesas'] },
      { level: 'Premium', price: 180, description: 'Experiência gourmet', inclusions: ['Tour completo', 'Guia chef', 'Bebidas premium', 'Receitas'], exclusions: ['Transporte'] }
    ]
  };

  return genericProposals[category] || genericProposals['pontos_turisticos'];
}

// Executar o script
addComprehensiveBudgetProposals()
  .then(() => {
    console.log('✅ Script executado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro durante execução:', error);
    process.exit(1);
  });