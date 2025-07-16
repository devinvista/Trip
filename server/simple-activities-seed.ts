import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function seedBasicActivities() {
  console.log('🌱 Inserindo atividades turísticas básicas...');

  try {
    // Verificar se já existem atividades
    const existingActivities = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    const count = existingActivities[0].count;
    
    if (count > 10) {
      console.log(`ℹ️ Já existem ${count} atividades cadastradas. Pulando seed.`);
      return;
    }

    // Rio de Janeiro - Cristo Redentor
    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Cristo Redentor / Corcovado',
        'Visite um dos símbolos mais famosos do Brasil. O Cristo Redentor oferece uma vista panorâmica de 360° da cidade do Rio de Janeiro. Localizado no topo do Corcovado, a 710m de altura, é considerado uma das Sete Maravilhas do Mundo Moderno.',
        'Rio de Janeiro, RJ',
        'Pontos Turísticos',
        'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop',
        4.8,
        15420,
        true,
        '4 horas',
        'Até 50 pessoas',
        '["Transporte incluído", "Guia turístico", "Entrada incluída", "Seguro viagem"]',
        '["Vista 360° da cidade", "Uma das 7 Maravilhas", "Experiência única", "Fotos inesquecíveis"]'
      )
    `);

    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Pão de Açúcar (Bondinho)',
        'Passeio no famoso bondinho do Pão de Açúcar com vista espetacular da Baía de Guanabara. O percurso inclui duas estações: primeiro a Urca e depois o topo do Pão de Açúcar a 396m de altura.',
        'Rio de Janeiro, RJ',
        'Pontos Turísticos',
        'https://images.unsplash.com/photo-1516712713233-d11f7fa20395?w=800&h=600&fit=crop',
        4.7,
        12350,
        true,
        '3 horas',
        'Até 65 pessoas',
        '["Bondinho histórico", "Vista panorâmica", "Loja de souvenirs", "Restaurante no local"]',
        '["Vista da Baía de Guanabara", "Bondinho centenário", "Pôr do sol inesquecível", "Patrimônio histórico"]'
      )
    `);

    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Praia de Copacabana / Ipanema + Esportes',
        'Aproveite as praias mais famosas do Rio de Janeiro. Atividades incluem aulas de surf, vôlei de praia, futevôlei e passeios de bike pela orla. Desfrute da energia carioca e da beleza natural.',
        'Rio de Janeiro, RJ',
        'Praia e Esportes',
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop',
        4.5,
        8760,
        true,
        '6 horas',
        'Flexível',
        '["Equipamentos incluídos", "Instrutor qualificado", "Água e lanche", "Seguro esportivo"]',
        '["Praias mundialmente famosas", "Esportes aquáticos", "Cultura carioca", "Atividades para todos os níveis"]'
      )
    `);

    // São Paulo - MASP
    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'MASP + Avenida Paulista',
        'Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração financeiro e cultural da cidade. Conheça as obras de arte mais importantes do Brasil.',
        'São Paulo, SP',
        'Cultura e História',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        4.5,
        9870,
        true,
        '4 horas',
        'Até 30 pessoas',
        '["Entrada para museus", "Guia especializado", "Audioguia", "Café incluso"]',
        '["Acervo de arte mundial", "Arquitetura icônica", "Centro cultural", "Vista da cidade"]'
      )
    `);

    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Mercado Municipal + Centro Histórico',
        'Descubra a gastronomia paulistana no famoso Mercadão e explore o centro histórico da cidade, incluindo o Pátio do Colégio e a Catedral da Sé.',
        'São Paulo, SP',
        'Gastronomia',
        'https://images.unsplash.com/photo-1566139066966-de7e8f3b9095?w=800&h=600&fit=crop',
        4.7,
        11200,
        true,
        '4 horas',
        'Até 25 pessoas',
        '["Degustação incluída", "Guia gastronômico", "Transporte", "Voucher para compras"]',
        '["Gastronomia tradicional", "Arquitetura histórica", "Produtos locais", "Experiência cultural"]'
      )
    `);

    // Salvador - Pelourinho
    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Pelourinho + Elevador Lacerda',
        'Explore o centro histórico de Salvador, Patrimônio Mundial da UNESCO. Visite as igrejas barrocas, casarões coloniais e sinta a energia da cultura afro-brasileira no coração da Bahia.',
        'Salvador, BA',
        'Cultura e História',
        'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=800&h=600&fit=crop',
        4.6,
        8540,
        true,
        '5 horas',
        'Até 20 pessoas',
        '["Guia cultural", "Entrada em igrejas", "Show de capoeira", "Degustação de acarajé"]',
        '["Patrimônio UNESCO", "Arquitetura colonial", "Cultura afro-brasileira", "Música e dança"]'
      )
    `);

    // Foz do Iguaçu - Cataratas
    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Cataratas do Iguaçu (lado brasileiro)',
        'Conheça uma das maiores quedas d\'água do mundo. Vista panorâmica impressionante das 275 quedas que formam as Cataratas do Iguaçu, Patrimônio Natural da Humanidade.',
        'Foz do Iguaçu, PR',
        'Natureza',
        'https://images.unsplash.com/photo-1569586580648-f5152c716fde?w=800&h=600&fit=crop',
        4.9,
        22100,
        true,
        '6 horas',
        'Até 40 pessoas',
        '["Entrada do parque", "Transporte interno", "Trilha ecológica", "Mirante panorâmico"]',
        '["Patrimônio da Humanidade", "275 quedas d\'água", "Vista panorâmica", "Experiência única"]'
      )
    `);

    // Florianópolis - Lagoa da Conceição
    await db.execute(sql`
      INSERT INTO activities (title, description, location, category, cover_image, average_rating, total_reviews, is_verified, duration, group_size, amenities, highlights) 
      VALUES (
        'Lagoa da Conceição (caiaque, SUP)',
        'Explore a famosa Lagoa da Conceição de caiaque ou stand up paddle. Águas calmas ideais para esportes aquáticos com vista das dunas e morros da Ilha da Magia.',
        'Florianópolis, SC',
        'Praia e Esportes',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        4.4,
        6780,
        true,
        '3 horas',
        'Até 12 pessoas',
        '["Equipamentos incluídos", "Instrutor certificado", "Colete salva-vidas", "Seguro esportivo"]',
        '["Águas calmas", "Vista das dunas", "Esporte na natureza", "Experiência relaxante"]'
      )
    `);

    console.log('✅ Atividades básicas inseridas com sucesso!');

    // Agora inserir propostas de orçamento para essas atividades
    await seedBudgetProposals();

    console.log('✅ Propostas de orçamento inseridas!');

  } catch (error) {
    console.error('❌ Erro ao inserir atividades:', error);
    throw error;
  }
}

async function seedBudgetProposals() {
  console.log('💰 Inserindo propostas de orçamento...');

  // Cristo Redentor
  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      1,
      'Opção Econômica',
      'Van oficial até o Cristo Redentor',
      85.00,
      'BRL',
      '["Transporte van oficial", "Entrada para o monumento"]',
      '["Alimentação", "Bebidas", "Compras pessoais"]',
      50,
      false,
      12
    )
  `);

  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      1,
      'Opção Intermediária',
      'Trem do Corcovado + entrada + guia',
      160.00,
      'BRL',
      '["Trem do Corcovado", "Entrada para o monumento", "Guia turístico"]',
      '["Bebidas alcoólicas", "Compras pessoais"]',
      30,
      true,
      28
    )
  `);

  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      1,
      'Opção Premium',
      'Tour privativo com transporte executivo',
      320.00,
      'BRL',
      '["Transporte privativo", "Guia exclusivo", "Entrada VIP", "Fotos profissionais"]',
      '["Compras pessoais"]',
      12,
      false,
      15
    )
  `);

  // Pão de Açúcar
  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      2,
      'Opção Econômica',
      'Ingresso padrão para o bondinho',
      120.00,
      'BRL',
      '["Bondinho ida e volta", "Acesso aos mirantes"]',
      '["Alimentação", "Bebidas", "Fotos"]',
      65,
      false,
      8
    )
  `);

  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      2,
      'Opção Intermediária',
      'Bondinho + guia turístico',
      190.00,
      'BRL',
      '["Bondinho ida e volta", "Guia turístico", "Mapa da região"]',
      '["Bebidas alcoólicas", "Fotos profissionais"]',
      40,
      true,
      22
    )
  `);

  // Copacabana/Ipanema
  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      3,
      'Acesso Livre',
      'Acesso livre às praias',
      0.00,
      'BRL',
      '["Acesso às praias", "Mapa da região"]',
      '["Equipamentos", "Instrução", "Alimentação"]',
      999,
      false,
      5
    )
  `);

  await db.execute(sql`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, currency, inclusions, exclusions, max_participants, is_popular, votes) 
    VALUES (
      3,
      'Com Atividades',
      'Aula de surf ou aluguel de bike',
      100.00,
      'BRL',
      '["Aula de surf/bike 2h", "Equipamentos", "Instrutor"]',
      '["Alimentação", "Bebidas", "Transporte"]',
      15,
      true,
      18
    )
  `);

  console.log('💰 Propostas de orçamento inseridas com sucesso!');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBasicActivities()
    .then(() => {
      console.log('✅ Seed de atividades básicas concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}