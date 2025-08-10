import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { activities, activityBudgetProposals, activityReviews, destinations } from "@shared/schema";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

// Usar a mesma configuração do servidor que já está funcionando
import { db } from "./db";
import { sql as drizzleSql } from "drizzle-orm";

// Dados das atividades organizados por destino
const atividadesPorDestino = {
  "Rio de Janeiro": [
    {
      title: "Cristo Redentor / Corcovado",
      description: "Visita ao icônico Cristo Redentor no topo do Corcovado, uma das sete maravilhas do mundo moderno. Desfrute de vistas panorâmicas espetaculares da cidade e baía de Guanabara.",
      category: "pontos_turisticos" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1570715004781-d9c961ba4b22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 85, 
          description: "Van oficial básica até o Cristo Redentor", 
          inclusions: ["Transporte em van oficial", "Entrada no santuário", "Seguro básico"] 
        },
        { 
          title: "Completo", 
          price: 160, 
          description: "Trem panorâmico + entrada + guia turístico", 
          inclusions: ["Trem do Corcovado", "Entrada no santuário", "Guia turístico certificado", "Seguro completo"] 
        },
        { 
          title: "Premium", 
          price: 320, 
          description: "Tour privativo com transporte executivo", 
          inclusions: ["Transporte privativo", "Guia especializado", "Fotografias profissionais", "Lanche gourmet", "Acesso VIP"] 
        }
      ]
    },
    {
      title: "Pão de Açúcar (Bondinho)",
      description: "Passeio no famoso bondinho do Pão de Açúcar com vistas espetaculares de 360° da cidade, baía de Guanabara e praias. Inclui parada na Urca e no topo do Pão de Açúcar.",
      category: "pontos_turisticos" as const,
      duration: "2-3 horas",
      cover_image: "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 120, 
          description: "Ingresso padrão do bondinho", 
          inclusions: ["Bondinho ida e volta", "Acesso aos mirantes", "Mapa turístico"] 
        },
        { 
          title: "Completo", 
          price: 190, 
          description: "Bondinho + guia turístico especializado", 
          inclusions: ["Bondinho ida e volta", "Guia especializado", "História e curiosidades", "Kit fotográfico"] 
        },
        { 
          title: "Premium", 
          price: 350, 
          description: "Bondinho + tour + passeio de helicóptero", 
          inclusions: ["Bondinho", "Guia VIP", "Sobrevoo de helicóptero (15min)", "Drinks premium no topo", "Certificado da experiência"] 
        }
      ]
    },
    {
      title: "Praias de Copacabana e Ipanema + Esportes",
      description: "Experiência completa nas praias mais famosas do mundo. Atividades aquáticas, esportes na areia, cultura carioca e o melhor do estilo de vida da Cidade Maravilhosa.",
      category: "water_sports" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 0, 
          description: "Acesso livre às praias com caminhada guiada", 
          inclusions: ["Acesso livre às praias", "Caminhada guiada", "Dicas locais", "Mapa das praias"] 
        },
        { 
          title: "Completo", 
          price: 100, 
          description: "Aula de surf ou aluguel de bike + equipamentos", 
          inclusions: ["Aula de surf (2h) OU aluguel de bike", "Equipamentos incluídos", "Instrutor certificado", "Água e lanche"] 
        },
        { 
          title: "Premium", 
          price: 300, 
          description: "Passeio de lancha com open bar e atividades", 
          inclusions: ["Passeio de lancha (3h)", "Open bar premium", "Petiscos gourmet", "Equipamentos aquáticos", "Música ambiente"] 
        }
      ]
    },
    {
      title: "Trilha Pedra Bonita ou Dois Irmãos",
      description: "Trilhas com as melhores vistas panorâmicas do Rio de Janeiro. Ideal para amantes da natureza, fotografia e aventura. Diferentes níveis de dificuldade disponíveis.",
      category: "hiking" as const,
      duration: "4-6 horas",
      cover_image: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1624393188128-2e7e06c5b5e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 0, 
          description: "Trilha autoguiada com mapa e dicas", 
          inclusions: ["Mapa detalhado da trilha", "Dicas de segurança", "Lista de equipamentos", "Contato de emergência"] 
        },
        { 
          title: "Completo", 
          price: 100, 
          description: "Trilha com guia local experiente", 
          inclusions: ["Guia especializado", "Kit primeiros socorros", "Água mineral", "Bastões de caminhada", "Certificado de conclusão"] 
        },
        { 
          title: "Premium", 
          price: 280, 
          description: "Tour privado com transporte e fotógrafo", 
          inclusions: ["Transporte ida/volta", "Guia fotógrafo profissional", "Lanche trilheiro premium", "Seguro aventura", "Fotos editadas"] 
        }
      ]
    },
    {
      title: "Tour Cultural Centro Histórico",
      description: "Descubra a rica história do Rio visitando o Theatro Municipal, Museu do Amanhã, Centro Cultural dos Correios e outros marcos culturais. Mergulhe na cultura carioca.",
      category: "cultural" as const,
      duration: "4-5 horas",
      cover_image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1586711980919-5d4bb5be2ecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 30, 
          description: "Ingressos básicos com mapa autoguiado", 
          inclusions: ["Entrada nos principais museus", "Mapa autoguiado", "Lista de pontos turísticos"] 
        },
        { 
          title: "Completo", 
          price: 90, 
          description: "Tour guiado + transporte público", 
          inclusions: ["Guia especializado em história", "Transporte público incluído", "Ingressos incluídos", "Material educativo"] 
        },
        { 
          title: "Premium", 
          price: 220, 
          description: "Tour VIP + jantar + transporte executivo", 
          inclusions: ["Guia VIP", "Transporte executivo", "Jantar típico no centro", "Bebidas incluídas", "Acesso a áreas restritas"] 
        }
      ]
    }
  ],

  "São Paulo": [
    {
      title: "MASP + Avenida Paulista",
      description: "Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração cultural e financeiro da maior metrópole da América do Sul. Arte, cultura e arquitetura.",
      category: "cultural" as const,
      duration: "3-4 horas",
      cover_image: "https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 40, 
          description: "Entrada simples no MASP + mapa da Paulista", 
          inclusions: ["Ingresso MASP", "Mapa da Avenida Paulista", "Roteiro autoguiado"] 
        },
        { 
          title: "Completo", 
          price: 90, 
          description: "Visita guiada + café com vista", 
          inclusions: ["Visita guiada especializada", "Café com vista na Paulista", "Material informativo", "Transporte público"] 
        },
        { 
          title: "Premium", 
          price: 250, 
          description: "Tour VIP + almoço em rooftop panorâmico", 
          inclusions: ["Tour VIP exclusivo", "Almoço panorâmico em rooftop", "Transporte executivo", "Bebidas premium", "Acesso a coleções especiais"] 
        }
      ]
    },
    {
      title: "Parque Ibirapuera + Museus",
      description: "Explore o principal parque urbano de São Paulo e seus renomados museus: MAM, Museu Afro Brasil, Oca e outros espaços culturais em meio à natureza da cidade.",
      category: "cultural" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1542702200-c5b01e0c3ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 0, 
          description: "Acesso livre ao parque com mapa", 
          inclusions: ["Caminhada livre pelo parque", "Mapa detalhado", "Roteiro dos museus"] 
        },
        { 
          title: "Completo", 
          price: 70, 
          description: "Bike + ingressos museus + kit lanche", 
          inclusions: ["Aluguel de bike (4h)", "Ingressos para 3 museus", "Kit lanche", "Capacete e segurança"] 
        },
        { 
          title: "Premium", 
          price: 180, 
          description: "Tour guiado completo + transporte + almoço", 
          inclusions: ["Guia especializado", "Transporte confortável", "Todos os museus incluídos", "Almoço no parque", "Material educativo"] 
        }
      ]
    }
  ],

  "Foz do Iguaçu": [
    {
      title: "Cataratas do Iguaçu (lado brasileiro)",
      description: "Uma das mais impressionantes quedas d'água do mundo com 275 quedas d'água na fronteira Brasil-Argentina. Patrimônio Mundial da UNESCO e espetáculo natural único.",
      category: "nature" as const,
      duration: "Dia inteiro",
      cover_image: "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
      images: [
        "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"
      ],
      propostas: [
        { 
          title: "Econômico", 
          price: 85, 
          description: "Entrada no parque nacional", 
          inclusions: ["Entrada no Parque Nacional", "Trilha das Cataratas", "Transporte interno gratuito", "Mapa do parque"] 
        },
        { 
          title: "Completo", 
          price: 160, 
          description: "Parque + transporte hotel + guia", 
          inclusions: ["Entrada no parque", "Transporte hotel-parque", "Guia básico", "Lanche incluído"] 
        },
        { 
          title: "Premium", 
          price: 350, 
          description: "Tour completo + Macuco Safari + almoço", 
          inclusions: ["Entrada no parque", "Macuco Safari aventura", "Almoço no parque", "Transporte executivo", "Guia especializado", "Fotos profissionais"] 
        }
      ]
    }
  ]
};

// Dados de reviews exemplo para cada atividade
const reviewsExemplo = [
  {
    rating: 5,
    review: "Experiência incrível! Vista espetacular e atendimento excepcional. Vale muito a pena e recomendo para todos que visitarem.",
    photos: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
    visit_date: new Date("2024-12-15"),
  },
  {
    rating: 4,
    review: "Muito bom! A única observação é que estava bem cheio, mas mesmo assim a experiência foi fantástica e vale a pena.",
    photos: [],
    visit_date: new Date("2024-12-10"),
  },
  {
    rating: 5,
    review: "Perfeito! Superou todas as expectativas. O guia foi muito atencioso e conhecia bem a história local. Voltarei com certeza!",
    photos: ["https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
    visit_date: new Date("2024-12-08"),
  }
];

async function cadastrarAtividades() {
  try {
    console.log("🏃‍♂️ Iniciando cadastro completo de atividades...");

    // Buscar destinos existentes
    const destinos = await db.select().from(destinations);
    console.log(`📍 Encontrados ${destinos.length} destinos disponíveis`);

    let totalAtividades = 0;
    let totalPropostas = 0;
    let totalReviews = 0;

    for (const [nomeDestino, atividades] of Object.entries(atividadesPorDestino)) {
      console.log(`\n🏙️ Processando ${nomeDestino}...`);
      
      // Encontrar o destino correspondente
      const destino = destinos.find(d => 
        d.name?.toLowerCase().includes(nomeDestino.toLowerCase()) ||
        (nomeDestino === "Rio de Janeiro" && d.name?.toLowerCase().includes("rio")) ||
        (nomeDestino === "São Paulo" && d.name?.toLowerCase().includes("são paulo")) ||
        (nomeDestino === "Foz do Iguaçu" && d.name?.toLowerCase().includes("foz"))
      );

      if (!destino) {
        console.log(`❌ Destino não encontrado para ${nomeDestino}`);
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
            languages: ["Português", "Inglês", "Espanhol"],
            inclusions: ["Acompanhamento profissional", "Seguro básico", "Suporte 24h"],
            exclusions: ["Alimentação (quando não especificada)", "Transporte pessoal", "Despesas pessoais"],
            requirements: ["Idade mínima: 12 anos", "Condição física adequada"],
            cancellation_policy: "Cancelamento gratuito até 24h antes da atividade. Reembolso de 50% até 12h antes.",
            contact_info: {
              email: "atividades@partiutrip.com",
              phone: "+55 11 99999-8888",
              whatsapp: "+55 11 99999-8888",
              website: "https://partiutrip.com"
            },
            cover_image: atividade.cover_image,
            images: atividade.images,
            created_by_id: 9, // Usuário tom
            is_active: true,
            // Campos herdados do destino
            destination_name: destino.name,
            city: destino.name,
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
              exclusions: ["Despesas pessoais", "Gorjetas", "Itens não mencionados"],
              is_active: true,
              votes: Math.floor(Math.random() * 50) + 15 // 15-65 votos aleatórios
            });
            console.log(`    💰 Proposta criada: ${proposta.title} - R$ ${proposta.price}`);
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
              helpful_votes: Math.floor(Math.random() * 20) + 5,
              is_verified: true
            });
            totalReviews++;
          }
          console.log(`    ⭐ ${reviewsExemplo.length} reviews adicionados`);

          // Atualizar contadores da atividade
          await db.update(activities)
            .set({
              average_rating: "4.7",
              total_ratings: reviewsExemplo.length
            })
            .where(eq(activities.id, atividadeInserida.id));

        } catch (error) {
          console.error(`❌ Erro ao inserir atividade ${atividade.title}:`, error);
        }
      }
    }

    console.log(`\n🎉 Cadastro concluído com sucesso!`);
    console.log(`📊 Resumo final:`);
    console.log(`   • ${totalAtividades} atividades cadastradas`);
    console.log(`   • ${totalPropostas} propostas de orçamento criadas`);
    console.log(`   • ${totalReviews} reviews adicionados`);
    console.log(`   • Média de ${(totalPropostas/totalAtividades).toFixed(1)} propostas por atividade`);

  } catch (error) {
    console.error("❌ Erro durante o cadastro:", error);
  }
}

// Executar o script
if (require.main === module) {
  cadastrarAtividades();
}

export { cadastrarAtividades };