import { users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, userRatings, destinationRatings, verificationRequests, activities, activityReviews, activityBookings, activityBudgetProposals, tripActivities, type User, type InsertUser, type Trip, type InsertTrip, type Message, type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, type UserRating, type InsertUserRating, type DestinationRating, type InsertDestinationRating, type VerificationRequest, type InsertVerificationRequest, type Activity, type InsertActivity, type ActivityReview, type InsertActivityReview, type ActivityBooking, type InsertActivityBooking, type ActivityBudgetProposal, type InsertActivityBudgetProposal, type TripActivity, type InsertTripActivity, popularDestinations } from "@shared/schema";
import { fixCreatorsAsParticipants } from "./fix-creators-as-participants";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, testConnection } from "./db";
import { eq, and, sql, desc, asc, gte, lte, ne, like } from "drizzle-orm";

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
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Trips
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByCreator(creatorId: number): Promise<Trip[]>;
  getTripsByParticipant(userId: number): Promise<Trip[]>;
  getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]>;
  createTrip(trip: InsertTrip & { creatorId: number }): Promise<Trip>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;
  updateTripActivities(tripId: number, plannedActivities: string): Promise<Trip | undefined>;
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

  // User Ratings
  getUserRatings(userId: number): Promise<(UserRating & { rater: User; trip: Trip })[]>;
  createUserRating(rating: InsertUserRating & { raterUserId: number }): Promise<UserRating>;
  updateUserAverageRating(userId: number): Promise<void>;

  // Destination Ratings
  getDestinationRatings(destination: string): Promise<(DestinationRating & { user: User })[]>;
  createDestinationRating(rating: InsertDestinationRating & { userId: number }): Promise<DestinationRating>;
  getDestinationAverageRating(destination: string): Promise<{ average: number; total: number }>;

  // User Verification
  getVerificationRequests(userId?: number): Promise<(VerificationRequest & { user: User })[]>;
  createVerificationRequest(request: InsertVerificationRequest & { userId: number }): Promise<VerificationRequest>;
  updateVerificationRequest(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<VerificationRequest | undefined>;
  updateUserVerificationStatus(userId: number, isVerified: boolean, method?: string): Promise<void>;

  // Activities
  getActivities(filters?: { 
    search?: string; 
    category?: string; 
    location?: string; 
    priceRange?: string; 
    difficulty?: string; 
    duration?: string; 
    rating?: string; 
    sortBy?: string; 
  }): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity & { createdById: number }): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Activity Reviews
  getActivityReviews(activityId: number): Promise<(ActivityReview & { user: User })[]>;
  createActivityReview(review: InsertActivityReview & { userId: number }): Promise<ActivityReview>;
  updateActivityAverageRating(activityId: number): Promise<void>;

  // Activity Bookings
  getActivityBookings(activityId: number): Promise<(ActivityBooking & { user: User })[]>;
  getUserActivityBookings(userId: number): Promise<(ActivityBooking & { activity: Activity })[]>;
  createActivityBooking(booking: InsertActivityBooking & { userId: number }): Promise<ActivityBooking>;
  updateActivityBooking(id: number, status: string): Promise<ActivityBooking | undefined>;

  // Activity Budget Proposals
  getActivityBudgetProposals(activityId: number): Promise<(ActivityBudgetProposal & { creator: User })[]>;
  createActivityBudgetProposal(proposal: InsertActivityBudgetProposal & { createdBy: number }): Promise<ActivityBudgetProposal>;
  updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined>;
  deleteActivityBudgetProposal(id: number): Promise<boolean>;
  voteActivityBudgetProposal(id: number, increment: boolean): Promise<ActivityBudgetProposal | undefined>;

  // Trip Activities - Link activities to trips with selected proposals
  getTripActivities(tripId: number): Promise<(TripActivity & { activity: Activity; proposal: ActivityBudgetProposal; addedByUser: User })[]>;
  addActivityToTrip(tripActivity: InsertTripActivity & { addedBy: number }): Promise<TripActivity>;
  updateTripActivity(id: number, updates: Partial<TripActivity>): Promise<TripActivity | undefined>;
  removeTripActivity(id: number): Promise<boolean>;
  
  // Get user trips in same location as activity
  getUserTripsInLocation(userId: number, location: string): Promise<Trip[]>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  // Helper function to remove sensitive information from user objects
  private sanitizeUser(user: User | undefined): Omit<User, 'password'> | undefined {
    if (!user) return undefined;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Run automatic fix for creators as participants after initialization
    setTimeout(() => this.runCreatorParticipantsFix(), 1000);
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const userArray = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const user = userArray[0];
      
      if (!user) {
        console.log(`❌ Usuário não encontrado no banco: ID ${id}`);
        return undefined;
      }
      
      console.log(`✅ Usuário carregado do banco: ${user.username}, isVerified: ${user.isVerified}`);
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário no banco:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const userArray = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return userArray[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const userArray = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return userArray[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers.find(user => {
        // Remove formatação do telefone armazenado para comparação
        const cleanStoredPhone = user.phone.replace(/\D/g, '');
        return cleanStoredPhone === phone;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por telefone:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values({
        ...insertUser,
        profilePhoto: null,
        bio: insertUser.bio || null,
        location: insertUser.location || null,
        languages: insertUser.languages || null,
        interests: insertUser.interests || null,
        travelStyle: insertUser.travelStyle || null,
        isVerified: false,
        verificationMethod: null,
        averageRating: "0.00",
        totalRatings: 0,
        createdAt: new Date() 
      });
      
      // Get the created user
      const [user] = await db.select().from(users).where(eq(users.id, result[0].insertId));
      return user;
    } catch (error) {
      console.error('❌ Erro ao criar usuário no MySQL:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      await db.update(users).set(updates).where(eq(users.id, id));
      const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
      return updatedUser;
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário no MySQL:', error);
      return undefined;
    }
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    try {
      const [trip] = await db.select().from(trips).where(eq(trips.id, id));
      return trip;
    } catch (error) {
      console.error('❌ Erro ao buscar viagem no MySQL:', error);
      return undefined;
    }
  }

  async getTripsByCreator(creatorId: number): Promise<Trip[]> {
    try {
      const creatorTrips = await db.select().from(trips).where(eq(trips.creatorId, creatorId));
      return creatorTrips;
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do criador no MySQL:', error);
      return [];
    }
  }

  async getTripsByParticipant(userId: number): Promise<Trip[]> {
    try {
      const participantTrips = await db.select({
        id: trips.id,
        title: trips.title,
        destination: trips.destination,
        coverImage: trips.coverImage,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budget: trips.budget,
        maxParticipants: trips.maxParticipants,
        description: trips.description,
        travelStyle: trips.travelStyle,
        creatorId: trips.creatorId,
        status: trips.status,
        budgetBreakdown: trips.budgetBreakdown,
        currentParticipants: trips.currentParticipants,
        sharedCosts: trips.sharedCosts,
        createdAt: trips.createdAt
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
      .where(and(
        eq(tripParticipants.userId, userId),
        eq(tripParticipants.status, 'accepted'),
        ne(trips.creatorId, userId) // Excluir viagens onde o usuário é o criador
      ));

      return participantTrips;
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do participante no MySQL:', error);
      return [];
    }
  }

  async getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]> {
    try {
      let query = db.select().from(trips).where(eq(trips.status, 'open'));

      if (filters) {
        const conditions = [eq(trips.status, 'open')];
        
        if (filters.destination) {
          conditions.push(like(trips.destination, `%${filters.destination}%`));
        }
        if (filters.startDate) {
          conditions.push(gte(trips.startDate, filters.startDate));
        }
        if (filters.endDate) {
          conditions.push(lte(trips.endDate, filters.endDate));
        }
        if (filters.budget) {
          conditions.push(lte(trips.budget, filters.budget));
        }
        if (filters.travelStyle) {
          conditions.push(eq(trips.travelStyle, filters.travelStyle));
        }

        query = db.select().from(trips).where(and(...conditions));
      }

      const allTrips = await query.orderBy(desc(trips.createdAt));
      return allTrips;
    } catch (error) {
      console.error('❌ Erro ao buscar viagens no MySQL:', error);
      return [];
    }
  }

  async createTrip(tripData: InsertTrip & { creatorId: number }): Promise<Trip> {
    try {
      // Automatically assign cover image if not provided
      const coverImage = tripData.coverImage || getCoverImageForDestination(tripData.destination, tripData.travelStyle);
      
      const tripToInsert = {
        ...tripData,
        coverImage,
        budget: tripData.budget ?? null,
        budgetBreakdown: tripData.budgetBreakdown || null,
        currentParticipants: 1,
        status: 'open' as const,
        sharedCosts: tripData.sharedCosts || null,
        createdAt: new Date()
      };

      const result = await db.insert(trips).values(tripToInsert);
      const tripId = result[0].insertId;

      // Get the created trip
      const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

      console.log(`✅ Viagem criada no MySQL com ID ${tripId}: ${trip.title}`);

      // Add creator as participant
      await this.addTripParticipant(tripId, tripData.creatorId);

      return trip;
    } catch (error) {
      console.error('❌ Erro ao criar viagem no MySQL:', error);
      throw error;
    }
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    try {
      await db.update(trips).set(updates).where(eq(trips.id, id));
      const [updatedTrip] = await db.select().from(trips).where(eq(trips.id, id));
      return updatedTrip;
    } catch (error) {
      console.error('❌ Erro ao atualizar viagem no MySQL:', error);
      return undefined;
    }
  }

  async updateTripActivities(tripId: number, plannedActivities: string): Promise<Trip | undefined> {
    try {
      await db.update(trips).set({ plannedActivities }).where(eq(trips.id, tripId));
      const [updatedTrip] = await db.select().from(trips).where(eq(trips.id, tripId));
      return updatedTrip;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividades da viagem no MySQL:', error);
      return undefined;
    }
  }

  async deleteTrip(id: number): Promise<boolean> {
    try {
      // Remove all associated data using MySQL cascading
      await db.delete(trips).where(eq(trips.id, id));
      
      // The foreign key constraints should handle cascading deletes
      // But let's manually clean up to be safe
      await db.delete(tripParticipants).where(eq(tripParticipants.tripId, id));
      await db.delete(messages).where(eq(messages.tripId, id));
      await db.delete(tripRequests).where(eq(tripRequests.tripId, id));
      
      // Remove expenses and their splits
      const tripExpenses = await db.select().from(expenses).where(eq(expenses.tripId, id));
      for (const expense of tripExpenses) {
        await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expense.id));
      }
      await db.delete(expenses).where(eq(expenses.tripId, id));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar viagem no MySQL:', error);
      return false;
    }
  }

  // Fix existing trips with broken Egypt images
  async fixEgyptTrips(): Promise<void> {
    try {
      const brokenImageUrl = "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80";
      const newImageUrl = "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80";
      
      const trips = await db.select().from(trips);
      
      for (const trip of trips) {
        if (trip.coverImage === brokenImageUrl && 
            (trip.destination.toLowerCase().includes('egito') || 
             trip.destination.toLowerCase().includes('cairo'))) {
          console.log(`🔧 Corrigindo imagem da viagem do Egito: ${trip.title}`);
          await db.update(trips).set({ coverImage: newImageUrl }).where(eq(trips.id, trip.id));
        }
      }
    } catch (error) {
      console.error('❌ Erro ao corrigir imagens do Egito:', error);
    }
  }

  async getTripParticipants(tripId: number): Promise<(TripParticipant & { user: User })[]> {
    try {
      const participants = await db.select()
        .from(tripParticipants)
        .where(eq(tripParticipants.tripId, tripId));

      console.log(`📋 Encontrados ${participants.length} participantes no MySQL para viagem ${tripId}`);
      
      const result = [];
      for (const p of participants) {
        // Get user from MySQL
        const userArray = await db.select().from(users).where(eq(users.id, p.userId)).limit(1);
        if (userArray.length > 0) {
          const sanitizedUser = this.sanitizeUser(userArray[0]);
          if (sanitizedUser) {
            result.push({ ...p, user: sanitizedUser as User });
          }
        }
      }
      return result;
    } catch (error) {
      console.error(`❌ Erro ao buscar participantes do MySQL para viagem ${tripId}:`, error);
      return [];
    }
  }

  async addTripParticipant(tripId: number, userId: number): Promise<TripParticipant> {
    try {
      // Check if participant already exists in MySQL
      const existingParticipant = await db.select()
        .from(tripParticipants)
        .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.userId, userId)))
        .limit(1);

      if (existingParticipant.length > 0) {
        console.log(`ℹ️ Participante ${userId} já existe na viagem ${tripId}`);
        return existingParticipant[0];
      }

      const result = await db.insert(tripParticipants).values({
        tripId,
        userId,
        status: 'accepted',
        joinedAt: new Date()
      });

      const [participant] = await db.select().from(tripParticipants).where(eq(tripParticipants.id, result[0].insertId));
      
      console.log(`✅ Participante ${userId} adicionado à viagem ${tripId} no MySQL`);
      return participant;
    } catch (error) {
      console.error('❌ Erro ao adicionar participante no MySQL:', error);
      throw error;
    }
  }

  async updateTripParticipant(tripId: number, userId: number, status: string): Promise<TripParticipant | undefined> {
    try {
      await db.update(tripParticipants)
        .set({ status })
        .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.userId, userId)));

      const [updatedParticipant] = await db.select()
        .from(tripParticipants)
        .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.userId, userId)));

      return updatedParticipant;
    } catch (error) {
      console.error('❌ Erro ao atualizar participante no MySQL:', error);
      return undefined;
    }
  }

  async removeTripParticipant(tripId: number, userId: number): Promise<void> {
    try {
      const trip = await this.getTrip(tripId);
      if (!trip) return;

      // Remove participant from MySQL
      await db.delete(tripParticipants)
        .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.userId, userId)));

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
    } catch (error) {
      console.error('❌ Erro ao remover participante no MySQL:', error);
    }
  }

  async recalculateExpenseSplits(tripId: number): Promise<void> {
    try {
      // Get all expenses for this trip that were split equally among all participants
      const expenses = await this.getTripExpenses(tripId);
      const participants = await this.getTripParticipants(tripId);
      const activeParticipants = participants.filter(p => p.status === 'accepted');
      
      for (const expense of expenses) {
        // Check if this expense was split equally among all participants
        const splits = await db.select().from(expenseSplits)
          .where(eq(expenseSplits.expenseId, expense.id));
        
        // If the number of splits matches the number of participants at the time,
        // recalculate with new participants
        if (splits.length > 0) {
          const newSplitAmount = expense.amount / activeParticipants.length;
          
          // Remove existing splits
          await db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expense.id));
          
          // Create new splits for all current participants
          for (const participant of activeParticipants) {
            await db.insert(expenseSplits).values({
              expenseId: expense.id,
              userId: participant.userId,
              amount: newSplitAmount,
              paid: participant.userId === expense.paidBy,
              settledAt: null,
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao recalcular divisões de despesas:', error);
    }
  }

  async getTripMessages(tripId: number): Promise<(Message & { sender: User })[]> {
    try {
      const tripMessages = await db.select().from(messages)
        .where(eq(messages.tripId, tripId))
        .orderBy(messages.sentAt);

      const result = [];
      for (const message of tripMessages) {
        const sender = await this.getUser(message.senderId);
        if (sender) {
          result.push({ ...message, sender: this.sanitizeUser(sender) as User });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async createMessage(messageData: InsertMessage & { senderId: number }): Promise<Message> {
    try {
      const [insertedMessage] = await db.insert(messages).values({
        tripId: messageData.tripId,
        senderId: messageData.senderId,
        content: messageData.content,
        sentAt: new Date()
      });
      
      // Get the inserted message to return it
      const messageId = insertedMessage.insertId;
      const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
      
      return message;
    } catch (error) {
      console.error('❌ Erro ao criar mensagem:', error);
      throw error;
    }
  }

  async getTripRequests(tripId: number): Promise<(TripRequest & { user: User })[]> {
    try {
      const requests = await db.select().from(tripRequests)
        .where(eq(tripRequests.tripId, tripId));

      const result = [];
      for (const request of requests) {
        const user = await this.getUser(request.userId);
        if (user) {
          result.push({ ...request, user: this.sanitizeUser(user) as User });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de viagem:', error);
      return [];
    }
  }

  async getUserTripRequests(userId: number): Promise<(TripRequest & { trip: Trip })[]> {
    try {
      const requests = await db.select().from(tripRequests)
        .where(eq(tripRequests.userId, userId));

      const result = [];
      for (const request of requests) {
        const trip = await this.getTrip(request.tripId);
        if (trip) {
          result.push({ ...request, trip });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações do usuário:', error);
      return [];
    }
  }

  async createTripRequest(requestData: InsertTripRequest & { userId: number }): Promise<TripRequest> {
    try {
      const result = await db.insert(tripRequests).values({
        tripId: requestData.tripId,
        userId: requestData.userId,
        message: requestData.message || null,
        status: 'pending',
        createdAt: new Date()
      });

      const [request] = await db.select().from(tripRequests).where(eq(tripRequests.id, result[0].insertId));
      return request;
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de viagem:', error);
      throw error;
    }
  }

  async updateTripRequest(id: number, status: string): Promise<TripRequest | undefined> {
    try {
      await db.update(tripRequests).set({ status }).where(eq(tripRequests.id, id));
      const [updatedRequest] = await db.select().from(tripRequests).where(eq(tripRequests.id, id));
      return updatedRequest;
    } catch (error) {
      console.error('❌ Erro ao atualizar solicitação de viagem:', error);
      return undefined;
    }
  }

  // Expense methods
  async getTripExpenses(tripId: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]> {
    try {
      const tripExpenses = await db.select().from(expenses)
        .where(eq(expenses.tripId, tripId));
      
      const result = [];
      for (const expense of tripExpenses) {
        const payer = await this.getUser(expense.paidBy);
        if (!payer) continue;

        const splits = await db.select().from(expenseSplits)
          .where(eq(expenseSplits.expenseId, expense.id));
        
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
    } catch (error) {
      console.error('❌ Erro ao buscar despesas da viagem:', error);
      return [];
    }
  }

  async createExpense(expenseData: InsertExpense & { paidBy: number }): Promise<Expense> {
    try {
      const result = await db.insert(expenses).values({
        tripId: expenseData.tripId,
        paidBy: expenseData.paidBy,
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        receipt: expenseData.receipt || null,
        createdAt: new Date(),
        settledAt: null,
      });
      
      const [expense] = await db.select().from(expenses).where(eq(expenses.id, result[0].insertId));
      return expense;
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error);
      throw error;
    }
  }

  async createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    try {
      const createdSplits: ExpenseSplit[] = [];
      
      for (const split of splits) {
        const result = await db.insert(expenseSplits).values({
          expenseId: split.expenseId,
          userId: split.userId,
          amount: split.amount,
          paid: split.paid || false,
          settledAt: null,
        });
        
        const [expenseSplit] = await db.select().from(expenseSplits).where(eq(expenseSplits.id, result[0].insertId));
        createdSplits.push(expenseSplit);
      }
      
      return createdSplits;
    } catch (error) {
      console.error('❌ Erro ao criar divisões de despesa:', error);
      throw error;
    }
  }

  async updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined> {
    try {
      await db.update(expenseSplits).set({ 
        paid, 
        settledAt: paid ? new Date() : null 
      }).where(eq(expenseSplits.id, id));
      
      const [updatedSplit] = await db.select().from(expenseSplits).where(eq(expenseSplits.id, id));
      return updatedSplit;
    } catch (error) {
      console.error('❌ Erro ao atualizar divisão de despesa:', error);
      return undefined;
    }
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

  // User Rating Methods
  async getUserRatings(userId: number): Promise<(UserRating & { rater: User; trip: Trip })[]> {
    try {
      const ratings = await db.select().from(userRatings)
        .where(eq(userRatings.ratedUserId, userId));

      const result = [];
      for (const rating of ratings) {
        const rater = await this.getUser(rating.raterUserId);
        const trip = await this.getTrip(rating.tripId);
        if (rater && trip) {
          result.push({
            ...rating,
            rater: this.sanitizeUser(rater) as User,
            trip
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do usuário:', error);
      return [];
    }
  }

  async createUserRating(ratingData: InsertUserRating & { raterUserId: number }): Promise<UserRating> {
    try {
      const result = await db.insert(userRatings).values({
        ...ratingData,
        createdAt: new Date(),
      });
      
      const [rating] = await db.select().from(userRatings).where(eq(userRatings.id, result[0].insertId));
      
      // Update user's average rating
      await this.updateUserAverageRating(ratingData.ratedUserId);
      
      return rating;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação do usuário:', error);
      throw error;
    }
  }

  async updateUserAverageRating(userId: number): Promise<void> {
    try {
      const ratings = await db.select().from(userRatings)
        .where(eq(userRatings.ratedUserId, userId));
      
      if (ratings.length === 0) {
        return;
      }
      
      const average = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
      
      await db.update(users).set({
        averageRating: average.toFixed(2),
        totalRatings: ratings.length
      }).where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ Erro ao atualizar avaliação média do usuário:', error);
    }
  }

  // Destination Rating Methods
  async getDestinationRatings(destination: string): Promise<(DestinationRating & { user: User })[]> {
    try {
      const ratings = await db.select().from(destinationRatings)
        .where(eq(destinationRatings.destination, destination));

      const result = [];
      for (const rating of ratings) {
        const user = await this.getUser(rating.userId);
        if (user) {
          result.push({
            ...rating,
            user: this.sanitizeUser(user) as User
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do destino:', error);
      return [];
    }
  }

  async createDestinationRating(ratingData: InsertDestinationRating & { userId: number }): Promise<DestinationRating> {
    try {
      const result = await db.insert(destinationRatings).values({
        ...ratingData,
        createdAt: new Date(),
      });
      
      const [rating] = await db.select().from(destinationRatings).where(eq(destinationRatings.id, result[0].insertId));
      return rating;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação do destino:', error);
      throw error;
    }
  }

  async getDestinationAverageRating(destination: string): Promise<{ average: number; total: number }> {
    try {
      const ratings = await db.select().from(destinationRatings)
        .where(eq(destinationRatings.destination, destination));
      
      if (ratings.length === 0) {
        return { average: 0, total: 0 };
      }
      
      const average = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
      return { average: Math.round(average * 10) / 10, total: ratings.length };
    } catch (error) {
      console.error('❌ Erro ao buscar avaliação média do destino:', error);
      return { average: 0, total: 0 };
    }
  }

  // Verification Methods
  async getVerificationRequests(userId?: number): Promise<(VerificationRequest & { user: User })[]> {
    try {
      let query = db.select().from(verificationRequests);
      
      if (userId) {
        query = query.where(eq(verificationRequests.userId, userId));
      }
      
      const requests = await query;
      const result = [];
      
      for (const request of requests) {
        const user = await this.getUser(request.userId);
        if (user) {
          result.push({
            ...request,
            user: this.sanitizeUser(user) as User
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de verificação:', error);
      return [];
    }
  }

  async createVerificationRequest(requestData: InsertVerificationRequest & { userId: number }): Promise<VerificationRequest> {
    try {
      const result = await db.insert(verificationRequests).values({
        ...requestData,
        status: "pending",
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      });
      
      const [request] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, result[0].insertId));
      return request;
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de verificação:', error);
      throw error;
    }
  }

  async updateVerificationRequest(
    id: number, 
    status: string, 
    reviewedBy?: number, 
    rejectionReason?: string
  ): Promise<VerificationRequest | undefined> {
    try {
      // First get the request to check if it exists and get the userId
      const [request] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id));
      if (!request) return undefined;
      
      // Update the request
      await db.update(verificationRequests).set({
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || null,
        rejectionReason: rejectionReason || null,
      }).where(eq(verificationRequests.id, id));
      
      // Get the updated request
      const [updatedRequest] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id));
      
      // If approved, update user verification status
      if (status === "approved") {
        await this.updateUserVerificationStatus(request.userId, true, request.verificationType);
      }
      
      return updatedRequest;
    } catch (error) {
      console.error('❌ Erro ao atualizar solicitação de verificação:', error);
      return undefined;
    }
  }

  async updateUserVerificationStatus(userId: number, isVerified: boolean, method?: string): Promise<void> {
    try {
      await db.update(users).set({
        isVerified,
        verificationMethod: method || null,
      }).where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ Erro ao atualizar status de verificação do usuário:', error);
    }
  }

  // ===== ACTIVITIES METHODS =====

  async getActivities(filters?: { 
    search?: string; 
    category?: string; 
    location?: string; 
    priceRange?: string; 
    difficulty?: string; 
    duration?: string; 
    rating?: string; 
    sortBy?: string; 
  }): Promise<Activity[]> {
    try {
      let allActivities = await db.select().from(activities).where(eq(activities.isActive, true));

      if (filters) {
        if (filters.search) {
          const search = filters.search.toLowerCase();
          allActivities = allActivities.filter(a => 
            a.title.toLowerCase().includes(search) ||
            a.description.toLowerCase().includes(search) ||
            a.location.toLowerCase().includes(search)
          );
        }

        if (filters.category && filters.category !== "all") {
          allActivities = allActivities.filter(a => a.category === filters.category);
        }

        if (filters.location) {
          allActivities = allActivities.filter(a => 
            a.location.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }

        if (filters.priceRange && filters.priceRange !== "all") {
          allActivities = allActivities.filter(a => {
            if (filters.priceRange === "free") return !a.priceAmount;
            if (filters.priceRange === "0-50") return a.priceAmount && a.priceAmount <= 50;
            if (filters.priceRange === "50-150") return a.priceAmount && a.priceAmount > 50 && a.priceAmount <= 150;
            if (filters.priceRange === "150-300") return a.priceAmount && a.priceAmount > 150 && a.priceAmount <= 300;
            if (filters.priceRange === "300+") return a.priceAmount && a.priceAmount > 300;
            return true;
          });
        }

        if (filters.difficulty && filters.difficulty !== "all") {
          allActivities = allActivities.filter(a => a.difficultyLevel === filters.difficulty);
        }

        if (filters.rating && filters.rating !== "all") {
          const minRating = parseFloat(filters.rating);
          allActivities = allActivities.filter(a => parseFloat(a.averageRating) >= minRating);
        }

        // Sorting
        if (filters.sortBy) {
          allActivities.sort((a, b) => {
            switch (filters.sortBy) {
              case "rating":
                return parseFloat(b.averageRating) - parseFloat(a.averageRating);
              case "price_low":
                const priceA = a.priceAmount || 0;
                const priceB = b.priceAmount || 0;
                return priceA - priceB;
              case "price_high":
                const priceA2 = a.priceAmount || 0;
                const priceB2 = b.priceAmount || 0;
                return priceB2 - priceA2;
              case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              default:
                return 0;
            }
          });
        }
      }

      return allActivities;
    } catch (error) {
      console.error('❌ Erro ao buscar atividades:', error);
      return [];
    }
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error('❌ Erro ao buscar atividade:', error);
      return undefined;
    }
  }

  async createActivity(activityData: InsertActivity & { createdById: number }): Promise<Activity> {
    try {
      const result = await db.insert(activities).values({
        ...activityData,
        averageRating: "0.00",
        totalRatings: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const [activity] = await db.select().from(activities).where(eq(activities.id, result[0].insertId));
      return activity;
    } catch (error) {
      console.error('❌ Erro ao criar atividade:', error);
      throw error;
    }
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    try {
      await db.update(activities).set({
        ...updates,
        updatedAt: new Date(),
      }).where(eq(activities.id, id));
      
      const [updatedActivity] = await db.select().from(activities).where(eq(activities.id, id));
      return updatedActivity;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
      return undefined;
    }
  }

  async deleteActivity(id: number): Promise<boolean> {
    try {
      await db.update(activities).set({ isActive: false }).where(eq(activities.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar atividade:', error);
      return false;
    }
  }

  // Activity Reviews
  async getActivityReviews(activityId: number): Promise<(ActivityReview & { user: User })[]> {
    try {
      const reviews = await db.select().from(activityReviews)
        .where(eq(activityReviews.activityId, activityId))
        .orderBy(desc(activityReviews.createdAt));
      
      const result = [];
      for (const review of reviews) {
        const user = await this.getUser(review.userId);
        if (user) {
          result.push({
            ...review,
            user: this.sanitizeUser(user) as User
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações da atividade:', error);
      return [];
    }
  }

  async createActivityReview(reviewData: InsertActivityReview & { userId: number }): Promise<ActivityReview> {
    try {
      const result = await db.insert(activityReviews).values({
        ...reviewData,
        helpfulVotes: 0,
        isVerified: false,
        createdAt: new Date(),
      });
      
      const [review] = await db.select().from(activityReviews).where(eq(activityReviews.id, result[0].insertId));
      
      // Update activity average rating
      await this.updateActivityAverageRating(reviewData.activityId);
      
      return review;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação da atividade:', error);
      throw error;
    }
  }

  async updateActivityAverageRating(activityId: number): Promise<void> {
    try {
      const reviews = await db.select().from(activityReviews)
        .where(eq(activityReviews.activityId, activityId));
      
      if (reviews.length === 0) return;
      
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(2);
      
      await db.update(activities).set({
        averageRating,
        totalRatings: reviews.length,
        updatedAt: new Date(),
      }).where(eq(activities.id, activityId));
    } catch (error) {
      console.error('❌ Erro ao atualizar avaliação média da atividade:', error);
    }
  }

  // Activity Bookings
  async getActivityBookings(activityId: number): Promise<(ActivityBooking & { user: User })[]> {
    try {
      const bookings = await db.select().from(activityBookings)
        .where(eq(activityBookings.activityId, activityId))
        .orderBy(desc(activityBookings.createdAt));
      
      const result = [];
      for (const booking of bookings) {
        const user = await this.getUser(booking.userId);
        if (user) {
          result.push({
            ...booking,
            user: this.sanitizeUser(user) as User
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar reservas da atividade:', error);
      return [];
    }
  }

  async getUserActivityBookings(userId: number): Promise<(ActivityBooking & { activity: Activity })[]> {
    try {
      const bookings = await db.select().from(activityBookings)
        .where(eq(activityBookings.userId, userId))
        .orderBy(desc(activityBookings.createdAt));
      
      const result = [];
      for (const booking of bookings) {
        const activity = await this.getActivity(booking.activityId);
        if (activity) {
          result.push({
            ...booking,
            activity
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar reservas do usuário:', error);
      return [];
    }
  }

  async createActivityBooking(bookingData: InsertActivityBooking & { userId: number }): Promise<ActivityBooking> {
    try {
      const result = await db.insert(activityBookings).values({
        ...bookingData,
        status: "pending",
        createdAt: new Date(),
      });
      
      const [booking] = await db.select().from(activityBookings).where(eq(activityBookings.id, result[0].insertId));
      return booking;
    } catch (error) {
      console.error('❌ Erro ao criar reserva da atividade:', error);
      throw error;
    }
  }

  async updateActivityBooking(id: number, status: string): Promise<ActivityBooking | undefined> {
    try {
      await db.update(activityBookings).set({ status }).where(eq(activityBookings.id, id));
      const [updatedBooking] = await db.select().from(activityBookings).where(eq(activityBookings.id, id));
      return updatedBooking;
    } catch (error) {
      console.error('❌ Erro ao atualizar reserva da atividade:', error);
      return undefined;
    }
  }

  // Activity Budget Proposals
  async getActivityBudgetProposals(activityId: number): Promise<(ActivityBudgetProposal & { creator: User })[]> {
    try {
      const proposals = await db.select().from(activityBudgetProposals)
        .where(and(
          eq(activityBudgetProposals.activityId, activityId),
          eq(activityBudgetProposals.isActive, true)
        ))
        .orderBy(desc(activityBudgetProposals.votes));
      
      const result = [];
      for (const proposal of proposals) {
        const creator = await this.getUser(proposal.createdBy);
        if (creator) {
          result.push({
            ...proposal,
            creator: this.sanitizeUser(creator) as User
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar propostas de orçamento da atividade:', error);
      return [];
    }
  }

  async createActivityBudgetProposal(proposalData: InsertActivityBudgetProposal & { createdBy: number }): Promise<ActivityBudgetProposal> {
    try {
      const result = await db.insert(activityBudgetProposals).values({
        ...proposalData,
        currency: proposalData.currency || "BRL",
        isActive: true,
        votes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const [proposal] = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.id, result[0].insertId));
      return proposal;
    } catch (error) {
      console.error('❌ Erro ao criar proposta de orçamento da atividade:', error);
      throw error;
    }
  }

  async updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined> {
    try {
      await db.update(activityBudgetProposals).set({
        ...updates,
        updatedAt: new Date(),
      }).where(eq(activityBudgetProposals.id, id));
      
      const [updatedProposal] = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.id, id));
      return updatedProposal;
    } catch (error) {
      console.error('❌ Erro ao atualizar proposta de orçamento da atividade:', error);
      return undefined;
    }
  }

  async deleteActivityBudgetProposal(id: number): Promise<boolean> {
    try {
      await db.update(activityBudgetProposals).set({ isActive: false }).where(eq(activityBudgetProposals.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar proposta de orçamento da atividade:', error);
      return false;
    }
  }

  async voteActivityBudgetProposal(id: number, increment: boolean): Promise<ActivityBudgetProposal | undefined> {
    try {
      const [proposal] = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.id, id));
      if (!proposal) return undefined;
      
      const newVotes = increment ? proposal.votes + 1 : Math.max(0, proposal.votes - 1);
      
      await db.update(activityBudgetProposals).set({
        votes: newVotes,
        updatedAt: new Date(),
      }).where(eq(activityBudgetProposals.id, id));
      
      const [updatedProposal] = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.id, id));
      return updatedProposal;
    } catch (error) {
      console.error('❌ Erro ao votar na proposta de orçamento da atividade:', error);
      return undefined;
    }
  }

  // Trip Activities - Link activities to trips with selected proposals
  async getTripActivities(tripId: number): Promise<(TripActivity & { activity: Activity; proposal: ActivityBudgetProposal; addedByUser: User })[]> {
    try {
      const tripActivities = await db.select().from(tripActivities)
        .where(eq(tripActivities.tripId, tripId))
        .orderBy(desc(tripActivities.createdAt));
      
      const result = [];
      for (const tripActivity of tripActivities) {
        const activity = await this.getActivity(tripActivity.activityId);
        const [proposal] = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.id, tripActivity.budgetProposalId));
        const addedByUser = await this.getUser(tripActivity.addedBy);
        
        if (activity && proposal && addedByUser) {
          result.push({
            ...tripActivity,
            activity,
            proposal,
            addedByUser: this.sanitizeUser(addedByUser) as User
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar atividades da viagem:', error);
      return [];
    }
  }

  async addActivityToTrip(tripActivityData: InsertTripActivity & { addedBy: number }): Promise<TripActivity> {
    try {
      const result = await db.insert(tripActivities).values({
        ...tripActivityData,
        status: "proposed",
        createdAt: new Date(),
      });
      
      const [tripActivity] = await db.select().from(tripActivities).where(eq(tripActivities.id, result[0].insertId));
      
      // Update the trip's budget by adding the activity cost
      await this.updateTripBudgetWithActivity(tripActivityData.tripId, tripActivityData.totalCost);
      
      return tripActivity;
    } catch (error) {
      console.error('❌ Erro ao adicionar atividade à viagem:', error);
      throw error;
    }
  }

  async updateTripBudgetWithActivity(tripId: number, activityCost: number): Promise<void> {
    try {
      // Get current trip
      const trip = await this.getTrip(tripId);
      if (!trip) throw new Error('Viagem não encontrada');
      
      // Parse current budget breakdown
      let budgetBreakdown: any = {};
      if (trip.budgetBreakdown) {
        try {
          budgetBreakdown = typeof trip.budgetBreakdown === 'string' 
            ? JSON.parse(trip.budgetBreakdown) 
            : trip.budgetBreakdown;
        } catch (e) {
          console.warn('Erro ao parsear budget breakdown:', e);
          budgetBreakdown = {};
        }
      }
      
      // Add activity cost to activities category
      budgetBreakdown.activities = (budgetBreakdown.activities || 0) + activityCost;
      
      // Update total budget
      const newBudget = (trip.budget || 0) + activityCost;
      
      // Update trip with new budget
      await db
        .update(trips)
        .set({
          budget: newBudget,
          budgetBreakdown: JSON.stringify(budgetBreakdown)
        })
        .where(eq(trips.id, tripId));
        
      console.log(`✅ Orçamento da viagem ${tripId} atualizado: +R$ ${activityCost} para atividades`);
    } catch (error) {
      console.error('❌ Erro ao atualizar orçamento da viagem:', error);
      // Don't throw here to avoid breaking the activity addition
    }
  }

  async updateTripActivity(id: number, updates: Partial<TripActivity>): Promise<TripActivity | undefined> {
    try {
      await db.update(tripActivities).set(updates).where(eq(tripActivities.id, id));
      const [updatedTripActivity] = await db.select().from(tripActivities).where(eq(tripActivities.id, id));
      return updatedTripActivity;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da viagem:', error);
      return undefined;
    }
  }

  async removeTripActivity(id: number): Promise<boolean> {
    try {
      await db.delete(tripActivities).where(eq(tripActivities.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover atividade da viagem:', error);
      return false;
    }
  }
  
  // Get user trips in same location as activity
  async getUserTripsInLocation(userId: number, location: string): Promise<Trip[]> {
    try {
      // Get all trips where user is creator or participant
      const userTrips = await db.select().from(trips).where(eq(trips.creatorId, userId));
      
      const participantTrips = await db.select({
        id: trips.id,
        creatorId: trips.creatorId,
        title: trips.title,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budget: trips.budget,
        budgetBreakdown: trips.budgetBreakdown,
        maxParticipants: trips.maxParticipants,
        currentParticipants: trips.currentParticipants,
        description: trips.description,
        travelStyle: trips.travelStyle,
        sharedCosts: trips.sharedCosts,
        plannedActivities: trips.plannedActivities,
        status: trips.status,
        coverImage: trips.coverImage,
        createdAt: trips.createdAt,
      }).from(trips)
        .innerJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
        .where(and(
          eq(tripParticipants.userId, userId),
          eq(tripParticipants.status, 'accepted')
        ));
      
      // Combine and deduplicate trips
      const allTrips = [...userTrips, ...participantTrips];
      const uniqueTrips = allTrips.filter((trip, index, self) => 
        index === self.findIndex(t => t.id === trip.id)
      );
      
      const result = uniqueTrips.filter(trip => {
        // Check if trip location matches activity location (same city)
        const tripLocation = trip.destination.toLowerCase();
        const activityLocation = location.toLowerCase();
        
        // Extract city names (before comma if present)
        const tripCity = tripLocation.split(',')[0].trim();
        const activityCity = activityLocation.split(',')[0].trim();
        
        const locationMatch = tripCity === activityCity || 
                             tripLocation.includes(activityCity) || 
                             activityLocation.includes(tripCity);
        
        if (!locationMatch) return false;
        
        // Only include future trips or trips in progress
        const now = new Date();
        const tripEnd = new Date(trip.endDate);
        return tripEnd >= now;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do usuário na localização:', error);
      return [];
    }
  }

  // Fix creators as participants
  async fixCreatorsAsParticipants(): Promise<number> {
    try {
      return await fixCreatorsAsParticipants();
    } catch (error) {
      console.error('❌ Erro ao executar correção de criadores como participantes:', error);
      return 0;
    }
  }

  private async runCreatorParticipantsFix(): Promise<void> {
    try {
      console.log('🔧 Executando correção automática de criadores como participantes...');
      const fixedCount = await this.fixCreatorsAsParticipants();
      if (fixedCount > 0) {
        console.log(`✅ Correção automática aplicada: ${fixedCount} viagens corrigidas`);
      } else {
        console.log('✅ Correção automática verificada: nenhuma correção necessária');
      }
    } catch (error) {
      console.error('❌ Erro na correção automática de criadores como participantes:', error);
    }
  }
}

export const storage = new DatabaseStorage();

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
        phone: '(51) 99999-1111',
        password: hashedPassword,
        bio: 'Usuário de teste padrão',
        location: 'Porto Alegre, RS',
        travelStyles: ['urbanas', 'aventura', 'culturais'],
        languages: ['Português', 'Inglês'],
        interests: ['Aventura', 'Cultura', 'Gastronomia'],
        isVerified: true,
        verificationMethod: 'referral'
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
    
    // Criar atividades de exemplo
    await createSampleActivities();
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
        phone: '(21) 99999-2222',
        password: hashedPassword,
        bio: 'Usuária de teste para participação',
        location: 'Rio de Janeiro, RJ',
        travelStyles: ['praia', 'culturais'],
        languages: ['Português', 'Espanhol'],
        interests: ['Praia', 'Cultura', 'Fotografia'],
        isVerified: true,
        verificationMethod: 'referral'
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
        phone: '(31) 99999-3333',
        location: 'Belo Horizonte, MG',
        travelStyles: ['aventura', 'natureza'],
        languages: ['Português'],
        interests: ['Montanha', 'Aventura', 'Natureza'],
        bio: 'Aventureiro apaixonado por trilhas e montanhas',
        isVerified: true,
        verificationMethod: 'referral'
      },
      {
        username: 'ana',
        email: 'ana@teste.com',
        fullName: 'Ana Costa',
        phone: '(71) 99999-4444',
        location: 'Salvador, BA',
        travelStyles: ['praia', 'culturais'],
        languages: ['Português', 'Inglês'],
        interests: ['Praia', 'Música', 'Dança'],
        bio: 'Amo praia, música e conhecer novas culturas',
        isVerified: false,
        verificationMethod: null
      },
      {
        username: 'ricardo',
        email: 'ricardo@teste.com',
        fullName: 'Ricardo Oliveira',
        phone: '(41) 99999-5555',
        location: 'Curitiba, PR',
        travelStyles: ['culturais', 'urbanas'],
        languages: ['Português', 'Espanhol', 'Francês'],
        interests: ['História', 'Arquitetura', 'Museus'],
        bio: 'Historiador e amante da cultura mundial',
        isVerified: false,
        verificationMethod: null
      },
      {
        username: 'julia',
        email: 'julia@teste.com',
        fullName: 'Julia Mendes',
        phone: '(85) 99999-6666',
        location: 'Fortaleza, CE',
        travelStyles: ['natureza', 'aventura'],
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

// Create sample activities for testing
async function createSampleActivities() {
  try {
    // Check if activities already exist
    const existingActivities = await storage.getActivities();
    if (existingActivities.length > 0) {
      console.log('ℹ️ Atividades de exemplo já existem');
      return;
    }

    // Get default user for activity creation
    const defaultUser = await storage.getUserByUsername('tom');
    if (!defaultUser) {
      console.error('❌ Usuário padrão não encontrado para criar atividades');
      return;
    }

    // Sample activities with realistic data
    const sampleActivities = [
      {
        title: "Passeio de Catamaran em Bombinhas",
        description: "Navegue pelas águas cristalinas de Bombinhas com vista para ilhas paradisíacas. Inclui parada para mergulho livre e lanche a bordo.",
        category: "water_sports",
        location: "Bombinhas, SC",
        priceAmount: 89.90,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "easy",
        duration: "4 horas",
        maxParticipants: 30,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Vista panorâmica", "Mergulho livre", "Lanche incluído", "Guia especializado"],
        requirements: ["Saber nadar", "Protetor solar", "Roupa de banho"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "WhatsApp: (47) 99999-1234",
        operatingHours: "Saídas: 9h e 14h",
        seasonality: "Ano todo (sujeito a condições climáticas)",
        accessibility: "Não acessível para cadeirantes",
        tags: ["família", "aventura", "natureza", "mar"]
      },
      {
        title: "Trilha do Morro da Urca",
        description: "Caminhada até o topo do Morro da Urca com vista espetacular da cidade do Rio. Nível intermediário com duração de 3 horas.",
        category: "hiking",
        location: "Rio de Janeiro, RJ",
        priceAmount: 45.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "medium",
        duration: "3 horas",
        maxParticipants: 15,
        imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Vista 360° da cidade", "Nascer do sol", "Guia local", "Foto profissional"],
        requirements: ["Tênis de caminhada", "Água", "Condicionamento físico básico"],
        cancellationPolicy: "Cancelamento gratuito até 12h antes",
        contactInfo: "Email: trilhas@rioadventure.com",
        operatingHours: "Saída: 5h30 (nascer do sol)",
        seasonality: "Ano todo",
        accessibility: "Não recomendado para mobilidade reduzida",
        tags: ["aventura", "natureza", "fitness", "fotografia"]
      },
      {
        title: "Tour Gastronômico Centro Histórico",
        description: "Descubra os sabores autênticos da culinária local em um tour guiado por restaurantes tradicionais do centro histórico.",
        category: "food_tours",
        location: "Salvador, BA",
        priceAmount: 120.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "easy",
        duration: "4 horas",
        maxParticipants: 12,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["6 paradas gastronômicas", "Pratos típicos", "História local", "Degustação de cachaça"],
        requirements: ["Apetite", "Sapatos confortáveis"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: "Tel: (71) 3333-5678",
        operatingHours: "Diariamente às 15h",
        seasonality: "Ano todo",
        accessibility: "Acessível para cadeirantes",
        tags: ["gastronomia", "cultura", "história", "grupo"]
      },
      {
        title: "Rafting no Rio Jacaré-Pepira",
        description: "Aventura radical de rafting em corredeiras classe III com instrutores experientes. Equipamentos inclusos e almoço no final.",
        category: "adventure",
        location: "Brotas, SP",
        priceAmount: 180.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "hard",
        duration: "6 horas",
        maxParticipants: 8,
        imageUrl: "https://images.unsplash.com/photo-1551524164-d60447d19a0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Corredeiras classe III", "Equipamentos inclusos", "Almoço", "Certificado de participação"],
        requirements: ["Saber nadar", "Idade mínima 16 anos", "Condicionamento físico", "Roupa que pode molhar"],
        cancellationPolicy: "Cancelamento gratuito até 72h antes",
        contactInfo: "WhatsApp: (14) 99888-7777",
        operatingHours: "Saídas: 8h (temporada alta)",
        seasonality: "Março a novembro",
        accessibility: "Não acessível para cadeirantes",
        tags: ["aventura", "adrenalina", "esporte", "natureza"]
      },
      {
        title: "Museu de Arte Moderna - Visita Guiada",
        description: "Explore a coleção permanente e exposições temporárias do MAM com guia especializado em arte contemporânea brasileira.",
        category: "cultural",
        location: "São Paulo, SP",
        priceAmount: 35.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "easy",
        duration: "2 horas",
        maxParticipants: 20,
        imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Guia especializado", "Exposição permanente", "Arte contemporânea", "Material didático"],
        requirements: ["Interesse em arte", "Sapatos confortáveis"],
        cancellationPolicy: "Cancelamento gratuito até 2h antes",
        contactInfo: "Tel: (11) 5085-1300",
        operatingHours: "Ter a Dom: 10h-18h",
        seasonality: "Ano todo",
        accessibility: "Totalmente acessível",
        tags: ["cultura", "arte", "educativo", "interior"]
      },
      {
        title: "Observação de Baleias - Praia do Rosa",
        description: "Avistamento de baleias francas no período de reprodução. Saída de barco com biólogo marinho para explicações técnicas.",
        category: "wildlife",
        location: "Imbituba, SC",
        priceAmount: 95.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "easy",
        duration: "3 horas",
        maxParticipants: 25,
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Biólogo marinho", "Baleias francas", "Equipamento óptico", "Certificado de conservação"],
        requirements: ["Protetor solar", "Agasalho", "Câmera fotográfica"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "WhatsApp: (48) 99777-8888",
        operatingHours: "Julho a novembro: 9h e 14h",
        seasonality: "Julho a novembro",
        accessibility: "Parcialmente acessível",
        tags: ["natureza", "animais", "educativo", "família"]
      },
      {
        title: "Voo de Parapente - Pedra Bonita",
        description: "Voo duplo de parapente com instrutor certificado. Vista aérea da cidade maravilhosa e pouso na Praia do Pepino.",
        category: "adventure",
        location: "Rio de Janeiro, RJ",
        priceAmount: 280.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "medium",
        duration: "4 horas",
        maxParticipants: 6,
        imageUrl: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Vista aérea única", "Instrutor certificado", "Fotos e vídeos", "Certificado de voo"],
        requirements: ["Idade 16-60 anos", "Peso máximo 100kg", "Tênis fechado", "Roupa adequada"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: "Tel: (21) 99999-0000",
        operatingHours: "Diariamente: 9h-16h",
        seasonality: "Ano todo (sujeito ao tempo)",
        accessibility: "Não acessível para cadeirantes",
        tags: ["aventura", "adrenalina", "voo", "vista"]
      },
      {
        title: "Aula de Surf - Praia do Campeche",
        description: "Aprenda a surfar com instrutores credenciados. Equipamentos inclusos e aula teórica sobre segurança no mar.",
        category: "water_sports",
        location: "Florianópolis, SC",
        priceAmount: 80.00,
        priceCurrency: "BRL",
        priceType: "per_person",
        difficultyLevel: "easy",
        duration: "2 horas",
        maxParticipants: 8,
        imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        highlights: ["Instrutor credenciado", "Prancha e roupa inclusos", "Aula teórica", "Certificado iniciante"],
        requirements: ["Saber nadar", "Idade mínima 12 anos", "Protetor solar", "Roupa de banho"],
        cancellationPolicy: "Cancelamento gratuito até 6h antes",
        contactInfo: "WhatsApp: (48) 99666-5555",
        operatingHours: "Diariamente: 8h-17h",
        seasonality: "Ano todo",
        accessibility: "Não acessível para cadeirantes",
        tags: ["surf", "esporte", "praia", "iniciante"]
      }
    ];

    // Create activities
    for (const activityData of sampleActivities) {
      await storage.createActivity({
        ...activityData,
        createdById: defaultUser.id
      });
    }

    // Create sample reviews for some activities
    const activities = await storage.getActivities();
    const secondUser = await storage.getUserByUsername('maria');
    
    if (activities.length > 0 && secondUser) {
      // Add reviews for first few activities
      await storage.createActivityReview({
        activityId: activities[0].id,
        userId: secondUser.id,
        rating: 5,
        comment: "Experiência incrível! O catamaran estava em perfeito estado e a equipe muito profissional. As águas de Bombinhas são realmente cristalinas!",
        visitDate: new Date("2024-12-01"),
        images: []
      });

      await storage.createActivityReview({
        activityId: activities[1].id,
        userId: secondUser.id,
        rating: 4,
        comment: "Trilha desafiadora mas compensadora. A vista do topo é espetacular, especialmente no nascer do sol. Recomendo levar mais água.",
        visitDate: new Date("2024-11-15"),
        images: []
      });

      await storage.createActivityReview({
        activityId: activities[2].id,
        userId: secondUser.id,
        rating: 5,
        comment: "Tour gastronômico perfeito! Provamos pratos típicos deliciosos e aprendemos muito sobre a cultura baiana. Guia muito conhecedor!",
        visitDate: new Date("2024-10-20"),
        images: []
      });
    }

    // Create budget proposals for the first few activities
    if (activities.length >= 3) {
      // Catamaran proposals
      await storage.createActivityBudgetProposal({
        activityId: activities[0].id,
        title: "Pacote Econômico",
        description: "Passeio básico de 4 horas incluindo equipamentos de snorkel",
        totalCost: 120.00,
        currency: "BRL",
        duration: "4 horas",
        minParticipants: 6,
        maxParticipants: 12,
        inclusions: ["Equipamentos de snorkel", "Guia bilíngue", "Água e frutas"],
        exclusions: ["Almoço", "Transporte até o porto"],
        createdBy: activities[0].createdById
      });

      await storage.createActivityBudgetProposal({
        activityId: activities[0].id,
        title: "Pacote Premium",
        description: "Passeio completo de 6 horas com almoço e bebidas inclusas",
        totalCost: 200.00,
        currency: "BRL",
        duration: "6 horas",
        minParticipants: 4,
        maxParticipants: 8,
        inclusions: ["Equipamentos de snorkel", "Guia bilíngue", "Almoço completo", "Bebidas", "Frutas"],
        exclusions: ["Transporte até o porto"],
        createdBy: secondUser?.id || activities[0].createdById
      });

      // Trilha proposals
      await storage.createActivityBudgetProposal({
        activityId: activities[1].id,
        title: "Trilha Guiada",
        description: "Trilha com guia local experiente incluindo café da manhã",
        totalCost: 80.00,
        currency: "BRL",
        duration: "6 horas",
        minParticipants: 4,
        maxParticipants: 10,
        inclusions: ["Guia especializado", "Café da manhã", "Kit lanche", "Seguro"],
        exclusions: ["Equipamentos pessoais", "Transporte"],
        createdBy: activities[1].createdById
      });

      await storage.createActivityBudgetProposal({
        activityId: activities[1].id,
        title: "Trilha Autoguiada",
        description: "Kit com mapa e instruções para trilha independente",
        totalCost: 35.00,
        currency: "BRL",
        duration: "Livre",
        minParticipants: 2,
        maxParticipants: 20,
        inclusions: ["Mapa detalhado", "GPS track", "Kit primeiros socorros"],
        exclusions: ["Guia", "Alimentação", "Transporte", "Equipamentos"],
        createdBy: secondUser?.id || activities[1].createdById
      });

      // Tour gastronômico proposals
      await storage.createActivityBudgetProposal({
        activityId: activities[2].id,
        title: "Tour Completo",
        description: "Tour gastronômico com 5 paradas e drinks inclusos",
        totalCost: 150.00,
        currency: "BRL",
        duration: "5 horas",
        minParticipants: 6,
        maxParticipants: 12,
        inclusions: ["5 degustações", "Bebidas", "Guia gastronômico", "Transporte entre locais"],
        exclusions: ["Transporte até ponto de encontro"],
        createdBy: activities[2].createdById
      });

      // Add some votes to proposals
      if (activities.length >= 3) {
        const proposals = await storage.getActivityBudgetProposals(activities[0].id);
        if (proposals.length >= 2) {
          // Vote on premium package
          await storage.voteActivityBudgetProposal(proposals[1].id, true);
          await storage.voteActivityBudgetProposal(proposals[1].id, true);
          await storage.voteActivityBudgetProposal(proposals[1].id, true);
        }
      }
    }

    console.log('✅ Atividades de exemplo criadas com sucesso');
    console.log('✅ Propostas de orçamento criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar atividades de exemplo:', error);
  }
}

// Initialize default test user after storage is created
createDefaultTestUser();