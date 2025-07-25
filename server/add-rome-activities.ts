import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";
import { sql } from "drizzle-orm";

// Script to add Rome activities with authentic details and budget proposals
async function addRomeActivities() {
  console.log("🏛️ Adicionando atividades de Roma com detalhes autênticos...");
  
  const romeActivities = [
    {
      title: "Coliseu - Anfiteatro Romano",
      description: "Explore o maior anfiteatro do mundo e símbolo do Império Romano! O Coliseu, construído em 72-80 d.C., abrigava combates de gladiadores e espetáculos para até 50.000 espectadores. Descubra a engenharia romana avançada, os subterrâneos onde ficavam feras e gladiadores, e reviva a história épica dos jogos romanos. Patrimônio Mundial da UNESCO e uma das Sete Maravilhas do Mundo Moderno.",
      location: "Roma, Itália",
      category: "culture",
      city: "Roma",
      countryType: "internacional",
      region: "Europa Meridional",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Italiano", "Inglês", "Espanhol", "Francês", "Alemão", "Português"]),
      inclusions: JSON.stringify(["Entrada no Coliseu", "Acesso ao Fórum Romano", "Palatino Hill", "Audioguia"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Acesso à arena", "Subterrâneos"]),
      requirements: JSON.stringify(["Documento de identidade", "Chegada pontual", "Calçado confortável", "Protetor solar"]),
      cancellation_policy: "Cancelamento gratuito até 24h antes da visita",
      contact_info: JSON.stringify({
        phone: "+39 06 3996 7700",
        email: "pa-colosseo@cultura.gov.it",
        website: "https://colosseo.it",
        address: "Piazza del Colosseo, 1, 00184 Roma RM"
      }),
      coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
        "https://images.unsplash.com/photo-1539650116574-75c0c6d47324?w=800&q=80",
        "https://images.unsplash.com/photo-1544431369-dccdb9dc8c16?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Vaticano e Basílica de São Pedro",
      description: "Visite o menor país do mundo e o coração da Igreja Católica! Os Museus Vaticanos abrigam uma das maiores coleções de arte do mundo, incluindo a Capela Sistina com os afrescos de Michelangelo. A Basílica de São Pedro impressiona com sua arquitetura renascentista e barroca, a Pietà de Michelangelo e a cúpula projetada pelo mesmo artista. Uma experiência espiritual e artística única.",
      location: "Roma, Itália",
      category: "culture",
      city: "Roma",
      countryType: "internacional",
      region: "Europa Meridional",
      priceType: "per_person",
      priceAmount: null,
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 40,
      languages: JSON.stringify(["Italiano", "Inglês", "Espanhol", "Francês", "Alemão", "Português"]),
      inclusions: JSON.stringify(["Entrada nos Museus Vaticanos", "Capela Sistina", "Basílica de São Pedro", "Audioguia"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Acesso à cúpula", "Jardins Vaticanos"]),
      requirements: JSON.stringify(["Vestuário adequado", "Ombros e joelhos cobertos", "Silêncio na Capela Sistina", "Documento de identidade"]),
      cancellation_policy: "Cancelamento gratuito até 24h antes da visita",
      contact_info: JSON.stringify({
        phone: "+39 06 6988 4676",
        email: "info@museivaticani.va",
        website: "https://www.museivaticani.va",
        address: "Viale Vaticano, 00165 Roma RM"
      }),
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
        "https://images.unsplash.com/photo-1591194658578-1b4c1e4c4b7c?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Fontana di Trevi e Centro Histórico",
      description: "Descubra as maravilhas do centro histórico de Roma! A icônica Fontana di Trevi, obra-prima barroca de Nicola Salvi, é famosa pela tradição de jogar moedas para garantir o retorno à Cidade Eterna. Explore o Pantheon, a Piazza Navona com suas fontes de Bernini, o Campo de' Fiori e as ruas medievais repletas de história. Uma jornada através de 2.000 anos de civilização romana.",
      location: "Roma, Itália",
      category: "sightseeing",
      city: "Roma",
      countryType: "internacional",
      region: "Europa Meridional",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 30,
      languages: JSON.stringify(["Italiano", "Inglês", "Espanhol", "Francês", "Alemão", "Português"]),
      inclusions: JSON.stringify(["Fontana di Trevi", "Pantheon", "Piazza Navona", "Campo de' Fiori", "Centro histórico"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Guia turístico", "Entradas em monumentos"]),
      requirements: JSON.stringify(["Calçado confortável", "Água", "Protetor solar", "Moedas para a fonte"]),
      cancellation_policy: "Passeio ao ar livre - sem necessidade de cancelamento",
      contact_info: JSON.stringify({
        phone: "+39 06 0608",
        email: "info@turismoroma.it",
        website: "https://www.turismoroma.it",
        address: "Centro Storico, Roma RM"
      }),
      coverImage: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
        "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Panteão de Roma - Templo dos Deuses",
      description: "Admire a maior maravilha arquitetônica da Roma Antiga! O Panteão, construído em 126 d.C. pelo imperador Adriano, mantém-se como o edifício romano mais bem preservado do mundo. Sua cúpula impressionante com óculo central é uma obra-prima da engenharia que inspirou arquitetos por séculos. Hoje funciona como igreja e abriga os túmulos de Rafael e dos reis da Itália.",
      location: "Roma, Itália",
      category: "culture",
      city: "Roma",
      countryType: "internacional",
      region: "Europa Meridional",
      priceType: "per_person",
      priceAmount: null,
      duration: "1-2 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      languages: JSON.stringify(["Italiano", "Inglês", "Espanhol", "Francês", "Alemão", "Português"]),
      inclusions: JSON.stringify(["Entrada no Panteão", "Arquitetura romana", "Túmulo de Rafael", "Cúpula histórica"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Guia turístico", "Audioguia"]),
      requirements: JSON.stringify(["Vestuário adequado", "Silêncio no interior", "Respeito ao local sagrado"]),
      cancellation_policy: "Entrada gratuita - sem necessidade de cancelamento",
      contact_info: JSON.stringify({
        phone: "+39 06 6830 0230",
        email: "info@pantheonroma.com",
        website: "https://www.pantheonroma.com",
        address: "Piazza della Rotonda, 00186 Roma RM"
      }),
      coverImage: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&q=80",
        "https://images.unsplash.com/photo-1539650116574-75c0c6d47324?w=800&q=80",
        "https://images.unsplash.com/photo-1544431369-dccdb9dc8c16?w=800&q=80"
      ]),
      createdById: 1
    },
    {
      title: "Trastevere - Bairro Boêmio Autêntico",
      description: "Mergulhe na alma autêntica de Roma no charmoso bairro de Trastevere! Este bairro medieval mantém o espírito da Roma tradicional com suas ruas de paralelepípedos, trattorias familiares, vinhos locais e vida noturna vibrante. Explore a Basilica di Santa Maria in Trastevere, desfrute da gastronomia romana em osterie centenárias e viva como um verdadeiro romano neste refúgio boêmio.",
      location: "Roma, Itália",
      category: "food_tours",
      city: "Roma",
      countryType: "internacional",
      region: "Europa Meridional",
      priceType: "per_person",
      priceAmount: null,
      duration: "2-4 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 20,
      languages: JSON.stringify(["Italiano", "Inglês", "Espanhol", "Francês", "Alemão", "Português"]),
      inclusions: JSON.stringify(["Passeio pelo bairro", "Ruas históricas", "Basilica di Santa Maria", "Atmosfera autêntica"]),
      exclusions: JSON.stringify(["Transporte", "Alimentação", "Bebidas", "Guia turístico"]),
      requirements: JSON.stringify(["Calçado confortável", "Vestuário casual", "Disposição para caminhar"]),
      cancellation_policy: "Passeio ao ar livre - sem necessidade de cancelamento",
      contact_info: JSON.stringify({
        phone: "+39 06 0608",
        email: "info@trastevereroma.it",
        website: "https://www.trastevereroma.it",
        address: "Trastevere, Roma RM"
      }),
      coverImage: "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544133503-59b8e7e58e32?w=800&q=80",
        "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80"
      ]),
      createdById: 1
    }
  ];

  // Budget proposals for each activity
  const budgetProposals = [
    // Coliseu proposals
    {
      activityTitle: "Coliseu - Anfiteatro Romano",
      proposals: [
        {
          title: "Econômico - Entrada Padrão",
          description: "Entrada básica com acesso ao Coliseu, Fórum Romano e Palatino Hill.",
          amount: "16.00",
          inclusions: ["Entrada no Coliseu", "Fórum Romano", "Palatino Hill", "Audioguia básico"],
          exclusions: ["Tour guiado", "Acesso à arena", "Subterrâneos", "Evite filas"]
        },
        {
          title: "Completo - Tour Guiado em Grupo",
          description: "Tour em grupo com guia especializado cobrindo história e arquitetura romana.",
          amount: "40.00",
          inclusions: ["Tour guiado 2h", "Entrada completa", "Guia especializado", "Grupo pequeno"],
          exclusions: ["Tour privado", "Acesso VIP", "Alimentação", "Transporte"]
        },
        {
          title: "Premium - Tour Privativo + Acesso Exclusivo",
          description: "Tour privativo com acesso à arena e subterrâneos. Experiência VIP completa.",
          amount: "150.00",
          inclusions: ["Tour privado", "Acesso à arena", "Subterrâneos", "Guia especializado", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]
        }
      ]
    },
    // Vaticano proposals
    {
      activityTitle: "Vaticano e Basílica de São Pedro",
      proposals: [
        {
          title: "Econômico - Entrada Simples",
          description: "Entrada básica nos Museus Vaticanos e Basílica de São Pedro.",
          amount: "17.00",
          inclusions: ["Museus Vaticanos", "Capela Sistina", "Basílica de São Pedro", "Audioguia"],
          exclusions: ["Tour guiado", "Acesso à cúpula", "Jardins Vaticanos", "Evite filas"]
        },
        {
          title: "Completo - Tour com Museus",
          description: "Tour completo com guia especializado cobrindo arte e história vaticana.",
          amount: "50.00",
          inclusions: ["Tour guiado 3h", "Museus completos", "Capela Sistina", "Guia especializado"],
          exclusions: ["Acesso à cúpula", "Tour privado", "Jardins", "Alimentação"]
        },
        {
          title: "Premium - Tour VIP + Cúpula",
          description: "Tour VIP com acesso à cúpula de São Pedro e jardins exclusivos.",
          amount: "120.00",
          inclusions: ["Tour VIP", "Acesso à cúpula", "Jardins Vaticanos", "Guia especializado", "Evite filas"],
          exclusions: ["Transporte", "Alimentação", "Fotografias", "Souvenirs"]
        }
      ]
    },
    // Fontana di Trevi proposals
    {
      activityTitle: "Fontana di Trevi e Centro Histórico",
      proposals: [
        {
          title: "Econômico - Passeio Livre",
          description: "Explore o centro histórico por conta própria. Acesso gratuito a todos os locais.",
          amount: "0.00",
          inclusions: ["Acesso livre", "Fontana di Trevi", "Pantheon", "Piazza Navona", "Ruas históricas"],
          exclusions: ["Guia turístico", "Transporte", "Alimentação", "Entradas pagas"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado pelo centro histórico com contexto histórico e cultural.",
          amount: "30.00",
          inclusions: ["Tour guiado 2h", "Fontana di Trevi", "Pantheon", "Piazza Navona", "Histórias locais"],
          exclusions: ["Alimentação", "Transporte", "Entradas pagas", "Souvenirs"]
        },
        {
          title: "Premium - Tour Privativo + Jantar",
          description: "Tour privativo com jantar tradicional romano em restaurante histórico.",
          amount: "100.00",
          inclusions: ["Tour privado", "Guia especializado", "Jantar típico", "Vinho local", "Restaurante histórico"],
          exclusions: ["Transporte", "Bebidas extras", "Gorjetas", "Sobremesas especiais"]
        }
      ]
    },
    // Panteão proposals
    {
      activityTitle: "Panteão de Roma - Templo dos Deuses",
      proposals: [
        {
          title: "Econômico - Entrada Gratuita",
          description: "Entrada gratuita para admirar a arquitetura romana por conta própria.",
          amount: "0.00",
          inclusions: ["Entrada gratuita", "Arquitetura romana", "Túmulo de Rafael", "Cúpula histórica"],
          exclusions: ["Guia turístico", "Audioguia", "Transporte", "Alimentação"]
        },
        {
          title: "Completo - Tour Guiado",
          description: "Tour guiado com explicações sobre arquitetura e história romana.",
          amount: "20.00",
          inclusions: ["Tour guiado 1h", "História romana", "Arquitetura", "Guia especializado"],
          exclusions: ["Transporte", "Alimentação", "Audioguia pessoal", "Souvenirs"]
        },
        {
          title: "Premium - Tour Exclusivo",
          description: "Tour exclusivo com arqueólogo especializado em Roma Antiga.",
          amount: "80.00",
          inclusions: ["Tour exclusivo", "Arqueólogo especializado", "Grupo pequeno", "Detalhes técnicos"],
          exclusions: ["Transporte", "Alimentação", "Fotografias profissionais", "Souvenirs"]
        }
      ]
    },
    // Trastevere proposals
    {
      activityTitle: "Trastevere - Bairro Boêmio Autêntico",
      proposals: [
        {
          title: "Econômico - Passeio Livre",
          description: "Explore o bairro boêmio por conta própria. Acesso gratuito às ruas históricas.",
          amount: "0.00",
          inclusions: ["Passeio livre", "Ruas históricas", "Basilica di Santa Maria", "Atmosfera autêntica"],
          exclusions: ["Guia turístico", "Alimentação", "Bebidas", "Transporte"]
        },
        {
          title: "Completo - Tour Gastronômico",
          description: "Tour gastronômico com degustações em trattorias tradicionais.",
          amount: "50.00",
          inclusions: ["Tour gastronômico", "Degustações", "Trattorias tradicionais", "Vinhos locais", "Guia local"],
          exclusions: ["Refeição completa", "Transporte", "Bebidas extras", "Gorjetas"]
        },
        {
          title: "Premium - Tour Privado + Jantar Gourmet",
          description: "Tour privado com jantar gourmet em restaurante exclusivo de Trastevere.",
          amount: "120.00",
          inclusions: ["Tour privado", "Jantar gourmet", "Restaurante exclusivo", "Vinho premium", "Guia especializado"],
          exclusions: ["Transporte", "Bebidas extras", "Gorjetas", "Sobremesas especiais"]
        }
      ]
    }
  ];

  try {
    // Insert activities first
    for (const activity of romeActivities) {
      try {
        const [insertedActivity] = await db.insert(activities).values({
          ...activity,
          isActive: true,
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
              currency: "EUR",
              inclusions: JSON.stringify(proposal.inclusions),
              exclusions: JSON.stringify(proposal.exclusions),
              isActive: true,
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

    console.log("🎉 Atividades de Roma criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Execute the function
addRomeActivities().catch(console.error);