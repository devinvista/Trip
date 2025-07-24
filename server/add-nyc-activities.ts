import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add New York City activities with authentic details and budget proposals
async function addNYCActivities() {
  console.log("🗽 Adicionando atividades de Nova York com detalhes autênticos...");
  
  const nycActivities = [
    {
      title: "Estátua da Liberdade e Ellis Island",
      description: "Visite dois dos símbolos mais icônicos da América! A Estátua da Liberdade, presente da França aos EUA, representa liberdade e democracia. Ellis Island Museum conta a história da imigração americana através de exposições interativas e artefatos históricos. Uma jornada emocionante pela história americana e pelos ideais de liberdade.",
      location: "Nova York, EUA",
      category: "culture",
      city: "Nova York",
      country_type: "internacional",
      region: "América do Norte",
      price_type: "per_person",
      price_amount: null,
      duration: "4-5 horas",
      difficulty_level: "easy",
      min_participants: 1,
      max_participants: 100,
      languages: JSON.stringify(["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português"]),
      inclusions: JSON.stringify(["Ferry para Liberty Island", "Ferry para Ellis Island", "Entrada nos museus", "Audioguia"]),
      exclusions: JSON.stringify(["Transporte até Battery Park", "Alimentação", "Acesso à coroa", "Souvenirs"]),
      requirements: JSON.stringify(["Documento de identidade válido", "Chegada 30 min antes", "Inspeção de segurança obrigatória"]),
      cancellation_policy: "Cancelamento gratuito até 24h antes da visita",
      contact_info: JSON.stringify({
        phone: "+1 201-604-2800",
        email: "info@statueofliberty.org",
        website: "https://www.nps.gov/stli",
        address: "Liberty Island, New York, NY 10004"
      }),
      cover_image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
        "https://images.unsplash.com/photo-1520637836862-4d197d17c27a?w=800&q=80",
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80"
      ]),
      created_by_id: 1
    },
    {
      title: "Empire State Building - Ícone de NY",
      description: "Suba até um dos arranha-céus mais famosos do mundo! O Empire State Building oferece vistas panorâmicas espetaculares de Manhattan dos observatórios dos 86º e 102º andares. Este marco Art Déco de 1931 já foi cenário de filmes clássicos como King Kong e Sintonia do Amor. Uma experiência imperdível no coração de Nova York.",
      location: "Nova York, EUA",
      category: "sightseeing",
      city: "Nova York",
      country_type: "internacional",
      region: "América do Norte",
      price_type: "per_person",
      price_amount: null,
      duration: "2-3 horas",
      difficulty_level: "easy",
      min_participants: 1,
      max_participants: 200,
      languages: JSON.stringify(["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Japonês", "Chinês"]),
      inclusions: JSON.stringify(["Acesso ao observatório", "Elevadores de alta velocidade", "Vistas 360°", "Exposição histórica"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]),
      requirements: JSON.stringify(["Inspeção de segurança", "Não permitido bagagem grande", "Chegada no horário agendado"]),
      cancellation_policy: "Cancelamento gratuito até 24h antes. Reembolso parcial no mesmo dia",
      contact_info: JSON.stringify({
        phone: "+1 212-736-3100",
        email: "info@esbnyc.com",
        website: "https://www.esbnyc.com",
        address: "20 W 34th St, New York, NY 10001"
      }),
      cover_image: "https://images.unsplash.com/photo-1549417229-aa67d3263c9d?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1549417229-aa67d3263c9d?w=800&q=80",
        "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=800&q=80",
        "https://images.unsplash.com/photo-1592356308926-7e5e3a005de0?w=800&q=80"
      ]),
      created_by_id: 1
    },
    {
      title: "Broadway Show - Teatro de Classe Mundial",
      description: "Viva a magia da Broadway! Assista aos melhores musicais e peças teatrais do mundo no coração do Theater District. De clássicos como O Fantasma da Ópera e O Rei Leão a sucessos modernos, a Broadway oferece entretenimento de primeira classe. Uma experiência cultural única que define o teatro americano.",
      location: "Nova York, EUA",
      category: "entertainment",
      city: "Nova York",
      country_type: "internacional",
      region: "América do Norte",
      price_type: "per_person",
      price_amount: null,
      duration: "2,5-3 horas",
      difficulty_level: "easy",
      min_participants: 1,
      max_participants: 50,
      languages: JSON.stringify(["Inglês"]),
      inclusions: JSON.stringify(["Ingresso para show", "Assento numerado", "Programa oficial"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Bebidas", "Estacionamento", "Encontro com elenco"]),
      requirements: JSON.stringify(["Chegada 30 min antes", "Vestuário adequado", "Celular no silencioso", "Idade mínima varia por show"]),
      cancellation_policy: "Política varia por teatro. Geralmente não reembolsável",
      contact_info: JSON.stringify({
        phone: "+1 212-239-6200",
        email: "info@broadway.com",
        website: "https://www.broadway.com",
        address: "Times Square Theater District, New York, NY"
      }),
      cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2ea0?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&q=80"
      ]),
      created_by_id: 1
    },
    {
      title: "Central Park - Oásis Verde de Manhattan",
      description: "Explore o pulmão verde de Nova York! Central Park oferece 341 hectares de paisagens deslumbrantes, lagos serenos, pontes históricas e trilhas para caminhada. Visite locais icônicos como Bethesda Fountain, Strawberry Fields (memorial John Lennon) e Belvedere Castle. Perfeito para relaxar, fazer piquenique ou andar de bicicleta.",
      location: "Nova York, EUA",
      category: "nature",
      city: "Nova York",
      country_type: "internacional",
      region: "América do Norte",
      price_type: "per_person",
      price_amount: null,
      duration: "2-4 horas",
      difficulty_level: "easy",
      min_participants: 1,
      max_participants: 30,
      languages: JSON.stringify(["Inglês", "Espanhol", "Francês", "Alemão", "Italiano"]),
      inclusions: JSON.stringify(["Entrada gratuita no parque", "Acesso a trilhas", "Vistas panorâmicas", "Locais históricos"]),
      exclusions: JSON.stringify(["Aluguel de bicicleta", "Alimentação", "Guia turístico", "Transporte"]),
      requirements: JSON.stringify(["Calçado confortável", "Protetor solar", "Água", "Roupas adequadas ao clima"]),
      cancellation_policy: "Parque público - sem necessidade de cancelamento",
      contact_info: JSON.stringify({
        phone: "+1 212-310-6600",
        email: "info@centralparknyc.org",
        website: "https://www.centralparknyc.org",
        address: "Central Park, New York, NY 10024"
      }),
      cover_image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80",
        "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80",
        "https://images.unsplash.com/photo-1566404394863-f5ca891c96c8?w=800&q=80"
      ]),
      created_by_id: 1
    },
    {
      title: "Museu Metropolitano de Arte (Met)",
      description: "Descubra uma das maiores coleções de arte do mundo! O Met abriga tesouros de 5.000 anos de arte de todas as culturas globais. Veja obras-primas egípcias, arte grega e romana, pinturas europeias de Van Gogh e Monet, arte americana e muito mais. Uma jornada através da história da humanidade expressa em arte.",
      location: "Nova York, EUA",
      category: "culture",
      city: "Nova York",
      country_type: "internacional",
      region: "América do Norte",
      price_type: "per_person",
      price_amount: null,
      duration: "3-5 horas",
      difficulty_level: "easy",
      min_participants: 1,
      max_participants: 40,
      languages: JSON.stringify(["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Japonês", "Chinês", "Russo"]),
      inclusions: JSON.stringify(["Entrada no museu", "Acesso às coleções permanentes", "Mapa do museu", "Audioguia básico"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Exposições especiais", "Guia particular", "Estacionamento"]),
      requirements: JSON.stringify(["Documento de identidade", "Bagagem limitada", "Não permitido flash", "Silêncio nas galerias"]),
      cancellation_policy: "Cancelamento gratuito até 24h antes da visita",
      contact_info: JSON.stringify({
        phone: "+1 212-535-7710",
        email: "info@metmuseum.org",
        website: "https://www.metmuseum.org",
        address: "1000 5th Ave, New York, NY 10028"
      }),
      cover_image: "https://images.unsplash.com/photo-1544827753-4acf7de08544?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544827753-4acf7de08544?w=800&q=80",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
        "https://images.unsplash.com/photo-1577720643271-6760b94e67d1?w=800&q=80"
      ]),
      created_by_id: 1
    }
  ];

  // Budget proposals for each activity
  const budgetProposals = [
    // Estátua da Liberdade proposals
    {
      activityTitle: "Estátua da Liberdade e Ellis Island",
      proposals: [
        {
          title: "Econômico - Ferry e Entrada",
          description: "Pacote básico com ferry para ambas as ilhas e entrada nos museus. Audioguia incluído.",
          amount: "24.00",
          inclusions: ["Ferry ida e volta", "Entrada Liberty Island", "Entrada Ellis Island", "Audioguia"],
          exclusions: ["Acesso à coroa", "Guia ao vivo", "Alimentação", "Souvenirs"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Experiência completa com guia especializado. História detalhada e acesso prioritário.",
          amount: "50.00",
          inclusions: ["Tudo do econômico", "Guia especializado", "Acesso prioritário", "Tour de 3h"],
          exclusions: ["Acesso à coroa", "Alimentação", "Transporte terrestre"]
        },
        {
          title: "Premium - VIP + Acesso Restrito",
          description: "Experiência VIP com acesso à coroa da Estátua da Liberdade e áreas restritas.",
          amount: "150.00",
          inclusions: ["Acesso VIP à coroa", "Áreas restritas", "Guia privativo", "Grupo pequeno", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais"]
        }
      ]
    },
    // Empire State Building proposals
    {
      activityTitle: "Empire State Building - Ícone de NY",
      proposals: [
        {
          title: "Econômico - Entrada Básica",
          description: "Acesso ao observatório do 86º andar. Vistas panorâmicas de Manhattan.",
          amount: "45.00",
          inclusions: ["86º andar", "Elevadores", "Vistas 360°", "Exposição histórica"],
          exclusions: ["102º andar", "Evite filas", "Guia turístico", "Alimentação"]
        },
        {
          title: "Completo - Skip Line + Observatório",
          description: "Acesso prioritário aos observatórios do 86º e 102º andares. Sem filas.",
          amount: "90.00",
          inclusions: ["86º e 102º andares", "Evite filas", "Vistas premium", "Audioguia"],
          exclusions: ["Guia ao vivo", "Alimentação", "Fotografias", "Transporte"]
        },
        {
          title: "Premium - Tour Guiado + Jantar",
          description: "Experiência completa com tour guiado e jantar no STATE Grill and Bar.",
          amount: "200.00",
          inclusions: ["Tour guiado", "Todos os observatórios", "Jantar 3 pratos", "Evite filas", "Vinho"],
          exclusions: ["Transporte", "Gorjetas", "Bebidas extras", "Sobremesas especiais"]
        }
      ]
    },
    // Broadway proposals
    {
      activityTitle: "Broadway Show - Teatro de Classe Mundial",
      proposals: [
        {
          title: "Econômico - Poltronas de Fundo",
          description: "Assentos na parte traseira do teatro. Experiência Broadway completa a preço acessível.",
          amount: "50.00",
          inclusions: ["Ingresso do show", "Assento numerado", "Programa oficial"],
          exclusions: ["Assentos premium", "Encontro com elenco", "Alimentação", "Bebidas"]
        },
        {
          title: "Completo - Assentos Centrais",
          description: "Assentos na área central com excelente visibilidade. Experiência ideal.",
          amount: "150.00",
          inclusions: ["Assentos centrais", "Ingresso premium", "Programa oficial", "Vista perfeita"],
          exclusions: ["Backstage", "Encontro com elenco", "Alimentação", "Bebidas"]
        },
        {
          title: "Premium - VIP + Backstage",
          description: "Experiência VIP completa com acesso ao backstage e encontro com o elenco.",
          amount: "300.00",
          inclusions: ["Melhores assentos", "Acesso backstage", "Encontro com elenco", "Programa autografado", "Champagne"],
          exclusions: ["Transporte", "Jantar", "Fotografias profissionais", "Souvenirs extras"]
        }
      ]
    },
    // Central Park proposals
    {
      activityTitle: "Central Park - Oásis Verde de Manhattan",
      proposals: [
        {
          title: "Econômico - Passeio Livre",
          description: "Explore o parque por conta própria. Entrada gratuita com acesso a todas as áreas públicas.",
          amount: "0.00",
          inclusions: ["Entrada gratuita", "Acesso a trilhas", "Locais históricos", "Vistas panorâmicas"],
          exclusions: ["Guia turístico", "Aluguel de bicicleta", "Alimentação", "Transporte"]
        },
        {
          title: "Completo - Aluguel de Bike",
          description: "Explore o parque de bicicleta com mapa e rotas sugeridas. Maneira eficiente e divertida.",
          amount: "40.00",
          inclusions: ["Aluguel de bicicleta 4h", "Capacete", "Mapa de rotas", "Cadeado"],
          exclusions: ["Guia turístico", "Alimentação", "Seguro", "Transporte"]
        },
        {
          title: "Premium - Tour Guiado + Piquenique",
          description: "Tour guiado com piquenique gourmet. Conheça história e segredos do parque.",
          amount: "120.00",
          inclusions: ["Guia especializado", "Piquenique gourmet", "Bebidas", "Locais exclusivos", "Grupo pequeno"],
          exclusions: ["Transporte", "Gorjetas", "Bicicleta", "Atividades extras"]
        }
      ]
    },
    // Met Museum proposals
    {
      activityTitle: "Museu Metropolitano de Arte (Met)",
      proposals: [
        {
          title: "Econômico - Entrada Básica",
          description: "Entrada no museu com acesso às coleções permanentes. Explore no seu ritmo.",
          amount: "25.00",
          inclusions: ["Entrada no museu", "Coleções permanentes", "Mapa do museu", "Audioguia básico"],
          exclusions: ["Guia ao vivo", "Exposições especiais", "Alimentação", "Transporte"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado de 2 horas focando nas obras-primas. Contexto histórico e artístico.",
          amount: "60.00",
          inclusions: ["Entrada no museu", "Tour guiado 2h", "Obras-primas", "Guia especializado"],
          exclusions: ["Exposições especiais", "Alimentação", "Transporte", "Audioguia pessoal"]
        },
        {
          title: "Premium - Tour Privado + Acesso VIP",
          description: "Tour privado com acesso a áreas especiais e curador especializado.",
          amount: "150.00",
          inclusions: ["Tour privado", "Curador especializado", "Acesso VIP", "Áreas especiais", "Grupo pequeno"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]
        }
      ]
    }
  ];

  try {
    // Insert activities first
    for (const activity of nycActivities) {
      try {
        const [insertedActivity] = await db.insert(activities).values({
          ...activity,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
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
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
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

    console.log("🎉 Atividades de Nova York criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addNYCActivities().catch(console.error);