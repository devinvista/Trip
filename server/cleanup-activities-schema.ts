import { db } from "./db.js";

async function cleanupActivitiesSchema() {
  try {
    console.log("🔧 Verificando e limpando schema da tabela activities...");

    // Check current table structure
    const tableStructure = await db.execute("DESCRIBE activities");
    console.log("📊 Estrutura atual da tabela activities:");
    
    tableStructure.forEach((column: any) => {
      console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(null)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}`);
    });

    // Check for unnecessary columns that might exist (legacy columns)
    const unnecessaryColumns = ['location', 'city_id', 'city', 'localidade', 'region', 'country'];
    const existingColumns = tableStructure.map((col: any) => col.Field);
    
    const columnsToRemove = unnecessaryColumns.filter(col => existingColumns.includes(col));
    
    if (columnsToRemove.length > 0) {
      console.log(`🗑️ Colunas desnecessárias encontradas: ${columnsToRemove.join(', ')}`);
      
      for (const column of columnsToRemove) {
        try {
          await db.execute(`ALTER TABLE activities DROP COLUMN ${column}`);
          console.log(`✅ Coluna '${column}' removida com sucesso`);
        } catch (error) {
          console.log(`ℹ️ Coluna '${column}' não existe ou não pôde ser removida:`, error);
        }
      }
    } else {
      console.log("✅ Nenhuma coluna desnecessária encontrada");
    }

    // Verify destination_id foreign key constraint exists
    try {
      const foreignKeys = await db.execute(`
        SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'activities' 
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      console.log("🔗 Foreign keys da tabela activities:");
      if (foreignKeys.length > 0) {
        foreignKeys.forEach((fk: any) => {
          console.log(`   • ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      } else {
        console.log("   • Nenhuma foreign key encontrada");
      }
    } catch (error) {
      console.log("ℹ️ Não foi possível verificar foreign keys:", error);
    }

    // Final verification - count activities by destination
    const activityDistribution = await db.execute(`
      SELECT 
        d.name as destination_name,
        d.country,
        COUNT(a.id) as activity_count
      FROM activities a
      LEFT JOIN destinations d ON a.destination_id = d.id
      GROUP BY d.id, d.name, d.country
      HAVING COUNT(a.id) > 0
      ORDER BY d.country, activity_count DESC
    `);

    console.log("📍 Distribuição final de atividades por destino:");
    let totalActivities = 0;
    activityDistribution.forEach((item: any) => {
      console.log(`   • ${item.destination_name} (${item.country}): ${item.activity_count} atividades`);
      totalActivities += item.activity_count;
    });
    
    console.log(`📊 Total de atividades vinculadas: ${totalActivities}`);

    // Check for activities without destination_id
    const orphanedActivities = await db.execute(`
      SELECT COUNT(*) as count FROM activities WHERE destination_id IS NULL
    `);
    
    const orphanCount = orphanedActivities[0]?.count || 0;
    if (orphanCount > 0) {
      console.log(`⚠️ Encontradas ${orphanCount} atividades sem destination_id`);
    } else {
      console.log("✅ Todas as atividades possuem destination_id válido");
    }

    console.log("🎉 Limpeza do schema concluída!");

  } catch (error) {
    console.error("❌ Erro na limpeza do schema:", error);
  }
}

// Execute
cleanupActivitiesSchema();