import { db } from './db.js';
import { activityBudgetProposals, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function testProposalsAPI() {
  try {
    console.log('🔍 Testando propostas da atividade 162...');
    
    // Verificar se usuário criador existe
    const [user] = await db.select().from(users).where(eq(users.id, 1));
    console.log('Usuário criador ID 1:', user ? user.username : 'NÃO ENCONTRADO');
    
    // Buscar propostas brutas
    const rawProposals = await db.select().from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, 162));
    
    console.log(`\n📊 Propostas brutas: ${rawProposals.length}`);
    rawProposals.forEach((p, i) => {
      console.log(`${i+1}. ${p.title} - Criado por: ${p.createdBy} - Ativo: ${p.isActive}`);
    });
    
    // Buscar propostas ativas apenas
    const activeProposals = await db.select().from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, 162))
      .where(eq(activityBudgetProposals.isActive, true));
    
    console.log(`\n📊 Propostas ativas: ${activeProposals.length}`);
    
    // Simular o método getActivityBudgetProposals
    const result = [];
    for (const proposal of activeProposals) {
      const creator = await db.select().from(users).where(eq(users.id, proposal.createdBy));
      if (creator.length > 0) {
        result.push({
          ...proposal,
          creator: { id: creator[0].id, username: creator[0].username, email: creator[0].email }
        });
      } else {
        console.log(`⚠️ Criador ${proposal.createdBy} não encontrado para proposta ${proposal.title}`);
      }
    }
    
    console.log(`\n✅ Resultado final: ${result.length} propostas com criadores`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testProposalsAPI().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});