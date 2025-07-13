import { users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, type User, type InsertUser, type Trip, type InsertTrip, type Message, type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, popularDestinations } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Helper function to get cover image for destination
function getCoverImageForDestination(destination: string, travelStyle?: string): string | null {
  console.log(`🖼️  Buscando imagem para destino: "${destination}", estilo: "${travelStyle}"`);
  
  // Normalize destination for better matching
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Define specific landmark images for iconic destinations - organized like a travel agency
  const iconicDestinations: { [key: string]: string } = {
    // EUROPA - Destinos Clássicos
    "paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80", // Torre Eiffel
    "torre eiffel": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    "frança": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    "france": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    
    "roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80", // Coliseu
    "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "coliseu": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "colosseum": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "itália": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "italy": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    
    "londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80", // Big Ben
    "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    "big ben": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    "reino unido": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    "england": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    
    "barcelona": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80", // Sagrada Família
    "sagrada família": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "espanha": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "spain": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    
    "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80", // Canais
    "holanda": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    "netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    
    "berlim": "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80", // Portão de Brandemburgo
    "berlin": "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80",
    "alemanha": "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80",
    "germany": "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80",
    
    "atenas": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80", // Acrópole
    "athens": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80",
    "grécia": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80",
    "greece": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80",
    "acrópole": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80",
    
    "praga": "https://images.unsplash.com/photo-1596436048549-f4e7e0c9e50c?w=800&q=80", // Ponte Carlos
    "prague": "https://images.unsplash.com/photo-1596436048549-f4e7e0c9e50c?w=800&q=80",
    "república checa": "https://images.unsplash.com/photo-1596436048549-f4e7e0c9e50c?w=800&q=80",
    
    "viena": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80", // Palácio Schönbrunn
    "vienna": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    "áustria": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    "austria": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    
    // ÁSIA - Destinos Exóticos
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", // Shibuya Crossing
    "tóquio": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "japão": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "japan": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    
    "pequim": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80", // Cidade Proibida
    "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    "china": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    "cidade proibida": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", // Burj Khalifa
    "emirados árabes": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "uae": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "burj khalifa": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    
    "nova délhi": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", // Taj Mahal
    "delhi": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    "índia": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    "india": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    
    "bangkok": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Templos
    "tailândia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "thailand": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    
    // ÁFRICA E ORIENTE MÉDIO
    "cairo": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80", // Pirâmides do Egito
    "egito": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    "egypt": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    "pirâmides": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    "pyramids": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    
    "marrakech": "https://images.unsplash.com/photo-1517821362941-f5aa9717bb51?w=800&q=80", // Medina
    "marrocos": "https://images.unsplash.com/photo-1517821362941-f5aa9717bb51?w=800&q=80",
    "morocco": "https://images.unsplash.com/photo-1517821362941-f5aa9717bb51?w=800&q=80",
    
    "cidade do cabo": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80", // Table Mountain
    "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    "áfrica do sul": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    "south africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    
    // AMÉRICAS - Destinos Icônicos
    "nova york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", // Estátua da Liberdade
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "estátua da liberdade": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "statue of liberty": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    
    "los angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80", // Hollywood Sign
    "hollywood": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80",
    "california": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80",
    
    "san francisco": "https://images.unsplash.com/photo-1519928917901-d0c2912d0c9b?w=800&q=80", // Golden Gate
    "golden gate": "https://images.unsplash.com/photo-1519928917901-d0c2912d0c9b?w=800&q=80",
    
    "rio de janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80", // Cristo Redentor
    "cristo redentor": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    "pão de açúcar": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    
    "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80", // Obelisco
    "argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
    
    "lima": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80", // Centro Histórico
    "peru": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    "machu picchu": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    
    // OCEANIA
    "sydney": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Opera House
    "austrália": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "australia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "opera house": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    
    // BRASIL - Destinos Nacionais
    "são paulo": "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80", // Skyline
    "salvador": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Pelourinho
    "fortaleza": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praias
    "recife": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Marco Zero
    "porto alegre": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro
    "curitiba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Parques
    "belo horizonte": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praça da Liberdade
    "brasília": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Congresso Nacional
    "manaus": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // Encontro das Águas
    "florianópolis": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte Hercílio Luz
    "natal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Forte dos Reis Magos
    "joão pessoa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponta do Seixas
    "maceió": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Pajuçara
    "aracaju": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Orla de Atalaia
    "vitória": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Convento da Penha
    "campo grande": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Mercado Central
    "cuiabá": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // Pantanal
    "goiânia": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praça Cívica
    "teresina": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte Estaiada
    "são luís": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "macapá": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Fortaleza de São José
    "belém": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ver-o-Peso
    "palmas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praça dos Girassóis
    "porto velho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Mercado Cultural
    "rio branco": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Palácio Rio Branco
    "boa vista": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Orla Taumanan
    
    // DESTINOS DE CRUZEIROS - Experiências Marítimas
    "mediterrâneo": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "caribe": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "caribbean": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "mediterranean": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "costa mediterrânea": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "ilhas gregas": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "fjords noruegueses": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "alasca": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "alaska": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "costa do báltico": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "ilhas canárias": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "cruzeiro transatlântico": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "costa brasileira": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "costa argentina": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "ilhas do caribe": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "mar do norte": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro
    "rio": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    "paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80", // Torre Eiffel
    "torre eiffel": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    "londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80", // Big Ben
    "big ben": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    "tóquio": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", // Shibuya
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "shibuya": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "nova york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", // NYC Skyline
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "nyc": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "sydney": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Opera House
    "opera house": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "machu picchu": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80", // Machu Picchu
    "cusco": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    "pequim": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80", // Cidade Proibida
    "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    "cidade proibida": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    "barcelona": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80", // Sagrada Familia
    "sagrada familia": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    "istambul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", // Hagia Sophia
    "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    "bangkok": "https://images.unsplash.com/photo-1563492065-b4f1d404b730?w=800&q=80", // Templos
    "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", // Templo Dourado
    "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80", // Canais
    "berlim": "https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=800&q=80", // Portão de Brandeburgo
    "praga": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80", // Ponte Carlos
    "viena": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80", // Schönbrunn
    "budapeste": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80", // Parlamento
    "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80", // Obelisco
    "são paulo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Skyline
    "brasília": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Congresso Nacional
    "salvador": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Pelourinho
    "florianópolis": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte Hercílio Luz
    "recife": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Marco Zero
    "fortaleza": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Iracema
    "natal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Dunas
    "manaus": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Encontro das Águas
    "pantanal": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Fauna
    "chapada diamantina": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // Cachoeiras
    "campos do jordão": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Montanhas
    "gramado": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Igreja de Pedra
    "canela": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Catedral
    "foz do iguaçu": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cataratas
    "fernando de noronha": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Baía dos Porcos
    "jericoacoara": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Duna do Pôr do Sol
    "arraial do cabo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praias cristalinas
    "búzios": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia da Ferradura
    "porto seguro": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "trancoso": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Quadrado
    "morro de são paulo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Tirolesa
    "porto de galinhas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Piscinas naturais
    "maceió": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Francês
    "aracaju": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Orla de Atalaia
    "cabo frio": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia das Conchas
    "petropolis": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Museu Imperial
    "tiradentes": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "ouro preto": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Igreja São Francisco
    
    // Destinos de cruzeiro
    "mediterrâneo": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "mediterranean": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "caribe": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "caribbean": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "fiorde": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "fiord": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "noruega": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "norway": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "alasca": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "alaska": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "cruzeiro": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg", // Cruzeiro padrão
    "cruise": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "paraty": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "angra dos reis": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ilha Grande
    "ubatuba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia da Fazenda
    "ilhabela": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Cachoeira do Gato
    "brotas": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Rafting
    "bonito": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Aquário Natural
    "alto paraíso": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Chapada dos Veadeiros
    "pirenópolis": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "caldas novas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Águas termais
    "olímpia": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Parques aquáticos
    "barra grande": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Kitesurf
    "canoa quebrada": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Falésias
    "pipa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Amor
    "alter do chão": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Caribe da Amazônia
    "monte roraima": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Tepui
    "lençóis maranhenses": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Dunas e lagoas
    "carolina": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeira da Pedra Caída
    "jalapão": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Dunas douradas
    "canoa quebrada": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Falésias coloridas
    "serra gaucha": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vinícolas
    "bento gonçalves": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vale dos Vinhedos
    "nova petrópolis": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Arquitetura alemã
    "holambra": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Campos de tulipas
    "penedo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vila finlandesa
    "domingos martins": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Rota do Imigrante
    "pomerode": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Cidade mais alemã do Brasil
    "joinville": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Festa das Flores
    "blumenau": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Oktoberfest
    "cambará do sul": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cânions
    "urubici": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pedra Furada
    "são joaquim": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vinícolas de altitude
    "monte verde": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Clima de montanha
    "visconde de mauá": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vale do Alcantilado
    "itamonte": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pico das Agulhas Negras
    "canastra": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeira Casca d'Anta
    "capitólio": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cânions de Furnas
    "são thomé das letras": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pedras místicas
    "aiuruoca": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pico do Papagaio
    "carrancas": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeiras
    "sacramento": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeira do Cerradão
    "delfinópolis": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cânions do Lago
    "são roque de minas": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeira da Casca d'Anta
    "ibiraci": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Cachoeira do Diquadinha
    "passos": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Represa de Furnas
    "piumhi": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Lago de Furnas
    "formiga": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Lago de Furnas
    "boa esperança": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Lago de Furnas
    "guarda": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pedra do Bauzinho
    "monte alegre do sul": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Clima de montanha
    "águas de lindoia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Balneário
    "monte sião": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Águas termais
    "serra negra": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Festival de Inverno
    "cunha": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Lavandário
    "paraibuna": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Represa do Paraibuna
    "natividade da serra": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Trilha do Ouro
    "bananal": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Centro Histórico
    "cruzeiro": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pico do Cruzeiro
    "pindamonhangaba": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Centro Histórico
    "taubaté": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Museu Monteiro Lobato
    "aparecida": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Basílica
    "guaratinguetá": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Museu Frei Galvão
    "lorena": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Centro Histórico
    "cachoeira paulista": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Canção Nova
    "silveiras": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Fazendas históricas
    "areias": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Fazendas do café
    "queluz": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Casa da Princesa Isabel
    "arapeí": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Túnel da Mantiqueira
    "são josé do barreiro": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Fazendas históricas
    "resende": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Academia Militar
    "itatiaia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Parque Nacional
    "penedo": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pequena Finlândia
    "engenheiro passos": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pico das Agulhas Negras
    "mauá": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Vale do Alcantilado
    "maringá": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Cidade Canção
    "londrina": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Pequena Londres
    "curitiba": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Jardim Botânico
    "paranaguá": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Centro Histórico
    "morretes": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Trem da Serra do Mar
    "antonina": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Porto histórico
    "ilha do mel": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Farol das Conchas
    "guaraqueçaba": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Mata Atlântica
    "superagui": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Parque Nacional
    "vila velha": "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80", // Parque Estadual
    "castro": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Fazendas históricas
    "ponta grossa": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Buraco do Padre
    "prudentópolis": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Salto São Francisco
    "irati": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Floresta Nacional
    "guarapuava": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Parque das Araucárias
    "telêmaco borba": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Parque Ambiental
    "tibagi": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Cânion do Guartelá
    "palmas": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Clevelândia
    "general carneiro": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Parque Nacional
    "bituruna": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Araucárias
    "cruz machado": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Mata de Araucária
    "porto união": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Contestado
    "mafra": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Parque Nacional
    "são bento do sul": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Arquitetura alemã
    "campo alegre": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Serra do Quiriri
    "garuva": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Morro do Cambirela
    "itajaí": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Porto
    "balneário camboriú": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia Central
    "bombinhas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia da Sepultura
    "porto belo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ilha de Porto Belo
    "tijucas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Tijucas
    "biguaçu": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Biguaçu
    "governador celso ramos": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia da Armação
    "paulo lopes": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Sonho
    "garopaba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Rosa
    "imbituba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Porto
    "laguna": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Centro Histórico
    "jaguaruna": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Cardoso
    "sangão": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Sangão
    "içara": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Balneário Rincão
    "criciúma": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Parque das Nações
    "araranguá": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Araranguá
    "torres": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia Grande
    "osório": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Atlântida
    "tramandaí": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Tramandaí
    "cidreira": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Cidreira
    "imbé": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Imbé
    "pinhal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Pinhal
    "capão da canoa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Capão da Canoa
    "xangri-lá": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Xangri-lá
    "arroio do sal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Arroio do Sal
    "três cachoeiras": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Três Cachoeiras
    "morrinhos do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Morrinhos do Sul
    "dom pedro de alcântara": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Dom Pedro de Alcântara
    "maquiné": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Maquiné
    "terra de areia": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Terra de Areia
    "mostardas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Mostardas
    "tavares": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de Tavares
    "são josé do norte": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia de São José do Norte
    "rio grande": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Porto de Rio Grande
    "santa vitória do palmar": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praia do Cassino
    "chui": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Fronteira com o Uruguai
    "jaguarão": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte Internacional
    "arroio grande": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Charqueada São João
    "herval": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Cerro do Herval
    "bagé": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Praça da Matriz
    "dom pedrito": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Palácio da Música
    "santana do livramento": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Parque Internacional
    "rosário do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte do Rosário
    "são gabriel": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Cerro do Batovi
    "santa maria": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Catedral Diocesana
    "cachoeira do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte do Imperador
    "rio pardo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Museu Visconde de São Leopoldo
    "santa cruz do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "lajeado": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte do Lajeado
    "estrela": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "teutônia": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Kerb
    "westfalia": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Colonização alemã
    "taquari": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Rio Taquari
    "arroio do meio": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Ponte do Arroio do Meio
    "encantado": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "muçum": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Uva
    "roca sales": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Colonização alemã
    "sério": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "putinga": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Colonização alemã
    "guaporé": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Uva
    "serafina corrêa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "nova prata": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Vinícolas
    "veranópolis": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Uva
    "cotiporã": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Vinícolas
    "bento gonçalves": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Vale dos Vinhedos
    "garibaldi": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Espumantes
    "carlos barbosa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Vinícolas
    "farroupilha": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Uva
    "caxias do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Uva
    "flores da cunha": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Vinícolas
    "nova roma do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "antônio prado": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Patrimônio Cultural
    "ipê": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Oktoberfest
    "vacaria": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Festa da Maçã
    "bom jesus": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Aparados da Serra
    "são josé dos ausentes": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "monte alegre dos campos": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "esmeralda": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "pinhal da serra": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "campestre da serra": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "andré da rocha": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "protásio alves": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "muliterno": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "lagoa vermelha": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "água santa": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "sananduva": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "ponte preta": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "ibiraiaras": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "maximiliano de almeida": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "machadinho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Barragem de Machadinho
    "barracão": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Barragem de Machadinho
    "pinhal grande": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "soledade": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "fontoura xavier": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "coqueiros do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "espumoso": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "não-me-toque": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "victor graeff": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "passo fundo": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Universidade de Passo Fundo
    "marau": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "getúlio vargas": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "erechim": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Parque Longines Malinowski
    "erebango": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "gaurama": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "viadutos": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "aratiba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "áurea": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "severiano de almeida": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "três arroios": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "cruzaltense": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "jacutinga": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "benjamin constant do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "nonoai": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "rio dos índios": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "gramado dos loureiros": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "planalto": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "faxinalzinho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "charrua": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "entre-ijuís": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "rodeio bonito": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "erval seco": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "centenário": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "sarandi": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "constantina": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "ronda alta": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "três palmeiras": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "tapejara": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "vila lângaro": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "casca": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "david canabarro": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "muliterno": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "nova bassano": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "união da serra": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "paim filho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "caseiros": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "santo expedito do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "carlos gomes": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "charrua": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "sertão": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "tupanci do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "itatiba do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "faxinalzinho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "tapejara": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "vila lângaro": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "casca": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "david canabarro": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "muliterno": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "nova bassano": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "união da serra": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "paim filho": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "caseiros": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "santo expedito do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "carlos gomes": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "charrua": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "sertão": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "tupanci do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
    "itatiba do sul": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Campos de Cima da Serra
  };
  
  // Special handling for cruise destinations - use single standard cruise ship image
  if (travelStyle === 'cruzeiros') {
    console.log(`🚢 Usando imagem padrão de cruzeiro para ${destination}`);
    return "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg";
  }
  
  // Try to find exact match first in iconic destinations
  if (iconicDestinations[normalizedDestination]) {
    console.log(`✅ Encontrou match exato: ${normalizedDestination} -> ${iconicDestinations[normalizedDestination]}`);
    return iconicDestinations[normalizedDestination];
  }
  
  // Try to find partial match in iconic destinations (more intelligent search)
  for (const [key, image] of Object.entries(iconicDestinations)) {
    if (normalizedDestination.includes(key) || key.includes(normalizedDestination)) {
      console.log(`✅ Encontrou match parcial: ${normalizedDestination} contém/está em ${key} -> ${image}`);
      return image;
    }
  }
  
  // Try to find exact match in popularDestinations
  if (destination in popularDestinations) {
    console.log(`✅ Encontrou match exato em popularDestinations: ${destination} -> ${popularDestinations[destination as keyof typeof popularDestinations].image}`);
    return popularDestinations[destination as keyof typeof popularDestinations].image;
  }
  
  // Try to find partial match in popularDestinations
  for (const [dest, data] of Object.entries(popularDestinations)) {
    const destKey = dest.toLowerCase();
    const cityName = destKey.split(',')[0].trim();
    const inputCity = normalizedDestination.split(',')[0].trim();
    
    if (destKey === normalizedDestination || cityName === inputCity || normalizedDestination.includes(cityName) || cityName.includes(inputCity)) {
      console.log(`✅ Encontrou match parcial em popularDestinations: ${normalizedDestination} -> ${cityName} -> ${data.image}`);
      return data.image;
    }
  }
  
  // Default image for unknown destinations
  console.log(`⚠️  Nenhuma imagem específica encontrada para "${destination}". Usando imagem padrão.`);
  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
}

export interface IStorage {
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Trips
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByCreator(creatorId: number): Promise<Trip[]>;
  getTripsByParticipant(userId: number): Promise<Trip[]>;
  getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]>;
  createTrip(trip: InsertTrip & { creatorId: number }): Promise<Trip>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;

  // Trip Participants
  getTripParticipants(tripId: number): Promise<(TripParticipant & { user: User })[]>;
  addTripParticipant(tripId: number, userId: number): Promise<TripParticipant>;
  updateTripParticipant(tripId: number, userId: number, status: string): Promise<TripParticipant | undefined>;
  removeTripParticipant(tripId: number, userId: number): Promise<void>;
  recalculateExpenseSplits(tripId: number): Promise<void>;

  // Messages
  getTripMessages(tripId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;

  // Trip Requests
  getTripRequests(tripId: number): Promise<(TripRequest & { user: User })[]>;
  getUserTripRequests(userId: number): Promise<(TripRequest & { trip: Trip })[]>;
  createTripRequest(request: InsertTripRequest & { userId: number }): Promise<TripRequest>;
  updateTripRequest(id: number, status: string): Promise<TripRequest | undefined>;

  // Expenses
  getTripExpenses(tripId: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]>;
  createExpense(expense: InsertExpense & { paidBy: number }): Promise<Expense>;
  createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]>;
  updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined>;
  getTripBalances(tripId: number): Promise<{ userId: number; user: User; balance: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private tripParticipants: Map<string, TripParticipant>;
  private messages: Map<number, Message>;
  private tripRequests: Map<number, TripRequest>;
  private expenses: Map<number, Expense>;
  private expenseSplits: Map<number, ExpenseSplit>;
  private currentUserId: number;
  private currentTripId: number;
  private currentMessageId: number;
  private currentRequestId: number;
  private currentParticipantId: number;
  private currentExpenseId: number;
  private currentExpenseSplitId: number;
  public sessionStore: session.Store;

  // Helper function to remove sensitive information from user objects
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.tripParticipants = new Map();
    this.messages = new Map();
    this.tripRequests = new Map();
    this.expenses = new Map();
    this.expenseSplits = new Map();
    this.currentUserId = 1;
    this.currentTripId = 1;
    this.currentMessageId = 1;
    this.currentRequestId = 1;
    this.currentParticipantId = 1;
    this.currentExpenseId = 1;
    this.currentExpenseSplitId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      profilePhoto: null,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      languages: insertUser.languages || null,
      interests: insertUser.interests || null,
      travelStyle: insertUser.travelStyle || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByCreator(creatorId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.creatorId === creatorId);
  }

  async getTripsByParticipant(userId: number): Promise<Trip[]> {
    const participantTrips = Array.from(this.tripParticipants.values())
      .filter(p => p.userId === userId && p.status === 'accepted')
      .map(p => this.trips.get(p.tripId))
      .filter((trip): trip is Trip => trip !== undefined)
      .filter(trip => trip.creatorId !== userId); // Excluir viagens onde o usuário é o criador

    return participantTrips;
  }

  async getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]> {
    let allTrips = Array.from(this.trips.values()).filter(trip => trip.status === 'open');

    if (filters) {
      if (filters.destination) {
        allTrips = allTrips.filter(trip => 
          trip.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        );
      }
      if (filters.startDate) {
        allTrips = allTrips.filter(trip => trip.startDate >= filters.startDate!);
      }
      if (filters.endDate) {
        allTrips = allTrips.filter(trip => trip.endDate <= filters.endDate!);
      }
      if (filters.budget) {
        allTrips = allTrips.filter(trip => (trip.budget || 0) <= filters.budget!);
      }
      if (filters.travelStyle) {
        allTrips = allTrips.filter(trip => trip.travelStyle === filters.travelStyle);
      }
    }

    return allTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTrip(tripData: InsertTrip & { creatorId: number }): Promise<Trip> {
    const id = this.currentTripId++;
    
    // Automatically assign cover image if not provided
    const coverImage = tripData.coverImage || getCoverImageForDestination(tripData.destination, tripData.travelStyle);
    
    const trip: Trip = { 
      ...tripData, 
      id, 
      coverImage,
      budget: tripData.budget ?? null,
      budgetBreakdown: tripData.budgetBreakdown || null,
      currentParticipants: 1,
      status: 'open',
      sharedCosts: tripData.sharedCosts || null,
      createdAt: new Date() 
    };
    this.trips.set(id, trip);

    // Add creator as participant
    await this.addTripParticipant(id, tripData.creatorId);

    return trip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;

    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    const trip = this.trips.get(id);
    if (!trip) return false;

    // Remove all associated data
    // Remove participants
    const participantKeys = Array.from(this.tripParticipants.keys()).filter(key => {
      const participant = this.tripParticipants.get(key);
      return participant?.tripId === id;
    });
    participantKeys.forEach(key => this.tripParticipants.delete(key));

    // Remove messages
    const messageKeys = Array.from(this.messages.keys()).filter(msgId => {
      const message = this.messages.get(msgId);
      return message?.tripId === id;
    });
    messageKeys.forEach(msgId => this.messages.delete(msgId));

    // Remove trip requests
    const requestKeys = Array.from(this.tripRequests.keys()).filter(reqId => {
      const request = this.tripRequests.get(reqId);
      return request?.tripId === id;
    });
    requestKeys.forEach(reqId => this.tripRequests.delete(reqId));

    // Remove expenses and expense splits
    const expenseKeys = Array.from(this.expenses.keys()).filter(expId => {
      const expense = this.expenses.get(expId);
      return expense?.tripId === id;
    });
    expenseKeys.forEach(expId => {
      // Remove associated expense splits first
      const splitKeys = Array.from(this.expenseSplits.keys()).filter(splitId => {
        const split = this.expenseSplits.get(splitId);
        return split?.expenseId === expId;
      });
      splitKeys.forEach(splitId => this.expenseSplits.delete(splitId));
      
      // Remove expense
      this.expenses.delete(expId);
    });

    // Finally remove the trip
    this.trips.delete(id);
    return true;
  }

  // Fix existing trips with broken Egypt images
  async fixEgyptTrips(): Promise<void> {
    const trips = Array.from(this.trips.values());
    const brokenImageUrl = "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80";
    const newImageUrl = "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80";
    
    for (const trip of trips) {
      if (trip.coverImage === brokenImageUrl && 
          (trip.destination.toLowerCase().includes('egito') || 
           trip.destination.toLowerCase().includes('cairo'))) {
        console.log(`🔧 Corrigindo imagem da viagem do Egito: ${trip.title}`);
        trip.coverImage = newImageUrl;
        this.trips.set(trip.id, trip);
      }
    }
  }

  async getTripParticipants(tripId: number): Promise<(TripParticipant & { user: User })[]> {
    const participants = Array.from(this.tripParticipants.values())
      .filter(p => p.tripId === tripId);

    return participants.map(p => {
      const user = this.users.get(p.userId)!;
      return { ...p, user: this.sanitizeUser(user) as User };
    });
  }

  async addTripParticipant(tripId: number, userId: number): Promise<TripParticipant> {
    const id = this.currentParticipantId++;
    const participant: TripParticipant = {
      id,
      tripId,
      userId,
      status: 'accepted',
      joinedAt: new Date()
    };

    this.tripParticipants.set(`${tripId}-${userId}`, participant);
    return participant;
  }

  async updateTripParticipant(tripId: number, userId: number, status: string): Promise<TripParticipant | undefined> {
    const key = `${tripId}-${userId}`;
    const participant = this.tripParticipants.get(key);
    if (!participant) return undefined;

    const updatedParticipant = { ...participant, status };
    this.tripParticipants.set(key, updatedParticipant);
    return updatedParticipant;
  }

  async removeTripParticipant(tripId: number, userId: number): Promise<void> {
    const trip = this.trips.get(tripId);
    if (!trip) return;

    const key = `${tripId}-${userId}`;
    this.tripParticipants.delete(key);

    // Get remaining participants after removal
    const participants = await this.getTripParticipants(tripId);
    const activeParticipants = participants.filter(p => p.status === 'accepted');
    
    if (activeParticipants.length === 0) {
      // No participants left, delete the trip completely
      await this.deleteTrip(tripId);
      console.log(`❌ Viagem ${tripId} cancelada - sem participantes restantes`);
    } else {
      // Check if removed user was the creator
      if (trip.creatorId === userId) {
        // Transfer organizer role to oldest active participant (first one in the list)
        const newOrganizer = activeParticipants[0];
        await this.updateTrip(tripId, { 
          creatorId: newOrganizer.userId,
          currentParticipants: activeParticipants.length
        });
        console.log(`✅ Organização da viagem ${tripId} transferida para usuário ${newOrganizer.user.username}`);
      } else {
        // Just update participant count
        await this.updateTrip(tripId, { 
          currentParticipants: activeParticipants.length
        });
      }
    }
  }

  async recalculateExpenseSplits(tripId: number): Promise<void> {
    // Get all expenses for this trip that were split equally among all participants
    const expenses = await this.getTripExpenses(tripId);
    const participants = await this.getTripParticipants(tripId);
    const activeParticipants = participants.filter(p => p.status === 'accepted');
    
    for (const expense of expenses) {
      // Check if this expense was split equally among all participants
      const splits = Array.from(this.expenseSplits.values())
        .filter(split => split.expenseId === expense.id);
      
      // If the number of splits matches the number of participants at the time,
      // recalculate with new participants
      if (splits.length > 0) {
        const newSplitAmount = expense.amount / activeParticipants.length;
        
        // Remove existing splits
        splits.forEach(split => this.expenseSplits.delete(split.id));
        
        // Create new splits for all current participants
        for (const participant of activeParticipants) {
          const newSplit: ExpenseSplit = {
            id: this.currentExpenseSplitId++,
            expenseId: expense.id,
            userId: participant.userId,
            amount: newSplitAmount,
            paid: participant.userId === expense.paidBy,
            settledAt: null,
          };
          
          this.expenseSplits.set(newSplit.id, newSplit);
        }
      }
    }
  }

  async getTripMessages(tripId: number): Promise<(Message & { sender: User })[]> {
    const tripMessages = Array.from(this.messages.values())
      .filter(m => m.tripId === tripId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

    return tripMessages.map(m => {
      const sender = this.users.get(m.senderId)!;
      return { ...m, sender: this.sanitizeUser(sender) as User };
    });
  }

  async createMessage(messageData: InsertMessage & { senderId: number }): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...messageData, 
      id, 
      sentAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getTripRequests(tripId: number): Promise<(TripRequest & { user: User })[]> {
    const requests = Array.from(this.tripRequests.values())
      .filter(r => r.tripId === tripId);

    return requests.map(r => {
      const user = this.users.get(r.userId)!;
      return { ...r, user: this.sanitizeUser(user) as User };
    });
  }

  async getUserTripRequests(userId: number): Promise<(TripRequest & { trip: Trip })[]> {
    const requests = Array.from(this.tripRequests.values())
      .filter(r => r.userId === userId);

    return requests.map(r => {
      const trip = this.trips.get(r.tripId)!;
      return { ...r, trip };
    });
  }

  async createTripRequest(requestData: InsertTripRequest & { userId: number }): Promise<TripRequest> {
    const id = this.currentRequestId++;
    const request: TripRequest = { 
      ...requestData, 
      id, 
      status: 'pending',
      message: requestData.message || null,
      createdAt: new Date() 
    };
    this.tripRequests.set(id, request);
    return request;
  }

  async updateTripRequest(id: number, status: string): Promise<TripRequest | undefined> {
    const request = this.tripRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, status };
    this.tripRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Expense methods
  async getTripExpenses(tripId: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]> {
    const tripExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.tripId === tripId);
    
    const result = [];
    for (const expense of tripExpenses) {
      const payer = await this.getUser(expense.paidBy);
      if (!payer) continue;

      const splits = Array.from(this.expenseSplits.values())
        .filter(split => split.expenseId === expense.id);
      
      const splitsWithUsers = [];
      for (const split of splits) {
        const user = await this.getUser(split.userId);
        if (user) {
          splitsWithUsers.push({ ...split, user: this.sanitizeUser(user) as User });
        }
      }

      result.push({ ...expense, payer: this.sanitizeUser(payer) as User, splits: splitsWithUsers });
    }
    
    return result;
  }

  async createExpense(expenseData: InsertExpense & { paidBy: number }): Promise<Expense> {
    const expense: Expense = {
      id: this.currentExpenseId++,
      tripId: expenseData.tripId,
      paidBy: expenseData.paidBy,
      amount: expenseData.amount,
      description: expenseData.description,
      category: expenseData.category,
      receipt: expenseData.receipt || null,
      createdAt: new Date(),
      settledAt: null,
    };
    
    this.expenses.set(expense.id, expense);
    return expense;
  }

  async createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    const createdSplits: ExpenseSplit[] = [];
    
    for (const split of splits) {
      const expenseSplit: ExpenseSplit = {
        id: this.currentExpenseSplitId++,
        expenseId: split.expenseId,
        userId: split.userId,
        amount: split.amount,
        paid: split.paid || false,
        settledAt: null,
      };
      
      this.expenseSplits.set(expenseSplit.id, expenseSplit);
      createdSplits.push(expenseSplit);
    }
    
    return createdSplits;
  }

  async updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined> {
    const split = this.expenseSplits.get(id);
    if (!split) return undefined;

    const updatedSplit = { 
      ...split, 
      paid,
      settledAt: paid ? new Date() : null 
    };
    this.expenseSplits.set(id, updatedSplit);
    return updatedSplit;
  }

  async getTripBalances(tripId: number): Promise<{ userId: number; user: User; balance: number }[]> {
    const participants = await this.getTripParticipants(tripId);
    const balances = new Map<number, number>();

    // Initialize balances for all participants
    for (const participant of participants) {
      balances.set(participant.userId, 0);
    }

    // Calculate balances based on expenses and splits
    const expenses = await this.getTripExpenses(tripId);
    for (const expense of expenses) {
      // Payer gets credit for the full amount
      const payerBalance = balances.get(expense.paidBy) || 0;
      balances.set(expense.paidBy, payerBalance + expense.amount);

      // Each person in the split owes their portion
      for (const split of expense.splits) {
        const splitBalance = balances.get(split.userId) || 0;
        balances.set(split.userId, splitBalance - split.amount);
      }
    }

    // Convert to array with user info
    const result = [];
    for (const [userId, balance] of balances.entries()) {
      const user = await this.getUser(userId);
      if (user) {
        result.push({ userId, user: this.sanitizeUser(user) as User, balance });
      }
    }

    return result;
  }
}

export const storage = new MemStorage();

// Create default test user
async function createDefaultTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByUsername('tom');

    if (!existingUser) {
      // Import crypto functions for password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash the password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Create the test user
      const user = await storage.createUser({
        username: 'tom',
        email: 'tom@teste.com',
        fullName: 'Tom Tubin',
        password: hashedPassword,
        bio: 'Usuário de teste padrão',
        location: 'Porto Alegre, RS',
        travelStyle: 'urbanas',
        languages: ['Português', 'Inglês'],
        interests: ['Aventura', 'Cultura', 'Gastronomia']
      });

      console.log('✅ Usuário de teste criado: tom / demo123');
      
      // Criar viagens padrão para o usuário Tom
      await createDefaultTrips(user);
      
      // Corrigir viagens existentes com imagens quebradas do Egito
      await storage.fixEgyptTrips();
    } else {
      console.log('ℹ️ Usuário de teste já existe: tom');
    }
    
    // Criar segundo usuário para teste de participação
    await createSecondTestUser();
    
    // Criar usuários adicionais e viagens históricas/futuras
    await createAdditionalTestUsers();
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

// Create second test user for participation testing
async function createSecondTestUser() {
  try {
    // Check if second test user already exists
    const existingUser = await storage.getUserByUsername('maria');

    if (!existingUser) {
      // Import crypto functions for password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash the password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Create the second test user
      const user = await storage.createUser({
        username: 'maria',
        email: 'maria@teste.com',
        fullName: 'Maria Santos',
        password: hashedPassword,
        bio: 'Usuária de teste para participação',
        location: 'Rio de Janeiro, RJ',
        travelStyle: 'praia',
        languages: ['Português', 'Espanhol'],
        interests: ['Praia', 'Cultura', 'Fotografia']
      });

      console.log('✅ Segundo usuário de teste criado: maria / demo123');
      
      // Criar viagem da Maria e adicionar Tom como participante
      await createMariaTripsWithTomAsParticipant(user);
    } else {
      console.log('ℹ️ Segundo usuário de teste já existe: maria');
    }
  } catch (error) {
    console.error('❌ Erro ao criar segundo usuário de teste:', error);
  }
}

// Create Maria's trips and add Tom as participant
async function createMariaTripsWithTomAsParticipant(maria: User) {
  try {
    // Verificar se já existem viagens da Maria
    const existingTrips = await storage.getTripsByCreator(maria.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens da Maria já existem');
      return;
    }

    // Criar viagem da Maria
    const trip = await storage.createTrip({
      title: 'Praia e Cultura no Rio de Janeiro',
      destination: 'Rio de Janeiro, RJ',
      coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-15'),
      budget: 1600,
      maxParticipants: 4,
      description: 'Descubra o Rio de Janeiro! Praias de Copacabana e Ipanema, Cristo Redentor, Pão de Açúcar, e muito mais. Inclui hospedagem em Copacabana e passeios culturais.',
      travelStyle: 'praia',
      sharedCosts: ['accommodation', 'transport', 'activities'],
      budgetBreakdown: {
        transport: 400,
        accommodation: 800,
        food: 400
      },
      creatorId: maria.id
    });

    // Adicionar Tom como participante aceito
    const tomUser = await storage.getUserByUsername('tom');
    if (tomUser) {
      await storage.addTripParticipant(trip.id, tomUser.id);
      console.log('✅ Tom adicionado como participante na viagem da Maria');
    }

    console.log('✅ Viagem da Maria criada com Tom como participante');
  } catch (error) {
    console.error('❌ Erro ao criar viagem da Maria:', error);
  }
}

async function createDefaultTrips(user: User) {
  try {
    // Verificar se já existem viagens
    const existingTrips = await storage.getTripsByCreator(user.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens de teste já existem para o usuário tom');
      return;
    }

    // Criar viagem 1: Trilha na Chapada Diamantina
    const trip1 = await storage.createTrip({
      title: 'Trilha na Chapada Diamantina',
      destination: 'Chapada Diamantina, BA',
      coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-22'),
      budget: 2100,
      maxParticipants: 6,
      description: 'Aventura incrível na Chapada Diamantina! Vamos explorar cachoeiras, fazer trilhas e acampar sob as estrelas. Inclui visitas ao Poço Azul, Cachoeira da Fumaça e Vale do Pati.',
      travelStyle: 'aventura',
      sharedCosts: ['accommodation', 'transport', 'food'],
      creatorId: user.id,
      budgetBreakdown: {
        transport: 800,
        accommodation: 600,
        food: 700
      }
    });

    // Criar viagem 2: Fim de semana em Campos do Jordão
    const trip2 = await storage.createTrip({
      title: 'Fim de semana relaxante em Campos do Jordão',
      destination: 'Campos do Jordão, SP',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-03'),
      budget: 1200,
      maxParticipants: 4,
      description: 'Escapada perfeita para relaxar no clima de montanha. Pousada aconchegante, gastronomia local, passeios de teleférico e muito chocolate! Ideal para quem quer descansar.',
      travelStyle: 'neve',
      sharedCosts: ['accommodation', 'transport'],
      creatorId: user.id,
      budgetBreakdown: {
        transport: 300,
        accommodation: 600,
        food: 300
      }
    });

    // Criar viagem 3: Cruzeiro pelo Mediterrâneo
    const trip3 = await storage.createTrip({
      title: 'Cruzeiro pelo Mediterrâneo',
      destination: 'Mediterrâneo',
      coverImage: 'https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg',
      startDate: new Date('2025-09-20'),
      endDate: new Date('2025-09-27'),
      budget: 3300,
      maxParticipants: 8,
      description: 'Cruzeiro de luxo pelo Mediterrâneo visitando Roma, Barcelona, Marselha e Nápoles. Inclui todas as refeições a bordo, entretenimento e excursões nos portos.',
      travelStyle: 'cruzeiros',
      sharedCosts: ['accommodation', 'transport', 'food'],
      creatorId: user.id,
      budgetBreakdown: {
        transport: 1500,
        accommodation: 1200,
        food: 600
      }
    });

    console.log('✅ Viagens padrão criadas:', trip1.title, trip2.title, 'e', trip3.title);
  } catch (error) {
    console.error('❌ Erro ao criar viagens padrão:', error);
  }
}

// Create additional test users and historical/future trips
async function createAdditionalTestUsers() {
  try {
    // Create additional test users
    const users = [
      {
        username: 'carlos',
        email: 'carlos@teste.com',
        fullName: 'Carlos Silva',
        location: 'Belo Horizonte, MG',
        travelStyle: 'aventura',
        languages: ['Português'],
        interests: ['Montanha', 'Aventura', 'Natureza'],
        bio: 'Aventureiro apaixonado por trilhas e montanhas'
      },
      {
        username: 'ana',
        email: 'ana@teste.com',
        fullName: 'Ana Costa',
        location: 'Salvador, BA',
        travelStyle: 'praia',
        languages: ['Português', 'Inglês'],
        interests: ['Praia', 'Música', 'Dança'],
        bio: 'Amo praia, música e conhecer novas culturas'
      },
      {
        username: 'ricardo',
        email: 'ricardo@teste.com',
        fullName: 'Ricardo Oliveira',
        location: 'Curitiba, PR',
        travelStyle: 'culturais',
        languages: ['Português', 'Espanhol', 'Francês'],
        interests: ['História', 'Arquitetura', 'Museus'],
        bio: 'Historiador e amante da cultura mundial'
      },
      {
        username: 'julia',
        email: 'julia@teste.com',
        fullName: 'Julia Mendes',
        location: 'Fortaleza, CE',
        travelStyle: 'natureza',
        languages: ['Português', 'Inglês'],
        interests: ['Natureza', 'Fotografia', 'Ecoturismo'],
        bio: 'Bióloga e fotógrafa da natureza'
      }
    ];

    // Create users if they don't exist
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await storage.getUserByUsername(userData.username);
      if (!existingUser) {
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
        const hashedPassword = `${buf.toString("hex")}.${salt}`;

        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        });
        createdUsers.push(user);
        console.log(`✅ Usuário ${userData.username} criado`);
      } else {
        createdUsers.push(existingUser);
      }
    }

    // Get Tom user
    const tomUser = await storage.getUserByUsername('tom');
    if (!tomUser) return;

    // Create 10 historical trips (completed in 2025)
    const historicalTrips = [
      {
        title: 'Aventura no Pantanal',
        destination: 'Pantanal, MS',
        coverImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-15'),
        budget: 2800,
        maxParticipants: 6,
        description: 'Safari fotográfico no Pantanal com observação de jacarés, capivaras e onças. Inclui hospedagem em fazenda ecológica.',
        travelStyle: 'natureza',
        creatorId: tomUser.id,
        status: 'completed',
        participants: [createdUsers[0].id, createdUsers[1].id]
      },
      {
        title: 'Carnaval em Salvador',
        destination: 'Salvador, BA',
        coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
        startDate: new Date('2025-02-20'),
        endDate: new Date('2025-02-25'),
        budget: 1800,
        maxParticipants: 8,
        description: 'Carnaval em Salvador com trio elétrico, shows e muita festa. Hospedagem no Pelourinho.',
        travelStyle: 'culturais',
        creatorId: createdUsers[1].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[2].id]
      },
      {
        title: 'Trilha na Serra da Mantiqueira',
        destination: 'Mantiqueira, MG',
        coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-03-18'),
        budget: 1400,
        maxParticipants: 5,
        description: 'Trilha de 3 dias na Serra da Mantiqueira com acampamento e vistas espetaculares.',
        travelStyle: 'aventura',
        creatorId: createdUsers[0].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[3].id]
      },
      {
        title: 'Praias de Maragogi',
        destination: 'Maragogi, AL',
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-07'),
        budget: 2200,
        maxParticipants: 6,
        description: 'Semana nas praias paradisíacas de Maragogi com mergulho nas piscinas naturais.',
        travelStyle: 'praia',
        creatorId: tomUser.id,
        status: 'completed',
        participants: [createdUsers[1].id, createdUsers[2].id]
      },
      {
        title: 'Cultura em Ouro Preto',
        destination: 'Ouro Preto, MG',
        coverImage: 'https://images.unsplash.com/photo-1571104508999-893933ded431?w=800&q=80',
        startDate: new Date('2025-04-20'),
        endDate: new Date('2025-04-24'),
        budget: 1600,
        maxParticipants: 4,
        description: 'Turismo histórico em Ouro Preto com visita às igrejas coloniais e museus.',
        travelStyle: 'culturais',
        creatorId: createdUsers[2].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[0].id]
      },
      {
        title: 'Amazônia - Manaus',
        destination: 'Manaus, AM',
        coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
        startDate: new Date('2025-05-10'),
        endDate: new Date('2025-05-16'),
        budget: 3200,
        maxParticipants: 8,
        description: 'Expedição na Amazônia com visita ao encontro das águas e trilhas na floresta.',
        travelStyle: 'natureza',
        creatorId: createdUsers[3].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[1].id]
      },
      {
        title: 'Surf em Florianópolis',
        destination: 'Florianópolis, SC',
        coverImage: 'https://images.unsplash.com/photo-1574798834391-25b2b7f98b58?w=800&q=80',
        startDate: new Date('2025-05-25'),
        endDate: new Date('2025-05-30'),
        budget: 1900,
        maxParticipants: 6,
        description: 'Semana de surf em Floripa com aulas e muito beach life.',
        travelStyle: 'praia',
        creatorId: tomUser.id,
        status: 'completed',
        participants: [createdUsers[0].id, createdUsers[3].id]
      },
      {
        title: 'Vinícolas na Serra Gaúcha',
        destination: 'Gramado, RS',
        coverImage: 'https://images.unsplash.com/photo-1560024966-b4a35a6b8bcc?w=800&q=80',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-20'),
        budget: 2400,
        maxParticipants: 5,
        description: 'Tour pelas vinícolas da Serra Gaúcha com degustação e culinária local.',
        travelStyle: 'culturais',
        creatorId: createdUsers[2].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[1].id]
      },
      {
        title: 'Lençóis Maranhenses',
        destination: 'Lençóis Maranhenses, MA',
        coverImage: 'https://images.unsplash.com/photo-1629495171936-a5e5bfb3a8be?w=800&q=80',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-06'),
        budget: 2600,
        maxParticipants: 7,
        description: 'Aventura nos Lençóis Maranhenses com passeios de buggy e banho nas lagoas.',
        travelStyle: 'natureza',
        creatorId: createdUsers[0].id,
        status: 'completed',
        participants: [tomUser.id, createdUsers[2].id, createdUsers[3].id]
      },
      {
        title: 'Festa Junina em Caruaru',
        destination: 'Caruaru, PE',
        coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
        startDate: new Date('2025-06-23'),
        endDate: new Date('2025-06-26'),
        budget: 1500,
        maxParticipants: 6,
        description: 'Maior São João do mundo em Caruaru com forró, quadrilha e comida típica.',
        travelStyle: 'culturais',
        creatorId: tomUser.id,
        status: 'completed',
        participants: [createdUsers[1].id, createdUsers[2].id]
      }
    ];

    // Create historical trips
    for (const tripData of historicalTrips) {
      const existingTrip = await storage.getTrips({ destination: tripData.destination });
      const tripExists = existingTrip.some(t => t.title === tripData.title);
      
      if (!tripExists) {
        const { participants, ...tripInfo } = tripData;
        const trip = await storage.createTrip({
          ...tripInfo,
          budgetBreakdown: {
            transport: Math.floor(tripInfo.budget * 0.4),
            accommodation: Math.floor(tripInfo.budget * 0.4),
            food: Math.floor(tripInfo.budget * 0.2)
          }
        });

        // Add participants
        for (const participantId of participants) {
          await storage.addTripParticipant(trip.id, participantId);
        }
      }
    }

    // Create 4 future trips
    const futureTrips = [
      {
        title: 'Réveillon em Copacabana',
        destination: 'Rio de Janeiro, RJ',
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
        startDate: new Date('2025-12-29'),
        endDate: new Date('2026-01-02'),
        budget: 2800,
        maxParticipants: 8,
        description: 'Réveillon em Copacabana com festa na praia e shows.',
        travelStyle: 'culturais',
        creatorId: createdUsers[1].id,
        participants: [tomUser.id, createdUsers[2].id]
      },
      {
        title: 'Patagônia Argentina',
        destination: 'El Calafate, Argentina',
        coverImage: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&q=80',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-25'),
        budget: 4200,
        maxParticipants: 6,
        description: 'Aventura na Patagônia com glaciares e trekkings épicos.',
        travelStyle: 'aventura',
        creatorId: tomUser.id,
        participants: [createdUsers[0].id, createdUsers[3].id]
      },
      {
        title: 'Machu Picchu',
        destination: 'Cusco, Peru',
        coverImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80',
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-17'),
        budget: 3600,
        maxParticipants: 5,
        description: 'Trilha Inca até Machu Picchu com guias locais.',
        travelStyle: 'culturais',
        creatorId: createdUsers[2].id,
        participants: [tomUser.id, createdUsers[1].id]
      },
      {
        title: 'Safári no Quênia',
        destination: 'Nairobi, Quênia',
        coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
        startDate: new Date('2026-04-20'),
        endDate: new Date('2026-04-30'),
        budget: 5800,
        maxParticipants: 4,
        description: 'Safári fotográfico no Quênia com Big Five e Masai Mara.',
        travelStyle: 'natureza',
        creatorId: tomUser.id,
        participants: [createdUsers[0].id, createdUsers[3].id]
      }
    ];

    // Create future trips
    for (const tripData of futureTrips) {
      const existingTrip = await storage.getTrips({ destination: tripData.destination });
      const tripExists = existingTrip.some(t => t.title === tripData.title);
      
      if (!tripExists) {
        const { participants, ...tripInfo } = tripData;
        const trip = await storage.createTrip({
          ...tripInfo,
          budgetBreakdown: {
            transport: Math.floor(tripInfo.budget * 0.4),
            accommodation: Math.floor(tripInfo.budget * 0.4),
            food: Math.floor(tripInfo.budget * 0.2)
          }
        });

        // Add participants
        for (const participantId of participants) {
          await storage.addTripParticipant(trip.id, participantId);
        }
      }
    }

    console.log('✅ Usuários adicionais e viagens históricas/futuras criadas');
  } catch (error) {
    console.error('❌ Erro ao criar usuários e viagens adicionais:', error);
  }
}

// Initialize default test user after storage is created
createDefaultTestUser();