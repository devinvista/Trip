import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function addSampleActivities() {
  console.log('🌱 Criando propostas de orçamento para todas as atividades...');

  try {
    // 1. Verificar se a tabela activity_budget_proposals existe e criar se necessário
    console.log('🔧 Verificando/criando estrutura de propostas...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Estrutura da tabela verificada');

    // 2. Limpar propostas existentes e criar novas
    await db.execute(sql`DELETE FROM activity_budget_proposals`);
    console.log('🧹 Propostas existentes removidas');

    // 3. Obter atividades ativas
    const activities = await db.execute(sql`
      SELECT id, title, location FROM activities 
      WHERE is_active = TRUE AND title IS NOT NULL 
      ORDER BY id
    `);
    
    console.log(`📊 Encontradas ${activities.length} atividades para criar propostas`);

    // 4. Criar propostas específicas para atividades conhecidas
    const proposalsByActivity = {
      'Cristo Redentor / Corcovado': [
        {
          title: 'Van Oficial',
          description: 'Transporte em van oficial até o Cristo Redentor com entrada incluída',
          amount: 85.00,
          inclusions: ['Transporte em van oficial', 'Entrada para o monumento', 'Seguro de viagem'],
          exclusions: ['Alimentação', 'Bebidas', 'Compras pessoais']
        },
        {
          title: 'Trem do Corcovado',
          description: 'Experiência completa com trem histórico e guia especializado',
          amount: 160.00,
          inclusions: ['Trem do Corcovado ida e volta', 'Entrada para o monumento', 'Guia turístico', 'Material informativo'],
          exclusions: ['Bebidas alcoólicas', 'Compras pessoais']
        },
        {
          title: 'Tour Premium VIP',
          description: 'Tour privativo com transporte executivo e fotografia profissional',
          amount: 320.00,
          inclusions: ['Transporte privativo executivo', 'Guia exclusivo bilíngue', 'Entrada VIP', 'Sessão de fotos profissional'],
          exclusions: ['Compras pessoais']
        }
      ],
      'Pão de Açúcar (Bondinho)': [
        {
          title: 'Ingresso Padrão',
          description: 'Bondinho ida e volta com acesso aos dois morros',
          amount: 120.00,
          inclusions: ['Bondinho ida e volta', 'Acesso aos mirantes', 'Mapa turístico'],
          exclusions: ['Alimentação', 'Bebidas', 'Fotos profissionais']
        },
        {
          title: 'Experiência Guiada',
          description: 'Bondinho com guia especializado e material educativo',
          amount: 190.00,
          inclusions: ['Bondinho ida e volta', 'Guia turístico especializado', 'Material informativo', 'Binóculo'],
          exclusions: ['Bebidas alcoólicas', 'Fotos profissionais']
        },
        {
          title: 'Experiência Completa',
          description: 'Bondinho + voo panorâmico de helicóptero + jantar',
          amount: 650.00,
          inclusions: ['Bondinho ida e volta', 'Voo de helicóptero 15 min', 'Jantar com vista panorâmica', 'Fotos aéreas'],
          exclusions: ['Compras pessoais', 'Bebidas premium']
        }
      ],
      'Praia de Copacabana / Ipanema + Esportes': [
        {
          title: 'Aula de Surf Básica',
          description: 'Aula de surf com instrutor certificado na praia',
          amount: 100.00,
          inclusions: ['Aula de surf 2h', 'Prancha', 'Lycra', 'Instrutor certificado'],
          exclusions: ['Transporte', 'Alimentação', 'Bebidas']
        },
        {
          title: 'Dia Completo de Esportes',
          description: 'Surf + vôlei de praia + bike tour pela orla',
          amount: 180.00,
          inclusions: ['Aula de surf', 'Vôlei de praia', 'Bike tour 2h', 'Todos os equipamentos', 'Instrutor'],
          exclusions: ['Refeições', 'Bebidas alcoólicas']
        },
        {
          title: 'Experiência Premium',
          description: 'Aulas privadas + almoço frente ao mar + massagem relaxante',
          amount: 350.00,
          inclusions: ['Aulas privadas personalizadas', 'Almoço frente ao mar', 'Massagem relaxante 30min', 'Bebidas incluídas'],
          exclusions: ['Compras pessoais', 'Gorjetas']
        }
      ],
      'MASP + Avenida Paulista': [
        {
          title: 'Entrada Livre',
          description: 'Visita livre ao MASP com mapa autoguiado',
          amount: 40.00,
          inclusions: ['Entrada do MASP', 'Mapa autoguiado', 'Guarda-volumes'],
          exclusions: ['Guia turístico', 'Audioguia', 'Transporte']
        },
        {
          title: 'Tour Cultural Guiado',
          description: 'MASP + Paulista com guia especializado em arte',
          amount: 75.00,
          inclusions: ['Entrada do MASP', 'Guia especializado em arte', 'Tour pela Avenida Paulista', 'Material educativo'],
          exclusions: ['Transporte', 'Alimentação']
        },
        {
          title: 'Experiência Cultural Completa',
          description: 'MASP + Paulista + Pinacoteca com almoço cultural',
          amount: 120.00,
          inclusions: ['MASP', 'Avenida Paulista', 'Pinacoteca do Estado', 'Guia especializado', 'Almoço cultural', 'Transporte'],
          exclusions: ['Compras pessoais', 'Bebidas extras']
        }
      ],
      'Pelourinho + Elevador Lacerda': [
        {
          title: 'Caminhada Histórica',
          description: 'Tour a pé pelo centro histórico de Salvador',
          amount: 60.00,
          inclusions: ['Tour guiado 3h', 'Elevador Lacerda', 'Entrada igrejas principais', 'Material informativo'],
          exclusions: ['Alimentação', 'Bebidas', 'Compras']
        },
        {
          title: 'Experiência Cultural',
          description: 'Tour histórico + show de capoeira + degustação típica',
          amount: 120.00,
          inclusions: ['Tour guiado completo', 'Show de capoeira', 'Degustação de comidas típicas', 'Aula básica de capoeira'],
          exclusions: ['Bebidas alcoólicas', 'Compras pessoais']
        },
        {
          title: 'Vivência Completa',
          description: 'Tour + oficinas + almoço típico + apresentação folclórica',
          amount: 200.00,
          inclusions: ['Tour histórico completo', 'Oficina de artesanato', 'Almoço baiano completo', 'Apresentação folclórica', 'Aula de samba de roda'],
          exclusions: ['Compras pessoais', 'Gorjetas']
        }
      ],
      'Cataratas do Iguaçu (lado brasileiro)': [
        {
          title: 'Entrada Básica do Parque',
          description: 'Acesso ao parque com trilha panorâmica principal',
          amount: 85.00,
          inclusions: ['Entrada do Parque Nacional', 'Trilha panorâmica', 'Ônibus interno', 'Mapa do parque'],
          exclusions: ['Transporte até o parque', 'Alimentação', 'Atividades extras']
        },
        {
          title: 'Tour Completo Guiado',
          description: 'Parque + transporte + guia especializado + equipamentos',
          amount: 150.00,
          inclusions: ['Entrada do parque', 'Transporte ida/volta', 'Guia especializado', 'Capa de chuva', 'Binóculo'],
          exclusions: ['Refeições', 'Bebidas', 'Souvenirs']
        },
        {
          title: 'Experiência Premium Aérea',
          description: 'Tour completo + voo panorâmico de helicóptero + almoço',
          amount: 450.00,
          inclusions: ['Tour completo terrestre', 'Voo de helicóptero 10min', 'Almoço com vista', 'Fotos aéreas profissionais', 'Transfer executivo'],
          exclusions: ['Compras pessoais', 'Bebidas premium']
        }
      ]
    };

    // 5. Criar propostas para cada atividade
    for (const activity of activities) {
      console.log(`💡 Criando propostas para: ${activity.title}`);
      
      let proposals = proposalsByActivity[activity.title];
      
      // Se não tem propostas específicas, criar propostas genéricas
      if (!proposals) {
        const basePrice = Math.floor(Math.random() * 80) + 50; // Entre 50-130
        proposals = [
          {
            title: 'Opção Básica',
            description: 'Experiência padrão da atividade com o essencial',
            amount: basePrice,
            inclusions: ['Atividade principal', 'Equipamentos básicos', 'Seguro básico'],
            exclusions: ['Alimentação', 'Bebidas', 'Transporte']
          },
          {
            title: 'Opção Completa',
            description: 'Experiência com guia especializado e comodidades extras',
            amount: Math.floor(basePrice * 1.8),
            inclusions: ['Atividade principal', 'Guia especializado', 'Equipamentos completos', 'Lanche', 'Material informativo'],
            exclusions: ['Bebidas alcoólicas', 'Compras pessoais']
          },
          {
            title: 'Opção Premium',
            description: 'Experiência exclusiva e totalmente personalizada',
            amount: Math.floor(basePrice * 3.2),
            inclusions: ['Experiência privativa', 'Guia exclusivo', 'Transporte incluído', 'Refeição completa', 'Fotografia profissional'],
            exclusions: ['Compras pessoais', 'Gorjetas']
          }
        ];
      }
      
      // Inserir propostas na base de dados
      for (const proposal of proposals) {
        await db.execute(sql`
          INSERT INTO activity_budget_proposals 
          (activity_id, title, description, amount, currency, inclusions, exclusions, price_type, is_active) 
          VALUES 
          (${activity.id}, ${proposal.title}, ${proposal.description}, ${proposal.amount}, 'BRL', 
           ${JSON.stringify(proposal.inclusions)}, ${JSON.stringify(proposal.exclusions)}, 'per_person', true)
        `);
      }
    }

    // 6. Verificar resultados
    const totalProposals = await db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`);
    console.log(`✅ ${totalProposals[0].count} propostas de orçamento criadas com sucesso!`);

    // 7. Mostrar algumas propostas criadas
    const sampleProposals = await db.execute(sql`
      SELECT abp.title, abp.amount, a.title as activity_title 
      FROM activity_budget_proposals abp 
      JOIN activities a ON abp.activity_id = a.id 
      LIMIT 5
    `);
    
    console.log('\n📋 Exemplos de propostas criadas:');
    sampleProposals.forEach(p => {
      console.log(`   ${p.activity_title}: ${p.title} - R$ ${p.amount}`);
    });

    console.log('\n🎉 Sistema de propostas de orçamento completamente implementado!');

  } catch (error) {
    console.error('❌ Erro ao criar propostas:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleActivities()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}