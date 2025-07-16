import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function createActivityReviews() {
  console.log('⭐ Criando avaliações realísticas para todas as atividades...');

  try {
    // Obter todas as atividades e usuários
    const activities = await db.execute(sql`SELECT id, title FROM activities`);
    const users = await db.execute(sql`SELECT id, username FROM users`);
    
    console.log(`📊 Encontradas ${activities.length} atividades e ${users.length} usuários`);

    // Limpar avaliações existentes (se houver)
    await db.execute(sql`DELETE FROM activity_reviews`);

    let totalReviews = 0;

    // Comentários realísticos para as avaliações
    const reviewComments = [
      'Experiência incrível! Superou todas as expectativas. Recomendo muito!',
      'Muito bom, mas poderia ser um pouco melhor organizado.',
      'Perfeito! Vista sensacional e atendimento excelente.',
      'Legal, mas achei um pouco caro para o que oferece.',
      'Fantástico! Uma das melhores experiências que já tive.',
      'Boa atividade, mas estava muito cheio no dia.',
      'Maravilhoso! Vale cada centavo. Voltaria com certeza.',
      'Interessante, mas esperava mais. Talvez seja melhor em outra época.',
      'Simplesmente espetacular! Não há palavras para descrever.',
      'Gostei, mas o tempo da atividade foi um pouco corrido.',
      'Incrível! A vista é de tirar o fôlego. Recomendo ir no pôr do sol.',
      'Muito bem organizado e o guia foi excelente. Valeu muito a pena!',
      'Atividade boa, mas o preço está meio salgado para o que oferece.',
      'Adorei! Foi uma das melhores partes da minha viagem.',
      'Experiência única! Definitivamente algo que todos deveriam fazer.'
    ];

    for (const activity of activities) {
      console.log(`💬 Criando avaliações para: ${activity.title}`);
      
      // Criar entre 2 a 6 avaliações por atividade
      const numReviews = Math.floor(Math.random() * 5) + 2;
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(numReviews, shuffledUsers.length); i++) {
        const user = shuffledUsers[i];
        const rating = Math.floor(Math.random() * 2) + 4; // Rating entre 4 e 5 (mais realístico)
        const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const helpfulVotes = Math.floor(Math.random() * 25) + 1;
        const isVerified = Math.random() > 0.25; // 75% verificadas
        
        // Data de visita aleatória nos últimos 6 meses
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 180));
        const visitDateStr = visitDate.toISOString().split('T')[0];
        
        try {
          await db.execute(sql`
            INSERT INTO activity_reviews (
              activity_id, user_id, rating, comment, visit_date, 
              is_verified, helpful_votes, is_hidden
            ) VALUES (
              ${activity.id},
              ${user.id},
              ${rating},
              ${comment},
              ${visitDateStr},
              ${isVerified},
              ${helpfulVotes},
              false
            )
          `);
          totalReviews++;
        } catch (error) {
          // Ignora erro de usuário duplicado avaliando a mesma atividade
          if (!error.message.includes('Duplicate entry')) {
            console.error(`Erro ao criar avaliação: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ ${totalReviews} avaliações criadas com sucesso!`);

    // Atualizar as médias de rating das atividades
    console.log('📊 Atualizando médias de rating...');
    await updateActivityRatings();

  } catch (error) {
    console.error('❌ Erro ao criar avaliações:', error);
    throw error;
  }
}

async function updateActivityRatings() {
  // Atualizar a média de rating e total de avaliações para cada atividade
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
  
  console.log('✅ Médias de rating atualizadas!');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createActivityReviews()
    .then(() => {
      console.log('✅ Criação de avaliações concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}