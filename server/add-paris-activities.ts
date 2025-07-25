import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add Paris activities with authentic details and budget proposals
async function addParisActivities() {
  console.log("🗼 Adicionando atividades de Paris com detalhes autênticos...");
  
  const parisActivities = [
    {
      title: "Torre Eiffel - Símbolo de Paris",
      description: "Visite o monumento mais famoso do mundo! A Torre Eiffel oferece vistas panorâmicas espetaculares de Paris. Construída para a Exposição Universal de 1889, esta obra-prima da engenharia de ferro forjado tornou-se o símbolo eterno da Cidade Luz. Escolha entre diferentes níveis de acesso e desfrute de uma experiência inesquecível.",
      location: "Paris, França",
      category: "sightseeing",
      city: "Paris",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null, // Will be set via budget proposals
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Francês", "Inglês", "Espanhol", "Alemão"]),
      inclusions: JSON.stringify(["Acesso à Torre Eiffel", "Vistas panorâmicas", "Elevadores ou escadas"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Souvenirs"]),
      requirements: JSON.stringify(["Documento de identidade", "Chegada com 30 min de antecedência"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: JSON.stringify({
        phone: "+33 892 70 12 39",
        email: "contact@toureiffel.paris",
        website: "https://www.toureiffel.paris",
        address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris"
      }),
      coverImage: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80",
        "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80",
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Museu do Louvre - Tesouro da Arte Mundial",
      description: "Explore o maior museu de arte do mundo! O Louvre abriga obras-primas inestimáveis como a Mona Lisa de Leonardo da Vinci, a Vênus de Milo e a Vitória de Samotrácia. Com mais de 35.000 obras expostas em 60.600 m², este palácio real transformado em museu oferece uma jornada única através da história da arte e civilização.",
      location: "Paris, França",
      category: "culture",
      city: "Paris",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "3-5 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 30,
      languages: JSON.stringify(["Francês", "Inglês", "Espanhol", "Alemão", "Italiano", "Chinês"]),
      inclusions: JSON.stringify(["Entrada no museu", "Acesso às coleções permanentes", "Mapa do museu"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Audioguia", "Exposições temporárias"]),
      requirements: JSON.stringify(["Documento de identidade", "Bagagem limitada", "Proibido flash fotográfico"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes. Bilhetes com data específica não reembolsáveis",
      contactInfo: JSON.stringify({
        phone: "+33 1 40 20 50 50",
        email: "info@louvre.fr",
        website: "https://www.louvre.fr",
        address: "Rue de Rivoli, 75001 Paris"
      }),
      coverImage: "https://images.unsplash.com/photo-1566139992888-745d3856e2f8?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1566139992888-745d3856e2f8?w=800&q=80",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Cruzeiro pelo Rio Sena - Paris das Águas",
      description: "Descubra Paris sob uma perspectiva única navegando pelo histórico Rio Sena! Este passeio oferece vistas deslumbrantes dos principais monumentos parisienses: Torre Eiffel, Catedral de Notre-Dame, Museu do Louvre e Museu d'Orsay. Navegue pelas águas que testemunharam séculos de história francesa enquanto desfruta da arquitetura majestosa das margens do Sena.",
      location: "Paris, França",
      category: "sightseeing",
      city: "Paris",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 200,
      languages: JSON.stringify(["Francês", "Inglês", "Espanhol", "Alemão", "Italiano"]),
      inclusions: JSON.stringify(["Cruzeiro pelo Rio Sena", "Comentários em múltiplos idiomas", "Assentos cobertos"]),
      exclusions: JSON.stringify(["Transporte até o embarque", "Alimentação", "Bebidas", "Gorjetas"]),
      requirements: JSON.stringify(["Chegada 15 min antes", "Roupas adequadas ao clima", "Protetor solar"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes do passeio",
      contactInfo: JSON.stringify({
        phone: "+33 1 42 25 96 10",
        email: "info@bateaux-parisiens.com",
        website: "https://www.bateaux-parisiens.com",
        address: "Port de la Bourdonnais, 75007 Paris"
      }),
      coverImage: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80",
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Catedral de Notre-Dame - Joia Gótica",
      description: "Admire a magistral arquitetura gótica da Catedral de Notre-Dame de Paris! Esta obra-prima medieval, imortalizada por Victor Hugo, impressiona com suas torres imponentes, rosáceas multicoloridas e gárgulas misteriosas. Mesmo após o incêndio de 2019, a catedral continua sendo um símbolo da resiliência parisiense e da arte gótica francesa.",
      location: "Paris, França",
      category: "culture",
      city: "Paris",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 100,
      languages: JSON.stringify(["Francês", "Inglês", "Espanhol", "Alemão"]),
      inclusions: JSON.stringify(["Entrada na catedral", "Acesso ao interior", "Vistas da arquitetura gótica"]),
      exclusions: JSON.stringify(["Acesso às torres", "Transporte", "Alimentação", "Guia turístico"]),
      requirements: JSON.stringify(["Vestuário adequado", "Silêncio durante missas", "Respeito ao local sagrado"]),
      cancellationPolicy: "Entrada gratuita. Horários sujeitos a celebrações religiosas",
      contactInfo: JSON.stringify({
        phone: "+33 1 42 34 56 10",
        email: "accueil@notredamedeparis.fr",
        website: "https://www.notredamedeparis.fr",
        address: "6 Parvis Notre-Dame, 75004 Paris"
      }),
      coverImage: "https://images.unsplash.com/photo-1539650116574-75c0c6d47324?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539650116574-75c0c6d47324?w=800&q=80",
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Palácio de Versalhes - Grandeza Real",
      description: "Mergulhe na opulência da corte francesa no magnífico Palácio de Versalhes! Este símbolo do absolutismo real impressiona com o famoso Salão dos Espelhos, os aposentos reais luxuosamente decorados e os jardins franceses desenhados por André Le Nôtre. Uma jornada pela história da França monárquica e pela arte decorativa francesa dos séculos XVII e XVIII.",
      location: "Paris, França",
      category: "culture",
      city: "Paris",
      countryType: "internacional",
      region: "Europa Ocidental",
      priceType: "per_person",
      priceAmount: null,
      duration: "4-6 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 40,
      languages: JSON.stringify(["Francês", "Inglês", "Espanhol", "Alemão", "Italiano"]),
      inclusions: JSON.stringify(["Entrada no palácio", "Acesso aos jardins", "Salão dos Espelhos", "Aposentos reais"]),
      exclusions: JSON.stringify(["Transporte de/para Paris", "Alimentação", "Guia turístico", "Espetáculos especiais"]),
      requirements: JSON.stringify(["Documento de identidade", "Calçado confortável", "Chegada pontual"]),
      cancellationPolicy: "Cancelamento gratuito até 24h antes. Bilhetes com data específica",
      contactInfo: JSON.stringify({
        phone: "+33 1 30 83 78 00",
        email: "contact@chateauversailles.fr",
        website: "https://www.chateauversailles.fr",
        address: "Place d'Armes, 78000 Versailles"
      }),
      coverImage: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
        "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=800&q=80",
        "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&q=80"
      ]),
      createdById: 1
    }
  ];

  // Budget proposals for each activity
  const budgetProposals = [
    // Torre Eiffel proposals
    {
      activityTitle: "Torre Eiffel - Símbolo de Paris",
      proposals: [
        {
          title: "Econômico - Escada até 2º Andar",
          description: "Acesso até o segundo andar via escada. Exercício saudável com vista magnífica de Paris.",
          amount: "10.00",
          inclusions: ["Acesso até 2º andar", "Escada", "Vista panorâmica"],
          exclusions: ["Elevador", "Acesso ao topo", "Guia turístico"]
        },
        {
          title: "Completo - Elevador até o Topo",
          description: "Acesso completo até o topo da Torre Eiffel via elevador. Experiência clássica e confortável.",
          amount: "25.00",
          inclusions: ["Elevador até o topo", "Todos os níveis", "Vista 360°"],
          exclusions: ["Guia turístico", "Alimentação", "Tour guiado"]
        },
        {
          title: "Premium - Tour Guiado + Jantar",
          description: "Experiência completa com tour guiado e jantar no restaurante Jules Verne. Luxo e exclusividade.",
          amount: "70.00",
          inclusions: ["Tour guiado", "Jantar no restaurante", "Acesso prioritário", "Sommelier"],
          exclusions: ["Transporte", "Bebidas extras", "Gorjetas"]
        }
      ]
    },
    // Museu do Louvre proposals
    {
      activityTitle: "Museu do Louvre - Tesouro da Arte Mundial",
      proposals: [
        {
          title: "Econômico - Entrada Online",
          description: "Bilhete de entrada padrão comprado online. Acesso às coleções permanentes.",
          amount: "17.00",
          inclusions: ["Entrada no museu", "Coleções permanentes", "Mapa gratuito"],
          exclusions: ["Audioguia", "Tour guiado", "Exposições temporárias"]
        },
        {
          title: "Completo - Tour Guiado em Grupo",
          description: "Tour guiado em grupo com guia especializado. Descubra as obras-primas do Louvre.",
          amount: "40.00",
          inclusions: ["Tour guiado 2h", "Entrada no museu", "Obras principais", "Guia especializado"],
          exclusions: ["Audioguia pessoal", "Acesso VIP", "Exposições temporárias"]
        },
        {
          title: "Premium - Tour Privativo + Acesso Especial",
          description: "Tour privativo com acesso especial às áreas restritas. Experiência exclusiva e personalizada.",
          amount: "120.00",
          inclusions: ["Tour privativo", "Acesso especial", "Guia personal", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Souvenirs"]
        }
      ]
    },
    // Cruzeiro pelo Sena proposals
    {
      activityTitle: "Cruzeiro pelo Rio Sena - Paris das Águas",
      proposals: [
        {
          title: "Econômico - Cruzeiro Simples",
          description: "Cruzeiro básico de 1 hora pelo Rio Sena. Comentários em múltiplos idiomas.",
          amount: "15.00",
          inclusions: ["Cruzeiro 1h", "Comentários", "Assentos cobertos"],
          exclusions: ["Alimentação", "Bebidas", "Serviço de mesa"]
        },
        {
          title: "Completo - Cruzeiro com Jantar",
          description: "Cruzeiro romântico com jantar de 3 pratos. Gastronomia francesa a bordo.",
          amount: "60.00",
          inclusions: ["Cruzeiro 2h", "Jantar 3 pratos", "Vinho incluso", "Serviço de mesa"],
          exclusions: ["Transporte", "Gorjetas", "Bebidas extras"]
        },
        {
          title: "Premium - Cruzeiro Privativo com Champagne",
          description: "Cruzeiro privativo com champagne e canapés. Máximo 8 pessoas para experiência exclusiva.",
          amount: "150.00",
          inclusions: ["Cruzeiro privativo", "Champagne premium", "Canapés gourmet", "Serviço personalizado"],
          exclusions: ["Transporte", "Jantar completo", "Fotografias"]
        }
      ]
    },
    // Notre-Dame proposals
    {
      activityTitle: "Catedral de Notre-Dame - Joia Gótica",
      proposals: [
        {
          title: "Econômico - Entrada Livre",
          description: "Entrada gratuita na catedral. Admire a arquitetura gótica por conta própria.",
          amount: "0.00",
          inclusions: ["Entrada na catedral", "Acesso ao interior", "Arquitetura gótica"],
          exclusions: ["Guia turístico", "Acesso às torres", "Audioguia"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado com especialista em arquitetura gótica. História e arte medieval.",
          amount: "15.00",
          inclusions: ["Tour guiado 1h", "Entrada na catedral", "História medieval", "Arquitetura gótica"],
          exclusions: ["Acesso às torres", "Transporte", "Alimentação"]
        },
        {
          title: "Premium - Tour Privado + Torre",
          description: "Tour privado com acesso às torres (quando disponível). Vista panorâmica de Paris.",
          amount: "50.00",
          inclusions: ["Tour privado", "Acesso às torres", "Vista panorâmica", "Guia especializado"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais"]
        }
      ]
    },
    // Versalhes proposals
    {
      activityTitle: "Palácio de Versalhes - Grandeza Real",
      proposals: [
        {
          title: "Econômico - Entrada Básica",
          description: "Entrada básica no palácio. Acesso aos aposentos reais e Salão dos Espelhos.",
          amount: "18.00",
          inclusions: ["Entrada no palácio", "Aposentos reais", "Salão dos Espelhos"],
          exclusions: ["Jardins", "Transporte", "Audioguia"]
        },
        {
          title: "Completo - Tour com Audioguia",
          description: "Tour completo com audioguia em português. Palácio, jardins e história francesa.",
          amount: "50.00",
          inclusions: ["Entrada completa", "Audioguia", "Jardins", "Aposentos reais"],
          exclusions: ["Transporte", "Alimentação", "Guia ao vivo"]
        },
        {
          title: "Premium - Tour Privativo + Jardins",
          description: "Tour privativo com guia especializado. Acesso completo aos jardins franceses.",
          amount: "100.00",
          inclusions: ["Tour privativo", "Guia especializado", "Jardins completos", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Espetáculos especiais"]
        }
      ]
    }
  ];

  try {
    // Insert activities first
    for (const activity of parisActivities) {
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
              amount: proposal.amount,
              currency: "EUR",
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

    console.log("🎉 Atividades de Paris criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addParisActivities().catch(console.error);