import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';

const bonitoActivities = [
  {
    title: "Gruta do Lago Azul",
    description: "Uma das mais belas grutas do Brasil, com lago de águas cristalinas em tons de azul turquesa. A gruta possui 72 metros de profundidade e oferece uma experiência única de contemplação da natureza. Ideal para todas as idades, a visita inclui caminhada em trilha suspensa e contemplação do lago subterrâneo.",
    location: "Bonito, MS",
    category: "nature",
    duration: 2,
    difficulty: "easy",
    priceRange: "R$ 90 - R$ 180",
    cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    proposals: [
      {
        title: "Econômico",
        description: "Entrada básica em baixa temporada com guia de grupo",
        price: 90,
        inclusions: ["Entrada na gruta", "Guia de grupo", "Trilha suspensa"]
      },
      {
        title: "Completo", 
        description: "Entrada em alta temporada com guia especializado",
        price: 110,
        inclusions: ["Entrada na gruta", "Guia especializado", "Trilha suspensa", "Material informativo"]
      },
      {
        title: "Premium",
        description: "Experiência VIP com guia privado e tour exclusivo",
        price: 180,
        inclusions: ["Entrada na gruta", "Guia privado", "Tour exclusivo", "Fotos profissionais", "Certificado"]
      }
    ]
  },
  {
    title: "Aquário Natural - Flutuação",
    description: "Experiência única de flutuação em rio com águas cristalinas e visibilidade de até 50 metros. Observe peixes, plantas aquáticas e a rica fauna subaquática em um dos aquários naturais mais preservados do Brasil. Atividade relaxante adequada para iniciantes e experientes.",
    location: "Bonito, MS",
    category: "water_sports",
    duration: 4,
    difficulty: "easy",
    priceRange: "R$ 320 - R$ 550",
    cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    proposals: [
      {
        title: "Econômico",
        description: "Flutuação básica com equipamentos e instrutor",
        price: 320,
        inclusions: ["Equipamentos de flutuação", "Instrutor", "Colete salva-vidas", "Máscara e snorkel"]
      },
      {
        title: "Completo",
        description: "Flutuação em alta temporada com lanche incluso",
        price: 395,
        inclusions: ["Equipamentos de flutuação", "Instrutor especializado", "Lanche", "Fotos subaquáticas", "Certificado"]
      },
      {
        title: "Premium",
        description: "Pacote completo com transporte e almoço gourmet",
        price: 550,
        inclusions: ["Equipamentos premium", "Instrutor privado", "Transporte", "Almoço gourmet", "Fotos/vídeos profissionais", "Brinde exclusivo"]
      }
    ]
  },
  {
    title: "Lagoa Misteriosa",
    description: "Lagoa de águas cristalinas com 220 metros de profundidade, perfeita para flutuação e mergulho técnico. Considerada uma das lagoas mais profundas do Brasil, oferece experiências desde flutuação contemplativa até mergulho com cilindro para certificados. Ambiente preservado com rica biodiversidade aquática.",
    location: "Bonito, MS",
    category: "water_sports",
    duration: 5,
    difficulty: "medium",
    priceRange: "R$ 252 - R$ 490",
    cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    proposals: [
      {
        title: "Econômico",
        description: "Flutuação básica na lagoa cristalina",
        price: 252,
        inclusions: ["Flutuação na lagoa", "Equipamentos básicos", "Instrutor", "Colete salva-vidas"]
      },
      {
        title: "Completo",
        description: "Flutuação em alta temporada com extras",
        price: 270,
        inclusions: ["Flutuação na lagoa", "Equipamentos completos", "Instrutor especializado", "Lanche", "Fotos"]
      },
      {
        title: "Premium",
        description: "Mergulho técnico com cilindro para certificados",
        price: 490,
        inclusions: ["Mergulho com cilindro", "Instrutor certificado", "Equipamentos profissionais", "Almoço", "Vídeo profissional", "Certificado de mergulho"]
      }
    ]
  },
  {
    title: "Boca da Onça - Trilha e Cachoeiras",
    description: "Maior cachoeira de Bonito com 156 metros de altura, oferecendo trilha ecológica com múltiplas cachoeiras para banho e rapel opcional. Experiência completa de ecoturismo com diversas piscinas naturais, fauna rica e opção de aventura radical com rapel na cachoeira principal.",
    location: "Bonito, MS",
    category: "adventure",
    duration: 6,
    difficulty: "medium",
    priceRange: "R$ 350 - R$ 730",
    cover_image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80",
    proposals: [
      {
        title: "Econômico",
        description: "Trilha ecológica com banho nas cachoeiras",
        price: 350,
        inclusions: ["Trilha ecológica", "Banho nas cachoeiras", "Guia", "Kit lanche"]
      },
      {
        title: "Completo",
        description: "Trilha completa com almoço típico regional",
        price: 420,
        inclusions: ["Trilha completa", "Banho nas cachoeiras", "Guia especializado", "Almoço típico", "Fotos"]
      },
      {
        title: "Premium",
        description: "Aventura completa com rapel na cachoeira",
        price: 730,
        inclusions: ["Trilha completa", "Rapel na cachoeira", "Instrutor de rapel", "Equipamentos de segurança", "Almoço gourmet", "Vídeo profissional", "Certificado de rapel"]
      }
    ]
  },
  {
    title: "Estância Mimosa - Trilha das Cachoeiras",
    description: "Propriedade rural sustentável com trilha ecológica que leva a 8 cachoeiras diferentes, cada uma com características únicas para banho e contemplação. Experiência de turismo rural com contato direto com a natureza, fauna local e práticas sustentáveis de preservação ambiental.",
    location: "Bonito, MS",
    category: "nature",
    duration: 5,
    difficulty: "easy",
    priceRange: "R$ 199 - R$ 335",
    cover_image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    proposals: [
      {
        title: "Econômico",
        description: "Trilha das cachoeiras básica sem refeição",
        price: 199,
        inclusions: ["Trilha das 8 cachoeiras", "Guia", "Banho nas cachoeiras", "Lanche básico"]
      },
      {
        title: "Completo",
        description: "Trilha completa com almoço típico incluso",
        price: 260,
        inclusions: ["Trilha das 8 cachoeiras", "Guia especializado", "Banho nas cachoeiras", "Almoço típico", "Atividades rurais", "Fotos"]
      },
      {
        title: "Premium",
        description: "Experiência completa em alta temporada",
        price: 335,
        inclusions: ["Trilha das 8 cachoeiras", "Guia privado", "Banho nas cachoeiras", "Almoço gourmet", "Atividades rurais exclusivas", "Produtos locais", "Certificado sustentável"]
      }
    ]
  }
];

async function addBonitoActivities() {
  console.log('🌿 Iniciando adição das atividades de Bonito (MS)...');
  
  try {
    for (const activityData of bonitoActivities) {
      console.log(`📍 Adicionando atividade: ${activityData.title}`);
      
      // Insert activity
      const [activity] = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        category: activityData.category,
        duration: activityData.duration,
        difficulty: activityData.difficulty,
        priceRange: activityData.priceRange,
        cover_image: activityData.coverImage,
        rating: "4.5",
        reviewCount: 0,
        is_active: true,
        created_by_id: 1 // User tom
      });
      
      console.log(`✅ Atividade criada com ID: ${activity.insertId}`);
      
      // Add budget proposals
      for (const proposal of activityData.proposals) {
        await db.insert(activityBudgetProposals).values({
          activityId: activity.insertId,
          createdBy: 1, // User tom
          title: proposal.title,
          description: proposal.description,
          amount: proposal.price.toString(),
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify([]),
          votes: Math.floor(Math.random() * 60) + 20, // Random votes between 20-80
          is_active: true
        });
        
        console.log(`💰 Proposta "${proposal.title}" criada: R$ ${proposal.price}`);
      }
      
      console.log(`✅ Atividade "${activityData.title}" completamente configurada!\n`);
    }
    
    console.log('🎉 Todas as atividades de Bonito (MS) foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar atividades de Bonito:', error);
  }
}

addBonitoActivities();