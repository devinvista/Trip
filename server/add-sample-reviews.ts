import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function addSampleReviews() {
  console.log('⭐ Adicionando avaliações de exemplo para as atividades...');

  try {
    // Verificar se já existem avaliações
    const existingReviews = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    console.log(`📊 Avaliações existentes: ${existingReviews[0]?.count || 0}`);

    // Verificar se existem usuários para fazer as avaliações
    const users = await db.execute(sql`SELECT id, username FROM users LIMIT 5`);
    
    if (users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado. Avaliações não serão adicionadas.');
      return;
    }

    console.log(`👥 Usuários disponíveis: ${users.length}`);

    // Obter IDs das atividades recém-criadas
    const activities = await db.execute(sql`
      SELECT id, title FROM activities 
      WHERE title IN (
        'Cristo Redentor / Corcovado',
        'Pão de Açúcar (Bondinho)', 
        'Praia de Copacabana / Ipanema + Esportes',
        'MASP + Avenida Paulista',
        'Pelourinho + Elevador Lacerda',
        'Cataratas do Iguaçu (lado brasileiro)'
      )
    `);

    console.log(`🎯 Atividades encontradas: ${activities.length}`);

    // Avaliações para o Cristo Redentor
    const christoActivity = activities.find(a => a.title === 'Cristo Redentor / Corcovado');
    if (christoActivity && users[0]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${christoActivity.id},
          ${users[0].id},
          5,
          'Experiência incrível! A vista é de tirar o fôlego. O Cristo Redentor é realmente uma das maravilhas do mundo. Recomendo ir no fim da tarde para ver o pôr do sol.',
          '2024-12-15',
          true,
          12
        )
      `);

      if (users[1]) {
        await db.execute(sql`
          INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
          VALUES (
            ${christoActivity.id},
            ${users[1].id},
            4,
            'Muito bonito, mas estava bem cheio. O trem demora um pouco para subir, mas vale a pena. Leve protetor solar!',
            '2024-12-10',
            true,
            8
          )
        `);
      }
    }

    // Avaliações para o Pão de Açúcar
    const paoActivity = activities.find(a => a.title === 'Pão de Açúcar (Bondinho)');
    if (paoActivity && users[0]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${paoActivity.id},
          ${users[0].id},
          5,
          'O bondinho é uma experiência única! A vista da Baía de Guanabara é espetacular. Recomendo ir no final da tarde para ver o pôr do sol sobre a cidade.',
          '2024-12-08',
          true,
          15
        )
      `);

      if (users[2]) {
        await db.execute(sql`
          INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
          VALUES (
            ${paoActivity.id},
            ${users[2].id},
            4,
            'Vista incrível! O bondinho histórico funciona muito bem. Só achei um pouco caro, mas é um passeio clássico do Rio.',
            '2024-12-05',
            true,
            6
          )
        `);
      }
    }

    // Avaliações para Copacabana/Ipanema
    const praiaActivity = activities.find(a => a.title === 'Praia de Copacabana / Ipanema + Esportes');
    if (praiaActivity && users[1]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${praiaActivity.id},
          ${users[1].id},
          5,
          'Aula de surf fantástica! O instrutor foi muito paciente e atencioso. As praias são lindas e a energia carioca é contagiante. Voltarei com certeza!',
          '2024-12-12',
          true,
          9
        )
      `);
    }

    // Avaliações para MASP
    const maspActivity = activities.find(a => a.title === 'MASP + Avenida Paulista');
    if (maspActivity && users[2]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${maspActivity.id},
          ${users[2].id},
          4,
          'Museu excelente com um acervo impressionante. A arquitetura do prédio também é interessante. A Paulista é movimentada mas vale a caminhada.',
          '2024-12-07',
          true,
          7
        )
      `);
    }

    // Avaliações para Pelourinho
    const pelourinhoActivity = activities.find(a => a.title === 'Pelourinho + Elevador Lacerda');
    if (pelourinhoActivity && users[0]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${pelourinhoActivity.id},
          ${users[0].id},
          5,
          'Salvador é mágica! O Pelourinho é um patrimônio incrível, cheio de história e cultura. A capoeira e o acarajé completam a experiência. Imperdível!',
          '2024-12-03',
          true,
          18
        )
      `);
    }

    // Avaliações para Cataratas
    const cataratasActivity = activities.find(a => a.title === 'Cataratas do Iguaçu (lado brasileiro)');
    if (cataratasActivity && users[1]) {
      await db.execute(sql`
        INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
        VALUES (
          ${cataratasActivity.id},
          ${users[1].id},
          5,
          'Uma das experiências mais impressionantes que já tive! As cataratas são majestosas e a força da natureza é esmagadora. Leve capa de chuva!',
          '2024-11-28',
          true,
          22
        )
      `);

      if (users[3]) {
        await db.execute(sql`
          INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes)
          VALUES (
            ${cataratasActivity.id},
            ${users[3].id},
            4,
            'Incrível! As 275 quedas são um espetáculo da natureza. O parque é bem organizado, mas prepare-se para se molhar bastante!',
            '2024-11-25',
            true,
            14
          )
        `);
      }
    }

    console.log('✅ Avaliações de exemplo adicionadas com sucesso!');

    // Verificar total final
    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    console.log(`📊 Total de avaliações agora: ${finalCount[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Erro ao adicionar avaliações:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleReviews()
    .then(() => {
      console.log('✅ Processo de avaliações concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}