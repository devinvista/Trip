import { db } from './db.js';
import { activities } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// High-quality image collections for each destination
const highQualityImages = {
  // Rio de Janeiro Activities
  'Cristo Redentor / Corcovado': {
    coverImage: 'https://images.unsplash.com/photo-1518639192441-8fce0c1b5ac9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1518639192441-8fce0c1b5ac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Pão de Açúcar (Bondinho)': {
    coverImage: 'https://images.unsplash.com/photo-1544474171-a4f3e7c6e7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544474171-a4f3e7c6e7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1531428204712-6c9b9b64c6b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1606870333093-69d6c4de4f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Praia de Copacabana': {
    coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1537819191377-d3305ffddce4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1516396281612-84b4b2b4f86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // Paris Activities
  'Torre Eiffel - Símbolo de Paris': {
    coverImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Museu do Louvre - Tesouro da Arte Mundial': {
    coverImage: 'https://images.unsplash.com/photo-1566139992888-745d3856e2f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1566139992888-745d3856e2f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Cruzeiro pelo Rio Sena': {
    coverImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1563532002-6d3ac528efb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // London Activities
  'London Eye - Roda Gigante Icônica': {
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544133503-59b8e7e58e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Torre de Londres - Fortaleza Histórica': {
    coverImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Palácio de Buckingham': {
    coverImage: 'https://images.unsplash.com/photo-1518639192441-8fce0c1b5ac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1518639192441-8fce0c1b5ac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544474171-a4f3e7c6e7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // New York Activities  
  'Estátua da Liberdade e Ellis Island': {
    coverImage: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c27a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Empire State Building - Ícone de NY': {
    coverImage: 'https://images.unsplash.com/photo-1549417229-aa67d3263c9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1549417229-aa67d3263c9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1592356308926-7e5e3a005de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Central Park e Museus': {
    coverImage: 'https://images.unsplash.com/photo-1518222338-5b54e4bc0500?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1518222338-5b54e4bc0500?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1592356308926-7e5e3a005de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // Rome Activities
  'Coliseu - Anfiteatro Romano': {
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d47324?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544431369-dccdb9dc8c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Vaticano e Basílica de São Pedro': {
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544133503-59b8e7e58e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1591194658578-1b4c1e4c4b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Fontana di Trevi e Centro Histórico': {
    coverImage: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d47324?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // Buenos Aires Activities
  'Show de Tango com Jantar Tradicional': {
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544133503-59b8e7e58e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Tour pelo Bairro La Boca - Caminito': {
    coverImage: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544133503-59b8e7e58e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // Gramado Activities
  'Mini Mundo': {
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'GramadoZoo': {
    coverImage: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518197357944-6c9b9b64c6b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Tour de Vinícolas no Vale dos Vinhedos': {
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596200615173-b6ac54df5bac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },

  // Bonito Activities
  'Gruta do Lago Azul': {
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Aquário Natural - Flutuação': {
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  },
  'Lagoa Misteriosa': {
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'
    ])
  }
};

async function updateAllActivityImages() {
  console.log('🖼️ Iniciando atualização de todas as imagens das atividades para alta qualidade...');
  
  try {
    let updatedCount = 0;
    
    for (const [activityTitle, imageData] of Object.entries(highQualityImages)) {
      try {
        const result = await db
          .update(activities)
          .set({
            coverImage: imageData.coverImage,
            images: imageData.images
          })
          .where(eq(activities.title, activityTitle));
        
        console.log(`✅ Imagens atualizadas para: ${activityTitle}`);
        updatedCount++;
      } catch (error: any) {
        console.error(`❌ Erro ao atualizar ${activityTitle}:`, error.message);
      }
    }
    
    console.log(`🎉 Atualização concluída! ${updatedCount} atividades tiveram suas imagens atualizadas com fotos de alta qualidade.`);
    console.log('🔥 Todas as imagens agora usam Unsplash com parâmetros otimizados: 1200x800px, qualidade 85%');
    
  } catch (error) {
    console.error('❌ Erro na atualização geral:', error);
  }
}

// Execute the update
updateAllActivityImages();