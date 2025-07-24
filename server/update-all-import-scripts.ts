import fs from 'fs';
import path from 'path';

async function updateAllImportScripts() {
  console.log('🔧 ATUALIZANDO TODOS OS SCRIPTS DE IMPORTAÇÃO PARA O SCHEMA MySQL...\n');
  
  const scriptsToUpdate = [
    'add-buenos-aires-activities.ts',
    'add-london-activities.ts',
    'add-nyc-activities.ts',
    'add-paris-activities.ts',
    'add-rome-activities.ts',
    'add-bonito-activities.ts',
    'add-gramado-activities-fixed.ts',
    'add-rio-activities.ts',
    'add-sample-activities.ts'
  ];
  
  const replacements = [
    // Campo principal
    { from: 'createdById: 1', to: 'created_by_id: 1' },
    { from: 'createdById: 2', to: 'created_by_id: 2' },
    { from: 'createdById: 3', to: 'created_by_id: 3' },
    { from: 'createdById: 4', to: 'created_by_id: 4' },
    { from: 'createdById: 5', to: 'created_by_id: 5' },
    { from: 'createdById: 6', to: 'created_by_id: 6' },
    
    // Campos que podem estar errados
    { from: 'priceType:', to: 'price_type:' },
    { from: 'priceAmount:', to: 'price_amount:' },
    { from: 'difficultyLevel:', to: 'difficulty_level:' },
    { from: 'minParticipants:', to: 'min_participants:' },
    { from: 'maxParticipants:', to: 'max_participants:' },
    { from: 'countryType:', to: 'country_type:' },
    { from: 'coverImage:', to: 'cover_image:' },
    { from: 'averageRating:', to: 'average_rating:' },
    { from: 'totalRatings:', to: 'total_ratings:' },
    { from: 'isActive:', to: 'is_active:' },
    { from: 'createdAt:', to: 'created_at:' },
    { from: 'updatedAt:', to: 'updated_at:' },
    { from: 'contactInfo:', to: 'contact_info:' },
    { from: 'cancellationPolicy:', to: 'cancellation_policy:' }
  ];
  
  for (const scriptName of scriptsToUpdate) {
    const filePath = path.join(process.cwd(), scriptName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${scriptName}`);
      continue;
    }
    
    console.log(`📝 Atualizando: ${scriptName}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let changesCount = 0;
      
      for (const replacement of replacements) {
        const originalContent = content;
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        
        if (content !== originalContent) {
          const matches = (originalContent.match(new RegExp(replacement.from, 'g')) || []).length;
          changesCount += matches;
          console.log(`    ✅ ${replacement.from} → ${replacement.to} (${matches} ocorrências)`);
        }
      }
      
      if (changesCount > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`    💾 Arquivo salvo com ${changesCount} alterações`);
      } else {
        console.log(`    ℹ️  Nenhuma alteração necessária`);
      }
      
    } catch (error) {
      console.error(`    ❌ Erro ao processar ${scriptName}:`, error);
    }
  }
  
  console.log('\n✅ Atualização de scripts concluída!');
  
  // Verificar se as importações estão usando o schema correto
  console.log('\n🔍 VERIFICANDO COMPATIBILIDADE COM MYSQL...');
  
  const sampleScript = path.join(process.cwd(), 'add-buenos-aires-activities.ts');
  if (fs.existsSync(sampleScript)) {
    const content = fs.readFileSync(sampleScript, 'utf8');
    
    const requiredFields = [
      'title:', 'description:', 'location:', 'category:', 'city:',
      'country_type:', 'region:', 'price_type:', 'price_amount:',
      'duration:', 'difficulty_level:', 'min_participants:', 'max_participants:',
      'languages:', 'inclusions:', 'exclusions:', 'requirements:',
      'cancellation_policy:', 'contact_info:', 'cover_image:', 'images:',
      'created_by_id:'
    ];
    
    console.log('📋 Verificando campos obrigatórios:');
    requiredFields.forEach(field => {
      if (content.includes(field)) {
        console.log(`  ✅ ${field}`);
      } else {
        console.log(`  ❌ ${field} - AUSENTE`);
      }
    });
  }
  
  process.exit(0);
}

updateAllImportScripts();