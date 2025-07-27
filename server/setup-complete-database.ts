#!/usr/bin/env tsx
import { db } from './db.js';
import { createDestinations } from './create-destinations.js';
import { createComprehensiveActivities } from './create-comprehensive-activities.js';
import { fixDatabaseCompatibility } from './fix-database-compatibility.js';

/**
 * Script principal para configurar completamente o banco de dados
 * Executa todos os scripts necessários na ordem correta
 */
async function setupCompleteDatabase() {
  console.log('🚀 Configurando banco de dados completo...');
  console.log('=============================================');

  try {
    // 1. Corrigir compatibilidade
    console.log('\n🔧 PASSO 1: Corrigindo compatibilidade do banco...');
    await fixDatabaseCompatibility();
    
    // 2. Criar destinos
    console.log('\n🌍 PASSO 2: Criando destinos...');
    const destinationsCount = await createDestinations();
    
    // 3. Criar atividades abrangentes
    console.log('\n🏛️ PASSO 3: Criando atividades abrangentes...');
    const activitiesResult = await createComprehensiveActivities();
    
    console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
    console.log('=============================================');
    console.log(`✅ Destinos criados: ${destinationsCount}`);
    console.log(`✅ Atividades criadas: ${activitiesResult.activities}`);
    console.log(`✅ Propostas criadas: ${activitiesResult.proposals}`);
    console.log('\n📋 O banco PostgreSQL está agora completamente configurado e pronto para uso!');
    
    return {
      destinations: destinationsCount,
      activities: activitiesResult.activities,
      proposals: activitiesResult.proposals
    };

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCompleteDatabase()
    .then((result) => {
      console.log('\n✅ SETUP CONCLUÍDO COM SUCESSO!');
      console.log(`   🌍 ${result.destinations} destinos`);
      console.log(`   🏛️ ${result.activities} atividades`);
      console.log(`   💰 ${result.proposals} propostas`);
      console.log('\n🚀 A plataforma PartiuTrip está pronta para uso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no setup:', error);
      process.exit(1);
    });
}

export { setupCompleteDatabase };