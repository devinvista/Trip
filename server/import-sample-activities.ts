#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';

// Atividades de exemplo compatíveis com o esquema MySQL atual
async function importSampleActivities() {
  console.log('🌱 Importando atividades de exemplo para o banco MySQL...');

  try {
    const sampleActivities = [
      {
        title: 'Cristo Redentor - Corcovado',
        description: 'Visite uma das Sete Maravilhas do Mundo Moderno! O Cristo Redentor é o símbolo mais famoso do Rio de Janeiro. Inclui transporte pelo histórico Trem do Corcovado.',
        destinationName: 'Rio de Janeiro',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 25,
        languages: ["Português", "Inglês", "Espanhol"],
        inclusions: ["Transporte de trem", "Guia credenciado", "Acesso aos mirantes", "Seguro"],
        exclusions: ["Alimentação", "Bebidas", "Compras pessoais"],
        requirements: ["Usar sapatos confortáveis", "Levar protetor solar", "Documentos com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: { phone: "(21) 2558-1329", website: "https://www.tremdocorcovado.rio" },
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop'],
        averageRating: "4.75",
        totalRatings: 1247,
        isActive: true,
        createdById: 1,
        // Campos herdados do destino
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sudeste',
        continent: 'América do Sul'
      },
      {
        title: 'Pão de Açúcar - Bondinho',
        description: 'Suba ao famoso Pão de Açúcar no bondinho original! A viagem em dois trechos oferece vistas espetaculares da cidade e das praias.',
        destinationName: 'Rio de Janeiro',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '2 horas',
        minParticipants: 1,
        maxParticipants: 40,
        languages: ["Português", "Inglês", "Espanhol"],
        inclusions: ["Bondinho ida e volta", "Acesso aos mirantes", "Seguro"],
        exclusions: ["Alimentação", "Bebidas", "Estacionamento"],
        requirements: ["Não recomendado para pessoas com medo de altura"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: { phone: "(21) 2546-8400", website: "https://www.bondinho.com.br" },
        coverImage: 'https://images.unsplash.com/photo-1576992021885-42b8ec06d6b0?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1576992021885-42b8ec06d6b0?q=80&w=1200&auto=format&fit=crop'],
        averageRating: "4.60",
        totalRatings: 987,
        isActive: true,
        createdById: 1,
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sudeste',
        continent: 'América do Sul'
      },
      {
        title: 'Mini Mundo - Gramado',
        description: 'Parque temático único com réplicas em miniatura de monumentos famosos do mundo. Mais de 40 atrações em 23 mil m² com riqueza de detalhes.',
        destinationName: 'Gramado',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '2 horas',
        minParticipants: 1,
        maxParticipants: 30,
        languages: ["Português"],
        inclusions: ["Entrada ao parque", "Acesso a todas atrações", "Mapa guia"],
        exclusions: ["Alimentação", "Bebidas", "Estacionamento"],
        requirements: ["Adequado para todas as idades"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: { phone: "(54) 3286-4055", website: "https://www.minimundo.com.br" },
        coverImage: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop'],
        averageRating: "4.30",
        totalRatings: 892,
        isActive: true,
        createdById: 1,
        city: 'Gramado',
        state: 'RS',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sul',
        continent: 'América do Sul'
      },
      {
        title: 'Cataratas do Iguaçu - Lado Brasileiro',
        description: 'Uma das maiores quedas d\'água do mundo com vista panorâmica impressionante. Patrimônio Mundial da UNESCO com trilhas ecológicas.',
        destinationName: 'Foz do Iguaçu',
        category: 'nature' as const,
        difficultyLevel: 'easy' as const,
        duration: '4 horas',
        minParticipants: 1,
        maxParticipants: 50,
        languages: ["Português", "Inglês", "Espanhol"],
        inclusions: ["Entrada do Parque Nacional", "Trilha panorâmica", "Ônibus interno", "Mapa do parque"],
        exclusions: ["Transporte até o parque", "Alimentação", "Atividades extras"],
        requirements: ["Usar sapatos antiderrapantes", "Levar capa de chuva"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: { phone: "(45) 3521-4400", website: "https://www.cataratasdoiguacu.com.br" },
        coverImage: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1544550285-f813152fb2fd?q=80&w=1200&auto=format&fit=crop'],
        averageRating: "4.85",
        totalRatings: 2156,
        isActive: true,
        createdById: 1,
        city: 'Foz do Iguaçu',
        state: 'PR',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sul',
        continent: 'América do Sul'
      },
      {
        title: 'Pelourinho - Centro Histórico',
        description: 'Patrimônio Mundial da UNESCO, o centro histórico de Salvador preserva a arquitetura colonial e a cultura afro-brasileira.',
        destinationName: 'Salvador',
        category: 'cultural' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 20,
        languages: ["Português"],
        inclusions: ["Tour guiado", "Entrada em igrejas principais", "Material informativo"],
        exclusions: ["Alimentação", "Bebidas", "Compras"],
        requirements: ["Usar sapatos confortáveis", "Respeitar locais religiosos"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: { phone: "(71) 3116-6600", website: "https://www.salvador.ba.gov.br" },
        coverImage: 'https://images.unsplash.com/photo-1516306580618-7c189afc33b6?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1516306580618-7c189afc33b6?q=80&w=1200&auto=format&fit=crop'],
        averageRating: "4.40",
        totalRatings: 756,
        isActive: true,
        createdById: 1,
        city: 'Salvador',
        state: 'BA',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Nordeste',
        continent: 'América do Sul'
      }
    ];

    // Inserir atividades
    console.log('📥 Inserindo atividades no banco de dados...');
    
    const insertedActivities = [];
    for (const activity of sampleActivities) {
      const [result] = await db.insert(activities).values(activity);
      insertedActivities.push({ ...activity, id: result.insertId });
      console.log(`✅ ${activity.title} - ID: ${result.insertId}`);
    }

    console.log(`✅ ${insertedActivities.length} atividades inseridas com sucesso!`);

    // Criar propostas de orçamento para cada atividade
    console.log('💰 Criando propostas de orçamento...');
    
    const budgetProposals = [];
    for (const activity of insertedActivities) {
      const basePrice = Math.floor(Math.random() * 80) + 50; // Entre 50-130 reais
      
      const proposals = [
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Econômico',
          description: 'Opção básica com o essencial para aproveitar a experiência',
          priceType: 'per_person',
          amount: basePrice.toString(),
          currency: 'BRL',
          inclusions: ['Atividade principal', 'Equipamentos básicos', 'Seguro básico'],
          exclusions: ['Alimentação', 'Bebidas', 'Transporte'],
          isActive: true,
          votes: Math.floor(Math.random() * 50) + 10
        },
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Completo',
          description: 'Experiência completa com guia especializado e comodidades extras',
          priceType: 'per_person',
          amount: Math.floor(basePrice * 1.8).toString(),
          currency: 'BRL',
          inclusions: ['Atividade principal', 'Guia especializado', 'Equipamentos completos', 'Lanche', 'Material informativo'],
          exclusions: ['Bebidas alcoólicas', 'Compras pessoais'],
          isActive: true,
          votes: Math.floor(Math.random() * 30) + 5
        },
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Premium',
          description: 'Experiência exclusiva e totalmente personalizada com serviço VIP',
          priceType: 'per_person',
          amount: Math.floor(basePrice * 3.2).toString(),
          currency: 'BRL',
          inclusions: ['Experiência privativa', 'Guia exclusivo', 'Transporte incluído', 'Refeição completa', 'Fotografia profissional'],
          exclusions: ['Compras pessoais', 'Gorjetas'],
          isActive: true,
          votes: Math.floor(Math.random() * 20) + 2
        }
      ];
      
      for (const proposal of proposals) {
        await db.insert(activityBudgetProposals).values(proposal);
        budgetProposals.push(proposal);
      }
      
      console.log(`💰 3 propostas criadas para ${activity.title}`);
    }

    console.log(`✅ ${budgetProposals.length} propostas de orçamento criadas!`);

    // Verificar resultados finais
    const totalActivities = await db.select().from(activities);
    const totalProposals = await db.select().from(activityBudgetProposals);
    
    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`   🏛️  Atividades: ${totalActivities.length} total`);
    console.log(`   💰 Propostas: ${totalProposals.length} total`);
    console.log('\n🎉 Importação concluída com sucesso!');

    return {
      activities: insertedActivities.length,
      proposals: budgetProposals.length
    };

  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  importSampleActivities()
    .then((result) => {
      console.log(`✅ Processo concluído! ${result.activities} atividades e ${result.proposals} propostas importadas.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}