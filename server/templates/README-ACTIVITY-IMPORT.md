# Guia de Importação de Atividades - PartiuTrip

Este guia explica como importar novas atividades para a plataforma PartiuTrip de forma padronizada e eficiente.

## Estrutura de Arquivos

```
server/
├── templates/
│   ├── activity-import-template.ts      # Template principal
│   ├── activity-verification-template.ts # Template de verificação
│   └── README-ACTIVITY-IMPORT.md        # Este guia
├── add-[cidade]-activities.ts           # Scripts específicos por cidade
├── verify-[cidade]-activities.ts        # Scripts de verificação
└── check-proposals.ts                   # Verificação geral
```

## Passo a Passo para Importação

### 1. Criar Script de Importação

```bash
# Copie o template
cp server/templates/activity-import-template.ts server/add-[cidade]-activities.ts
```

### 2. Configurar Dados da Atividade

```typescript
const activities = [
  {
    title: "Nome da Atividade",
    description: "Descrição completa e detalhada...",
    location: "Cidade, Estado", // Ex: "Salvador, BA"
    category: "category_name", // Ver categorias abaixo
    duration: 4, // Horas
    difficulty: "easy", // easy, medium, hard
    priceRange: "R$ 100 - R$ 500",
    coverImage: "https://images.unsplash.com/...",
    proposals: [
      {
        title: "Econômico",
        description: "Opção mais básica",
        price: 100,
        inclusions: ["Item 1", "Item 2"]
      },
      {
        title: "Completo",
        description: "Opção intermediária",
        price: 250,
        inclusions: ["Item 1", "Item 2", "Item 3"]
      },
      {
        title: "Premium",
        description: "Opção completa",
        price: 500,
        inclusions: ["Item 1", "Item 2", "Item 3", "Item 4"]
      }
    ]
  }
];
```

### 3. Categorias Disponíveis

- `nature` - Natureza e ecoturismo
- `water_sports` - Esportes aquáticos
- `adventure` - Aventura e adrenalina
- `cultural` - Cultura e história
- `food_tours` - Gastronomia
- `hiking` - Trilhas e caminhadas
- `pontos_turisticos` - Pontos turísticos
- `wildlife` - Vida selvagem

### 4. Executar Importação

```bash
npx tsx server/add-[cidade]-activities.ts
```

### 5. Verificar Importação

```bash
npx tsx server/verify-[cidade]-activities.ts
```

## Pontos Importantes

### ✅ Fazer Sempre

1. **Descrições detalhadas**: Pelo menos 100-200 caracteres
2. **Preços realistas**: Pesquisar preços reais de mercado
3. **3 propostas**: Econômico, Completo, Premium
4. **Inclusões específicas**: Listar o que está incluído
5. **Imagens de qualidade**: Usar Unsplash com alta resolução
6. **Verificação**: Sempre executar script de verificação

### ❌ Evitar

1. **Não usar mock data**: Sempre dados reais
2. **Não duplicar atividades**: Verificar se já existe
3. **Não usar preços absurdos**: Manter realismo
4. **Não esquecer conversões**: `price.toString()` e `JSON.stringify()`
5. **Não pular verificação**: Sempre testar após importação

## Campos Obrigatórios

### Activity
- `title`: Nome da atividade
- `description`: Descrição completa
- `location`: "Cidade, Estado"
- `category`: Uma das categorias válidas
- `duration`: Número (horas)
- `difficulty`: "easy", "medium", "hard"
- `priceRange`: "R$ min - R$ max"
- `coverImage`: URL da imagem

### Budget Proposals
- `title`: "Econômico", "Completo", "Premium"
- `description`: Descrição da proposta
- `amount`: String com valor (ex: "150.00")
- `inclusions`: JSON array de strings
- `exclusions`: JSON array (pode ser vazio)

## Exemplo Completo

```typescript
// server/add-salvador-activities.ts
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';

const salvadorActivities = [
  {
    title: "Elevador Lacerda",
    description: "Icônico elevador Art Déco conecta Cidade Alta e Baixa, oferecendo vista panorâmica da Baía de Todos os Santos. Patrimônio histórico de Salvador com 72 metros de altura.",
    location: "Salvador, BA",
    category: "pontos_turisticos",
    duration: 1,
    difficulty: "easy",
    priceRange: "R$ 5 - R$ 50",
    coverImage: "https://images.unsplash.com/photo-1234567890",
    proposals: [
      {
        title: "Econômico",
        description: "Subida simples no elevador",
        price: 5,
        inclusions: ["Subida no elevador", "Vista panorâmica"]
      },
      {
        title: "Completo",
        description: "Subida com guia turístico",
        price: 25,
        inclusions: ["Subida no elevador", "Guia turístico", "História local"]
      },
      {
        title: "Premium",
        description: "Tour privado com fotógrafo",
        price: 50,
        inclusions: ["Subida no elevador", "Guia privado", "Sessão fotográfica", "Material informativo"]
      }
    ]
  }
];

async function addSalvadorActivities() {
  console.log('🌴 Iniciando importação de Salvador...');
  
  try {
    for (const activityData of salvadorActivities) {
      console.log(`📍 Adicionando: ${activityData.title}`);
      
      const [activity] = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        category: activityData.category,
        duration: activityData.duration,
        difficulty: activityData.difficulty,
        priceRange: activityData.priceRange,
        coverImage: activityData.coverImage,
        rating: "4.5",
        reviewCount: 0,
        isActive: true,
        createdById: 1
      });
      
      for (const proposal of activityData.proposals) {
        await db.insert(activityBudgetProposals).values({
          activityId: activity.insertId,
          createdBy: 1,
          title: proposal.title,
          description: proposal.description,
          amount: proposal.price.toString(),
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify([]),
          votes: Math.floor(Math.random() * 60) + 20,
          isActive: true
        });
      }
      
      console.log(`✅ ${activityData.title} configurada!`);
    }
    
    console.log('🎉 Importação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addSalvadorActivities();
```

## Checklist Final

- [ ] Dados reais e pesquisados
- [ ] 3 propostas de orçamento
- [ ] Descrições detalhadas
- [ ] Categoria correta
- [ ] Preços realistas
- [ ] Imagem de qualidade
- [ ] Script executado sem erros
- [ ] Verificação realizada
- [ ] Atividades visíveis na aplicação

## Suporte

Para dúvidas ou problemas, verificar:
1. Logs de erro no terminal
2. Conexão com banco MySQL
3. Formato dos dados JSON
4. Campos obrigatórios preenchidos

Este sistema garante consistência e qualidade na importação de atividades para a plataforma PartiuTrip.