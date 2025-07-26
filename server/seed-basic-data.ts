#!/usr/bin/env tsx
import { db } from "./db.js";

async function seedBasicData() {
  try {
    console.log("🌱 Inserindo dados básicos no banco...");

    // Verificar se já existem destinos
    const [existingDestinations] = await db.execute('SELECT COUNT(*) as count FROM destinations');
    if ((existingDestinations as any)[0].count === 0) {
      console.log("📍 Inserindo destinos básicos...");
      
      // Inserir destinos básicos
      await db.execute(`
        INSERT INTO destinations (name, state, country, country_type, region, continent, is_active) VALUES
        ('Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul', 1),
        ('São Paulo', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul', 1),
        ('Paris', NULL, 'França', 'internacional', 'Europa', 'Europa', 1),
        ('Londres', NULL, 'Reino Unido', 'internacional', 'Europa', 'Europa', 1),
        ('Nova York', 'NY', 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte', 1),
        ('Roma', NULL, 'Itália', 'internacional', 'Europa', 'Europa', 1),
        ('Buenos Aires', NULL, 'Argentina', 'internacional', 'América do Sul', 'América do Sul', 1),
        ('Gramado', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul', 1),
        ('Bonito', 'MS', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul', 1),
        ('Salvador', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul', 1)
      `);
      console.log("✅ Destinos inseridos com sucesso");
    }

    // Verificar se já existem atividades
    const [existingActivities] = await db.execute('SELECT COUNT(*) as count FROM activities');
    if ((existingActivities as any)[0].count === 0) {
      console.log("🎯 Inserindo atividades básicas...");
      
      // Buscar IDs dos destinos
      const [destinations] = await db.execute('SELECT id, name FROM destinations ORDER BY id');
      const destMap = new Map();
      (destinations as any[]).forEach(d => destMap.set(d.name, d.id));
      
      // Inserir atividades com destination_id correto
      await db.execute(`
        INSERT INTO activities (title, description, category, price_type, price_amount, duration, difficulty_level, cover_image, average_rating, total_ratings, destination_id, is_active) VALUES
        ('Cristo Redentor e Corcovado', 'Tour completo ao Cristo Redentor com vista panorâmica do Rio de Janeiro', 'pontos_turisticos', 'paid', 85, 4, 'easy', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80', '4.7', 156, ${destMap.get('Rio de Janeiro')}, 1),
        ('Pão de Açúcar', 'Passeio de bondinho ao Pão de Açúcar com vista espetacular da cidade', 'pontos_turisticos', 'paid', 120, 3, 'easy', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80', '4.6', 89, ${destMap.get('Rio de Janeiro')}, 1),
        ('Museu do Louvre', 'Visita ao famoso museu com obras de arte renomadas mundialmente', 'cultural', 'paid', 150, 5, 'easy', 'https://images.unsplash.com/photo-1566139919985-45dff6a3b5a7?w=800&q=80', '4.8', 234, ${destMap.get('Paris')}, 1),
        ('Torre Eiffel', 'Subida à Torre Eiffel com vista panorâmica de Paris', 'pontos_turisticos', 'paid', 200, 2, 'easy', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80', '4.9', 567, ${destMap.get('Paris')}, 1),
        ('London Eye', 'Passeio na roda gigante mais famosa de Londres', 'pontos_turisticos', 'paid', 180, 1, 'easy', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', '4.5', 123, ${destMap.get('Londres')}, 1),
        ('Central Park', 'Tour guiado pelo Central Park de Nova York', 'nature', 'free', 0, 3, 'easy', 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800&q=80', '4.4', 78, ${destMap.get('Nova York')}, 1),
        ('Coliseu Romano', 'Visita ao anfiteatro mais famoso da história', 'cultural', 'paid', 160, 2, 'moderate', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', '4.7', 189, ${destMap.get('Roma')}, 1),
        ('Ibirapuera', 'Tour pelo principal parque de São Paulo', 'nature', 'free', 0, 2, 'easy', 'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80', '4.3', 45, ${destMap.get('São Paulo')}, 1),
        ('Mini Mundo', 'Parque temático com miniaturas de construções famosas', 'pontos_turisticos', 'paid', 65, 3, 'easy', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', '4.5', 67, ${destMap.get('Gramado')}, 1),
        ('Gruta do Lago Azul', 'Mergulho na famosa gruta de águas cristalinas', 'adventure', 'paid', 180, 4, 'moderate', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', '4.8', 145, ${destMap.get('Bonito')}, 1)
      `);
      console.log("✅ Atividades inseridas com sucesso");
    }

    // Verificar resultados
    const [activitiesResult] = await db.execute(`
      SELECT a.id, a.title, d.name as destination_name, d.state, d.country 
      FROM activities a 
      INNER JOIN destinations d ON a.destination_id = d.id 
      LIMIT 5
    `);
    
    console.log("\n🔍 Verificação final:");
    (activitiesResult as any[]).forEach(activity => {
      console.log(`✓ ${activity.title} → ${activity.destination_name}, ${activity.state || activity.country}`);
    });

    console.log("\n🎉 Dados básicos inseridos com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
  }
}

seedBasicData().then(() => {
  console.log("🏁 Seed concluído");
  process.exit(0);
}).catch(error => {
  console.error("💥 Erro fatal:", error);
  process.exit(1);
});