import { db } from "./db.js";
import { destinations } from "@shared/schema.js";

// Destinos do Centro-Oeste e Norte (34 cidades)
const centroOesteNorteDestinations = [
  // Centro-Oeste
  { name: "Alto Paraíso de Goiás", state: "GO", region: "Centro-Oeste", latitude: "-14.1350", longitude: "-47.5133", timezone: "America/Sao_Paulo" },
  { name: "Caldas Novas", state: "GO", region: "Centro-Oeste", latitude: "-17.7419", longitude: "-48.6236", timezone: "America/Sao_Paulo" },
  { name: "Campo Grande", state: "MS", region: "Centro-Oeste", latitude: "-20.4697", longitude: "-54.6201", timezone: "America/Campo_Grande" },
  { name: "Corumbá", state: "MS", region: "Centro-Oeste", latitude: "-19.0078", longitude: "-57.6544", timezone: "America/Campo_Grande" },
  { name: "Esplanada", state: "DF", region: "Centro-Oeste", latitude: "-15.7801", longitude: "-47.9292", timezone: "America/Sao_Paulo" },
  { name: "Goiânia", state: "GO", region: "Centro-Oeste", latitude: "-16.6869", longitude: "-49.2648", timezone: "America/Sao_Paulo" },
  { name: "Nobres", state: "MT", region: "Centro-Oeste", latitude: "-14.7278", longitude: "-56.3286", timezone: "America/Cuiaba" },
  { name: "Pirenópolis", state: "GO", region: "Centro-Oeste", latitude: "-15.8508", longitude: "-48.9597", timezone: "America/Sao_Paulo" },
  { name: "Rio Quente", state: "GO", region: "Centro-Oeste", latitude: "-17.7936", longitude: "-48.7508", timezone: "America/Sao_Paulo" },
  { name: "Chapada dos Veadeiros", state: "GO", region: "Centro-Oeste", latitude: "-14.1333", longitude: "-47.6500", timezone: "America/Sao_Paulo" },

  // Norte
  { name: "Alter do Chão", state: "PA", region: "Norte", latitude: "-2.5167", longitude: "-54.9500", timezone: "America/Santarem" },
  { name: "Boa Vista", state: "RR", region: "Norte", latitude: "2.8235", longitude: "-60.6758", timezone: "America/Boa_Vista" },
  { name: "Cânion do Xingó", state: "SE", region: "Nordeste", latitude: "-9.6167", longitude: "-37.7833", timezone: "America/Maceio" },
  { name: "Carolina", state: "MA", region: "Nordeste", latitude: "-7.3319", longitude: "-47.4681", timezone: "America/Fortaleza" },
  { name: "Chapada das Mesas", state: "MA", region: "Nordeste", latitude: "-7.0167", longitude: "-46.9333", timezone: "America/Fortaleza" },
  { name: "Cruzeiro do Sul", state: "AC", region: "Norte", latitude: "-7.6278", longitude: "-72.6761", timezone: "America/Rio_Branco" },
  { name: "Guajará-Mirim", state: "RO", region: "Norte", latitude: "-10.7833", longitude: "-65.3333", timezone: "America/Porto_Velho" },
  { name: "Ilhas de Tutóia", state: "MA", region: "Nordeste", latitude: "-2.7617", longitude: "-42.2744", timezone: "America/Fortaleza" },
  { name: "Jalapão", state: "TO", region: "Norte", latitude: "-10.1500", longitude: "-46.8167", timezone: "America/Araguaina" },
  { name: "Macapá", state: "AP", region: "Norte", latitude: "0.0389", longitude: "-51.0664", timezone: "America/Belem" },
  { name: "Mateiros", state: "TO", region: "Norte", latitude: "-10.5167", longitude: "-46.4167", timezone: "America/Araguaina" },
  { name: "Monte Alegre", state: "PA", region: "Norte", latitude: "-2.0167", longitude: "-54.0667", timezone: "America/Santarem" },
  { name: "Natividade", state: "TO", region: "Norte", latitude: "-11.7000", longitude: "-47.7167", timezone: "America/Araguaina" },
  { name: "Óbidos", state: "PA", region: "Norte", latitude: "-1.9167", longitude: "-55.5167", timezone: "America/Santarem" },
  { name: "Palmas", state: "TO", region: "Norte", latitude: "-10.1844", longitude: "-48.3336", timezone: "America/Araguaina" },
  { name: "Parintins", state: "AM", region: "Norte", latitude: "-2.6297", longitude: "-56.7358", timezone: "America/Manaus" },
  { name: "Peixe", state: "TO", region: "Norte", latitude: "-12.0167", longitude: "-48.5333", timezone: "America/Araguaina" },
  { name: "Porto Velho", state: "RO", region: "Norte", latitude: "-8.7608", longitude: "-63.9025", timezone: "America/Porto_Velho" },
  { name: "Presidente Figueiredo", state: "AM", region: "Norte", latitude: "-2.0333", longitude: "-60.0333", timezone: "America/Manaus" },
  { name: "Santarém", state: "PA", region: "Norte", latitude: "-2.4411", longitude: "-54.7081", timezone: "America/Santarem" },
  { name: "São Félix do Xingu", state: "PA", region: "Norte", latitude: "-6.6447", longitude: "-51.9958", timezone: "America/Belem" },
  { name: "Teatro Amazonas", state: "AM", region: "Norte", latitude: "-3.1306", longitude: "-60.0236", timezone: "America/Manaus" },
  { name: "Ver-o-Peso", state: "PA", region: "Norte", latitude: "-1.4547", longitude: "-48.5044", timezone: "America/Belem" },
  { name: "Xapuri", state: "AC", region: "Norte", latitude: "-10.6500", longitude: "-68.5000", timezone: "America/Rio_Branco" }
];

async function addCentroOesteNorteDestinations() {
  try {
    console.log("🌳 Adicionando destinos do Centro-Oeste e Norte...");
    
    let addedCount = 0;
    let duplicateCount = 0;
    
    for (const destination of centroOesteNorteDestinations) {
      try {
        await db.insert(destinations).values({
          name: destination.name,
          state: destination.state,
          country: "Brasil",
          countryType: "nacional",
          region: destination.region,
          continent: "América do Sul",
          latitude: destination.latitude,
          longitude: destination.longitude,
          timezone: destination.timezone,
          isActive: true
        });
        
        console.log(`✅ Adicionado: ${destination.name}, ${destination.state} (${destination.region})`);
        addedCount++;
      } catch (error) {
        // Check if it's a duplicate entry error
        if ((error as any).code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Destino já existe: ${destination.name}, ${destination.state}`);
          duplicateCount++;
        } else {
          console.error(`❌ Erro ao adicionar ${destination.name}:`, error);
        }
      }
    }
    
    console.log(`🎉 Processo de adição concluído!`);
    console.log(`📊 Resultado: ${addedCount} novos destinos adicionados, ${duplicateCount} duplicatas encontradas`);
    
    // Show updated summary
    const totalDestinations = await db.select().from(destinations);
    const internationalCount = totalDestinations.filter(d => d.countryType === 'internacional').length;
    const nationalCount = totalDestinations.filter(d => d.countryType === 'nacional').length;
    
    // Group by region
    const regionCount = totalDestinations.reduce((acc, dest) => {
      if (dest.countryType === 'nacional') {
        acc[dest.region || 'Sem região'] = (acc[dest.region || 'Sem região'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📊 Resumo completo do banco de destinos:`);
    console.log(`   • Total: ${totalDestinations.length} destinos`);
    console.log(`   • Nacionais: ${nationalCount} destinos`);
    console.log(`   • Internacionais: ${internationalCount} destinos`);
    console.log(`📍 Destinos nacionais por região:`);
    Object.entries(regionCount).forEach(([region, count]) => {
      console.log(`   • ${region}: ${count} destinos`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao adicionar destinos do Centro-Oeste e Norte:", error);
  }
}

// Execute the function
addCentroOesteNorteDestinations();