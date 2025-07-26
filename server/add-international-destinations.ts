import { db } from "./db.js";
import { destinations } from "@shared/schema.js";

// International destinations to be added
const internationalDestinations = [
  // Emirados Árabes Unidos
  { name: "Abu Dhabi", country: "Emirados Árabes Unidos", region: "Oriente Médio", continent: "Ásia", latitude: "24.4539", longitude: "54.3773", timezone: "Asia/Dubai" },
  
  // Antigua e Barbuda
  { name: "Antigua e Barbuda", country: "Antigua e Barbuda", region: "Caribe", continent: "América Central", latitude: "17.0608", longitude: "-61.7964", timezone: "America/Antigua" },
  
  // Aruba
  { name: "Aruba", country: "Países Baixos", region: "Caribe", continent: "América Central", latitude: "12.5211", longitude: "-69.9683", timezone: "America/Aruba" },
  
  // Grécia
  { name: "Atenas", country: "Grécia", region: "Europa Mediterrânea", continent: "Europa", latitude: "37.9838", longitude: "23.7275", timezone: "Europe/Athens" },
  { name: "Santorini", country: "Grécia", region: "Europa Mediterrânea", continent: "Europa", latitude: "36.3932", longitude: "25.4615", timezone: "Europe/Athens" },
  
  // Nova Zelândia
  { name: "Auckland", country: "Nova Zelândia", region: "Oceania", continent: "Oceania", latitude: "-36.8485", longitude: "174.7633", timezone: "Pacific/Auckland" },
  { name: "Queenstown", country: "Nova Zelândia", region: "Oceania", continent: "Oceania", latitude: "-45.0312", longitude: "168.6626", timezone: "Pacific/Auckland" },
  
  // Indonésia
  { name: "Bali", country: "Indonésia", region: "Sudeste Asiático", continent: "Ásia", latitude: "-8.3405", longitude: "115.0920", timezone: "Asia/Makassar" },
  
  // Barbados
  { name: "Barbados", country: "Barbados", region: "Caribe", continent: "América Central", latitude: "13.1939", longitude: "-59.5432", timezone: "America/Barbados" },
  
  // Belize
  { name: "Belize City", country: "Belize", region: "América Central", continent: "América Central", latitude: "17.5045", longitude: "-88.1962", timezone: "America/Belize" },
  
  // Polinésia Francesa
  { name: "Bora Bora", country: "Polinésia Francesa", region: "Pacífico Sul", continent: "Oceania", latitude: "-16.5004", longitude: "-151.7415", timezone: "Pacific/Tahiti" },
  
  // Bélgica
  { name: "Bruxelas", country: "Bélgica", region: "Europa Ocidental", continent: "Europa", latitude: "50.8503", longitude: "4.3517", timezone: "Europe/Brussels" },
  
  // Colômbia
  { name: "Cartagena das Índias", country: "Colômbia", region: "América do Sul", continent: "América do Sul", latitude: "10.3997", longitude: "-75.5144", timezone: "America/Bogota" },
  { name: "Medellín", country: "Colômbia", region: "América do Sul", continent: "América do Sul", latitude: "6.2442", longitude: "-75.5812", timezone: "America/Bogota" },
  
  // Marrocos
  { name: "Casablanca", country: "Marrocos", region: "Norte da África", continent: "África", latitude: "33.5731", longitude: "-7.5898", timezone: "Africa/Casablanca" },
  
  // Uruguai
  { name: "Colonia del Sacramento", country: "Uruguai", region: "América do Sul", continent: "América do Sul", latitude: "-34.4721", longitude: "-57.8395", timezone: "America/Montevideo" },
  { name: "Punta del Este", country: "Uruguai", region: "América do Sul", continent: "América do Sul", latitude: "-34.9581", longitude: "-54.8952", timezone: "America/Montevideo" },
  
  // Curaçao
  { name: "Curaçao", country: "Países Baixos", region: "Caribe", continent: "América Central", latitude: "12.1696", longitude: "-68.9900", timezone: "America/Curacao" },
  
  // Catar
  { name: "Doha", country: "Catar", region: "Oriente Médio", continent: "Ásia", latitude: "25.2760", longitude: "51.5200", timezone: "Asia/Qatar" },
  
  // Croácia
  { name: "Dubrovnik", country: "Croácia", region: "Europa Mediterrânea", continent: "Europa", latitude: "42.6507", longitude: "18.0944", timezone: "Europe/Zagreb" },
  
  // Escócia
  { name: "Edimburgo", country: "Reino Unido", region: "Europa Ocidental", continent: "Europa", latitude: "55.9533", longitude: "-3.1883", timezone: "Europe/London" },
  
  // Equador
  { name: "Galápagos", country: "Equador", region: "América do Sul", continent: "América do Sul", latitude: "-0.9538", longitude: "-90.9656", timezone: "Pacific/Galapagos" },
  { name: "Quito", country: "Equador", region: "América do Sul", continent: "América do Sul", latitude: "-0.1807", longitude: "-78.4678", timezone: "America/Guayaquil" },
  
  // Granada
  { name: "Granada", country: "Granada", region: "Caribe", continent: "América Central", latitude: "12.1165", longitude: "-61.6790", timezone: "America/Grenada" },
  
  // Vietnã
  { name: "Hanói", country: "Vietnã", region: "Sudeste Asiático", continent: "Ásia", latitude: "21.0285", longitude: "105.8542", timezone: "Asia/Ho_Chi_Minh" },
  
  // Cuba
  { name: "Havana", country: "Cuba", region: "Caribe", continent: "América Central", latitude: "23.1136", longitude: "-82.3666", timezone: "America/Havana" },
  
  // Ilhas Cayman
  { name: "Ilhas Cayman", country: "Reino Unido", region: "Caribe", continent: "América Central", latitude: "19.3133", longitude: "-81.2546", timezone: "America/Cayman" },
  
  // Turquia
  { name: "Istambul", country: "Turquia", region: "Eurásia", continent: "Ásia", latitude: "41.0082", longitude: "28.9784", timezone: "Europe/Istanbul" },
  
  // Israel
  { name: "Jerusalém", country: "Israel", region: "Oriente Médio", continent: "Ásia", latitude: "31.7683", longitude: "35.2137", timezone: "Asia/Jerusalem" },
  
  // África do Sul
  { name: "Joanesburgo", country: "África do Sul", region: "África Austral", continent: "África", latitude: "-26.2041", longitude: "28.0473", timezone: "Africa/Johannesburg" },
  
  // Jamaica
  { name: "Kingston", country: "Jamaica", region: "Caribe", continent: "América Central", latitude: "17.9970", longitude: "-76.7936", timezone: "America/Jamaica" },
  
  // Japão
  { name: "Kyoto", country: "Japão", region: "Ásia Oriental", continent: "Ásia", latitude: "35.0116", longitude: "135.7681", timezone: "Asia/Tokyo" },
  { name: "Osaka", country: "Japão", region: "Ásia Oriental", continent: "Ásia", latitude: "34.6937", longitude: "135.5023", timezone: "Asia/Tokyo" },
  
  // Costa Rica
  { name: "Monteverde", country: "Costa Rica", region: "América Central", continent: "América Central", latitude: "10.3010", longitude: "-84.8200", timezone: "America/Costa_Rica" },
  { name: "San José", country: "Costa Rica", region: "América Central", continent: "América Central", latitude: "9.9281", longitude: "-84.0907", timezone: "America/Costa_Rica" },
  
  // Canadá
  { name: "Montreal", country: "Canadá", region: "América do Norte", continent: "América do Norte", latitude: "45.5017", longitude: "-73.5673", timezone: "America/Toronto" },
  { name: "Vancouver", country: "Canadá", region: "América do Norte", continent: "América do Norte", latitude: "49.2827", longitude: "-123.1207", timezone: "America/Vancouver" },
  
  // Alemanha
  { name: "Munique", country: "Alemanha", region: "Europa Central", continent: "Europa", latitude: "48.1351", longitude: "11.5820", timezone: "Europe/Berlin" },
  
  // Fiji
  { name: "Nadi", country: "Fiji", region: "Pacífico Sul", continent: "Oceania", latitude: "-17.7765", longitude: "177.4480", timezone: "Pacific/Fiji" },
  
  // Bahamas
  { name: "Nassau", country: "Bahamas", region: "Caribe", continent: "América Central", latitude: "25.0443", longitude: "-77.3504", timezone: "America/Nassau" },
  
  // Estados Unidos
  { name: "Orlando", country: "Estados Unidos", region: "América do Norte", continent: "América do Norte", latitude: "28.5383", longitude: "-81.3792", timezone: "America/New_York" },
  { name: "San Francisco", country: "Estados Unidos", region: "América do Norte", continent: "América do Norte", latitude: "37.7749", longitude: "-122.4194", timezone: "America/Los_Angeles" },
  
  // China
  { name: "Pequim", country: "China", region: "Ásia Oriental", continent: "Ásia", latitude: "39.9042", longitude: "116.4074", timezone: "Asia/Shanghai" },
  
  // Tailândia
  { name: "Phuket", country: "Tailândia", region: "Sudeste Asiático", continent: "Ásia", latitude: "7.8804", longitude: "98.3923", timezone: "Asia/Bangkok" },
  
  // México
  { name: "Playa del Carmen", country: "México", region: "América Central", continent: "América do Norte", latitude: "20.6296", longitude: "-87.0739", timezone: "America/Cancun" },
  { name: "Tulum", country: "México", region: "América Central", continent: "América do Norte", latitude: "20.2114", longitude: "-87.4654", timezone: "America/Cancun" },
  
  // República Dominicana
  { name: "Punta Cana", country: "República Dominicana", region: "Caribe", continent: "América Central", latitude: "18.5601", longitude: "-68.3725", timezone: "America/Santo_Domingo" },
  
  // Porto Rico
  { name: "San Juan", country: "Estados Unidos", region: "Caribe", continent: "América Central", latitude: "18.4655", longitude: "-66.1057", timezone: "America/Puerto_Rico" },
  
  // Chile
  { name: "San Pedro de Atacama", country: "Chile", region: "América do Sul", continent: "América do Sul", latitude: "-22.9098", longitude: "-68.2000", timezone: "America/Santiago" },
  
  // Egito
  { name: "Sharm El-Sheikh", country: "Egito", region: "Norte da África", continent: "África", latitude: "27.9158", longitude: "34.3300", timezone: "Africa/Cairo" },
];

async function addInternationalDestinations() {
  try {
    console.log("🌍 Adicionando destinos internacionais...");
    
    for (const destination of internationalDestinations) {
      try {
        await db.insert(destinations).values({
          name: destination.name,
          state: null, // International destinations don't have states
          country: destination.country,
          countryType: "internacional",
          region: destination.region,
          continent: destination.continent,
          latitude: destination.latitude,
          longitude: destination.longitude,
          timezone: destination.timezone,
          isActive: true
        });
        
        console.log(`✅ Adicionado: ${destination.name}, ${destination.country}`);
      } catch (error) {
        // Check if it's a duplicate entry error
        if ((error as any).code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Destino já existe: ${destination.name}, ${destination.country}`);
        } else {
          console.error(`❌ Erro ao adicionar ${destination.name}:`, error);
        }
      }
    }
    
    console.log("🎉 Processo de adição de destinos internacionais concluído!");
    
    // Show summary
    const totalDestinations = await db.select().from(destinations);
    const internationalCount = totalDestinations.filter(d => d.countryType === 'internacional').length;
    const nationalCount = totalDestinations.filter(d => d.countryType === 'nacional').length;
    
    console.log(`📊 Resumo do banco de destinos:`);
    console.log(`   • Total: ${totalDestinations.length} destinos`);
    console.log(`   • Nacionais: ${nationalCount} destinos`);
    console.log(`   • Internacionais: ${internationalCount} destinos`);
    
  } catch (error) {
    console.error("❌ Erro ao adicionar destinos internacionais:", error);
  }
}

// Execute the function
addInternationalDestinations();