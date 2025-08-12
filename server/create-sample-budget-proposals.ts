#!/usr/bin/env tsx

// Script para criar propostas de orçamento de exemplo
import { db } from "./db.js";
import { activityBudgetProposals, activities, users } from "@shared/schema.js";
import { eq } from "drizzle-orm";

async function createSampleBudgetProposals() {
  console.log("🎯 Criando propostas de orçamento de exemplo...");

  try {
    // Buscar algumas atividades existentes
    const existingActivities = await db.select({ id: activities.id, title: activities.title })
      .from(activities)
      .limit(10);

    if (existingActivities.length === 0) {
      console.log("❌ Nenhuma atividade encontrada no banco de dados");
      return;
    }

    console.log(`✅ Encontradas ${existingActivities.length} atividades`);

    // Buscar um usuário para ser o criador das propostas
    const user = await db.select({ id: users.id, username: users.username })
      .from(users)
      .limit(1);

    if (user.length === 0) {
      console.log("❌ Nenhum usuário encontrado no banco de dados");
      return;
    }

    const creatorId = user[0].id;
    console.log(`✅ Usando usuário: ${user[0].username} (ID: ${creatorId})`);

    // Criar propostas para as primeiras 5 atividades
    const proposalsData = [
      // Cristo Redentor (normalmente ID 3)
      {
        activity_id: existingActivities[0]?.id || 3,
        created_by: creatorId,
        title: "Entrada + Transporte Van",
        description: "Inclui ingresso do Cristo Redentor + transporte de van saindo da Praia de Copacabana",
        amount: 85,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Ingresso do Cristo Redentor", "Transporte de van", "Guia local"],
        exclusions: ["Alimentação", "Seguro pessoal"],
        is_active: true
      },
      {
        activity_id: existingActivities[0]?.id || 3,
        created_by: creatorId,
        title: "Pacote Completo",
        description: "Experiência completa com guia bilíngue, transporte premium e lanche incluído",
        amount: 160,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Ingresso do Cristo Redentor", "Transporte premium", "Guia bilíngue", "Lanche", "Seguro"],
        exclusions: ["Bebidas alcoólicas"],
        is_active: true
      },
      // Segunda atividade
      {
        activity_id: existingActivities[1]?.id || 5,
        created_by: creatorId,
        title: "Tour Básico",
        description: "Tour básico pelo centro histórico com guia local",
        amount: 45,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Guia local", "Mapa da região"],
        exclusions: ["Transporte", "Alimentação", "Entradas em museus"],
        is_active: true
      },
      {
        activity_id: existingActivities[1]?.id || 5,
        created_by: creatorId,
        title: "Tour Premium",
        description: "Tour completo com transporte, guia especializado e entradas incluídas",
        amount: 120,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Guia especializado", "Transporte", "Entradas em museus", "Lanche"],
        exclusions: ["Bebidas"],
        is_active: true
      },
      // Terceira atividade
      {
        activity_id: existingActivities[2]?.id || 7,
        created_by: creatorId,
        title: "Ingresso Individual",
        description: "Apenas ingresso de entrada, sem serviços adicionais",
        amount: 30,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Ingresso de entrada"],
        exclusions: ["Transporte", "Guia", "Alimentação"],
        is_active: true
      },
      {
        activity_id: existingActivities[2]?.id || 7,
        created_by: creatorId,
        title: "Experiência VIP",
        description: "Acesso VIP com guia privado e transfer exclusivo",
        amount: 250,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Acesso VIP", "Guia privado", "Transfer exclusivo", "Welcome drink", "Certificado"],
        exclusions: ["Compras pessoais"],
        is_active: true
      },
      // Quarta atividade
      {
        activity_id: existingActivities[3]?.id || 9,
        created_by: creatorId,
        title: "Tour Econômico",
        description: "Opção mais em conta para grupos grandes",
        amount: 25,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Entrada", "Mapa básico"],
        exclusions: ["Guia", "Transporte", "Alimentação"],
        is_active: true
      },
      {
        activity_id: existingActivities[3]?.id || 9,
        created_by: creatorId,
        title: "Pacote Família",
        description: "Ideal para famílias, com atividades para crianças",
        amount: 90,
        currency: "BRL",
        price_type: "per_person",
        inclusions: ["Entrada", "Atividades infantis", "Guia família", "Kit lanche"],
        exclusions: ["Transporte"],
        is_active: true
      }
    ];

    // Inserir propostas no banco
    for (const proposal of proposalsData) {
      try {
        const [inserted] = await db.insert(activityBudgetProposals).values({
          ...proposal,
          amount: proposal.amount.toString(), // Convert to string as expected by the schema
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify(proposal.exclusions)
        }).returning();

        console.log(`✅ Proposta criada: ${proposal.title} - R$ ${proposal.amount} (Atividade ${proposal.activity_id})`);
      } catch (error) {
        console.error(`❌ Erro ao criar proposta "${proposal.title}":`, error);
      }
    }

    // Verificar quantas propostas foram criadas
    const totalProposals = await db.select().from(activityBudgetProposals);
    console.log(`🎉 Total de propostas no banco: ${totalProposals.length}`);

    // Mostrar propostas por atividade
    for (const activity of existingActivities.slice(0, 4)) {
      const activityProposals = await db.select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activity_id, activity.id));
      
      console.log(`📋 Atividade "${activity.title}" (ID: ${activity.id}): ${activityProposals.length} propostas`);
    }

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar script
createSampleBudgetProposals()
  .then(() => {
    console.log("✅ Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });