import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

function generateReferralCode(username: string, id: number): string {
  return `${username.toUpperCase().slice(0, 3)}${id.toString().padStart(3, '0')}`;
}

export async function createRealisticSeedData() {
  console.log('🌱 Criando dados realísticos completos para o sistema...');

  try {
    // 1. Primeiro executar o script de colunas de rating
    console.log('🔧 Verificando estrutura do banco...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        is_popular BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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

    console.log('✅ Estrutura do banco verificada');

    // 2. Obter atividades existentes
    const activities = await db.execute(sql`SELECT id, title FROM activities ORDER BY id`);
    console.log(`📊 Encontradas ${activities.length} atividades`);

    // 3. Criar propostas de orçamento realísticas para cada atividade
    console.log('💰 Criando propostas de orçamento...');
    
    for (const activity of activities) {
      await createBudgetProposalsForActivity(activity.id, activity.title);
    }

    // 4. Criar avaliações realísticas
    console.log('⭐ Criando avaliações realísticas...');
    
    const users = await db.execute(sql`SELECT id, username FROM users LIMIT 10`);
    
    for (const activity of activities) {
      await createReviewsForActivity(activity.id, users);
    }

    // 5. Atualizar médias de rating das atividades
    console.log('📊 Atualizando médias de rating...');
    await updateActivityRatings();

    console.log('🎉 Dados realísticos criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar dados realísticos:', error);
    throw error;
  }
}

async function createBudgetProposalsForActivity(activityId: number, activityTitle: string) {
  // Definir propostas baseadas no tipo de atividade
  const proposals = getBudgetProposalsForActivity(activityTitle);
  
  for (const proposal of proposals) {
    await db.execute(sql`
      INSERT INTO activity_budget_proposals (
        activity_id, title, description, amount, currency,
        inclusions, exclusions, votes, is_popular
      ) VALUES (
        ${activityId},
        ${proposal.title},
        ${proposal.description},
        ${proposal.amount},
        'BRL',
        ${JSON.stringify(proposal.inclusions)},
        ${JSON.stringify(proposal.exclusions)},
        ${proposal.votes},
        ${proposal.isPopular}
      )
    `);
  }
}

function getBudgetProposalsForActivity(title: string) {
  const baseProposals = {
    'Cristo Redentor / Corcovado': [
      {
        title: 'Opção Econômica',
        description: 'Van oficial até o Cristo Redentor',
        amount: 85.00,
        inclusions: ['Transporte van oficial', 'Entrada para o monumento'],
        exclusions: ['Alimentação', 'Bebidas', 'Compras pessoais'],
        votes: Math.floor(Math.random() * 30) + 15,
        isPopular: false
      },
      {
        title: 'Opção Intermediária',
        description: 'Trem do Corcovado + entrada + guia',
        amount: 160.00,
        inclusions: ['Trem do Corcovado', 'Entrada para o monumento', 'Guia turístico'],
        exclusions: ['Bebidas alcoólicas', 'Compras pessoais'],
        votes: Math.floor(Math.random() * 50) + 35,
        isPopular: true
      },
      {
        title: 'Opção Premium',
        description: 'Tour privativo com transporte executivo',
        amount: 320.00,
        inclusions: ['Transporte privativo', 'Guia exclusivo', 'Entrada VIP', 'Fotos profissionais'],
        exclusions: ['Compras pessoais'],
        votes: Math.floor(Math.random() * 25) + 10,
        isPopular: false
      }
    ],
    'Pão de Açúcar (Bondinho)': [
      {
        title: 'Ingresso Padrão',
        description: 'Bondinho ida e volta',
        amount: 120.00,
        inclusions: ['Bondinho ida e volta', 'Acesso aos mirantes'],
        exclusions: ['Alimentação', 'Bebidas', 'Fotos'],
        votes: Math.floor(Math.random() * 20) + 8,
        isPopular: false
      },
      {
        title: 'Com Guia',
        description: 'Bondinho + guia turístico especializado',
        amount: 190.00,
        inclusions: ['Bondinho ida e volta', 'Guia turístico', 'Mapa da região'],
        exclusions: ['Bebidas alcoólicas', 'Fotos profissionais'],
        votes: Math.floor(Math.random() * 40) + 25,
        isPopular: true
      },
      {
        title: 'Experiência Completa',
        description: 'Bondinho + helicóptero + jantar',
        amount: 650.00,
        inclusions: ['Bondinho ida e volta', 'Voo de helicóptero 15min', 'Jantar com vista', 'Fotos aéreas'],
        exclusions: ['Compras pessoais'],
        votes: Math.floor(Math.random() * 15) + 5,
        isPopular: false
      }
    ]
  };

  // Proposta genérica para atividades não mapeadas
  const genericProposals = [
    {
      title: 'Opção Básica',
      description: 'Experiência padrão da atividade',
      amount: parseFloat((Math.random() * 100 + 50).toFixed(2)),
      inclusions: ['Atividade principal', 'Equipamentos básicos'],
      exclusions: ['Alimentação', 'Bebidas', 'Transporte'],
      votes: Math.floor(Math.random() * 20) + 5,
      isPopular: false
    },
    {
      title: 'Opção Completa',
      description: 'Experiência com guia e comodidades',
      amount: parseFloat((Math.random() * 150 + 100).toFixed(2)),
      inclusions: ['Atividade principal', 'Guia especializado', 'Equipamentos', 'Lanche'],
      exclusions: ['Bebidas alcoólicas', 'Compras pessoais'],
      votes: Math.floor(Math.random() * 35) + 20,
      isPopular: true
    },
    {
      title: 'Opção Premium',
      description: 'Experiência exclusiva e personalizada',
      amount: parseFloat((Math.random() * 200 + 200).toFixed(2)),
      inclusions: ['Experiência privativa', 'Guia exclusivo', 'Transporte', 'Refeição', 'Fotos'],
      exclusions: ['Compras pessoais'],
      votes: Math.floor(Math.random() * 15) + 8,
      isPopular: false
    }
  ];

  return baseProposals[title] || genericProposals;
}

async function createReviewsForActivity(activityId: number, users: any[]) {
  // Criar de 2 a 5 avaliações por atividade
  const numReviews = Math.floor(Math.random() * 4) + 2;
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
  
  const reviewTexts = [
    'Experiência incrível! Superou todas as expectativas. Recomendo muito!',
    'Muito bom, mas poderia ser um pouco melhor organizado.',
    'Perfeito! Vista sensacional e atendimento excelente.',
    'Legal, mas achei um pouco caro para o que oferece.',
    'Fantástico! Uma das melhores experiências que já tive.',
    'Boa atividade, mas estava muito cheio no dia.',
    'Maravilhoso! Vale cada centavo. Voltaria com certeza.',
    'Interessante, mas esperava mais. Talvez seja melhor em outra época.',
    'Simplesmente espetacular! Não há palavras para descrever.',
    'Gostei, mas o tempo da atividade foi um pouco corrido.'
  ];

  for (let i = 0; i < Math.min(numReviews, shuffledUsers.length); i++) {
    const user = shuffledUsers[i];
    const rating = Math.floor(Math.random() * 2) + 4; // Ratings entre 4 e 5 (mais realístico)
    const comment = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
    const helpfulVotes = Math.floor(Math.random() * 20) + 1;
    
    // Data de visita aleatória nos últimos 6 meses
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 180));
    
    try {
      await db.execute(sql`
        INSERT INTO activity_reviews (
          activity_id, user_id, rating, comment, visit_date, 
          is_verified, helpful_votes
        ) VALUES (
          ${activityId},
          ${user.id},
          ${rating},
          ${comment},
          ${visitDate.toISOString().split('T')[0]},
          ${Math.random() > 0.3}, -- 70% verificadas
          ${helpfulVotes}
        )
      `);
    } catch (error) {
      // Ignora duplicatas (mesmo usuário avaliando a mesma atividade)
      if (!error.message.includes('Duplicate entry')) {
        console.error(`Erro ao criar avaliação: ${error.message}`);
      }
    }
  }
}

async function updateActivityRatings() {
  // Atualizar a média de rating para cada atividade
  await db.execute(sql`
    UPDATE activities a
    SET 
      average_rating = (
        SELECT COALESCE(AVG(r.rating), 0)
        FROM activity_reviews r 
        WHERE r.activity_id = a.id AND r.is_hidden = FALSE
      ),
      total_ratings = (
        SELECT COUNT(*)
        FROM activity_reviews r 
        WHERE r.activity_id = a.id AND r.is_hidden = FALSE
      )
  `);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createRealisticSeedData()
    .then(() => {
      console.log('✅ Seed realístico concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}