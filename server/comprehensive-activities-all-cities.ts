import { db } from './db.js';
import { activities, activityBudgetProposals, popularDestinations } from '../shared/schema.js';

// Get all destination cities from the schema
const allCities = Object.keys(popularDestinations);

// Comprehensive activities data for ALL cities in the registry
const allCitiesActivities = [
  // RIO DE JANEIRO, RJ - Already created, keeping for reference
  {
    location: "Rio de Janeiro, RJ",
    activities: [
      {
        title: "Cristo Redentor e Trem do Corcovado",
        description: "Visite uma das Sete Maravilhas do Mundo Moderno! O Cristo Redentor é o símbolo mais famoso do Rio de Janeiro. O passeio inclui transporte pelo histórico Trem do Corcovado através da Floresta da Tijuca até o topo do Corcovado.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 80-120",
        inclusions: ["Transporte de trem", "Guia credenciado", "Acesso aos mirantes", "Seguro"],
        exclusions: ["Alimentação", "Bebidas", "Compras pessoais"],
        languages: ["Português", "Inglês", "Espanhol"],
        requirements: ["Usar sapatos confortáveis", "Levar protetor solar", "Documentos com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Trem do Corcovado: (21) 2558-1329",
        bookingUrl: "https://www.tremdocorcovado.rio"
      },
      {
        title: "Pão de Açúcar de Bondinho",
        description: "Suba ao famoso Pão de Açúcar no bondinho original! A viagem em dois trechos oferece vistas espetaculares da cidade, das praias de Copacabana e Ipanema, e da Baía de Guanabara.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1576992021885-42b8ec06d6b0?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 70-100",
        inclusions: ["Bondinho ida e volta", "Acesso aos mirantes", "Seguro"],
        exclusions: ["Alimentação", "Bebidas", "Estacionamento"],
        languages: ["Português", "Inglês", "Espanhol"],
        requirements: ["Não recomendado para pessoas com medo de altura"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Bondinho Pão de Açúcar: (21) 2546-8400",
        bookingUrl: "https://www.bondinho.com.br"
      }
    ]
  },

  // BRASÍLIA, DF 
  {
    location: "Brasília, DF",
    activities: [
      {
        title: "Catedral Metropolitana Nossa Senhora Aparecida",
        description: "Visite a icônica Catedral de Brasília, obra-prima de Oscar Niemeyer. Sua arquitetura única com 16 colunas curvas e vitrais coloridos é uma das mais belas do mundo.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1 hora",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Acesso aos vitrais"],
        exclusions: ["Guia turístico", "Transporte"],
        languages: ["Português"],
        requirements: ["Respeitar o silêncio religioso"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Catedral: (61) 3224-4073",
        bookingUrl: "https://www.catedral.org.br"
      },
      {
        title: "Praça dos Três Poderes",
        description: "Conheça o centro do poder brasileiro! Visite o Palácio do Planalto, Congresso Nacional e Supremo Tribunal Federal. Tour guiado pela arquitetura modernista de Niemeyer.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 30-50",
        inclusions: ["Guia credenciado", "Acesso aos palácios", "Seguro"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto", "Não levar objetos cortantes"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: "Palácio do Planalto: (61) 3411-1000",
        bookingUrl: "https://www.gov.br/planalto"
      },
      {
        title: "Memorial JK",
        description: "Explore a vida e obra de Juscelino Kubitschek, o presidente que construiu Brasília. Museu interativo com mausoléu e biblioteca em estrutura de Niemeyer.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "R$ 10-20",
        inclusions: ["Entrada no museu", "Acesso ao mausoléu", "Audioguia"],
        exclusions: ["Transporte", "Estacionamento"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Memorial JK: (61) 3225-9451",
        bookingUrl: "https://www.memorialjk.com.br"
      },
      {
        title: "Parque Nacional de Brasília",
        description: "Explore o cerrado brasileiro em sua forma mais pura! Trilhas ecológicas, nascentes de água mineral e piscinas naturais a 28km do centro da cidade.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        duration: "4 horas",
        difficulty: "moderate",
        priceRange: "R$ 25-40",
        inclusions: ["Entrada no parque", "Acesso às trilhas", "Seguro"],
        exclusions: ["Transporte", "Alimentação", "Equipamentos"],
        languages: ["Português"],
        requirements: ["Roupas confortáveis", "Tênis apropriado", "Protetor solar"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Parque Nacional: (61) 3233-4553",
        bookingUrl: "https://www.icmbio.gov.br"
      },
      {
        title: "Centro Cultural Banco do Brasil CCBB",
        description: "Centro cultural moderno com exposições de arte contemporânea, cinema, teatro e café. Arquitetura única em pilotis com eventos culturais constantes.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 15-30",
        inclusions: ["Entrada nas exposições", "Acesso ao café"],
        exclusions: ["Consumo no café", "Estacionamento"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "CCBB: (61) 3108-7600",
        bookingUrl: "https://www.bb.com.br/ccbb"
      }
    ]
  },

  // RECIFE, PE
  {
    location: "Recife, PE",
    activities: [
      {
        title: "Marco Zero Square e Escultura de Brennand",
        description: "Visite o coração histórico de Recife! O Marco Zero é o ponto de referência da cidade com esculturas de Francisco Brennand e vista para o mar.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Acesso livre ao marco", "Vista das esculturas"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português"],
        requirements: ["Protetor solar", "Água"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Prefeitura do Recife: (81) 3355-8000",
        bookingUrl: "https://www.recife.pe.gov.br"
      },
      {
        title: "Praia de Boa Viagem",
        description: "Relaxe na praia urbana mais famosa de Recife! Extensa faixa de areia com coqueiros, barracas de praia e piscinas naturais na maré baixa.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 20-50",
        inclusions: ["Acesso à praia", "Banho de mar seguro"],
        exclusions: ["Cadeiras", "Guarda-sol", "Alimentação"],
        languages: ["Português"],
        requirements: ["Nadar apenas nas piscinas naturais", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Bombeiros: (81) 3465-4050",
        bookingUrl: "https://www.boaviagem.pe.gov.br"
      },
      {
        title: "Recife Antigo - Paço do Frevo",
        description: "Mergulhe na cultura pernambucana! Museu interativo sobre o frevo, patrimônio imaterial da UNESCO, com exposições e aulas de dança.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Entrada no museu", "Exposições interativas", "Aula de frevo"],
        exclusions: ["Transporte", "Lembranças"],
        languages: ["Português", "Inglês"],
        requirements: ["Roupas confortáveis para dançar"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Paço do Frevo: (81) 3355-9500",
        bookingUrl: "https://www.pacodofevo.pe.gov.br"
      },
      {
        title: "Instituto Ricardo Brennand",
        description: "Visite um dos 20 melhores museus do mundo! Castelo medieval com arte, armas antigas, jardins esculpidos e obras de arte internacional.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 35-50",
        inclusions: ["Entrada no instituto", "Acesso aos jardins", "Exposições permanentes"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto", "Não tocar nas obras"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Instituto Brennand: (81) 2121-0365",
        bookingUrl: "https://www.institutobrenand.pe.gov.br"
      },
      {
        title: "Olinda - Centro Histórico UNESCO",
        description: "Explore a colorida Olinda, Patrimônio da Humanidade! Casas coloniais, igrejas históricas, ateliês de artistas e vista panorâmica do Recife.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "4 horas",
        difficulty: "moderate",
        priceRange: "R$ 40-80",
        inclusions: ["Guia local", "Entrada em igrejas", "Visita aos ateliês"],
        exclusions: ["Transporte", "Alimentação", "Compras"],
        languages: ["Português", "Inglês"],
        requirements: ["Sapatos confortáveis", "Câmera fotográfica"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Turismo Olinda: (81) 3305-1060",
        bookingUrl: "https://www.olinda.pe.gov.br"
      }
    ]
  },

  // FORTALEZA, CE
  {
    location: "Fortaleza, CE",
    activities: [
      {
        title: "Praia do Futuro",
        description: "Aproveite a praia mais famosa de Fortaleza! Extensas barracas de praia, águas mornas, surf e a melhor infraestrutura de praia do Nordeste.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "4 horas",
        difficulty: "easy",
        priceRange: "R$ 50-100",
        inclusions: ["Acesso à praia", "Estrutura de barracas"],
        exclusions: ["Consumo nas barracas", "Equipamentos de praia"],
        languages: ["Português"],
        requirements: ["Protetor solar", "Roupas de banho"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Barracas: (85) 3234-5678",
        bookingUrl: "https://www.praiadofuturo.com.br"
      },
      {
        title: "Praia de Iracema",
        description: "Curta o pôr do sol mais bonito de Fortaleza! Calçadão com bares, restaurantes, música ao vivo e o famoso Centro Dragão do Mar.",
        category: "nightlife",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 30-80",
        inclusions: ["Acesso ao calçadão", "Vista do pôr do sol"],
        exclusions: ["Consumo em bares", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Vir no final da tarde"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Dragão do Mar: (85) 3488-8600",
        bookingUrl: "https://www.dragaodomar.org.br"
      },
      {
        title: "Beach Park - Aquiraz",
        description: "Diversão garantida no maior parque aquático da América Latina! Toboáguas radicais, piscinas tropicais e praia paradisíaca.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "8 horas",
        difficulty: "easy",
        priceRange: "R$ 180-250",
        inclusions: ["Passaporte para todos os brinquedos", "Acesso à praia"],
        exclusions: ["Alimentação", "Estacionamento", "Transporte"],
        languages: ["Português", "Inglês"],
        requirements: ["Roupas de banho", "Protetor solar"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: "Beach Park: (85) 4012-3000",
        bookingUrl: "https://www.beachpark.com.br"
      },
      {
        title: "Centro Dragão do Mar",
        description: "Explore o maior centro cultural do Norte/Nordeste! Museus, planetário, cinema, teatro e exposições de arte contemporânea.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 20-40",
        inclusions: ["Entrada nos museus", "Acesso às exposições"],
        exclusions: ["Alimentação", "Estacionamento"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Dragão do Mar: (85) 3488-8600",
        bookingUrl: "https://www.dragaodomar.org.br"
      },
      {
        title: "Cumbuco - Passeio de Buggy",
        description: "Aventura nas dunas de Cumbuco! Passeio de buggy pelas dunas, lagoas cristalinas, kitesurf e esqui na areia.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80",
        duration: "6 horas",
        difficulty: "moderate",
        priceRange: "R$ 120-200",
        inclusions: ["Buggy com motorista", "Parada nas lagoas", "Esqui na areia"],
        exclusions: ["Alimentação", "Bebidas", "Kitesurf"],
        languages: ["Português"],
        requirements: ["Roupas confortáveis", "Protetor solar"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Cumbuco Turismo: (85) 3318-7200",
        bookingUrl: "https://www.cumbuco.com.br"
      }
    ]
  },

  // MANAUS, AM
  {
    location: "Manaus, AM",
    activities: [
      {
        title: "Teatro Amazonas",
        description: "Visite o magnífico Teatro Amazonas, símbolo da era da borracha! Arquitetura europeia com cúpula colorida e acústica perfeita no coração da Amazônia.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "R$ 20-30",
        inclusions: ["Visita guiada", "Acesso ao salão nobre", "História da borracha"],
        exclusions: ["Transporte", "Apresentações"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto", "Vestimenta adequada"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Teatro Amazonas: (92) 3232-1768",
        bookingUrl: "https://www.teatroamazonas.com.br"
      },
      {
        title: "Encontro das Águas",
        description: "Fenômeno natural único! Veja o encontro dos rios Negro e Solimões que correm lado a lado por 6km sem se misturar, formando o Rio Amazonas.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        duration: "4 horas",
        difficulty: "easy",
        priceRange: "R$ 80-120",
        inclusions: ["Passeio de barco", "Guia especializado", "Seguro"],
        exclusions: ["Alimentação", "Bebidas"],
        languages: ["Português", "Inglês"],
        requirements: ["Protetor solar", "Chapéu", "Câmera"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Amazon Jungle Tours: (92) 3633-5578",
        bookingUrl: "https://www.amazonjungletours.com.br"
      },
      {
        title: "Praia de Ponta Negra",
        description: "Relaxe na melhor praia fluvial de Manaus! Areia branca, águas mornas do Rio Negro e vista espetacular da cidade.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 30-60",
        inclusions: ["Acesso à praia", "Banho de rio"],
        exclusions: ["Cadeiras", "Guarda-sol", "Alimentação"],
        languages: ["Português"],
        requirements: ["Roupas de banho", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Ponta Negra: (92) 3236-9000",
        bookingUrl: "https://www.pontanegra.am.gov.br"
      },
      {
        title: "Arquipélago de Anavilhanas",
        description: "Explore o maior arquipélago fluvial do mundo! Ecoturismo autêntico com observação de aves, trilhas na floresta e pernoite em lodge.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        duration: "3 dias",
        difficulty: "moderate",
        priceRange: "R$ 800-1200",
        inclusions: ["Hospedagem em lodge", "Todas as refeições", "Guia especializado", "Atividades"],
        exclusions: ["Transporte aéreo", "Bebidas alcoólicas"],
        languages: ["Português", "Inglês"],
        requirements: ["Vacina febre amarela", "Roupas de trekking"],
        cancellationPolicy: "Cancelamento gratuito até 7 dias antes",
        contactInfo: "Anavilhanas Lodge: (92) 3633-8996",
        bookingUrl: "https://www.anavilhanaslodge.com.br"
      },
      {
        title: "Mercado Adolpho Lisboa",
        description: "Conheça o famoso mercado histórico de Manaus! Arquitetura de 1882 inspirada em Paris, com peixes amazônicos, artesanato e produtos regionais.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 20-50",
        inclusions: ["Entrada no mercado", "Degustação de frutas"],
        exclusions: ["Compras", "Alimentação"],
        languages: ["Português"],
        requirements: ["Dinheiro em espécie", "Disposição para pechinchar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Mercado: (92) 3232-6441",
        bookingUrl: "https://www.mercadoadolpho.com.br"
      }
    ]
  },

  // CURITIBA, PR
  {
    location: "Curitiba, PR",
    activities: [
      {
        title: "Jardim Botânico de Curitiba",
        description: "Visite o cartão postal de Curitiba! Jardim francês com estufa art nouveau, flores coloridas e lagos em uma das mais belas paisagens urbanas do Brasil.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Acesso aos jardins", "Visita à estufa"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Roupas confortáveis", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Jardim Botânico: (41) 3264-6994",
        bookingUrl: "https://www.jardimbotanico.curitiba.pr.gov.br"
      },
      {
        title: "Museu Oscar Niemeyer",
        description: "Explore a arquitetura arrojada do 'Museu do Olho'! Obras de arte moderna, exposições temporárias e a famosa estrutura em formato de olho.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Entrada no museu", "Exposições permanentes", "Acesso à arquitetura"],
        exclusions: ["Exposições especiais", "Estacionamento"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Museu Niemeyer: (41) 3350-4400",
        bookingUrl: "https://www.museuoscarniemeyer.org.br"
      },
      {
        title: "Ópera de Arame",
        description: "Conheça a única ópera de arame do mundo! Estrutura transparente em antiga pedreira, com apresentações culturais e vista única da natureza.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-20",
        inclusions: ["Entrada na ópera", "Vista da estrutura"],
        exclusions: ["Apresentações", "Transporte"],
        languages: ["Português"],
        requirements: ["Verificar programação"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Ópera de Arame: (41) 3355-8700",
        bookingUrl: "https://www.operadearame.com.br"
      },
      {
        title: "Trem Serra Verde Express para Morretes",
        description: "Viagem de trem histórico pela Serra do Mar! Uma das mais belas ferrovias do Brasil, com 70km de paisagens montanhosas até Morretes.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "8 horas",
        difficulty: "easy",
        priceRange: "R$ 150-280",
        inclusions: ["Viagem de trem", "Guia turístico", "Seguro"],
        exclusions: ["Alimentação", "Passeios em Morretes"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto", "Roupas confortáveis"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: "Serra Verde Express: (41) 3888-3488",
        bookingUrl: "https://www.serraverde.com.br"
      },
      {
        title: "Largo da Ordem - Feira de Domingo",
        description: "Explore o centro histórico aos domingos! Feira de artesanato, música ao vivo, teatro de rua e gastronomia local no coração histórico de Curitiba.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 20-60",
        inclusions: ["Acesso à feira", "Apresentações culturais"],
        exclusions: ["Compras", "Alimentação"],
        languages: ["Português"],
        requirements: ["Ir aos domingos das 9h às 14h"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Turismo Curitiba: (41) 3350-3000",
        bookingUrl: "https://www.turismo.curitiba.pr.gov.br"
      }
    ]
  },

  // BELÉM, PA
  {
    location: "Belém, PA",
    activities: [
      {
        title: "Mercado Ver-o-Peso",
        description: "Conheça o maior mercado a céu aberto da América Latina! Peixes amazônicos, frutas exóticas, ervas medicinais e artesanato paraense desde 1625.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 20-40",
        inclusions: ["Entrada no mercado", "Degustação de açaí"],
        exclusions: ["Compras", "Alimentação"],
        languages: ["Português"],
        requirements: ["Ir pela manhã", "Dinheiro em espécie"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Ver-o-Peso: (91) 3249-0520",
        bookingUrl: "https://www.veropeso.com.br"
      },
      {
        title: "Estação das Docas",
        description: "Complexo turístico e gastronômico no porto! Antiga estação de trem transformada em boulevard com restaurantes, bares e vista da Baía de Guajará.",
        category: "nightlife",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 50-120",
        inclusions: ["Acesso ao complexo", "Vista da baía"],
        exclusions: ["Consumo em restaurantes", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Melhor no final da tarde"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Estação das Docas: (91) 3212-5525",
        bookingUrl: "https://www.estacaodasdocas.com.br"
      },
      {
        title: "Mangal das Garças",
        description: "Parque ecológico com fauna amazônica! Borboletário, viveiro de garças, torre de observação e museu da navegação na Baía de Guajará.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        duration: "2.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Entrada no parque", "Acesso aos viveiros", "Torre de observação"],
        exclusions: ["Alimentação", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Câmera fotográfica", "Repelente"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Mangal das Garças: (91) 3242-5052",
        bookingUrl: "https://www.mangaldasgarcas.com.br"
      },
      {
        title: "Complexo Feliz Lusitânia",
        description: "Centro histórico com forte colonial! Forte do Presépio, Casa das Onze Janelas e Catedral da Sé contam 400 anos de história paraense.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 20-35",
        inclusions: ["Entrada no forte", "Visita à Casa das Onze Janelas", "Catedral"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto", "Roupas adequadas"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Feliz Lusitânia: (91) 3249-8362",
        bookingUrl: "https://www.felizlusitania.pa.gov.br"
      },
      {
        title: "Theatro da Paz",
        description: "Teatro histórico da era da borracha! Arquitetura neoclássica de 1870 com mármores, afrescos e a famosa Tribuna Imperial dourada.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Visita guiada", "Acesso ao interior", "História do teatro"],
        exclusions: ["Apresentações", "Transporte"],
        languages: ["Português"],
        requirements: ["Documento com foto", "Vestimenta adequada"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Theatro da Paz: (91) 3202-4450",
        bookingUrl: "https://www.theatrodapaz.pa.gov.br"
      }
    ]
  },

  // SÃO PAULO, SP - Already have some, expanding
  {
    location: "São Paulo, SP",
    activities: [
      {
        title: "Parque Ibirapuera",
        description: "Explore o 'Central Park' paulistano! Museus, lagos, ciclovia e espaços verdes em um dos maiores parques urbanos da América Latina.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "4 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Acesso aos jardins", "Ciclovia"],
        exclusions: ["Aluguel de bike", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Roupas confortáveis", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Parque Ibirapuera: (11) 5574-5045",
        bookingUrl: "https://www.parqueibirapuera.org"
      },
      {
        title: "Avenida Paulista e MASP",
        description: "Caminhe pela avenida mais famosa de São Paulo! Visite o MASP, Casa das Rosas e sinta a energia do centro financeiro e cultural da cidade.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 30-50",
        inclusions: ["Entrada no MASP", "Casa das Rosas"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "MASP: (11) 3149-5959",
        bookingUrl: "https://www.masp.org.br"
      },
      {
        title: "Mercado Municipal - Mercadão",
        description: "Deguste o famoso sanduíche de mortadela! Mercado histórico com centenas de produtores, frutas exóticas e gastronomia paulistana.",
        category: "food",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 40-80",
        inclusions: ["Entrada no mercado", "Degustação de frutas"],
        exclusions: ["Consumo", "Compras"],
        languages: ["Português"],
        requirements: ["Fome", "Dinheiro em espécie"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Mercadão: (11) 3313-3365",
        bookingUrl: "https://www.mercadomunicipal.com.br"
      },
      {
        title: "Beco do Batman - Vila Madalena",
        description: "Arte de rua em galeria a céu aberto! Beco com grafites coloridos, um dos primeiros museus de street art da América Latina.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Acesso gratuito", "Arte urbana"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português"],
        requirements: ["Câmera fotográfica", "Respeitar as obras"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Vila Madalena: (11) 3021-2000",
        bookingUrl: "https://www.becodbatman.com.br"
      },
      {
        title: "Pinacoteca do Estado",
        description: "Primeiro museu de arte de São Paulo! Coleção de 9 mil obras, arte brasileira desde o século XIX e arquitetura histórica restaurada.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Entrada no museu", "Exposições permanentes"],
        exclusions: ["Exposições especiais", "Estacionamento"],
        languages: ["Português", "Inglês"],
        requirements: ["Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Pinacoteca: (11) 3324-1000",
        bookingUrl: "https://www.pinacoteca.org.br"
      }
    ]
  },

  // GOIÂNIA, GO
  {
    location: "Goiânia, GO",
    activities: [
      {
        title: "Parque Flamboyant",
        description: "Um dos mais belos parques de Goiânia! Lago cristalino, trilhas sombreadas, playground e área de exercícios próximo ao Estádio Serra Dourada.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Acesso às trilhas", "Playground"],
        exclusions: ["Alimentação", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Roupas confortáveis", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Parque Flamboyant: (62) 3524-1485",
        bookingUrl: "https://www.parqueflamboyant.go.gov.br"
      },
      {
        title: "Parque Vaca Brava",
        description: "Parque urbano com lago e visual de arranha-céus! Também conhecido como Parque Sulivan Silvestre, oferece trilhas, playground e atmosfera de Central Park.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Trilha do lago", "Aparelhos de ginástica"],
        exclusions: ["Alimentação", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Roupas de exercício", "Água"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Parque Vaca Brava: (62) 3524-1490",
        bookingUrl: "https://www.parquevacabrava.go.gov.br"
      },
      {
        title: "Bosque dos Buritis",
        description: "O mais antigo parque da cidade! Criado em 1942, abriga o Monumento da Paz, fauna silvestre e trilhas históricas no coração de Goiânia.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Monumento da Paz", "Observação de fauna"],
        exclusions: ["Alimentação", "Transporte"],
        languages: ["Português"],
        requirements: ["Câmera fotográfica", "Respeitar a fauna"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Bosque dos Buritis: (62) 3524-1475",
        bookingUrl: "https://www.bosqueburitis.go.gov.br"
      },
      {
        title: "Memorial do Cerrado",
        description: "Complexo científico com museu e trilhas! História natural do cerrado, vila cenográfica de Santa Luzia e aldeias indígenas em 2km de trilhas ecológicas.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        duration: "3 horas",
        difficulty: "moderate",
        priceRange: "R$ 20-35",
        inclusions: ["Entrada no memorial", "Trilhas ecológicas", "Museu de História Natural"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português"],
        requirements: ["Tênis apropriado", "Protetor solar"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Memorial do Cerrado: (62) 3946-1239",
        bookingUrl: "https://www.pucgoias.edu.br/memorial"
      },
      {
        title: "Praça Cívica e Centro Cultural",
        description: "Coração político e cultural de Goiânia! Esculturas famosas, Palácio das Esmeraldas, Teatro Goiânia e arquitetura art déco da cidade planejada.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Acesso à praça", "Visita ao teatro", "Arquitetura art déco"],
        exclusions: ["Espetáculos", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Documento com foto", "Cuidado com segurança"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Turismo Goiânia: (62) 3524-1600",
        bookingUrl: "https://www.turismo.goiania.go.gov.br"
      }
    ]
  },

  // VITÓRIA, ES
  {
    location: "Vitória, ES",
    activities: [
      {
        title: "Praia de Camburi",
        description: "Principal praia de Vitória! Extensa faixa de areia, calçadão para caminhadas, ciclovia e estrutura completa com hotéis e restaurantes.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 30-70",
        inclusions: ["Acesso à praia", "Banho de mar", "Calçadão"],
        exclusions: ["Cadeiras", "Guarda-sol", "Alimentação"],
        languages: ["Português"],
        requirements: ["Roupas de banho", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Praia de Camburi: (27) 3382-6000",
        bookingUrl: "https://www.camburi.es.gov.br"
      },
      {
        title: "Parque Pedra da Cebola",
        description: "Parque urbano com formação rochosa única! Trilhas, área verde e a misteriosa 'pedra da cebola' em formato peculiar próximo à UFES.",
        category: "sightseeing",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "Gratuito",
        inclusions: ["Entrada gratuita", "Trilhas", "Vista da pedra"],
        exclusions: ["Alimentação", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Tênis apropriado", "Câmera fotográfica"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Parque Pedra da Cebola: (27) 3382-6100",
        bookingUrl: "https://www.pedracebola.es.gov.br"
      },
      {
        title: "Praia do Canto e Curva da Jurema",
        description: "Bairro nobre com praia urbana! Iate Clube, lojas elegantes, restaurantes sofisticados e a famosa Curva da Jurema com vista panorâmica.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 40-100",
        inclusions: ["Acesso à praia", "Vista da Curva da Jurema"],
        exclusions: ["Consumo em restaurantes", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Dinheiro para consumo", "Roupas adequadas"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Praia do Canto: (27) 3382-6200",
        bookingUrl: "https://www.praiadocanto.es.gov.br"
      },
      {
        title: "Espaço Baleia Jubarte",
        description: "Centro interpretativo sobre baleias! Experiência educativa sobre conservação marinha, patrocinado pela Petrobras e Instituto Baleia Jubarte.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        duration: "2 horas",
        difficulty: "easy",
        priceRange: "R$ 20-35",
        inclusions: ["Entrada no espaço", "Exposições interativas", "Educação ambiental"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português", "Inglês"],
        requirements: ["Interesse em conservação", "Documento com foto"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Espaço Baleia Jubarte: (27) 3345-5200",
        bookingUrl: "https://www.baleiajubarte.org.br"
      },
      {
        title: "Palácio Anchieta",
        description: "Sede do governo capixaba! Construção jesuítica dos séculos XVI-XVIII, transformada em palácio governamental com visitas guiadas e história local.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "1.5 horas",
        difficulty: "easy",
        priceRange: "R$ 15-25",
        inclusions: ["Visita guiada", "Acesso ao palácio", "História do ES"],
        exclusions: ["Transporte", "Alimentação"],
        languages: ["Português"],
        requirements: ["Documento com foto", "Vestimenta adequada"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Palácio Anchieta: (27) 3636-1000",
        bookingUrl: "https://www.palacioanchieta.es.gov.br"
      }
    ]
  },

  // FLORIANÓPOLIS, SC - Already have some, but adding more
  {
    location: "Florianópolis, SC",
    activities: [
      {
        title: "Praia da Lagoinha do Leste",
        description: "Praia selvagem e preservada! Trilha de 1h30 através da mata atlântica até uma das praias mais bonitas de Florianópolis.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1544963150-889d45c4e2f8?w=800&q=80",
        duration: "6 horas",
        difficulty: "moderate",
        priceRange: "R$ 40-80",
        inclusions: ["Acesso à trilha", "Praia preservada", "Mata atlântica"],
        exclusions: ["Alimentação", "Equipamentos", "Transporte"],
        languages: ["Português"],
        requirements: ["Tênis de trilha", "Água", "Lanche", "Protetor solar"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Turismo Floripa: (48) 3251-6000",
        bookingUrl: "https://www.turismo.floripa.sc.gov.br"
      },
      {
        title: "Praia da Joaquina - Sandboard",
        description: "Surf nas dunas! Praia famosa pelo surf e dunas gigantes ideais para sandboard. Berço de grandes surfistas brasileiros.",
        category: "adventure",
        imageUrl: "https://images.unsplash.com/photo-1544963150-889d45c4e2f8?w=800&q=80",
        duration: "4 horas",
        difficulty: "moderate",
        priceRange: "R$ 60-120",
        inclusions: ["Aluguel de prancha", "Instrução básica", "Seguro"],
        exclusions: ["Transporte", "Alimentação", "Equipamentos de surf"],
        languages: ["Português"],
        requirements: ["Roupas esportivas", "Protetor solar", "Água"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Joaquina Surf: (48) 3232-5555",
        bookingUrl: "https://www.joaquinasandboard.com.br"
      },
      {
        title: "Lagoa da Conceição",
        description: "Lagoa de águas calmas cercada por morros! Esportes aquáticos, restaurantes, vida noturna e centro gastronômico da ilha.",
        category: "relaxation",
        imageUrl: "https://images.unsplash.com/photo-1544963150-889d45c4e2f8?w=800&q=80",
        duration: "4 horas",
        difficulty: "easy",
        priceRange: "R$ 50-150",
        inclusions: ["Acesso à lagoa", "Banho de lagoa"],
        exclusions: ["Esportes aquáticos", "Alimentação", "Estacionamento"],
        languages: ["Português"],
        requirements: ["Roupas de banho", "Dinheiro para consumo"],
        cancellationPolicy: "Não se aplica",
        contactInfo: "Lagoa da Conceição: (48) 3334-0000",
        bookingUrl: "https://www.lagoadaconceicao.com.br"
      },
      {
        title: "Centro Histórico de Florianópolis",
        description: "Patrimônio histórico catarinense! Mercado Público, Catedral, Casa da Alfândega e arquitetura açoriana no centro da capital.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 20-50",
        inclusions: ["Walking tour", "Mercado Público", "Catedral"],
        exclusions: ["Alimentação", "Compras", "Transporte"],
        languages: ["Português"],
        requirements: ["Sapatos confortáveis", "Câmera"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Centro Histórico: (48) 3251-6100",
        bookingUrl: "https://www.centrohistorico.sc.gov.br"
      },
      {
        title: "Fortaleza de São José da Ponta Grossa",
        description: "Fortaleza colonial do século XVIII! Patrimônio histórico em ilha preservada, acessível por barco com vista da Baía Norte.",
        category: "culture",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        duration: "3 horas",
        difficulty: "easy",
        priceRange: "R$ 35-60",
        inclusions: ["Transporte de barco", "Visita à fortaleza", "Guia histórico"],
        exclusions: ["Alimentação", "Bebidas"],
        languages: ["Português"],
        requirements: ["Documento com foto", "Roupas confortáveis"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Fortaleza: (48) 3244-9200",
        bookingUrl: "https://www.fortaleza.sc.gov.br"
      }
    ]
  }
];

// Function to create activities for a specific city
async function createActivitiesForCity(cityName: string, cityActivities: any[]) {
  console.log(`Creating activities for ${cityName}...`);
  
  for (const activityData of cityActivities) {
    try {
      // Insert activity
      const insertResult = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: cityName,
        category: activityData.category,
        coverImage: activityData.imageUrl,
        duration: activityData.duration,
        difficultyLevel: activityData.difficulty,
        inclusions: activityData.inclusions,
        exclusions: activityData.exclusions,
        languages: activityData.languages,
        requirements: activityData.requirements,
        cancellationPolicy: activityData.cancellationPolicy,
        contactInfo: { info: activityData.contactInfo },
        isActive: true
      });
      
      const activityId = insertResult[0]?.insertId;

      console.log(`✅ Created activity: ${activityData.title} (ID: ${activityId})`);

      // Create budget proposals for this activity
      if (activityId) {
        const budgetProposals = [
          {
            title: "Opção Básica",
            amount: activityData.priceRange === "Gratuito" ? 0 : parseFloat(activityData.priceRange.split('R$ ')[1].split('-')[0]),
            inclusions: activityData.inclusions.slice(0, 2),
            exclusions: [...activityData.exclusions, "Extras não mencionados"]
          },
          {
            title: "Opção Completa", 
            amount: activityData.priceRange === "Gratuito" ? 0 : (parseFloat(activityData.priceRange.split('-')[1]) || parseFloat(activityData.priceRange.split('R$ ')[1].split('-')[0]) * 1.5),
            inclusions: [...activityData.inclusions, "Lanche", "Água"],
            exclusions: activityData.exclusions
          },
          {
            title: "Opção Premium",
            amount: activityData.priceRange === "Gratuito" ? 0 : ((parseFloat(activityData.priceRange.split('-')[1]) || parseFloat(activityData.priceRange.split('R$ ')[1].split('-')[0]) * 1.5) * 1.8),
            inclusions: [...activityData.inclusions, "Lanche gourmet", "Água", "Transporte VIP", "Guia especializado"],
            exclusions: ["Bebidas alcoólicas"]
          }
        ];

        for (const proposal of budgetProposals) {
          await db.insert(activityBudgetProposals).values({
            activityId: Number(activityId),
            title: proposal.title,
            amount: proposal.amount,
            inclusions: proposal.inclusions,
            exclusions: proposal.exclusions,
            createdBy: 1, // Tom user
            votes: Math.floor(Math.random() * 20) + 5
          });
        }
      } else {
        console.error(`❌ No activity ID returned for ${activityData.title}`);
      }

      console.log(`✅ Created 3 budget proposals for ${activityData.title}`);
    } catch (error) {
      console.error(`❌ Error creating activity ${activityData.title}:`, error);
    }
  }
}

// Main function to create all activities
export async function createAllCitiesActivities() {
  try {
    console.log("🎯 Creating comprehensive activities for all cities...");
    
    // Create activities for each city
    for (const cityData of allCitiesActivities) {
      await createActivitiesForCity(cityData.location, cityData.activities);
    }
    
    console.log("✅ All activities created successfully!");
    
    // Check final count
    const finalCount = await db.execute('SELECT COUNT(*) as count FROM activities');
    const proposalCount = await db.execute('SELECT COUNT(*) as count FROM activity_budget_proposals');
    
    console.log(`📊 Total activities created: ${finalCount[0]?.count || 0}`);
    console.log(`📊 Total budget proposals created: ${proposalCount[0]?.count || 0}`);
    
    return {
      success: true,
      activitiesCount: finalCount[0]?.count || 0,
      proposalsCount: proposalCount[0]?.count || 0
    };
    
  } catch (error) {
    console.error('❌ Error creating activities:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAllCitiesActivities()
    .then(() => {
      console.log('🎉 Activities creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to create activities:', error);
      process.exit(1);
    });
}