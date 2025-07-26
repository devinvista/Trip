import { db } from './db.ts';
import { destinations } from '../shared/schema.ts';

async function addDestinations() {

  console.log('🔗 Conectado ao MySQL, inserindo destinos...');

  const destinations = [
    // Região Sudeste - Brasil (completando SP e RJ)
    ['Paraty', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Petrópolis', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Angra dos Reis', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Búzios', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Ilha Grande', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Teresópolis', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Niterói', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Campos do Jordão', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Ubatuba', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Ilhabela', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Santos', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['São Sebastião', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Brotas', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Holambra', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Embu das Artes', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Campinas', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    
    // Minas Gerais - Completando
    ['Belo Horizonte', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Tiradentes', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Mariana', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Capitólio', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Diamantina', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['São Thomé das Letras', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Brumadinho', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Lavras Novas', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Congonhas', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Viçosa', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Juiz de Fora', 'MG', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],

    // Espírito Santo
    ['Vitória', 'ES', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Vila Velha', 'ES', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Guarapari', 'ES', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],
    ['Domingos Martins', 'ES', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'],

    // Região Sul - Brasil (completando)
    ['Curitiba', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Foz do Iguaçu', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Ilha do Mel', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Morretes', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Antonina', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Londrina', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Maringá', 'PR', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    
    // Santa Catarina - Completando
    ['Florianópolis', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Balneário Camboriú', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Blumenau', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Joinville', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Bombinhas', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Garopaba', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Praia do Rosa', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Urubici', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['São Joaquim', 'SC', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    
    // Rio Grande do Sul - Completando
    ['Canela', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Bento Gonçalves', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Porto Alegre', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Torres', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Cambará do Sul', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Nova Petrópolis', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Caxias do Sul', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],
    ['Pelotas', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'],

    // Região Nordeste - Brasil (completando)
    ['Salvador', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Morro de São Paulo', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Chapada Diamantina', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Porto Seguro', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Trancoso', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Arraial d\'Ajuda', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Itacaré', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Ilhéus', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Mucugê', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Lençóis', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Ceará - Completando
    ['Fortaleza', 'CE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Jericoacoara', 'CE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Canoa Quebrada', 'CE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Sobral', 'CE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Rio Grande do Norte - Completando
    ['Natal', 'RN', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Pipa', 'RN', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['São Miguel do Gostoso', 'RN', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Paraíba
    ['João Pessoa', 'PB', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Cabedelo', 'PB', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Campina Grande', 'PB', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Pernambuco - Completando
    ['Recife', 'PE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Olinda', 'PE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Porto de Galinhas', 'PE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Fernando de Noronha', 'PE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Alagoas - Completando
    ['Maceió', 'AL', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['São Miguel dos Milagres', 'AL', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Sergipe
    ['Aracaju', 'SE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Canindé de São Francisco', 'SE', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Maranhão - Completando
    ['São Luís', 'MA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Alcântara', 'MA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    
    // Piauí
    ['Teresina', 'PI', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Parnaíba', 'PI', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],
    ['Delta do Parnaíba', 'PI', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'],

    // Região Centro-Oeste - Brasil (completando)
    ['Brasília', 'DF', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Chapada dos Guimarães', 'MT', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Cuiabá', 'MT', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Poconé', 'MT', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Campo Grande', 'MS', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Aquidauana', 'MS', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Corumbá', 'MS', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Goiânia', 'GO', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Pirenópolis', 'GO', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],
    ['Alto Paraíso de Goiás', 'GO', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'],

    // Região Norte - Brasil (completando)
    ['Belém', 'PA', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Alter do Chão', 'PA', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Santarém', 'PA', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Macapá', 'AP', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Boa Vista', 'RR', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Rio Branco', 'AC', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Porto Velho', 'RO', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Palmas', 'TO', 'Brasil', 'nacional', 'Norte', 'América do Sul'],
    ['Jalapão', 'TO', 'Brasil', 'nacional', 'Norte', 'América do Sul'],

    // América do Sul - Internacional
    ['Bariloche', null, 'Argentina', 'internacional', 'América do Sul', 'América do Sul'],
    ['Mendoza', null, 'Argentina', 'internacional', 'América do Sul', 'América do Sul'],
    ['Córdoba', null, 'Argentina', 'internacional', 'América do Sul', 'América do Sul'],
    ['Salta', null, 'Argentina', 'internacional', 'América do Sul', 'América do Sul'],
    ['Santiago', null, 'Chile', 'internacional', 'América do Sul', 'América do Sul'],
    ['Valparaíso', null, 'Chile', 'internacional', 'América do Sul', 'América do Sul'],
    ['Atacama', null, 'Chile', 'internacional', 'América do Sul', 'América do Sul'],
    ['Lima', null, 'Peru', 'internacional', 'América do Sul', 'América do Sul'],
    ['Cusco', null, 'Peru', 'internacional', 'América do Sul', 'América do Sul'],
    ['Machu Picchu', null, 'Peru', 'internacional', 'América do Sul', 'América do Sul'],
    ['Arequipa', null, 'Peru', 'internacional', 'América do Sul', 'América do Sul'],
    ['Montevidéu', null, 'Uruguai', 'internacional', 'América do Sul', 'América do Sul'],
    ['Punta del Este', null, 'Uruguai', 'internacional', 'América do Sul', 'América do Sul'],
    ['La Paz', null, 'Bolívia', 'internacional', 'América do Sul', 'América do Sul'],
    ['Salar de Uyuni', null, 'Bolívia', 'internacional', 'América do Sul', 'América do Sul'],
    ['Quito', null, 'Equador', 'internacional', 'América do Sul', 'América do Sul'],
    ['Galápagos', null, 'Equador', 'internacional', 'América do Sul', 'América do Sul'],
    ['Bogotá', null, 'Colômbia', 'internacional', 'América do Sul', 'América do Sul'],
    ['Cartagena', null, 'Colômbia', 'internacional', 'América do Sul', 'América do Sul'],
    ['Caracas', null, 'Venezuela', 'internacional', 'América do Sul', 'América do Sul'],

    // América do Norte - Internacional
    ['Nova York', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Los Angeles', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Miami', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Las Vegas', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['San Francisco', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Chicago', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Orlando', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Washington', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Boston', null, 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'],
    ['Toronto', null, 'Canadá', 'internacional', 'América do Norte', 'América do Norte'],
    ['Vancouver', null, 'Canadá', 'internacional', 'América do Norte', 'América do Norte'],
    ['Montreal', null, 'Canadá', 'internacional', 'América do Norte', 'América do Norte'],
    ['Cancún', null, 'México', 'internacional', 'América do Norte', 'América do Norte'],
    ['Playa del Carmen', null, 'México', 'internacional', 'América do Norte', 'América do Norte'],
    ['Puerto Vallarta', null, 'México', 'internacional', 'América do Norte', 'América do Norte'],
    ['Cidade do México', null, 'México', 'internacional', 'América do Norte', 'América do Norte'],

    // Europa - Internacional
    ['Londres', null, 'Reino Unido', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Edinburgh', null, 'Reino Unido', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Dublin', null, 'Irlanda', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Paris', null, 'França', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Nice', null, 'França', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Lyon', null, 'França', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Barcelona', null, 'Espanha', 'internacional', 'Europa Meridional', 'Europa'],
    ['Madrid', null, 'Espanha', 'internacional', 'Europa Meridional', 'Europa'],
    ['Sevilha', null, 'Espanha', 'internacional', 'Europa Meridional', 'Europa'],
    ['Valencia', null, 'Espanha', 'internacional', 'Europa Meridional', 'Europa'],
    ['Lisboa', null, 'Portugal', 'internacional', 'Europa Meridional', 'Europa'],
    ['Porto', null, 'Portugal', 'internacional', 'Europa Meridional', 'Europa'],
    ['Roma', null, 'Itália', 'internacional', 'Europa Meridional', 'Europa'],
    ['Milão', null, 'Itália', 'internacional', 'Europa Meridional', 'Europa'],
    ['Veneza', null, 'Itália', 'internacional', 'Europa Meridional', 'Europa'],
    ['Florença', null, 'Itália', 'internacional', 'Europa Meridional', 'Europa'],
    ['Nápoles', null, 'Itália', 'internacional', 'Europa Meridional', 'Europa'],
    ['Amsterdam', null, 'Holanda', 'internacional', 'Europa Ocidental', 'Europa'],
    ['Berlim', null, 'Alemanha', 'internacional', 'Europa Central', 'Europa'],
    ['Munique', null, 'Alemanha', 'internacional', 'Europa Central', 'Europa'],
    ['Hamburgo', null, 'Alemanha', 'internacional', 'Europa Central', 'Europa'],
    ['Viena', null, 'Áustria', 'internacional', 'Europa Central', 'Europa'],
    ['Salzburgo', null, 'Áustria', 'internacional', 'Europa Central', 'Europa'],
    ['Zurique', null, 'Suíça', 'internacional', 'Europa Central', 'Europa'],
    ['Genebra', null, 'Suíça', 'internacional', 'Europa Central', 'Europa'],
    ['Praga', null, 'República Tcheca', 'internacional', 'Europa Central', 'Europa'],
    ['Budapeste', null, 'Hungria', 'internacional', 'Europa Central', 'Europa'],
    ['Varsóvia', null, 'Polônia', 'internacional', 'Europa Central', 'Europa'],
    ['Cracóvia', null, 'Polônia', 'internacional', 'Europa Central', 'Europa'],
    ['Estocolmo', null, 'Suécia', 'internacional', 'Europa Setentrional', 'Europa'],
    ['Oslo', null, 'Noruega', 'internacional', 'Europa Setentrional', 'Europa'],
    ['Copenhague', null, 'Dinamarca', 'internacional', 'Europa Setentrional', 'Europa'],
    ['Helsinque', null, 'Finlândia', 'internacional', 'Europa Setentrional', 'Europa'],
    ['Moscou', null, 'Rússia', 'internacional', 'Europa Oriental', 'Europa'],
    ['São Petersburgo', null, 'Rússia', 'internacional', 'Europa Oriental', 'Europa'],
    ['Atenas', null, 'Grécia', 'internacional', 'Europa Meridional', 'Europa'],
    ['Santorini', null, 'Grécia', 'internacional', 'Europa Meridional', 'Europa'],
    ['Mykonos', null, 'Grécia', 'internacional', 'Europa Meridional', 'Europa'],
    ['Istambul', null, 'Turquia', 'internacional', 'Europa/Ásia', 'Europa'],

    // Ásia - Internacional
    ['Tóquio', null, 'Japão', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Kyoto', null, 'Japão', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Osaka', null, 'Japão', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Hiroshima', null, 'Japão', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Bangkok', null, 'Tailândia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Phuket', null, 'Tailândia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Chiang Mai', null, 'Tailândia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Cingapura', null, 'Singapura', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Kuala Lumpur', null, 'Malásia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Bali', null, 'Indonésia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Jakarta', null, 'Indonésia', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Ho Chi Minh', null, 'Vietnã', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Hanói', null, 'Vietnã', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Manila', null, 'Filipinas', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Boracay', null, 'Filipinas', 'internacional', 'Sudeste Asiático', 'Ásia'],
    ['Hong Kong', null, 'China', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Pequim', null, 'China', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Xangai', null, 'China', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Seul', null, 'Coreia do Sul', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Busan', null, 'Coreia do Sul', 'internacional', 'Ásia Oriental', 'Ásia'],
    ['Nova Delhi', null, 'Índia', 'internacional', 'Ásia Meridional', 'Ásia'],
    ['Mumbai', null, 'Índia', 'internacional', 'Ásia Meridional', 'Ásia'],
    ['Goa', null, 'Índia', 'internacional', 'Ásia Meridional', 'Ásia'],
    ['Jaipur', null, 'Índia', 'internacional', 'Ásia Meridional', 'Ásia'],
    ['Dubai', null, 'Emirados Árabes Unidos', 'internacional', 'Ásia Ocidental', 'Ásia'],
    ['Abu Dhabi', null, 'Emirados Árabes Unidos', 'internacional', 'Ásia Ocidental', 'Ásia'],
    ['Doha', null, 'Catar', 'internacional', 'Ásia Ocidental', 'Ásia'],

    // África - Internacional
    ['Cairo', null, 'Egito', 'internacional', 'África do Norte', 'África'],
    ['Luxor', null, 'Egito', 'internacional', 'África do Norte', 'África'],
    ['Marrakech', null, 'Marrocos', 'internacional', 'África do Norte', 'África'],
    ['Casablanca', null, 'Marrocos', 'internacional', 'África do Norte', 'África'],
    ['Fez', null, 'Marrocos', 'internacional', 'África do Norte', 'África'],
    ['Cidade do Cabo', null, 'África do Sul', 'internacional', 'África Austral', 'África'],
    ['Johannesburg', null, 'África do Sul', 'internacional', 'África Austral', 'África'],
    ['Durban', null, 'África do Sul', 'internacional', 'África Austral', 'África'],
    ['Nairobi', null, 'Quênia', 'internacional', 'África Oriental', 'África'],
    ['Zanzibar', null, 'Tanzânia', 'internacional', 'África Oriental', 'África'],

    // Oceania - Internacional
    ['Sydney', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Melbourne', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Brisbane', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Perth', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Gold Coast', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Adelaide', null, 'Austrália', 'internacional', 'Oceania', 'Oceania'],
    ['Auckland', null, 'Nova Zelândia', 'internacional', 'Oceania', 'Oceania'],
    ['Wellington', null, 'Nova Zelândia', 'internacional', 'Oceania', 'Oceania'],
    ['Queenstown', null, 'Nova Zelândia', 'internacional', 'Oceania', 'Oceania']
  ];

  let inserted = 0;
  let existing = 0;

  for (const dest of destinations) {
    try {
      const destObj = {
        name: dest[0],
        state: dest[1],
        country: dest[2],
        countryType: dest[3],
        region: dest[4],
        continent: dest[5]
      };
      
      await db.insert(destinations).values(destObj).ignore();
      inserted++;
      console.log(`✅ ${dest[0]}, ${dest[2]}`);
    } catch (error) {
      existing++;
      console.log(`⚠️ Já existe: ${dest[0]}`);
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Novos destinos: ${inserted}`);
  console.log(`   ⚠️ Já existiam: ${existing}`);
  console.log(`   📍 Total processado: ${destinations.length}`);

  console.log('✅ Concluído!');
}

addDestinations().catch(console.error);
