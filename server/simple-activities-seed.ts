import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function seedBasicActivities() {
  console.log('🌱 Adicionando dados básicos de atividades...');

  try {
    // 1. Verificar a estrutura das tabelas existentes
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const activityColumns = await db.execute(sql`SHOW COLUMNS FROM activities`);
    console.log('📋 Colunas de activities:', activityColumns.map(c => c.Field).join(', '));

    let proposalColumns = [];
    try {
      proposalColumns = await db.execute(sql`SHOW COLUMNS FROM activity_budget_proposals`);
      console.log('📋 Colunas de propostas:', proposalColumns.map(c => c.Field).join(', '));
    } catch (error) {
      console.log('⚠️ Tabela activity_budget_proposals não existe ainda');
    }

    let reviewColumns = [];
    try {
      reviewColumns = await db.execute(sql`SHOW COLUMNS FROM activity_reviews`);
      console.log('📋 Colunas de reviews:', reviewColumns.map(c => c.Field).join(', '));
    } catch (error) {
      console.log('⚠️ Tabela activity_reviews não existe ainda');
    }

    // 2. Verificar atividades existentes
    const activities = await db.execute(sql`SELECT id, title FROM activities WHERE title IS NOT NULL`);
    console.log(`📊 Atividades encontradas: ${activities.length}`);
    
    activities.forEach(activity => {
      console.log(`   - ID ${activity.id}: ${activity.title}`);
    });

    // 3. Criar propostas de orçamento apenas com colunas que existem
    if (proposalColumns.length > 0) {
      console.log('\n💰 Criando propostas de orçamento...');
      await seedBudgetProposals();
    } else {
      console.log('⚠️ Tabela de propostas não existe, pulando essa etapa');
    }

    // 4. Criar avaliações apenas com colunas que existem
    if (reviewColumns.length > 0) {
      console.log('\n⭐ Criando avaliações...');
      await seedActivityReviews();
    } else {
      console.log('⚠️ Tabela de reviews não existe, pulando essa etapa');
    }

    console.log('\n🎉 Seed básico concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no seed básico:', error);
    throw error;
  }
}

async function seedBudgetProposals() {
  try {
    // Verificar se já existem propostas
    const existingProposals = await db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`);
    console.log(`📊 Propostas existentes: ${existingProposals[0]?.count || 0}`);

    // Limpar propostas existentes
    await db.execute(sql`DELETE FROM activity_budget_proposals`);

    // Obter atividades válidas
    const activities = await db.execute(sql`
      SELECT id, title FROM activities 
      WHERE id IN (9, 10, 11, 12, 13, 14) AND title IS NOT NULL
    `);

    if (activities.length === 0) {
      console.log('⚠️ Nenhuma atividade válida encontrada para criar propostas');
      return;
    }

    // Criar propostas básicas (sem colunas votes e is_popular se não existirem)
    const proposalColumns = await db.execute(sql`SHOW COLUMNS FROM activity_budget_proposals`);
    const hasVotes = proposalColumns.some(c => c.Field === 'votes');
    const hasIsPopular = proposalColumns.some(c => c.Field === 'is_popular');

    for (const activity of activities) {
      console.log(`💡 Criando propostas para: ${activity.title}`);
      
      // Propostas básicas para cada atividade
      const basePrice = 80;
      const proposals = [
        {
          title: 'Opção Básica',
          description: 'Experiência padrão da atividade',
          amount: basePrice,
          inclusions: '["Atividade principal", "Equipamentos básicos"]',
          exclusions: '["Alimentação", "Bebidas"]'
        },
        {
          title: 'Opção Completa',
          description: 'Experiência com guia e comodidades',
          amount: Math.floor(basePrice * 1.8),
          inclusions: '["Atividade principal", "Guia especializado", "Equipamentos"]',
          exclusions: '["Bebidas alcoólicas"]'
        },
        {
          title: 'Opção Premium',
          description: 'Experiência exclusiva e personalizada',
          amount: Math.floor(basePrice * 3),
          inclusions: '["Experiência privativa", "Guia exclusivo", "Transporte"]',
          exclusions: '["Compras pessoais"]'
        }
      ];

      for (const proposal of proposals) {
        if (hasVotes && hasIsPopular) {
          await db.execute(sql`
            INSERT INTO activity_budget_proposals 
            (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
            VALUES 
            (${activity.id}, ${proposal.title}, ${proposal.description}, ${proposal.amount}, 'BRL', 
             ${proposal.inclusions}, ${proposal.exclusions}, 15, false)
          `);
        } else {
          await db.execute(sql`
            INSERT INTO activity_budget_proposals 
            (activity_id, title, description, amount, currency, inclusions, exclusions) 
            VALUES 
            (${activity.id}, ${proposal.title}, ${proposal.description}, ${proposal.amount}, 'BRL', 
             ${proposal.inclusions}, ${proposal.exclusions})
          `);
        }
      }
    }

    console.log('✅ Propostas de orçamento criadas!');

  } catch (error) {
    console.error('❌ Erro ao criar propostas:', error);
  }
}

async function seedActivityReviews() {
  try {
    // Verificar se já existem reviews
    const existingReviews = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    console.log(`📊 Reviews existentes: ${existingReviews[0]?.count || 0}`);

    // Limpar reviews existentes
    await db.execute(sql`DELETE FROM activity_reviews`);

    // Obter usuários e atividades
    const users = await db.execute(sql`SELECT id, username FROM users LIMIT 3`);
    const activities = await db.execute(sql`
      SELECT id, title FROM activities 
      WHERE id IN (9, 10, 11, 12, 13, 14) AND title IS NOT NULL
    `);

    if (users.length === 0 || activities.length === 0) {
      console.log('⚠️ Não há usuários ou atividades suficientes para criar reviews');
      return;
    }

    console.log(`👥 Usuários: ${users.length}, 🎯 Atividades: ${activities.length}`);

    // Comentários realísticos
    const comments = [
      'Experiência incrível! Superou todas as expectativas.',
      'Muito bom, mas poderia ser melhor organizado.',
      'Perfeito! Vista sensacional e atendimento excelente.',
      'Fantástico! Uma das melhores experiências que já tive.',
      'Maravilhoso! Vale cada centavo.',
      'Simplesmente espetacular!'
    ];

    // Criar reviews para cada atividade
    for (const activity of activities) {
      console.log(`💬 Criando reviews para: ${activity.title}`);
      
      // Criar 1-2 reviews por atividade
      const numReviews = Math.min(2, users.length);
      
      for (let i = 0; i < numReviews; i++) {
        const user = users[i];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 ou 5
        const comment = comments[Math.floor(Math.random() * comments.length)];
        
        // Data de visita nos últimos 3 meses
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 90));
        const visitDateStr = visitDate.toISOString().split('T')[0];

        try {
          await db.execute(sql`
            INSERT INTO activity_reviews 
            (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes) 
            VALUES 
            (${activity.id}, ${user.id}, ${rating}, ${comment}, ${visitDateStr}, true, ${Math.floor(Math.random() * 15) + 1})
          `);
        } catch (error) {
          // Ignora duplicatas
          if (!error.message.includes('Duplicate entry')) {
            console.error(`Erro ao criar review: ${error.message}`);
          }
        }
      }
    }

    // Atualizar médias de rating
    console.log('📊 Atualizando médias de rating...');
    await db.execute(sql`
      UPDATE activities a
      SET 
        average_rating = COALESCE((
          SELECT AVG(r.rating)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        ), 0),
        total_ratings = COALESCE((
          SELECT COUNT(*)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        ), 0)
    `);

    console.log('✅ Reviews e médias criadas!');

  } catch (error) {
    console.error('❌ Erro ao criar reviews:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBasicActivities()
    .then(() => {
      console.log('✅ Seed básico concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}