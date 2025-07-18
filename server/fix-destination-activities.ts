import { db } from "./db";
import { activities } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add activities for all trip destinations
async function addActivitiesForDestinations() {
  console.log("🎯 Adicionando atividades para destinos das viagens...");
  
  const destinationActivities = [
    // Pantanal, MS
    {
      title: "Safari Fotográfico no Pantanal",
      description: "Passeio em veículo 4x4 para observação de fauna selvagem com guia especializado. Oportunidade única de fotografar onças, jacarés, capivaras e aves exóticas em seu habitat natural.",
      location: "Pantanal, MS",
      category: "adventure",
      city: "Pantanal",
      countryType: "nacional",
      region: "Centro-Oeste",
      priceType: "per_person",
      priceAmount: "180.00",
      duration: "6-8 horas",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 8,
      coverImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80",
        "https://images.unsplash.com/photo-1573160103600-3b4c8b68b7e3?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Guia especializado", "Veículo 4x4", "Equipamentos de observação", "Lanche", "Água", "Seguro"]),
      exclusions: JSON.stringify(["Hospedagem", "Refeições principais", "Transporte até o Pantanal"]),
      requirements: JSON.stringify(["Roupas neutras", "Protetor solar", "Repelente", "Calçado fechado"]),
      contactInfo: JSON.stringify({
        phone: "(65) 99999-1001",
        email: "safaris@pantanal.com.br",
        whatsapp: "(65) 99999-1001"
      }),
      createdById: 1
    },
    {
      title: "Pesca Esportiva no Pantanal",
      description: "Pesca de tucunaré, dourado e pacu em rios cristalinos do Pantanal. Inclui equipamentos profissionais e barco com piloteiro experiente.",
      location: "Pantanal, MS",
      category: "adventure",
      city: "Pantanal",
      countryType: "nacional",
      region: "Centro-Oeste",
      priceType: "per_person",
      priceAmount: "220.00",
      duration: "8 horas",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 6,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Barco", "Piloteiro", "Equipamentos de pesca", "Iscas", "Almoço", "Bebidas"]),
      exclusions: JSON.stringify(["Hospedagem", "Transporte até o local"]),
      requirements: JSON.stringify(["Protetor solar", "Chapéu", "Roupas leves"]),
      contactInfo: JSON.stringify({
        phone: "(65) 99999-1002",
        email: "pesca@pantanal.com.br"
      }),
      createdById: 1
    },

    // Mantiqueira, MG
    {
      title: "Trilha da Pedra do Baú",
      description: "Trilha desafiadora até o topo da famosa Pedra do Baú com vista panorâmica da Serra da Mantiqueira. Uma das mais belas paisagens de Minas Gerais.",
      location: "Mantiqueira, MG",
      category: "adventure",
      city: "Mantiqueira",
      countryType: "nacional",
      region: "Sudeste",
      priceType: "per_person",
      priceAmount: "85.00",
      duration: "6-8 horas",
      difficultyLevel: "challenging",
      minParticipants: 2,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Guia de montanha", "Equipamentos de segurança", "Lanche energético", "Água", "Seguro"]),
      exclusions: JSON.stringify(["Transporte", "Refeições principais", "Hospedagem"]),
      requirements: JSON.stringify(["Bom condicionamento físico", "Calçado de trilha", "Roupas adequadas", "Idade mínima 14 anos"]),
      contactInfo: JSON.stringify({
        phone: "(35) 99999-2001",
        email: "trilhas@mantiqueira.com.br"
      }),
      createdById: 1
    },

    // Maragogi, AL
    {
      title: "Passeio de Catamaran - Galés de Maragogi",
      description: "Navegação até as piscinas naturais dos Galés de Maragogi. Águas cristalinas, mergulho livre e observação de peixes coloridos.",
      location: "Maragogi, AL",
      category: "aquatic",
      city: "Maragogi",
      countryType: "nacional",
      region: "Nordeste",
      priceType: "per_person",
      priceAmount: "120.00",
      duration: "5-6 horas",
      difficultyLevel: "easy",
      minParticipants: 10,
      maxParticipants: 40,
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Transporte marítimo", "Equipamentos de mergulho", "Instrutor", "Colete salva-vidas", "Lanche"]),
      exclusions: JSON.stringify(["Almoço", "Bebidas alcoólicas", "Fotos subaquáticas"]),
      requirements: JSON.stringify(["Saber nadar", "Idade mínima 8 anos", "Protetor solar biodegradável"]),
      contactInfo: JSON.stringify({
        phone: "(82) 99999-3001",
        email: "passeios@maragogi.com.br"
      }),
      createdById: 1
    },

    // Ouro Preto, MG
    {
      title: "Tour Histórico pelo Centro de Ouro Preto",
      description: "Caminhada guiada pelos principais pontos históricos de Ouro Preto, incluindo igrejas barrocas, museus e arquitetura colonial.",
      location: "Ouro Preto, MG",
      category: "culture",
      city: "Ouro Preto",
      countryType: "nacional",
      region: "Sudeste",
      priceType: "per_person",
      priceAmount: "65.00",
      duration: "4 horas",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Guia historiador", "Entradas nos museus", "Mapa histórico", "Degustação de quitutes"]),
      exclusions: JSON.stringify(["Transporte", "Almoço", "Compras pessoais"]),
      requirements: JSON.stringify(["Calçado confortável", "Roupa adequada para igrejas", "Protetor solar"]),
      contactInfo: JSON.stringify({
        phone: "(31) 99999-4001",
        email: "turismo@ouropreto.com.br"
      }),
      createdById: 1
    },

    // Manaus, AM
    {
      title: "Encontro das Águas + Cidade Flutuante",
      description: "Passeio pelo famoso Encontro das Águas do Rio Negro e Solimões, visita à cidade flutuante e observação de botos cor-de-rosa.",
      location: "Manaus, AM",
      category: "nature",
      city: "Manaus",
      countryType: "nacional",
      region: "Norte",
      priceType: "per_person",
      priceAmount: "150.00",
      duration: "6-8 horas",
      difficultyLevel: "easy",
      minParticipants: 4,
      maxParticipants: 30,
      coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Transporte marítimo", "Guia local", "Almoço regional", "Água", "Seguro"]),
      exclusions: JSON.stringify(["Hospedagem", "Bebidas alcoólicas", "Compras"]),
      requirements: JSON.stringify(["Protetor solar", "Repelente", "Chapéu", "Roupas leves"]),
      contactInfo: JSON.stringify({
        phone: "(92) 99999-5001",
        email: "amazonia@manaus.com.br"
      }),
      createdById: 1
    },

    // Gramado, RS
    {
      title: "Tour pelas Vinícolas da Serra Gaúcha",
      description: "Visita às principais vinícolas da região com degustação de vinhos premiados, almoço harmonizado e passeio pelos parreirais.",
      location: "Gramado, RS",
      category: "food",
      city: "Gramado",
      countryType: "nacional",
      region: "Sul",
      priceType: "per_person",
      priceAmount: "180.00",
      duration: "8 horas",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Transporte", "Guia especializado", "Degustação de vinhos", "Almoço harmonizado", "Visita a 3 vinícolas"]),
      exclusions: JSON.stringify(["Hospedagem", "Compras de vinhos", "Bebidas extras"]),
      requirements: JSON.stringify(["Idade mínima 18 anos", "Documento de identificação", "Roupas adequadas"]),
      contactInfo: JSON.stringify({
        phone: "(54) 99999-6001",
        email: "vinhos@gramado.com.br"
      }),
      createdById: 1
    },

    // Lençóis Maranhenses, MA
    {
      title: "Sobrevoo de Avião pelos Lençóis Maranhenses",
      description: "Voo panorâmico sobre as dunas e lagoas dos Lençóis Maranhenses. Vista aérea única das lagoas de águas cristalinas.",
      location: "Lençóis Maranhenses, MA",
      category: "adventure",
      city: "Lençóis Maranhenses",
      countryType: "nacional",
      region: "Nordeste",
      priceType: "per_person",
      priceAmount: "350.00",
      duration: "1 hora",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 4,
      coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Voo de avião", "Piloto experiente", "Briefing de segurança", "Seguro de voo"]),
      exclusions: JSON.stringify(["Transporte até o aeroporto", "Hospedagem", "Refeições"]),
      requirements: JSON.stringify(["Peso máximo 100kg", "Idade mínima 12 anos", "Documento de identificação"]),
      contactInfo: JSON.stringify({
        phone: "(98) 99999-7001",
        email: "voos@lencois.com.br"
      }),
      createdById: 1
    },

    // Caruaru, PE
    {
      title: "Forró e Cultura Nordestina",
      description: "Noite cultural com apresentação de forró pé-de-serra, quadrilha junina e degustação de pratos típicos nordestinos.",
      location: "Caruaru, PE",
      category: "culture",
      city: "Caruaru",
      countryType: "nacional",
      region: "Nordeste",
      priceType: "per_person",
      priceAmount: "85.00",
      duration: "4 horas",
      difficultyLevel: "easy",
      minParticipants: 4,
      maxParticipants: 50,
      coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
      ]),
      inclusions: JSON.stringify(["Apresentação cultural", "Jantar típico", "Aulas de forró", "Bebidas inclusas"]),
      exclusions: JSON.stringify(["Transporte", "Hospedagem", "Bebidas extras"]),
      requirements: JSON.stringify(["Roupas confortáveis", "Disposição para dançar"]),
      contactInfo: JSON.stringify({
        phone: "(81) 99999-8001",
        email: "cultura@caruaru.com.br"
      }),
      createdById: 1
    }
  ];

  try {
    for (const activity of destinationActivities) {
      try {
        await db.insert(activities).values({
          ...activity,
          priceAmount: activity.priceAmount ? parseFloat(activity.priceAmount) : null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Atividade criada: ${activity.title} - ${activity.location}`);
      } catch (insertError: any) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Atividade já existe: ${activity.title}`);
        } else {
          console.error(`❌ Erro ao criar ${activity.title}:`, insertError.message);
        }
      }
    }

    console.log("🎉 Processamento concluído!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addActivitiesForDestinations().catch(console.error);