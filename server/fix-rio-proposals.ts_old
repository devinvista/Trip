import { db } from './db.js';
import { activityBudgetProposals } from '../shared/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

async function fixRioProposals() {
  console.log('🔧 Corrigindo propostas de orçamento das atividades do Rio...');
  
  try {
    // Delete existing proposals for Rio activities (IDs 16-20)
    console.log('🗑️ Removendo propostas incorretas...');
    await db.delete(activityBudgetProposals).where(
      and(
        gte(activityBudgetProposals.activityId, 16),
        lte(activityBudgetProposals.activityId, 20)
      )
    );
    
    // Budget proposals data for each activity
    const proposalsData = [
      // Cristo Redentor / Corcovado (ID: 16)
      { activityId: 16, title: "Econômico", description: "Van oficial básica", amount: "85.00", inclusions: ["Transporte", "Ingresso"] },
      { activityId: 16, title: "Completo", description: "Trem do Corcovado", amount: "160.00", inclusions: ["Trem", "Ingresso", "Guia"] },
      { activityId: 16, title: "Premium", description: "Tour premium VIP", amount: "300.00", inclusions: ["Trem", "Ingresso", "Guia VIP", "Fotos"] },
      
      // Pão de Açúcar (ID: 17)
      { activityId: 17, title: "Econômico", description: "Bondinho básico", amount: "120.00", inclusions: ["Bondinho", "Ingresso"] },
      { activityId: 17, title: "Completo", description: "Bondinho + guia", amount: "200.00", inclusions: ["Bondinho", "Ingresso", "Guia", "Lanche"] },
      { activityId: 17, title: "Premium", description: "Experiência VIP", amount: "350.00", inclusions: ["Bondinho", "Ingresso", "Guia VIP", "Jantar", "Fotos"] },
      
      // Copacabana/Ipanema (ID: 18)
      { activityId: 18, title: "Econômico", description: "Gratuito - praia livre", amount: "0.00", inclusions: ["Acesso à praia"] },
      { activityId: 18, title: "Completo", description: "Aluguel de equipamentos", amount: "80.00", inclusions: ["Prancha surf", "Cadeira", "Guarda-sol"] },
      { activityId: 18, title: "Premium", description: "Aula de surf profissional", amount: "150.00", inclusions: ["Aula surf", "Equipamentos", "Instrutor", "Fotos"] },
      
      // Trilha Pedra Bonita (ID: 19)
      { activityId: 19, title: "Econômico", description: "Trilha livre", amount: "0.00", inclusions: ["Acesso à trilha"] },
      { activityId: 19, title: "Completo", description: "Trilha com guia", amount: "120.00", inclusions: ["Guia", "Equipamentos", "Lanche"] },
      { activityId: 19, title: "Premium", description: "Trilha VIP com fotos", amount: "250.00", inclusions: ["Guia especializado", "Equipamentos", "Fotos profissionais", "Lanche gourmet"] },
      
      // Tour Cultural (ID: 20)
      { activityId: 20, title: "Econômico", description: "Visita individual", amount: "30.00", inclusions: ["Ingressos básicos"] },
      { activityId: 20, title: "Completo", description: "Tour guiado", amount: "120.00", inclusions: ["Ingressos", "Guia", "Transporte"] },
      { activityId: 20, title: "Premium", description: "Tour cultural VIP", amount: "280.00", inclusions: ["Ingressos", "Guia especializado", "Transporte VIP", "Almoço", "Material exclusivo"] }
    ];
    
    // Insert correct proposals
    console.log('✅ Inserindo propostas corretas...');
    for (const proposal of proposalsData) {
      await db.insert(activityBudgetProposals).values({
        activityId: proposal.activityId,
        createdBy: 1, // User tom
        title: proposal.title,
        description: proposal.description,
        amount: proposal.amount,
        inclusions: JSON.stringify(proposal.inclusions),
        exclusions: JSON.stringify([]),
        votes: Math.floor(Math.random() * 50) + 10,
        isActive: true
      });
      
      console.log(`💰 Proposta "${proposal.title}" criada para atividade ${proposal.activityId}: R$ ${proposal.amount}`);
    }
    
    console.log('🎉 Todas as propostas foram corrigidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir propostas:', error);
  }
}

fixRioProposals();