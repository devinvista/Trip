import { db } from './db.js';

async function debugActivitiesAPI() {
  try {
    console.log('🔍 DEPURANDO API DE ATIVIDADES...\n');
    
    // Verificar total de atividades no banco
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM activities');
    const totalActivities = (countResult as any)[0].total;
    console.log(`📊 Total de atividades no banco: ${totalActivities}`);
    
    // Verificar atividades ativas
    const [activeResult] = await db.execute('SELECT COUNT(*) as total FROM activities WHERE is_active = 1');
    const activeActivities = (activeResult as any)[0].total;
    console.log(`✅ Atividades ativas: ${activeActivities}`);
    
    // Verificar propostas de orçamento
    const [proposalsResult] = await db.execute('SELECT COUNT(*) as total FROM activity_budget_proposals');
    const totalProposals = (proposalsResult as any)[0].total;
    console.log(`💰 Total de propostas de orçamento: ${totalProposals}`);
    
    // Verificar primeiras 5 atividades
    const [activitiesResult] = await db.execute(`
      SELECT id, title, location, is_active 
      FROM activities 
      ORDER BY id 
      LIMIT 10
    `);
    
    console.log('\n📝 PRIMEIRAS 10 ATIVIDADES:');
    (activitiesResult as any).forEach((activity, index) => {
      console.log(`  ${index + 1}. [ID ${activity.id}] ${activity.title} (${activity.location}) - Ativo: ${activity.is_active ? 'Sim' : 'Não'}`);
    });
    
    // Verificar propostas por atividade
    console.log('\n💰 PROPOSTAS POR ATIVIDADE:');
    const [proposalsCountResult] = await db.execute(`
      SELECT a.id, a.title, COUNT(p.id) as proposals_count
      FROM activities a
      LEFT JOIN activity_budget_proposals p ON a.id = p.activity_id
      GROUP BY a.id, a.title
      ORDER BY a.id
      LIMIT 10
    `);
    
    (proposalsCountResult as any).forEach(row => {
      console.log(`  Atividade ${row.id} (${row.title}): ${row.proposals_count} propostas`);
    });
    
    // Verificar schema das propostas
    console.log('\n🏗️ SCHEMA DA TABELA activity_budget_proposals:');
    const [schemaResult] = await db.execute('DESCRIBE activity_budget_proposals');
    (schemaResult as any).forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

debugActivitiesAPI();