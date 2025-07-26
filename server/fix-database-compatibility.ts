#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, destinations } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Script para corrigir problemas de compatibilidade do banco de dados
 * e garantir que o esquema MySQL está correto
 */
async function fixDatabaseCompatibility() {
  console.log('🔧 Corrigindo compatibilidade do banco MySQL...');

  try {
    // 1. Verificar estrutura das tabelas principais
    console.log('📋 Verificando estrutura das tabelas...');
    
    // Verificar tabela destinations
    const destinationsSchema = await db.execute(sql`DESCRIBE destinations`);
    console.log('✅ Tabela destinations:', destinationsSchema.length, 'colunas');
    
    // Verificar tabela activities
    const activitiesSchema = await db.execute(sql`DESCRIBE activities`);
    console.log('✅ Tabela activities:', activitiesSchema.length, 'colunas');

    // 2. Verificar se existem destinos básicos
    const destinationsCount = await db.execute(sql`SELECT COUNT(*) as count FROM destinations`);
    console.log(`📊 Destinos cadastrados: ${destinationsCount[0].count}`);
    
    if (destinationsCount[0].count === 0) {
      console.log('🌍 Criando destinos básicos...');
      await createBasicDestinations();
    }

    // 3. Verificar atividades e corrigir problemas de vínculo
    const activitiesCount = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    console.log(`📊 Atividades cadastradas: ${activitiesCount[0].count}`);

    // 4. Limpar atividades órfãs (sem destino válido)
    await cleanOrphanedActivities();

    // 5. Verificar integridade referencial
    await verifyReferentialIntegrity();

    console.log('✅ Compatibilidade do banco corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir compatibilidade:', error);
    throw error;
  }
}

async function createBasicDestinations() {
  const basicDestinations = [
    {
      name: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      countryType: 'nacional' as const,
      region: 'Sudeste',
      continent: 'América do Sul',
      latitude: -22.9068,
      longitude: -43.1729,
      timezone: 'America/Sao_Paulo',
      isPopular: true,
      description: 'Cidade Maravilhosa com Cristo Redentor, Pão de Açúcar e praias famosas'
    },
    {
      name: 'São Paulo',
      state: 'SP', 
      country: 'Brasil',
      countryType: 'nacional' as const,
      region: 'Sudeste',
      continent: 'América do Sul',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
      isPopular: true,
      description: 'Maior metrópole do país com rica vida cultural e gastronômica'
    },
    {
      name: 'Salvador',
      state: 'BA',
      country: 'Brasil', 
      countryType: 'nacional' as const,
      region: 'Nordeste',
      continent: 'América do Sul',
      latitude: -12.9714,
      longitude: -38.5014,
      timezone: 'America/Bahia',
      isPopular: true,
      description: 'Primeira capital do Brasil com centro histórico preservado'
    },
    {
      name: 'Gramado',
      state: 'RS',
      country: 'Brasil',
      countryType: 'nacional' as const,
      region: 'Sul', 
      continent: 'América do Sul',
      latitude: -29.3788,
      longitude: -50.8738,
      timezone: 'America/Sao_Paulo',
      isPopular: true,
      description: 'Charme europeu na Serra Gaúcha com arquitetura alemã'
    },
    {
      name: 'Foz do Iguaçu',
      state: 'PR',
      country: 'Brasil',
      countryType: 'nacional' as const,
      region: 'Sul',
      continent: 'América do Sul', 
      latitude: -25.5478,
      longitude: -54.5882,
      timezone: 'America/Sao_Paulo',
      isPopular: true,
      description: 'Lar das famosas Cataratas do Iguaçu'
    }
  ];

  for (const destination of basicDestinations) {
    await db.insert(destinations).values(destination);
    console.log(`🌍 Destino criado: ${destination.name}, ${destination.state}`);
  }
}

async function cleanOrphanedActivities() {
  console.log('🧹 Limpando atividades órfãs...');
  
  // Verificar atividades que referenciam destinos inexistentes
  const orphanedActivities = await db.execute(sql`
    SELECT a.id, a.title, a.destination_name 
    FROM activities a 
    LEFT JOIN destinations d ON a.destination_name = d.name 
    WHERE d.name IS NULL
  `);
  
  if (orphanedActivities.length > 0) {
    console.log(`⚠️  Encontradas ${orphanedActivities.length} atividades órfãs:`);
    orphanedActivities.forEach(activity => {
      console.log(`   - ${activity.title} (destino: ${activity.destination_name})`);
    });
    
    // Corrigir vinculação baseada em nomes similares
    await fixActivityDestinationLinks();
  } else {
    console.log('✅ Nenhuma atividade órfã encontrada');
  }
}

async function fixActivityDestinationLinks() {
  console.log('🔗 Corrigindo vínculos atividade-destino...');
  
  const mappings = {
    'Rio de Janeiro': ['Rio de Janeiro', 'Rio', 'RJ'],
    'São Paulo': ['São Paulo', 'SP', 'Sampa'],
    'Salvador': ['Salvador', 'Bahia', 'BA'],
    'Gramado': ['Gramado', 'Serra Gaúcha', 'RS'],
    'Foz do Iguaçu': ['Foz do Iguaçu', 'Iguaçu', 'PR']
  };
  
  for (const [correctName, variations] of Object.entries(mappings)) {
    for (const variation of variations) {
      await db.execute(sql`
        UPDATE activities 
        SET destination_name = ${correctName}
        WHERE destination_name LIKE ${`%${variation}%`}
      `);
    }
  }
  
  console.log('✅ Vínculos corrigidos');
}

async function verifyReferentialIntegrity() {
  console.log('🔍 Verificando integridade referencial...');
  
  // Verificar se todas as atividades têm destinos válidos
  const validActivities = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM activities a 
    INNER JOIN destinations d ON a.destination_name = d.name
  `);
  
  const totalActivities = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
  
  console.log(`📊 Atividades com destinos válidos: ${validActivities[0].count}/${totalActivities[0].count}`);
  
  if (validActivities[0].count === totalActivities[0].count) {
    console.log('✅ Integridade referencial OK');
  } else {
    console.log('⚠️  Problemas de integridade detectados');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabaseCompatibility()
    .then(() => {
      console.log('✅ Processo de correção concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}

export { fixDatabaseCompatibility };