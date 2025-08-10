import { db } from "./db";
import { activities, activityBudgetProposals, activityReviews, destinations } from "@shared/schema";
import { sql } from "drizzle-orm";

// Dados das atividades organizados por cidade
const atividadesPorCidade = {
  "Rio de Janeiro": [
    {
      title: "Cristo Redentor / Corcovado",
      description: "Visita ao icônico Cristo Redentor no topo do Corcovado, uma das sete maravilhas do mundo moderno. Desfrute de vistas panorâmicas da cidade e baía de Guanabara.",
      category: "pontos_turisticos" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1570715004781-d9c961ba4b22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 85, description: "Van oficial básica até o Cristo", inclusions: ["Transporte em van oficial", "Entrada no santuário"] },
        { title: "Completo", price: 160, description: "Trem panorâmico + entrada + guia", inclusions: ["Trem do Corcovado", "Entrada no santuário", "Guia turístico", "Seguro"] },
        { title: "Premium", price: 320, description: "Tour privativo com transporte executivo", inclusions: ["Transporte privativo", "Guia especializado", "Fotografias profissionais", "Lanche incluído"] }
      ]
    },
    {
      title: "Pão de Açúcar (Bondinho)",
      description: "Passeio no famoso bondinho do Pão de Açúcar com vistas espetaculares da cidade, baía e praias. Inclui parada na Urca e no topo do Pão de Açúcar.",
      category: "pontos_turisticos" as const,
      duration: "2-3 horas",
      cover_image: "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 120, description: "Ingresso padrão do bondinho", inclusions: ["Bondinho ida e volta", "Acesso aos mirantes"] },
        { title: "Completo", price: 190, description: "Bondinho + guia turístico", inclusions: ["Bondinho ida e volta", "Guia especializado", "História e curiosidades"] },
        { title: "Premium", price: 350, description: "Bondinho + tour + passeio de helicóptero", inclusions: ["Bondinho", "Guia VIP", "Sobrevoo de helicóptero", "Drinks no topo"] }
      ]
    },
    {
      title: "Praias de Copacabana e Ipanema + Esportes",
      description: "Experiência completa nas praias mais famosas do mundo. Atividades aquáticas, esportes na areia e cultura carioca.",
      category: "water_sports" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 0, description: "Acesso livre às praias", inclusions: ["Acesso livre", "Caminhada guiada", "Dicas locais"] },
        { title: "Completo", price: 100, description: "Aula de surf ou aluguel de bike", inclusions: ["Aula de surf (2h)", "Ou aluguel de bike", "Equipamentos incluídos"] },
        { title: "Premium", price: 300, description: "Passeio de lancha com drinks", inclusions: ["Passeio de lancha", "Open bar", "Petiscos", "Equipamentos aquáticos"] }
      ]
    },
    {
      title: "Trilha Pedra Bonita ou Dois Irmãos",
      description: "Trilhas com as melhores vistas panorâmicas do Rio. Ideal para amantes da natureza e fotografia.",
      category: "hiking" as const,
      duration: "4-6 horas",
      cover_image: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1624393188128-2e7e06c5b5e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 0, description: "Trilha autoguiada", inclusions: ["Mapa da trilha", "Dicas de segurança"] },
        { title: "Completo", price: 100, description: "Trilha com guia local", inclusions: ["Guia especializado", "Kit primeiros socorros", "Água"] },
        { title: "Premium", price: 280, description: "Tour privado com transporte", inclusions: ["Transporte ida/volta", "Guia fotógrafo", "Lanche trilheiro", "Seguro"] }
      ]
    },
    {
      title: "Tour Cultural Centro Histórico",
      description: "Descubra a história do Rio visitando o Theatro Municipal, Museu do Amanhã e outros pontos culturais importantes.",
      category: "cultural" as const,
      duration: "4-5 horas",
      cover_image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1586711980919-5d4bb5be2ecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 30, description: "Ingressos básicos", inclusions: ["Entrada museus", "Mapa autoguiado"] },
        { title: "Completo", price: 90, description: "Tour guiado + transporte", inclusions: ["Guia especializado", "Transporte", "Ingressos incluídos"] },
        { title: "Premium", price: 220, description: "Tour VIP + jantar + transporte executivo", inclusions: ["Guia VIP", "Transporte executivo", "Jantar típico", "Bebidas incluídas"] }
      ]
    }
  ],

  "São Paulo": [
    {
      title: "MASP + Avenida Paulista",
      description: "Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração cultural e financeiro da cidade.",
      category: "cultural" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 40, description: "Entrada simples no MASP", inclusions: ["Ingresso MASP", "Mapa da Paulista"] },
        { title: "Completo", price: 90, description: "Visita guiada + café", inclusions: ["Visita guiada", "Café incluso", "Material informativo"] },
        { title: "Premium", price: 250, description: "Tour + almoço em rooftop", inclusions: ["Tour VIP", "Almoço panorâmico", "Transporte", "Bebidas"] }
      ]
    },
    {
      title: "Parque Ibirapuera + Museus",
      description: "Explore o principal parque urbano de São Paulo e seus museus: MAM, Museu Afro Brasil e outros espaços culturais.",
      category: "cultural" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1542702200-c5b01e0c3ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 0, description: "Acesso livre ao parque", inclusions: ["Caminhada livre", "Mapa do parque"] },
        { title: "Completo", price: 70, description: "Bike + ingressos museus", inclusions: ["Aluguel de bike (4h)", "Ingressos museus", "Kit lanche"] },
        { title: "Premium", price: 180, description: "Tour guiado + transporte", inclusions: ["Guia especializado", "Transporte", "Todos os museus", "Almoço"] }
      ]
    },
    {
      title: "Mercado Municipal + Centro Histórico",
      description: "Degustação gastronômica no famoso Mercadão e tour pelo centro histórico de São Paulo.",
      category: "food_tours" as const,
      duration: "4-5 horas",
      cover_image: "https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 0, description: "Visita por conta própria", inclusions: ["Roteiro sugerido", "Dicas gastronômicas"] },
        { title: "Completo", price: 90, description: "Tour guiado com degustação", inclusions: ["Guia gastronômico", "Degustações incluídas", "História local"] },
        { title: "Premium", price: 240, description: "Tour gastronômico VIP + transporte", inclusions: ["Guia chef", "Degustações premium", "Transporte", "Bebidas harmonizadas"] }
      ]
    },
    {
      title: "Beco do Batman + Vila Madalena",
      description: "Tour pela arte urbana no famoso Beco do Batman e exploração do bairro boêmio da Vila Madalena.",
      category: "cultural" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1580651214613-ff345e7e3c0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 0, description: "Visita livre", inclusions: ["Acesso livre", "Mapa da região"] },
        { title: "Completo", price: 70, description: "Tour com artista de rua", inclusions: ["Guia artista local", "História do grafite", "Workshop básico"] },
        { title: "Premium", price: 220, description: "Tour artístico + bar temático", inclusions: ["Guia especializado", "Workshop avançado", "Drinks em bar temático", "Kit arte"] }
      ]
    },
    {
      title: "Noite em Rooftop / Jantar Gourmet",
      description: "Experiência gastronômica em rooftops com vista panorâmica da cidade e culinária de alta qualidade.",
      category: "food_tours" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1574096079513-d8259312b785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1574096079513-d8259312b785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1615719413546-198b25453f85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 50, description: "Entrada em bar", inclusions: ["Entrada bar/rooftop", "1 drink incluído"] },
        { title: "Completo", price: 150, description: "Drinks + petiscos", inclusions: ["2 drinks premium", "Petiscos gourmet", "Vista garantida"] },
        { title: "Premium", price: 400, description: "Jantar completo com vista", inclusions: ["Menu degustação", "Harmonização vinhos", "Mesa premium", "Transporte"] }
      ]
    }
  ],

  // Continuar com as outras cidades...
  "Foz do Iguaçu": [
    {
      title: "Cataratas do Iguaçu (lado brasileiro)",
      description: "Uma das mais impressionantes quedas d'água do mundo. Vista panorâmica das 275 quedas d'água na fronteira Brasil-Argentina.",
      category: "nature" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 85, description: "Entrada no parque nacional", inclusions: ["Entrada no parque", "Trilha das cataratas", "Transporte interno"] },
        { title: "Completo", price: 160, description: "Parque + transporte", inclusions: ["Entrada parque", "Transporte hotel-parque", "Guia básico"] },
        { title: "Premium", price: 350, description: "Tour completo + Macuco Safari", inclusions: ["Entrada parque", "Macuco Safari", "Almoço", "Transporte", "Guia especializado"] }
      ]
    },
    {
      title: "Parque das Aves",
      description: "Santuário de aves da Mata Atlântica com mais de 1.320 aves de 143 espécies. Experiência imersiva única na América Latina.",
      category: "wildlife" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1574263867128-ba1b540c5dd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1574263867128-ba1b540c5dd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1603112356844-8b4b5d5c7362?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { title: "Econômico", price: 90, description: "Ingresso padrão", inclusions: ["Entrada no parque", "Trilhas livres", "Mapa do local"] },
        { title: "Completo", price: 140, description: "Ingresso + traslado", inclusions: ["Entrada", "Transporte hotel-parque", "Audio guide"] },
        { title: "Premium", price: 250, description: "Visita guiada + bastidores", inclusions: ["Entrada VIP", "Tour dos bastidores", "Encontro com tratadores", "Transporte"] }
      ]
    }
  ]
};

// Dados dos reviews
const reviewsExemplo = [
  {
    rating: 5,
    review: "Experiência incrível! Vale muito a pena, vista espetacular e atendimento excelente.",
    photos: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
    visit_date: new Date("2024-12-15"),
  },
  {
    rating: 4,
    review: "Muito bom! A única observação é que estava bem cheio, mas mesmo assim recomendo.",
    photos: [],
    visit_date: new Date("2024-12-10"),
  },
  {
    rating: 5,
    review: "Perfeito! Superou todas as expectativas. O guia foi muito atencioso e conhecia bem a história local.",
    photos: ["https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
    visit_date: new Date("2024-12-08"),
  }
];

async function cadastrarAtividades() {
  try {
    console.log("🏃‍♂️ Iniciando cadastro de atividades...");

    // Buscar destinos existentes
    const destinos = await db.select().from(destinations);
    console.log(`📍 Encontrados ${destinos.length} destinos ativos`);

    let totalAtividades = 0;
    let totalPropostas = 0;
    let totalReviews = 0;

    for (const [nomeCidade, atividades] of Object.entries(atividadesPorCidade)) {
      console.log(`\n🏙️ Processando ${nomeCidade}...`);
      
      // Encontrar o destino correspondente
      const destino = destinos.find(d => 
        d.name?.toLowerCase().includes(nomeCidade.toLowerCase()) ||
        (nomeCidade === "Rio de Janeiro" && d.name?.toLowerCase().includes("rio")) ||
        (nomeCidade === "São Paulo" && d.name?.toLowerCase().includes("são paulo")) ||
        (nomeCidade === "Foz do Iguaçu" && d.name?.toLowerCase().includes("foz"))
      );

      if (!destino) {
        console.log(`❌ Destino não encontrado para ${nomeCidade}`);
        continue;
      }

      console.log(`✅ Destino encontrado: ${destino.name} (ID: ${destino.id})`);

      for (const atividade of atividades) {
        try {
          // Inserir atividade
          const [atividadeInserida] = await db.insert(activities).values({
            title: atividade.title,
            description: atividade.description,
            destination_id: destino.id,
            category: atividade.category,
            difficulty_level: "easy",
            duration: atividade.duration,
            min_participants: 1,
            max_participants: 20,
            languages: ["Português", "Inglês"],
            inclusions: ["Acompanhamento profissional", "Seguro básico"],
            exclusions: ["Alimentação", "Transporte pessoal"],
            requirements: ["Idade mínima: 12 anos"],
            cancellation_policy: "Cancelamento gratuito até 24h antes",
            contact_info: {
              email: "contato@partiutrip.com",
              phone: "+55 11 99999-9999",
              whatsapp: "+55 11 99999-9999"
            },
            cover_image: atividade.cover_image,
            images: atividade.images,
            created_by_id: 9, // Usando o usuário admin tom
            is_active: true,
            // Campos herdados do destino
            destination_name: destino.name,
            city: destino.name, // destinations não tem campo city separado
            state: destino.state,
            country: destino.country,
            country_type: destino.country_type as "nacional" | "internacional",
            region: destino.region,
            continent: destino.continent
          }).returning();

          console.log(`  ✅ Atividade inserida: ${atividade.title} (ID: ${atividadeInserida.id})`);
          totalAtividades++;

          // Inserir propostas de orçamento
          for (const proposta of atividade.propostas) {
            await db.insert(activityBudgetProposals).values({
              activity_id: atividadeInserida.id,
              created_by: 9,
              title: proposta.title,
              description: proposta.description,
              price_type: "per_person",
              amount: proposta.price.toString(),
              currency: "BRL",
              inclusions: proposta.inclusions,
              exclusions: ["Despesas pessoais", "Gorjetas"],
              is_active: true,
              votes: Math.floor(Math.random() * 50) + 10 // 10-60 votos aleatórios
            });
            totalPropostas++;
          }

          // Inserir reviews de exemplo
          for (const review of reviewsExemplo) {
            await db.insert(activityReviews).values({
              activity_id: atividadeInserida.id,
              user_id: 9, // Usuário tom
              rating: review.rating,
              review: review.review,
              photos: review.photos,
              visit_date: review.visit_date,
              helpful_votes: Math.floor(Math.random() * 15) + 1,
              is_verified: true
            });
            totalReviews++;
          }

          // Atualizar contadores da atividade usando eq
          await db.update(activities)
            .set({
              average_rating: "4.7",
              total_ratings: 3
            })
            .where(sql`id = ${atividadeInserida.id}`);

        } catch (error) {
          console.error(`❌ Erro ao inserir atividade ${atividade.title}:`, error);
        }
      }
    }

    console.log(`\n🎉 Cadastro concluído!`);
    console.log(`📊 Resumo:`);
    console.log(`   • ${totalAtividades} atividades cadastradas`);
    console.log(`   • ${totalPropostas} propostas de orçamento criadas`);
    console.log(`   • ${totalReviews} reviews adicionados`);

  } catch (error) {
    console.error("❌ Erro durante o cadastro:", error);
  }
}

// Executar o script
cadastrarAtividades();