import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add Buenos Aires activities with authentic details and budget proposals
async function addBuenosAiresActivities() {
  console.log("🎵 Adicionando atividades de Buenos Aires com detalhes autênticos...");
  
  const buenosAiresActivities = [
    {
      title: "Show de Tango com Jantar Tradicional",
      description: "Viva a paixão do tango argentino em uma experiência autêntica! Desfrute de um espetáculo de tango profissional com dançarinos de classe mundial, acompanhado de um jantar tradicional argentino com os melhores cortes de carne e vinhos locais. Uma noite inesquecível no berço do tango, em casas tradicionais como El Viejo Almacén, Café Tortoni ou Esquina Carlos Gardel.",
      location: "Buenos Aires, Argentina",
      category: "entertainment",
      city: "Buenos Aires",
      countryType: "internacional",
      region: "América do Sul",
      priceType: "per_person",
      priceAmount: null,
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Espanhol", "Inglês", "Português"]),
      inclusions: JSON.stringify(["Show de tango profissional", "Jantar tradicional argentino", "Vinho local", "Transporte"]),
      exclusions: JSON.stringify(["Bebidas extras", "Gorjetas", "Souvenirs", "Aulas de tango"]),
      requirements: JSON.stringify(["Vestuário elegante", "Reserva antecipada", "Chegada pontual"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes do evento",
      contactInfo: JSON.stringify({
        phone: "+54 11 5555-1234",
        email: "info@tangoshow.com.ar",
        website: "https://www.tangoshow.com.ar",
        address: "San Telmo, Buenos Aires, Argentina"
      }),
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Tour pelo Bairro La Boca - Caminito",
      description: "Explore o bairro mais colorido e artístico de Buenos Aires! La Boca é famoso por suas casas pintadas em cores vibrantes, o estádio La Bombonera do Boca Juniors, e a rua-museu Caminito. Descubra a história dos imigrantes italianos, aprecie arte de rua, ouça música de tango nas ruas e visite ateliês de artistas locais. O berço do tango e da paixão pelo futebol argentino.",
      location: "Buenos Aires, Argentina",
      category: "sightseeing",
      city: "Buenos Aires",
      countryType: "internacional",
      region: "América do Sul",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 30,
      languages: JSON.stringify(["Espanhol", "Inglês", "Português"]),
      inclusions: JSON.stringify(["Rua Caminito", "Casas coloridas", "Arte de rua", "Museu Boca Juniors", "Feira de antiguidades"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Guia turístico", "Entradas em museus"]),
      requirements: JSON.stringify(["Calçado confortável", "Câmera fotográfica", "Cuidado com pertences"]),
      cancellationPolicy: "Passeio ao ar livre - sem necessidade de cancelamento",
      contactInfo: JSON.stringify({
        phone: "+54 11 4301-1080",
        email: "info@laboca.com.ar",
        website: "https://www.laboca.com.ar",
        address: "Caminito, La Boca, Buenos Aires, Argentina"
      }),
      coverImage: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Cemitério da Recoleta - Visita Histórica",
      description: "Descubra o cemitério mais famoso da América Latina! O Cemitério da Recoleta abriga túmulos de personalidades ilustres como Eva Perón, presidentes argentinos e figuras históricas. Com arquitetura funerária impressionante, mausoléus ornamentados e esculturas de mármore, este local é um museu a céu aberto que conta a história da Argentina através de suas personalidades mais importantes.",
      location: "Buenos Aires, Argentina",
      category: "culture",
      city: "Buenos Aires",
      countryType: "internacional",
      region: "América do Sul",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 40,
      languages: JSON.stringify(["Espanhol", "Inglês", "Português"]),
      inclusions: JSON.stringify(["Entrada gratuita", "Túmulo de Eva Perón", "Arquitetura funerária", "História argentina"]),
      exclusions: JSON.stringify(["Transporte", "Guia turístico", "Alimentação", "Audioguia"]),
      requirements: JSON.stringify(["Vestuário respeitoso", "Silêncio", "Respeito ao local sagrado"]),
      cancellationPolicy: "Entrada gratuita - sem necessidade de cancelamento",
      contactInfo: JSON.stringify({
        phone: "+54 11 4803-1594",
        email: "info@cementeriodelarecoleta.com.ar",
        website: "https://www.cementeriodelarecoleta.com.ar",
        address: "Junín 1760, C1113 CABA, Argentina"
      }),
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
        "https://images.unsplash.com/photo-1544827753-4acf7de08544?w=800&q=80",
        "https://images.unsplash.com/photo-1575062789842-43438b4e9eb4?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "MALBA - Museu de Arte Latino-Americana",
      description: "Explore a maior coleção de arte latino-americana contemporânea! O MALBA abriga obras de Frida Kahlo, Diego Rivera, Antonio Berni, Xul Solar e outros grandes mestres. Com exposições permanentes e temporárias, este museu oferece uma jornada pela criatividade e diversidade cultural da América Latina. Localizado no elegante bairro de Palermo, é um centro cultural imperdível.",
      location: "Buenos Aires, Argentina",
      category: "culture",
      city: "Buenos Aires",
      countryType: "internacional",
      region: "América do Sul",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Espanhol", "Inglês", "Português"]),
      inclusions: JSON.stringify(["Entrada no museu", "Exposições permanentes", "Arte latino-americana", "Café no museu"]),
      exclusions: JSON.stringify(["Transporte", "Guia turístico", "Exposições especiais", "Audioguia"]),
      requirements: JSON.stringify(["Não permitido flash", "Silêncio nas galerias", "Bagagem limitada"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: JSON.stringify({
        phone: "+54 11 4808-6500",
        email: "info@malba.org.ar",
        website: "https://www.malba.org.ar",
        address: "Av. Figueroa Alcorta 3415, C1425CLA CABA, Argentina"
      }),
      coverImage: "https://images.unsplash.com/photo-1575062789842-43438b4e9eb4?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1575062789842-43438b4e9eb4?w=800&q=80",
        "https://images.unsplash.com/photo-1544827753-4acf7de08544?w=800&q=80",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Degustação de Vinhos e Carnes Premium",
      description: "Experimente o melhor da gastronomia argentina! Deguste vinhos premium de Mendoza, Salta e San Juan, harmonizados com os cortes de carne mais nobres em parrillas tradicionais. Aprenda sobre terroir, processo de vinificação e técnicas de preparo da carne argentina. Uma experiência sensorial única que celebra a excelência culinária argentina em restaurantes como Don Julio, La Cabrera ou Fogón Asado.",
      location: "Buenos Aires, Argentina",
      category: "food_tours",
      city: "Buenos Aires",
      countryType: "internacional",
      region: "América do Sul",
      priceType: "per_person",
      priceAmount: null,
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 20,
      languages: JSON.stringify(["Espanhol", "Inglês", "Português"]),
      inclusions: JSON.stringify(["Degustação de vinhos", "Cortes de carne premium", "Parrilla tradicional", "Sommelier especializado"]),
      exclusions: JSON.stringify(["Transporte", "Bebidas extras", "Gorjetas", "Souvenirs"]),
      requirements: JSON.stringify(["Idade mínima 18 anos", "Restrições alimentares informadas", "Vestuário adequado"]),
      cancellationPolicy: "Cancelamento gratuito até 48h antes da experiência",
      contactInfo: JSON.stringify({
        phone: "+54 11 4831-9564",
        email: "info@wineandmeat.com.ar",
        website: "https://www.wineandmeat.com.ar",
        address: "Palermo, Buenos Aires, Argentina"
      }),
      coverImage: "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
      ]),
      createdById: 1
    }
  ];

  // Budget proposals for each activity (converted to USD)
  const budgetProposals = [
    // Show de Tango proposals
    {
      activityTitle: "Show de Tango com Jantar Tradicional",
      proposals: [
        {
          title: "Econômico - Show + Jantar Simples",
          description: "Show de tango com jantar básico em casa tradicional.",
          amount: "25.00", // ~ARS 3500 convertido para USD
          inclusions: ["Show de tango", "Jantar básico", "1 copo de vinho", "Transporte"],
          exclusions: ["Bebidas extras", "Aulas de tango", "Souvenirs", "Gorjetas"]
        },
        {
          title: "Completo - Show + Jantar Completo",
          description: "Show de tango profissional com jantar completo e vinhos selecionados.",
          amount: "50.00", // ~ARS 7000 convertido para USD
          inclusions: ["Show profissional", "Jantar 3 pratos", "Vinhos selecionados", "Transporte VIP"],
          exclusions: ["Bebidas premium", "Fotos profissionais", "Aulas privadas"]
        },
        {
          title: "Premium - Experiência VIP Completa",
          description: "Experiência VIP com melhores assentos, jantar gourmet e aula de tango.",
          amount: "110.00", // ~ARS 15000 convertido para USD
          inclusions: ["Mesa VIP", "Jantar gourmet", "Vinhos premium", "Aula de tango", "Fotos", "Transporte luxury"],
          exclusions: ["Bebidas extras", "Souvenirs", "Gorjetas"]
        }
      ]
    },
    // La Boca proposals
    {
      activityTitle: "Tour pelo Bairro La Boca - Caminito",
      proposals: [
        {
          title: "Econômico - Passeio Livre",
          description: "Explore La Boca por conta própria. Acesso gratuito a todas as atrações.",
          amount: "0.00",
          inclusions: ["Acesso livre", "Rua Caminito", "Casas coloridas", "Arte de rua", "Feira de antiguidades"],
          exclusions: ["Guia turístico", "Transporte", "Alimentação", "Entradas em museus"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado com contexto histórico e cultural do bairro.",
          amount: "8.00", // ~ARS 1200 convertido para USD
          inclusions: ["Tour guiado 2h", "História do bairro", "Visita La Bombonera", "Guia local"],
          exclusions: ["Transporte", "Alimentação", "Entradas em museus", "Souvenirs"]
        },
        {
          title: "Premium - Tour Privativo",
          description: "Tour privativo com guia especializado e acesso exclusivo.",
          amount: "25.00", // ~ARS 3500 convertido para USD
          inclusions: ["Tour privado", "Guia especializado", "Acesso exclusivo", "Grupo pequeno", "Fotos"],
          exclusions: ["Transporte", "Alimentação", "Souvenirs", "Gorjetas"]
        }
      ]
    },
    // Cemitério da Recoleta proposals
    {
      activityTitle: "Cemitério da Recoleta - Visita Histórica",
      proposals: [
        {
          title: "Econômico - Entrada Gratuita",
          description: "Visita livre ao cemitério mais famoso da Argentina.",
          amount: "0.00",
          inclusions: ["Entrada gratuita", "Túmulo Eva Perón", "Arquitetura funerária", "Mapa gratuito"],
          exclusions: ["Guia turístico", "Audioguia", "Transporte", "Alimentação"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado com histórias e contexto dos personagens famosos.",
          amount: "4.00", // ~ARS 500 convertido para USD
          inclusions: ["Tour guiado 1h", "Histórias dos famosos", "Arquitetura", "Guia especializado"],
          exclusions: ["Transporte", "Alimentação", "Audioguia pessoal", "Souvenirs"]
        },
        {
          title: "Premium - Tour VIP",
          description: "Tour VIP com acesso especial e historiador especializado.",
          amount: "9.00", // ~ARS 1200 convertido para USD
          inclusions: ["Tour VIP", "Historiador especializado", "Acesso especial", "Grupo pequeno", "Detalhes exclusivos"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]
        }
      ]
    },
    // MALBA proposals
    {
      activityTitle: "MALBA - Museu de Arte Latino-Americana",
      proposals: [
        {
          title: "Econômico - Entrada Básica",
          description: "Entrada básica com acesso às exposições permanentes.",
          amount: "1.00", // ~ARS 150 convertido para USD
          inclusions: ["Entrada no museu", "Exposições permanentes", "Arte latino-americana", "Mapa do museu"],
          exclusions: ["Audioguia", "Tour guiado", "Exposições especiais", "Transporte"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado com curador especializado em arte latino-americana.",
          amount: "3.00", // ~ARS 400 convertido para USD
          inclusions: ["Tour guiado 1,5h", "Curador especializado", "Exposições", "História da arte"],
          exclusions: ["Transporte", "Alimentação", "Exposições especiais", "Souvenirs"]
        },
        {
          title: "Premium - Tour Privado",
          description: "Tour privado com curador senior e acesso a obras especiais.",
          amount: "7.00", // ~ARS 1000 convertido para USD
          inclusions: ["Tour privado", "Curador senior", "Obras especiais", "Grupo pequeno", "Acesso VIP"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]
        }
      ]
    },
    // Degustação de vinhos proposals
    {
      activityTitle: "Degustação de Vinhos e Carnes Premium",
      proposals: [
        {
          title: "Econômico - Degustação Básica",
          description: "Degustação básica com vinhos locais e cortes simples.",
          amount: "8.00", // ~ARS 1000 convertido para USD
          inclusions: ["3 vinhos", "Cortes básicos", "Queijos", "Pães artesanais"],
          exclusions: ["Vinhos premium", "Cortes nobres", "Sobremesas", "Transporte"]
        },
        {
          title: "Completo - Jantar Completo",
          description: "Jantar completo com vinhos selecionados e parrilla tradicional.",
          amount: "22.00", // ~ARS 3000 convertido para USD
          inclusions: ["Jantar completo", "5 vinhos", "Parrilla tradicional", "Sommelier", "Sobremesas"],
          exclusions: ["Vinhos premium", "Transporte", "Gorjetas", "Souvenirs"]
        },
        {
          title: "Premium - Experiência Gourmet",
          description: "Experiência gourmet com vinhos premium e carnes nobres.",
          amount: "50.00", // ~ARS 7000 convertido para USD
          inclusions: ["Vinhos premium", "Carnes nobres", "Menu degustação", "Sommelier especializado", "Harmonizações"],
          exclusions: ["Transporte", "Bebidas extras", "Gorjetas", "Souvenirs"]
        }
      ]
    }
  ];

  try {
    // Insert activities first
    for (const activity of buenosAiresActivities) {
      try {
        const [insertedActivity] = await db.insert(activities).values({
          ...activity,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Atividade criada: ${activity.title}`);
      } catch (insertError: any) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Atividade já existe: ${activity.title}`);
        } else {
          console.error(`❌ Erro ao criar ${activity.title}:`, insertError.message);
        }
      }
    }

    // Then insert budget proposals
    for (const budgetGroup of budgetProposals) {
      // Find the activity ID
      const [activityResult] = await db.select()
        .from(activities)
        .where(sql`title = ${budgetGroup.activityTitle}`)
        .limit(1);

      if (activityResult) {
        for (const proposal of budgetGroup.proposals) {
          try {
            await db.insert(activityBudgetProposals).values({
              activityId: activityResult.id,
              createdBy: 1,
              title: proposal.title,
              description: proposal.description,
              amount: parseFloat(proposal.amount),
              currency: "USD",
              inclusions: JSON.stringify(proposal.inclusions),
              exclusions: JSON.stringify(proposal.exclusions),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            console.log(`  💰 Proposta criada: ${proposal.title}`);
          } catch (proposalError: any) {
            if (proposalError.code === 'ER_DUP_ENTRY') {
              console.log(`  ℹ️ Proposta já existe: ${proposal.title}`);
            } else {
              console.error(`  ❌ Erro ao criar proposta:`, proposalError.message);
            }
          }
        }
      }
    }

    console.log("🎉 Atividades de Buenos Aires criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addBuenosAiresActivities().catch(console.error);