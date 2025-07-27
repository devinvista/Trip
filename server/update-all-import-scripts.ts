import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

// Script to fix and update all activity import scripts for MySQL compatibility
async function updateAllImportScripts() {
  console.log("🔧 Atualizando todos os scripts de importação para MySQL...");
  
  // London Activities with MySQL-compatible fields
  const londonActivities = [
    {
      title: "London Eye - Roda Gigante Icônica",
      description: "Desfrute de vistas panorâmicas espetaculares de Londres a 135 metros de altura! O London Eye é a roda gigante de observação mais alta da Europa.",
      location: "Londres, Reino Unido",
      category: "sightseeing",
      countryType: "internacional",
      region: "Europa Ocidental",
      city: "Londres",
      priceType: "per_person",
      priceAmount: null,
      duration: "30-45 minutos",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 25,
      languages: ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português"],
      inclusions: ["Entrada no London Eye", "Volta completa de 30 min", "Vistas panorâmicas", "Audioguia digital"],
      exclusions: ["Transporte", "Alimentação", "Fotografias", "Souvenirs", "Champagne"],
      requirements: ["Chegada 15 min antes", "Crianças menores 16 anos com adulto", "Não recomendado para claustrofobia"],
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: {
        phone: "+44 871 781 3000",
        email: "info@londoneye.com",
        website: "https://www.londoneye.com",
        address: "Riverside Building, County Hall, London SE1 7PB"
      },
      coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&q=85",
      images: [
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&h=800&fit=crop&q=85"
      ],
      averageRating: 4.5,
      totalRatings: 1250,
      isActive: true,
      createdById: 1
    },
    {
      title: "Torre de Londres - Fortaleza Histórica",
      description: "Explore quase 1.000 anos de história real na Torre de Londres! Esta fortaleza histórica abriga as mundialmente famosas Joias da Coroa.",
      location: "Londres, Reino Unido",
      category: "culture",
      countryType: "internacional",
      region: "Europa Ocidental",
      city: "Londres",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: ["Inglês", "Francês", "Alemão", "Espanhol", "Italiano"],
      inclusions: ["Entrada na Torre", "Acesso às Joias da Coroa", "White Tower", "Yeoman Warder tours", "Audioguia"],
      exclusions: ["Transporte", "Alimentação", "Fotografias nas Joias", "Souvenirs"],
      requirements: ["Documento de identidade", "Inspeção de segurança", "Não permitido bagagem grande"],
      cancellationPolicy: "Cancelamento gratuito até 24h antes da visita",
      contactInfo: {
        phone: "+44 20 3166 6000",
        email: "toweroflondon@hrp.org.uk",
        website: "https://www.hrp.org.uk/tower-of-london",
        address: "St Katharine's & Wapping, London EC3N 4AB"
      },
      coverImage: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop&q=85",
      images: [
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=800&fit=crop&q=85"
      ],
      averageRating: 4.6,
      totalRatings: 980,
      isActive: true,
      createdById: 1
    },
    {
      title: "Museu Britânico - Tesouros Mundiais",
      description: "Descubra a história da humanidade no Museu Britânico! Veja tesouros únicos como a Pedra de Rosetta, múmias egípcias e esculturas do Partenon.",
      location: "Londres, Reino Unido",
      category: "culture",
      countryType: "internacional",
      region: "Europa Ocidental",
      city: "Londres",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 100,
      languages: ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês", "Chinês"],
      inclusions: ["Entrada gratuita", "Acesso a galerias permanentes", "Mapa do museu", "WiFi gratuito"],
      exclusions: ["Exposições especiais", "Audioguia", "Tours guiados", "Alimentação", "Estacionamento"],
      requirements: ["Inspeção de segurança", "Não permitido mochilas grandes", "Fotografias sem flash"],
      cancellationPolicy: "Entrada gratuita - sem cancelamento necessário",
      contactInfo: {
        phone: "+44 20 7323 8299",
        email: "information@britishmuseum.org",
        website: "https://www.britishmuseum.org",
        address: "Great Russell St, Bloomsbury, London WC1B 3DG"
      },
      coverImage: "https://images.unsplash.com/photo-1555504874-7c6e3e7c4e5e?w=1200&h=800&fit=crop&q=85",
      images: [
        "https://images.unsplash.com/photo-1555504874-7c6e3e7c4e5e?w=1200&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&q=85"
      ],
      averageRating: 4.7,
      totalRatings: 2100,
      isActive: true,
      createdById: 1
    },
    {
      title: "West End - Teatro de Classe Mundial",
      description: "Experimente a magia dos teatros do West End de Londres! Assista aos melhores musicais e peças teatrais do mundo em teatros históricos.",
      location: "Londres, Reino Unido",
      category: "culture",
      countryType: "internacional",
      region: "Europa Ocidental",
      city: "Londres",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 2000,
      languages: ["Inglês"],
      inclusions: ["Ingresso para o espetáculo", "Programa da peça", "Acesso ao teatro"],
      exclusions: ["Transporte", "Alimentação", "Bebidas", "Gorjetas", "Meet & Greet"],
      requirements: ["Chegada 30 min antes", "Traje elegante recomendado", "Crianças verificar classificação"],
      cancellationPolicy: "Política varia por teatro - verificar condições",
      contactInfo: {
        phone: "+44 84 4871 7622",
        email: "info@theatreland.com",
        website: "https://www.londontheatre.co.uk",
        address: "West End, London"
      },
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=85",
      images: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&h=800&fit=crop&q=85"
      ],
      averageRating: 4.8,
      totalRatings: 850,
      isActive: true,
      createdById: 1
    },
    {
      title: "Palácio de Buckingham - Residência Real",
      description: "Visite a residência oficial da Rainha e assista à famosa cerimônia da Troca da Guarda. Explore os State Rooms durante o verão.",
      location: "Londres, Reino Unido",
      category: "sightseeing",
      countryType: "internacional",
      region: "Europa Ocidental",
      city: "Londres",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 5000,
      languages: ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês"],
      inclusions: ["Vista externa", "Cerimônia Troca da Guarda", "Jardins St. James", "Fotografias"],
      exclusions: ["Acesso interno", "State Rooms", "Audioguia", "Transporte", "Alimentação"],
      requirements: ["Chegada cedo para melhores lugares", "Verificar horários da cerimônia", "Respeitar protocolos"],
      cancellationPolicy: "Evento gratuito - sujeito a condições climáticas",
      contactInfo: {
        phone: "+44 30 3123 7300",
        email: "bookinginfo@royalcollection.org.uk",
        website: "https://www.rct.uk/visit/buckingham-palace",
        address: "Buckingham Palace, London SW1A 1AA"
      },
      coverImage: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&h=800&fit=crop&q=85",
      images: [
        "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1580479452314-f7d7e8b53db8?w=1200&h=800&fit=crop&q=85"
      ],
      averageRating: 4.3,
      totalRatings: 1680,
      isActive: true,
      createdById: 1
    }
  ];

  // Budget proposals for London activities
  const londonBudgetProposals = [
    {
      activityTitle: "London Eye - Roda Gigante Icônica",
      proposals: [
        {
          title: "Econômico - Ingresso Padrão",
          description: "Ingresso padrão para a roda gigante London Eye durante horários regulares.",
          amount: 27.00,
          currency: "GBP",
          inclusions: ["Entrada London Eye", "Volta completa 30 min", "Vista panorâmica", "Acesso padrão"],
          exclusions: ["Fast Track", "Champagne", "Fotografias", "Guia privado", "Horário premium"]
        },
        {
          title: "Completo - Fast Track + Experiência",
          description: "Entrada rápida com experiência aprimorada e acesso prioritário.",
          amount: 37.00,
          currency: "GBP",
          inclusions: ["Fast Track", "Entrada prioritária", "Brochura informativa", "Desconto loja", "Vista premium"],
          exclusions: ["Champagne", "Fotografias profissionais", "Guia privado", "Transfer"]
        },
        {
          title: "Premium - Champagne Experience",
          description: "Experiência VIP com champagne e acesso exclusivo ao compartimento privado.",
          amount: 45.00,
          currency: "GBP",
          inclusions: ["Compartimento privado", "Taça de champagne", "Fast Track", "Fotografias", "Brinde especial"],
          exclusions: ["Transfer privado", "Jantar", "Múltiplas voltas", "Guia pessoal"]
        }
      ]
    },
    {
      activityTitle: "Torre de Londres - Fortaleza Histórica",
      proposals: [
        {
          title: "Econômico - Entrada Padrão",
          description: "Entrada geral para a Torre de Londres com acesso às principais atrações.",
          amount: 29.90,
          currency: "GBP",
          inclusions: ["Entrada geral", "Joias da Coroa", "White Tower", "Yeoman Warder tours", "Audioguia básico"],
          exclusions: ["Tours privados", "Experiências especiais", "Fotografias profissionais", "Souvenirs"]
        },
        {
          title: "Completo - Tour Histórico Guiado",
          description: "Tour completo com guia especializado e acesso a áreas especiais.",
          amount: 42.00,
          currency: "GBP",
          inclusions: ["Tour guiado", "Acesso especial", "História detalhada", "Mapa premium", "Beefeater interaction"],
          exclusions: ["Tour privado", "Alimentação", "Transfer", "Fotografias profissionais"]
        },
        {
          title: "Premium - Experiência VIP Completa",
          description: "Acesso VIP com tour privado e experiências exclusivas na Torre de Londres.",
          amount: 85.00,
          currency: "GBP",
          inclusions: ["Tour privado", "Acesso VIP", "Behind-the-scenes", "Fotografias incluídas", "Brinde exclusivo"],
          exclusions: ["Transfer privado", "Refeições", "Hospedagem", "Experiências noturnas"]
        }
      ]
    },
    {
      activityTitle: "Museu Britânico - Tesouros Mundiais",
      proposals: [
        {
          title: "Econômico - Entrada Gratuita",
          description: "Entrada gratuita para explorar as coleções permanentes do museu.",
          amount: 0.00,
          currency: "GBP",
          inclusions: ["Entrada gratuita", "Coleções permanentes", "Mapa básico", "WiFi", "Acesso geral"],
          exclusions: ["Audioguia", "Tours guiados", "Exposições especiais", "Workshops", "Souvenirs"]
        },
        {
          title: "Completo - Tour com Audioguia",
          description: "Experiência aprimorada com audioguia e acesso a exposições especiais.",
          amount: 7.00,
          currency: "GBP",
          inclusions: ["Audioguia multilíngue", "Highlights tour", "Mapa detalhado", "App móvel", "Dicas especiais"],
          exclusions: ["Tour privado", "Workshops", "Palestras", "Behind-the-scenes", "Certificado"]
        },
        {
          title: "Premium - Tour Privado Especializado",
          description: "Tour privado com curador especializado e acesso a áreas restritas.",
          amount: 150.00,
          currency: "GBP",
          inclusions: ["Tour privado", "Curador especializado", "Acesso restrito", "Certificado", "Behind-the-scenes"],
          exclusions: ["Transfer", "Refeições", "Hospedagem", "Múltiplas visitas", "Workshops externos"]
        }
      ]
    },
    {
      activityTitle: "West End - Teatro de Classe Mundial",
      proposals: [
        {
          title: "Econômico - Assentos Padrão",
          description: "Ingressos para assentos padrão em teatros do West End com boa visibilidade.",
          amount: 25.00,
          currency: "GBP",
          inclusions: ["Ingresso espetáculo", "Assento padrão", "Programa", "Acesso teatro", "Vista do palco"],
          exclusions: ["Assentos premium", "Bebidas", "Transfer", "Meet & greet", "Bastidores"]
        },
        {
          title: "Completo - Assentos Premium + Intervalo",
          description: "Assentos premium com bebida no intervalo e programa especial.",
          amount: 65.00,
          currency: "GBP",
          inclusions: ["Assentos premium", "Bebida intervalo", "Programa especial", "Vista excelente", "Prioridade entrada"],
          exclusions: ["Jantar", "Transfer", "Meet & greet", "Bastidores", "Fotografias"]
        },
        {
          title: "Premium - Experiência VIP Completa",
          description: "Experiência VIP com melhores assentos, jantar e encontro com elenco.",
          amount: 180.00,
          currency: "GBP",
          inclusions: ["Melhores assentos", "Jantar pré-show", "Meet & greet", "Bastidores", "Champagne", "Fotografias"],
          exclusions: ["Transfer privado", "Hospedagem", "Múltiplos shows", "Autógrafos garantidos"]
        }
      ]
    },
    {
      activityTitle: "Palácio de Buckingham - Residência Real",
      proposals: [
        {
          title: "Econômico - Evento Externo",
          description: "Assista à cerimônia da Troca da Guarda gratuitamente do lado externo.",
          amount: 0.00,
          currency: "GBP",
          inclusions: ["Troca da Guarda", "Vista externa", "Evento gratuito", "Atmosfera real", "Fotografias"],
          exclusions: ["Acesso interno", "Guia turístico", "State Rooms", "Jardins", "Audioguia"]
        },
        {
          title: "Completo - Tour Externo Guiado",
          description: "Tour guiado externo com contexto histórico e melhores pontos de vista.",
          amount: 25.00,
          currency: "GBP",
          inclusions: ["Tour externo", "Guia especializado", "Troca da Guarda", "História real", "Melhores vistas"],
          exclusions: ["Acesso interno", "State Rooms", "Jardins", "Alimentação", "Transfer"]
        },
        {
          title: "Premium - Tour Interno + State Rooms",
          description: "Tour interno exclusivo dos State Rooms com arte da Royal Collection (apenas verão).",
          amount: 30.00,
          currency: "GBP",
          inclusions: ["State Rooms", "Royal Collection", "Jardins", "Audioguia", "Acesso exclusivo"],
          exclusions: ["Quartos privados", "Transfer", "Alimentação", "Fotografias internas", "Tours privados"]
        }
      ]
    }
  ];

  try {
    console.log("🏰 Adicionando atividades de Londres...");

    // Insert London activities
    for (const activity of londonActivities) {
      try {
        const result = await db.insert(activities).values(activity);
        console.log(`✅ Atividade criada: ${activity.title}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Atividade já existe: ${activity.title}`);
        } else {
          console.error(`❌ Erro ao criar ${activity.title}:`, error.message);
        }
      }
    }

    // Insert budget proposals
    for (const budgetGroup of londonBudgetProposals) {
      const activity = await db.select()
        .from(activities)
        .where(sql`title = ${budgetGroup.activityTitle}`)
        .limit(1);

      if (activity.length > 0) {
        for (const proposal of budgetGroup.proposals) {
          try {
            await db.insert(activityBudgetProposals).values({
              activityId: activity[0].id,
              createdBy: 1,
              title: proposal.title,
              description: proposal.description,
              amount: proposal.amount.toString(),
              currency: proposal.currency,
              inclusions: JSON.stringify(proposal.inclusions),
              exclusions: JSON.stringify(proposal.exclusions),
              isActive: true
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
    return true;

  } catch (error) {
    console.error("❌ Erro geral:", error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateAllImportScripts().then(() => process.exit(0));
}

export { updateAllImportScripts };