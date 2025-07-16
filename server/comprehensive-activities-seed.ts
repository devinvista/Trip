import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function seedActivitiesWithBudgets() {
  console.log('🌱 Criando sistema completo: atividades + propostas de orçamento + avaliações...');

  try {
    // 1. Criar tabela de propostas se não existir
    console.log('🔧 Verificando estrutura de propostas...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        visit_date DATE,
        photos JSON,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY unique_user_activity (user_id, activity_id),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Estrutura das tabelas verificada');

    // 2. Obter atividades existentes usando SQL direto
    const activitiesResult = await db.execute(sql`
      SELECT id, title, location FROM activities WHERE is_active = 1 ORDER BY id
    `);
    
    console.log(`📊 ${activitiesResult.length} atividades encontradas:`);
    activitiesResult.forEach((activity: any) => {
      console.log(`   ID: ${activity.id} - ${activity.title}`);
    });

    // 3. Limpar dados existentes
    await db.execute(sql`DELETE FROM activity_budget_proposals`);
    await db.execute(sql`DELETE FROM activity_reviews`);
    console.log('🧹 Dados antigos removidos');

    // 4. Criar propostas para cada atividade usando IDs específicos
    await createBudgetProposals(activitiesResult);
    
    // 5. Criar avaliações para cada atividade
    await createActivityReviews(activitiesResult);

    console.log('\n🎉 Sistema completo de atividades criado com sucesso!');

  } catch (error) {
    console.error('❌ Erro no processo:', error);
    throw error;
  }
}

async function createBudgetProposals(activities: any[]) {
  console.log('\n💰 Criando propostas de orçamento...');
  
  // Propostas específicas por atividade
  const proposalTemplates = [
    {
      title: 'Opção Básica',
      description: 'Experiência padrão com o essencial incluído',
      multiplier: 1.0,
      inclusions: ['Atividade principal', 'Equipamentos básicos', 'Seguro básico'],
      exclusions: ['Alimentação', 'Bebidas', 'Transporte']
    },
    {
      title: 'Opção Completa',
      description: 'Experiência com guia especializado e comodidades extras',
      multiplier: 1.8,
      inclusions: ['Atividade principal', 'Guia especializado', 'Equipamentos completos', 'Lanche', 'Material informativo'],
      exclusions: ['Bebidas alcoólicas', 'Compras pessoais']
    },
    {
      title: 'Opção Premium',
      description: 'Experiência exclusiva e totalmente personalizada',
      multiplier: 3.2,
      inclusions: ['Experiência privativa', 'Guia exclusivo', 'Transporte incluído', 'Refeição completa', 'Fotografia profissional'],
      exclusions: ['Compras pessoais', 'Gorjetas']
    }
  ];

  let totalProposals = 0;

  for (const activity of activities) {
    console.log(`💡 Criando propostas para: ${activity.title} (ID: ${activity.id})`);
    
    // Preço base baseado no título da atividade
    let basePrice = getBasePriceForActivity(activity.title);
    
    for (const template of proposalTemplates) {
      const amount = Math.floor(basePrice * template.multiplier);
      
      await db.execute(sql`
        INSERT INTO activity_budget_proposals 
        (activity_id, title, description, amount, currency, inclusions, exclusions, price_type, is_active) 
        VALUES 
        (${activity.id}, ${template.title}, ${template.description}, ${amount}, 'BRL', 
         ${JSON.stringify(template.inclusions)}, ${JSON.stringify(template.exclusions)}, 'per_person', true)
      `);
      
      totalProposals++;
    }
  }

  console.log(`✅ ${totalProposals} propostas de orçamento criadas!`);
}

function getBasePriceForActivity(title: string): number {
  const priceMap: Record<string, number> = {
    'Cristo Redentor / Corcovado': 85,
    'Pão de Açúcar (Bondinho)': 120,
    'Praia de Copacabana / Ipanema + Esportes': 100,
    'MASP + Avenida Paulista': 40,
    'Pelourinho + Elevador Lacerda': 60,
    'Cataratas do Iguaçu (lado brasileiro)': 85,
    'Passeio de Catamaran em Búzios': 95,
    'Trilha no Pico da Bandeira': 70,
    'City Tour no Centro Histórico de Ouro Preto': 55,
    'Rafting no Rio Jacaré-Pepira': 85
  };
  
  return priceMap[title] || 75; // Preço padrão se não encontrar
}

async function createActivityReviews(activities: any[]) {
  console.log('\n⭐ Criando avaliações para atividades...');
  
  // Obter usuários para criar avaliações
  const users = await db.execute(sql`SELECT id, username FROM users LIMIT 5`);
  
  if (users.length === 0) {
    console.log('⚠️ Nenhum usuário encontrado para criar avaliações');
    return;
  }

  console.log(`👥 ${users.length} usuários disponíveis para avaliações`);

  const reviewComments = [
    'Experiência incrível! Superou todas as expectativas. Recomendo muito!',
    'Muito bom, mas poderia ser um pouco melhor organizado.',
    'Perfeito! Vista sensacional e atendimento excelente.',
    'Fantástico! Uma das melhores experiências que já tive.',
    'Maravilhoso! Vale cada centavo. Voltaria com certeza.',
    'Simplesmente espetacular! Não há palavras para descrever.',
    'Gostei muito, mas estava um pouco cheio no dia da visita.',
    'Excelente atividade! Guia muito experiente e educativo.',
    'Boa experiência geral, mas o tempo foi um pouco corrido.',
    'Incrível! Definitivamente uma experiência que todos deveriam ter.'
  ];

  let totalReviews = 0;

  for (const activity of activities) {
    console.log(`💬 Criando avaliações para: ${activity.title} (ID: ${activity.id})`);
    
    // Criar 2-3 avaliações por atividade
    const numReviews = Math.min(3, users.length);
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numReviews; i++) {
      const user = shuffledUsers[i];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 ou 5 estrelas
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      const helpfulVotes = Math.floor(Math.random() * 20) + 1;
      
      // Data de visita nos últimos 6 meses
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 180));
      const visitDateStr = visitDate.toISOString().split('T')[0];
      
      try {
        await db.execute(sql`
          INSERT INTO activity_reviews 
          (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes, is_hidden) 
          VALUES 
          (${activity.id}, ${user.id}, ${rating}, ${comment}, ${visitDateStr}, true, ${helpfulVotes}, false)
        `);
        totalReviews++;
      } catch (error) {
        // Ignora duplicatas (mesmo usuário não pode avaliar duas vezes)
        if (!error.message.includes('Duplicate entry')) {
          console.error(`Erro ao criar avaliação: ${error.message}`);
        }
      }
    }
  }

  console.log(`✅ ${totalReviews} avaliações criadas!`);

  // Atualizar médias de rating das atividades
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
  
  console.log('✅ Médias de rating atualizadas!');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedActivitiesWithBudgets()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}