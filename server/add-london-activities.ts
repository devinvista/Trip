import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add London activities with authentic details and budget proposals
async function addLondonActivities() {
  console.log("🏰 Adicionando atividades de Londres com detalhes autênticos...");
  
  const londonActivities = [
    {
      title: "London Eye - Roda Gigante Icônica",
      description: "Desfrute de vistas panorâmicas espetaculares de Londres a 135 metros de altura! O London Eye é a roda gigante de observação mais alta da Europa, oferecendo vistas de 360° da capital britânica. Veja marcos icônicos como Big Ben, Houses of Parliament, St. Paul's Cathedral e o Rio Tâmisa. Uma experiência única de 30 minutos que revela Londres de uma perspectiva totalmente nova.",
      location: "Londres, Reino Unido",
      category: "sightseeing",
      city: "Londres",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "30-45 minutos",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 25,
      languages: JSON.stringify(["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Japonês", "Chinês"]),
      inclusions: JSON.stringify(["Entrada no London Eye", "Volta completa de 30 min", "Vistas panorâmicas", "Audioguia digital"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Fotografias", "Souvenirs", "Champagne"]),
      requirements: JSON.stringify(["Chegada 15 min antes", "Crianças menores 16 anos com adulto", "Não recomendado para claustrofobia"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: JSON.stringify({
        phone: "+44 871 781 3000",
        email: "info@londoneye.com",
        website: "https://www.londoneye.com",
        address: "Riverside Building, County Hall, London SE1 7PB"
      }),
      coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80",
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Torre de Londres - Fortaleza Histórica",
      description: "Explore quase 1.000 anos de história real na Torre de Londres! Esta fortaleza histórica abriga as mundialmente famosas Joias da Coroa, incluindo a coroa de St. Edward e o diamante Cullinan I. Descubra as histórias dos prisioneiros famosos, visite a White Tower normanda e conheça os lendários Yeoman Warders (Beefeaters). Uma jornada fascinante pela história sombria e gloriosa da realeza britânica.",
      location: "Londres, Reino Unido",
      category: "culture",
      city: "Londres",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Inglês", "Francês", "Alemão", "Espanhol", "Italiano"]),
      inclusions: JSON.stringify(["Entrada na Torre", "Acesso às Joias da Coroa", "White Tower", "Yeoman Warder tours", "Audioguia"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Fotografias nas Joias", "Souvenirs"]),
      requirements: JSON.stringify(["Documento de identidade", "Inspeção de segurança", "Não permitido bagagem grande"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: JSON.stringify({
        phone: "+44 20 3166 6000",
        email: "toweroflondon@hrp.org.uk",
        website: "https://www.hrp.org.uk/tower-of-london",
        address: "St Katharine's & Wapping, London EC3N 4AB"
      }),
      coverImage: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Museu Britânico - Tesouros Mundiais",
      description: "Descubra a maior coleção de artefatos históricos do mundo! O Museu Britânico abriga tesouros únicos como a Pedra de Roseta, múmias egípcias, esculturas do Parthenon e manuscritos históricos. Com mais de 8 milhões de objetos cobrindo 2 milhões de anos de história humana, este museu gratuito oferece uma jornada pela civilização mundial. Imperdível para amantes de história e cultura.",
      location: "Londres, Reino Unido",
      category: "culture",
      city: "Londres",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 30,
      languages: JSON.stringify(["Inglês", "Francês", "Alemão", "Espanhol", "Italiano", "Japonês", "Chinês", "Português"]),
      inclusions: JSON.stringify(["Entrada gratuita", "Acesso às galerias permanentes", "Mapa do museu", "WiFi gratuito"]),
      exclusions: JSON.stringify(["Exposições especiais", "Audioguia", "Transporte", "Alimentação"]),
      requirements: JSON.stringify(["Bagagem limitada", "Não permitido flash", "Silêncio nas galerias"]),
      cancellationPolicy: "Entrada gratuita - sem necessidade de reserva",
      contactInfo: JSON.stringify({
        phone: "+44 20 7323 8299",
        email: "information@britishmuseum.org",
        website: "https://www.britishmuseum.org",
        address: "Great Russell St, Bloomsbury, London WC1B 3DG"
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
      title: "West End - Teatro de Classe Mundial",
      description: "Viva a magia do teatro no famoso West End de Londres! Casa dos melhores musicais e peças do mundo, o West End oferece espetáculos icônicos como O Fantasma da Ópera, O Rei Leão, Mamma Mia! e Hamilton. Com mais de 40 teatros profissionais, esta é a experiência teatral mais prestigiosa da Europa. Uma noite inesquecível na tradição teatral britânica.",
      location: "Londres, Reino Unido",
      category: "entertainment",
      city: "Londres",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "2,5-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 40,
      languages: JSON.stringify(["Inglês"]),
      inclusions: JSON.stringify(["Ingresso para show", "Assento numerado", "Programa oficial", "Intervalo"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Bebidas", "Estacionamento", "Encontro com elenco"]),
      requirements: JSON.stringify(["Chegada 30 min antes", "Vestuário adequado", "Celular silencioso", "Idade mínima varia"]),
      cancellationPolicy: "Política varia por teatro. Geralmente não reembolsável",
      contactInfo: JSON.stringify({
        phone: "+44 20 7492 1548",
        email: "info@westendtheatre.com",
        website: "https://www.westendtheatre.com",
        address: "West End Theatre District, London"
      }),
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2ea0?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Palácio de Buckingham - Residência Real",
      description: "Visite a residência oficial da família real britânica! O Palácio de Buckingham é o coração administrativo da monarquia e oferece experiências únicas como a cerimônia da Troca da Guarda. Durante o verão, visite os State Rooms magnificamente decorados, admire obras de arte da Royal Collection e explore os jardins reais. Uma oportunidade rara de experimentar a grandeza da realeza britânica.",
      location: "Londres, Reino Unido",
      category: "culture",
      city: "Londres",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 100,
      languages: JSON.stringify(["Inglês", "Francês", "Alemão", "Espanhol", "Italiano", "Japonês", "Chinês"]),
      inclusions: JSON.stringify(["Acesso conforme tipo", "Vistas do palácio", "Cerimônia da Troca da Guarda", "Audioguia"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Fotografia interior", "Souvenirs"]),
      requirements: JSON.stringify(["Documento de identidade", "Inspeção de segurança", "Vestuário adequado"]),
      cancellationPolicy: "Evento externo gratuito. Tours internos canceláveis até 24h antes",
      contactInfo: JSON.stringify({
        phone: "+44 20 7766 7300",
        email: "info@royalcollection.org.uk",
        website: "https://www.rct.uk/visit/buckingham-palace",
        address: "Buckingham Palace, London SW1A 1AA"
      }),
      coverImage: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        "https://images.unsplash.com/photo-1519135467309-4491ed7eaa40?w=800&q=80"
      ]),
      createdById: 1
    }
  ];

  // Budget proposals for each activity
  const budgetProposals = [
    // London Eye proposals
    {
      activityTitle: "London Eye - Roda Gigante Icônica",
      proposals: [
        {
          title: "Econômico - Entrada Padrão",
          description: "Entrada padrão para o London Eye com volta completa de 30 minutos.",
          amount: "30.00",
          inclusions: ["Entrada padrão", "Volta de 30 min", "Vistas panorâmicas", "Audioguia digital"],
          exclusions: ["Evite filas", "Champagne", "Cabine privada", "Fotografias"]
        },
        {
          title: "Completo - Skip Line",
          description: "Entrada com acesso prioritário, evitando filas e garantindo horário específico.",
          amount: "50.00",
          inclusions: ["Acesso prioritário", "Evite filas", "Volta de 30 min", "Audioguia premium"],
          exclusions: ["Cabine privada", "Champagne", "Fotografias profissionais"]
        },
        {
          title: "Premium - Cabine Privada + Champagne",
          description: "Experiência VIP com cabine privada para até 25 pessoas e champagne.",
          amount: "150.00",
          inclusions: ["Cabine privada", "Champagne", "Anfitrião dedicado", "Evite filas", "Certificado"],
          exclusions: ["Transporte", "Alimentação adicional", "Fotografias profissionais"]
        }
      ]
    },
    // Tower of London proposals
    {
      activityTitle: "Torre de Londres - Fortaleza Histórica",
      proposals: [
        {
          title: "Econômico - Entrada Simples",
          description: "Entrada básica com acesso a todas as áreas públicas e Joias da Coroa.",
          amount: "25.00",
          inclusions: ["Entrada na Torre", "Joias da Coroa", "White Tower", "Yeoman Warder tours"],
          exclusions: ["Audioguia", "Tour privado", "Acesso VIP", "Alimentação"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado especializado com contexto histórico detalhado.",
          amount: "50.00",
          inclusions: ["Entrada completa", "Tour guiado 2h", "Audioguia", "Acesso prioritário"],
          exclusions: ["Tour privado", "Alimentação", "Transporte", "Souvenirs"]
        },
        {
          title: "Premium - Tour Privado + Joias da Coroa",
          description: "Tour privado com acesso especial e foco nas Joias da Coroa.",
          amount: "120.00",
          inclusions: ["Tour privado", "Guia especializado", "Acesso especial", "Grupo pequeno", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Fotografias nas Joias", "Souvenirs"]
        }
      ]
    },
    // British Museum proposals
    {
      activityTitle: "Museu Britânico - Tesouros Mundiais",
      proposals: [
        {
          title: "Econômico - Entrada Gratuita",
          description: "Entrada gratuita com acesso a todas as galerias permanentes.",
          amount: "0.00",
          inclusions: ["Entrada gratuita", "Galerias permanentes", "Mapa do museu", "WiFi gratuito"],
          exclusions: ["Audioguia", "Tour guiado", "Exposições especiais", "Transporte"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado focando nos tesouros mais importantes do museu.",
          amount: "20.00",
          inclusions: ["Tour guiado 1,5h", "Entrada gratuita", "Obras-primas", "Guia especializado"],
          exclusions: ["Exposições especiais", "Audioguia pessoal", "Transporte", "Alimentação"]
        },
        {
          title: "Premium - Tour Privado",
          description: "Tour privado personalizado com curador especializado.",
          amount: "80.00",
          inclusions: ["Tour privado", "Curador especializado", "Acesso especial", "Grupo pequeno", "Obras exclusivas"],
          exclusions: ["Transporte", "Alimentação", "Exposições especiais", "Souvenirs"]
        }
      ]
    },
    // West End proposals
    {
      activityTitle: "West End - Teatro de Classe Mundial",
      proposals: [
        {
          title: "Econômico - Assentos de Fundo",
          description: "Assentos econômicos com vista completa do palco a preço acessível.",
          amount: "25.00",
          inclusions: ["Ingresso do show", "Assento numerado", "Programa oficial", "Vista do palco"],
          exclusions: ["Assentos premium", "Intervalo com bebida", "Encontro com elenco", "Backstage"]
        },
        {
          title: "Completo - Assentos Centrais",
          description: "Assentos centrais com excelente visibilidade e acústica.",
          amount: "80.00",
          inclusions: ["Assentos centrais", "Vista premium", "Programa oficial", "Intervalo"],
          exclusions: ["Backstage", "Encontro com elenco", "Alimentação", "Bebidas"]
        },
        {
          title: "Premium - VIP + Backstage",
          description: "Experiência VIP completa com acesso backstage e encontro com elenco.",
          amount: "200.00",
          inclusions: ["Melhores assentos", "Acesso backstage", "Encontro com elenco", "Programa autografado", "Intervalo VIP"],
          exclusions: ["Transporte", "Jantar", "Fotografias profissionais", "Souvenirs extras"]
        }
      ]
    },
    // Buckingham Palace proposals
    {
      activityTitle: "Palácio de Buckingham - Residência Real",
      proposals: [
        {
          title: "Econômico - Evento Externo",
          description: "Assista à cerimônia da Troca da Guarda gratuitamente do lado externo.",
          amount: "0.00",
          inclusions: ["Troca da Guarda", "Vista externa", "Evento gratuito", "Atmosfera real"],
          exclusions: ["Acesso interno", "Guia turístico", "State Rooms", "Jardins"]
        },
        {
          title: "Completo - Tour Externo",
          description: "Tour guiado externo com contexto histórico e melhores pontos de vista.",
          amount: "25.00",
          inclusions: ["Tour externo", "Guia especializado", "Troca da Guarda", "História real", "Melhores vistas"],
          exclusions: ["Acesso interno", "State Rooms", "Jardins", "Alimentação"]
        },
        {
          title: "Premium - Tour Interno + State Rooms",
          description: "Tour interno exclusivo dos State Rooms com arte da Royal Collection.",
          amount: "100.00",
          inclusions: ["State Rooms", "Royal Collection", "Jardins", "Audioguia", "Acesso VIP"],
          exclusions: ["Quartos privados", "Transporte", "Alimentação", "Fotografias internas"]
        }
      ]
    }
  ];

  try {
    // Insert activities first
    for (const activity of londonActivities) {
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
              currency: "GBP",
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

    console.log("🎉 Atividades de Londres criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addLondonActivities().catch(console.error);