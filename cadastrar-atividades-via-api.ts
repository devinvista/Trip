// Script para cadastrar atividades via API
const baseUrl = "http://localhost:5000";

// Primeiro, vou buscar os destinos disponíveis
const destinationsResponse = await fetch(`${baseUrl}/api/destinations`);
const destinations = await destinationsResponse.json();

console.log("Destinos disponíveis:", destinations);

// Atividades para Rio de Janeiro
const rioActivities = [
  {
    title: "Cristo Redentor / Corcovado",
    description: "Visita ao icônico Cristo Redentor no topo do Corcovado, uma das sete maravilhas do mundo moderno. Desfrute de vistas panorâmicas da cidade e baía de Guanabara.",
    category: "pontos_turisticos",
    duration: "3-4 horas",
    cover_image: "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
    images: ["https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
    propostas: [
      { title: "Econômico", price: 85, description: "Van oficial básica até o Cristo" },
      { title: "Completo", price: 160, description: "Trem panorâmico + entrada + guia" },
      { title: "Premium", price: 320, description: "Tour privativo com transporte executivo" }
    ]
  },
  {
    title: "Pão de Açúcar (Bondinho)",
    description: "Passeio no famoso bondinho do Pão de Açúcar com vistas espetaculares da cidade, baía e praias.",
    category: "pontos_turisticos",
    duration: "2-3 horas",
    cover_image: "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
    images: ["https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
    propostas: [
      { title: "Econômico", price: 120, description: "Ingresso padrão do bondinho" },
      { title: "Completo", price: 190, description: "Bondinho + guia turístico" },
      { title: "Premium", price: 350, description: "Bondinho + tour + passeio de helicóptero" }
    ]
  }
];

console.log("Iniciando cadastro de atividades...");

for (const activity of rioActivities) {
  try {
    // Encontrar o destino do Rio de Janeiro
    const rioDestination = destinations.find((d: any) => 
      d.name?.toLowerCase().includes("rio") || 
      d.city?.toLowerCase().includes("rio")
    );

    if (!rioDestination) {
      console.log("Destino Rio de Janeiro não encontrado");
      continue;
    }

    // Criar a atividade
    const activityData = {
      title: activity.title,
      description: activity.description,
      destination_id: rioDestination.id,
      category: activity.category,
      difficulty_level: "easy",
      duration: activity.duration,
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
      cover_image: activity.cover_image,
      images: activity.images,
      created_by_id: 9
    };

    console.log(`Cadastrando atividade: ${activity.title}`);
    console.log("Dados:", JSON.stringify(activityData, null, 2));

  } catch (error) {
    console.error(`Erro ao processar atividade ${activity.title}:`, error);
  }
}