import { db } from './db.js';

async function createBudgetProposalsSimple() {
  try {
    console.log('💰 CRIANDO PROPOSTAS DE ORÇAMENTO PARA TODAS AS ATIVIDADES...\n');
    
    // Buscar todas as atividades
    const [activitiesResult] = await db.execute('SELECT id, title, location FROM activities ORDER BY id');
    const activities = activitiesResult as any[];
    
    console.log(`📊 Encontradas ${activities.length} atividades`);
    
    let totalProposals = 0;
    
    for (const activity of activities) {
      console.log(`\n💡 Criando propostas para: ${activity.title} (${activity.location})`);
      
      // Verificar se já tem propostas
      const [existingResult] = await db.execute(
        `SELECT COUNT(*) as count FROM activity_budget_proposals WHERE activity_id = ${activity.id}`
      );
      
      const existingCount = (existingResult as any)[0].count;
      if (existingCount > 0) {
        console.log(`  ⚠️  Já possui ${existingCount} propostas - pulando`);
        continue;
      }
      
      // Criar 3 propostas para cada atividade
      const basePrice = Math.floor(Math.random() * 100) + 50; // R$ 50-150 base
      
      const proposals = [
        {
          title: 'Econômico',
          description: 'Opção básica com o essencial para a atividade',
          amount: basePrice,
          inclusions: '["Guia local", "Seguro básico"]',
          exclusions: '["Transporte", "Alimentação", "Equipamentos extras"]'
        },
        {
          title: 'Completo',
          description: 'Experiência completa com conforto e praticidade',
          amount: Math.floor(basePrice * 1.6),
          inclusions: '["Guia especializado", "Transporte", "Seguro", "Lanche", "Equipamentos"]',
          exclusions: '["Alimentação completa", "Bebidas alcoólicas"]'
        },
        {
          title: 'Premium',
          description: 'Experiência de luxo com todos os extras incluídos',
          amount: Math.floor(basePrice * 2.5),
          inclusions: '["Guia exclusivo", "Transporte executivo", "Seguro premium", "Alimentação completa", "Equipamentos profissionais", "Fotos", "Souvenirs"]',
          exclusions: '[]'
        }
      ];
      
      for (const proposal of proposals) {
        try {
          const sql = `
            INSERT INTO activity_budget_proposals (
              activity_id, created_by, title, description, 
              price_type, amount, currency, inclusions, exclusions,
              is_active, votes, created_at, updated_at
            ) VALUES (
              ${activity.id}, 
              1, 
              '${proposal.title}', 
              '${proposal.description}', 
              'per_person', 
              ${proposal.amount}, 
              'BRL', 
              '${proposal.inclusions}', 
              '${proposal.exclusions}',
              1, 
              0, 
              NOW(), 
              NOW()
            )
          `;
          
          await db.execute(sql);
          
          console.log(`    ✅ ${proposal.title}: R$ ${proposal.amount}`);
          totalProposals++;
          
        } catch (error) {
          console.error(`    ❌ Erro ao criar proposta ${proposal.title}:`, error);
        }
      }
    }
    
    console.log(`\n✅ Processo concluído! ${totalProposals} propostas criadas.`);
    
    // Verificar resultado final
    const [finalResult] = await db.execute(`
      SELECT 
        a.id,
        a.title,
        a.location,
        COUNT(p.id) as proposals_count,
        GROUP_CONCAT(CONCAT(p.title, ': R$ ', p.amount) SEPARATOR ', ') as proposals
      FROM activities a
      LEFT JOIN activity_budget_proposals p ON a.id = p.activity_id
      GROUP BY a.id, a.title, a.location
      ORDER BY a.id
      LIMIT 10
    `);
    
    console.log('\n📊 VERIFICAÇÃO FINAL (primeiras 10 atividades):');
    (finalResult as any).forEach(row => {
      console.log(`\n  ${row.title} (${row.location})`);
      console.log(`    Propostas: ${row.proposals_count}`);
      if (row.proposals) {
        console.log(`    Detalhes: ${row.proposals}`);
      }
    });
    
    // Verificar total geral
    const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM activity_budget_proposals');
    const totalFinal = (totalResult as any)[0].total;
    console.log(`\n🎯 TOTAL FINAL: ${totalFinal} propostas de orçamento criadas`);
    
  } catch (error) {
    console.error('❌ Erro durante criação de propostas:', error);
  }
  
  process.exit(0);
}

createBudgetProposalsSimple();