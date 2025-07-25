import { db } from './db.js';
import { activities } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function fixActivityLocations() {
  try {
    console.log('🔧 Corrigindo classificação de localidades das atividades...');
    
    // Mapeamento de localidades corretas
    const locationMapping = {
      // Rio de Janeiro
      'Rio de Janeiro, RJ': ['Trilha no Pão de Açúcar', 'Cristo Redentor e Corcovado', 'Pão de Açúcar de Bondinho', 'Trilha na Tijuca', 'Cristo Redentor e Pão de Açúcar', 'Trilha na Floresta da Tijuca', 'Tour Gastronômico Santa Teresa'],
      
      // São Paulo
      'São Paulo, SP': ['Tour Gastronômico na Vila Madalena', 'Mercado Municipal e Centro Histórico', 'Museu de Arte Moderna', 'Parque Ibirapuera', 'Avenida Paulista e MASP', 'Mercado Municipal - Mercadão', 'Beco do Batman - Vila Madalena', 'Pinacoteca do Estado'],
      
      // Pantanal
      'Pantanal, MT': ['Safari Fotográfico Pantanal', 'Pescaria no Pantanal'],
      
      // Salvador
      'Salvador, BA': ['Tour Pelourinho', 'Aulas de Capoeira'],
      
      // Serra da Mantiqueira
      'Serra da Mantiqueira, MG': ['Pico da Bandeira', 'Vale do Matutu'],
      
      // Maragogi
      'Maragogi, AL': ['Galés de Maragogi', 'Passeio de Catamarã'],
      
      // Ouro Preto
      'Ouro Preto, MG': ['Igreja São Francisco de Assis', 'Mina de Ouro do Chico Rei'],
      
      // Manaus
      'Manaus, AM': ['Encontro das Águas', 'Teatro Amazonas', 'Arquipélago de Anavilhanas', 'Mercado Adolpho Lisboa'],
      
      // Florianópolis
      'Florianópolis, SC': ['Surf na Joaquina', 'Trilha da Lagoinha do Leste', 'Praia da Lagoinha do Leste', 'Praia da Joaquina - Sandboard', 'Lagoa da Conceição', 'Centro Histórico de Florianópolis', 'Fortaleza de São José da Ponta Grossa'],
      
      // Gramado
      'Gramado, RS': ['Tour de Vinícolas', 'Trem Maria Fumaça', 'Mini Mundo', 'Dreamland Museu de Cera', 'GramadoZoo', 'Tour de Vinícolas no Vale dos Vinhedos', 'Snowland'],
      
      // Lençóis Maranhenses
      'Lençóis Maranhenses, MA': ['Trekking pelas Dunas', 'Voo de Ultraleve'],
      
      // Caruaru
      'Caruaru, PE': ['Festa Junina Autêntica', 'Casa de Cultura Popular'],
      
      // Buenos Aires
      'Buenos Aires, Argentina': ['Show de Tango com Jantar Tradicional', 'Tour pelo Bairro La Boca - Caminito', 'Cemitério da Recoleta - Visita Histórica', 'MALBA - Museu de Arte Latino-Americana', 'Degustação de Vinhos e Carnes Premium', 'Show de Tango e Jantar'],
      
      // Londres
      'Londres, Reino Unido': ['London Eye - Roda Gigante Icônica', 'Torre de Londres - Fortaleza Histórica', 'Museu Britânico - Tesouros Mundiais', 'West End - Teatro de Classe Mundial', 'Palácio de Buckingham - Residência Real', 'Torre de Londres e Joias da Coroa'],
      
      // Paris
      'Paris, França': ['Torre Eiffel - Símbolo de Paris', 'Museu do Louvre - Tesouro da Arte Mundial', 'Cruzeiro pelo Rio Sena - Paris das Águas', 'Catedral de Notre-Dame - Joia Gótica', 'Palácio de Versalhes - Grandeza Real', 'Torre Eiffel e Cruzeiro no Sena'],
      
      // Roma
      'Roma, Itália': ['Coliseu - Anfiteatro Romano', 'Vaticano e Basílica de São Pedro', 'Fontana di Trevi e Centro Histórico', 'Panteão de Roma - Templo dos Deuses', 'Trastevere - Bairro Boêmio Autêntico', 'Coliseu e Fórum Romano'],
      
      // Nova York
      'Nova York, EUA': ['Estátua da Liberdade e Ellis Island', 'Empire State Building - Ícone de NY', 'Broadway Show - Teatro de Classe Mundial', 'Central Park - Oásis Verde de Manhattan', 'Museu Metropolitano de Arte (Met)'],
      
      // Bonito
      'Bonito, MS': ['Flutuação no Rio da Prata', 'Gruta do Lago Azul', 'Aquário Natural', 'Abismo Anhumas', 'Buraco das Araras'],
      
      // Fortaleza
      'Fortaleza, CE': ['Beach Park - Aquiraz', 'Centro Dragão do Mar', 'Cumbuco - Passeio de Buggy'],
      
      // Curitiba
      'Curitiba, PR': ['Jardim Botânico de Curitiba', 'Museu Oscar Niemeyer', 'Ópera de Arame', 'Trem Serra Verde Express para Morretes', 'Largo da Ordem - Feira de Domingo'],
      
      // Belém
      'Belém, PA': ['Mercado Ver-o-Peso', 'Estação das Docas', 'Mangal das Garças', 'Complexo Feliz Lusitânia', 'Theatro da Paz'],
      
      // Goiânia
      'Goiânia, GO': ['Parque Flamboyant', 'Parque Vaca Brava', 'Bosque dos Buritis', 'Memorial do Cerrado', 'Praça Cívica e Centro Cultural'],
      
      // Vitória
      'Vitória, ES': ['Praia de Camburi', 'Parque Pedra da Cebola', 'Praia do Canto e Curva da Jurema', 'Espaço Baleia Jubarte', 'Palácio Anchieta']
    };

    let updatedCount = 0;

    // Buscar todas as atividades
    const allActivities = await db.select().from(activities);
    console.log(`📊 Total de atividades para corrigir: ${allActivities.length}`);

    for (const [correctLocation, activityTitles] of Object.entries(locationMapping)) {
      for (const activityTitle of activityTitles) {
        // Encontrar a atividade pelo título
        const activity = allActivities.find(a => a.title === activityTitle);
        
        if (activity && activity.location !== correctLocation) {
          console.log(`🔧 Corrigindo: "${activity.title}" de "${activity.location}" para "${correctLocation}"`);
          
          await db.update(activities)
            .set({ location: correctLocation })
            .where(eq(activities.id, activity.id));
          
          updatedCount++;
        }
      }
    }

    console.log(`✅ ${updatedCount} atividades tiveram suas localidades corrigidas`);

    // Verificação final - mostrar distribuição por localidade
    const finalActivities = await db.select().from(activities);
    const locationGroups = finalActivities.reduce((acc, activity) => {
      acc[activity.location] = (acc[activity.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Distribuição final por localidade:');
    Object.entries(locationGroups)
      .sort(([,a], [,b]) => b - a)
      .forEach(([location, count]) => {
        console.log(`  ${location}: ${count} atividades`);
      });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixActivityLocations().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});